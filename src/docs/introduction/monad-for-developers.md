# 面向开发者的 Monad

> **说明**  
> 本页概述了开发者为什么选择 Monad。  
> 若需了解在 Monad 上开发或重新部署的具体信息，请参阅 [开发者部署摘要](https://docs.monad.xyz/developer-essentials/summary)。

Monad 是一个以太坊兼容的一级区块链（Layer-1），具备 **10,000 tps** 吞吐量、**400ms 区块频率** 与 **800ms 终局确认时间**。

Monad 的以太坊虚拟机（EVM）实现遵循 **Pectra 分叉版本** 规范。

Monad 客户端已通过历史以太坊交易进行模拟测试，生成的 Merkle 根与以太坊完全一致。

Monad 还提供 **完整的以太坊 RPC 兼容性**，用户可通过熟悉的工具（如 Etherscan、Phantom、MetaMask）与 Monad 交互。

Monad 在保持向后兼容的同时，通过以下创新实现了性能的重大提升：

- [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft)：高性能、抗尾分叉的拜占庭容错（BFT）共识机制  
- [RaptorCast](https://docs.monad.xyz/monad-arch/consensus/raptorcast)：高效的区块传输机制  
- [异步执行](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution)：通过共识与执行流水线化提升执行时间预算  
- [并行执行](https://docs.monad.xyz/monad-arch/execution/parallel-execution) 与 [即时编译（JIT）](https://docs.monad.xyz/monad-arch/execution/native-compilation)：高效的交易执行  
- [MonadDb](https://docs.monad.xyz/monad-arch/execution/monaddb)：高效的状态访问

虽然 Monad 支持并行执行与流水线，但需注意，Monad 的区块结构仍为线性，且每个区块中的交易保持线性顺序。

第一个 Monad 客户端由 [Category Labs](https://www.category.xyz/) 从零开发，使用 **C++** 和 **Rust** 编写，源码以 `GPL-3.0` 协议开源：

- [`monad-bft`](https://github.com/category-labs/monad-bft)
- [`monad`](https://github.com/category-labs/monad)

---

## 交易（Transactions）

| 项目 | 说明 |
| ---- | ---- |
| 地址空间 | 与以太坊相同（20 字节地址，使用 ECDSA） |
| 交易格式 / 类型 | [与以太坊一致](https://ethereum.org/en/developers/docs/transactions/)。Monad 使用 [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718) 引入的 typed transaction envelope，采用 [RLP](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/) 编码。支持交易类型 0（传统）、1（EIP-2930）、2（EIP-1559，当前以太坊默认）以及 4（EIP-7702）。详情参见 [Transactions](https://docs.monad.xyz/developer-essentials/transactions)。 |
| EIP-7702 | 已支持。参见 [EIP-7702 on Monad](https://docs.monad.xyz/developer-essentials/eip-7702)。 |
| EIP-155 重放保护 | Monad 协议层面允许 pre [EIP-155](https://eips.ethereum.org/EIPS/eip-155) 交易，因此不建议复用曾发送过 pre-EIP-155 交易的以太坊账户。详见 [讨论](https://docs.monad.xyz/developer-essentials/transactions#transactions-without-a-chain_id)。 |
| 钱包兼容性 | 兼容标准以太坊钱包（如 Phantom、MetaMask）。仅需修改 RPC URL 与链 ID。 |
| Gas 定价 | Monad 兼容 EIP-1559；基础费与优先费机制与以太坊一致。基础费由动态控制器调整，增长较慢、下降较快。详见 [Gas 定价详情](https://docs.monad.xyz/developer-essentials/gas-pricing#base_price_per_gas-controller)。**交易费用基于 gas limit 而非实际使用量计费**，即扣费公式为 `value + gas_price * gas_limit`。该机制用于防范异步执行下的 DoS 攻击。详见 [Gas in Monad](https://docs.monad.xyz/developer-essentials/gas-pricing)。 |

---

## 智能合约（Smart Contracts）

| 项目 | 说明 |
| ---- | ---- |
| 操作码（Opcodes） | Monad 与以太坊（Pectra 分叉）在字节码层完全兼容。支持 [Pectra 分叉下所有操作码](https://www.evm.codes/)。 |
| 操作码定价 | 与以太坊相同，仅对部分操作码调整了定价以反映资源稀缺性变化。详见 [详情](https://docs.monad.xyz/developer-essentials/opcode-pricing)。 |
| 预编译合约（Precompiles） | 支持以太坊 Pectra 分叉下的所有预编译（`0x01`–`0x11`），并新增 `0x0100`（[RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md)）。详见 [Precompiles](https://docs.monad.xyz/developer-essentials/precompiles)。 |
| 最大合约体积 | 128 KB（以太坊为 24.5 KB） |

---

## 共识（Consensus）

| 项目 | 说明 |
| ---- | ---- |
| Sybil 抵抗机制 | 权益证明（PoS） |
| 委托机制 | 支持（协议内实现） |
| 共识算法 | [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft)，首个解决 HotStuff 风格流水线共识中“尾分叉”问题的 BFT 算法，实现高吞吐（10,000+ tps）、400ms 区块时间、800ms 终局、线性消息复杂度及大规模验证者集（200+）。 |
| 区块传播机制 | [RaptorCast](https://docs.monad.xyz/monad-arch/consensus/raptorcast) |
| 区块频率 | 400 ms |
| 终局确认 | 400 ms 推测性终局；800 ms 完全终局 |
| Mempool | 领导者维护 [本地 Mempool](https://docs.monad.xyz/monad-arch/consensus/local-mempool)，RPC 节点将交易转发给下一个 3 个领导者；若未观察到上链则重复 2 次。未来可能支持更多转发。 |
| 共识参与者 | 直接参与节点需质押至少 `MinStake`，并在质押权重前 `MaxConsensusNodes` 名内。这些参数在代码中设定。 |
| 异步执行 | Monad 将共识与执行解耦并流水线化。节点先对交易顺序达成共识，再执行交易（详见 [Asynchronous Execution](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution)）。区块提案包含交易顺序列表与延迟 `k=3` 区块的状态 Merkle 根。Monad 引入 [Reserve Balance](https://docs.monad.xyz/developer-essentials/reserve-balance) 机制，确保仅包含资金充足的交易。 |
| 状态确定性 | 在共识达成时确定终局顺序，全节点可在 800ms 内完成区块执行。状态根延迟仅用于校验计算正确性。 |

---

## 执行（Execution）

每个区块的执行阶段在共识完成后开始，节点同时可继续处理后续区块的共识。

### 并行执行（Parallel Execution）

交易线性排序，目标状态应与顺序执行结果一致。  
Monad 实现了 [并行执行](https://docs.monad.xyz/monad-arch/execution/parallel-execution)：

- 执行器为独立虚拟机实例，Monad 并行运行多个执行器。  
- 每笔交易生成执行结果，包括 **输入**（`(ContractAddress, Slot, Value)`，SLOAD 读取）与 **输出**（`(ContractAddress, Slot, Value)`，SSTORE 写入）。  
- 执行结果初始为待定状态，按原交易顺序提交。提交时校验输入与当前状态匹配；若不一致则重调度执行。此并发控制机制确保最终状态与顺序执行一致。  
- 重执行开销较低，因大部分输入已缓存；重执行后输入集可能变化。  

### MonadDb：高性能状态后端

所有活跃状态存储于 [MonadDb](https://docs.monad.xyz/monad-arch/execution/monaddb)，其针对 SSD 优化以高效存储 Merkle Trie 数据。更新以批处理方式应用，以便快速更新 Merkle 根。  
MonadDb 实现了内存缓存，并使用 [asio](https://think-async.com/Asio/) 进行高效异步读写。节点建议配置 **32 GB RAM** 以获得最佳性能。

---

## 与以太坊的对比（用户视角）

| 属性 | Ethereum | Monad |
| ---- | -------- | ------ |
| **交易吞吐量（tps）** | ~10 | ~10,000 |
| **区块频率** | 12 秒 | 400 ms |
| **终局确认时间** | [约 2 epochs（12–18 分钟）](https://hackmd.io/@prysmaticlabs/finality) | 800 ms |
| **字节码标准** | EVM（[Pectra fork](https://www.evm.codes/)） | EVM（[Pectra fork](https://www.evm.codes/)） |
| **预编译合约** | `0x01`–`0x11` | `0x01`–`0x11` + `0x0100`（[RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md)） |
| **最大合约体积** | 24.5 KB | 128 KB |
| **RPC API** | [Ethereum RPC](https://ethereum.org/en/developers/docs/apis/json-rpc/) | [Monad RPC](https://docs.monad.xyz/reference/json-rpc)（与以太坊基本一致） |
| **加密算法** | ECDSA | ECDSA |
| **账户模型** | 公钥 keccak-256 的后 20 字节 | 同上 |
| **共识机制** | Gasper（Casper-FFG + LMD-GHOST） | [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft) |
| **Mempool 类型** | 全局 | 本地 |
| **交易排序** | 由领导者决定（通常 PBS） | 由领导者决定（默认优先 gas 拍卖） |
| **Sybil 抵抗机制** | PoS | PoS |
| **是否支持委托** | 否（通过 LST 实现伪委托） | 是（见 [Staking](https://docs.monad.xyz/developer-essentials/staking/)） |
| **硬件要求（全节点）** | 4 核 CPU / 32 GB RAM / 4 TB SSD / 25 Mbit/s 带宽（[参考](https://eips.ethereum.org/EIPS/eip-7870)） | 16 核 CPU / 32 GB RAM / 2×2 TB SSD / 100 Mbit/s 带宽（[详情](https://docs.monad.xyz/node-ops/hardware-requirements)） |

---

## 开发工具与基础设施

主流以太坊开发工具已支持 Monad 测试网。  
请参阅 [Tooling and Infrastructure](https://docs.monad.xyz/tooling-and-infra/) 获取各类支持列表。

---

## 下一步

Monad 公共测试网现已上线。  
请访问 [Network Information](https://docs.monad.xyz/developer-essentials/network-information) 以开始使用。

熟悉 Monad 架构后，请前往 [开发者部署摘要](https://docs.monad.xyz/developer-essentials/summary) 了解部署细节。
