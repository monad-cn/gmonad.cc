# C API


## 核心概念

事件环 C API 中有两个核心对象。它们是：

1. **struct `monad_event_ring`** - 表示其共享内存段已映射到当前进程地址空间的事件环；客户端对此对象的主要操作是使用它来初始化指向事件环的迭代器，使用 `monad_event_ring_init_iterator` 函数
2. **struct `monad_event_iterator`** - 核心主角：此迭代器对象用于读取顺序事件。迭代器的 `try_next` 操作复制当前事件描述符（如果可用），如果成功，则推进迭代器。从概念上讲，如果事件描述符立即准备好，它的行为类似于表达式 `descriptor = *i++`（否则什么也不做）

理解 API 的最简单方法是编译并运行包含的 `eventwatch` 示例程序。该程序将执行事件的 ASCII 表示转储到 `stdout`，因为它们由在同一主机上运行的执行守护程序编写。

在 `eventwatch` 中，事件描述符被完全解码，但事件载荷仅以十六进制转储形式显示，因为这个简单的程序不包括所有事件载荷类型的美化打印逻辑。该程序只有 250 行代码，通读它应该能解释各种 API 调用如何配合使用。

SDK 还包括 C++20 [`std::formatter`](https://en.cppreference.com/w/cpp/utility/format/formatter.html) 特化，可以将事件载荷完全解码为人类可读的形式。这些由 `eventcap` 实用程序使用。

## 在您的项目中使用 API

`libmonad_event` 专为第三方集成而设计，因此除了最新版本的 glibc 之外，它没有任何库依赖项。这也意味着它不依赖于 monad 存储库的其余部分或其构建系统：唯一的要求是支持 C23 的 C 编译器。

构建 C 示例程序的"快速入门"指南[讨论了几种方式](/execution-events/getting-started/c#how-can-my-code-use-libmonad_eventa)将 SDK 库作为第三方依赖项用于您的代码中。或者，可以将组成库目标的源文件复制到您自己的代码库中。Rust 客户端库[也可用](/execution-events/rust-api)。

## API 概览

### 事件环 API

| API | 用途 
| `monad_event_ring_mmap` | 给定打开的事件环文件的文件描述符，将其共享内存段映射到当前进程，初始化 `struct monad_event_ring` 
| `monad_event_ring_init_iterator` | 给定指向 `struct monad_event_ring` 的指针，初始化一个可以从事件环读取的迭代器 
| `monad_event_ring_try_copy` | 给定特定的序列号，如果事件描述符尚未被覆盖，则尝试复制它 
| `monad_event_ring_payload_peek` | 获取指向事件载荷的零拷贝指针 
| `monad_event_ring_payload_check` | 检查零拷贝指针引用的事件载荷是否已被覆盖 
| `monad_event_ring_memcpy` | 将事件载荷 `memcpy` 到缓冲区，仅在载荷未过期时成功 
| `monad_event_ring_get_last_error` | 返回描述此线程上发生的最后一个错误的人类可读字符串 

所有可能失败的函数都将返回一个 `errno(3)` 域错误代码，诊断失败的原因。可以调用函数 `monad_event_ring_get_last_error` 来提供对失败内容的人类可读字符串解释。

### 事件迭代器 API

| API | 用途 
| `monad_event_iterator_try_next` | 如果事件描述符可用，复制它并推进迭代器；行为类似于 `*i++`，但仅在 `*i` 准备好时 
| `monad_event_iterator_try_copy` | 复制当前迭代点的事件描述符，而不推进迭代器 
| `monad_event_iterator_reset` | 重置迭代器以指向最近生成的事件描述符；用于间隙恢复 
| `monad_exec_iter_consensus_prev` | 将迭代器倒回到前一个共识事件（`BLOCK_START`、`BLOCK_QC`、`BLOCK_FINALIZED` 或 `BLOCK_VERIFIED`） 
| `monad_exec_iter_block_number_prev` | 将迭代器倒回到给定区块编号的前一个共识事件 
| `monad_exec_iter_block_id_prev` | 将迭代器倒回到给定区块 ID 的前一个共识事件 
| `monad_exec_iter_rewind_for_simple_replay` | 将迭代器倒回以重放您可能错过的事件，基于您看到的最后一个已最终确定的区块 

### 事件环实用工具 API

| API | 用途 
| `monad_event_ring_check_content_type` | 检查库使用的事件定义的二进制布局是否与映射的事件环中记录的内容匹配 
| `monad_event_ring_find_writer_pids` | 查找已打开事件环文件描述符进行写入的进程；用于检测发布者退出 
| `monad_check_path_supports_map_hugetlb` | 检查路径是否在允许其文件使用 `MAP_HUGETLB` 进行 mmap 的文件系统上 
| `monad_event_open_hugetlbfs_dir_fd` | 打开创建事件环文件的默认 hugetlbfs 目录 1 
| `monad_event_resolve_ring_file` | 如果路径不包含 `/` 字符（即，如果它是"纯"文件名），则相对于某个默认事件环目录解析它 2 
| `monad_event_is_snapshot_file` | 检查路径是否引用事件环快照文件 
| `monad_event_decompress_snapshot_fd` | 解压缩给定文件描述符中包含的事件环快照 
| `monad_event_decompress_snapshot_mem` | 解压缩给定内存缓冲区中包含的事件环快照 

## 库组织结构

`libmonad_event` 中的事件环文件：

| 文件 | 包含内容 
| `event_ring.{h,c}` | 事件环的核心共享内存结构的定义，以及初始化和 mmap 事件环文件的 API 
| `event_iterator.h` | 定义基本事件迭代器对象及其 API 
| `event_iterator_inline.h` | `event_iterator.h` 函数的定义，出于性能原因，所有这些函数都是内联的 
| `event_metadata.h` | 描述事件元数据的结构（事件的字符串名称、事件描述等） 
| `exec_iter_help.h` | 用于将迭代器倒回以指向区块执行或共识事件的 API 

`libmonad_event` 中的执行事件文件：

| 文件 | 包含内容 
| `base_ctypes.h` | 以太坊数据中常见的基本词汇类型的定义（例如，256 位整数类型等） 
| `eth_ctypes.h` | 以太坊虚拟机中使用的结构的定义 
| `exec_event_ctypes.h` | 执行事件载荷结构的定义，以及事件类型枚举 `enum monad_exec_event_type` 
| `exec_event_ctypes_metadata.c` | 定义有关执行事件的静态元数据以及模式哈希值数组 
| `monad_ctypes.h` | Monad 区块链对以太坊扩展的定义 

`libmonad_event` 中的支持文件：

| 文件 | 包含内容 
| `event_ring_util.{h,c}` | 在大多数事件环程序中有用的便利函数，但不是核心 API 的一部分 
| `format_err.{h,c}` | 用于实现 `monad_event_ring_get_last_error()` 函数的执行代码库中的辅助工具 
| `srcloc.h` | 与 `format_err.h` API 一起使用的辅助工具，用于在 C 中捕获源代码位置 

SDK 中的其他文件：

| 文件 | 内容 
| `eventwatch.c` | 展示如何使用 API 的示例程序 
| `*_fmt.hpp` 文件 | 以 `_fmt.hpp` 结尾的文件与 C++ `<format>` 一起使用，包含 SDK 类型的 `std::formatter` 特化 
| `hex.hpp` | `_fmt.hpp` 文件使用的 `<format>` 十六进制转储工具，用于转储 `uint8_t[]` 值 

## 脚注

1. 默认情况下，这会返回 hugetlbfs 挂载上的路径，由 libhugetlbfs 计算得出 ↩
2. 如果使用 `MONAD_EVENT_USE_LIBHUGETLBFS=OFF` 编译，则必须指定默认事件环目录；有关详细信息，请参见[此处](/execution-events/advanced#location-of-event-ring-files) ↩
