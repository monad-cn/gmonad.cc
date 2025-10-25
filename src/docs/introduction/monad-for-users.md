# Monad 用户指南

**Monad** 是一个高性能、以太坊兼容的一级区块链（L1），为开发者和用户提供两全其美的体验：**完全可移植性** 与 **卓越性能**。

在可移植性方面，Monad 提供对以太坊虚拟机（EVM）的**完全字节码兼容**，这意味着在以太坊上构建的智能合约和 DApp 可以**零修改直接部署**到 Monad 上。同时，它还支持**完整的以太坊 RPC 接口兼容性**，确保像 Etherscan、The Graph 等基础设施能够无缝集成。

在性能方面，Monad 实现了**每秒 10,000 笔交易（TPS）**的吞吐量，可每天处理超过 **10 亿笔交易**，并具备 **400ms 区块生成时间** 与 **800ms 交易确认时间**。这使得 Monad 能够支撑大规模用户与高交互性应用，同时保持极低的每笔交易成本。


## Monad 的熟悉之处

从用户体验上看，Monad 的行为几乎与以太坊一致。你可以使用相同的钱包（如 MetaMask、Phantom）或区块浏览器（如 Etherscan）进行签名与交易查询。  
在以太坊上构建的应用无需修改任何代码即可迁移到 Monad，因此你可以期待在 Monad 上直接使用许多熟悉的以太坊应用。  
Monad 的地址空间与以太坊相同，因此你可以复用现有密钥对。

与以太坊一样，Monad 采用**线性区块结构**，并在每个区块中**顺序排序交易**。  
同时，Monad 是一个基于**权益证明（PoS）**共识机制的去中心化网络，由独立验证者集合维护。任何人都可以运行节点以独立验证交易执行。Monad 也在硬件层面做了大量优化，以保持极低的节点运行要求。


## Monad 的不同之处

Monad 通过在 EVM 层引入 **并行执行** 与 **超标量流水线（Superscalar Pipelining）** 实现了极致性能优化。

### 并行执行（Parallel Execution）
并行执行是指利用多核、多线程并行处理任务的策略，同时确保**提交结果的顺序与原始交易顺序一致**。  
从开发者视角看，交易依然是顺序执行的；也就是说，Monad 的并行架构保证了与传统顺序执行相同的可重现性和确定性。

### 超标量流水线（Superscalar Pipeline）
流水线是一种将任务拆解为多个阶段并并行执行的优化方式。一个经典的例子如下：

![流水线洗衣日](./images/pipelining.png)
> 洗衣流程示例：上图为传统顺序执行方式，下图为流水线执行方式。来源：[Prof. Lois Hawkes, FSU](https://www.cs.fsu.edu/~hawkes/cda3101lects/chap6/index.html?$$$F6.1.html$$$)

举例来说，传统方式是等待第一批洗衣完成洗涤、烘干、折叠、收纳后再开始下一批。而流水线方式则在第一批进入烘干机时立即启动第二批洗涤，从而显著提升资源利用率与处理效率。

Monad 将类似的流水线原理引入**状态存储、交易执行和共识处理**，突破了传统以太坊架构的性能瓶颈。  
主要优化方向包括：

- [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft)：高效、抗尾分叉的拜占庭容错（BFT）共识算法  
- [RaptorCast](https://docs.monad.xyz/monad-arch/consensus/raptorcast)：高速区块广播协议  
- [异步执行](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution)：通过共识与执行流水线化提升执行时间预算  
- [并行执行](https://docs.monad.xyz/monad-arch/execution/parallel-execution) 与 [即时编译（JIT）](https://docs.monad.xyz/monad-arch/execution/native-compilation)：实现高效交易执行  
- [MonadDb](https://docs.monad.xyz/monad-arch/execution/monaddb)：高效状态访问层  

Monad 客户端从零开始使用 **C++** 与 **Rust** 编写，充分体现这些架构创新，打造了一个真正能支撑全球级 Web3 应用的去中心化平台。


## 为什么值得关注？

去中心化应用（dApp）是中心化服务的开源替代方案，具有以下显著优势：

- **开放 API 与可组合性**：dApp 可以被其他合约原子化调用，使开发者能够快速组合出复杂的功能模块。  
- **完全透明**：所有逻辑均由智能合约代码定义，可供任何人审计；系统状态公开可验证，DeFi 中的储备证明默认内置。  
- **抗审查与可信中立性**：任何人都可向无许可网络提交交易或部署应用。  
- **全球可访问性**：任何具备互联网接入能力的用户（包括无银行账户群体）都能平等使用金融服务。

然而，要让 dApp 真正大规模普及，**高性能、低成本的底层基础设施**至关重要。  
举例来说，一个拥有 100 万日活跃用户（DAU）、每人每天 10 笔交易的应用每天将产生 1000 万笔交易，约等于 **100 TPS** 的持续负载。  
参考 [L2Beat](https://l2beat.com/scaling/activity) 的实时数据，目前还没有任何 EVM 兼容的 L1 或 L2 区块链能够达到这一吞吐量级别。

Monad 通过架构创新显著提升了 EVM 兼容网络的性能，旨在成为未来以太坊生态的新性能标准。  
它让开发者、用户与研究人员能够继续复用现有的 **EVM 工具链、库与密码学研究成果**，而无需从头构建。


## 公共测试网

Monad 公共测试网现已开放。  
👉 [点击这里开始使用](https://docs.monad.xyz/developer-essentials/network-information)


