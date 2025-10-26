# 储备余额

## 简介

**储备余额**机制是一组轻量级约束——在共识时对可包含哪些交易进行约束，在执行时对哪些交易不会回滚进行约束——使得 Monad 能够同时支持[异步执行](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution)和 [EIP-7702](https://docs.monad.xyz/developer-essentials/eip-7702)。

储备余额机制旨在异步执行下保持安全性，同时不干扰正常使用模式。**大多数用户和开发者无需担心储备余额约束**，但我们在此提供详细信息以供遇到边缘情况时参考。

## 概述

异步执行意味着节点在执行该区块中的交易之前先对区块提案达成共识。执行需要在接下来的 `k`(延迟因子)个区块内完成。(当前 `k=3`。)

由于共识基于全局状态的 `k` 区块延迟视图进行操作,因此需要稍微调整共识和执行规则,以允许共识安全地构建和验证区块,确保只包含其 gas 成本能够被支付的交易。

Monad 引入**储备余额**机制,使共识和执行能够跨多区块延迟协作,确保所有 EOA 必须在其账户中拥有足够的 MON 来支付区块链中包含的任何交易的 gas 费用。

飞行中交易

在本文档中,**飞行中交易**是指在少于 `k` 个区块之前被包含在区块中的交易,即尚未反映在延迟状态中的交易。

以下是规则的简要概述:

- 从特定 EOA 的角度来看,该 EOA 在交易过程中花费的 MON 被分为两部分:

  gas 花费和执行花费

  - 当 EOA 是发送者时,**gas 花费**为 `gas_price * gas_limit`,**执行花费**为该交易的 `value` 参数
  - 当 EOA 不是发送者时(通过 EIP-7702 委托,其他 EOA 提交了调用此 EOA 的交易),**gas 花费**为 0,**执行花费**为在执行此 EOA 代码过程中发送出去的 MON
  
- 设 `user_reserve_balance = 10 MON`

- *执行时*:在执行期间,当账户余额降至 `user_reserve_balance` 以下时,交易会因**执行花费**而回滚。但有一个例外(即交易不会回滚):对于在过去 `k` 个区块内没有待处理交易的未委托账户。

- *共识时*:对于每个账户,共识对所有飞行中交易的**gas 花费**有一个预算;该预算为 `user_reserve_balance`(或延迟执行状态中的账户余额,取较低者)。如果第一笔飞行中交易获得了上述例外,则预算会进一步减少。在对区块 `n` 执行区块有效性检查时,共识检查所有飞行中交易的 gas 花费总和是否小于预算。

信息

另请参阅 Category Labs 的 [Monad 初始规范](https://category-labs.github.io/category-research/monad-initial-spec-proposal.pdf)提案中的正式定义。

## 参数

| 参数                   | 值     |
| ---------------------- | ------ |
| `user_reserve_balance` | 10 MON |

## 为什么需要储备余额?

Monad 具有异步执行:共识可以在不等待执行跟上的情况下继续构建和验证区块。具体来说,提议和验证共识区块 `n` 只需要应用区块 `n-k` 后获得的状态知识。

虽然异步执行具有性能优势,但它引入了一个新挑战:如果共识没有最新状态,它如何知道区块的有效性?

让我们用一个例子来说明这个挑战(在我们的例子中,我们将使用 `k = 3`):

共识正在验证区块 4,其中包含来自 Alice 的交易 `t`,相关字段为:

```text
sender=Alice, to=Bob, value=100, gas=1
```



共识只有执行区块 1 后获得的状态:

```text
block=1, balances={Alice: 110}
```



如果共识仅仅因为 Alice 看起来有足够余额就接受区块 4 为有效,则存在安全失败风险。例如,Alice 可能已经在区块 2 的交易 `t'` 中花费了她的余额。这会造成拒绝服务(DoS)攻击向量,因为 Alice 可以导致共识免费包含许多交易。

## 第一次尝试解决方案

一个想法是让共识客户端静态检查区块 2 及之后的交易,检查 Alice 是否在其交易中花费了任何价值。如果在 `t` 之前的任何交易(如 `t'`)在区块 2、3 或 4 中源自 Alice 并花费了一些价值或 gas,这将使共识拒绝区块 4 为无效。

虽然表面上这是一个不错的解决方案,但它存在两个缺陷:

1. 假设作为区块 2 或 3 中智能合约执行的一部分,Alice 收到了大量货币。如果我们有最新状态,尽管存在 `t'`,她仍会有足够的余额支付交易 `t`。因此,仅基于静态检查拒绝交易过于严格。
2. 它不仅限制性强,而且在 EIP-7702 下也不安全。通过 EIP-7702,Alice 可以将其账户委托给智能合约,该合约可以以共识无法静态检查的方式从 Alice 的账户转出货币。具体在我们的例子中,如果 Alice 的账户被委托,她不需要从其账户发送像 `t'` 这样的交易就能从其账户花费货币。支出可能由其他任何人提交的交易触发。因此,即使我们在区块 2、3 和 4 中没有看到来自 Alice 的任何其他交易,我们的静态检查也不会成功,接受区块 4 为有效可能是不安全的。

## 储备余额作为解决方案

### 简单版本

直观上,储备余额的核心思想如下:如果共识和执行事先约定,对于每个 EOA,执行将防止账户余额降至共识已知的某个预定阈值以下,那么共识就可以安全地包含其 gas 支出低于该阈值的交易,而无需知道最新状态,也不会受到上述 DoS 攻击向量的影响。

在我们的例子中,如果执行确保 Alice 的账户不能降至 10 MON 以下(否则,提款交易将被回滚),那么共识可以安全地包含交易 `t`,因为根据定义,Alice 的账户将至少有 10 MON 来支付交易 `t`。

这个概念可以概括如下:

1. 共识在延迟状态 `s` 之后接受来自用户 `u` 的交易,只要由 `u` 发送的所有飞行中交易的 gas 费用总和低于名为 `user_reserve_balance` 的参数。
2. 执行回滚任何导致账户余额降至 `user_reserve_balance` 以下的交易,交易费用除外。

在 Monad 中,每个 EOA 的 `user_reserve_balance` 当前设置为 `10 MON`。

### 改善用户体验的额外改进

对上述规则的一个批评是,余额低于储备的用户很难做除 gas 费用之外需要 MON 的任何事情。

例如,可能需要以下行为,但目前被上述规则阻止(将 `user_reserve_balance` 设置为 `10 MON`):

- Alice 余额为 5 MON,想向 Bob 发送 4.99 MON(加上支付 0.01 MON gas 费)
- Alice 余额为 20 MON,想将 18 MON 兑换成 memecoin(加上支付 0.01 MON gas 费)

为了解决这个问题,我们添加了一些允许交易的额外条件。

首先让我们定义"清空交易":

清空交易

**清空交易**是指(在执行时评估时)可能使余额降至储备余额以下的交易。

请注意,如果用户账户未通过 EIP-7702 委托,那么共识可以简单地静态检查交易,以估计用户余额可能达到的最低值(因为未委托用户的账户只能因交易数据中指定的价值转移和 gas 费用而被扣款)。

因此,我们添加以下规则:

1. *执行策略*:对于每个未委托账户发送者,如果交易是该发送者的第一笔飞行中交易,并且该交易本来会因为是"清空交易"而回滚,则仍然允许该交易继续。
2. *共识策略*:对于每个未委托账户发送者,如果交易是该发送者的第一笔飞行中交易,则静态检查该交易的总 MON 需求(即 `gas_bid * gas_limit + value`),并且——如果这将最终成为"清空交易"——考虑执行仍将允许此交易通过的事实。这意味着对于接下来 `k` 个区块中的任何后续交易,共识使用的储备余额将更低。

此规则允许执行每 `k` 个区块一次让未委托账户降至储备余额以下。由于 `k` 个区块是 1.2 秒,此策略应该允许大多数小账户仍然正常与区块链交互。

额外的策略允许本节开头提到的两个示例,只要它们是发送者在 `k` 个区块内发送的第一笔交易。

## 被包含但回滚的交易

由于储备余额规则,您可能会看到*包含*在链中但执行*回滚*的交易,例如试图转出超过账户余额的 MON 的交易。

这些交易仍然是支付 gas 费的*有效*交易,但这些交易的*结果*只是从发送者扣除 gas 费用。它们被包含是因为在共识时,提议者无法确定账户是否会从其他人那里收到更多 MON,并且发送者有预算支付 gas。

以太坊包含许多执行回滚的交易,因此这不是协议差异。然而,在实践中,以太坊区块构建者可能会筛选出余额不足以处理转出的交易,因此这种行为可能与您习惯看到的不同。

## 完整规范

参见[储备余额规范](https://category-labs.github.io/category-research/monad-initial-spec-proposal.pdf)获取储备余额规则的正式集合。

算法 1 和 2 分别为共识和执行实现此检查。

算法 3 实现检测降至储备余额的机制(算法 2 使用算法 3 回滚降至储备余额的交易)。

算法 4 指定清空交易的标准:

- 发送者账户在前 `k` 个区块中必须是未委托的。这通过静态验证账户在过去 `k` 个区块中的已知状态中是未委托的,并且在最后 `k` 个区块中其委托状态没有变化(可以静态检查)来检查。
- 在前 k 个区块中不得有来自同一发送者的另一笔交易。

以下是共识时储备余额规则的快速摘要:

#### 如果账户未委托且没有飞行中交易

如果账户未委托,并且没有先前的飞行中交易,则共识检查此交易的 gas 费用是否小于延迟状态中的余额。

gas_fees(tx)≤balance

#### 如果账户未委托且有一笔清空飞行中交易

如果账户未委托,并且有一笔先前的飞行中交易,则共识必须考虑该飞行中交易的总 MON 支出(包括 `value`):

$\text{let adjusted\_balance} = \text{balance} - (\text{first\_tx.value} + \text{gas\_fees}(\text{first\_tx}))$

$\text{let reserve} = \min(\text{user\_reserve\_balance}(t.\text{sender}), \text{adjusted\_balance})$

只有当所有飞行中交易的 gas 费用总和(不包括第一笔)小于储备时,才能包含新交易:

$\sum_{tx \in I[1:]} \text{gas\_fees}(tx) \leq \text{reserve}$

#### 所有其他情况

储备等于系统范围储备余额(`10 MON`)或区块 `n - k` 处账户余额的最小值:

$\text{reserve} = \min(\text{user\_reserve\_balance}(t.\text{sender}), \text{balance})$

只有当所有飞行中交易的 gas 费用总和小于储备时,才能包含新交易:

$\sum_{tx \in I} \text{gas\_fees}(tx) \leq \text{reserve}$

## 调整储备余额

储备余额目前对每个账户都相同(`10 MON`)。在未来版本中,协议可以允许用户通过有状态预编译自定义其储备余额。

## Coq 证明

储备余额规范的安全性已在 Coq 中得到正式证明。

完整的证明文档可在[此处](https://category-labs.github.io/category-research/reserve-balance-coq-proofs)获得。

共识检查在 Coq 中形式化为 `consensusAcceptableTxs`。谓词 `consensusAcceptableTxs s ltx` 定义了共识模块在状态 `s` 之上接受交易列表 `ltx` 的标准。

执行模块在 Coq 中形式化为 `execAcceptableTxs`。谓词 `execAcceptableTxs s ltx s'` 确保在状态 `s` 之上执行交易列表 `ltx` 后产生的状态 `s'` 符合储备余额约束,并且不包含因违反这些约束而回滚的交易。

证明声明,对于任何交易列表 `ltx`,如果共识认为其可接受,则执行也会认为其可接受,即一旦列表被共识接受,执行状态就不会违反储备余额约束:
`consensusAcceptableTxs s ltx -> execAcceptableTxs s ltx s'`
 
## 示例

以下示例说明了储备余额机制在实践中的行为,假设 `k=3`。

对于每笔交易,我们显示预期结果:

- **2**: 包含并成功执行
- **1**: 包含但回滚
- **0**: 被共识排除

### 示例 1: 基本交易包含

初始状态:

```text
Alice: balance = 100, reserve = 10
Bob: balance = 5, reserve = 10
```



交易:

```text
Block 2: [
  Alice: send 1 MON, fee 0.05 — Expected: 2
  Bob: send 2 MON, fee 0.05 — Expected: 2
]
```



最终余额:

```text
Alice: 98.95
Bob: 2.95
```



### 示例 2: 低储备余额但高余额

初始状态:

```text
Alice: balance = 100, reserve = 1
```



交易:

```text
Block 2: [
  Alice: send 3 MON, fee 2 — Expected: 2 (清空交易)
  Alice: send 3 MON, fee 2 — Expected: 0 (被排除)
]
```



最终余额:

```text
Alice: 95.0
```



### 示例 3: 多区块、低储备但高余额

初始状态:

```text
Alice: balance = 100, reserve = 1
```



交易:

```text
Block 2: [
  Alice: send 3 MON, fee 2 — Expected: 2
]


Block 5: [
  Alice: send 3 MON, fee 2 — Expected: 2
]
```



最终余额:

```text
Alice: 90.0
```



### 示例 4: 综合示例

初始状态:

```text
Alice: balance = 100, reserve = 1
```



交易:

```text
Block 2: [
  Alice: send 99 MON, fee 0.1 — Expected: 2 (大额清空交易)
]


Block 3: [
  Alice: send 0.5 MON, fee 0.99 — Expected: 0 (被排除)
]


Block 4: [
  Alice: send 0.8 MON, fee 0.1 — Expected: 1 (包含但回滚)
]


Block 5: [
  Alice: send 0 MON, fee 0.9 — Expected: 0 (被排除)
  Alice: send 5 MON, fee 0.1 — Expected: 1 (包含但回滚)
  Alice: send 5 MON, fee 0.8 — Expected: 0 (被排除)
]
```



最终余额:

```text
Alice: 0.70
```



### 示例 5: 边缘情况 — 零价值交易

初始状态:

```text
Alice: balance = 2, reserve = 1
```



交易:

```text
Block 2: [
  Alice: send 0 MON, fee 0.5 — Expected: 2
  Alice: send 0 MON, fee 0.6 — Expected: 2
  Alice: send 0 MON, fee 0.5 — Expected: 0 (超出储备)
]
```



最终余额:

```text
Alice: 0.9
```



### 示例 6: 储备余额边界

初始状态:

```text
Alice: balance = 10, reserve = 2
```



交易:

```text
Block 2: [
  Alice: send 1 MON, fee 2 — Expected: 2 (匹配储备)
  Alice: send 0 MON, fee 0.01 — Expected: 2
]
```



最终余额:

```text
Alice: 6.99
```