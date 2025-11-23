# 如何构建与 Monad 测试网交互的 MCP 服务器

URL: https://docs.monad.xyz/guides/monad-mcp

在本指南中，你将学习如何构建一个[模型上下文协议](https://github.com/modelcontextprotocol) (MCP) 服务器，该服务器允许 MCP 客户端（Claude Desktop）查询 Monad 测试网以检查账户的 MON 余额。

## 什么是 MCP？

[模型上下文协议](https://github.com/modelcontextprotocol) (MCP) 是一个允许 AI 模型与外部工具和服务交互的标准。

## 先决条件

- Node.js (v16 或更高版本)
- `npm` 或 `yarn`
- Claude Desktop

## 开始使用

1. 克隆 [`monad-mcp-tutorial`](https://github.com/monad-developers/monad-mcp-tutorial) 仓库。该仓库包含一些代码，可以帮助你快速开始。

```shell
git clone https://github.com/monad-developers/monad-mcp-tutorial.git
```

1. 安装依赖项：

```text
npm install
```

## 构建 MCP 服务器

与 Monad 测试网相关的配置已经添加到 `src` 文件夹中的 `index.ts` 文件。

### 定义服务器实例

index.ts src

```ts
// 创建新的 MCP 服务器实例
const server = new McpServer({
  name: "monad-mcp-tutorial",
  version: "0.0.1",
  // 客户端可以调用的支持工具名称数组
  capabilities: ["get-mon-balance"]
});
```

### 定义 MON 余额工具

以下是 `get-mon-balance` 工具的脚手架：

index.ts src

```ts
server.tool(
    // 工具 ID 
    "get-mon-balance",
    // 工具功能描述
    "Get MON balance for an address on Monad testnet",
    // 输入模式
    {
        address: z.string().describe("Monad testnet address to check balance for"),
    },
    // 工具实现
    async ({ address }) => {
        // 检查 MON 余额的代码
    }
);
```

让我们为工具添加 MON 余额检查的实现：

index.ts src

```ts
server.tool(
    // 工具 ID 
    "get-mon-balance",
    // 工具功能描述
    "Get MON balance for an address on Monad testnet",
    // 输入模式
    {
        address: z.string().describe("Monad testnet address to check balance for"),
    },
    // 工具实现
    async ({ address }) => {
        try {
            // 检查输入地址的 MON 余额
            const balance = await publicClient.getBalance({
                address: address as `0x${string}`,
            });

            // 返回指示余额的人性化消息
            return {
                content: [
                    {
                        type: "text",
                        text: `Balance for ${address}: ${formatUnits(balance, 18)} MON`,
                    },
                ],
            };
        } catch (error) {
            // 如果余额检查过程失败，向 MCP 客户端返回优雅的失败消息
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to retrieve balance for address: ${address}. Error: ${
                        error instanceof Error ? error.message : String(error)
                        }`,
                    },
                ],
            };
        }
    }
);
```

### 从 `main` 函数初始化传输层和服务器

index.ts src

```ts
async function main() {
    // 使用标准输入/输出创建传输层
    const transport = new StdioServerTransport();
    
    // 将服务器连接到传输层
    await server.connect(transport);
}
```

### 构建项目

```shell
npm run build
```

服务器现在已准备就绪！

### 将 MCP 服务器添加到 Claude Desktop

1. 打开 "Claude Desktop"
![claude desktop](https://github.com/monad-developers/monad-mcp-tutorial/blob/main/static/1.png?raw=true)

1. 打开设置
Claude > Settings > Developer

![claude settings](https://github.com/monad-developers/monad-mcp-tutorial/blob/main/static/claude_settings.gif?raw=true)

1. 打开 `claude_desktop_config.json`
![claude config](https://github.com/monad-developers/monad-mcp-tutorial/blob/main/static/config.gif?raw=true)

1. 添加关于 MCP 服务器的详细信息并保存文件。
claude_desktop_config.json

```json
{
  "mcpServers": {
    ...
    "monad-mcp": {
      "command": "node",
      "args": [
        "/<path-to-project>/build/index.js"
      ]
    }
  }
}
```

1. 重启 "Claude Desktop"

### 使用 MCP 服务器

现在你应该能够在 Claude 中看到工具！

![tools](https://github.com/monad-developers/monad-mcp-tutorial/blob/main/static/tools.gif?raw=true)

这是最终结果

![final result](https://github.com/monad-developers/monad-mcp-tutorial/blob/main/static/final_result.gif?raw=true)

## 进一步的资源

- [模型上下文协议文档](https://modelcontextprotocol.io/introduction)
- [Monad 文档](https://docs.monad.xyz/)
- [Viem 文档](https://viem.sh/)