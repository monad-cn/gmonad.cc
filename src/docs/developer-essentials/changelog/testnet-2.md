# Testnet-2 更新日志

这是一个仅影响 [testnet-2](https://docs.monad.xyz/developer-essentials/testnets#testnet-2) 的变更精选列表。

**注意**⚠️

我们将变更分组为：

- 协议变更（通常需要新的修订版本）

  - 通常标记为 **[EVM]**、**[Consensus]** 或 **[Network params]**

- RPC/SDK 行为变更（通常标记为 **[RPC]**）

- 性能变更

  - 根据变更性质标记为 **[EVM]**、**[Consensus]** 或 **[RPC]**

- 内部/节点运维变更（通常标记为 **[Node ops]**）

## v0.11.3 [2025-10-08]

修订版本：[`MONAD_FOUR`](https://docs.monad.xyz/developer-essentials/changelog/#revisions) (升级)`testnet-2` 的标签或哈希：

- `monad-bft`: [标签 `v0.11.3-tn2-rollback`](https://github.com/category-labs/monad-bft/releases/tag/v0.11.3-tn2-rollback)
- `monad`: [哈希 `5e452eb`](https://github.com/category-labs/monad/tree/5e452eb77538e1b7a7deace4ed5fd2d4b8b5667e)

#### 重要协议变更 - `MONAD_FOUR`

- [Consensus/EVM]质押功能 已上线

  - （多个 PR；参见 [staking](https://github.com/category-labs/monad/tree/main/category/execution/monad/staking)）

  - 活跃验证者集合现在由质押预编译合约的链上状态决定

  - 从指定的 `staking_activation` epoch 开始生效

  - 注意：质押奖励直到 `staking_rewards_activation` epoch（未来时间点）才会激活

  - 外部奖励 - 启用外部（非区块奖励）向验证者池的存款，参见 [monad PR #1625](https://github.com/category-labs/monad/pull/1625)

  - 还在质押预编译合约中添加了额外事件monad PR #1742

    - 添加了 `ValidatorRewarded`、`EpochChanged`、`ClaimRewards` 事件

- [Consensus/EVM]保留余额逻辑已上线

  - 参考：[monad-bft PR #2160](https://github.com/category-labs/monad-bft/pull/2160) 和 [monad PR #1537](https://github.com/category-labs/monad/pull/1537)
- 由于异步执行，共识机制无法获得交易包含逻辑的最新状态。保留余额是一个缓冲区，为给定账户提供更简单的记账方式，以减轻在延迟窗口中过度支出的可能性。
  - 每个 EOA 的保留余额设置为 `10 MON`

- [Consensus/EVM]EIP-7702已上线

  - 参考：[monad-bft PR #2160](https://github.com/category-labs/monad-bft/pull/2160)、[monad-bft PR #2218](https://github.com/category-labs/monad-bft/pull/2218) 和 [monad PR #1362](https://github.com/category-labs/monad/pull/1362)

- [Network params]设置单笔交易 gas 限制为 30M gas

  - 参考：[monad-bft PR #2246](https://github.com/category-labs/monad-bft/pull/2246)
  - 如 [Monad 初始规范提案](https://forum.monad.xyz/t/monad-initial-specification-proposal/195) 中所讨论的
  
- [Network params]将区块 gas 限制从 150M gas (375 Mgas/s) 增加到200M  gas (500 Mgas/s)

  - 参考：[monad-bft PR #2266](https://github.com/category-labs/monad-bft/pull/2266)

- [Network params]实现动态基础费用

  - 参考：[monad-bft PR #2207](https://github.com/category-labs/monad-bft/pull/2207)
  - 如 [Monad 初始规范提案](https://forum.monad.xyz/t/monad-initial-specification-proposal/195) 中所指定的
  - 目标 gas 为区块的 80%
  - 将最低基础费用从 50 MON-gwei 提高到 **100 MON-gwei**
  
- [EVM]启用EIP-2935

  + 区块哈希缓冲区

  - 参考：[monad PR #1520](https://github.com/category-labs/monad/pull/1520)

- [EVM]启用EIP-7951(P256VERIFY 预编译合约支持)

  - 参考：[monad PR #1518](https://github.com/category-labs/monad/pull/1518)

- [EVM]启用EIP-2537(BLS12-381 预编译合约)

  - 参考：[monad-bft PR #1342](https://github.com/category-labs/monad/pull/1342) 和 [monad-bft PR #1350](https://github.com/category-labs/monad/pull/1350)

- [EVM]提高`CREATE`/`CREATE2`的最大合约大小到 128 kb

  - 参考：[monad PR #1440](https://github.com/category-labs/monad/pull/1440)
  - 这使得 `CREATE`/`CREATE2` 与顶级合约创建交易保持一致，后者在 `MONAD_TWO` 中已经提高了限制。
  - 之前，由于错误，它们意外地被限制为以太坊的最大 initcode 大小 (49.152 kb)

#### 重要的 RPC/SDK 变更

- [SDK] 添加了对 [执行事件](https://docs.monad.xyz/execution-events) 的支持

- [RPC]扩展 `eth_call` 对 preStateTracer 和 stateDiffTracer 的支持，结合`debug_traceCall`
 
- 参考：[monad-bft PR #2275](https://github.com/category-labs/monad-bft/pull/2275) 和 [monad PR #1471](https://github.com/category-labs/monad/pull/1471)

- [RPC]支持`callTracer`的`withLog`参数
  - 参考：[monad-bft PR #2400](https://github.com/category-labs/monad-bft/pull/2400)
- 如果 `withLog` 设置为 true，`callTracer` 将在跟踪输出中包含事件日志

#### 重要性能变更

- [EVM]内核缓存数据库读写操作
- 参考：[monad PR #1559](https://github.com/category-labs/monad/pull/1559)
  - 利用可用的主机内存来缓存最近的数据库操作 - 这个缓存应该能提高执行和 RPC 的性能

- [RPC]改进 RPC 数据库节点缓存并使其内存有界
  - 参考：[monad PR #1581](https://github.com/category-labs/monad/pull/1581)
  - 注意 RPC cli 标志的重命名：`--eth-call-executor-node-lru-size` 重命名为 `--eth-call-executor-node-lru-max-mem`，并新增了 `--triedb-node-lru-max-mem` 标志，两者默认值都为 100MB。

#### 重要内部变更

- [Node ops]移除`bft-fullnode` 二进制文件；现在只有`bft`二进制文件

  - 参考：[monad-bft PR #2072](https://github.com/category-labs/monad-bft/pull/2072)
  - `bft-fullnode` 在 `v0.11` 的 `deb` 包中被移除
  
- **[Node ops]** PeerDiscovery：为对等节点自己名称地址引入预检查

- [Consensus]Blocksync：仅从已连接节点中选择 blocksync 对等节点

  - 参考：[monad-bft PR #2401](https://github.com/category-labs/monad-bft/pull/2401)

- [Consensus]Raptorcast：在解码状态缓存上的 DOS 保护

  - 参考：[monad-bft PR #2092](https://github.com/category-labs/monad-bft/pull/2092)

- [Node ops]辅助 raptorcast 配置变更

  - 参考：[monad-bft PR #2378](https://github.com/category-labs/monad-bft/pull/2378)
  - 用 `enable_publisher` 和 `enable_client` 替换歧义的辅助 raptorcast `mode` 参数
  
- [Node ops]动态重载优先级全节点

  - 参考：[monad-bft PR #2364](https://github.com/category-labs/monad-bft/pull/2364)

- [Node ops]修复 wal2json

  - 参考：[monad-bft PR #2404](https://github.com/category-labs/monad-bft/pull/2404)

- [Node ops/RPC]支持 RPC CLI 参数`ws-sub-per-conn-limit`
  - 参考：[monad-bft PR #2161](https://github.com/category-labs/monad-bft/pull/2161)
  - 设置每个连接的 websocket 订阅最大数量（默认为 100）
  
- [Node ops/RPC]为高 eth-call 池添加配置选项
  - 参考：[monad-bft PR #2387](https://github.com/category-labs/monad-bft/pull/2387)

## v0.11.1 [2025-09-16]

注意：`v0.11.1` 是一个仅在 `testnet-2` 上部署的版本，大约从 2025-09-16 到 2025-10-08；然而，它在修订版本 `MONAD_FOUR` 中对某些功能的映射与现在不同，这些变更在代码库中不再被记录。在部署 `v0.11.3` 之前，`testnet-2` 被重置。

在所有意图和目的上，这个版本可以被忽略。

标签或哈希：

- `monad-bft`: [标签 `v0.11.1`](https://github.com/category-labs/monad-bft/releases/tag/v0.11.1)
- `monad`: [哈希 `7746980`](https://github.com/category-labs/monad/tree/7746980c45b82f812bd8c4d39f4b0a1232ae16de)

## v0.10.4 [2025-08-18]

修订版本：[`MONAD_THREE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions) （无变更）

标签或哈希：

- `monad-bft`: [标签 `v0.10.4`](https://github.com/category-labs/monad-bft/releases/tag/v0.10.4)
- `monad`: 哈希 `39c42e6`

#### 重要的 RPC/SDK 变更

- [RPC]RPC 响应中的 EIP-4844 相关字段被移除。
- 从 RPC 返回的区块头将不再包含 `blobGasUsed`、`excessBlobGas` 和 `parentBeaconBlockRoot`。

#### 重要性能变更

- [Consensus]投票现在发送给当前轮次领导者。这是一个共识优化，可以减少由于轮次超时导致的有效延迟

  - 参考：[monad-bft PR #2093](https://github.com/category-labs/monad-bft/pull/2093)

- [Consensus]缓存最近验证的仲裁团证书

  - 参考：[monad-bft PR #2167](https://github.com/category-labs/monad-bft/pull/2167)

- [Node ops]跟踪调用的启用现在通过`monad`（执行）命令行参数`--trace_calls` 来控制。
  
  - 为了保持遗留行为，`--trace_calls` 在 debian 包中当前是启用的。在未来，我们建议对验证者禁用，对 RPC 和存档节点启用。
- 这允许投票验证者选择不计算跟踪，因为它们只对 RPC 节点有用。

#### 重要内部变更

- [Consensus]TC forwarding to prioritized and public (non-dedicated) full nodes

  - Ref: [monad-bft PR #2149](https://github.com/category-labs/monad-bft/pull/2149)
- Prior to `v0.10.4`, all full nodes were subject to lagging behind validators in the event of a timeout because round advancement due to TC was not forwarded (and still isn’t to dedicated full nodes).
  - As a result, after timeouts, full nodes would frequently forward transactions to the next three leaders relative to a stale state. This results in those transactions often missing and the ensuing blocks being comparatively empty.

- [Node ops]Bugfix for secondary raptorcast (round gap crash) that affected validators in Publisher mode

  - Ref: [monad-bft PR #2090](https://github.com/category-labs/monad-bft/pull/2090)

- [Node ops]`ledger-tail` improvements

  - Ref: [monad-bft PR #2144](https://github.com/category-labs/monad-bft/pull/2144)

  - Reduced memory usage on startup
  - `author_dns` field changed to `author_address` to reflect change in v10 addresses
  - Timeouts and finalizations are tracked and logged

- [Consensus]Txpool account preloading bugfix

  - Ref: [monad-bft PR #2108](https://github.com/category-labs/monad-bft/pull/2108)

## v0.10.3 [2025-07-30]

修订版本：[`MONAD_THREE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions) （升级；立即生效 - 非时间门控）

#### 重要协议变更 - `MONAD_THREE`

- **[Consensus]** 共识机制从 [Fast-HotStuff](https://arxiv.org/abs/2010.11454) 升级到 [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft)。这是一个重大升级，增加了 *(i)* [对尾部分叉的抗性](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-tail-forking) 和 *(ii)* [1-槽推测最终化](https://docs.monad.xyz/monad-arch/consensus/monad-bft#speculative-finality)
- **[Network params]** 区块时间从 500 ms 减少到 **400 ms**

#### Notable RPC/SDK changes

- [RPC]增加对实时数据的支持，通过WebSocket和共享内存队列访问（文档即将推出）：
- Geth 实时事件（通过 WebSocket）
  - 带有 Monad 扩展的 Geth 实时事件（通过 WebSocket）
- 通过共享内存队列的实时数据，供在全节点主机上使用执行事件 SDK 的程序使用

#### 重要性能变更

- **[Execution]** 切换到 JIT EVM。昂贵或经常执行的合约的字节码直接编译成本机代码以实现更快的执行
- **[Execution]** 切换到使用基于文件指针的 IPC 来执行区块。之前，客户端使用的是预写日志 (WAL)，这没有利用可用的共识信息，可能导致可避免的执行

#### 重要内部变更

- **[Node ops]** 添加对等节点发现
- **[Node ops]** 添加全节点 [RaptorCast](https://docs.monad.xyz/monad-arch/consensus/raptorcast)，使全节点网络具有可扩展性

## testnet-2 初始状态 [2025-06-17]

运行 `v0.9.3`

修订版本：[`MONAD_TWO`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)