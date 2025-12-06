# 在快照数据上运行示例程序


熟悉执行事件系统的最简单方法是尝试示例程序并阅读代码，尽管您可能想先阅读解释基本概念的[快速概述](/execution-events/overview)。

如果您按顺序遵循本指南，您应该已经构建了其中一个示例程序。如果您还没有构建，请选择适合您的语言的指南（[C](/execution-events/getting-started/c) 或 [Rust](/execution-events/getting-started/rust)），然后返回此页面。

## 实时事件环 vs. 快照事件环

事件环的共享内存数据结构通常位于常规文件内。任何想要对事件环进行共享访问的进程，首先通过文件系统定位它，然后使用 [mmap(2)](https://man7.org/linux/man-pages/man2/mmap.2.html) 系统调用将其共享视图映射到进程的虚拟内存映射中。

事件环文件有两种类型：

1. **"实时"事件环文件** -- 这些是"正常"的事件环文件，是实时数据的来源。SDK 的全部意义在于从这些文件中读取实时事件，但对于大多数日常软件开发任务来说，它们并不太方便。例如，假设您想为数据处理程序编写测试。SDK 主要围绕*读取*事件而设计，因此要使用实时事件环对其进行测试，您需要编写一些虚拟事件发布代码才能有事件可读。对于执行事件，实时事件环文件由执行守护程序填充，而在本教程的这一点我们甚至还没有安装它！第二种事件环文件解决了许多开发难题。
2. **"快照"事件环文件** -- 这些是在特定时间点对实时事件环文件进行的压缩快照。通常它们被"倒回"到循环事件队列中最旧的事件，并用于重放一组固定的历史执行事件。快照文件对于测试和开发工作流程很有用，因为您不需要运行活动发布者即可使用它们。因为它们对开发非常有用，所以快照是我们在实时节点上尝试示例程序之前将使用的第一个数据源。

## 在快照文件上运行示例程序

### 步骤 1：下载快照文件

运行此命令以下载快照：

```shell
$ curl https://raw.githubusercontent.com/category-labs/monad-bft/refs/tags/release/exec-events-sdk-v1.0/monad-exec-events/test/data/exec-events-emn-30b-15m/snapshot.zst > /tmp/exec-events-emn-30b-15m.zst
```

文件名的 `emn-30b-15m` 部分表示"从 1500 万个区块之后开始的 30 个区块的以太坊主网重放"。换句话说，这包含了在以太坊区块链（chain ID 1）的历史重放期间发出的执行事件，从区块 15,000,001 到区块 15,000,031。

Category Labs 执行守护程序能够执行来自 Monad 区块链（EVM chain ID 143 或其任何测试网络）的区块，但也能执行来自其他 EVM 兼容网络的区块。以太坊主网的历史重放用作执行"一致性测试"，以确保节点软件尽可能保持以太坊兼容性。

我们在教程中使用以太坊链快照，假设许多开发人员已经熟悉以太坊生态系统，但可能是 Monad 的新手。您可以检查快照文件中捕获的所有数据是否与您最喜欢的以太坊数据提供商发布的数据匹配。例如，您将能够检查此处显示的数据是否与 [Etherscan](https://etherscan.io/) 等网站报告的内容匹配。

为什么使用 `/tmp`？
我们的示例 `curl` 命令将快照文件放在 `/tmp` 中是有原因的。虽然文件可以放在任何地方，但我们鼓励用户不要将其放在他们当前所在的目录中，以确保他们在第一次运行程序时不会遇到令人困惑的错误。

如果文件放在当前工作目录中，并且您将其指定为 `exec-events-emn-30b-15m.zst`，则会发生错误。如果您改为将文件称为 `./exec-events-emn-30b-15m.zst`，该错误就会消失。前导 `./` 以您之前见过的方式"修复"了问题：当您想在 UNIX shell 中运行不在 `$PATH` 上的命令时，您通常会添加 `./` 以抑制默认的自动路径搜索。任何 `/` 字符都将输入标记为实际文件路径，而不是要搜索的"命令名称"。

事件环文件也会发生类似的情况，其中不带 `/` 的文件输入会以自动方式进行转换。除非名称包含 `./` 以传达输入是路径，否则不会在当前目录中"搜索"文件。"纯"文件名仅在称为"默认事件环目录"的特殊目录中搜索。SDK 的["事件环文件的位置"](/execution-events/advanced#location-of-event-ring-files)部分充分解释了其原理。

### 步骤 2：运行您之前构建的 SDK 示例程序

每种编程语言的命令略有不同。

对于 C，运行：

```shell
$ eventwatch /tmp/exec-events-emn-30b-15m.zst
```

对于 Rust，运行：

```shell
cargo run -- --event-ring-path /tmp/exec-events-emn-30b-15m.zst -d
```

Rust 示例程序的输出比 C 输出更具信息量。两个程序都会"美化打印"事件描述符信息，但 C 示例程序只能十六进制转储事件载荷，而 Rust 程序能够调试打印它们，这要归功于 Rust 的 `#[derive(Debug)]` 功能。Rust 命令行中的 `-d` 参数告诉程序打印这种"调试"形式。

注意
SDK 中*确实*存在用于 C 语言家族的完整美化打印器，但它们仅适用于 C++，并基于标准 C++ `<format>` 库

### 步骤 3：分析数据（仅限 Rust）

如果您正在运行 Rust 示例程序——本指南的这一步假设您正在运行——您将看到所有事件数据的文本转储。我们将查看一些特定事件，让您了解 SDK 生成的数据类型以及您可以用它做什么。

Rust 示例程序打印的前两行如下所示：

```text
16:26:14.354056730 BLOCK_START [2 0x2] SEQ: 1 BLK: 15000001
Payload: BlockStart(monad_exec_block_start { <block-start-details> })
```

让我们分解第一行：

- `16:26:14.354056730` -- 这是记录原始事件时的纳秒分辨率时间戳；由于我们查看的是快照而不是实时数据，因此这将始终是相同的数字，并且来自很久以前；当我们打印它时，时间戳的实际"日期"部分被省略，因为 SDK 的典型用例是实时数据（其中日期通常是"今天"）
- `BLOCK_START` - 这是在 EVM 内部发生的事件类型；当执行守护程序首次看到新区块时，会记录 `BLOCK_START` 事件，其载荷描述了在执行处理*开始*时已知的所有执行输入；这主要对应于在执行之前已知的以太坊区块头中的字段
- `[2 0x2]` - 这是对应于 `BLOCK_START` 事件类型的数字代码，以十进制和十六进制表示
- `SEQ: 1` - 序列号（到目前为止发布的事件数量的单调计数器）为 1；在实时事件环中，这些用于间隙/覆盖检测
- `BLK: 15000001` - 此事件是区块编号 15,000,001 的一部分

第二行由以下 Rust 语句生成：

```rust
println!("Payload: {exec_event:x?}");
```

因为这是一行非常长的行（Rust 的 `#[derive(Debug)]` 输出中没有换行），所以在我们的示例输出文本中缩写了它。我们稍后会查看它的部分内容，但我们将在这里暂停以解释有关此 `println!("Payload: {exec_event:x?}")` 语句的一些内容。

`exec_event` 是 Rust 枚举类型 `ExecEvent` 的一个值。以下是该枚举的定义：

```rust
pub enum ExecEvent {
    RecordError(monad_event_record_error),
    BlockStart(monad_exec_block_start),
    BlockReject(monad_exec_block_reject),
    BlockPerfEvmEnter,
    BlockPerfEvmExit,
    BlockEnd(monad_exec_block_end),
    BlockQC(monad_exec_block_qc),
    BlockFinalized(monad_exec_block_finalized),
    BlockVerified(monad_exec_block_verified),
    TxnHeaderStart {
        txn_index: usize,
        txn_header_start: monad_exec_txn_header_start,
        data_bytes: Box<[u8]>,
        blob_bytes: Box<[u8]>,
    },
    // ... 更多枚举变体如下，未显示完整定义
}
```

- 调试输出以 `BlockStart(...)` 开头，因此 `exec_event` 具有 `ExecEvent::BlockStart` 枚举变体
- 看起来我们从之前的 `BLOCK_START [2 0x2]` 输出中已经知道了这一点，但有一个微妙的区别。第一行打印的是在*事件描述符*中找到的信息，它就像一个包含事件公共字段的头部。在程序打印描述符行的时候，它还没有解码事件载荷来构造 `exec_event` 变体。假设我们只对区块 15,000,002 感兴趣。在这种情况下，我们可以只查看描述符，注意到它与区块 15,000,001 相关，然后跳过此事件（以及该区块的所有其他事件），也就是说，我们不会费心去解码它
- 与 `ExecEvent::BlockStart` 变体关联的值是 `struct monad_exec_block_start` 类型；请注意，此类型*不*遵循正常的 Rust 代码格式样式：它使用 `lower_case_snake_case` 而不是 `UpperCamelCase`，并且有一个看似不必要的前缀（所有变体值类型都以 `monad_exec_` 开头）。这是因为载荷类型被定义为 C 语言结构，它们的 Rust 等价物是使用 bindgen 生成的。C 风格的拼写有助于表明这一点。`monad_exec_block_start` 的定义来自 C 头文件 `exec_event_ctypes.h`，其中定义如下：

```c
/// 在 EVM 执行开始时记录的事件
struct monad_exec_block_start
{
    struct monad_exec_block_tag block_tag;          ///< 此区块的提案
    uint64_t round;                                 ///< 提议区块时的轮次
    uint64_t epoch;                                 ///< 提议区块时的纪元
    __uint128_t proposal_epoch_nanos;               ///< UNIX 纪元纳秒时间戳
    monad_c_uint256_ne chain_id;                    ///< 我们关联的区块链
    struct monad_c_secp256k1_pubkey author;         ///< 区块作者的公钥
    monad_c_bytes32 parent_eth_hash;                ///< 以太坊父区块的哈希
    struct monad_c_eth_block_input eth_block_input; ///< 以太坊执行输入
    struct monad_c_native_block_input monad_block_input; ///< Monad 执行输入
};
```

以太坊执行输入字段 `eth_block_input` 对应于在执行开始时已知的以太坊区块头的部分。

此输出的某些部分难以阅读，因为 Rust 的 `#[derive(Debug)]` 是为了便于调试而设计的，并不总是以最佳方式"美化打印"数据以提高可读性。不过其他字段很清楚，例如，区块的 `gas_limit` 显示为十六进制值：

```text
monad_c_eth_block_input { <not shown...> gas_limit: 1c9c380 <...not shown> }
```

`0x1c9c380` 对应于十进制数 `30,000,000`，这是我们期望在以太坊主网 gas 限制中看到的数字。

提示
事件的真正美化打印是使用名为 `eventcap` 的开发工具完成的，它是 SDK 的一部分。此示例旨在尽可能简单和简短，以帮助学习 API。在调试实际事件程序时，您可能会更喜欢使用 eventcap 等开发工具。它的构建说明在"入门"指南的最后一步[（这里）](/execution-events/getting-started/final#optional-build-the-eventcap-program)中。

现在让我们寻找一些更有趣的东西，以了解真正的 SDK 使用者可能如何处理这些数据。

如果您在输出中搜索字符串 `TXN_EVM_OUTPUT`，第一个匹配项将是此事件（格式略有不同）：

```text
16:26:14.376725676 TXN_EVM_OUTPUT [17 0x11] SEQ: 236 BLK: 15000001 TXN: 0
Payload: TxnEvmOutput { txn_index: 0, output: monad_exec_txn_evm_output {
    receipt: monad_c_eth_txn_receipt { status: false, log_count: 0, gas_used: 765c },
    call_frame_count: 1
} }
```

这是描述区块 15,000,001 中交易零输出的第一个事件——注意描述符中的 `TXN: 0` 和载荷中的 `txn_index: 0`。我们说"第一个事件"是因为任何特定交易的输出通常跨越*多个*事件：每个日志、调用帧、状态更改和状态访问都作为单独的事件记录。

第一个事件始终是 `TXN_EVM_OUTPUT` 类型。它包含发生了什么的基本摘要，以及将有多少与输出相关的事件跟随的指示。您可以看到这个特定交易发出了零个日志和一个调用帧跟踪。调用帧信息记录在下一个事件中，就在此事件的下一行。

事实证明，第一个交易也有点有趣：它在使用 30,300 gas (0x765c) 后执行失败。交易的失败由 `status` 字段记录。如您所见，它被设置为 `false`。

它为什么失败？要弄清楚这一点，我们将使用在此事件之后的 `TXN_CALL_FRAME` 事件中的信息。该事件中的 `evmc_status_code` 字段的值为 `2`，这是 [`EVMC_REVERT`](https://github.com/ipsilon/evmc/blob/496ce0f81058378b72d0b592d1c49b935bce3302/include/evmc/evmc.h#L298) 状态代码的数值。这告诉我们回滚是由合约代码本身请求的，即它执行了 [`REVERT`](https://www.evm.codes/?fork=cancun#fd) 指令。换句话说，这不是 VM 发起的异常停止，如"gas 不足"或"非法指令"，而是合约本身决定做的事情。

因为这是一个 Solidity 合约，我们可以从调用帧中解码更丰富的错误信息。`REVERT` 指令可以将任意长度的返回数据传递回调用者。此返回数据记录在调用帧的 `return_bytes` 数组中。

请注意，`return_bytes` 的前 4 个字节是 `0x8c379a0`。这是 Solidity 表示带有字符串解释的回滚的方式。关于如何编码此字符串的详细信息在[这里](https://docs.soliditylang.org/en/v0.8.21/control-structures.html#revert)，但结果是我们可以将此 `return_bytes` 数组的最后 32 个字节解码为 ASCII 字符串。如果您自己尝试，您会发现它显示：

```text
Ownable: caller is not the owner
```

此错误字符串最终来自 OpenZeppelin 的抽象"Ownable"合约[这里](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.0/contracts/access/Ownable.sol#L43)。这被用作此智能合约实现中的第三方库，以提供一些简单的访问控制。

在较早的事件（称为 `TXN_HEADER_START`）中，我们可以找到交易的 Keccak 哈希，即 `0xaedb8ef26125d8ad6e0c5f19fc9cbdd7f4a42eb82de88686b39090b8abcfeb8f`。如果我们使用该哈希在 [Etherscan](https://etherscan.io/tx/0xaedb8ef26125d8ad6e0c5f19fc9cbdd7f4a42eb82de88686b39090b8abcfeb8f) 上查找有关此交易的信息，我们可以看到 Etherscan 同意这一点。`Status:` 字段显示：

```text
Fail with error 'Ownable: caller is not the owner'
```

请随意使用您最喜欢的工具来探索以太坊主网数据，以再次验证此结果！

### 步骤 4：了解其工作原理

您刚刚运行的示例程序的源代码有很多注释，旨在教您如何使用 API。了解 SDK 的最佳方法是通读它，但如果您还没有阅读[概述](/execution-events/overview)，您可能想先阅读它。

您可以现在就这样做，或者继续下一步，我们将安装我们自己的本地 [Monad 节点](/execution-events/getting-started/setup-node)。一旦我们有了自己的节点，我们就可以运行相同的示例程序，但让它消费实时 Monad 区块链数据而不是快照数据。
