# 执行事件概述


执行守护程序包含一个用于记录交易处理期间发生的事件的系统。"执行事件"是 EVM 执行某些操作的通知，例如"账户余额已更新"或"新区块已开始执行"。这些 EVM 事件可以被外部第三方应用程序观察到，通过高性能的进程间通信（IPC）通道。

执行守护程序将事件数据发布到共享内存，外部应用程序从相同的共享内存区域读取以观察事件。您的应用程序可以使用 C 库 `libmonad_event` 或 Rust 包 `monad-exec-events` 来读取事件。

本页面概述了 C 和 Rust API 中使用的基本概念。

## 事件环 vs. 执行事件

尽管实时数据系统及其 SDK 通常被称为"执行事件"，但 SDK 有两个不同的部分：

1. **事件环 API** - "事件环"是共享内存数据结构的名称以及读写它的 API。事件环是一个通用的 IPC 广播工具，用于将事件发布到任意数量的读取进程。事件环 API 使用*非结构化* I/O：就像 UNIX [`read(2)`](https://pubs.opengroup.org/onlinepubs/009604599/functions/read.html) 和 [`write(2)`](https://pubs.opengroup.org/onlinepubs/009695099/functions/write.html) 文件 I/O 系统调用一样，事件环 API 将所有数据视为原始字节数组
2. **执行事件定义** - 实际的"执行事件"是执行守护程序为表示特定 EVM 操作而写入的标准化二进制格式。它可以被看作是一种协议、模式或序列化格式。继续类比，如果事件环 API 类似于 UNIX 的 `read(2)` 和 `write(2)` 文件 API，那么"执行事件"就像定义特定文件内容的"文件格式"

在 Rust SDK 中，这两个部分位于不同的包中：`monad-event-ring` 和 `monad-exec-events`。

C SDK 是一个单一的库，但这两个不同部分的头文件位于不同的目录中：事件环头文件位于 `category/core/event` 子目录，而执行事件文件位于 `category/execution/ethereum`。

## 事件环基础

### 什么是事件？

事件由两个组成部分组成：

1. *事件描述符*是一个固定大小（目前为 64 字节）的对象，描述已发生事件的公共字段。它包含事件的类型、序列号、时间戳和一些内部记录信息
2. *事件载荷*是关于事件的可变大小的额外数据，它特定于事件类型。例如，"交易日志"事件描述交易发出的单个 EVM 日志记录。描述符告诉我们事件的类型（即它是"日志事件"），而载荷告诉我们所有详细信息：合约地址、日志主题和日志数据。事件描述符中尚未提及的一些字段用于传达载荷字节在共享内存中的位置以及载荷的长度

注意
请记住，在事件环 API 级别，事件载荷只是一个非结构化的字节缓冲区；读取器必须知道他们正在读取的格式，并相应地解释它

### 事件存储在哪里？

当事件发生时，事件描述符被写入位于共享内存段中的环形缓冲区。这个环形缓冲区就是下图中的"事件描述符数组"。

事件载荷存储在不同的数组中（在单独的共享内存段中），称为"载荷缓冲区"。

```text
╔═Event descriptor array══════════════...═════════════════════════════════════╗
  ║                                                                             ║
  ║ ┌───────────────┐ ┌───────────────┐     ┌───────────────┐ ┌───────────────┐ ║
  ║ │     Event     │ │     Event     │     │     Event     │ │░░░░░░░░░░░░░░░│ ║
  ║ │  descriptor   │ │  descriptor   │     │  descriptor   │ │░░░░ empty ░░░░│ ║
  ║ │       1       │ │       2       │     │       N       │ │░░░░░░░░░░░░░░░│ ║
  ║ └┬──────────────┘ └┬──────────────┘     └┬──────────────┘ └───────────────┘ ║
  ╚══╬═════════════════╬════════════════...══╬══════════════════════════════════╝
     │                 │                     │
     │                 │                     │
     │         ┌───────┘                     └─┐
     │         │                               │
     │         │                               │
   ╔═╬═════════╬═══════════════════════════...═╬═══════════════════════════════╗
   ║ │         │                               │                               ║
   ║ ▼───────┐ ▼─────────────────────────┐     ▼─────────────┐ ┌─────────────┐ ║
   ║ │Event 1│ │         Event 2         │     │   Event N   │ │░░░░free░░░░░│ ║
   ║ │payload│ │         payload         │     │   payload   │ │░░░░space░░░░│ ║
   ║ └───────┘ └─────────────────────────┘     └─────────────┘ └─────────────┘ ║
   ╚═Payload buffer════════════════════════...═════════════════════════════════╝
```

请记住，实际的事件载荷通常比事件描述符大得多（就字节数而言），尽管在这个简单的图表中看起来不是这样。该图主要试图表明：

- 事件描述符是*固定大小*的，而事件载荷是*可变大小*的
- 事件描述符引用/"指向"其载荷的位置
- 事件描述符和载荷位于不同的连续共享内存数组中

尽管该系统中有两个不同的环形缓冲区——描述符数组和载荷字节缓冲区——我们将整个组合数据结构称为"事件环"。

关于所选通信方式的一些属性：

- 它支持*广播*语义：多个读取器可以同时从事件环读取，每个读取器在环中维护自己的迭代器位置
- 与典型的广播协议一样，写入器不知道读取器的存在——无论是否有人读取，事件都会被写入。因为写入器甚至不知道读取器在做什么，所以如果读取器很慢，它不能等待读取器。读取器必须快速遍历事件，否则事件将丢失：描述符和载荷内存可能被后续事件覆盖。从概念上讲，事件序列是一个*队列*（它具有 FIFO 语义），但称其为*环*是为了强调其溢出时覆盖的语义
- 事件描述符中包含一个序列号，用于检测间隙（由于读取器缓慢而丢失的事件），类似的策略用于检测载荷缓冲区内容何时被覆盖

## 执行事件基础

如前所述，事件环 API 使用非结构化 I/O。当处理特定的事件环时，读取器假定它具有某种已知格式。在本概述的其余部分，我们将查看一个示例执行事件。

### 示例："交易开始"事件

一种特别重要的事件类型是"交易头开始"事件，它在 EVM 解码新交易后不久被记录。它包含大部分交易信息（编码为 C 结构）作为其事件载荷。载荷结构在 `exec_event_ctypes.h` 中定义为：

```c
/// First event recorded when transaction processing starts
struct monad_exec_txn_header_start {
    monad_c_bytes32 txn_hash;     ///< Keccak hash of transaction RLP
    monad_c_address sender;       ///< Recovered sender address
    struct monad_c_eth_txn_header
        txn_header;               ///< Transaction header
};
```

The nested `monad_c_eth_txn_header` structure contains most of the interesting information -- it is defined in `eth_ctypes.h` as follows:

```c
/// Fields of an Ethereum transaction that are recognized by the monad EVM
/// implementation.
///
/// This type contains the fixed-size fields present in any supported
/// transaction type. If a transaction type does not support a particular field,
/// it will be zero-initialized.
struct monad_c_eth_txn_header {
    enum monad_c_transaction_type
        txn_type;                        ///< EIP-2718 transaction type
    monad_c_uint256_ne chain_id;         ///< T_c: EIP-155 blockchain identifier
    uint64_t nonce;                      ///< T_n: num txns sent by this sender
    uint64_t gas_limit;                  ///< T_g: max usable gas (upfront xfer)
    monad_c_uint256_ne max_fee_per_gas;  ///< T_m in EIP-1559 txns or T_p (gasPrice)
    monad_c_uint256_ne
        max_priority_fee_per_gas;        ///< T_f in EIP-1559 txns, 0 otherwise
    monad_c_uint256_ne value;            ///< T_v: wei xfered or contract endowment
    monad_c_address to;                  ///< T_t: recipient
    bool is_contract_creation;           ///< True -> interpret T_t == 0 as null
    monad_c_uint256_ne r;                ///< T_r: r value of ECDSA signature
    monad_c_uint256_ne s;                ///< T_s: s value of ECDSA signature
    bool y_parity;                       ///< Signature Y parity (see YP App. F)
    monad_c_uint256_ne
        max_fee_per_blob_gas;            ///< EIP-4844 contribution to max fee
    uint32_t data_length;                ///< Length of trailing `data` array
    uint32_t blob_versioned_hash_length; ///< Length of trailing `blob_versioned_hashes` array
    uint32_t access_list_count;          ///< # of EIP-2930 AccessList entries
    uint32_t auth_list_count;            ///< # of EIP-7702 AuthorizationList entries
};
```

注释中的正式命名法（例如 `T_n` 和 `T_c`）是对 [以太坊黄皮书](https://ethereum.github.io/yellowpaper/paper.pdf) 中变量名称的引用。

类型 `monad_c_uint256_ne`（"原生字节序"）是一个 256 位整数，以 `uint64_t[4]` 存储在大多数具有良好性能的"大整数"库中常见的 [limb 格式](https://gmplib.org/manual/Integer-Internals)中。

注意
如果您使用 Rust SDK，当构建 `monad-exec-events` 包时，[bindgen](https://docs.rs/bindgen/latest/bindgen/) 会生成具有相同名称（和相同二进制布局，感谢 `#[repr(C)]` 属性）的 `struct` 类型。执行事件载荷的定义特征是它们依赖于简单 C 数据结构的"自然"互操作性。

大多数流行的编程语言都有用于处理 C 代码的定义明确的外部函数接口，这通常也需要某种"自然"处理 C 结构类型的方式。尽管 C 的数据表示不可移植，但这些对象位于共享内存中，因此读取器和写入器必须在同一主机上，并且必须遵循相同的 C ABI。

### 可变长度尾随数组和后续事件

`struct monad_exec_txn_header_start` 对象不是事件载荷中唯一的数据：

- 交易的可变大小 `data` 字节数组（其长度由 `data_length` 字段指定）也是事件载荷的一部分，紧跟在 `struct monad_exec_txn_header_start` 对象之后
- 如果这是一个 EIP-4844 交易，`blob_versioned_hashes` 数组将紧跟在 `data` 数组之后
- 这两者都是"可变长度尾随"（VLT）数组载荷数据的示例；"尾随"意味着在固定大小的载荷结构之后记录一个简单的可变长度数组，该结构（除其他事项外）必须包含描述数组长度的字段；如果有多个 VLT 数组，它们将按照其对应的 `_length` 字段在固定大小结构中列出的相同顺序进行记录

EIP-2930 和 EIP-7702 列表也是交易中的可变长度项，但它们*不*像"交易头开始"事件的载荷那样记录。

它们不是以尾随数组的形式记录，而是为每个 EIP-2930 访问列表条目和每个 EIP-7702 授权元组记录一个唯一的事件。这些事件的数量*确实*在"交易头开始"事件载荷中发布（参见 `access_list_count` 和 `auth_list_count` 字段），以便读取器知道还有多少个事件需要等待。

### 描述符中的执行事件属性

到目前为止，我们讨论了"交易开始"事件的载荷，但事件的公共属性直接记录在事件描述符中。最重要的是，这些属性包括标识事件类型的数字代码，因此我们知道应该将非结构化载荷字节解释为 `struct monad_exec_txn_header_start`。

事件描述符定义如下：

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

对于"交易头开始"事件，`event_type` 字段将设置为 C 枚举常量 `MONAD_EXEC_TXN_HEADER_START` 的值，这是 `enum monad_exec_event_type` 中的一个值。这告诉用户将指向事件载荷开始的 `const uint8_t *` 强制转换为 `const struct monad_event_txn_header_start *` 是适当的。

所有 C 枚举常量都以 `MONAD_EXEC_` 前缀开头，但文档通常不使用前缀来引用事件类型，例如 `TXN_HEADER_START`。

请注意，交易编号不包含在载荷结构中。由于它们在区块链协议中的重要性，交易编号直接编码在事件描述符中（此编码以及将其存储在描述符中的理由在文档的其他地方描述，在描述[流标签](/execution-events/event-ring#flow-tags-the-content_ext-fields-in-execution-event-rings)的部分中）。

后续 EIP-2930 和 EIP-7702 事件的潜在存在也是为什么将此事件称为交易头的*开始*的原因。在看到所有交易头信息后，会发出一个相应的事件，称为 `TXN_HEADER_END`。它没有载荷，仅用于宣布已记录与头相关的所有事件。这样的事件在文档中称为"标记事件"。

最后，首先称其为"头"的原因是与交易相关的事件还有很多。各种"头"只是描述了区块中的所有输入。大多数事件与交易*输出*有关：日志、调用帧、状态变更和收据。

### 内存中布局示例

下图说明了上面解释的关于交易头的可变长度尾随数组、相关后续事件及其终止标记事件的所有内容。此示例交易在其 EIP-2930 访问列表中有两个账户，没有 EIP-7702 条目。EIP-2930 列表中的每个地址都记录一个单独的 `TXN_ACCESS_LIST_ENTRY` 事件，该事件带有可能访问的存储键的可变长度尾随数组。

```text
╔═Payload buffer══════════════════════════════╗
                                      ║                                             ║
                                      ║  ┏━━━━━━━TXN_HEADER_START payload━━━━━━━━┓  ║
                                      ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║
                                  ┌───╬──╋─▶─monad_exec_txn_header_start───────┐░┃  ║
                                  │   ║  ┃░│                                   │░┃  ║
                                  │   ║  ┃░│ monad_c_bytes32 txn_hash;         │░┃  ║
                                  │   ║  ┃░│ monad_c_address sender;           │░┃  ║
                                  │   ║  ┃░│ struct monad_c_eth_txn_header     │░┃  ║
  ╔═Event descriptor array════╗   │   ║  ┃░│     txn_header;                   │░┃  ║
  ║                           ║   │   ║  ┃░├───────────────────────────────────┤░┃  ║
  ║ ┌───────────────────────┐ ║   │   ║  ┃░│                                   │░┃  ║
  ║ │ seqno: 1              □─╬───┘   ║  ┃░│     Transaction data variable     │░┃  ║
  ║ │ TXN_HEADER_START      │ ║       ║  ┃░│       length trailing array       │░┃  ║
  ║ └───────────────────────┘ ║       ║  ┃░│                                   │░┃  ║
  ║                           ║       ║  ┃░│                                   │░┃  ║
  ║ ┌───────────────────────┐ ║       ║  ┃░└───────────────────────────────────┘░┃  ║
  ║ │ seqno: 2              □─╬────┐  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║
  ║ │ TXN_ACCESS_LIST_ENTRY │ ║    │  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
  ║ └───────────────────────┘ ║    │  ║                                             ║
  ║                           ║    │  ║  ┏━━━━━TXN_ACCESS_LIST_ENTRY payload━━━━━┓  ║
  ║ ┌───────────────────────┐ ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║
  ║ │ seqno: 3              │ ║    └──╬──╋─▶─monad_exec_txn_access_list_entry──┐░┃  ║
  ║ │ TXN_ACCESS_LIST_ENTRY □─╬────┐  ║  ┃░│                                   │░┃  ║
  ║ └───────────────────────┘ ║    │  ║  ┃░│ uint32_t index;                   │░┃  ║
  ║                           ║    │  ║  ┃░│ struct monad_c_access_list_entry  │░┃  ║
  ║ ┌───────────────────────┐ ║    │  ║  ┃░│     entry;                        │░┃  ║
  ║ │ seqno: 4              │ ║    │  ║  ┃░├───────────────────────────────────┤░┃  ║
  ║ │ TXN_HEADER_END        │ ║    │  ║  ┃░│       Storage key variable        │░┃  ║
  ║ └───────────────────────┘ ║    │  ║  ┃░│       length trailing array       │░┃  ║
  ║                           ║    │  ║  ┃░└───────────────────────────────────┘░┃  ║
  ║                           ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║
  ║                           ║    │  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
  ║                           ║    │  ║                                             ║
  ║                           ║    │  ║  ┏━━━━━TXN_ACCESS_LIST_ENTRY payload━━━━━┓  ║
  ║                           ║    │  ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║
  ║                           ║    └──╬──╋─▶─monad_exec_txn_access_list_entry──┐░┃  ║
  ║                           ║       ║  ┃░│                                   │░┃  ║
  ║                           ║       ║  ┃░│ uint32_t index;                   │░┃  ║
  ╚═══════════════════════════╝       ║  ┃░│ struct monad_c_access_list_entry  │░┃  ║
                                      ║  ┃░│     entry;                        │░┃  ║
                                      ║  ┃░├───────────────────────────────────┤░┃  ║
                                      ║  ┃░│                                   │░┃  ║
                                      ║  ┃░│       Storage key variable        │░┃  ║
                                      ║  ┃░│       length trailing array       │░┃  ║
                                      ║  ┃░│      (this has more storage       │░┃  ║
                                      ║  ┃░│        keys and is larger)        │░┃  ║
                                      ║  ┃░│                                   │░┃  ║
                                      ║  ┃░└───────────────────────────────────┘░┃  ║
                                      ║  ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃  ║
                                      ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
                                      ║                                             ║
                                      .                                             .
                                      .                                             .
                                      .                                             .
                                      ║                                             ║
                                      ╚═════════════════════════════════════════════╝
```

### 执行事件序列化模式

为什么 EIP-2930 条目被记录为单独的事件，而不是作为可变长度尾随数组？因为涉及两个级别的可变长度信息。有可变数量的 EIP-2930 账户，然后对于每个账户，有可变数量的关联存储键。

事件序列化协议力求非常简单：只有当数组*元素*类型是固定大小时，才会记录可变长度尾随数组。如果可变性有多个维度，则通过使用更多不同的事件将它们"分解出来"。权衡是使用更复杂编码的更少事件，与将数据"展开"成"更平坦"形状的更多事件之间的权衡。

从技术上讲，EIP-7702 授权列表*可以*表示为可变长度尾随数组，因为授权元组是固定大小的。然而，作为一个设计决策，可变长度尾随数组只允许具有简单的元素类型，如 `u8` 或 `uint256`，并且不能有太多。

VLT 数组的解码逻辑往往容易出错；它看起来令人困惑，因为在代码中很难"看到"序列化规则到底是什么。将数据"展开"为更多事件更具自我文档性：创建不同的类型化对象，而不是依赖隐式解析规则来重新解释非结构化尾随数据。

因此，VLT 数组仅在其使用看起来"显而易见"时使用，例如每个 `EIP-2930` 访问列表条目中的存储键数组。
