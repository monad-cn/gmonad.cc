# Gas 定价

## 概述

Monad 与以太坊一样，基于交易的复杂度收取交易处理费用。复杂度以 **gas** 为单位进行衡量。

本页总结了 gas 的收费方式，即交易的 gas 与用户需要支付的 MON 代币数量之间的转换关系。另一个页面 [操作码定价](https://docs.monad.xyz/developer-essentials/opcode-pricing) 描述了每个操作码以 gas 为单位的成本。

| 功能                  | 详情                                                         |
| --------------------- | ------------------------------------------------------------ |
| **Gas 收费**          | 交易收费的 gas 是 **gas 限制**。[讨论](https://docs.monad.xyz/developer-essentials/gas-pricing#gas-limit-not-gas-used) |
| **单位 gas 价格**     | 兼容 EIP-1559，即每单位 gas 支付的价格是系统控制的基础费用和用户指定的优先费用之和。[讨论](https://docs.monad.xyz/developer-essentials/gas-pricing#eip-1559-compatibility) |
| **基础费用**          | 基础费用（即 `base_price_per_gas`）遵循动态控制器，类似于 EIP-1559 控制器但增长较慢、下降较快。[详情](https://docs.monad.xyz/developer-essentials/gas-pricing#base_price_per_gas-controller) |
| **最低基础费用**      | 100 MON-gwei (`100 * 10^-9 MON`)                            |
| **区块 gas 限制**     | 200M gas                                                     |
| **交易 gas 限制**     | 30M gas                                                      |
| **操作码定价**        | 参见 [操作码定价](https://docs.monad.xyz/developer-essentials/opcode-pricing) |
| **交易排序**          | 默认 Monad 客户端行为是根据优先 Gas 拍卖（按总 gas 价格降序）对交易进行排序。 |

注意

这些变更在 [Monad 初始规范提案](https://category-labs.github.io/category-research/monad-initial-spec-proposal.pdf) 中有正式说明

## Gas 定义

用户经常混淆的一个点是交易的 **gas**（工作单位）和交易的 **gas 价格**（每单位工作的原生代币价格）之间的区别。

| 功能                          | 定义                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| **Gas**                       | 工作单位。Gas 衡量网络处理某事所需的工作量。由于网络具有多种资源（网络带宽、CPU、SSD 带宽和状态增长），gas 本质上是从多维度到单一维度的投影。 |
| **Gas 价格 (price_per_gas)**  | **处理一单位** gas 所支付的 **价格**（以原生代币计算）。      |
| **Gas 限制**                  | 允许交易消耗的 **gas 单位的最大数量**。                      |

## Gas 限制，非 Gas 使用量

在 Monad 中，交易收费的 gas 是交易中设置的 gas 限制，而不是执行过程中使用的 gas。

这是支持异步执行的设计决定。在异步执行下，领导者在执行之前构建区块（验证者对区块有效性投票）。

如果协议收费 `gas_used`，用户可以提交一个具有大 `gas_limit` 但实际消耗很少 gas 的交易。这个交易会占用区块 gas 限制中的大量空间，但不会为占用该空间支付很多费用，从而开启了 DOS 攻击向量。

```text
gas_paid = gas_limit * price_per_gas
```



## EIP-1559 兼容性

Monad 支持 EIP-1559。

EIP-1559（类型 2）交易具有参数 `priority_price_per_gas` 和 `max_price_per_gas`，与 `base_price_per_gas`（每个区块变化的系统参数）一起，确定交易的 gas 出价：

```text
price_per_gas = min(base_price_per_gas + priority_price_per_gas, max_price_per_gas)
```



注意：

- `base_price_per_gas` 是每个区块变化的系统参数。同一个区块中的每个交易都具有相同的 `base_price_per_gas`
- 用户在签名交易时指定 `priority_price_per_gas` 和 `max_price_per_gas`
- 由于同一区块中的每个人都会支付相同的 `base_price_per_gas`，`priority_price_per_gas` 是用户为优先处理其交易而支付更多费用的方式。
- 由于用户不确定 `base_price_per_gas`，`max_price_per_gas` 是限制他们最终可能支付金额的保障措施。当然，如果该值设置得过低，交易将不会被选中包含在区块中。

[这篇](https://www.blocknative.com/blog/eip-1559-fees) 文章提供了 EIP-1559 gas 定价的另一个很好的解释。

## `base_price_per_gas` 控制器

Monad 使用与以太坊不同的 `base_price_per_gas` 控制器：

![图片描述](./images/gas-pricing.png) 

与以太坊中的 `base_price_per_gas` 控制器相比，此控制器增长更慢、下降更快。这是为了避免由于 `base_price_per_gas` 定价过高而导致区块空间利用不足。

有关 Monad 控制器设计考虑和行为的更全面讨论，请查看 Category Labs 的[这篇](https://www.category.xyz/blogs/redesigning-a-base-fee-for-monad)博客文章。

## 开发者建议

### 如果 gas 限制是常量，请显式设置

许多链上操作具有固定的 gas 成本。最简单的例子是原生代币转账总是花费 21,000 gas，但还有很多其他例子。

对于提前知道交易 gas 成本的操作，建议在将交易交给钱包之前直接设置它。这提供了几个好处：

- 它减少了延迟并为用户提供更好的体验，因为钱包不必调用 `eth_estimateGas` 并等待 RPC 响应。
- 它保持对用户体验的更大控制，避免钱包在边缘情况下设置高 gas 限制的情况，如下面的警告中所述。

警告

包括 MetaMask 在内的一些钱包已知具有以下行为：当调用 `eth_estimateGas` 且合约调用还原时，它们将此交易的 gas 限制设置为非常高的值。

这是钱包放弃设置 gas 限制并接受执行时任何 gas 使用量的方式。然而，这在收费完整 gas 限制的 Monad 上是没有意义的。

合约调用还原发生在用户试图做不可能的事情时。例如，用户可能试图铸造已经售罄的 NFT。

如果提前知道 gas 限制，显式设置它是最佳实践，因为它确保钱包不会意外处理这种情况。