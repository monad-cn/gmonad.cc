# 使用 Hardhat 在 Monad 上部署智能合约

[Hardhat](https://hardhat.org/docs) 是一个由不同组件组成的综合开发环境，用于编辑、编译、调试和部署智能合约。

## 环境要求

开始之前，您需要安装以下依赖：

- Node.js v18.0.0 或更高版本

⚠️如果您使用 Windows，我们强烈建议在遵循本指南时使用 [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about)。



## Hardhat2

## 1. 创建新的 Hardhat 项目

您可以使用 `hardhat-monad` 模板创建已设置好 Monad 配置的新项目。

*[hardhat-monad](https://github.com/monad-developers/hardhat-monad) 是一个带有 Monad 配置的 Hardhat 模板。*

使用以下命令将仓库克隆到您的机器上：

```sh
git clone https://github.com/monad-developers/hardhat-monad.git
cd hardhat-monad
```

## 2. 安装依赖

```sh
npm install
```

## 3. 创建 .env 文件

```sh
cp .env.example .env
```

使用您的私钥编辑 `.env` 文件：

```text
PRIVATE_KEY=your_private_key_here
```

⚠️请小心保护您的私钥。永远不要将其提交到版本控制、在公共仓库中分享，或在客户端代码中暴露。您的私钥提供对您资金的完全访问权限。

## 4. 部署智能合约

以下命令使用 [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview)：

### 部署到本地 Hardhat 节点

运行以下命令启动 Hardhat 节点：

```bash
npx hardhat node
```

要将示例合约部署到本地 Hardhat 节点，在单独的终端中运行以下命令：

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts
```

### 部署到 Monad 测试网

确保您的私钥已在 `.env` 文件中设置。

将合约部署到 Monad 测试网：

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadTestnet
```

将相同代码重新部署到不同地址：

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadTestnet --reset
```

您可以自定义部署参数：

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadTestnet \
  --parameters '{"unlockTime": 1893456000, "lockedAmount": "1000000000000000"}'
```

### 部署到 Monad 主网

确保您的私钥已在 `.env` 文件中设置。

将合约部署到 Monad 主网：

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadMainnet
```

将相同代码重新部署到不同地址：

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadMainnet --reset
```



## Hardhat3

## 1. 创建新的 Hardhat3 项目

您可以使用 `hardhat3-monad` 模板创建已为 Hardhat3 设置好 Monad 配置的新项目。

*[hardhat3-monad](https://github.com/monad-developers/hardhat3-monad) 是一个带有 Monad 配置的 Hardhat3 模板。*

要了解更多关于 Hardhat3 的信息，请访问[入门指南](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3)。

使用以下命令将仓库克隆到您的机器上：

```sh
git clone https://github.com/monad-developers/hardhat3-monad.git
cd hardhat3-monad
```

## 2. 安装依赖

```sh
npm install
```

## 3. 设置您的私钥

Hardhat3 使用配置变量和 `hardhat-keystore` 插件进行安全密钥管理。

使用密钥库插件设置您的私钥：

```sh
npx hardhat keystore set PRIVATE_KEY
```

⚠️请小心保护您的私钥。`hardhat-keystore` 插件安全地存储您的密钥并防止意外暴露。您的私钥提供对您资金的完全访问权限。

## 4. 部署智能合约

以下命令使用 [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview)：

### 部署到本地链

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts
```

### 部署到 Monad 测试网

确保您的私钥已在 `.env` 文件中设置。

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnet
```

### 部署到 Monad 主网

确保您的私钥已在 `.env` 文件中设置。

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet
```
