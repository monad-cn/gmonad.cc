# MonadBFT 

### 摘要

MonadBFT 代表了拜占庭容错（BFT）共识机制的重大飞跃。该技术核心使命是确保 Monad 网络能够高效安全地对有效提议区块达成共识，同时实现每秒 10,000+ 交易的处理能力、亚秒级最终确认时间，并支持大规模共识节点集。

MonadBFT 在集成所有这些特性的同时，还具备对**尾部分叉攻击**的抵御能力——这是流水线领导者型 BFT 协议的关键弱点，即恶意领导者可通过分叉破坏前序区块的致命缺陷。

如需获得完整技术说明和深度技术解析，请参阅 Category Labs 发布的[完整研究论文](https://arxiv.org/abs/2502.20692)或[技术博客](https://www.category.xyz/blogs/monadbft-fast-responsive-fork-resistant-streamlined-consensus)。


MonadBFT 核心成就：
- 单轮达成推测性最终确认，两轮实现完全最终确认
- 正常运行时保持线性级消息复杂度与验证器复杂度，支持共识集扩展至数百节点
- 乐观响应能力：无论在常规运行还是故障轮次恢复过程中，均无需等待最坏网络延迟即可推进轮次
- 尾部分叉抵御：内置防护机制有效对抗尾部分叉攻击（某类最大可提取价值攻击），从根本上解决了先前流水线领导者型 BFT 共识机制中恶意领导者可篡改前序区块的关键漏洞

目前尚无其他流水线领导者型 BFT 协议能同时集成所有上述突破性特性。

> 注意
> Category Labs 近期对 MonadBFT 实施了多项重要升级。完整细节即将在本文档及研究论文中更新，您可先在[协议更新](https://docs.monad.xyz/monad-arch/consensus/monad-bft#protocol-updates)章节查看核心改进摘要。


### Monad 配置

|  |  |
| :--- | :--- |
| 女巫攻击抵抗机制 | 权益证明 |
| 最小出块时间 | 400 毫秒 |
| 最终确定性 | 2 个区块时间（800 毫秒） |
| 推测性最终确定性（仅在[极少数情况](https://docs.monad.xyz/monad-arch/consensus/monad-bft#speculative-finality)下，如原始领导者出现双签时才可能回滚） | 1 个区块时间（400 毫秒） |
| 是否允许委托 | 是 |


### Demo

欢迎前往 Category Labs 的[博客文章](https://www.category.xyz/blogs/monad-viz-a-visual-representation-of-monadbft)，亲身体验 MonadBFT 的实时演示！

该演示运行的是与现网 Monad 区块链完全相同的 `monad-bft` 实现，它已被编译为 Wasm 格式，并可在您的浏览器中通过模拟框架 (`mock-swarm`) 直接运行。


### 通用概念

要理解 MonadBFT，首先需要明确几个核心概念。我们先从许多 BFT 机制共有的概念开始：

#### 拜占庭容错阈值
按照惯例，假设系统共有 n = 3f + 1 个节点，其中 f 代表拜占庭（故障）节点的最大数量。这意味着有 2f + 1（即 2/3）的节点是非拜占庭节点。在下面的讨论中，我们默认所有节点的权益权重相同；实际应用中，所有阈值都可以通过权益权重而非节点数量来表示。

#### 绝对多数
指总权益权重的 2/3。

#### 轮次
协议按轮次（也称为视图）推进。无论提案是否成功，每完成一个协议步骤，轮次编号都会增加 1。

#### 领导者
每个轮次都有一名领导者，负责提出提案的权限。领导者按照预先根据权益权重确定的调度方案，在每轮中进行轮换。

#### 区块
一个区块由以下部分组成：有效载荷（一组有序的交易列表）、一个 [QC（法定人数证书）](https://docs.monad.xyz/monad-arch/consensus/monad-bft#quorum-certificate-qc) 和一个区块号。区块的号是其父区块号加 1。由于某些轮次可能未能成功出块，因此区块号总是小于或等于轮次号。

#### 提案
一个提案包含以下内容：当前轮次号、一个区块、一个可选的 [TC（超时证书）](https://docs.monad.xyz/monad-arch/consensus/monad-bft#timeout-certificate-tc)、一个可选的 [NEC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-endorsement-message-and-no-endorsement-certificate)，以及针对上述所有元素的（提案领导者的）签名。在简单情况下，可选字段为空，提案基本就是一个签过名的区块。

#### 线性通信
每个轮次都遵循「扇出-扇入」模式。领导者将其提案发送给每个验证者（使用 [RaptorCast](https://docs.monad.xyz/monad-arch/consensus/raptorcast) 实现高效广播）。验证者评估该提案，并将签名投票直接发送给下一任领导者。这种线性通信机制依赖于其他协议所使用的全对全（平方级）通信，它使得共识集能够进行扩展。

#### 法定人数证书（QC）
验证者评估每个提案的有效性，并将他们的投票发送给下一任领导者。如果下一任领导者收到绝对多数（Supermajority）的「赞成」票，则会将它们聚合成该提案的一个法定人数证书。QC 证明了网络中有 2/3 的节点接收了该提案并投了赞成票。

尽管这更多属于实现细节，但值得指出的是：在 Monad 的 MonadBFT 实现中，验证者使用 [BLS 签名](https://en.wikipedia.org/wiki/BLS_digital_signature)进行签署，因为这类签名能够被高效聚合，这使得对 QC 的签名验证成本相对较低。区块


### MonadBFT 相对特有的概念

以下是 MonadBFT 相对特有的一些概念。我们将它们单独列出以便于理解。

#### 新提案
新提案是指包含新区块的[提案](https://docs.monad.xyz/monad-arch/consensus/monad-bft#proposal)，即不受先前失败提案影响的提案。

 一个新提案将满足以下条件之一：
- 其轮次号等于其 [QC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#quorum-certificate-qc) 的轮次号加 1（常见情况——顺利路径）
- 或具有非零的 [NEC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-endorsement-message-and-no-endorsement-certificate)（罕见情况——在非顺利路径中，重新提案被覆盖）

#### 重新提案
重新提案是指包含先前新提案中的区块，并由当前领导者尝试恢复或最终确认的[提案](https://docs.monad.xyz/monad-arch/consensus/monad-bft#proposal)。重新提案的轮次号将大于其 [QC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#quorum-certificate-qc) 的轮次号加 1。

#### Tip
Tip 是提案的简化版本。您可以将其视为提案的区块头加上一些额外的元数据，包括接收到该提案的轮次号。

在 MonadBFT 中，每个验证者都会跟踪其接收到的最新有效新提案的 Tip。

#### High Tip
给定一组 Tip 后，High Tip 就是其中具有最高轮次号的 Tip。


#### 超时消息
超时消息是验证者在预期时间内未收到预定领导者的有效区块时，所生成的一种带签名的证明。该消息用于证实未能收到有效区块的情况。

每个验证者会通过全对全通信方式，将超时消息发送给所有其他验证者。

超时消息在其他 BFT 协议中也有应用。在 MonadBFT 中，超时消息额外包含了发送者的 [Tip](https://docs.monad.xyz/monad-arch/consensus/monad-bft#tip) —— 这一反映其当前网络视图的附加信息，将帮助 MonadBFT 在发生超时后更顺畅地实现状态恢复。

#### 超时证书（TC）
当发生超时情况时，验证者开始相互收发[超时消息](https://docs.monad.xyz/monad-arch/consensus/monad-bft#timeout-message)。每个验证者会累积收到的超时消息；若累积到绝对多数的此类消息，便会构建出一个超时证书。

TC 中包含了所有贡献超时消息的验证者所提供的 Tip 信息，同时也会计算出其中的最高 [Tip](https://docs.monad.xyz/monad-arch/consensus/monad-bft#high-tip)。

#### 未背书消息与未背书证书
在某些情况下，领导者会向其他验证者请求获取与某个 Tip 对应的完整提案（即区块）。如果验证者没有该提案，则会回复一份签名的未背书消息以作证明。

如果领导者在尝试恢复某个 Tip 的提案时，收到了绝对多数的未背书消息，便可据此生成一份未背书证书——这成为网络中绝大多数节点均未持有该提案的确凿证明。


### 由 MonadBFT 决定的区块状态

在 MonadBFT 机制下，区块可能处于以下三种状态之一：
1. 已提议
2. 已投票
3. 已最终确定

正如在[区块状态](https://docs.monad.xyz/monad-arch/consensus/block-states)部分所提到的，这三个状态是区块在整个 Monad 系统中可能经历的四种状态中的三种。（第四个状态——“已验证”，是在 MonadBFT 之外通过[异步执行](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution)来实现的。）

下文我们将描述区块如何在这些状态间推进。


### 顺利路径

顺利路径描述了一个区块从被提议到最终确定，期间未发生任何超时或轮次失败的常规流程。

#### 场景说明
为阐述顺利路径的运行流程，我们将遵循下图所示的场景展开说明。

当前处于[轮次](https://docs.monad.xyz/monad-arch/consensus/monad-bft#round) K，预定[领导者](https://docs.monad.xyz/monad-arch/consensus/monad-bft#leader)为 Alice。Bob 与 Charlie 是后续两个轮次的预定领导者。Alice 最新处理过的[区块](https://docs.monad.xyz/monad-arch/consensus/monad-bft#block)是 N-1，因此她将提议新区块 N。

![MonadBFT Happy Path](./images/monadbft_happypath.png)

MonadBFT 的运行流程如下：

#### 第 `K` 轮：Alice 的提案
1. **提案阶段**：Alice 作为第 `K` 轮的指定领导者，从内存池中选择交易列表作为有效负载，并构建区块 `N`（该区块包含有效负载及前一轮提案的 QC（此部分细节暂不展开））。Alice 将该区块组成的提案直接发送给所有其他验证者。
2. **投票阶段**：各验证者检查 Alice 提案的有效性。若提案有效，验证者会将签名投票直接发送给第 `K+1` 轮的指定领导者 Bob，同时将区块 `N` 标记为[已提案](https://docs.monad.xyz/monad-arch/consensus/block-states#proposed) 。
3. **QC 形成阶段**：Bob 在收到关于 Alice 提案的超多数投票后，将这些投票聚合成该提案的 [QC（法定人数证明）](https://docs.monad.xyz/monad-arch/consensus/monad-bft#quorum-certificate-qc)。

#### 第 `K+1` 轮：Bob 的提案
4. **提案阶段**：Bob 选择有效负载，将其与 Alice 提案的 [QC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#quorum-certificate-qc) 组合生成新区块，并发送给所有其他验证者。

5. **投票阶段**：各验证者检查 Bob 提案的有效性。若提案有效，验证者会将投票直接发送给第 `K+2` 轮的指定领导者 Charlie，同时将区块 `N` 标记为“已投票”（并将区块 `N+1` 标记为 [已提案](https://docs.monad.xyz/monad-arch/consensus/block-states#proposed)）。

此时意味着区块可被推测性最终确认。这种推测性最终性仅在特定罕见条件下才会回滚，且相关情形会伴随问责机制（[后续详述](https://docs.monad.xyz/monad-arch/consensus/monad-bft#speculative-finality)）。

6. **QC 形成阶段**：Charlie 在收到关于 Bob 提案的超多数投票后，将这些投票聚合成该提案的 [QC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#quorum-certificate-qc)。此 QC 也可视为 Alice 提案的“二次 QC”，因为它证明了超多数节点已收到关于 Alice 提案的 QC。

#### 第 `K+2` 轮：Charlie 的提案
7. **提案阶段**：Charlie 照例构建包含新有效负载和 Bob 提案 [QC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#quorum-certificate-qc) 的区块，并将提案发送给所有验证者。
8. **投票阶段**：各验证者检查 Charlie 提案的有效性。若提案有效，验证者会将投票直接发送给第 `K+3` 轮的指定领导者 David，同时将区块 `N` 标记为[已最终确认](https://docs.monad.xyz/monad-arch/consensus/block-states#finalized)（区块 `N+1` 标记为 [已投票](https://docs.monad.xyz/monad-arch/consensus/block-states#voted)，区块 N+2 标记为 [已提案](https://docs.monad.xyz/monad-arch/consensus/block-states#proposed)）。

虽然至此不再继续描述后续流程，但共识机制会持续循环运行。当验证者收到 David 的提案（包含 Charlie 提案的 QC，即 Bob 提案的二次 QC）时，即可将 Bob 的提案标记为`已最终确认`（Charlie 的提案标记为`已投票`），以此类推。

这凸显了 MonadBFT 的流水线化特性：每一轮都会共享新的有效负载和前一提案的 QC，使得父提案可被推测性最终确认，祖父提案可被完全最终确认。具体流程如下图所示：

![MonadBFT pipelining](./images/monadbft_pipelining.png)
*展现 MonadBFT 流水线化（交错推进）的特性。此图与前一图表相同，但通过拉远视角额外展示了一轮共识过程。*


### 异常情况（容错处理）
异常情况描述了两种非正常状态：要么是领导者未能发出有效提案，要么是QC构建者（即下一任领导者）未能成功生成QC。

理解异常处理机制对于掌握正常流程的运作同样至关重要！验证者之所以能在收到子提案后对原始提案进行推测性最终确认，或在收到孙提案后进行完全最终确认，其根本原因在于系统确知：即使出现异常，回退机制仍能保障原始提案的安全性。

#### 场景分析
我们将延续图示场景来阐述异常情况的处理流程。

假设当前处于第`K`轮，Alice是预定领导者，Bob与Charlie按计划是后续两轮的领导者。Alice最新确认的区块是`N-1`，因此她将提议区块`N`。

在本案例中，Alice在第`K`轮发出了区块`N`，但Bob在第`K+1`轮未能成功发出区块。这可能是因为他处于离线状态，也可能是因为Alice发出的区块无效，或是未获得足够多的投票支持。


![MonadBFT Unhappy Path](./images/monadbft_unhappypath.png)

#### 第 `K` 轮：Alice 的提案
1. **提案阶段**：Alice 作为第 `K` 轮的指定领导者，选择有效负载并构建区块 `N`（该区块包含有效负载及前一轮提案的 [QC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#quorum-certificate-qc)（同样暂不深究此细节））。

Alice 将提案直接发送给所有其他验证者。

2. **投票阶段**：各验证者检查提案有效性，若有效则将签名投票直接发送给第 `K+1` 轮指定领导者 Bob。各验证者在本地将 Alice 的提案标记为[已提案](https://docs.monad.xyz/monad-arch/consensus/block-states#proposed)。

#### 预期第 `K+1` 轮：Bob 的缺失时隙
3. Bob 未能成功提议区块 `N+1`，导致所有投票陷入黑洞状态，无法为 Alice 的区块生成 QC。

4. **全员发送超时消息**：经过超时窗口后，各验证者“意识到”第 `K` 轮已失败（因为未形成 Alice 区块的 QC）。因此所有验证者会向其他所有验证者发送关于第 `K` 轮的[超时消息](https://docs.monad.xyz/monad-arch/consensus/monad-bft#timeout-message)（注意这是全员广播通信）。

5. **TC 组装**：当收集到超多数量的超时消息后，包括 Bob 在内的所有验证者会组装 [TC（超时证明）](https://docs.monad.xyz/monad-arch/consensus/monad-bft#timeout-certificate-tc)，证实第 `K` 轮（Alice 为提议者，Bob 为 QC 构建者）已失败。成功构建第 `K` 轮的 TC 后，验证者将轮次推进至 `K+1`。

##### 通过 TC 推进的第 `K+1` 轮
TC 包含一个名为 [high_tip](https://docs.monad.xyz/monad-arch/consensus/monad-bft#high-tip) 的计算值，粗略来说这是参与超时消息的验证者中所见过的最新有效区块头。可以将 `high_tip` 理解为签署 TC 的 2/3 权益权重验证者所观测到的最新区块。

在此特定示例中，`high_tip` 将是 Alice 区块的区块头。

根据 MonadBFT 规则，下一任领导者必须选择：要么重新提议 TC 中 `high_tip` 引用的区块（即 Alice 的区块），要么证明该区块缺乏支持（下文将详细讨论）。

由于当前处于第 `K+1` 轮，下一任领导者仍是 **Bob**（这可能具有讽刺意味，但这是协议无法区分“Bob 离线”与“Alice 发送无效区块/未获得足够投票”这两种情况的必然结果。若是后者，跳过 Bob 将是不公平的）。

6. **（可选）向其他验证者请求 Alice 的区块**：Bob 需要重新提议 Alice 的区块。但 `high_tip` 仅是区块头而非完整区块体，因此若 Bob 未持有 Alice 的完整区块，他可以通过[区块同步](https://docs.monad.xyz/monad-arch/consensus/blocksync)向其他验证者请求完整版本。

#### 重新提议情况（Bob 重新提议 Alice 的区块）
7. **重新提议**：若 Bob 持有 Alice 的区块（无论是原本就收到还是通过区块同步获得），他会将该区块与证明重新提议合理性的 TC 一同提出。

8. **投票阶段**：各验证者对 Bob 的重新提议进行有效性投票。若重新提议有效，验证者会将投票发送给下一任领导者 Charlie。

9. **QC 形成阶段**：Charlie 根据投票组装 QC。

10. **Charlie 的提案**：Charlie 在第 `K+2` 轮构建新区块（包含新有效负载和第 `K+1` 轮重新提议的 QC）并发送给所有人。此时，所有收到 Charlie 区块的验证者会将 Alice 的区块标记为[已投票](https://docs.monad.xyz/monad-arch/consensus/block-states#voted)。全体验证者将轮次推进至 `K+2`，协议回归正常流程。


##### 全新提案情况（Bob 证明 Alice 区块缺乏支持）
11. **Bob 区块的无背书声明**：回顾第 6 步，Bob 被允许向其他验证者征询 Alice 的区块。当被征询时，若验证者同样未持有该区块，可向 Bob 发送签署的[无背书声明](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-endorsement-message-and-no-endorsement-certificate)，证明未见过 Alice 的区块。若超多数验证者签署了无背书声明，Bob 可组装[无背书证明（NEC）](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-endorsement-message-and-no-endorsement-certificate)。

12. **Bob 的全新提案**：根据 MonadBFT 规则，若 Bob 能同时提供 NEC，则可跳过重新提议 Alice 的区块，转而[全新提议](https://docs.monad.xyz/monad-arch/consensus/monad-bft#fresh-proposal)相同高度 `N` 的新区块。

需要重点强调：仅当超多数验证者签署 NEC 时，Bob 才被允许跳过重新提议 Alice 的区块，否则他必须执行重新提议。此规则有助于确保即使 Bob 未能构建 Alice 区块的 QC，该区块仍能实现最终确认。

此后共识将恢复正常流程，回归正常路径。

##### 无提案情况
还存在第三种可能：Bob 在第 `K+1` 轮完全未提出任何提案（这种情况相当可能发生，因为他原本就在预期第 `K+1` 轮时未能发送区块）。此时会再次触发超时（本次针对第 `K+1` 轮），使共识进入第 `K+2` 轮 Charlie 的回合。Charlie 将继承 Bob 在第 `K+1` 轮的处境，即他必须选择：要么重新提议 Alice 的区块，要么证明该区块缺乏支持。

更广义地说，若 Charlie（及后续若干领导者）也未能提出任何提案，此状态将持续直到某位领导者要么重新提议 Alice 的提案，要么证明其缺乏支持。这正是 MonadBFT 关于 `high_tip` 的规则，它确保 Alice 的区块终将实现最终确认——除非该区块本就不应获得支持。


### 讨论
#### 无尾部分叉
在先前流水线式 HotStuff 系列共识协议的实现中，若 Bob 错过其提案时隙，通常会导致 Alice 的提案也被回滚（即尾部分叉）。其背后的逻辑在于：Bob 是唯一负责接收大家对 Alice 提案投票的人，一旦他离线，所有投票都将陷入黑洞，使得系统难以区分究竟是多数验证者对 Alice 的提案投了赞成票，还是多数验证者拒绝了她的提案。

例如，在 [Fast-HotStuff](https://arxiv.org/abs/2010.11454) 中，超时证明携带了足够的信息来证明 Bob 错过了其时隙，这使得 Bob 可以合理地提出一个跳过 Alice 区块的新区块，导致 Alice 的区块成为牺牲品。Bob 只需在 Alice 相同的区块高度上重新提案，就能在最终区块链中替换掉 Alice 的区块。这正是为何在 MonadBFT 之前的流水线式 HotStuff 共识机制中，经常会出现连续错过时隙成对出现的情况。

**尾部分叉是一个严重的缺陷**。当 Alice 提出区块后，如果 Bob 在其中发现了有价值的 MEV 机会，作为 QC 构建者（下一任领导者），Bob 可能会拒绝为 Alice 的区块构建 QC，转而提出一个携带 Alice 区块 QC 的自己的区块。在这种情况下，验证者无法检测究竟是 Alice 未能成功传播其提案，还是 Bob 拒绝构建 QC；因此 Bob 在第 K+1 轮获得了提出区块的机会。通过仅选择其偏好的交易，并随意对其重新排序或替换，Bob 便能提取高价值的 MEV。在其他区块链中，无意中允许区块被重新挖出已造成[巨大影响](https://ethresear.ch/t/equivocation-attacks-in-mev-boost-and-epbs/15338)。

MonadBFT 实现**无尾部分叉特性**的关键在于其对错过时隙情况的处理。直观来说，在 MonadBFT 中，即使 Bob 黑洞了所有关于 Alice 区块的投票，[超时证明](https://docs.monad.xyz/monad-arch/consensus/monad-bft#timeout-certificate-tc)也携带了足够的信息，能够将 Alice 区块存在的知识向前传递。

当轮到 Bob 提案时，他必须重新提出 Alice 的区块（基于超时证明中包含的 high_tip，即 Alice 区块的有效区块头），除非他能获得超多数（`2f+1`）验证者证明他们未见过 Alice 的区块。超多数验证者签署[无背书证明](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-endorsement-message-and-no-endorsement-certificate)这一点至关重要：即使有 `f` 个节点是拜占庭节点，仍然有 `f+1` 个非拜占庭节点证明未见过 Alice 的区块，这保证了 Alice 的区块本不应达到法定人数，因为形成法定人数需要 `2f+1` 张投票，而至少有 `f+1` 个非拜占庭节点投了反对票。

[MonadBFT 论文](https://arxiv.org/abs/2502.20692)提供了对该协议更为严谨的定义，并给出了尾部分叉不可能发生的正式证明。

#### 推测最终性
MonadBFT 另一个卓越特性是**单时隙推测最终性**。

要理解这个概念，首先需要明确：区块的状态总是基于特定观察者的视角。例如，如果您收到某个区块的 QC，就可以将该区块标记为[已投票](https://docs.monad.xyz/monad-arch/consensus/block-states#voted)状态；但如果您朋友尚未收到该 QC，她仍会认为该区块处于[已提案](https://docs.monad.xyz/monad-arch/consensus/block-states#proposed)状态。

构建分布式共识机制的挑战在于：即使假设最坏情况（即当前节点可能是唯一收到某条消息的节点），也需要定义允许各节点根据消息独立更新状态机的规则。

##### 接收 Alice 提案后
假设您是验证者 Valerie。收到 Alice 的提案后，您通过有效性检查，于是将 Alice 的提案标记为[已提案](https://docs.monad.xyz/monad-arch/consensus/block-states#proposed)。

请注意，您无法确定其他节点是否也收到该提案——Alice 可能故意只向您（或极少数节点）发送提案，试图让您与其他节点产生分歧。

##### 接收 Bob 的提案后
当您收到携带 Alice 提案 QC 的 Bob 提案时，通过有效性检查后会将 Alice 的提案标记为[已投票](https://docs.monad.xyz/monad-arch/consensus/block-states#voted)。

此时虽然您已拥有超多数验证者对 Alice 提案投票的证明，但仍需警惕 Bob 可能仅向您发送该提案进行欺诈。您应该担心 Bob 的提案可能无法达到法定人数。

MonadBFT 的强大之处在于：基于前述复杂的超时处理规则，当您作为 Valerie 收到 Bob 提案时，至少对于 Alice 提案的状态，基本可以消除这种担忧。在将 Alice 提案转为`已投票`状态时，您可以**推测性地最终确认**该提案。也就是说，您可以确信除非发生特定罕见情况，否则 Alice 的提案几乎注定会被最终确认。

直观来看，这与我们之前的论述一致。您（Valerie）持有由 Bob 汇编的 Alice 区块 QC，这实际上意味着从您的视角看，Bob 并未离线。

即使 Bob 对大多数节点而言实际处于离线状态（例如他只向您发送了下一提案及 Alice 区块的 QC），您也知道系统将启动组装 TC 的流程，且该 TC 中的 `high_tip` 极可能指向 Alice 的区块。因为：
1.  您手中的 QC 证明超多数节点（`2f+1`）已见证 Alice 的区块
2.  TC 同样需要超多数节点（`2f+1`）签署
3.  因此至少存在 `f+1` 个节点同时参与 QC 和 TC 的形成，其中至多 `f` 个为拜占庭节点，故至少 1 个诚实节点会引用 Alice 的区块

如果 Alice 区块被纳入 `high_tip`，Charlie 将被迫重新提议该区块（除非他能获得 NEC 证明——但这不可能实现，因为要形成 NEC 需要超多数节点签署无背书声明，而超多数节点已为 Alice 区块签署了 QC）。

因此表面看来，当我们（Valerie）收到 Alice 区块的 QC 时，似乎就能立即最终确认该区块。


#### 唯一漏洞
实际上存在一个漏洞会削弱我们的确信度。这个漏洞在 Alice **进行双重签名**时会出现——如果她在相同高度同时签署了第二个区块 `b'`（与我们已有 QC 的初始区块 `b` 并列），并将 `b'` 发送给部分节点。

在这种情况下，若 Bob 在离线前仅向我们发送了他的提案，则最终形成的 TC 中的 `high_tip` 可能指向 `b'` 而非 `b`。一旦发生这种情况，Charlie 最终可能重新提议 `b'`，或收集关于 `b'` 的 NEC 来证明在 Alice 的区块高度上新提议区块的合理性。

实践中，该漏洞的出现概率极低，原因如下：
1.  双重签名是可轻易验证的过错 —— 只需提供同一高度两个均由 Alice 签名的区块作为证据。在区块链中，双重签名是重大违规行为，将受到严厉惩罚。
2.  当 Alice 进行双重签名时，她实际上主要是在破坏自己的提案（同时还要承担双重签名的惩罚风险）。
3.  TC 中计算 `high_tip` 的算法会通过选择获得更多权益权重投票的区块来解决 `b` 与 `b'` 之间的冲突。由于我们已拥有 `b` 的 QC，TC 中的多数权益权重很可能同样为 `b` 而非 `b'` 投过票（虽然在 BFT 假设下无法绝对保证——因为 QC 仅能确保 TC 中 `2f+1` 票里至少有 `f+1` 票支持 `b`，其中可能包含 `f` 个拜占庭节点的投票。但实践中这种情况极不可能发生）。

[MonadBFT 论文](https://arxiv.org/abs/2502.20692)对此给出了更严谨的论证。总而言之，本地观测到 QC（将提案转为`已投票`状态）是提案将实现最终确认的强有力指标——唯一可能阻止最终确认的情况需要同时满足：Alice 实施双重签名、Bob 错过提案时隙、近 1/3 网络节点为拜占庭节点，且我们在 TC 的节点构成上遭遇极端不利的巧合。

### 协议更新
自首版 [MonadBFT 论文](https://arxiv.org/abs/2502.20692)发布以来，Category Labs 对协议行为进行了深入分析，并设计、评估及实施了多项改进。这些协议变更使得系统能在最常见故障场景中实现快速恢复。

#### 快速恢复机制
相关细节将随本文及论文的后续更新正式发布，现简要说明如下：

1.  验证者现在不仅将投票发送给下一视图的领导者，同时也会发送给当前视图的领导者。这使得每位领导者有机会自行收集投票以形成 QC，而不再完全依赖下一任领导者（其可能是拜占庭节点）。领导者会广播此 QC。
2.  验证者可在超时消息中包含对其最新区块的投票。如果 `2f+1` 个超时消息包含对同一提案的投票，则能通过此方式直接形成新 QC。
3.  验证者可在超时消息中包含其观测到的最高 QC。
4.  超时证明现在包含所收超时消息中的最高 QC，以及证明这确实是所有收集消息中最高 QC 的证明。如果最高 QC 的视图号大于或等于 high_tip 的视图号，领导者可以直接提议一个基于该高阶 QC 的新区块。

这些机制能在最常见故障场景中实现更快速的恢复。例如：假设视图 `v` 的领导者离线。在原始 MonadBFT 协议中，这将导致视图 `v-1` 和 `v` 超时（因为 `v-1` 的投票丢失，且视图 `v` 中未提出任何区块）。此外，视图 `v-1` 中提出的区块需在视图 `v+1` 中重新提议，导致连续三个视图均没有新区块产生。

在更新后的协议中，多项机制可实现快速恢复。例如：在视图 `v` 的超时消息中，每个验证者会包含对视图 `v-1` 所提议块的投票。这使得视图 `v+1` 的领导者能在视图 `v` 期间构建出 QC。由于同一视图内不可能形成两个冲突的 QC，视图 `v+1` 的领导者可以直接基于此 QC 提议新区块。因此，单个领导者崩溃仅会导致其自身视图超时，其他所有视图均能成功产生新区块。

其他机制同样提供了快速恢复路径。我们仍保留原论文中的重新提议和 [NEC](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-endorsement-message-and-no-endorsement-certificate) 机制以应对更复杂的拜占庭故障。但通过这些改进，我们相信大多数故障现在都能通过新的快速恢复路径得到平滑处理。

#### MonadBFT 的其他更新
相较于论文发布的版本，协议还有两项重要更新：

首先，在当前版本中，重新提议不会影响领导者调度。原论文规定重新提议现有区块的领导者会获得额外提案时隙，此设计已不再采用。

其次，论文描述的基于纠删码的区块恢复机制已被更简洁的[区块同步](https://docs.monad.xyz/monad-arch/consensus/blocksync)方案取代。系统现通过区块同步来获取缺失区块，而无背书消息与证明仍继续使用。

这两项变更均将在论文的后续更新中体现。

### 参考文献
[1] Mohammad Mussadiq Jalalzai, Kushal Babel. [《MonadBFT：快速、响应式、抗分叉的流线型共识》](https://arxiv.org/pdf/2502.20692)，2025  
[2] Maofan Yin 等. [《HotStuff：区块链视角下的 BFT 共识》](https://arxiv.org/abs/1803.05069)，2018  
[3] Mohammad M. Jalalzai 等. [《Fast-HotStuff：快速且鲁棒的 HotStuff 协议》](https://arxiv.org/abs/2010.11454)，2020  
[4] Rati Gelashvili 等. [《Jolteon 与 ditto：具备异步回退能力的网络自适应高效共识》](https://arxiv.org/pdf/2106.10362.pdf)，2021  
[5] Diem 团队. [《DiemBFT v4：Diem 区块链中的状态机复制》](https://developers.diem.com/papers/diem-consensus-state-machine-replication-in-the-diem-blockchain/2021-08-17.pdf)，2021
