---
title: Monad MCP Server 教程：与 Monad 测试网交互的利器（附惊喜彩蛋）
description: 本文将详细介绍如何使用 Monad MCP Server，并融入最新 PR 的内容，更有一个令人惊喜的彩蛋 —— 这个 PR 是由 Glama 创始人提过来的！
image: /blog/monad_mcp_tutorial_1.png
---

# Monad MCP Server 教程：与 Monad 测试网交互的利器（附惊喜彩蛋）

:::tip 原文
<https://mp.weixin.qq.com/s/WCPESHHZImjnndVOjqBOkQ>
:::

在区块链开发的广阔领域中，与主网/测试网进行高效交互是开发者们必不可少的技能。

Monad MCP Server 作为一款强大的工具，为开发者提供了与 Monad 测试网进行交互的便捷途径。它允许开发者检查 MON 代币余额、发送交易、部署智能合约以及监控区块链事件等。

> 本文将详细介绍如何使用 Monad MCP Server，并融入最新 PR 的内容，更有一个令人惊喜的彩蛋 —— 这个 PR 是由 Glama 创始人提过来的！

## 一、项目概述

Monad MCP Server 实现了 Model Context Protocol (MCP)，这是一个标准化接口，使 AI 模型能够安全有效地与外部工具、服务和数据源进行交互。此服务器将 Monad 区块链的功能暴露给兼容的 AI 代理或应用程序。

> 最近，由 Glama 创始人提交的一个 PR 为 Monad MCP Server 在 Glama MCP Server 目录的列表添加了一个徽章。

![Monad MCP Server 徽章](/blog/monad_mcp_tutorial_1.png)

该徽章由 Glama 提供，Glama 会对 Monad MCP Server 的代码库和文档进行定期检查，以确保：
1. **功能完整性**：确认 MCP Server 按预期正常运行，各项功能稳定且准确。
2. **安全合规性**：检查 MCP Server 依赖项是否存在明显的安全漏洞，保障用户数据和操作的安全性。
3. **特性提取**：识别并提取 MCP Server 的关键特性，如使用的工具、资源、提示信息以及所需参数等，为用户提供全面的了解。

这个徽章能帮助用户快速评估服务器的安全性、能力以及获取安装说明。

## 二、项目结构
Monad MCP Server 的项目结构清晰，各个组件分工明确，便于开发者进行维护和扩展。主要结构如下：

```
monad-mcp-server/
├── .env.example        # 示例环境变量文件
├── .gitignore          # 指定 Git 应忽略的文件
├── LICENSE             # 项目的软件许可证
├── README.md           # 提供项目概述和说明
├── package-lock.json   # 记录依赖项的确切版本
├── package.json        # 列出项目依赖项和脚本
├── pnpm-lock.yaml      # PNPM 依赖项锁定文件
├── src/                # 源代码目录
│   ├── config/         # 配置文件
│   │   └── server.ts   # 服务器设置和 Viem 客户端初始化
│   ├── index.ts        # 应用程序的主入口点
│   └── tools/          # 与 Monad 交互的 MCP 工具
│       ├── block/      # 与区块链块相关的工具（如获取最新块）
│       ├── contract/   # 智能合约交互工具（如部署、监控事件）
│       ├── nft/        # 非同质化代币工具（如查询 MON NFT）
│       └── wallet/     # 钱包操作工具（如获取余额、发送交易）
└── tsconfig.json       # TypeScript 编译器配置
```

## 三、关键组件

1. **`src/index.ts`**：这是服务器的主入口点。它初始化 MCP 服务器实例，并注册所有可用的工具（钱包、合约、NFT、块）。代码如下：

```typescript
/**
 * Monad MCP Server Entry Point
 * 
 * This file serves as the main entry point for the Monad MCP server,
 * orchestrating the initialization of server components and tools.
 */

import { createServer, initializeTransport } from "./config/server";
import { nftProvider } from "./tools/nft";
import { blockProvider } from "./tools/block";
import { walletProvider } from "./tools/wallet";
import { contractProvider } from "./tools/contract";

/**
 * Main function to start the MCP server
 * Initializes server configuration and registers available tools
 */
async function main() {
    try {
        // Create and configure the server
        const server = createServer();

        // Register available tools
        walletProvider(server);
        contractProvider(server);
        nftProvider(server);
        blockProvider(server);

        // Initialize transport layer
        await initializeTransport(server);
    } catch (error) {
        console.error("Fatal error in main():", error);
        process.exit(1);
    }
}

// Start the server
main();
```

