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

`exec_event` is a value of Rust enum type `ExecEvent` . Here is how that enum is defined:

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
    // ... more enum variants follow, full definition not shown
}
```

- The debug output starts with `BlockStart(...)` , so `exec_event` has the `ExecEvent::BlockStart` enum variant
- It seems like we already knew that from the earlier `BLOCK_START [2 0x2]` print-out, but there's a subtle difference. The first line prints information found in the *event descriptor* , which is like a header containing the the common fields of an event. At the point in the program where the descriptor line is printed, it has not yet decoded the event payload to construct the `exec_event` variant. Suppose we were only interested in block 15,000,002. In that case, we could look at just the descriptor, notice it relates to block 15,000,001, and skip over this event (and all other events for that block), i.e., we would not bother decoding it
- The value associated with an `ExecEvent::BlockStart` variant if of type `struct monad_exec_block_start` ; notice that this type does *not* follow the normal Rust code-formatting style: it uses `lower_case_snake_case` instead of `UpperCamelCase` and has a seemingly-unnecessary prefix (all the variant value types start with `monad_exec_` ). This is because the payload types are defined as C language structures, and their Rust equivalents are generated using bindgen. The C-style spelling helps indicate that. The definition of `monad_exec_block_start` comes from the C header file `exec_event_ctypes.h` , where it is defined like this:

```c
/// Event recorded at the start of EVM execution
struct monad_exec_block_start
{
    struct monad_exec_block_tag block_tag;          ///< Proposal is for this block
    uint64_t round;                                 ///< Round when block was proposed
    uint64_t epoch;                                 ///< Epoch when block was proposed
    __uint128_t proposal_epoch_nanos;               ///< UNIX epoch nanosecond timestamp
    monad_c_uint256_ne chain_id;                    ///< Blockchain we're associated with
    struct monad_c_secp256k1_pubkey author;         ///< Public key of block author
    monad_c_bytes32 parent_eth_hash;                ///< Hash of Ethereum parent block
    struct monad_c_eth_block_input eth_block_input; ///< Ethereum execution inputs
    struct monad_c_native_block_input monad_block_input; ///< Monad execution inputs
};
```

The Ethereum execution inputs field `eth_block_input` is the field that corresponds to the parts of the Ethereum block header which are known at the start of execution.

Some of this output is difficult to read, since Rust's `#[derive(Debug)]` is meant for ease of debugging and doesn't always "pretty-print" data in the best way for readability. Other fields are clear though, for example, the `gas_limit` of the block is shown as a hexidecimal value:

```text
monad_c_eth_block_input { <not shown...> gas_limit: 1c9c380 <...not shown> }
```

`0x1c9c380` corresponds to the decimal number `30,000,000` , a number we expect to see for a mainnet Ethereum gas limit.

info
Real pretty-printing of events is done with a developer tool called `eventcap` , which is part of the SDK. This example is meant to be as simple and short as possible, to help with learning the API. When debugging real event programs, you will probably prefer developer tools like eventcap. The build instructions for it are in the final step of the "Getting start" guide [(here)](/execution-events/getting-started/final#optional-build-the-eventcap-program) .

Now let's look for something a little more interesting, to get a sense of a what a real SDK consumer might do with this data.

If you search the output for the string `TXN_EVM_OUTPUT` , the first match will be this event (with some formatting differences):

```text
16:26:14.376725676 TXN_EVM_OUTPUT [17 0x11] SEQ: 236 BLK: 15000001 TXN: 0
Payload: TxnEvmOutput { txn_index: 0, output: monad_exec_txn_evm_output {
    receipt: monad_c_eth_txn_receipt { status: false, log_count: 0, gas_used: 765c },
    call_frame_count: 1
} }
```

This is the first event that describes the output of transaction zero in block 15,000,001 -- note the `TXN: 0` in the descriptor and `txn_index: 0` in the payload. We say "first event" because the output for any particular transaction usually spans *several* events: each log, call frame, state change, and state access is recorded as a separate event.

The first event is always of type `TXN_EVM_OUTPUT` . It contains a basic summary of what happened, and an indication of how many more output-related events will follow. You can see that this particular transaction emitted zero logs, and one call frame trace. The call frame information is recorded in the next event, on the line below this one.

As it turns out, the very first transaction is also somewhat interesting: it failed to execute after using 30,300 gas (0x765c). The transaction's failure is recorded by `status` field. As you can see, it is set to `false` .

Why did it fail? To figure it out, we'll use the information in the `TXN_CALL_FRAME` event that follows this one. The `evmc_status_code` field in that event has the value `2` , which is the numeric value of the [`EVMC_REVERT`](https://github.com/ipsilon/evmc/blob/496ce0f81058378b72d0b592d1c49b935bce3302/include/evmc/evmc.h#L298) status code. This tells us that the revert was requested by the contract code itself, i.e., it executed a [`REVERT`](https://www.evm.codes/?fork=cancun#fd) instruction. In other words, this was not a VM-initiated exceptional halt such as "out of gas" or "illegal instruction, but something the contract itself decided to do.

Because this is a Solidity contract, we can decode richer error information from the call frame. The `REVERT` instruction can pass arbitrary-length return data back to the caller. This return data is recorded in the call frame, in the `return_bytes` array.

Observe that the first 4 bytes of `return_bytes` are `0x8c379a0` . This is how Solidity represents a revert that carries a string explanation. The details of how this string is encoded is [here](https://docs.soliditylang.org/en/v0.8.21/control-structures.html#revert) , but the upshot is that we can decode the last 32 bytes of this `return_bytes` array as an ASCII string. If you try this yourself, you'll discover that it says:

```text
Ownable: caller is not the owner
```

This error string ultimately comes from [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.0/contracts/access/Ownable.sol#L43) , in OpenZeppelin's abstract "Ownable" contract. This was used as a third-party library in the implementation of this smart contract, to provide some simple access controls.

In an earlier event (called `TXN_HEADER_START` ) we can find the transaction's Keccak hash, which is `0xaedb8ef26125d8ad6e0c5f19fc9cbdd7f4a42eb82de88686b39090b8abcfeb8f` . If we look up information about this transaction on [Etherscan](https://etherscan.io/tx/0xaedb8ef26125d8ad6e0c5f19fc9cbdd7f4a42eb82de88686b39090b8abcfeb8f) , using the hash, we can see that Etherscan agrees. The `Status:` field reads:

```text
Fail with error 'Ownable: caller is not the owner'
```

Feel free to double-check this result using your favorite tool for exploring Ethereum mainnet data!

### 步骤 4：了解其工作原理

您刚刚运行的示例程序的源代码有很多注释，旨在教您如何使用 API。了解 SDK 的最佳方法是通读它，但如果您还没有阅读[概述](/execution-events/overview)，您可能想先阅读它。

您可以现在就这样做，或者继续下一步，我们将安装我们自己的本地 [Monad 节点](/execution-events/getting-started/setup-node)。一旦我们有了自己的节点，我们就可以运行相同的示例程序，但让它消费实时 Monad 区块链数据而不是快照数据。
