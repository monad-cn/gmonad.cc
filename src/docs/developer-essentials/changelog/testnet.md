# 测试网变更日志

这是一个精选列表，仅包含影响 [测试网](https://docs.monad.xyz/developer-essentials/testnets#testnet) 的更改。

**注意**⚠️

我们将更改分为以下类别：

- 协议更改（通常需要新的修订版本）

  - 通常标记为 **[EVM]**、**[共识]** 或 **[网络参数]**

- RPC/SDK 行为更改（通常标记为 **[RPC]**）

- 性能更改

  - 根据更改性质标记为 **[EVM]**、**[共识]** 或 **[RPC]**

- 内部/节点运维更改（通常标记为 **[节点运维]**）

## v0.11.3 [2025-10-14]

修订版本：[`MONAD_FOUR`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)（升级；于 2025-10-14 13:30 GMT 生效）

标签或哈希值：

- `monad-bft`：[标签 `v0.11.3-tn1`](https://github.com/category-labs/monad-bft/releases/tag/v0.11.3-tn1)
- `monad`：[哈希 `3e17265`](https://github.com/category-labs/monad/tree/3e17265fae80710229c657d725d821053cec940b)

#### 重要协议更改 - `MONAD_FOUR`

- [共识/EVM]质押功能已上线

  - （多个 PR；参见 [质押](https://github.com/category-labs/monad/tree/main/category/execution/monad/staking)）

  - 活跃验证器集合现在由质押预编译合约的链上状态决定

  - 从指定的 `staking_activation` epoch 开始生效

  - 注意：质押奖励直到 `staking_rewards_activation` epoch 才会激活（未来的时间点）

  - 外部奖励 - 允许向验证器池进行外部（非区块奖励）存款，参见 [monad PR #1625](https://github.com/category-labs/monad/pull/1625)

  - 同时在monad PR #1742中为质押预编译合约添加了额外事件

    - 添加了 `ValidatorRewarded`、`EpochChanged`、`ClaimRewards` 事件

- [共识/EVM]储备余额

   逻辑已上线

  - 参考：[monad-bft PR #2160](https://github.com/category-labs/monad-bft/pull/2160) 和 [monad PR #1537](https://github.com/category-labs/monad/pull/1537)
- 由于异步执行，共识在交易包含逻辑中无法获得最新状态。储备余额是一个缓冲区，为指定账户提供更简单的记账方式，以减轻在延迟窗口期内超支的可能性。
  - 每个 EOA 储备余额设置为 `10 MON`

- [共识/EVM]EIP-7702已上线

  - 参考：[monad-bft PR #2160](https://github.com/category-labs/monad-bft/pull/2160)、[monad-bft PR #2218](https://github.com/category-labs/monad-bft/pull/2218) 和 [monad PR #1362](https://github.com/category-labs/monad/pull/1362)

- [网络参数]设置单笔交易 gas 限制为 30M gas

  - 参考：[monad-bft PR #2246](https://github.com/category-labs/monad-bft/pull/2246)
  - 如 [Monad 初始规范提案](https://forum.monad.xyz/t/monad-initial-specification-proposal/195) 中所讨论
  
- [网络参数]将区块 gas 限制从 150M gas（375 Mgas/s）增加到200M  gas（500 Mgas/s）

  - 参考：[monad-bft PR #2266](https://github.com/category-labs/monad-bft/pull/2266)

- [网络参数]实现动态基础费用

  - 参考：[monad-bft PR #2207](https://github.com/category-labs/monad-bft/pull/2207)
  - 按照 [Monad 初始规范提案](https://forum.monad.xyz/t/monad-initial-specification-proposal/195) 中的规定
  - 目标 gas 为区块的 80%
  - 将最低基础费用从 50 MON-gwei 提高到 **100 MON-gwei**
  
- [EVM]启用EIP-2935

  + 区块哈希缓冲区

  - 参考：[monad PR #1520](https://github.com/category-labs/monad/pull/1520)

- [EVM]启用EIP-7951

   （P256VERIFY 预编译合约支持）

  - 参考：[monad PR #1518](https://github.com/category-labs/monad/pull/1518)

- [EVM]启用EIP-2537

   （BLS12-381 预编译合约）

  - 参考：[monad-bft PR #1342](https://github.com/category-labs/monad/pull/1342) 和 [monad-bft PR #1350](https://github.com/category-labs/monad/pull/1350)

- [EVM]将`CREATE`/`CREATE2` 的最大合约大小提高到 128 kb
  
  - 参考：[monad PR #1440](https://github.com/category-labs/monad/pull/1440)
  - 这使得 `CREATE`/`CREATE2` 与顶级合约创建交易保持一致，后者在 `MONAD_TWO` 中已提高限制。
  - 此前，由于错误，它们意外地被限制为以太坊的最大初始化代码大小（49.152 kb）

#### 重要 RPC/SDK 更改

- **[SDK]** 添加了对 [执行事件](https://docs.monad.xyz/execution-events) 的支持

- [RPC]扩展`eth_call`  对 preStateTracer 和 stateDiffTracer 的支持，配合`debug_traceCall`

  - 参考：[monad-bft PR #2275](https://github.com/category-labs/monad-bft/pull/2275) 和 [monad PR #1471](https://github.com/category-labs/monad/pull/1471)
  
- [RPC]支持`callTracer` 的`withLog`参数
  - 参考：[monad-bft PR #2400](https://github.com/category-labs/monad-bft/pull/2400)
- 如果 `withLog` 设置为 true，`callTracer` 会在跟踪输出中包含事件日志

#### 重要性能更改

- [EVM]内核级数据库读写缓存
  - 参考：[monad PR #1559](https://github.com/category-labs/monad/pull/1559)
  - 利用可用主机内存缓存最近的数据库操作 - 此缓存应该提高执行和 RPC 的性能
  
- [RPC]
   改进 RPC 数据库节点缓存并使其具有内存边界

  - 参考：[monad PR #1581](https://github.com/category-labs/monad/pull/1581)
- 注意 RPC CLI 标志的重命名：`--eth-call-executor-node-lru-size` 改为 `--eth-call-executor-node-lru-max-mem`，新增 `--triedb-node-lru-max-mem` 标志，两者默认值均为 100MB。

#### 重要内部更改

- [节点运维]移除`bft-fullnode` 二进制文件；现在仅有`bft` 二进制文件

  - 参考：[monad-bft PR #2072](https://github.com/category-labs/monad-bft/pull/2072)
  - `bft-fullnode` 从 `v0.11` 的 `deb` 包中移除
  
- **[节点运维]** 节点发现：为节点自身名称地址引入预检查

- [共识]区块同步：仅从连接的节点中选择区块同步节点

  - 参考：[monad-bft PR #2401](https://github.com/category-labs/monad-bft/pull/2401)

- [共识]Raptorcast：解码状态缓存的 DOS 保护

  - 参考：[monad-bft PR #2092](https://github.com/category-labs/monad-bft/pull/2092)

- [节点运维]二级 raptorcast 配置更改

  - 参考：[monad-bft PR #2378](https://github.com/category-labs/monad-bft/pull/2378)
  - 用 `enable_publisher` 和 `enable_client` 替换模糊的二级 raptorcast `mode` 参数
  
- [节点运维]动态重新加载优先级全节点

  - 参考：[monad-bft PR #2364](https://github.com/category-labs/monad-bft/pull/2364)

- [节点运维]修复 wal2json

  - 参考：[monad-bft PR #2404](https://github.com/category-labs/monad-bft/pull/2404)

- [节点运维/RPC]支持 RPC CLI 参数`ws-sub-per-conn-limit`
  - 参考：[monad-bft PR #2161](https://github.com/category-labs/monad-bft/pull/2161)
  - 设置每个连接的最大 websocket 订阅数（默认为 100）
  
- [节点运维/RPC]为高 eth-call 池添加配置选项

  - 参考：[monad-bft PR #2387](https://github.com/category-labs/monad-bft/pull/2387)

## v0.10.4 [2025-08-18]

修订版本：[`MONAD_THREE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)（未更改）

标签或哈希值：

- `monad-bft`：[标签 `v0.10.4`](https://github.com/category-labs/monad-bft/releases/tag/v0.10.4)
- `monad`：[哈希 `39c42e6`](https://github.com/category-labs/monad/tree/39c42e6ea5b2fccf8f4aa951da9d6281885511a5)

#### 重要 RPC/SDK 更改

- [RPC]移除 RPC 响应中 EIP-4844 相关字段。
- 从 RPC 返回的区块头将不再包含 `blobGasUsed`、`excessBlobGas` 和 `parentBeaconBlockRoot`。

#### 重要性能更改

- [共识]投票现在发送给当前轮次领导者。这是一项共识优化，可减少轮次超时造成的有效延迟

  - 参考：[monad-bft PR #2093](https://github.com/category-labs/monad-bft/pull/2093)

- [共识]缓存最近验证的法定人数证书

  - 参考：[monad-bft PR #2167](https://github.com/category-labs/monad-bft/pull/2167)

- [节点运维]追踪调用的启用现在通过`monad`（执行）命令行参数`--trace_calls` 控制。
  
  - 为了保持旧版行为，当前在 debian 包中启用了 `--trace_calls`。将来我们建议对验证器禁用它，而对 RPC 和存档节点启用它。
- 这允许投票验证器选择不计算追踪，因为追踪只对 RPC 节点需要。

#### 重要内部更改

- [共识]TC 转发给优先级和公共（非专用）全节点

  - 参考：[monad-bft PR #2149](https://github.com/category-labs/monad-bft/pull/2149)
- 在 `v0.10.4` 之前，所有全节点在超时事件中都会滞后于验证器，因为由于 TC 导致的轮次推进没有被转发（对专用全节点仍然如此）。
  - 结果，在超时后，全节点经常相对于过时状态将交易转发给接下来的三个领导者。这导致那些交易经常丢失，随后的区块相对空白。

- [节点运维]修复影响发布者模式验证器的二级 raptorcast（轮次间隙崩溃）错误

  - 参考：[monad-bft PR #2090](https://github.com/category-labs/monad-bft/pull/2090)

- [节点运维]`ledger-tail` 改进

  - 参考：[monad-bft PR #2144](https://github.com/category-labs/monad-bft/pull/2144)

  - 减少启动时的内存使用
  - `author_dns` 字段更改为 `author_address` 以反映 v10 地址的更改
  - 跟踪和记录超时和最终确认

- [共识]

   修复交易池账户预加载错误

  - 参考：[monad-bft PR #2108](https://github.com/category-labs/monad-bft/pull/2108)

## v0.10.3 [2025-08-12]

修订版本：[`MONAD_THREE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)（升级；立即生效 - 无时间限制）

#### 重要协议更改 - `MONAD_THREE`

- **[共识]** 共识机制从 [Fast-HotStuff](https://arxiv.org/abs/2010.11454) 升级到 [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft)。这是一个重大升级，增加了 *(i)* [对尾部分叉的抵抗能力](https://docs.monad.xyz/monad-arch/consensus/monad-bft#no-tail-forking) 和 *(ii)* [1 槽推测最终性](https://docs.monad.xyz/monad-arch/consensus/monad-bft#speculative-finality)
- **[网络参数]** 区块时间从 500 毫秒减少到 **400 毫秒**

#### 重要 RPC/SDK 更改

- [RPC]通过WebSocket和共享内存队列访问添加对实时数据的支持（文档即将推出）：
- Geth 实时事件（通过 WebSocket）
  - 带有 Monad 扩展的 Geth 实时事件（通过 WebSocket）
- 通过共享内存队列的实时数据，适用于在全节点主机上使用执行事件 SDK 的程序

#### 重要性能更改

- **[执行]** 切换到 JIT EVM。昂贵或频繁执行的合约的字节码被直接编译为本机代码以实现更快的执行
- **[执行]** 切换到使用基于文件指针的 IPC 来执行区块。此前，客户端使用预写日志（WAL），该日志没有利用可用的共识信息，可能导致可避免的执行

#### 重要内部更改

- **[节点运维]** 添加节点发现
- **[节点运维]** 添加全节点 [RaptorCast](https://docs.monad.xyz/monad-arch/consensus/raptorcast)，使全节点网络可扩展

## v0.9.3 [2025-05-29]

修订版本：[`MONAD_TWO`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)（未更改）

#### 重要 RPC/SDK 更改

- [RPC]`eth_call` 和`eth_estimateGas`限制
  - RPC 提供者现在可以为`eth_call` 和`eth_estimateGas`设置单个交易的最大 gas 限制

    - 此前限制总是区块 gas 限制（150M），现在 RPC 提供者可以选择（默认：30M）
    - 通过 `--eth-call-provider-gas-limit` 和 `--eth-estimate-gas-provider-gas-limit` 控制

  - 在执行`eth_call` 和`eth_estimateGas` 时添加排队的最大超时时间

    - 通过 `--eth_call_executor_queuing_timeout` 控制

#### 重要性能更改

- [RPC]通过为便宜和昂贵的`eth_call`操作维护单独的队列来改进整体`eth_call`性能，以便便宜的`eth_call`操作不会在昂贵的操作后排队。
  - 这添加了两个新的 RPC 错误字符串：
  - `failure to submit eth_call to thread pool: queue size exceeded`
    - `failure to execute eth_call: queuing time exceeded timeout threshold`

- [RPC]为`eth_getLogs`添加存档索引以支持带有地址和/或主题过滤器的查询
  
  - 这使得可以高效地查询更大的区块范围，工作量与匹配日志的数量成正比，而不是与范围内的区块数量成正比

- **[执行]** 更好地限制 TrieDB 遍历

#### 重要内部更改

- **[节点运维]** 慢速状态同步客户端插入的性能改进

- **[节点运维]** 修复由过早软重置造成的执行延迟和历史长度突然下降的错误

- [节点运维]`keystore`生活质量改进  
  - 支持从十六进制字符串格式的私钥导入（此前需要转换为 json 文件）
  - 通过 `--help` 命令提供更有用的文档

## testnet-1 活跃集扩展 [2025-05-02]

#### 重要内部更改

- **[网络参数]** 测试网验证器集从 72 个节点扩展到 **99** 个节点

## v0.9.2 [2025-04-05]

修订版本：[`MONAD_TWO`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)（未更改）

#### 重要性能更改

- **[RPC]** 更新 `eth_call` 执行实现 - 使用更少的线程实现与 `v0.9.1` 相同的并发性

#### 重要内部更改

- **[节点运维]** 支持更快的 [statesync](https://docs.monad.xyz/monad-arch/consensus/statesync) 机制
- **[RPC]** 节点进行状态同步时 RPC 不再接受请求
- **[节点运维]** 对节点间状态同步流量传输方式的一些可靠性和效率改进
- **[节点运维]** 修复执行崩溃错误（`monad::mpt::deserialize_node_from_buffer`，`'Resource temporarily unavailable`）

- **[节点运维]** 修复导致节点 OOM 故障的无界区块同步请求错误
- **[节点运维]** 移除启动时的 DNS 解析恐慌

## v0.9.1 [2025-03-24]

修订版本：[`MONAD_TWO`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)（未更改）

#### 重要内部更改

- **[节点运维]** 修复区块同步错误
- **[节点运维]** 状态同步的可靠性和效率改进

## v0.9.0 [2025-03-14]

修订版本：[`MONAD_TWO`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)（升级；于 2025-03-14 19:00 GMT 生效）

#### 重要协议更改 - `MONAD_TWO`

- [EVM]最大合约大小从 24kb 增加到128kb
- [123 kb 合约示例](https://testnet.monadexplorer.com/address/0x0E820425e07E4a992C661E4B970e13002d6e52B9?tab=Contract)

#### 重要 RPC/SDK 更改

- [RPC] `debug_traceTransaction`  修复
  - 修复了在一个交易中只追踪前 100 个调用的错误
- 在响应数据中添加了 `error` 和 `revertReason` 字段

#### 重要性能更改

- **[共识]** 数据平面 v2 - 更简单、更高效的实现；广播时间的小幅性能改进
- **[RPC]** `eth_call` 的 RPC 性能改进

- **[RPC]** 移除通过 RPC 接收的原始交易上的冗余发送者恢复操作

#### 重要内部更改

- **[节点运维]** 状态同步改进以减轻对上游验证器节点的负面性能影响

- **[RPC]** 在 RPC 交易验证中添加 EIP-2 签名验证
- **[节点运维]** 各种追踪、日志记录和指标添加
- **[共识]** 处理无效符号时的 RaptorCast 性能改进

## v0.8.1 [2025-02-14]

修订版本：[`MONAD_ONE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions)（升级；于 2025-02-14 19:00 GMT 生效）

#### 重要协议更改 - `MONAD_ONE`

- **[网络参数]** 区块时间从 1 秒减少到 **500 毫秒**
- **[网络参数]** 区块 gas 限制从 300M 减少到 **150M**（保持 gas 限制一致）
- **[EVM]** 交易基于 gas 限制而非 gas 消耗进行[收费](https://docs.monad.xyz/developer-essentials/gas-pricing)

#### 重要 RPC/SDK 更改

- **[RPC]** [交易状态](https://docs.monad.xyz/monad-arch/transaction-lifecycle)的用户体验改进。RPC 节点跟踪提交给它们的交易状态，以向用户提供更新。