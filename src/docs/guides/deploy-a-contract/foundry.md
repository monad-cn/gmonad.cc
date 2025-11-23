# 使用 Foundry 在 Monad 上部署智能合约

[Foundry](https://book.getfoundry.sh/) 是一个用 Rust 编写的超快、可移植和模块化的以太坊应用开发工具包。

## 环境要求

开始之前，您需要安装以下工具：

- [Rust](https://www.rust-lang.org/)

## 1. 安装 `foundryup`

Foundryup 是 Foundry 工具链的官方安装程序。

```sh
curl -L https://foundry.paradigm.xyz | bash
```



这将安装 Foundryup。只需按照屏幕上的说明操作，`foundryup` 命令将在您的 CLI 中可用。

## 2. 安装 `forge`、`cast`、`anvil` 和 `chisel` 二进制文件

```sh
foundryup
```



注意

如果您使用 Windows，则需要使用 WSL，因为 Foundry 目前无法在 Windows 上原生运行。请访问[此链接](https://learn.microsoft.com/en-us/windows/wsl/install)了解更多有关 WSL 的信息。

## 3. 创建新的 Foundry 项目

提示

您可以使用 `foundry-monad` 模板创建新项目。

*[Foundry-Monad](https://github.com/monad-developers/foundry-monad) 是一个带有 Monad 配置的 Foundry 模板。*

以下命令使用 `foundry-monad` 创建新的 foundry 项目：

```sh
forge init --template monad-developers/foundry-monad [project_name]
```



或者，您可以使用以下命令创建 foundry 项目：

```sh
forge init [project_name]
```



## 4. 修改 Foundry 配置

更新 `foundry.toml` 文件以添加 Monad 测试网配置。

foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
# Monad 测试网配置
eth-rpc-url="https://testnet-rpc.monad.xyz"
chain_id = 10143
```



## 5. 编写智能合约

您可以在 `src` 文件夹下编写智能合约。项目中已经有一个 `Counter` 合约，位于 `src/Counter.sol`。

Counter.solsrc

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



## 6. 编译智能合约

```sh
forge compile
```



编译过程的输出可以在新创建的 `out` 目录中找到，其中包括合约 ABI 和字节码。

## 7. 部署智能合约

⚠️在部署合约时，我们建议使用密钥库而不是私钥。

### 获取测试网资金

部署智能合约需要测试网资金。通过[水龙头](https://testnet.monad.xyz/)申请测试网资金。

### 部署智能合约

使用密钥库比使用私钥更安全，因为密钥库会加密私钥，并可以在以后需要私钥的任何命令中引用。

使用以下命令导入新生成的私钥来创建新的密钥库。

```sh
cast wallet import monad-deployer --private-key $(cast wallet new | grep 'Private key:' | awk '{print $3}')
```



以上命令的作用分步骤如下：

- 生成新的私钥
- 将私钥导入名为 `monad-deployer` 的密钥库文件
- 将新创建的钱包地址打印到控制台

创建密钥库后，您可以使用以下命令读取其地址：

```sh
cast wallet address --account monad-deployer
```



在提示时提供密码来加密密钥库文件，请不要忘记密码。

运行以下命令部署您的智能合约

```sh
forge create src/Counter.sol:Counter --account monad-deployer --broadcast
```



成功部署智能合约后，输出应类似于以下内容：

```sh
[⠊] Compiling...
Deployer: 0xB1aB62fdFC104512F594fCa0EF6ddd93FcEAF67b
Deployed to: 0x67329e4dc233512f06c16cF362EC3D44Cdc800e0
Transaction hash: 0xa0a40c299170c9077d321a93ec20c71e91b8aff54dd9fa33f08d6b61f8953ee0
```
