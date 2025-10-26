# 共识事件


如[此处](/monad-arch/consensus/asynchronous-execution)所述，Monad 的共识和执行服务是解耦的，执行相对于共识是异步的：两者不必同步移动，可以处理不同的区块。此外，执行可以[推测性地执行](/monad-arch/consensus/asynchronous-execution#speculative-execution)共识结果尚未知晓的区块。

执行事件是在执行期间直接从 EVM 报告的"跟踪"信息，因此它们以*推测*为基础报告实时数据：事件数据可能与永远不会最终确定的区块有关。

在推测基础上处理实时数据在[此页面](/monad-arch/realtime-data/spec-realtime)上有详细讨论。该部分文档的"要点"如下：如果您消费推测性实时数据，则需要了解[区块提交状态](/monad-arch/consensus/block-states)以及您正在使用的实时数据协议如何传达区块状态的变化。

例如，对于 Monad WebSocket 扩展源，[此部分](/reference/websockets#monadnewheads-and-monadlogs)解释了如何为 `monadNewHeads` 订阅宣布区块 ID 和提交状态。本文档页面解释了如何使用执行事件完成此操作。

## 区块标签

如[此处](/monad-arch/realtime-data/spec-realtime#block-numbers-and-block-ids)所述，在最终确定之前，必须通过其唯一 ID 识别区块。即便如此，知道提议的区块编号通常很有用，即使在我们知道区块是否会以该编号提交之前。以下结构——称为"区块标签"——作为字段出现在多个执行事件载荷类型中，用于同时传达区块 ID 和（提议的）区块编号。

```text
struct monad_exec_block_tag
{
    monad_c_bytes32 id;    ///< Monad consensus unique ID for block
    uint64_t block_number; ///< Proposal is to become this block
};
```

## 四个共识事件

四个[区块提交状态](/monad-arch/consensus/block-states)对应于四种执行事件类型。发布这些类型的事件是为了宣布特定区块正在进入新的提交状态。

### 第一个共识事件：**`BLOCK_START`**（*proposed* 提议状态）

```c
/// Event recorded at the start of block execution
struct monad_exec_block_start
{
    struct monad_exec_block_tag
        block_tag;                      ///< Execution is for this block
    uint64_t block_round;               ///< Round when block was proposed
    uint64_t epoch;                     ///< Epoch when block was proposed
    monad_c_bytes32 parent_eth_hash;    ///< Hash of Ethereum parent block
    monad_c_uint256_ne chain_id;        ///< Block chain we're associated with
    struct monad_c_eth_block_exec_input
        exec_input;                     ///< Ethereum execution inputs
};
```

EVM 记录的第一个事件是 `BLOCK_START` 事件，其事件载荷包含一个 `block_tag` 字段，该字段引入区块的唯一 ID 以及如果最终确定它最终将拥有的区块编号。

几乎所有执行事件（交易日志、调用帧、收据等）都发生在 `BLOCK_START` 和 `BLOCK_END` 事件之间。在当前实现中，区块执行从不流水线化，因此 `BLOCK_START` 和 `BLOCK_END` 之间的所有事件都与单个区块有关，并且在当前区块结束之前不会有另一个 `BLOCK_START`。

与此列表中的其他事件不同，`BLOCK_START` 既是"共识事件"（意味着关联的区块处于提议状态），又是"EVM 事件"，因为有关区块的执行信息正在提供给您。

此列表中的其他事件不是这样的。它们是"纯"共识事件：它们告诉您在您已经看到所有 EVM 事件之后，提议的区块在共识算法中发生了什么。

要了解此状态的含义，请参见[此处](/monad-arch/realtime-data/spec-realtime#first-commit-state-proposed)。

注意
区块没有理由*必须*在提议状态下开始。如果执行落后于共识，则区块可能已经在共识算法中前进到更晚的状态。例如，假设共识已经在一个区块上工作了一段时间，而当执行最终看到它时，共识可能知道它已经进展到投票状态。

然而，在当前实现中，执行不会知道这一点。它隐式地认为它执行的所有内容都只是被提议的。这只有在执行没有落后的情况下才是字面上正确的。

### 第二个共识事件：**`BLOCK_QC`**（*voted* 投票状态）

```c
/// Event recorded when a proposed block obtains a quorum certificate
struct monad_exec_block_qc
{
    struct monad_exec_block_tag
        block_tag;              ///< QC for proposal with this block
    uint64_t round;             ///< Round of proposal vote
    uint64_t epoch;             ///< Epoch of proposal vote
};
```

当具有给定标签的区块被投票时，会发布此类型的事件来宣布它。要了解看到此事件的所有含义，请参见[此处](/monad-arch/realtime-data/spec-realtime#second-commit-state-voted)。

### 第三个共识事件：**`BLOCK_FINALIZED`**（已最终确定）

```c
/// Event recorded when consensus finalizes a block
typedef struct monad_exec_block_tag monad_exec_block_finalized;
```

已最终确定事件载荷没有任何不属于区块标签一部分的信息，因此载荷只是被最终确定的区块的标签。要了解看到此事件的所有含义，请参见[此处](/monad-arch/realtime-data/spec-realtime#third-commit-state-finalized)。

### 第四个共识事件：**`BLOCK_VERIFIED`**（已验证）

```c
/// Event recorded when consensus verifies the state root of a finalized block
struct monad_exec_block_verified
{
    uint64_t block_number; ///< Number of verified block
};
```

共识算法为区块产生最后一个事件，称为 `BLOCK_VERIFIED`。这次，仅通过其区块编号识别区块就足够了。因为已验证的区块已经最终确定，它们是规范区块链的一部分，并且在没有硬分叉的情况下无法恢复。因此，我们不再需要区块标签。

要了解看到此事件的所有含义，请参见[此处](/monad-arch/realtime-data/spec-realtime#fourth-commit-state-verified)。