2. **`src/config/server.ts`**：该文件处理核心服务器配置。它设置 `McpServer` 实例的名称、版本和功能列表。同时，它初始化 `Viem` 公共客户端以与 Monad 测试网进行交互，并提供一个函数，用于使用环境变量中的私钥创建 `Viem` 钱包客户端。服务器使用 `StdioServerTransport` 进行通信。部分代码如下：

```typescript
/**
 * Server configuration and initialization
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPublicClient, createWalletClient, http } from "viem";
import { monadTestnet } from "viem/chains";
import { privateKeyToAccount } from 'viem/accounts';

import * as dotenv from 'dotenv';
dotenv.config();

// Create a public client to interact with the Monad testnet
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

/**
 * Create and configure the MCP server
 */
export function createServer() {
  return new McpServer({
    name: "monad-testnet",
    version: "1.0.0",
    capabilities: [
      "get-mon-balance",
      "send-mon-transaction",
      "deploy-mon-contract",
      "watch-contract-events",
      "query-mon-nft",
      "get-latest-block",
      "get-block-by-number",
    ],
  });
}

/**
 * Initialize the server transport layer
 */
export async function initializeTransport(server: McpServer) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Monad testnet MCP Server running on stdio");
}

export async function createWallet() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is not set');
  }
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createWalletClient({ account, chain: monadTestnet, transport: http() });
  return client;
}
```

3. **`src/tools/`**：此目录包含各种 MCP 工具的实现。每个子目录通常专注于 Monad 交互的特定方面：
  - **`walletProvider`**：管理 MON 代币余额和交易。
    
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { balanceProvider } from "./balance";
import { sendMonProvider } from "./transfer";

export function walletProvider(server: McpServer) {
    balanceProvider(server);
    sendMonProvider(server);
}
```

  - **`contractProvider`**：处理智能合约部署和事件监控。

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { deployContractProvider } from "./deploy";
import { contractEventProvider } from "./events";

export function contractProvider(server: McpServer) {
    deployContractProvider(server);
    contractEventProvider(server);
}
```

  - **`nftProvider`**：提供在 Monad 网络上查询 NFT 的功能。
   
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { nftQueryProvider } from "./query";

export function nftProvider(server: McpServer) {
    nftQueryProvider(server);
}
```

  - **`blockProvider`**：提供检索块信息的工具。
   
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { getLatestBlockProvider } from "./get-latest-block";
import { getBlockByNumberProvider } from "./get-block-by-number";

export function blockProvider(server: McpServer) {
    getLatestBlockProvider(server);
    getBlockByNumberProvider(server);
}
```

## 四、前置要求

在开始之前，请确保你已经安装了以下软件：
1. **Node.js**（版本 20 或更高）
2. **Node.js 包管理器**：`npm`、`yarn` 或 `pnpm`（本项目示例使用 `pnpm`）
3. **Claude Desktop**（或任何 MCP 兼容客户端），用于与服务器进行交互。

## 五、开始使用

按照以下步骤设置并运行 Monad MCP Server：
1. **克隆仓库**：

```shell
git clone https://github.com/lispking/monad-mcp-server.git
cd monad-mcp-server
```

2. **安装依赖项**：
使用 `pnpm`（或你喜欢的包管理器）安装 `package.json` 中列出的项目依赖项：

```shell
pnpm install
```

3. **构建项目**：
服务器使用 TypeScript 编写，需要编译成 JavaScript。运行构建脚本：

```shell
pnpm build
```

此命令将使用 `tsc`（TypeScript 编译器）将 `src` 目录中的源文件编译到 `build` 目录中。

## 六、MCP Server 功能

如 `src/config/server.ts` 中所定义，服务器提供以下功能：

### 1. **`get-mon-balance`**：检索账户的 MON 代币余额。实现代码如下：

```typescript
/**
 * Register the balance tool with the MCP server
 */
export function balanceProvider(server: McpServer) {
    server.tool(
        "get-mon-balance",
        "Get MON balance for an address on Monad testnet",
        {
            address: z.string().describe("Monad testnet address to check balance for"),
        },
        async ({ address }) => {
            try {
                const balance = await publicClient.getBalance({
                    address: address as `0x${string}`,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Balance for ${address}: ${formatUnits(balance, 18)} MON`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to retrieve balance for address: ${address}. Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    );
}
```

### 2. **`send-mon-transaction`**：从一个账户向另一个账户发送 MON 代币。实现代码如下：

```typescript
/**
 * Register the transaction tool with the MCP server
 */
