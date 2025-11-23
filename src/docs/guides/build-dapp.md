# 如何使用 Scaffold-ETH 构建基础 dApp

URL: https://docs.monad.xyz/guides/scaffold-eth

在本指南中，您将学习如何使用 Scaffold-ETH 2 快速构建一个新的 dapp 项目。

## 环境要求

开始之前，您需要安装以下工具：

- Node (>= v18.18)
- Yarn (v1 或 v2+)
- Git

### 获取 Monad 测试网资金

为了部署智能合约，您需要在 Monad 测试网上获得资金，可以从 [Monad 水龙头](https://testnet.monad.xyz) 获取资金。

## 使用 Scaffold-ETH

Scaffold-ETH 支持两种不同的 Solidity 开发框架：Foundry 和 Hardhat。

在本指南中，您可以在 Foundry 和 Hardhat 之间进行选择。

- Foundry
- Hardhat

### 克隆 scaffold-monad-foundry 仓库

```sh
git clone https://github.com/monad-developers/scaffold-monad-foundry.git
```

### 打开项目目录并安装依赖

```sh
cd scaffold-monad-foundry && yarn install
```

### 启动本地区块链节点

```sh
yarn chain
```

### 将智能合约部署到本地区块链节点

```sh
yarn deploy
```

此命令将 `YourContract.sol` 部署到您的本地区块链节点。合约位于 `packages/foundry/contracts` 目录下，可根据需要进行修改。

`yarn deploy` 命令使用位于 `packages/foundry/deploy` 的部署脚本将合约部署到网络。您也可以自定义部署脚本。

### 启动 NextJS 应用

```sh
yarn start
```

在以下地址访问您的应用：`http://localhost:3000`

您可以使用调试合约页面与智能合约进行交互。您可以在 `packages/nextjs/scaffold.config.ts` 中调整应用配置。

### 将智能合约部署到 Monad 测试网

```sh
yarn deploy --network monadTestnet
```

此命令将 `YourContract.sol` 部署到 Monad 测试网。合约位于 `packages/foundry/contracts` 目录下，可根据需要进行修改。

### 在 Monad 测试网上验证智能合约

```sh
yarn verify --network monadTestnet
```

此命令在 Monad 测试网上验证 `YourContract.sol`。

### 克隆 scaffold-monad-hardhat 仓库

```sh
git clone https://github.com/monad-developers/scaffold-monad-hardhat.git
```

### 打开项目目录并安装依赖

```sh
cd scaffold-monad-hardhat && yarn install
```

### 启动本地区块链节点

```sh
yarn chain
```

### 将智能合约部署到本地区块链节点

```sh
yarn deploy
```

此命令将 `YourContract.sol` 部署到您的本地区块链节点。合约位于 `packages/hardhat/contracts` 目录下，可根据需要进行修改。

`yarn deploy` 命令使用位于 `packages/hardhat/deploy` 的部署脚本将合约部署到网络。您也可以自定义部署脚本。

### 启动 NextJS 应用

```sh
yarn start
```

在以下地址访问您的应用：`http://localhost:3000`

您可以使用调试合约页面与智能合约进行交互。您可以在 `packages/nextjs/scaffold.config.ts` 中调整应用配置。

### 生成部署者账户

```sh
yarn generate
```

此命令将创建一个新的部署者账户。**请记住您创建的密码**，因为部署时需要用到。

### 将智能合约部署到 Monad 测试网

```sh
yarn deploy --network monadTestnet
```

此命令将 `YourContract.sol` 部署到 Monad 测试网。合约位于 `packages/hardhat/contracts` 目录下，可根据需要进行修改。

### 在 Monad 测试网上验证智能合约

```sh
yarn verify --network monadTestnet
```

此命令在 Monad 测试网上验证 `YourContract.sol`。

## 下一步

- 探索调试合约页面与您部署的合约进行交互。
- 修改 `YourContract.sol` 以构建您自己的功能。
- 了解更多关于 [Scaffold-ETH](https://docs.scaffoldeth.io/) 的信息。