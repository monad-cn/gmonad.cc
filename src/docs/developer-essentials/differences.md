# Monad 和 Ethereum 的差异

本文档从智能合约开发者的角度总结了 Monad 和 Ethereum 之间的显著行为差异。

## 虚拟机

1. 合约最大大小为 128KB（相比 Ethereum 的 24.5KB 有所提升）。
2. 由于 Monad 优化，一些操作码和预编译合约的定价被重新调整，以重新平衡资源稀缺性。详见 [操作码定价](https://docs.monad.xyz/developer-essentials/opcode-pricing)。
3. 支持 [RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md) 中的 `secp256r1` (P256) 验证预编译合约。详见 [预编译合约](https://docs.monad.xyz/developer-essentials/precompiles)。

## 交易

1. 交易费用基于 gas limit 而非 gas 使用量计算，即从发送方余额中扣除的总代币数为 `value + gas_bid * gas_limit`。如 [Monad 中的 Gas](https://docs.monad.xyz/developer-essentials/gas-pricing) 所述，这是异步执行的 DOS 防护措施。
2. 共识和执行利用 [储备余额](https://docs.monad.xyz/developer-essentials/reserve-balance) 机制来确保共识中包含的所有交易都能支付费用。该机制在共识时对交易包含施加轻微限制，并定义了交易在执行时回滚的特定条件。
3. 由于储备余额机制，您可能会看到区块链中的交易最终因试图花费超过账户余额的 MON 而失败。这些交易仍会支付 gas 费用，并且是有效交易，其结果是执行回滚。这并非协议差异，因为许多回滚的 Ethereum 交易也会被包含在链中，但这可能与预期不同。[详细讨论](https://docs.monad.xyz/developer-essentials/reserve-balance#transactions-that-are-included-but-revert)。
4. 不支持交易类型 3（EIP-4844 类型，即 blob 交易）。
5. 没有全局内存池。为提高效率，交易会转发给接下来的几个领导者，如 [本地内存池](https://docs.monad.xyz/monad-arch/consensus/local-mempool) 所述。

## 历史数据

1. 由于 Monad 的高吞吐量，全节点不提供对任意历史状态的访问，因为这会需要过多存储空间。更详细的讨论请参见 [历史数据](https://docs.monad.xyz/developer-essentials/historical-data)。

## RPC

参见：[RPC 差异](https://docs.monad.xyz/reference/rpc-differences)