export function sendMonProvider(server: McpServer) {
    server.tool(
        "send-mon-transaction",
        "Send MON transaction on Monad testnet",
        {
            to: z.string().describe("Recipient address"),
            amount: z.string().describe("Amount of MON to send"),
        },
        async ({ to, amount }) => {
            try {
                // Create wallet client
                const client = await createWallet();

                // Send transaction
                const hash = await client.sendTransaction({
                    to: to as `0x${string}`,
                    value: parseEther(amount),
                });

                return {
                    content: [
                        {
                            type: "text",
                            text: `Transaction sent successfully! Hash: ${hash}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to send transaction. Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    );
}
```

### 3. **`deploy-mon-contract`**：将智能合约部署到 Monad 测试网。实现代码如下：

```typescript
/**
 * Register the contract deployment tool with the MCP server
 */
export function deployContractProvider(server: McpServer) {
    server.tool(
        "deploy-mon-contract",
        "Deploy a smart contract on Monad testnet",
        {
            bytecode: z.string().describe("Contract bytecode"),
            abi: z.string().describe("Contract ABI"),
            constructorArgs: z.array(z.any()).optional().describe("Constructor arguments"),
        },
        async ({ bytecode, abi, constructorArgs }) => {
            try {
                // Create wallet client
                const client = await createWallet();

                // Deploy contract
                const hash = await client.deployContract({
                    abi: JSON.parse(abi),
                    bytecode: bytecode as `0x${string}`,
                    args: constructorArgs || [],
                });

                return {
                    content: [
                        {
                            type: "text",
                            text: `Contract deployment transaction sent! Hash: ${hash}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to deploy contract. Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    );
}
```

### 4. **`watch-contract-events`**：监控并报告特定智能合约发出的事件。实现代码如下：

```typescript
/**
 * Register the event listener tool with the MCP server
 */
export function contractEventProvider(server: McpServer) {
    server.tool(
        "watch-contract-events",
        "Watch for smart contract events on Monad testnet",
        {
            address: z.string().describe("Contract address to watch"),
            eventName: z.string().describe("Name of the event to watch"),
            abi: z.string().describe("Contract ABI"),
            fromBlock: z.string().optional().describe("Start watching from this block number"),
        },
        async ({ address, eventName, abi, fromBlock }) => {
            try {
                const parsedAbi = JSON.parse(abi);
                const eventAbi = parsedAbi.find(
                    (item: any) => item.type === 'event' && item.name === eventName
                );

                if (!eventAbi) {
                    throw new Error(`Event ${eventName} not found in ABI`);
                }

                // Get past events
                const logs = await publicClient.getLogs({
                    address: address as `0x${string}`,
                    event: parseAbiItem(JSON.stringify(eventAbi)) as any,
                    fromBlock: fromBlock ? BigInt(fromBlock) : undefined,
                });

                return {
                    content: [
                        {
                            type: "text",
                            text: `Found ${logs.length} events for ${eventName} at ${address}:\n${JSON.stringify(logs, null, 2)}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to watch events. Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    );
}
```
### 5. **`query-mon-nft`**：查询 Monad 网络上非同质化代币的信息。实现代码如下：

```typescript
/**
 * Register the NFT query tool with the MCP server
 */
export function nftQueryProvider(server: McpServer) {
    server.tool(
        "query-mon-nft",
        "Query NFT information on Monad testnet",
        {
            contractAddress: z.string().describe("NFT contract address"),
            tokenId: z.string().describe("Token ID of the NFT"),
        },
        async ({ contractAddress, tokenId }) => {
            try {
                // Create contract instance
                const contract = {
                    address: contractAddress as `0x${string}`,
                    abi: ERC721_ABI,
                };

                // Get owner and token URI
                const [owner, tokenUri] = await Promise.all([
                    publicClient.readContract({
                        ...contract,
                        functionName: 'ownerOf',
                        args: [BigInt(tokenId)],
                    }),
                    publicClient.readContract({
                        ...contract,
                        functionName: 'tokenURI',
                        args: [BigInt(tokenId)],
                    }),
                ]);

                return {
                    content: [
                        {
                            type: "text",
                            text: `NFT Information:\nContract: ${contractAddress}\nToken ID: ${tokenId}\nOwner: ${owner}\nToken URI: ${tokenUri}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to query NFT information. Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    );
}
```

### 6. **`get-latest-block`**：获取 Monad 测试网上最新块的详细信息。实现代码如下：

```typescript
/**
 * Tool implementation for getting the latest block on Monad testnet
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { publicClient } from "../../config/server";

/**
 * Register the latest block tool with the MCP server
 */
export function getLatestBlockProvider(server: McpServer) {
    server.tool(
        "get-latest-block",
        "Get the latest block on Monad testnet",
        {},
        async () => {
            try {
                const block = await publicClient.getBlock();
                return {
                    content: [
                        {
                            type: "text",
                            text: `Block Number: ${block.number}
                                Hash: ${block.hash}
                                Timestamp: ${block.timestamp}
                                Transaction Count: ${block.transactions.length}
                                Parent Hash: ${block.parentHash}
                                Gas Used: ${block.gasUsed}
                                Gas Limit: ${block.gasLimit}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to retrieve the latest block. Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    );
}
```

### 7. **`get-block-by-number`**：按块编号检索特定块。实现代码如下：

```typescript
/**
 * Register the get block by number tool with the MCP server
 */
export function getBlockByNumberProvider(server: McpServer) {
    server.tool(
        "get-block-by-number",
        "Get a block by number on Monad testnet",
        { "number": z.string().describe("The block number to retrieve"), },
        async (args) => {
            try {
                const block = await publicClient.getBlock({ blockNumber: BigInt(args.number) });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Block Number: ${block.number}
                                Hash: ${block.hash}
                                Timestamp: ${block.timestamp}
                                Transaction Count: ${block.transactions.length}
                                Parent Hash: ${block.parentHash}
                                Gas Used: ${block.gasUsed}
                                Gas Limit: ${block.gasLimit}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to retrieve the block. Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    );
}
```

## 七、将 MCP Server配置添加到客户端

要使用此服务与 MCP 兼容客户端（如 Claude Desktop），你需要将其配置添加到客户端的设置中。具体方法可能因客户端而异，但通常涉及指定如何运行 MCP Server。以下是一个示例配置片段：

```json
{
  "mcpServers": {
    // ... 其他服务器配置 ...
    "monad-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/your/project/monad-mcp-server/build/index.js"
      ],
      "env": {
        "PRIVATE_KEY": "<your_monad_private_key_if_not_using_dotenv_or_to_override>"
      }
    }
    // ... 其他服务器配置 ...
  }
}
```

**配置字段说明**：
- `"monad-mcp"`：你在客户端中为该服务器配置分配的唯一名称。
- `"command": "node"`：指定服务器是一个 Node.js 应用程序。
- `"args"`：传递给 `node` 命令的参数数组。第一个参数是服务器编译入口点的路径，需将 `/absolute/path/to/your/project/` 替换为你克隆 `monad-mcp-server` 仓库的实际绝对路径。
- `"env"`：用于设置服务器进程环境变量的对象。`"PRIVATE_KEY"` 可在此处设置你的私钥，但为了更好的安全性，通常建议使用 `.env` 文件。如果在此处设置，它可能会根据客户端的行为和服务器的环境变量加载顺序覆盖 `.env` 文件中的值。

> 以下为大家展示 `Trae` 的配置效果图~

![Trae 配置效果图](/blog/monad_mcp_tutorial_2.png)


## 八、惊喜彩蛋 —— Glama 创始人提交的 PR

这个由 Glama 创始人提交的 PR 意义非凡。Glama 作为一个专业的平台，其创始人亲自参与到 Monad MCP Server 的优化中，充分体现了对该项目的重视和认可。

这个徽章的添加不仅是对项目的一种肯定，也为开发者提供了更多的信心。它意味着 Monad MCP Server 在功能、安全等方面都经过了专业的审核和验证，开发者可以更加放心地使用这个工具进行区块链开发。

![Glama 创始人的 PR](/blog/monad_mcp_tutorial_3.png)

> Glama 收录链接：https://glama.ai/mcp/servers/@lispking/monad-mcp-server


## 九、总结：从开发者到生态共建者

通过本文的介绍，你已掌握 Monad MCP Server 的核心玩法，更见证了它从一个开源项目到被行业头部平台收录的「逆袭之路」。

这不仅是技术的胜利，更是开源社区与 AI + 区块链生态碰撞出的火花—— 当你的代码被全球开发者使用，当你的工具成为 AI 与区块链交互的桥梁，每一行代码都有了更深远的意义。

现在就动手搭建你的 MCP Server 吧！ 或许下一个被 `glama.ai` 收录的工具，就出自你的创意！🌟 

## 十、进一步资源

对于所使用的技术和涉及的概念的更详细信息，请参考以下官方文档：
1. [Model Context Protocol (MCP) 文档](https://modelcontextprotocol.io/introduction)
2. [Monad 文档](https://docs.monad.xyz/)
3. [Viem 文档](https://viem.sh/)（Viem 是本项目中使用的以太坊/Monad 客户端库）

通过以上步骤，你应该能够充分利用 Monad MCP Server 与 Monad 测试网进行交互。希望这篇教程对你有所帮助，祝你在区块链开发的道路上取得成功！ 
