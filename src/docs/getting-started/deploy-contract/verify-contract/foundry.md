# 验证 Foundry 合约

> **📝 注意**
> 
> 目前，开发网 RPC 和区块浏览器尚未公开。如公开，此页面将更新，感谢您的耐心等待。

## 方法一：Foundry Monad 模板（推荐）

如果你使用 [`foundry-monad`](https://github.com/monad-developers/foundry-monad) 模板部署的合约，请运行以下命令：

```bash
forge verify-contract <contract_address> <contract_name>
```

你需要将 `contract_address` 和 `contract_name` 更换为你部署时使用的信息，例如：

```bash
forge verify-contract 0x195B9401D1BF64D4D4FFbEecD10aE8c41bEBA453 src/Counter.sol:Counter
```

结果输出如下示例，表示合约成功验证：

```bash
Start verifying contract `0x1355a4f7829161a4d27BDb8970D32b89ef89A1Be`

Submitting verification for [src/Counter.sol:Counter] 0x1355a4f7829161a4d27BDb8970D32b89ef89A1Be.
Submitted contract for verification:
    Response: `OK`
    GUID: `1355a4f7829161a4d27bdb8970d32b89ef89a1be67448d78`
```

## 方法二：默认 Foundry 项目
### 使用 Monad 配置更新 `foundry.toml` <a href="#id-1-update-foundrytoml-with-monad-configuration" id="id-1-update-foundrytoml-with-monad-configuration"></a>

> **💡 提示**
> 
> 如果你使用 [`foundry-monad`](https://github.com/monad-developers/foundry-monad) 模板部署的合约，则可以跳过本步骤。

```bash
[profile.default]
src = "src"
out = "out"
libs = ["lib"]

# Monad Configuration
# TODO: Add RPC URL and Chain ID
eth-rpc-url="MONAD_RPC_URL"
chain_id = "MONAD_CHAIN_ID"


# TODO: Add Explorer URL and Chain ID
[etherscan]
monadDevnet = { key = "DUMMY_VALUE", url = "EXPLORER_URL", chain = MONAD_CHAIN_ID }
```

### 验证合约 <a href="#id-2-verify-the-contract-using-the-command-below" id="id-2-verify-the-contract-using-the-command-below"></a>

运行以下命令，验证合约：

```bash
forge verify-contract <contract_address> <contract_name>
```

你需要将 `contract_address` 和 `contract_name` 更换为你部署时使用的信息，例如：

```bash
forge verify-contract 0x195B9401D1BF64D4D4FFbEecD10aE8c41bEBA453 src/Counter.sol:Counter
```

结果输出如下示例，表示合约成功验证：

```bash
Start verifying contract `0x1355a4f7829161a4d27BDb8970D32b89ef89A1Be`

Submitting verification for [src/Counter.sol:Counter] 0x1355a4f7829161a4d27BDb8970D32b89ef89A1Be.
Submitted contract for verification:
    Response: `OK`
    GUID: `1355a4f7829161a4d27bdb8970d32b89ef89a1be67448d78`
```

