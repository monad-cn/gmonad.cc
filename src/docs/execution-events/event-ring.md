# 事件环详解

## 事件环文件和内容类型

事件环由四个共享内存段组成。其中两个——事件描述符数组和有效载荷缓冲区——在[概述文档](/execution-events/overview)中已经描述。第三个共享内存段包含一个描述事件环元数据的头部。第四个("上下文区域")是一个特殊功能,执行事件不需要它。

共享内存段使用 [mmap(2)](https://man7.org/linux/man-pages/man2/mmap.2.html) 映射到进程的地址空间。这意味着事件环的数据结构存在于某个文件中,并通过创建该文件的共享内存映射来获得对它的共享访问。

大多数情况下,事件环是一个常规文件,创建在一个称为 [hugetlbfs](https://lwn.net/Articles/375096/) 的特殊内存文件系统上。hugetlbfs 类似于 [tmpfs](https://man7.org/linux/man-pages/man5/tmpfs.5.html) 内存文件系统,但支持创建由大页面大小支持的文件。使用大页面只是一种[优化](https://lwn.net/Articles/374424/):事件环文件可以在任何文件系统上创建。如果执行守护进程被告知在没有 hugetlb mmap 支持的文件系统上创建事件环文件,它将记录性能警告,但仍会创建该文件。要了解更多关于 hugetlbfs 及其使用方式,请阅读[此页面](/execution-events/advanced#location-of-event-ring-files)。

### 事件环配置

要使用执行事件,必须使用命令行参数启动执行守护进程:

```text
--exec-event-ring [<event-ring-configuration-string>]
```

如果没有此命令行参数,执行将不会发布任何事件。此命令行参数(以及挂载 hugetlbfs 文件系统)不是执行守护进程默认配置说明的一部分。有一个[单独的指南](https://validator-docs.vercel.app/docs/full_node/events-and-websockets)介绍了如何挂载 hugetlbfs 文件系统以及如何在 systemd 单元配置文件中修改命令行。

请注意,配置字符串是可选的;如果传递 `--exec-event-ring` 而不带参数(这是推荐的做法),这等效于传递 `--exec-event-ring monad-exec-events`,其中 `monad-exec-events` 是默认的执行事件环文件名。

事件环配置字符串的形式为:

```text
<ring-name-or-file-path>[:<descriptor-shift>:<payload-buffer-shift>]
```

换句话说,配置字符串由三个用 `:` 分隔的字段组成;第一个字段是必需的,但第二个和第三个字段是可选的。以下是一个只有第一个字段的命令行参数示例:

```text
--exec-event-ring /var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/monad-exec-events
```

另一个包含全部三个字段的示例:

```text
--exec-event-ring monad-exec-events:21:29
```

第一个字段是事件环文件的名称。执行守护进程以两种不同的方式解释此字段:

- 如果它纯粹是一个文件名——即,如果路径不包含任何 `/` 字符——那么它将被解释为位于默认事件环文件目录中的文件;这是 API 函数 `monad_event_open_ring_dir_fd` 返回的目录;它使用 [libhugetlbfs](https://github.com/libhugetlbfs/libhugetlbfs) 来定位 hugetlbfs 文件系统最合适的挂载点,并在其下自动创建一个名为 `event-rings` 的子目录(如果它不存在)(有关更多信息,请参见[此处](/execution-events/advanced#location-of-event-ring-files));事件环文件将在该 `event-rings` 子目录中创建
- 如果路径有多个路径组件——即,如果它包含至少一个 `/` 字符——那么将按原样使用此路径,*即使*它不在 hugetlbfs 文件系统上;下面将解释为什么有人可能想要这样做

"shift" 参数是决定事件环大小的 2 的幂指数。1 `<descriptor-shift>` 为 21 意味着环的事件描述符数组中将有 2^21 个描述符。这意味着在描述符环缓冲区回绕并覆盖较旧的事件描述符之前,可以写入大约 200 万个事件。

`<payload-buffer-shift>` 为 29 意味着有效载荷缓冲区数组中将有 2^29 字节。这意味着在有效载荷缓冲区回绕并覆盖较旧事件的有效载荷之前,可以记录 512 MiB 的事件有效载荷。

如果未指定事件环大小参数,则使用默认值。为什么要增加这些值?如果读取程序崩溃,但执行没有崩溃,那么在程序未运行期间,您可能会错过一些事件。您的应用程序可能不关心旧区块的丢失事件,但如果关心,您需要以某种方式检索它们。

如果时间不长,您错过的事件很可能仍在事件环内存中,即尚未被覆盖。默认大小足以容纳 10k TPS 下几分钟的区块。增加这些值允许您回退到更早的时间。

请注意,有一个固定大小的大页面池。可以通过修改系统配置来更改池大小,请参阅[此处](https://www.kernel.org/doc/Documentation/vm/hugetlbpage.txt)关于 `/proc/sys/vm/nr_hugepages` 的讨论。

如果在 hugetlbfs 挂载上创建事件环,并且其大小超过可用大页面的数量,那么执行守护进程将退出并显示"设备上没有剩余空间"的错误消息。例如,这里我们尝试分配一个具有 1 TB 有效载荷缓冲区的事件环:

```text
LOG_ERROR  event library error -- monad_event_ring_init_simple@event_ring_util.c:78:
posix_fallocate failed for event ring file `/dev/hugepages/monad-exec-events`, size 1099647942656: No space left on device (28)
```

如果您碰巧有多 TB 的主内存可用,您可以传递包含 `/` 字符的文件路径到 tmpfs 挂载上的文件,它就能工作,例如,`--exec-event-ring /my-giant-tmpfs/monad-exec-events`。

如果您需要回退到特别远的时间——或者如果由于执行本身崩溃而错过了事件——那么您将需要使用其他地方描述的替代恢复方法。2

### 事件环文件格式

事件环文件格式很简单:所有四个部分按顺序排列并对齐到大页面边界,头部描述每个部分的大小。

```text
╔═Event ring file══╗
║ ┌──────────────┐ ║
║ │              │ ║
║ │    Header    │ ║
║ │              │ ║
║ ├──────────────┤ ║
║ │              │ ║
║ │    Event     │ ║
║ │  Descriptor  │ ║
║ │    Array     │ ║
║ │              │ ║
║ ├──────────────┤ ║
║ │              │ ║
║ │              │ ║
║ │              │ ║
║ │              │ ║
║ │   Payload    │ ║
║ │    Buffer    │ ║
║ │              │ ║
║ │              │ ║
║ │              │ ║
║ │              │ ║
║ │              │ ║
║ ├──────────────┤ ║
║ │              │ ║
║ │   Context    │ ║
║ │     Area     │ ║
║ │              │ ║
║ └──────────────┘ ║
╚══════════════════╝
```

描述符数组只是一个 `struct monad_event_descriptor` 对象的数组,而有效载荷缓冲区是一个平面字节数组(即,它的类型是 `uint8_t[]`)。头部结构的定义如下:

```c
/// Event ring shared memory files start with this header structure
struct monad_event_ring_header
{
    char magic[6];                           ///< 'RINGvv', vv = version number
    enum monad_event_content_type
        content_type;                        ///< Kind of events in this ring
    uint8_t schema_hash[32];                 ///< Ensure event definitions match
    struct monad_event_ring_size size;       ///< Size of following structures
    struct monad_event_ring_control control; ///< Tracks ring's state/status
};
```

### 事件内容类型

需要 `content_type` 头部字段,因为事件环库——读取器和写入器 API——执行非结构化 I/O:函数读写原始的 `uint8_t[]` 事件有效载荷,事件描述符包含纯 `uint16_t` 数值事件代码。与 UNIX 的 `read(2)` 和 `write(2)` 文件 I/O 系统调用非常相似,事件环 API 函数本身并不知道它们正在处理的数据格式。这就是为什么事件描述符中的 `event_type` 字段是通用整数类型 `uint16_t` 而不是 `enum monad_exec_event_type`。

这里的假设是读取器和写入器都知道它们正在处理的数据的二进制格式,并在需要时通过类型转换将原始数据视为具有此格式,例如:

```c
const struct monad_exec_block_start *block_start = nullptr;

// 我们假设我们打开的事件环文件包含执行事件,
// 因此进一步假设将 `event->event_type` 与
// `enum monad_exec_event_type` 类型的值进行比较是有意义的
if (event->event_type == MONAD_EXEC_BLOCK_START) {
    // 由于这是 MONAD_EXEC_BLOCK_START,我们可以将 `const void *`
    // 有效载荷转换为 `const struct monad_exec_block_start *` 有效载荷。
    // 注意:在 C 中允许从 `void *` 隐式类型转换,但在 C++ 中不允许
    block_start = monad_event_ring_payload_peek(event_ring, event);
}
```

我们需要某种错误检测机制来确保这样做是安全的。事件环文件头部包含一个"内容类型"枚举常量,解释它包含什么类型的事件数据:

```c
enum monad_event_content_type : uint16_t
{
    MONAD_EVENT_CONTENT_TYPE_NONE,  ///< An invalid value
    MONAD_EVENT_CONTENT_TYPE_TEST,  ///< Used in simple automated tests
    MONAD_EVENT_CONTENT_TYPE_EXEC,  ///< Core execution events
    MONAD_EVENT_CONTENT_TYPE_PERF,  ///< Performance tracer events
    MONAD_EVENT_CONTENT_TYPE_COUNT  ///< Total number of known event rings
};
```

执行事件总是记录到 `content_type` 等于 `MONAD_EVENT_CONTENT_TYPE_EXEC` 的环中。

### 二进制架构版本控制:`schema_hash` 字段

如果 `content_type` 等于 `MONAD_EVENT_CONTENT_TYPE_EXEC`,那么我们知道一个环应该用于执行事件,但如果事件有效载荷定义发生变化怎么办?或者如果 `enum monad_exec_event_type` 中的枚举常量发生变化怎么办?

假设用户使用特定版本的 `exec_event_ctypes.h` 编译其应用程序,该文件定义了执行事件有效载荷和事件类型枚举。

现在想象一段时间后,用户部署了执行节点的新版本,该版本是使用不同版本的 `exec_event_ctypes.h` 编译的,导致事件有效载荷的内存表示不同。

如果读取器不记得使用新头文件重新编译其应用程序,它可能会错误解释事件有效载荷中的字节,假设它们具有来自旧(编译时)版本 `exec_event_ctypes.h` 的旧布局。

为了防止这些类型的错误,所有事件有效载荷的二进制布局都由一个哈希值汇总,该哈希值在对该内容类型的任何事件有效载荷进行任何更改时都会改变。除了有效载荷更改外,对 `enum monad_exec_event_type` 的任何更改也会生成新的哈希值。

这种机制称为"架构哈希",哈希值作为全局只读字节数组存在于库代码中(在 `exec_event_ctypes_metadata.c` 中定义)。

如果此数组中的哈希值与事件环文件头部中的哈希值不匹配,则二进制格式不兼容。

辅助函数 `monad_event_ring_check_content_type` 用于检查事件环文件是否具有预期的内容类型以及该内容类型的预期架构哈希。以下是在 `eventwatch.c` 示例程序中调用它的示例:

```c
struct monad_event_ring exec_ring;

/* initialization of `exec_ring` not shown */

if (monad_event_ring_check_content_type(
        &exec_ring,
        MONAD_EVENT_CONTENT_TYPE_EXEC,
        g_monad_exec_event_schema_hash) != 0) {
    errx(EX_SOFTWARE, "event library error -- %s",
         monad_event_ring_get_last_error());
}
```

如果事件环的类型不是 `MONAD_EVENT_CONTENT_TYPE_EXEC`,或者文件头部中的 `schema_hash` 与全局数组 `uint8_t g_monad_exec_event_schema_hash[32]` 中包含的值不匹配,此函数将返回 `errno(3)` 域代码 `EPROTO`。

## 事件描述符详解

### 二进制格式

事件描述符的定义如下:

```c
struct monad_event_descriptor
{
    alignas(64) uint64_t seqno;  ///< Sequence number, for gap/liveness check
    uint16_t event_type;         ///< What kind of event this is
    uint16_t : 16;               ///< Unused tail padding
    uint32_t payload_size;       ///< Size of event payload
    uint64_t record_epoch_nanos; ///< Time event was recorded
    uint64_t payload_buf_offset; ///< Unwrapped offset of payload in p. buf
    uint64_t content_ext[4];     ///< Extensions for particular content types
};
```

### 流标签:执行事件环中的 `content_ext` 字段

对于每种内容类型,我们可能希望直接在事件描述符中发布附加数据,例如,如果该数据对每种有效载荷类型都是通用的,或者如果它有助于读取器快速过滤掉他们不感兴趣的事件,而无需检查事件有效载荷。这些附加数据存储在 `content_ext`("内容扩展")数组中,其含义由 `content_type` 定义。

对于执行事件环,有时会填充 `content_ext` 数组的前三个值。数组中每个索引处的值具有以下枚举类型描述的语义含义,该类型在 `exec_event_ctypes.h` 中定义:

```c
/// Stored in event descriptor's `content_ext` array to tag the
/// block & transaction context of event
enum monad_exec_flow_type : uint8_t
{
    MONAD_FLOW_BLOCK_SEQNO = 0,
    MONAD_FLOW_TXN_ID = 1,
    MONAD_FLOW_ACCOUNT_INDEX = 2,
};
```

例如,如果我们有一个事件描述符

```c
struct monad_event_descriptor event;
```

并且其内容通过调用 `monad_event_iterator_try_next` 初始化,那么 `event.content_ext[MONAD_FLOW_TXN_ID]` 将包含该事件的"交易 ID"。交易 ID 等于交易索引加一,如果事件没有关联的交易(例如,新区块的开始),则为零。

"流"标签背后的想法是用它们所属的上下文标记事件。例如,当交易访问特定账户存储键时,会发出 `STORAGE_ACCESS` 事件。

通过查看 `STORAGE_ACCESS` 事件描述符的 `content_ext` 数组,读取器可以判断这是一个由(1)索引为 `event.content_ext[MONAD_FLOW_TXN_ID] - 1` 的交易和(2)到索引为 `event.content_ext[MONAD_FLOW_ACCOUNT_INDEX]` 的账户所进行的存储访问(此索引与先前已看到的 `ACCOUNT_ACCESS` 事件系列相关)。

流标签用于两个原因:

1. **快速过滤** - 如果我们每秒处理 10,000 个交易,并且每个交易至少有十几个事件,那么我们只有大约 10 微秒的时间来处理每个事件,否则我们最终会落后并出现间隙。在这样的时间尺度上,即使触摸包含事件有效载荷的内存也是昂贵的,从相对基础上来说。事件有效载荷位于不同的缓存行上——一个在读取器的 CPU 中尚未预热的缓存行——必须首先在缓存一致性协议中更改缓存行所有权(因为它最近由写入器独占拥有,现在必须与读取 CPU 共享,导致跨核心总线流量)。对于大多数应用程序,用户可以在 `TXN_HEADER_START` 事件时识别他们感兴趣的交易 ID,然后可以忽略任何没有有趣 ID 的事件。因为 ID 是密集的整数集,所以可以使用类型为 `bool[TXN_COUNT + 1]` 的简单数组来有效地查找与该交易关联的后续事件是否有趣(通过使用每个交易的单个位而不是完整的 `bool` 可以使其更加高效)
2. **压缩** - `STORAGE_ACCESS` 的账户由索引引用(该索引引用较早的 `ACCOUNT_ACCESS` 事件),因为账户地址是 20 字节:足够大以至于无法适应剩余的两个 `content_ext` 数组槽

压缩技术也用于存储与事件关联的区块,在 `event.content_ext[MONAD_FLOW_BLOCK_SEQNO]` 中。在这种情况下,流标签是启动关联区块的 `BLOCK_START` 事件的*序列号*。关于此流标签需要注意的几件事:

- 有时它为零(无效的序列号),这意味着事件与任何区块无关;尽管大多数事件的范围限定为一个区块,但共识状态更改事件(`BLOCK_QC`、`BLOCK_FINALIZED` 和 `BLOCK_VERIFIED`)不会在区块内发生
- 请注意,区块流标签*不是*区块号。这是因为在看到事件时,区块处于"提议"状态,共识算法尚未完成投票以决定该区块是否将包含在规范区块链中(下一节将广泛讨论这一点)。在区块最终确定之前,引用它的唯一明确方式是通过其唯一 ID,这是一个 32 字节的哈希值(可以从 `BLOCK_START` 有效载荷中读取);因此区块流标签也是一种压缩形式
- 拥有序列号允许我们将迭代器回退到区块的开始,如果我们在区块中间开始观察事件序列(例如,如果读取器在执行守护进程之后启动)。可以在 `eventwatch.c` 示例程序的 `find_initial_iteration_point` 函数中找到这方面的示例(以及详细说明)

## 脚注

1. 它们被称为"shifts",因为 `1UL << x` 等于 `2^x` ↩
2. 替代恢复方法仍在开发中,将在下一个 SDK 版本中可用 ↩
