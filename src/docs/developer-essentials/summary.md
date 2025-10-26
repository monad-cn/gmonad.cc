# 开发者部署概要

本页面总结了在 Monad 上开发或部署智能合约时需要了解的内容。

## 网络信息

有关链 ID、公共 RPC、区块浏览器和规范合约部署，请参阅[网络信息](https://docs.monad.xyz/developer-essentials/network-information)。

## 账户

|               |                                                              |
| ------------- | ------------------------------------------------------------ |
| 地址空间      | 与以太坊相同的地址空间（ECDSA 公钥的最后 20 个字节）         |
| EIP-7702      | 支持。请参阅 [EIP-7702 参考文档](https://docs.monad.xyz/developer-essentials/eip-7702) |

## 智能合约

有关部署和验证指南，请参阅：

- [部署合约](https://docs.monad.xyz/guides/deploy-smart-contract/)
- [验证合约](https://docs.monad.xyz/guides/verify-smart-contract/)

|                   |                                                              |
| ----------------- | ------------------------------------------------------------ |
| 操作码            | 支持 Pectra 分叉版本的所有[操作码](https://www.evm.codes/)。 |
| 预编译合约        | 支持 Pectra 分叉版本的所有以太坊预编译合约（`0x01` 到 `0x11`），以及预编译合约 `0x0100`（[RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md)）。请参阅[预编译合约](https://docs.monad.xyz/developer-essentials/precompiles) |
| 最大合约大小      | 128 kb（从以太坊的 24.5 kb 增加）                            |

## 交易类型

完整文章：[交易](https://docs.monad.xyz/developer-essentials/transactions)

|                   |                                                              |
| ----------------- | ------------------------------------------------------------ |
| 交易类型          | 支持：0（"传统"）1（"EIP-2930"）2（"EIP-1559"，以太坊上的"默认"）4（["EIP-7702"](https://docs.monad.xyz/developer-essentials/eip-7702)）不支持：3（"EIP-4844"） |

## Gas 限制

|                           |                                                        |
| ------------------------- | ------------------------------------------------------ |
| 单笔交易 gas 限制         | 30M gas                                                |
| 区块 gas 限制             | 200M gas                                               |
| 区块 gas 目标             | 80%（160M gas）                                        |
| Gas 吞吐量                | 500M gas/秒（200M gas/区块 除以 0.4 秒/区块）          |

## Gas 定价

完整文章：[Gas 定价](https://docs.monad.xyz/developer-essentials/gas-pricing)

|                   |                                                              |
| ----------------- | ------------------------------------------------------------ |
| Gas 收费          | 收取的是 **gas 限制**。即：从发送者余额中扣除的总代币为 `value + gas_price * gas_limit`。请参阅[讨论](https://docs.monad.xyz/developer-essentials/gas-pricing#gas-limit-not-gas-used)。 |
| EIP-1559 动态机制 | Monad 兼容 EIP-1559；基础费用和优先费用的工作方式与以太坊相同。[EIP-1559 解释器](https://docs.monad.xyz/developer-essentials/gas-pricing#eip-1559-compatibility) |
| 基础费用          | Monad 使用不同的基础费用控制器（[详情](https://docs.monad.xyz/developer-essentials/gas-pricing#base_price_per_gas-controller)），最低基础费用为 100 MON-gwei（`100 * 10^-9 MON`） |

## 操作码定价

完整文章：[操作码定价](https://docs.monad.xyz/developer-essentials/opcode-pricing)

操作码定价与以太坊相同（请参阅：[evm.codes](https://www.evm.codes/)），**除了**下面由于 Monad 优化导致资源相对稀缺性需要重新权衡的重定价。

| 项目                                                         | 以太坊 | Monad  | 备注                                                         |
| ------------------------------------------------------------ | ------ | ------ | ------------------------------------------------------------ |
| 冷访问成本 - 账户                                            | 2,600  | 10,100 | 受影响的操作码：`BALANCE`、`EXTCODESIZE`、`EXTCODECOPY`、`EXTCODEHASH`、`CALL`、`CALLCODE`、`DELEGATECALL`、`STATICCALL`、`SELFDESTRUCT` 请参阅[详情](https://docs.monad.xyz/developer-essentials/opcode-pricing#cold-access-cost) |
| 冷访问成本 - 存储                                            | 2,100  | 8,100  | 受影响的操作码：`SLOAD`、`SSTORE`。请参阅[详情](https://docs.monad.xyz/developer-essentials/opcode-pricing#cold-access-cost) |
| `ecRecover`、`ecAdd`、`ecMul`、`ecPairing`、`blake2f`、`point_eval` 预编译合约 |        |        | 请参阅[详情](https://docs.monad.xyz/developer-essentials/opcode-pricing#precompiles)  预编译合约 `0x01`、`0x06`、`0x07`、`0x08`、`0x09`、`0x0a` |

## 时间考量

|                      |                                                              |
| -------------------- | ------------------------------------------------------------ |
| 区块频率             | 400 ms                                                       |
| `TIMESTAMP` 操作码   | 与以太坊一样，`TIMESTAMP` 是秒级粒度的 unix 时间戳。由于区块间隔为 400 ms，这意味着 2-3 个区块可能具有相同的时间戳。 |
| 最终性               | 区块在两个区块后（800 ms）最终确认。一旦区块最终确认，就无法重组。有关更全面的讨论，请参阅 [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft)。 |
| 推测性最终性         | 区块可以在一个区块后（400 ms）[推测性最终确认](https://docs.monad.xyz/monad-arch/consensus/monad-bft#speculative-finality)，此时标记为 `Voted` 阶段。  推测性最终性在极少数情况下可能回滚（请参阅[此处](https://docs.monad.xyz/monad-arch/consensus/monad-bft#speculative-finality)的完整讨论），但大多数前端应该能够基于推测性最终性反映状态。 |

## 内存池

完整文章：[本地内存池](https://docs.monad.xyz/monad-arch/consensus/local-mempool)

Monad 没有全局内存池，因为这种方法不适合高性能区块链。

每个验证器维护一个本地内存池，其中包含它知道的交易。当 RPC 收到交易时，它会策略性地将其转发给即将到来的领导者，如果没有观察到交易被包含，则重复此过程。

尽管这是 Monad 设计的重要组成部分，但通常不应影响智能合约开发者的系统设计。

## 并行执行和 JIT 编译

Monad 利用[并行执行](https://docs.monad.xyz/monad-arch/execution/parallel-execution)和 [JIT 编译](https://docs.monad.xyz/monad-arch/execution/native-compilation)来提高效率，但智能合约开发者无需为此改变任何内容。

在 Monad 中，交易仍然是线性排序的，执行的唯一正确结果是交易串行执行时的结果。并行执行的所有方面都可以被智能合约开发者视为实现细节。请参阅[进一步讨论](https://docs.monad.xyz/monad-arch/execution/parallel-execution)。

## 异步执行

完整文章：[异步执行](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution)

Monad 利用异步执行来提高效率，但大多数开发者无需改变任何内容。

具有重要链下金融逻辑的开发者（例如交易所、桥接和稳定币/RWA 发行者）应等到区块达到 [`Verified`](https://docs.monad.xyz/monad-arch/consensus/block-states#verified) 阶段（即状态根最终性），比 [`Finalized`](https://docs.monad.xyz/monad-arch/consensus/block-states#finalized) 晚三个区块，以确保整个网络与其自己节点对最终确认区块的本地执行一致。

***更多详情***：异步执行是一种技术，允许 Monad 通过将共识与执行解耦来大幅提高执行吞吐量。在异步执行中，验证器**先投票，后执行** - 因为一旦确定交易顺序，状态就确定了。之后，每个节点在本地执行。三个区块后有一个[延迟默克尔根](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution#delayed-merkle-root)，确认网络获得了与本地执行相同的状态树。

从开发者角度：

- 有人通过您的前端提交与您的智能合约交互的交易。您记录哈希。
- 交易被包含在区块中。
- 区块在一个区块后（`T+1`）获得 [`Voted`](https://docs.monad.xyz/monad-arch/consensus/block-states#voted)（推测性最终确认）。
- 区块在一个区块后（`T+2`）获得 [`Finalized`](https://docs.monad.xyz/monad-arch/consensus/block-states#finalized)。
- 区块在三个区块后（`T+5`）获得 [`Verified`](https://docs.monad.xyz/monad-arch/consensus/block-states#verified)（状态根最终确认）。

您通过调用 [`eth_getTransactionReceipt`](https://docs.monad.xyz/reference/json-rpc/eth_getTransactionReceipt) 监听交易收据。收据将在区块变为 `Voted`（推测性最终确认）后首次可用。

您选择何时更新 UI 以向用户提供反馈取决于风险偏好，但对于大多数应用程序，当区块变为 `Voted` 时这样做是合理的，因为推测性最终性回滚极其罕见。更保守的方法是等到区块 `Finalized`，因为那时您永远不必处理重组。等到 `Verified` 通常不是必需的（除了前述具有链下金融逻辑的开发者）。

## 储备余额

完整文章：[储备余额](https://docs.monad.xyz/developer-essentials/reserve-balance)

Monad 引入储备余额机制以启用异步执行。

储备余额机制对交易在共识时间何时可以被包含施加轻微限制，并施加一些交易在执行时间会回滚的条件。

储备余额机制旨在在异步执行下保持安全性而不干扰正常使用模式。大多数用户和开发者无需担心储备余额约束，但如果您有兴趣了解更多，请查看[文档](https://docs.monad.xyz/developer-essentials/reserve-balance)。

| 参数           | 值     |
| -------------- | ------ |
| 默认储备余额   | 10 MON |

## 读取区块链数据

支持以下方法读取区块链数据：

|                  |                                                              |
| ---------------- | ------------------------------------------------------------ |
| JSON-RPC         | 请参阅 [RPC API](https://docs.monad.xyz/reference/json-rpc)。Monad 支持来自以太坊的所有标准 RPC 方法。差异在 [RPC 差异](https://docs.monad.xyz/reference/rpc-differences) 中注明。有关速率限制，请参阅[网络信息](https://docs.monad.xyz/developer-essentials/network-information#public-rpc-endpoints)。 |
| WebSocket        | 请参阅 [WebSocket 指南](https://docs.monad.xyz/reference/websockets)。  Monad 实现了 `eth_subscribe` 方法，支持以下订阅类型：`newHeads` 和 `logs`（用于等待最终确认的 Geth 风格订阅）`monadNewHeads` 和 `monadLogs`（类似，但在收到提案后立即发布）不支持 `syncing` 和 `newPendingTransactions` 订阅类型。有关更多详情，请参阅[实时数据源](https://docs.monad.xyz/monad-arch/realtime-data/data-sources)。 |
| 执行事件         | 请参阅[执行事件](https://docs.monad.xyz/execution-events/)。  执行事件系统允许开发者构建高性能应用程序，通过共享内存队列从 Monad 节点接收最低延迟的事件数据。 |

您还可以使用支持的[索引器](https://docs.monad.xyz/tooling-and-infra/indexers/)。

### 历史数据

Monad 全节点提供对所有历史账本数据（区块、交易、收据、事件和跟踪）的访问。

Monad 全节点不提供对任意历史状态的访问。

请参阅[此处](https://docs.monad.xyz/developer-essentials/historical-data)对历史数据的进一步讨论。

## 规范合约地址

请参阅[规范合约](https://docs.monad.xyz/developer-essentials/network-information#canonical-contracts-on-testnet)

## 支持的第三方基础设施

请参阅[工具和基础设施](https://docs.monad.xyz/tooling-and-infra/)

## 源代码

- [monad-bft](https://github.com/category-labs/monad-bft)（共识）
- [monad](https://github.com/category-labs/monad)（执行）