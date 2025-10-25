# 在实时数据上运行示例程序以及后续步骤


如果您按顺序遵循本指南，您应该已经构建了其中一个示例程序（[C](/execution-events/getting-started/c) 或 [Rust](/execution-events/getting-started/rust)），使用[快照文件](/execution-events/getting-started/snapshot)运行了它，并安装了您自己的本地 [Monad 节点](/execution-events/getting-started/setup-node)。

现在我们将再次运行示例程序，但这次它将打印由我们的本地 Monad 节点发布的实时事件。

## 使用实时数据运行

### 步骤 1：准备 Monad 节点

在运行之前，请确保执行守护程序正在运行，并且***执行事件已启用***（链接即将推出）；特别是，确保您已将命令行参数 `--exec-event-ring` 传递给执行守护程序

### 步骤 2：运行示例程序

在快照示例中，我们将快照文件的名称作为命令行参数传递给程序。在 C 和 Rust 示例程序中，如果我们根本不传递任何文件名，它将使用执行守护程序使用的默认文件名，将我们连接到实时事件流。

- 对于 C，不带参数运行 `eventwatch`
- 对于 Rust，运行命令 `cargo run -- -d`

您将看到与快照情况类似的数据，但这些数据是由执行发布的。如果您停止执行守护程序，示例程序将检测到数据源已消失，然后退出。

## 后续步骤

快速入门指南到此完成！如果您有兴趣使用 SDK 开发自己的实时数据处理软件，接下来应该去哪里？

这里是推荐的资源列表，大致按照对开发实际应用程序最有帮助的顺序排列：

1. 如果您还没有，请阅读[概述](/execution-events/overview)和您刚刚运行的示例程序的源代码
2. 一旦您理解了示例中的基本思想，[SDK 文档的其余部分](/execution-events/#execution-events-documentation)应该很容易理解
3. 在使用 SDK 之前，请确保您理解[共识事件](/execution-events/consensus-events)及其含义
4. 尝试一个更复杂的程序并查看它的源代码

- 对于 Rust，请尝试上游 [`monad-bft`](https://github.com/category-labs/monad-bft) 存储库中的"区块浏览器"TUI 示例。您可以使用 `cargo run -p monad-exec-events --example explorer` 运行它，然后浏览 `explorer.rs` 中的源代码
- 对于 C，请查看上游 [`monad`](https://github.com/category-labs/monad/tree/release/exec-events-sdk-v1.0/cmd/eventcap) 存储库中 `eventcap` 程序的代码；该程序是执行事件系统的"tcpdump"，展示了 API 的几种不同用途。您可能还想阅读下一节关于编译 eventcap 程序的内容

## 可选：构建 `eventcap` 程序

`eventcap` 是用于处理事件系统的有用实用工具。与 Rust `eventwatch` 示例一样，`eventcap` 可以将执行事件载荷解码为人类可读的形式。它还执行开发者工作流程中有用的其他几项任务，例如，记录事件捕获和为测试用例创建快照事件环文件。

警告
`eventcap` 需要 gcc 15.2 或更高版本，不能使用 gcc 15.1 构建。在本指南编写时，唯一在其软件包存储库中附带 gcc 15.2 的 Ubuntu 版本是最近发布的 Ubuntu 25.10。

如果您的 Linux 发行版不提供 gcc 15.2 并且您不想手动安装它，您可以改用 clang-19（或更新版本），但*使用 libc++ 而不是 libstdc++*。Linux 上的默认设置是 clang 使用 gcc C++ 标准库（libstdc++）。

如果您指定 `-stdlib=libc++`，它将改用 LLVM 标准库，该库具有所需的 `<format>` 支持。您可能需要安装它，因为在某些发行版中它不是 clang 软件包的一部分。在 Ubuntu 中，当您安装 `libc++-19-dev` 时，将添加 clang-19 libc++ 运行时和开发包。

使用 libc++-19 时，您还必须指定 `-fexperimental-library` 编译器标志以在 `<chrono>` 中启用 C++20 时区支持；eventcap 使用它以本地时间打印事件时间戳。在将来的某个 libc++ 版本中，这将不再需要。

要构建 `eventcap`，您还需要 [CLI11](https://github.com/CLIUtils/CLI11) C++ 命令行解析器库和 OpenSSL 开发文件。虽然是可选的，但您也应该安装 [GNU 多精度库](https://gmplib.org/) 的开发文件，以便 `uint256` 值以十进制形式打印。

说明还使用 [ninja](https://ninja-build.org/) 构建工具。您可以在 Ubuntu 上安装所有内容：

```text
$ sudo apt install libcli11-dev libssl-dev libgmp-dev ninja-build
```

现在克隆[执行存储库](https://github.com/category-labs/monad.git)并检出分支 `release/exec-events-sdk-v1.0`，然后构建根于 `cmd/eventcap` 的 CMake 项目。

使用 clang-19 和 libc++ 以及上述选项：

```shell
$ git clone -b release/exec-events-sdk-v1.0 https://github.com/category-labs/monad.git \
  ~/src/monad-eventcap
$ CC=clang-19 CFLAGS="-march=x86-64-v4" \
  CXX=clang++-19 CXXFLAGS="-stdlib=libc++ -fexperimental-library -march=x86-64-v4" cmake \
  -S ~/src/monad-eventcap/cmd/eventcap -B ~/build/monad-eventcap-release -G Ninja \
  -DCMAKE_BUILD_TYPE=RelWithDebInfo
$ cmake --build ~/build/monad-eventcap-release
```

您现在应该能够运行：

```shell
$ ~/build/monad-eventcap-release/eventcap --help
```

注意
需要 `-march=x86-64-v4` 来在 CPU 指令级别启用某些原子操作，以避免需要链接 libatomic.a；没有它，会发出性能警告，由于 `-Werror` 会变成编译错误

为了简化使用所有这些设置运行 cmake，您可能希望创建一个 CMake 工具链文件，而不是使用环境变量。为此，创建一个名为 `clang19-libcxx.cmake` 的文件，其中包含以下内容：

```cmake
set(CMAKE_C_COMPILER clang-19)
set(CMAKE_CXX_COMPILER clang++-19)
set(CMAKE_ASM_FLAGS_INIT -march=x86-64-v4)
set(CMAKE_C_FLAGS_INIT -march=x86-64-v4)
set(CMAKE_CXX_FLAGS_INIT "-march=x86-64-v4 -stdlib=libc++ -fexperimental-library")
```

现在您可以运行这个稍微更简洁的命令：

```shell
$ cmake --toolchain <path-to-toolchain-file> -S ~/src/monad-eventcap/cmd/eventcap \
  -B ~/build/monad-eventcap-release -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo
```
