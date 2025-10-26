# 网络信息 - 测试网

## 概述

| 网络                                                         | 用途                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [testnet](https://docs.monad.xyz/developer-essentials/testnets#testnet) | 主要测试网环境，已部署数百个应用                             |
| [testnet-2](https://docs.monad.xyz/developer-essentials/testnets#testnet-2) | 临时网络，可能重置；主要用于测试验证器准备情况和负载测试     |
| [tempnet](https://docs.monad.xyz/developer-essentials/testnets#tempnet) | 临时网络，可能重置；用作新功能的沙盒环境。目前是 [操作码定价更改](https://docs.monad.xyz/developer-essentials/opcode-pricing) 的沙盒 |

## testnet

| 名称                         | 值                                                           |
| ---------------------------- | ------------------------------------------------------------ |
| 链 ID                        | `10143`                                                      |
| 网络名称                     | Monad Testnet                                                |
| 货币符号                     | MON                                                          |
| RPC URL                      | [见下方](https://docs.monad.xyz/developer-essentials/testnets#public-rpc-endpoints) |
| 区块浏览器 (BlockVision)     | [https://testnet.monadexplorer.com](https://testnet.monadexplorer.com/) |
| 区块浏览器 (Etherscan)       | https://testnet.monadscan.com/                               |
| 区块浏览器 (Hemera)          | https://monad-testnet.socialscan.io/                         |
| 网络可视化                   | https://www.gmonads.com/?network=testnet                     |
| 应用中心                     | https://testnet.monad.xyz/                                   |
| 水龙头                       | [https://faucet.monad.xyz](https://faucet.monad.xyz/)        |
| 当前版本 / 修订版            | [`v0.11.3`](https://docs.monad.xyz/developer-essentials/changelog/testnet#v0113-2025-10-14) / [`MONAD-FOUR`](https://docs.monad.xyz/developer-essentials/changelog/#revisions) |
| 更新日志                     | [(链接)](https://docs.monad.xyz/developer-essentials/changelog/testnet) |

### 公共 RPC 端点

Websocket 端点以 `wss://` 开头。更多信息请参阅 [Websocket 参考文档](https://docs.monad.xyz/reference/websockets)。

| RPC URL                                                      | 提供商       | 速率限制                            | 批量请求 | 归档支持 | 备注                                                |
| ------------------------------------------------------------ | ------------ | ----------------------------------- | -------- | -------- | --------------------------------------------------- |
| [https://testnet-rpc.monad.xyz](https://testnet-rpc.monad.xyz/) [wss://testnet-rpc.monad.xyz](wss://testnet-rpc.monad.xyz/) | QuickNode    | 25 rps                              | 100      | ✅        |                                                     |
| https://rpc.ankr.com/monad_testnet                           | Ankr         | 300 请求 / 10s  12000 请求 / 10 min | 100      | ❌        | 不允许 `debug_*` 方法                               |
| [https://rpc-testnet.monadinfra.com](https://rpc-testnet.monadinfra.com/) [wss://rpc-testnet.monadinfra.com](wss://rpc-testnet.monadinfra.com/) | Monad 基金会 | 20 rps                              | 不允许   | ✅        | 不允许 `eth_getLogs` 和 `debug_*` 方法              |

### 规范合约

| 名称                           | 地址                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| CreateX                        | [`0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed`](https://testnet.monadexplorer.com/address/0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed) |
| Foundry Deterministic Deployer | [`0x4e59b44847b379578588920ca78fbf26c0b4956c`](https://testnet.monadexplorer.com/address/0x4e59b44847b379578588920cA78FbF26c0B4956C) |
| EntryPoint v0.6                | [`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`](https://testnet.monadexplorer.com/address/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789) |
| EntryPoint v0.7                | [`0x0000000071727De22E5E9d8BAf0edAc6f37da032`](https://testnet.monadexplorer.com/address/0x0000000071727De22E5E9d8BAf0edAc6f37da032) |
| Multicall3                     | [`0xcA11bde05977b3631167028862bE2a173976CA11`](https://testnet.monadexplorer.com/address/0xcA11bde05977b3631167028862bE2a173976CA11) |
| Permit2                        | [`0x000000000022d473030f116ddee9f6b43ac78ba3`](https://testnet.monadexplorer.com/address/0x000000000022d473030f116ddee9f6b43ac78ba3) |
| SafeSingletonFactory           | [`0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7`](https://testnet.monadexplorer.com/address/0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7) |
| UniswapV2Factory               | [`0x733e88f248b742db6c14c0b1713af5ad7fdd59d0`](https://testnet.monadexplorer.com/address/0x733e88f248b742db6c14c0b1713af5ad7fdd59d0) |
| UniswapV3Factory               | [`0x961235a9020b05c44df1026d956d1f4d78014276`](https://testnet.monadexplorer.com/address/0x961235a9020b05c44df1026d956d1f4d78014276) |
| UniswapV2Router02              | [`0xfb8e1c3b833f9e67a71c859a132cf783b645e436`](https://testnet.monadexplorer.com/address/0xfb8e1c3b833f9e67a71c859a132cf783b645e436) |
| Uniswap UniversalRouter        | [`0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893`](https://testnet.monadexplorer.com/address/0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893) |
| WrappedMonad                   | [`0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701`](https://testnet.monadexplorer.com/address/0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701) |

另请参阅：

- [Uniswap 部署](https://github.com/Uniswap/contracts/blob/bf676eed3dc31b18c70aba61dcc6b3c6e4d0028f/deployments/10143.md)

### 测试网代币（部分列表）

请参阅 [tokenlist-testnet.json](https://github.com/monad-crypto/token-list/blob/main/tokenlist-testnet.json)。

## testnet-2

| 名称                     | 值                                                           |
| ------------------------ | ------------------------------------------------------------ |
| 用途                     | 验证器准备情况和负载测试的临时网络                           |
| 链 ID                    | `30143`                                                      |
| RPC URL                  | [https://rpc-testnet-2.monadinfra.com](https://rpc-testnet-2.monadinfra.com/)  备注：20 rps；不允许批量请求；不允许 `eth_getLogs` 和 `debug_*` 方法 |
| 区块浏览器               | https://monad-testnet-2.socialscan.io/                       |
| 网络可视化               | https://www.gmonads.com/?network=testnet-2                   |
| 水龙头                   | 无；请在 [Monad 开发者 Discord](https://discord.gg/monaddev) 中请求 |
| 当前版本 / 修订版        | [`v0.11.3`](https://docs.monad.xyz/developer-essentials/changelog/testnet-2#v0113-2025-10-08) / [`MONAD-FOUR`](https://docs.monad.xyz/developer-essentials/changelog/#revisions) |
| 更新日志                 | [(链接)](https://docs.monad.xyz/developer-essentials/changelog/testnet-2) |

## tempnet

`tempnet` 使用 `devnet` ChainConfig 运行版本 `v0.11.3`。

| 名称                     | 值                                                           |
| ------------------------ | ------------------------------------------------------------ |
| 用途                     | 临时网络；新功能的沙盒环境。目前是 [操作码定价更改](https://docs.monad.xyz/developer-essentials/opcode-pricing) 的沙盒 |
| 链 ID                    | `20143`                                                      |
| RPC URL                  | 请提交[此表单](https://tally.so/r/wLlvlj)。您需要加入 [Monad 开发者 Discord](https://discord.gg/monaddev) |
| 区块浏览器               | 无                                                           |
| 水龙头                   | 请提交[此表单](https://tally.so/r/wLlvlj)。您需要加入 [Monad 开发者 Discord](https://discord.gg/monaddev) |
| 当前版本 / 修订版        | [`v0.11.3`](https://docs.monad.xyz/developer-essentials/changelog/releases#v0113) / [`MONAD-FIVE`](https://docs.monad.xyz/developer-essentials/changelog/#revisions) |