# 构建 Rust 示例程序

执行事件 SDK 由两个包组成,称为 `monad-event-ring` 和 `monad-exec-events`。这些在 [Rust API 指南](/execution-events/rust-api)中有更详细的描述,但现在知道它们的名称就足够了。

将来,Category Labs 可能会将这些包发布到 [crates.io](https://crates.io),但这不是 SDK 目前的分发方式。

相反,用户的 `Cargo.toml` 文件声明这些依赖项的上游源是 SDK 源代码所在的 git 存储库的特定发布标签。从 git 而不是 crates.io 获取的依赖项在 Cargo Book 的[此部分](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html#specifying-dependencies-from-git-repositories)中进行了说明。

## Rust SDK 源代码在哪里?

执行事件 Rust SDK 位于 [`monad-bft`](https://github.com/category-labs/monad-bft) git 存储库中,与共识守护进程和 JSON-RPC 服务器位于同一存储库中。尽管是"执行事件 SDK",但它*不*与 C SDK 一起位于执行存储库中,原因有几个:

- 执行存储库中的所有代码都是用 C 和 C++ 编写的,而 `monad-bft` 中的所有内容都是用 Rust 编写的
- 执行(C++)存储库是 BFT(Rust)存储库的依赖项。Rust 项目使用一些 C 和 C++ 功能(通过 `extern "C"` FFI API),但反之则不然:C 从不调用具有 C 链接的 Rust 函数。因此,所有跨语言互操作机制都在 Rust 存储库中,并且在此存储库中定义 Rust SDK 可以保持这种方式

但是,C 生态系统仍然会影响 Rust:执行事件 C SDK 中的一些函数通过 FFI 接口被 Rust 重用。这影响 Rust 构建的主要方式是,您必须确保在从 Cargo 运行 CMake 和 bindgen 时选择了足够新的 C 编译器。

C SDK 使用 C23 的一些最新语言功能,需要 gcc-13 或 clang-19。如果您运行 `cc -v` 并报告较旧的编译器,则需要设置 `CC` 环境变量以告诉 CMake 选择较新的编译器。

## 构建示例程序

### 步骤 1:安装必备开发包

您可能已经安装了其中一些,但请确保至少具有所需的最低版本(较新版本可能有效,但未经明确测试)。

除了 Rust 工具链之外,您还需要:

| 要求 | Ubuntu 包名称 | 最低版本 | 用途
| C 编译器 | gcc-13 或 clang-19 | 参见包名称 | 核心事件库(`libmonad_event.a`)用 C 编写,被 Rust 库使用
| C++ 编译器 | g++-13 或 clang-19 | 参见包名称 | Rust 不使用可选的 C++ 组件,但如果找不到 C++ 编译器,CMake 配置步骤将报告错误
| CMake | cmake | CMake 3.23 | `libmonad_event.a` 使用 CMake 构建,通过 `build.rs` 与 cargo 集成
| zstd 库 | libzstd-dev | 任意 | 快照事件环文件使用 zstd 压缩;需要此库来解压缩它们
| libhugetlbfs | libhugetlbfs-dev | 任意 | `libhugetlbfs` 用于定位保存事件环共享内存文件的默认 hugetlbfs 挂载点
| libclang | clang-19 | clang-19 | Rust 的 bindgen 需要最新版本的 libclang 库

我们还需要 git 和 curl。

**macOS 兼容性**

尽管实时数据需要 Linux 主机(因为执行守护进程本身需要),但您可以使用 macOS 在历史快照数据上编译和运行示例。

在这种情况下,您不需要 `libhugetlbfs`(这是一个仅限 Linux 的库),但您需要 `libzstd`、CMake 和至少 clang-19。前两者不包含在默认开发工具中,并且任何最近发布的 macOS 版本中的默认系统编译器都太旧了,因此您可能想使用 [Homebrew](https://brew.sh/) 或 [MacPorts](https://www.macports.org/) 将这些工具安装到系统上。

要在 Ubuntu 24.04 或更高版本上一次性安装所有这些,您可以运行此命令(可以使用更新的版本,例如 `clang-20`):

```shell
$ sudo apt install git curl gcc g++ cmake clang-19 libzstd-dev libhugetlbfs-dev
```

**`libclang` 和 clang 版本**

即使您使用 gcc 编译 `libmonad_event.a`,Rust [bindgen](https://rust-lang.github.io/rust-bindgen/) 实用程序仍然使用 [libclang](https://clang.llvm.org/docs/Tooling.html#libclang) 工具以编程方式生成 C 代码的 Rust 绑定。从技术上讲,您不需要完整的 clang 编译器,只需要 libclang 包,但一些用户报告说如果不安装它会遇到问题。

您需要版本 19(或更高版本)的原因是 clang-19 是第一个支持 C23 语言标准中足够多的功能以能够编译 SDK 的版本。如果您看到表明 bindgen 无法理解 `constexpr` 关键字的错误,那么 bindgen 自动选择的 libclang 版本太旧了。

如果系统上有多个 libclang 版本(Ubuntu 24.04 上的默认 clang 是版本 18),如果根本问题是 bindgen 默认选择了错误的版本,那么安装较新版本可能无济于事。这是 macOS 上的常见问题,cargo 想要选择标准 macOS 开发者 SDK 中更旧的 libclang。在编译步骤中,我们将详细解释如何处理这个问题。

### 步骤 2:创建新包并将示例代码复制到其中

首先,创建新包:

```shell
$ cargo new --bin event-sdk-example-rust
$ cd event-sdk-example-rust
```

接下来,我们将用从 github 下载的示例程序代码覆盖默认的"Hello world" `main.rs` 源文件:

```text
$ curl https://raw.githubusercontent.com/category-labs/monad-bft/refs/tags/release/exec-events-sdk-v1.0/monad-exec-events/examples/eventwatch.rs > src/main.rs
```

### 步骤 3:与 SDK 包集成

创建以下 `Cargo.toml` 文件:

```cargo
[package]
name = "event-sdk-example-rust"
version = "0.1.0"
edition = "2021"

[dependencies]
chrono = "0.4.34"
clap = { version = "4.2", features = ["derive"] }
lazy_static = "1.5.0"
zstd-sys = "2.0.16"

[dependencies.monad-exec-events]
git = "https://github.com/category-labs/monad-bft"
tag = "release/exec-events-sdk-v1.0"

[dependencies.monad-event-ring]
git = "https://github.com/category-labs/monad-bft"
tag = "release/exec-events-sdk-v1.0"
```

### 步骤 4:构建项目

```shell
cargo build
```

第一次构建会很慢,因为它会获取 monad-bft 存储库和所有可传递的 git 子模块。几乎所有这些都不是 SDK 所需的,但 cargo 默认会检出它们。

您可能需要向 CMake 传递更新的编译器,可以使用 bash 的简洁语法在要运行的命令范围内设置环境变量,例如:

```shell
CC=clang-19 cargo build
```

**如果遇到错误...**

构建时最常见的错误来源是当 bindgen 选择过时的 libclang 版本时,如前所述。这通常表现为:

- 明确提到 `libclang` 的错误,或者
- 包含文本"无法生成绑定"的消息

设置环境变量 `CC=clang-19` 只会影响 CMake 用于构建 C SDK 库 `libmonad_event.a` 的编译器。也就是说,它不会影响 bindgen 用于生成绑定的 libclang 版本。

有许多环境变量控制 libclang 的定位和配置方式,它们记录在[此页面](https://crates.io/crates/clang-sys)的"环境变量"部分中。

我们发现有效的一些建议:

- 将 `LLVM_CONFIG_PATH` 设置为指向 `llvm-config` 二进制文件的完整路径是最佳选项;此命令包含有关 LLVM 在系统上如何构建和安装的大量详细信息,以便 LLVM 的用户(如 bindgen)更容易找到所需的配置
- 在某些不寻常的情况下,您可能选择了正确的 libclang,但它可能配置得很奇怪,以至于它无法再找到基本的 libc 头文件(典型的原因是声称缺少 `stddef.h`、`assert.h` 或 `string.h`);您可以找出系统上这些文件的位置,并使用 `BINDGEN_EXTRA_CLANG_ARGS` 环境变量通过 bindgen 将它们作为系统包含目录(`-isystem` clang 选项)传递给 libclang;在 macOS 上,这看起来像:

```text
BINDGEN_EXTRA_CLANG_ARGS="-isystem $(xcrun --show-sdk-path)/usr/include"
```

或在 Ubuntu 24.04 LTS 上:

```text
BINDGEN_EXTRA_CLANG_ARGS="-isystem /usr/include"
```

解决任何问题后,编译应该生成一个可执行文件。尝试使用 `-h` 标志运行它以打印帮助:

```shell
cargo run -- -h
```

如果一切成功,继续进行[指南的下一步](/execution-events/getting-started/snapshot)。
