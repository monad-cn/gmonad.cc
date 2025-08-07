# 使用 Hardhat 部署合约

[Hardhat](https://hardhat.org/docs) 是一个综合开发环境，由不同组件组成，用于编写、编译、调试和部署智能合约和 dApps。

### 先决条件

开始之前，需要安装以下依赖项：

* [npm](https://docs.npmjs.com/about-npm) (建议`npm 7`以上版本) 或 [yarn](https://yarnpkg.com/getting-started)
* [Node.js](https://nodejs.org/en/download) v18.0.0 或更高版本

{% hint style="info" %}
如果你使用的是 Windows 系统，强烈建议安装并使用 [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about) 终端来完成以下步骤。
{% endhint %}

### 创建 Hardhat 示例项目

首先，创建一个新的文件夹目录，并导航到该目录：

```bash
mkdir my-hardhat-project && cd my-hardhat-project
```

在该目录中初始化一个新的 Hardhat 项目：

```bash
npx hardhat init
```

在出现 CLI 选择提示时，输入 “y/n“，选择你的首选项，或使用下方推荐的首选项。

```bash
✔ What do you want to do? · Create a TypeScript project (with Viem)
✔ Hardhat project root: · /path/to/my-hardhat-project
✔ Do you want to add a .gitignore? (Y/n) · y
✔ Do you want to install this sample project's dependencies with npm (hardhat @nomicfoundation/hardhat-toolbox-viem)? (Y/n) · y
```

### 设置配置变量 <a href="#id-2-setting-up-configuration-variables" id="id-2-setting-up-configuration-variables"></a>

Hardhat 项目可以将配置变量用于用户特定值，或用于不应包含在代码存储库中的数据。

> **📝 注意**
> 
> 目前，开发网 RPC 尚未公开。如公开，此页面将更新，感谢您的耐心等待。

运行以下命令，设置配置变量：

```bash
npx hardhat vars set <variable_name>
```

例如，运行以下命令，设置 `MONAD_RPC_URL` 变量：

```bash
npx hardhat vars set MONAD_EXPLORER_URL
```

> **📝 注意**
> 
> 在设置 `MONAD_EXPLORER_URL` 配置变量时，请勿包含 `/api` 部分。

然后在提示符中，为此变量输入自定义值：

```bash
Enter value: ********************************
```

同样，你还可以设置 `MONAD_CHAIN_ID` 变量。

> **⚠️ 警告**
> 
> 配置变量以纯文本形式存储在磁盘上。对于需要加密保存的敏感或重要数据，请避免使用此功能。你可以运行 `npx hardhat vars path` 查找存储的文件位置。

### 更新 `hardhat.config.ts` 文件以生效 `monadDevnet` 配置 <a href="#id-2-update-your-hardhatconfigts-file-to-include-the-monaddevnet-configuration" id="id-2-update-your-hardhatconfigts-file-to-include-the-monaddevnet-configuration"></a>

```bash
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { vars } from "hardhat/config";

const config: HardhatUserConfig = {
    solidity: "0.8.27",
    ...
    etherscan: {
        apiKey: `DUMMY_VALUE_FOR_BLOCKSCOUT`,
        customChains: [
            {
                network: "monadDevnet",
                chainId: Number(vars.get("MONAD_CHAIN_ID")),
                urls: {
                    browserURL: vars.get("MONAD_EXPLORER_URL"),
                    apiURL: `${vars.get("MONAD_EXPLORER_URL")}/api`,
                },
            },
            ...
        ],
    },
};

export default config;
```

### 编写智能合约 <a href="#id-4-write-a-smart-contract" id="id-4-write-a-smart-contract"></a>

你可以在 `contracts` 目录中创建新的合约，下方示例中，将创建名为`GMonad.sol`的智能合约：

```bash
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract GMonad {
    function sayGmonad() public pure returns (string memory) {
        return "gmonad";
    }
}
```

### 编译智能合约 <a href="#id-5-compile-the-smart-contract" id="id-5-compile-the-smart-contract"></a>

```bash
npx hardhat compile
```

结果输出如下示例，表示合约成功编译：

```bash
Compiled 2 Solidity file successfully (evm target: paris).
```

> **📝 注意**
> 
> 如果你没有从 Hardhat 中删除默认的 `Lock.sol` 合约，则`GMonad.sol` 和`Lock.sol`均会被编译。

### 部署智能合约 <a href="#id-6-deploy-the-smart-contract" id="id-6-deploy-the-smart-contract"></a>

你可以使用声明式部署系统 [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview) 来部署合约。

你可以使用示例项目中附带的 Ignition 模块部署 `GMonad` 合约。

#### 创建 Hardhat Ignition 模块 <a href="#creating-a-hardhat-ignition-module" id="creating-a-hardhat-ignition-module"></a>

运行以下命令，在 `ignition/modules` 目录中创建一个名为 `GMonad.ts` 的文件：

```solidity
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GMonadModule = buildModule("GMonadModule", (m) => {
    const gmonad = m.contract("GMonad");

    return { gmonad };
});

module.exports = GMonadModule;
```

现在，你可以进行合约部署了。

#### 部署智能合约 <a href="#deploying-the-smart-contract" id="deploying-the-smart-contract"></a>

```bash
npx hardhat ignition deploy ./ignition/modules/GMonad.ts --network monadDevnet
```

当出现 `Confirm` 提示时，选择 `yes` ：

```bash
✔ Confirm deploy to network monadDevnet (<chain_id>)? … yes
```

结果输出如下示例，表示合约成功部署：

```bash
✔ Confirm deploy to network monadDevnet (<chain_id>)? … yes
Hardhat Ignition 🚀

Deploying [ GMonadModule ]

Batch #1
  Executed GMonadModule#GMonad

[ GMonadModule ] successfully deployed 🚀

Deployed Addresses

GMonadModule#GMonad - <contract_address>
```

### 后续步骤

了解如何在 Monad Explorer 上验证合约，请参阅 [验证 Hardhat 合约](../verify-contract/hardhat)。
