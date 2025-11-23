# 使用 Hardhat 在 Monad 上验证智能合约

URL: https://docs.monad.xyz/guides/verify-smart-contract/hardhat

一旦你的合约部署到实时网络，下一步就是在区块浏览器上验证其源代码。

验证合约意味着将其源代码以及用于编译代码的设置上传到仓库（通常由区块浏览器维护）。这允许任何人编译它并将生成的字节码与链上部署的内容进行比较。在像 Monad 这样的开放平台中，这样做极其重要。

在本指南中，我们将解释如何使用 [Hardhat](https://hardhat.org/) 来完成此操作。

## 主网验证

### MonadVision

#### 1. 更新你的 `hardhat.config.ts` 文件

```ts
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      metadata: {
        bytecodeHash: "none", // 禁用 ipfs
        useLiteralContent: true, // 使用源代码
      },
    },
  },
  networks: {
    monadMainnet: {
      url: "https://rpc.monad.xyz",
      chainId: 143,
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://monadvision.com",
  },
  // 为了避免来自 Etherscan 的错误
  etherscan: {
    enabled: false,
  },
};

export default config;
```

#### 2. 验证智能合约

```sh
npx hardhat verify <contract_address> --network monadMainnet
```

成功验证智能合约后，输出应该类似于以下内容：

```text
Successfully verified contract Lock on Sourcify.
https://monadvision.com/contracts/full_match/143/<contract_address>
```

### Monadscan

#### 1. 更新你的 `hardhat.config.ts` 文件

```ts
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    monadMainnet: {
      url: "https://rpc.monad.xyz",
      chainId: 143,
    },
  },
  etherscan: {
    apiKey: "YourApiKeyToken",
  },
};

export default config;
```

#### 2. 验证智能合约

```sh
npx hardhat verify <contract_address> --network monadMainnet
```

成功验证智能合约后，输出应该类似于以下内容：

```text
Successfully verified contract Lock on Monadscan.
https://monadscan.com/address/<contract_address>
```

### Socialscan

#### 1. 更新你的 `hardhat.config.ts` 文件

```ts
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      metadata: {
        bytecodeHash: "none", // 禁用 ipfs
        useLiteralContent: true, // 使用源代码
      },
    },
  },
  networks: {
    monadMainnet: {
      url: "https://rpc.monad.xyz",
      chainId: 143,
    },
  },
  etherscan: {
    customChains: [
      {
        network: "monadMainnet",
        chainId: 143,
        urls: {
          apiURL: "https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract",
          browserURL: "https://monad.socialscan.io",
        },
      },
    ],
    apiKey: {
        monadMainnet: "Put a random string",
    },
  },
};

export default config;
```

#### 2. 验证智能合约

```sh
npx hardhat verify <contract_address> --network monadMainnet
```

成功验证智能合约后，输出应该类似于以下内容：

```text
Successfully verified contract Lock on Socialscan.
https://monad.socialscan.io/contracts/full_match/143/<contract_address>
```

## 测试网验证

### MonadVision

#### 1. 更新你的 `hardhat.config.ts` 文件

```ts
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      metadata: {
        bytecodeHash: "none", // 禁用 ipfs
        useLiteralContent: true, // 使用源代码
      },
    },
  },
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadvision.com",
  },
  // 为了避免来自 Etherscan 的错误
  etherscan: {
    enabled: false,
  },
};

export default config;
```

#### 2. 验证智能合约

```sh
npx hardhat verify <contract_address> --network monadTestnet
```

成功验证智能合约后，输出应该类似于以下内容：

```text
Successfully verified contract Lock on Sourcify.
https://testnet.monadvision.com/contracts/full_match/10143/<contract_address>
```

### Monadscan

#### 1. 更新你的 `hardhat.config.ts` 文件

```ts
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
    },
  },
  etherscan: {
    apiKey: "YourApiKeyToken",
  },
};

export default config;
```

#### 2. 验证智能合约

```sh
npx hardhat verify <contract_address> --network monadTestnet
```

成功验证智能合约后，输出应该类似于以下内容：

```text
Successfully verified contract Lock on Monadscan.
https://testnet.monadscan.com/address/<contract_address>
```

### Socialscan

#### 1. 更新你的 `hardhat.config.ts` 文件

```ts
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      metadata: {
        bytecodeHash: "none", // 禁用 ipfs
        useLiteralContent: true, // 使用源代码
      },
    },
  },
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
    },
  },
  etherscan: {
    customChains: [
      {
        network: "monadTestnet",
        chainId: 10143,
        urls: {
          apiURL: "https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract",
          browserURL: "https://monad-testnet.socialscan.io",
        },
      },
    ],
    apiKey: {
        monadTestnet: "Put a random string",
    },
  },
};

export default config;
```

#### 2. 验证智能合约

```sh
npx hardhat verify <contract_address> --network monadTestnet
```

成功验证智能合约后，输出应该类似于以下内容：

```text
Successfully verified contract Lock on Socialscan.
https://monad-testnet.socialscan.io/contracts/full_match/10143/<contract_address>
```