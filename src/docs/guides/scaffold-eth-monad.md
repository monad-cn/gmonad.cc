# 使用 Scaffold-Eth-Monad 构建 dApp

Scaffold-Eth-Monad 是一个拥有Monad 配置功能的 [Scaffold-ETH 2](https://docs.scaffoldeth.io/) 分支。

Scaffold-Eth-Monad 旨在使开发者更容易在 Monad 上创建和部署智能合约，并提供了与合约交互的用户界面。

### 先决条件

开始之前，需要安装以下工具：

* [Node.js](https://nodejs.org/en/download) (v18.18 或更高版本)
* [Yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable) (v1 或 v2+ 版本)
* [Git](https://git-scm.com/downloads)

### 获取测试代币

> **📝 注意**
> 
> 目前，测试网水龙头尚未公开。如公开，此页面将更新，感谢您的耐心等待。

你需要在 Monad 测试网获得测试代币，才能部署智能合约。未来，你可以在此处从水龙头获取测试代币。

### 初始设置

1. 克隆 Scaffold-Eth-Monad 代码存储库

```bash
git clone https://github.com/monad-developers/scaffold-eth-monad.git
```

2. 打开项目目录并安装依赖项

```bash
cd scaffold-eth-monad && yarn install
```

3. 为 Hardhat 配置 `.env` 文件

在 `packages/hardhat` 文件夹中复制 `.env.example`，将其命名为 `.env` ，并设置以下自定义值。

* `DEPLOYER_PRIVATE_KEY`：部署智能合约所使用的钱包私钥。
* `MONAD_RPC_URL`：可以使用公共 RPC 或从 Monad 支持的 RPC 服务商获取私有 RPC 。

```bash
DEPLOYER_PRIVATE_KEY=
MONAD_RPC_URL=
MONAD_CHAIN_ID=
MONAD_EXPLORER_URL=
```

> **📝 注意**
> 
> 目前，开发网 RPC 尚未公开。如公开，此页面将更新，感谢您的耐心等待。

4. 在 Monad 上部署智能合约

完成 `.env` 文件配置后，接下来，你可以在终端中运行以下命令：

```bash
yarn deploy --network monadDevnet
```

此命令将 `YourContract.sol` 部署到 Monad 测试网，该合约位于 `packages/hardhat/contracts` 中，可根据需要进行修改。

`yarn deploy` 命令调用 `packages/hardhat/deploy` 中的部署脚本，将合约部署到网络，你可以自定义部署脚本。

5. 为 Next.js 应用程序设置 `.env` 文件 (可选)

在 `packages/nextjs` 文件夹中复制 `.env.example`，将其命名为 `.env` ，并设置以下自定义值。

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
```

6. 在另外的终端上，启动 NextJS 应用程序

```bash
yarn start
```

在浏览器中访问应用：**`http://localhost:3000`**

你应该会看到如下所示的 dApp 用户界面：

![Scaffold-Eth-Monad dApp 用户界面](https://3402452340-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FPaHQrSOuX4vToXCmyjn9%2Fuploads%2FusezG6BUf3DgYXCagskA%2Ffront_page-c63141018affa8c64241d01f97ada82f.png?alt=media&token=a451daac-13f7-44a6-bb07-7464646f5740)

你可以在 `Debug Contracts` 页面与智能合约交互，还可以在 `packages/nextjs/scaffold.config.ts` 中调整应用程序配置。

### 下一步 <a href="#whats-next" id="whats-next"></a>

* 在 `packages/hardhat/contracts` 编辑 `YourContract.sol` 智能合约。
* 在 `packages/nextjs/app/page.tsx` 编辑前端主页，有关路由和 `pages/layouts` 配置，请参阅 [Next.js 文档](https://nextjs.org/docs)。
* 在 `packages/hardhat/deploy` 编辑合约部署脚本。
* 在 `packages/hardhat/test` 编辑智能合约测试，可以使用 `yarn hardhat：test` 运行测试。
