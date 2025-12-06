# 验证 Hardhat 合约

当你的合约被部署到区块链实时网络中，下一步将是在区块浏览器上验证其源代码。

验证合约意味着将合约源代码以及用于编译代码的设置上传到存储库（通常由区块资源管理器维护）。这样，任何人都可以对合约进行编译，并将生成的字节码与部署在链上的字节码进行比较。对于 Monad 这样的开放区块链平台来说，这样做极为重要。

> **📝 注意**
> 
> 目前，开发网区块浏览器尚未公开。如公开，此页面将更新，感谢您的耐心等待。

本章节将阐述如何在 Monad 区块浏览器中执行Hardhat 合约验证。

### 设置配置变量 <a href="#id-2-setting-up-configuration-variables" id="id-2-setting-up-configuration-variables"></a>

Hardhat 项目可以将配置变量用于用户特定值，或用于不应包含在代码存储库中的数据。

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

接下来，在提示符中，为此变量输入自定义值：

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

> **📝 注意**
> 
> 目前 Monad 区块浏览器是基于 Blockscout 的，因此不需要 API 密钥。现阶段使用了虚拟占位符值`DUMMY_VALUE_FOR_BLOCKSCOUT`，以避免错误。

### 验证智能合约 <a href="#id-3-verify-the-smart-contract" id="id-3-verify-the-smart-contract"></a>

运行以下命令，验证智能合约：

```bash
npx hardhat verify <contract_address> --network monadDevnet
```

结果输出如下示例，表示合约成功验证：

```bash
Successfully submitted source code for contract
contracts/GMonad.sol:GMonad at <contract_address>
for verification on the block explorer. Waiting for verification result...

Successfully verified contract GMonad on the block explorer.
<block_explorer_url>/address/0x690BE9B15b84c6487965d1cbf3372A9FB07A6eE1#code
```

使用上方输出结果末尾的链接，可以在区块浏览器中查看经过验证的智能合约。

> **📝 注意**
> 
> 目前，开发网区块浏览器尚未公开。如公开，此页面将更新，感谢您的耐心等待。
