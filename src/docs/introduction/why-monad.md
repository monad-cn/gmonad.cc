  # 为什么选择 Monad：去中心化 + 高性能

  ## 去中心化的重要性

  区块链包含几个主要组件：

  - 共识机制，用于达成关于追加到账本的交易的共识
  - 执行/存储系统，用于维护活跃状态

  在提升这些组件性能时，可以通过一些捷径，例如要求所有节点在物理位置上靠近（以减少共识的开销），或要求大量内存（以将大部分或全部状态保存在内存中），但这会显著牺牲去中心化。

  而去中心化正是区块链的核心价值！

  正如在[为什么选择区块链？](https://docs.monad.xyz/introduction/why-blockchain)中所讨论的，去中心化的共享全局状态允许多方在依赖单一、共享、客观真相来源的基础上进行协调。去中心化是关键所在；由少量节点运营者（或极端情况下，仅单一运营者！）维护的区块链无法提供无信任、可信中立和抗审查等优势。

  对于任何区块链网络，去中心化应是首要关注点。性能提升不应以牺牲去中心化为代价。

  ## 当前的性能瓶颈

  以太坊当前的执行限制（每秒 125 万 gas）设置得较为保守，但有几个合理的原因：

  - 低效的存储访问模式
  - 单线程执行
  - 执行预算非常有限，因为共识无法在执行完成前继续进行
  - 对状态增长的担忧，以及状态增长对未来状态访问成本的影响

  Monad 通过算法改进和架构变革应对这些限制，推出了多项创新，希望在未来几年成为以太坊的标准。在保持高度去中心化的同时实现显著的性能提升是关键考量。

  ## 通过优化解决这些瓶颈

  Monad 在四个主要领域启用流水线和其他优化措施，以实现卓越的以太坊虚拟机性能，并显著推进去中心化与可扩展性的权衡。后续页面将描述这些主要改进领域：

  - [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft)：高效且抗尾部分叉的拜占庭容错（BFT）共识机制
  - [RaptorCast](https://docs.monad.xyz/monad-arch/consensus/raptorcast)：高效的区块传输
  - [异步执行](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution)：通过流水线化共识与执行，增加执行时间预算
  - [并行执行](https://docs.monad.xyz/monad-arch/execution/parallel-execution)：高效的交易执行
  - [MonadDb](https://docs.monad.xyz/monad-arch/execution/monaddb)：高效的状态访问