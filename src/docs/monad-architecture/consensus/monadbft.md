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

