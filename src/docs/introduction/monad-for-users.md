# 面向用户的 Monad

Monad 是与以太坊兼容的高性能 Layer1，为用户提供了两全其美的解决方案：**可复制性**和**性能**。

从可复制性的角度来看，Monad 为以太坊虚拟机（EVM）提供了**完整的字节码兼容性**，因此在太坊上构建的应用程序无需修改代码即可复制到 Monad；并且提供了**完整的以太坊RPC兼容性**，因此用户可以使用 MetaMask 或 Etherscan 等基础设施。

从性能角度来看，Monad 拥有 **10,000 tps** 的吞吐量，即每天 10 亿笔的交易量，另外 Monad 的**出块时间和区块确认时间仅为 1 秒**。这使得 Monad 能够支持比现有区块链更多的用户高并发交互，同时拥有更低廉的单笔交易成本。

### 对比以太坊，Monad 有什么相似之处？

从用户角度来看，Monad 的链上操作与以太坊非常相似。你可以使用熟悉的钱包（如 MetaMask）或区块浏览器（如 Etherscan）来签署或查看交易，在以太坊上构建的应用程序也可以复制到 Monad 上，无需修改代码，因此用户可以在 Monad 上使用最喜欢的以太坊应用程序。Monad 中的地址空间与以太坊中的地址空间相同，因此用户可以使用现有的密钥在 Monad 上创建钱包。

与以太坊一样，Monad 也具有 linear blocks 和区块内 linear ordering 排序的特点。

与以太坊一样，Monad 也是一个由去中心化的验证者维护的权益证明网络。任何人都可以运行一个节点来独立验证交易的执行情况，并且已经采取了大量措施来保持最低的硬件要求。

### 对比以太坊，Monad 有什么不同之处？

Monad 通过在以太坊虚拟机中引入**并行执行（parallel execution）**&#x548C; **超标量流水线（superscalar pipelining）**&#x6280;术，使卓越的性能成为可能。

**并行执行** 是指利用多个内核和线程有策略地并行执行交易，同时仍按原始排序提交交易结果。虽然交易在"内部"是并行执行的，但从用户和开发人员的角度来看，它们是串行执行的；一系列交易的结果总是相同的，就像这些交易是一个接一个地执行一样。

**超标量流水线** 是一种将执行单元划分为不同阶段，并且并行执行这些阶段的技术。可以通过以下图例阐明该技术：

<div align="center" data-full-width="false"><figure><img src="https://3402452340-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FPaHQrSOuX4vToXCmyjn9%2Fuploads%2FND43WdYAmOnDM7iYZGeh%2F001_.png?alt=media&#x26;token=20de6591-a98b-41c6-b425-9464fbdb435b" alt=""><figcaption><p>pipelining 作业的熟悉案例：智能洗衣<br>上图：普通洗衣作业；下图：pipelined 洗衣作业<br>资料来源：<a href="https://www.cs.fsu.edu/~hawkes/cda3101lects/chap6/index.html?$$$F6.1.html$$$">Prof. Lois Hawkes, FSU</a></p></figcaption></figure></div>

当洗四件衣服时，“普通洗衣作业”的策略是在洗第二件衣服之前，完成第一件衣服的洗涤、烘干、折叠和储存；“pipelined 洗衣作业”的策略是当第一件衣服洗涤完成进入烘干机时，开始洗涤第二件衣服，通过同时利用多个资源来更有效地完成工作。

Monad 引入了 pipelining 执行技术，以解决现有区块链在状态存储、交易处理和分布式共识中的瓶颈。具体而言，Monad 在以下四个方面引入了 pipelining 技术和其他优化：

* [MonadBFT 共识机制](../monad-architecture/consensus/monadbft)（pipelined HotStuff 共识机制，以及更多的研究改进）
* [Deferred Execution / 延迟执行](../monad-architecture/consensus/deferred-execution)（在达成共识和执行之间进行 pipelining 作业，以大幅增加执行预算）
* [Parallel Execution / 并行执行](../monad-architecture/execution/parallel-execution)
* [MonadDb 数据库](../monad-architecture/execution/monaddb)（高性能状态后端）

Monad 客户端采用 C++ 和 Rust 语言编写，它反映了在这些架构上的优化，为去中心化应用程序提供了一个平台，可以真正扩展到全球范围。

### 应该关心什么？

去中心化应用程序是中心化服务的替代品，具有若干显著优势：

* **开放式应用程序接口和可组合性**：去中心化的应用程序可以被其他去中心化应用程序原子调用，允许开发人员通过堆栈现有组件来构建更复杂的功能。
* **透明性**：应用程序的逻辑纯粹通过代码表达，因此任何人都可以审查程序的安全性，状态是透明和可审计的，默认情况下在DeFi中进行开源证明。
* **抗审查和可信中立性**：任何人都可以无需许可地向网络提交交易或上传应用程序。
* **全球覆盖**：任何人只要能上网，就能获得重要的金融服务，包括 unbanked/underbanked 用户。

然而，去中心化应用程序需要廉价、高性能的基础设施，才能达到预期的影响水平。一个拥有 100 万日活跃用户（DAUs）和每个用户每天进行10笔交易的应用程序，每天需要吞吐 1000 万笔交易，即 100 tps。快速浏览一下 [L2Beat](https://l2beat.com/scaling/activity)（一个研究 EVM 兼容的 Layer1 和 Layer2 区块链网络吞吐量和去中心化程度的网站）就会发现，目前没有任何EVM区块链支持或接近 100 tps 的吞吐量水平。

Monad 极大地提高了与 EVM 兼容的区块链网络的性能，开创了多项创新，有望在未来几年成为以太坊的标准。

有了 Monad，开发人员、用户和研究人员可以采用大量现有的为 EVM 而构建的应用程序、库和应用密码学研究。

### 如何使用 Monad ？

Monad 的首个公共测试网将在未来几个月内上线。

届时，用户可以在兼容以太坊的钱包中添加相应的 RPC URL 和 链 ID，然后像使用其他兼容以太坊的区块链一样开始使用 Monad 。在此之前，敬请期待！
