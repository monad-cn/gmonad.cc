# 使用 Foundry 部署合约

[Foundry](https://book.getfoundry.sh/) 是一个快速、可复制的模块化工具包，适用于 Rust 语言编写的以太坊应用程序的开发。

### 先决条件

开始之前，需要安装以下工具：

* [Rust](https://doc.rust-lang.org/book/)
* [Cargo](https://doc.rust-lang.org/cargo/index.html)

### 安装 `foundryup`

Foundryup 是 Foundry 工具链的官方安装程序。

```bash
curl -L https://foundry.paradigm.xyz
```

按照屏幕上的说明操作，安装 Foundryup，接下来便可以在本地 CLI 中使用 `foundryup` 命令。

### 安装 `forge`、`cast`、`anvil` 和 `chisel` 文件 <a href="#id-2-installing-forge-cast-anvil-and-chisel-binaries" id="id-2-installing-forge-cast-anvil-and-chisel-binaries"></a>

```bash
foundryup
```

> **📝 注意**
> 
> 如果你使用的是 Windows 系统，则需要安装并使用 Git BASH 或 WSL 终端，因为 Foundryup 目前不支持 Powershell 或命令提示符 (Cmd）。

### 创建 Foundry 示例项目

> **💡 提示**
> 
> 你可以使用 `foundry-monad` 模板来创建一个新项目。
>
> [Foundry-Monad](https://github.com/monad-developers/foundry-monad) 是一个具有 Monad 配置的 Foundry 模板。使用该模板，开发者不必在 Foundry 中针对 Monad 网络进行初始配置。

运行以下命令，使用 `foundry-monad` 模板，创建一个新的 foundry 项目：

```bash
forge init --template monad-developers/foundry-monad [project_name]
```

或者，可以运行以下命令，创建默认的 foundry 项目：

```bash
forge init [project_name]
```

### 修改 Foundry 配置 <a href="#id-4-modify-foundry-configuration" id="id-4-modify-foundry-configuration"></a>

> **📝 注意**
> 
> 目前，开发网 RPC 和区块浏览器尚未公开。如公开，此页面将更新，感谢您的耐心等待。

> **📝 注意**
> 
> 上述步骤中，如果你使用了 `foundry-monad` 模板，请跳过本步骤。

更新 `foundry.toml` 文件以添加 Monad 配置：

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

### 编写智能合约 <a href="#id-5-write-a-smart-contract" id="id-5-write-a-smart-contract"></a>

你可以在 `src` 文件夹下编写智能合约。此项目中已有一个 `Counter` 合约，位于 `src/Counter.sol`。

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
```

### 编译智能合约 <a href="#id-6-compile-the-smart-contract" id="id-6-compile-the-smart-contract"></a>

```bash
forge compile
```

编译结果输出在新创建的 `out` 目录下，其中包括 Contract ABI 和 bytecode。

### 部署智能合约 <a href="#id-7-deploy-the-smart-contract" id="id-7-deploy-the-smart-contract"></a>

> **⚠️ 注意**
> 
> 对于合约部署，不建议使用与真实资产相关联的钱包地址及私钥，务必创建一个新钱包或使用仅用于开发的钱包地址。

#### 获取测试代币

> **📝 注意**
> 
> 目前，开发网水龙头尚未公开。如公开，此页面将更新，感谢您的耐心等待。

部署智能合约需要测试网测试代币，可通过测试网水龙头领取。

#### 部署智能合约

#### 方法一：使用 Keystore（推荐）

Keystore 是 Foundry 项目中使用私钥的一种更安全的方式，因为 keystore 会加密私钥，且可以在任何需要私钥的命令中引用。

运行以下命令，创建新的钱包密钥库：

```bash
cast wallet import <keystore_name> --interactive
```

出现提示时，输入钱包私钥，并设置密码进行加密。

运行以下命令，部署智能合约：

```bash
forge create src/Counter.sol:Counter --account <keystore_name>
```

结果输出如下示例，表示合约成功部署：

```bash
Deployer: 0xB1aB62fdFC104512F594fCa0EF6ddd93FcEAF67b
Deployed to: 0x67329e4dc233512f06c16cF362EC3D44Cdc800e0
Transaction hash: 0xa0a40c299170c9077d321a93ec20c71e91b8aff54dd9fa33f08d6b61f8953ee0
```

#### 方法二：直接使用钱包私钥

运行以下命令，直接在终端中粘贴私钥，并部署智能合约。

```bash
forge create --private-key <your_private_key> src/Counter.sol:Counter
```

结果输出如下示例，表示合约成功部署：

```bash
Deployer: 0xB1aB62fdFC104512F594fCa0EF6ddd93FcEAF67b
Deployed to: 0x67329e4dc233512f06c16cF362EC3D44Cdc800e0
Transaction hash: 0xa0a40c299170c9077d321a93ec20c71e91b8aff54dd9fa33f08d6b61f8953ee0
```

### 后续步骤

> **📝 注意**
> 
> 目前，开发网区块浏览器尚未公开。如公开，此页面将更新，感谢您的耐心等待。

了解如何在 Monad Explorer 上验证合约，请参阅 [验证 Foundry 合约](../verify-contract/foundry)。
