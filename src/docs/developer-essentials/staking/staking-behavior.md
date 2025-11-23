# 质押行为

## 用户概览

Monad 使用质押来确定 [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft) 中的投票权重和出块者调度。验证者必须质押至少最小数量的代币，其他人也可以向他们委托。

当产生一个区块时，产生该区块的出块者获得区块奖励，该奖励按照每个委托者在该出块者质押中的比例分配给该出块者的每个委托者，减去佣金。

作为用户，您需要了解以下内容：

| 功能                      | 详情                                                                  |
| ----------------------- | ------------------------------------------------------------------- |
| 协议内委托                 | 支持                                                                  |
| 验证者佣金                 | 每个验证者设置一个固定百分比的区块奖励作为自己的佣金，然后按质押比例分享剩余奖励。您应该选择一个您信任且佣金合理的验证者。最低佣金为 0%，最高佣金为 100%。 |
| 奖励来源                  | 出块者成功提议区块获得的奖励来自两个组成部分：(1) 来自通胀的固定奖励（`REWARD`），以及 (2) 区块中所有交易的优先费用。 |
| 通胀奖励                  | 固定奖励（`REWARD`）在扣除验证者佣金后，在该验证者的所有委托者之间分配。作为委托者，您获得剩余部分的比例就是您在该验证者总质押中的比例。例如：如果您委托给一个验证者并占该验证者总质押的 20%，该区块的奖励为 10 MON，佣金为 10%，那么您将获得 10 MON * 90% * 20% = 1.8 MON。 |
| 优先费用                  | 目前，优先费用只归验证者所有。验证者可以选择通过质押预编译上的 [`externalReward`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#externalreward) 方法将其优先费用捐回给委托者（包括自己）。 |
| 边界区块                  | 在每个边界区块，质押变更和相关的验证者集合被提交到下一个时期。连续的边界区块之间间隔 50,000 个**区块**（大约 20,000 秒或 5.5 小时，不计超时）。 |
| 时期                     | 在边界区块之后经过 `EPOCH_DELAY_PERIOD` 个**轮次**，下一个时期将以在边界区块拍摄的快照开始。虽然您可以随时发起质押操作如（取消）委托，但这些操作只在新时期开始时生效。注意轮次不是区块 - 无论是否错过提议，轮次都会递增。时期不能通过区块或轮次号的任何模运算推断，用户应通过 [`getEpoch`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#getepoch) 查询此信息。 |
| 质押激活                  | 在时期 `n` 中进行的新委托在时期 `n+1` 开始时生效（如果在边界区块之前提交）或时期 `n+2`（如果未在边界区块前提交）。 |
| 质押停用                  | 在时期 `n` 中取消质押的代币在时期 `n+1` 开始时失效（如果在边界区块之前提交）或时期 `n+2`（如果未在边界区块前提交）。失效后，此质押进入待定状态 `WITHDRAWAL_DELAY` 个时期，之后才可提取。当可提取时，您必须提交 `withdraw` 命令将 MON 转回您的账户。 |
| 奖励领取/复投               | 每个委托都会累积奖励。您可以选择领取或复投任何累积的奖励。领取的奖励会提取到您的账户，而复投的奖励会添加到您的委托中。 |
| 活跃验证者集合              | 验证者必须自我委托最低金额（`MIN_VALIDATE_STAKE`），必须有至少一定数量的总委托（`ACTIVE_VALIDATOR_STAKE`），并且必须按质押权重位列前 `NUM_ACTIVE_VALIDATORS` 名验证者中，才能成为活跃验证者集合的一部分。 |

## 常量

| 常量                                                     | 含义                                                      | 值         |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------- |
| `EPOCH_LENGTH`[1](https://docs.monad.xyz/developer-essentials/staking/staking-behavior#user-content-fn-1) | 时期长度                                                 | 50,000 区块 |
| `EPOCH_DELAY_PERIOD`[2](https://docs.monad.xyz/developer-essentials/staking/staking-behavior#user-content-fn-2) | 边界区块和每个时期结束之间的轮次数 | 5,000 轮次  |
| `WITHDRAWAL_DELAY`                                           | 取消质押的代币可以提取之前的时期数     | 1 时期       |
| `MIN_VALIDATE_STAKE`                                         | 验证者自我委托的 MON 最低金额，以便有资格进入活跃集合 | TBD           |
| `ACTIVE_VALIDATOR_STAKE`                                     | 验证者质押的 MON 最低金额，以便有资格进入活跃集合 | TBD           |
| `ACTIVE_VALSET_SIZE`                                         | 活跃集合中的验证者数量                       | 200           |
| `REWARD`                                                     | 每区块的 MON 奖励                                         | TBD           |

值得注意的是，`EPOCH_LENGTH` 以**区块**为单位计算，而 `EPOCH_DELAY_PERIOD` 以**轮次**为单位计算。如果达到完美共识，它们将以相同的速率递增。但是，在区块提议失败（例如超时）时，轮次会递增但区块不会。

## 共识和执行

Monad 节点分为共识和执行组件。验证者集合由执行组件维护；所有与质押相关的状态变更都会在执行系统中排队并确定性地应用。当满足预定义的区块最终确认标准时，这些变更的结果会被共识组件接受。

### 定义

考虑下面的时间线，它跨越数十万个[轮次](https://docs.monad.xyz/monad-arch/consensus/monad-bft#round)（MonadBFT 中每轮次为 400 毫秒）：

![显示边界区块在时期内放置的时间线](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/staking-timeline-d66f162b241ec5402250e8bca4777e80.png)

**A. 时期（Epoch）**：验证者集合保持不变的轮次范围。

- 在上图中，时期是区间 `[0, 1]`、`[1, 2]`、`[2, 3]` 等等。我们通过起始索引引用它们；例如，时期 `0` 是 `[0, 1]`。

**B. 边界区块（Boundary block）**：标记时期结束起始点的区块。时期不在边界区块结束；边界区块在下一个时期开始前就已经最终确认。

- 在上图中，区块 `a`、`b`、`c` 和 `d` 分别是时期 `0`、`1`、`2`、`3` 的边界区块。

**C. 时期延迟期（Epoch delay period）**：边界区块和下一个时期起始轮次之间的时间段，包含 `EPOCH_DELAY_PERIOD` 个轮次。

- 在上图中，时期 `0` 的时期延迟期是 `[a, 1]`。
- 注意：质押预编译有一个布尔值 `in_epoch_delay_period`，指示当前轮次是否在时期延迟期内。

**D. 快照间隔（Snapshot interval）**：两个连续边界区块之间的范围。快照间隔中的所有质押请求在终端边界区块后的下一个时期生效。

- 在上图中，快照间隔是 `[a, b]`、`[b, c]`、`[c, d]`。

质押合约维护验证者集合的三个视图：

**A. 执行视图（Execution view）**

- Monad 客户端的执行组件负责奖励和委托。这些操作在每个区块上实时处理，形成执行视图。
- 每个快照间隔中的操作在下一个边界区块时应用。

**B. 共识视图（Consensus view）**

- 共识视图是在边界区块拍摄的执行视图的冻结副本。
- 在时期 `n` 的边界区块形成的共识视图的静态验证者集合将是在 `EPOCH_DELAY_PERIOD` 轮次后开始的时期 `n+1` 的有效验证者集合。

**C. 快照视图（Snapshot view）**

- 快照视图是先前的共识视图。在时期延迟期间，这对于共识是必需的。

### 状态变更直觉

下面是质押模块中交易生命周期的直观示例。假设我们固定时期 `n` 中的快照间隔 `m`。

**1. 边界区块之前**

- 在边界区块之前，各种交易调用 [`addValidator`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#addvalidator)、[`delegate`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#delegate)、[`undelegate`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#undelegate)、[`syscallReward`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallreward)、[`syscallOnEpochChange`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallonepochchange) 和 [`syscallSnapshot`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallsnapshot) 操作。
- 这些请求立即更新验证者集合的执行视图。
  - `addValidator`、`delegate`、`undelegate` 和 `syscallSnapshot` 影响下一个时期 `n+1` 的共识。
  - `syscallReward` 和 `syscallOnEpochChange` 对当前时期 `n` 的执行产生影响。

**2. 边界区块**

- 在边界区块时，调用 [`syscallSnapshot`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallsnapshot)，更新验证者的共识视图。
- 该视图是能够在时期 `n+1` 期间参与共识的验证者集合。

**3. 时期延迟期间**

- 在时期延迟期间，交易可以调用 [`addValidator`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#addvalidator)、[`delegate`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#delegate)、[`undelegate`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#undelegate) 和 [`syscallReward`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallreward)。
- 这些请求发生在快照间隔 `m+1` 中。因此它们直到时期 `n+2` 才会对共识视图产生影响。

**4. 边界区块后 `EPOCH_DELAY_PERIOD` 轮次**

- 时期 `n+1` 开始。
- 验证者集合的共识视图现在是时期 `n` 中快照的共识视图。
- 验证者集合的快照视图现在是时期 `n-1` 中验证者集合的共识视图。
- 验证者集合的执行视图是最新的。

## 惩罚（Slashing）

强大的日志记录为恶意、可惩罚的违规行为提供了问责机制。但是，协议内的自动惩罚目前尚未实现。

## 脚注

1. testnet-2 目前运行 `EPOCH_LENGTH = 5000` [↩](https://docs.monad.xyz/developer-essentials/staking/staking-behavior#user-content-fnref-1)
2. testnet-2 目前运行 `EPOCH_DELAY_PERIOD = 500` [↩](https://docs.monad.xyz/developer-essentials/staking/staking-behavior#user-content-fnref-2)