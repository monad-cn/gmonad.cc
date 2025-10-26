# 构建 C 示例程序

C 和 C++ 语言没有标准的包管理器,因此使用第三方库需要程序员自己制定依赖管理方案。

在执行指南的第一步之前,我们将讨论用户将 SDK 库依赖项集成到其项目中的选项。然后我们将选择其中一个选项,并使用该方法构建示例程序。最后将简要展示第二种方法。

**信息**

如果您不熟悉 CMake,您可能想先阅读 CMake 的["使用依赖项指南"](https://cmake.org/cmake/help/latest/guide/using-dependencies/index.html)

### SDK 源代码在哪里?

执行事件 C SDK 与执行守护进程([这里](https://github.com/category-labs/monad))位于同一源代码存储库中,在子目录 [`category/event`](https://github.com/category-labs/monad/tree/main/category/event) 中。它有一个单独的 `CMakeLists.txt` 文件,可以充当顶级项目文件,因此用户不需要构建完整的执行项目就可以编译它。

SDK 的构建系统生成一个名为 `libmonad_event.a` 的库,如果您更喜欢共享库,则为 `libmonad_event.so`。您还需要公共头文件。

### 我的代码如何使用 `libmonad_event.a`?

以下是三种不同的选项:

1. **预编译库** - 您可以自己构建库并将库文件(及其头文件)存储在某处,然后手动将其导入到您的构建系统中。如果您也使用 CMake,SDK 构建系统还会创建一个 CMake"配置"文件,用于与 [`find_package`](https://cmake.org/cmake/help/latest/command/find_package.html) 一起使用以帮助导入它

其他两个选项假设您的项目也使用 CMake:

2. **CMake 子项目集成** - 您的 CMake 项目可以将 SDK 包含为子项目。在这种情况下,您将执行存储库的源代码作为自己项目的一部分下载,并调用 CMake 函数:

```text
add_subdirectory(<path-to-monad-repo>/category/event)
```

这将把 SDK 的库目标(称为 `monad_event`)添加到您的父 CMake 项目中。将 SDK 代码添加到构建中的一种方法是使用 [git 子模块](https://git-scm.com/book/en/v2/Git-Tools-Submodules)。另一种方法是使用 CMake 的 [`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html) 模块。这些方法之间的三个主要区别是:

   1. 默认情况下,`FetchContent` 将在构建配置时将 git 存储库克隆到您的 CMake 构建树中,而 git 子模块在存储库级别集成到您的源树中
   2. 使用 `FetchContent`,您检出的版本由您在 `CMakeLists.txt` 文件中指定的 `GIT_TAG` 指定;对于 `git submodule`,它通过 git 命令管理
   3. 如果您正在获取的内容有自己的 CMake 构建系统(如 C SDK),`FetchContent` 将自动调用 `add_subdirectory` 将其添加到当前项目;在 git 子模块方法中,您需要手动执行此操作

3. **CMake `ExternalProject` 集成** - CMake 的 [`ExternalProject`](https://cmake.org/cmake/help/latest/module/ExternalProject.html) 模块类似于 `FetchContent`,但更加孤立;这将构建并将 SDK 安装到 CMake 构建树中某处的"暂存"目录中。这使用完全独立的 CMake 调用,因此不会将 SDK 的 CMake 项目添加到您自己的项目中。这意味着,例如,您不会自动在自己的 CMake 项目中拥有 `monad_event` 库目标——您需要将其创建为导入目标。`ExternalProject` 有助于将构建系统与 SDK 的构建系统隔离,确保 SDK 的 CMake 配置和变量不会"泄漏"到父项目中

在本指南中,我们将使用 `FetchContent` 方法。这将整个过程封装为一个简单的一体化 `CMakeLists.txt` 文件,我们对该文件进行注释以解释您需要知道的一切。

对于我们的小型"入门"示例程序来说,这显然是最佳选择,但对于您的实际项目可能不是最佳选择。在本指南的最后,将简要展示使用 `find_package` 的替代方法。

## 使用 `FetchContent` 构建示例程序

### 步骤 1:安装必备开发包

除了 CMake(至少 3.23 版本)和 git 之外,我们还需要最新的 C 编译器和两个第三方库。我们还将使用 [curl](https://curl.se/docs/manpage.html) 下载一些文件。

#### 所需的 C 编译器

C SDK 使用 C23 的一些最新功能,需要 gcc-13 或 clang-19。如果 CMake 找到的默认编译器太旧,您需要通过设置 `CC` 环境变量或使用 CMake [工具链文件](https://cmake.org/cmake/help/latest/variable/CMAKE_TOOLCHAIN_FILE.html)来指定替代 C 编译器。

CMake 选择的默认编译器通常是命令 `cc -v` 输出报告的编译器。如果您需要使用不同的编译器,可以使用 bash 语法 `VAR=VALUE <command>` 在以下命令的范围内设置环境变量,例如:

```shell
$ CC=gcc-15 cmake <args>
```

#### 所需的 C++ 编译器

此示例中不使用 C++,但 CMake 项目中有一些可选的 C++ 组件。因此,您必须安装 C++ 编译器,否则 CMake 配置步骤将失败。

**SDK 中的 C++**

SDK 是用纯 C 编写的,除了一些 C++ 头文件可以使用 `<format>` 库"漂亮打印"事件类型。这些不是示例程序的一部分,它们需要完整的 C++23 支持来格式化范围(`__cpp_lib_format_ranges` 功能测试宏),该功能在 gcc 版本 15.2 中添加到 libstdc++。这是最近才发布的:gcc 15.2 首次出现在 Ubuntu 包存储库中是在 Ubuntu 25.10 中。

您还可以将 clang 与 libc++ 一起使用,这是 C++ 标准库的 LLVM 实现,从版本 19 开始就支持范围格式化。在"入门"指南的可选最后一步中,当我们构建 `eventcap` 实用程序时,展示了使用 clang-19 构建 C++ 程序的示例。

#### 所需的第三方库

| 要求 | Ubuntu 包名称 | 用途
| zstd 库 | libzstd-dev | 快照事件环文件使用 zstd 压缩;需要 `libzstd` 来解压缩它们
| libhugetlbfs | libhugetlbfs-dev | `libhugetlbfs` 用于定位最佳 hugetlbfs 挂载点以创建事件环共享内存文件

`libzstd` 是硬性要求;`libhugetlbfs` 是可选的,但在 Linux 上默认需要。可以通过将 CMake 选项 `MONAD_EVENT_USE_LIBHUGETLBFS` 设置为 `OFF` 来手动关闭它。

**macOS 兼容性**

尽管实时数据需要 Linux 主机(因为执行守护进程本身需要),但您可以使用 macOS 在历史快照数据上编译和运行示例。

在这种情况下,您不需要 `libhugetlbfs`(这是一个仅限 Linux 的库),但您需要 `libzstd`、CMake 和至少 clang-19。前两者不包含在默认开发工具中,并且任何最近发布的 macOS 版本中的默认系统编译器都太旧了,因此您可能想使用 [Homebrew](https://brew.sh/) 或 [MacPorts](https://www.macports.org/) 将这些工具安装到系统上。

### 步骤 2:下载示例程序

首先,创建一个新目录并将示例程序源文件下载到其中。我们将使用示例目录 `~/src/event-sdk-example-c`

```shell
$ mkdir -p ~/src/event-sdk-example-c
$ cd ~/src/event-sdk-example-c
$ curl -O https://raw.githubusercontent.com/category-labs/monad/refs/tags/release/exec-events-sdk-v1.0/category/event/example/eventwatch.c
```

现在您的新目录中应该有一个名为 `eventwatch.c` 的文件。

### 步骤 3:添加 `CMakeLists.txt` 构建文件

在 `eventwatch.c` 旁边的目录中创建一个 `CMakeLists.txt` 文件,并将这些内容复制到其中:

```cmakelists
cmake_minimum_required(VERSION 3.23)

project(eventwatch LANGUAGES C)

#
# SDK setup
#

include(FetchContent)

FetchContent_Declare(exec_events_c_sdk
    # The execution events C SDK is kept in the same git repository as the
    # execution daemon itself
    GIT_REPOSITORY https://github.com/category-labs/monad.git

    # The latest version of the SDK is available on a special release branch
    # of the execution repository
    GIT_TAG release/exec-events-sdk-v1.0

    # This will only download the SDK branch
    GIT_SHALLOW TRUE

    # This will disable the checkout of all git submodules; they are needed
    # for the full execution daemon to build, but not the SDK
    GIT_SUBMODULES ""

    # The top-level CMakeLists.txt builds the entire execution daemon; we don't
    # want that, so we specify SOURCE_SUBDIR to choose a CMakeLists.txt file
    # in a sudirectory to treat as the "top-level" file for the external
    # project; this only creates the monad_event library
    SOURCE_SUBDIR category/event)

# The SDK's build system also builds the same example we're building now, using
# the same target name ('eventwatch'). This is done as a CI check to ensure
# that the upstream project doesn't break the example program. We have to
# disable it, because it will conflict with the eventwatch target we're going
# to add below (CMake does not allow two targets with the same name)
set(MONAD_EVENT_BUILD_EXAMPLE OFF CACHE INTERNAL "")

# This will download the source code and call add_subdirectory, which will add
# the `monad_event` library target; this is the SDK target we need to link
FetchContent_MakeAvailable(exec_events_c_sdk)

#
# eventwatch example program target
#

add_executable(eventwatch eventwatch.c)
target_compile_options(eventwatch PRIVATE -Wall -Wextra -Wconversion -Werror)
target_link_libraries(eventwatch PRIVATE monad_event)
```

### 步骤 4:运行 CMake 并构建

#### 使用 `make` 和默认编译器的 CMake:

```shell
$ cmake -S ~/src/event-sdk-example-c -B ~/src/event-sdk-example-c/build
$ cd ~/src/event-sdk-example-c/build
$ make
```

#### 使用 `ninja` 和替代编译器的 CMake:

这是另一种可能的调用,它使用 `CC` 环境变量设置替代 C 编译器,并使用 [Ninja](https://ninja-build.org/) 构建工具:

```shell
$ CC=clang-19 cmake -S ~/src/event-sdk-example-c -B ~/src/event-sdk-example-c/build -G Ninja
$ cd ~/src/event-sdk-example-c/build
$ ninja
```

编译应该生成一个名为 `eventwatch` 的可执行文件。尝试使用 `-h` 标志运行它以打印帮助。

```shell
$ ./eventwatch -h
usage: eventwatch [-h] [<exec-event-ring>]

execution event observer example program

Options:
  -h | --help   print this message

Positional arguments:
  <exec-event-ring>   path of execution event ring shared memory file
                        [default: monad-exec-events]
```

如果一切成功,继续进行[指南的下一步](/execution-events/getting-started/snapshot),或者如果您也对 Rust 感兴趣,构建 [Rust 示例程序](/execution-events/getting-started/rust)。得益于 Rust 的 [`#[derive(Debug)]`](https://doc.rust-lang.org/rust-by-example/hello/print/print_debug.html) 属性,Rust 示例程序打印的输出比 C 版本更有趣,因此"入门"体验在 Rust 中更好。您可以通过使用前面提到的 `std::formatter` 特化在 C++ 中执行等效操作,但它们不在教程中。

您还可以继续阅读本页的下一部分,其中展示了与 C 库集成的不同方式。

## 替代方法:本地安装,使用 `find_package` 查找

既然您已经看到了"一体化"教程,它解释了源代码组织、SDK 的 `CMakeLists.txt` 文件在哪里等,很容易展示另一种构建系统,而无需太多注释。在本节中,我们将:

- 将 SDK 安装到临时目录 `/tmp/sdk-install-demo`,它将具有传统的 `include` 和 `lib` 目录结构,还有一个 `lib/cmake/category-labs` 目录,其中包含 CMake 的 `find_package` 的配置文件
- 再次编译 `eventwatch.c`,这次使用 `find_package`,它将被指示在 `/tmp/sdk-install-demo` 中查找

### 步骤 1:构建并安装 `libmonad_event.a`

```shell
$ git clone -b release/exec-events-sdk-v1.0 https://github.com/category-labs/monad.git \
  ~/src/monad-exec-events-sdk
$ cmake -S ~/src/monad-exec-events-sdk/category/event \
  -B ~/build/monad-exec-events-sdk-v1-release \
  -DCMAKE_INSTALL_PREFIX=/tmp/sdk-install-demo -DCMAKE_BUILD_TYPE=RelWithDebInfo
$ cmake --build ~/build/monad-exec-events-sdk-v1-release
$ cmake --install ~/build/monad-exec-events-sdk-v1-release
```

如果一切成功,您应该有一个填充的 `/tmp/sdk-install-demo` 目录。

### 步骤 2:创建新目录并下载 `eventwatch.c`

```shell
$ mkdir -p ~/src/event-sdk-example-c-find-package
$ cd ~/src/event-sdk-example-c-find-package
$ curl -O https://raw.githubusercontent.com/category-labs/monad/refs/tags/release/exec-events-sdk-v1.0/category/event/example/eventwatch.c
```

### 步骤 3:创建 `CMakeLists.txt`

添加包含以下内容的 `CMakeLists.txt` 文件:

```cmakelists
cmake_minimum_required(VERSION 3.23)

project(eventwatch LANGUAGES C)

find_package(monad_exec_events_sdk REQUIRED
             PATHS /tmp/sdk-install-demo/lib/cmake/category-labs)

add_executable(eventwatch eventwatch.c)
target_compile_options(eventwatch PRIVATE -Wall -Wextra -Wconversion -Werror)
target_link_libraries(eventwatch PRIVATE monad_event)
```

### 步骤 4:构建并运行

```shell
$ cmake -S . -B build
$ cmake --build build
$ build/eventwatch -h
```
