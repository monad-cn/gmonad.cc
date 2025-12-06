# 版本发布

本页面记录了每个重要的版本发布。某些版本仅针对特定网络；如需查看某个网络升级的更直观视图，请参阅：

- [testnet](https://docs.monad.xyz/developer-essentials/changelog/testnet)
- [testnet-2](https://docs.monad.xyz/developer-essentials/changelog/testnet-2)

注意

我们将变更分为以下类别：

- 协议变更（通常需要新的版本）

  - 通常标记为 **[EVM]**、**[Consensus]** 或 **[Network params]**

- RPC/SDK 行为变更（通常标记为 **[RPC]**）

- 性能变更

  - 根据变更性质标记为 **[EVM]**、**[Consensus]** 或 **[RPC]**

- 内部/节点运维变更（通常标记为 **[Node ops]**）

## v0.11.3

引入修订版 [`MONAD_FOUR`](https://docs.monad.xyz/developer-essentials/changelog/#revisions) 和 [`MONAD_FIVE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)。

| 网络                                                      | 发布日期 | 备注                                                 |
| ------------------------------------------------------------ | ------------- | ------------------------------------------------------- |
| [`testnet-2`](https://docs.monad.xyz/developer-essentials/testnets#testnet-2) | 2025-10-08    | 创世时修订版设置为 `MONAD_FOUR`              |
| [`devnet`](https://docs.monad.xyz/developer-essentials/testnets#tempnet) | 2025-10-08    | 升级时修订版设置为 `MONAD_FIVE`            |
| [`testnet`](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 2025-10-13    | 修订版在 2025-10-14 13:30 GMT 设置为 `MONAD_FOUR` |

`testnet-2` 部署的标签或哈希：

- `monad-bft`: [标签 `v0.11.3-tn2-rollback`](https://github.com/category-labs/monad-bft/releases/tag/v0.11.3-tn2-rollback)
- `monad`: [哈希 `5e452eb`](https://github.com/category-labs/monad/tree/5e452eb77538e1b7a7deace4ed5fd2d4b8b5667e)

`testnet` 部署的标签或哈希（无协议差异）：

- `monad-bft`: [标签 `v0.11.3-tn1`](https://github.com/category-labs/monad-bft/releases/tag/v0.11.3-tn1)
- `monad`: [哈希 `3e17265`](https://github.com/category-labs/monad/tree/3e17265fae80710229c657d725d821053cec940b)

#### 重要协议变更 - `MONAD_FIVE`

- [EVM/Network params]操作码重新定价)

  - 参考：[monad PR #1600](https://github.com/category-labs/monad/pull/1600)（大部分重新定价）和 [monad PR #1700](https://github.com/category-labs/monad/pull/1700)（`CREATE`/`CREATE2` 重新定价）

  - 操作码按照

    Monad 初始规范提案

    中讨论的方案重新定价

    - 增加冷存储访问成本
    - 预编译：更好地将一些定价过低的预编译 gas 成本与相关硬件/延迟成本对齐
    
  - 此版本还包括 MISP v1.0.2 中的一些操作码重新定价，这些后来被移除：
  
    - 通过 `SSTORE` 增加存储槽创建成本，并通过 `SSTORE` 增加存储槽删除时退还的 gas 百分比
    - 提高 `CREATE` 和 `CREATE2` 的成本

#### 重要协议变更 - `MONAD_FOUR`

- [Consensus/EVM]质押已上线

  - （多个 PR；参见 [staking](https://github.com/category-labs/monad/tree/main/category/execution/monad/staking)）

  - 活跃验证者集合现在由质押预编译的链上状态决定

  - 从指定的 `staking_activation` 纪元开始生效

  - 注意：质押奖励直到 `staking_rewards_activation` 纪元（未来时间点）才会激活

  - 外部奖励 - 启用外部（非区块奖励）存款到验证者池，参见 [monad PR #1625](https://github.com/category-labs/monad/pull/1625)

  - 在monad PR #1742中还为质押预编译添加了额外事件

    - 添加 `ValidatorRewarded`、`EpochChanged`、`ClaimRewards` 事件

- [Consensus/EVM]储备余额逻辑已上线

  - 参考：[monad-bft PR #2160](https://github.com/category-labs/monad-bft/pull/2160) 和 [monad PR #1537](https://github.com/category-labs/monad/pull/1537)
- 由于异步执行，共识层无法获得用于交易包含逻辑的最新状态。储备余额是一个缓冲区，可为给定账户提供更简单的记账，以减轻在该延迟窗口中超支的可能性。
  - 每个 EOA 储备余额设置为 `10 MON`

- [Consensus/EVM]EIP-7702已上线

  - 参考：[monad-bft PR #2160](https://github.com/category-labs/monad-bft/pull/2160)、[monad-bft PR #2218](https://github.com/category-labs/monad-bft/pull/2218) 和 [monad PR #1362](https://github.com/category-labs/monad/pull/1362)

- [Network params]设置每笔交易 gas 限制为 30M gas

  - 参考：[monad-bft PR #2246](https://github.com/category-labs/monad-bft/pull/2246)
  - 如 [Monad 初始规范提案](https://forum.monad.xyz/t/monad-initial-specification-proposal/195) 中讨论的
  
- [Network params]将区块 gas 限制从 150M gas (375 Mgas/s) 增加到200Mgas (500 Mgas/s)

  - 参考：[monad-bft PR #2266](https://github.com/category-labs/monad-bft/pull/2266)

- [Network params]实现动态基础费用

  - 参考：[monad-bft PR #2207](https://github.com/category-labs/monad-bft/pull/2207)
  - 如 [Monad 初始规范提案](https://forum.monad.xyz/t/monad-initial-specification-proposal/195) 中规定的
  - 目标 gas 为区块的 80%
  - 将最低基础费用从 50 MON-gwei 提高到 **100 MON-gwei**
  
- [EVM]启用EIP-2935

  + 区块哈希缓冲区

  - 参考：[monad PR #1520](https://github.com/category-labs/monad/pull/1520)

- [EVM]启用EIP-7951(P256VERIFY 预编译支持)

  - 参考：[monad PR #1518](https://github.com/category-labs/monad/pull/1518)

- [EVM]启用EIP-2537(BLS12-381 预编译)

  - 参考：[monad-bft PR #1342](https://github.com/category-labs/monad/pull/1342) 和 [monad-bft PR #1350](https://github.com/category-labs/monad/pull/1350)

- [EVM]将`CREATE`/`CREATE2` 

  的最大合约大小提高到 128 kb

  - 参考：[monad PR #1440](https://github.com/category-labs/monad/pull/1440)
  - 这使得 `CREATE`/`CREATE2` 与顶级合约创建交易保持一致，后者的限制在 `MONAD_TWO` 中已经提高。
  - 之前由于一个错误，它们被无意中限制为以太坊的最大初始化代码大小 (49.152 kb)

#### 重要 RPC/SDK 变更

- **[SDK]** 添加了对 [执行事件](https://docs.monad.xyz/execution-events) 的支持

- [RPC]扩展 `eth_call` 对 preStateTracer 和 stateDiffTracer 的支持，配合`debug_traceCall`
 
  - 参考：[monad-bft PR #2275](https://github.com/category-labs/monad-bft/pull/2275) 和 [monad PR #1471](https://github.com/category-labs/monad/pull/1471)

- [RPC]支持`withLog`参数配合`callTracer` 
  - 参考：[monad-bft PR #2400](https://github.com/category-labs/monad-bft/pull/2400)
- 如果 `withLog` 设置为 true，`callTracer` 在跟踪输出中包含事件日志

#### 重要性能变更

- [EVM]内核缓存数据库读写
- 参考：[monad PR #1559](https://github.com/category-labs/monad/pull/1559)
  - 利用可用的主机内存缓存最近的数据库操作 - 这个缓存应该能提高执行和 RPC 的性能

- [RPC]改进 RPC 数据库节点缓存并使其内存受限
  - 参考：[monad PR #1581](https://github.com/category-labs/monad/pull/1581)
  - 注意 RPC CLI 标志的重命名：`--eth-call-executor-node-lru-size` 改为 `--eth-call-executor-node-lru-max-mem`，新增标志 `--triedb-node-lru-max-mem`，两者默认值均为 100MB。

#### 重要内部变更

- [节点运维]移除`bft-fullnode`二进制文件；现在只有 `bft`二进制文件

  - 参考：[monad-bft PR #2072](https://github.com/category-labs/monad-bft/pull/2072)
  - 从 `v0.11` 的 `deb` 包中移除了 `bft-fullnode`
  
- **[节点运维]** 对等节点发现：为对等节点自名称地址引入预检查

- [共识]区块同步：仅从已连接节点中选择区块同步对等节点

  - 参考：[monad-bft PR #2401](https://github.com/category-labs/monad-bft/pull/2401)

- [共识]Raptorcast：在解码状态缓存上增加 DOS 保护

  - 参考：[monad-bft PR #2092](https://github.com/category-labs/monad-bft/pull/2092)

- [节点运维]辅助 raptorcast 配置变更

  - 参考：[monad-bft PR #2378](https://github.com/category-labs/monad-bft/pull/2378)
  - 用 `enable_publisher` 和 `enable_client` 替换模糊的辅助 raptorcast `mode` 参数
  
- [节点运维]动态重新加载优先全节点

  - 参考：[monad-bft PR #2364](https://github.com/category-labs/monad-bft/pull/2364)

- [节点运维]修复 wal2json

  - 参考：[monad-bft PR #2404](https://github.com/category-labs/monad-bft/pull/2404)

- [节点运维/RPC]支持 RPC CLI 参数`ws-sub-per-conn-limit`
  - 参考：[monad-bft PR #2161](https://github.com/category-labs/monad-bft/pull/2161)
  - 设置每个连接的最大 websocket 订阅数量（默认为 100）
  
- [节点运维/RPC]为高 eth-call 池添加配置选项

  - 参考：[monad-bft PR #2387](https://github.com/category-labs/monad-bft/pull/2387)

## v0.11.1

注意：`v0.11.1` 是一个仅在 `testnet-2` 上部署的版本，部署时间大约从 2025-09-16 到 2025-10-08；然而，它将某些功能与修订版 `MONAD_FOUR` 的映射方式不同，这些映射在代码库中不再保留。在部署 `v0.11.3` 之前，`testnet-2` 已被重置。

在任何情况下，这个版本都可以忽略。此变更日志将比较 `v0.11.3` 与 `v0.10.4`。

标签或哈希：

- `monad-bft`：[标签 `v0.11.1`](https://github.com/category-labs/monad-bft/releases/tag/v0.11.1)
- `monad`：[哈希 `7746980`](https://github.com/category-labs/monad/tree/7746980c45b82f812bd8c4d39f4b0a1232ae16de)

## v0.10.4

| 网络                                                      | 发布日期 | 备注                         |
| ------------------------------------------------------------ | ------------- | ------------------------------- |
| [`testnet-2`](https://docs.monad.xyz/developer-essentials/testnets#testnet-2) | 2025-08-18    | 修订版仍为 `MONAD_THREE` |
| [`testnet`](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 2025-08-18    | 修订版仍为 `MONAD_THREE` |

标签或哈希：

- `monad-bft`：[标签 `v0.10.4`](https://github.com/category-labs/monad-bft/releases/tag/v0.10.4)
- `monad`：哈希 `39c42e6`

#### 重要 RPC/SDK 变更

- [RPC]移除了 RPC 响应中与 EIP-4844 相关的字段。

  - 从 RPC 返回的区块头将不再包含 `blobGasUsed`、`excessBlobGas` 和 `parentBeaconBlockRoot`。

#### 重要性能变更

- [共识]投票现在发送给当前轮次领导者。这是一个共识优化，减少了由于轮次超时导致的有效延迟

  - 参考：[monad-bft PR #2093](https://github.com/category-labs/monad-bft/pull/2093)

- [共识]缓存最近验证的法定人数证书

  - 参考：[monad-bft PR #2167](https://github.com/category-labs/monad-bft/pull/2167)

- [节点运维]跟踪调用的启用现在通过`monad`（执行）命令行参数`--trace_calls`控制。 
  - 为了保持传统行为，debian 包中当前已启用 `--trace_calls`。未来我们建议验证者禁用此功能，RPC 和归档节点启用此功能。
- 这允许投票验证者选择不计算跟踪，因为它们只对 RPC 节点有用。

#### 重要内部变更

- [共识]TC 转发到优先和公共（非专用）全节点

  - 参考：[monad-bft PR #2149](https://github.com/category-labs/monad-bft/pull/2149)
- 在 `v0.10.4` 之前，由于 TC 导致的轮次推进不会转发（对专用全节点仍然如此），所有全节点在超时事件中都会滞后于验证者。
  - 因此，在超时后，全节点经常会相对于过时状态将交易转发给下三个领导者。这导致这些交易经常丢失，随后的区块相对较空。

- [节点运维]修复影响发布者模式验证者的辅助 raptorcast（轮次间隙崩溃）错误

  - 参考：[monad-bft PR #2090](https://github.com/category-labs/monad-bft/pull/2090)

- [节点运维]`ledger-tail `改进

  - 参考：[monad-bft PR #2144](https://github.com/category-labs/monad-bft/pull/2144)

  - 减少启动时的内存使用
  - `author_dns` 字段更改为 `author_address` 以反映 v10 地址的变更
  - 超时和最终化被跟踪和记录

- [共识] 交易池账户预加载错误修复

  - 参考：[monad-bft PR #2108](https://github.com/category-labs/monad-bft/pull/2108)

## v0.10.3

引入修订版 [`MONAD_THREE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)。

| 网络                                                      | 发布日期 | 备注                                        |
| ------------------------------------------------------------ | ------------- | ---------------------------------------------- |
| [`testnet-2`](https://docs.monad.xyz/developer-essentials/testnets#testnet-2) | 2025-07-30    | 升级时修订版设置为 `MONAD_THREE` |
| [`testnet`](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 2025-08-12    | 升级时修订版设置为 `MONAD_THREE` |

#### 重要协议变更 - `MONAD_THREE`

- [共识]共识机制从Fast-HotStuff升级到MonadBFT
  - 这是一次重大升级，增加了 *(i)* [尾分叉抗性](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-tail-forking) 和 *(ii)* [1-槽推测最终性](https://docs.monad.xyz/monad-arch/consensus/monad-bft#speculative-finality)
  
- **[网络参数]** 区块时间从 500 ms 减少到 **400 ms**

#### 重要 RPC/SDK 变更

- [RPC]通过WebSocket和共享内存队列访问添加对实时数据的支持（文档即将发布）：
- Geth 实时事件（通过 WebSocket）
  - 带有 Monad 扩展的 Geth 实时事件（通过 WebSocket）
- 通过共享内存队列的实时数据，适用于在全节点主机上使用执行事件 SDK 的程序

#### 重要性能变更

- **[执行]** 切换到 JIT EVM。昂贵或频繁执行的合约字节码直接编译为本机代码以实现更快的执行
- **[执行]** 切换到使用基于文件指针的 IPC 来执行区块。以前，客户端使用预写日志（WAL），这没有利用可用的共识信息，可能导致可避免的执行

#### 重要内部变更

- **[节点运维]** 添加对等节点发现
- **[节点运维]** 添加全节点 [RaptorCast](https://docs.monad.xyz/monad-arch/consensus/raptorcast)，使全节点网络可扩展

## v0.9.3

| 网络                                                      | 发布日期 | 备注                       |
| ------------------------------------------------------------ | ------------- | ----------------------------- |
| [`testnet`](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 2025-05-29    | 修订版仍为 `MONAD_TWO` |

#### 重要 RPC/SDK 变更

- [RPC]`eth_call`和`eth_estimateGas`限制 

  - RPC 提供者现在可以为`eth_call`和`eth_estimateGas` 
    设置单个交易的最大 gas 限制

    - 以前限制总是区块 gas 限制（150M），现在 RPC 提供者可以选择（默认：30M）
    - 通过 `--eth-call-provider-gas-limit` 和 `--eth-estimate-gas-provider-gas-limit` 控制

  - 在执行`eth_call`和`eth_estimateGas` 
    时添加排队的最大超时

    - 通过 `--eth_call_executor_queuing_timeout` 控制

#### 重要性能变更

- [RPC]通过为便宜和昂贵的`eth_call`操作维护单独的队列来改善整体`eth_call`性能，使便宜的`eth_call`操作不会排在昂贵操作后面。

  - 这添加了两个新的 RPC 错误字符串：
  - `failure to submit eth_call to thread pool: queue size exceeded`
    - `failure to execute eth_call: queuing time exceeded timeout threshold`

- [RPC]为`eth_getLogs` 添加归档索引以支持带有地址和/或主题过滤器的查询

  - 这使得可以高效查询更大的区块范围，工作量与匹配日志数量成比例，而不是与范围内的区块数量成比例

- **[执行]** 更好地限制 TrieDB 遍历

#### 重要内部变更

- **[节点运维]** 慢状态同步客户端更新的性能改进

- **[节点运维]** 修复由过早软重置导致的执行延迟和突然历史长度下降的错误

- [节点运维]`keystore`生活质量改进

  - 支持从十六进制字符串格式的私钥导入（以前需要转换为 json 文件）
  - 通过 `--help` 命令提供更有用的文档

## testnet-1 活跃集扩展

2025-05-02，`testnet-1` 经历了活跃集扩展

#### 重要内部变更

- **[网络参数]** 测试网验证者集合从 72 个节点扩展到 **99** 个节点

## v0.9.2

| 网络                                                      | 发布日期 | 备注                       |
| ------------------------------------------------------------ | ------------- | ----------------------------- |
| [`testnet`](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 2025-04-05    | 修订版仍为 `MONAD_TWO` |

#### 重要性能变更

- **[RPC]** 更新 `eth_call` 执行实现 - 使用更少的线程实现与 `v0.9.1` 相同的并发性

#### 重要内部变更

- **[节点运维]** 支持更快的 [状态同步](https://docs.monad.xyz/monad-arch/consensus/statesync) 机制
- **[RPC]** 节点状态同步期间 RPC 不再接受请求
- **[节点运维]** 对节点间状态同步流量传输的可靠性和效率改进
- **[节点运维]** 修复执行崩溃的错误（`monad::mpt::deserialize_node_from_buffer`、`'Resource temporarily unavailable`）

- **[节点运维]** 修复导致节点 OOM 故障的无界区块同步请求错误
- **[节点运维]** 移除启动时的 DNS 解析 panic

## v0.9.1

| 网络                                                      | 发布日期 | 备注                        |
| ------------------------------------------------------------ | ------------- | ------------------------------ |
| [`testnet`](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 2025-03-24    | 修订版设置为 `MONAD_TWO` |

#### 重要内部变更

- **[节点运维]** 修复区块同步错误
- **[节点运维]** 状态同步的可靠性和效率改进

## v0.9.0

引入修订版 [`MONAD_TWO`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)。

| 网络                                                      | 发布日期 | 备注                                                |
| ------------------------------------------------------------ | ------------- | ------------------------------------------------------ |
| [`testnet`](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 2025-03-14    | 修订版在 2025-03-14 19:00 GMT 设置为 `MONAD_TWO` |

#### 重要协议变更 - `MONAD_TWO`

- [EVM]最大合约大小从 24kb 增加到128kb
- [示例 123 kb 合约](https://testnet.monadexplorer.com/address/0x0E820425e07E4a992C661E4B970e13002d6e52B9?tab=Contract)

#### 重要 RPC/SDK 变更

- [RPC]`debug_traceTransaction`修复 
  - 修复了一个错误，即在一个交易中，只有前 100 个调用被跟踪
  - 在响应数据中添加了 `error` 和 `revertReason` 字段

#### 重要性能变更

- **[共识]** 数据平面 v2 - 更简单高效的实现；广播时间的小幅性能改进
- **[RPC]** 改进 `eth_call` 的 RPC 性能

- **[RPC]** 移除通过 RPC 接收的原始交易上的冗余 sender_recovery 操作

#### 重要内部变更

- **[节点运维]** 状态同步改进，以减轻对上游验证者节点的负面性能影响

- **[RPC]** 在 RPC 交易验证中添加 EIP-2 签名验证
- **[节点运维]** 添加各种跟踪、日志记录和指标
- **[共识]** 处理无效符号时的 RaptorCast 性能改进

## v0.8.1

引入修订版 [`MONAD_ONE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)。

| 网络                                                      | 发布日期 | 备注                                                |
| ------------------------------------------------------------ | ------------- | ------------------------------------------------------ |
| [`testnet`](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 2025-02-14    | 修订版在 2025-02-14 19:00 GMT 设置为 `MONAD_ONE` |

#### 重要协议变更 - `MONAD_ONE`

- **[网络参数]** 区块时间从 1s 减少到 **500 ms**
- **[网络参数]** 区块 gas 限制从 300M 减少到 **150M**（保持 gas 限制一致）
- **[EVM]** 交易基于 gas 限制而非 gas 消耗[收费](https://docs.monad.xyz/developer-essentials/gas-pricing)

#### 重要 RPC/SDK 变更

- **[RPC]** [交易状态](https://docs.monad.xyz/monad-arch/transaction-lifecycle)的用户体验改进。RPC 节点跟踪提交给它们的交易状态，以便向用户提供更新。