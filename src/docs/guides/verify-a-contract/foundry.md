# 使用 Foundry 在 Monad 上验证智能合约

URL: https://docs.monad.xyz/guides/verify-smart-contract/foundry

一旦你的合约部署到实时网络，下一步就是在区块浏览器上验证其源代码。

验证合约意味着将其源代码以及用于编译代码的设置上传到仓库（通常由区块浏览器维护）。这允许任何人编译它并将生成的字节码与链上部署的内容进行比较。在像 Monad 这样的开放平台中，这样做极其重要。

在本指南中，我们将解释如何使用 [Foundry](https://getfoundry.sh/) 来完成此操作。

## 主网验证

### 推荐方式：使用 Foundry Monad 模板

注意提示  
[`foundry-monad`](https://github.com/monad-developers/foundry-monad) 模板默认配置为测试网。要使用主网，请更新你的 `foundry.toml` 文件：

- 将 `eth-rpc-url="https://testnet-rpc.monad.xyz"` 更改为你的主网 RPC URL
- 将 `chain_id = 10143` 更改为 `143`

如果你正在使用 [`foundry-monad`](https://github.com/monad-developers/foundry-monad) 模板，你可以根据你偏好的区块浏览器使用以下命令：

#### MonadVision

```sh
forge verify-contract \
    <contract_address> \
    <contract_name> \
    --chain 143 \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org
```

**示例：**

```sh
forge verify-contract \
    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \
    Counter \
    --chain 143 \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org
```

成功验证智能合约后，你应该在终端中看到类似的输出：

```sh
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Attempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.

Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".
Contract successfully verified
```

现在在 MonadVision 上检查合约。

#### Monadscan

```sh
forge verify-contract \
    <contract_address> \
    <contract_name> \
    --chain 143 \
    --verifier etherscan \
    --etherscan-api-key YourApiKeyToken \
    --watch
```

**示例：**

```sh
forge verify-contract \
    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \
    Counter \
    --chain 143 \
    --verifier etherscan \
    --etherscan-api-key YourApiKeyToken \
    --watch
```

成功验证智能合约后，你应该在终端中看到类似的输出：

```sh
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet

Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.
Submitted contract for verification:
        Response: `OK`
        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`
        URL: https://monadscan.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
```

现在在 Monadscan 上检查合约。

#### Socialscan

```sh
forge verify-contract \
    <contract_address> \
    <contract_name> \
    --chain 143 \
    --watch \
    --etherscan-api-key <your_api_key> \
    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \
    --verifier etherscan
```

**示例：**

```sh
forge verify-contract \
    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \
    Counter \
    --chain 143 \
    --watch \
    --etherscan-api-key test \
    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \
    --verifier etherscan
```

成功验证智能合约后，你应该在终端中看到类似的输出：

```sh
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet

Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.
Submitted contract for verification:
        Response: `Contract successfully verified`
        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`
        URL: https://monad.socialscan.io/address/0x8fec29bded7a618ab6e3cd945456a79163995769
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
```

现在在 Socialscan 上检查合约。

### 默认 Foundry 项目

#### 1. 使用 Monad 配置更新 `foundry.toml`

foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
metadata = true
metadata_hash = "none"  # 禁用 ipfs
use_literal_content = true # 使用源代码

# Monad 配置
eth-rpc-url="https://rpc.monad.xyz"
chain_id = 143
```

#### 2. 使用以下区块浏览器之一验证合约：

注意提示  
如果你使用 MonadVision，你可以使用[此指南](https://docs.blockvision.org/reference/verify-smart-contract-on-monad-explorer#/)。特别是，[验证合约](https://monadvision.com/verify-contract)页面提供了验证合约的便捷方式。

使用与上面相同的命令，但使用主网配置。

## 测试网验证

### 推荐方式：使用 Foundry Monad 模板

如果你正在使用 [`foundry-monad`](https://github.com/monad-developers/foundry-monad) 模板，你可以根据你偏好的区块浏览器使用以下命令：

#### MonadVision

```sh
forge verify-contract \
    <contract_address> \
    <contract_name> \
    --chain 10143 \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org
```

**示例：**

```sh
forge verify-contract \
    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \
    Counter \
    --chain 10143 \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org
```

成功验证智能合约后，你应该在终端中看到类似的输出：

```sh
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Attempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.

Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".
Contract successfully verified
```

现在在 [MonadVision](https://testnet.monadvision.com/) 上检查合约。

#### Monadscan

```sh
forge verify-contract \
    <contract_address> \
    <contract_name> \
    --chain 10143 \
    --verifier etherscan \
    --etherscan-api-key YourApiKeyToken \
    --watch
```

**示例：**

```sh
forge verify-contract \
    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \
    Counter \
    --chain 10143 \
    --verifier etherscan \
    --etherscan-api-key YourApiKeyToken \
    --watch
```

现在在 [Monadscan](https://testnet.monadscan.com/) 上检查合约。

#### Socialscan

```sh
forge verify-contract \
    <contract_address> \
    <contract_name> \
    --chain 10143 \
    --watch \
    --etherscan-api-key <your_api_key> \
    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \
    --verifier etherscan
```

**示例：**

```sh
forge verify-contract \
    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \
    Counter \
    --chain 10143 \
    --watch \
    --etherscan-api-key test \
    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \
    --verifier etherscan
```

现在在 [Socialscan](https://testnet.socialscan.io/) 上检查合约。

### 默认 Foundry 项目

提示  
如果你使用 [`foundry-monad`](https://github.com/monad-developers/foundry-monad)，你可以跳过配置步骤

#### 1. 使用 Monad 配置更新 `foundry.toml`

foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]  
metadata = true
metadata_hash = "none"  # 禁用 ipfs
use_literal_content = true # 使用源代码

# Monad 配置
eth-rpc-url="https://testnet-rpc.monad.xyz"
chain_id = 10143
```

#### 2. 使用以下区块浏览器之一验证合约：

使用与上面相同的命令，但使用测试网配置。