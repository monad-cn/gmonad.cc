# 变更日志

我们提供以下几种变更日志：

- [发布版本](https://docs.monad.xyz/developer-essentials/changelog/releases)：所有重要发布版本的列表。某些发布版本仅适用于特定网络。
- [测试网变更日志](https://docs.monad.xyz/developer-essentials/changelog/testnet)：仅包含对 `testnet` 的变更
- [测试网-2变更日志](https://docs.monad.xyz/developer-essentials/changelog/testnet-2)：仅包含对 `testnet-2` 的变更

## Monad 变更机制

[修订版本(Revisions)](https://docs.monad.xyz/developer-essentials/changelog/#revisions) 是对协议的行为变更（与客户端效率改进相对，效率改进不影响正确性）。修订版本在其他区块链中被称为硬分叉。

Monad 使用计数器跟踪修订版本。客户端代码通常在未来时间戳激活修订版本，以便验证者可以提前就是否接受修订版本和升级达成一致。当未来时间戳到达时，绝大多数验证者已经升级，并同步更新其行为，使链能够继续运行而不会暂停。

存在多个网络（由于有几个测试网络）。每个网络采用各修订版本的时间表不同。这些时间表在 [ChainConfigs](https://docs.monad.xyz/developer-essentials/changelog/#chainconfigs) 中跟踪。

节点软件正在积极开发中，偶尔会产生[发布版本](https://docs.monad.xyz/developer-essentials/changelog/releases)。发布版本在不同网络以不同时间表推出，并非所有发布版本都适用于所有网络。

### 修订版本

Monad 修订版本是协议的重大行为变更，定义在 [`revision.h`](https://github.com/category-labs/monad/blob/main/category/vm/evm/monad/revision.h) 中。

| 修订版本      | 说明                                                        |
| ------------- | ------------------------------------------------------------ |
| `MONAD_NEXT`  | 实现 [操作码定价](https://docs.monad.xyz/developer-essentials/opcode-pricing) |
| `MONAD_FIVE`  | 将 `ACTIVE_VALIDATOR_STAKE` 从 `25,000,000 MON` 降低到 `10,000,000 MON` |
| `MONAD_FOUR`  | [质押功能](https://docs.monad.xyz/developer-essentials/staking/) 上线，参数如下：`ACTIVE_VALIDATOR_STAKE = 25,000,000 MON``MIN_VALIDATE_STAKE = 100,000 MON`[储备余额](https://docs.monad.xyz/developer-essentials/reserve-balance)[EIP-7702](https://docs.monad.xyz/developer-essentials/eip-7702)[动态基础费用](https://docs.monad.xyz/developer-essentials/gas-pricing)最低基础费用[提高](https://docs.monad.xyz/developer-essentials/gas-pricing) (50 MON-gwei -> 100 MON-gwei)[单笔交易gas限制](https://docs.monad.xyz/developer-essentials/gas-pricing) 为 30M gas区块gas限制 (150M -> 200M)，即每秒gas量 375Mgps -> 500Mgps启用 [EIP-2935](https://eips.ethereum.org/EIPS/eip-2935) (扩展历史区块哈希)启用 [EIP-7951](https://eips.ethereum.org/EIPS/eip-7951) (P256VERIFY 预编译合约)启用 [EIP-2537](https://eips.ethereum.org/EIPS/eip-2537) (BLS12-381 预编译合约)将 `CREATE`/`CREATE2` 的最大合约大小提高到 128 kb |
| `MONAD_THREE` | 实现 [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft)区块时间 (500ms -> 400ms)，即每秒gas量 300Mgps -> 375Mgps |
| `MONAD_TWO`   | 将普通合约创建交易的最大合约大小提高 (24.5kb -> 128 kb) |
| `MONAD_ONE`   | 区块时间 (1s -> 500ms)区块gas限制 (300M -> 150M)；每秒gas量保持 300Mgps 不变交易[按gas限制收费](https://docs.monad.xyz/developer-essentials/gas-pricing) |

### ChainConfigs

每个 ChainConfig 描述一个网络，包括其升级到不同修订版本的历史。ChainConfigs 定义在 [`monad-chain-config/src/lib.rs`](https://github.com/category-labs/monad-bft/blob/master/monad-chain-config/src/lib.rs) 中。

| ChainConfig | 说明                                                        |
| ----------- | ------------------------------------------------------------ |
| `mainnet`   | 链 ID 143                                                 |
| `testnet`   | 链 ID 10143；参见 [变更日志](https://docs.monad.xyz/developer-essentials/changelog/testnet) |
| `testnet-2` | 链 ID 30143；参见 [变更日志](https://docs.monad.xyz/developer-essentials/changelog/testnet-2) |
| `devnet`    | 链 ID 20143                                               |
 