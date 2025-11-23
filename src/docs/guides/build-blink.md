# 如何构建捐赠 Blink

URL: https://docs.monad.xyz/guides/blinks-guide

在本指南中，你将学习如何构建一个允许人们一键捐赠 MON 的 [Blink](https://www.dialect.to/)。

## 先决条件

- 你选择的代码编辑器（推荐 [Cursor](https://www.cursor.com/) 或 [Visual Studio Code](https://code.visualstudio.com/)）
- [Node](https://nodejs.org/en/download) 18.x.x 或更高版本
- 基础 TypeScript 知识
- 测试网 MON（[水龙头](https://testnet.monad.xyz)）

## 初始设置

### 初始化项目

```bash
npx create-next-app@14 blink-starter-monad && cd blink-starter-monad
```

**出现提示时，使用以下设置配置你的项目：**

- ✔ Ok to proceed? → Yes
- ✔ Would you like to use TypeScript? → Yes
- ✔ Would you like to use ESLint? → Yes
- ✔ Would you like to use Tailwind CSS? → Yes
- ✔ Would you like your code inside a `src/` directory? → Yes
- ✔ Would you like to use App Router? → Yes
- ✔ Would you like to customize the import alias ( `@/*` by default)? → No

### 安装依赖项

```bash
npm install @solana/actions wagmi viem@2.x
```

### 启动开发服务器

开发服务器用于启动在你的计算机上运行的本地测试环境。它非常适合在发布到生产环境之前测试和开发你的 blink。

```bash
npm run dev
```

## 构建 Blink

现在我们已经完成了基本设置，是时候开始构建 blink 了。

### 创建端点

要编写 blink 提供者，你必须创建一个端点。由于有 NextJS，这一切都非常简单。你所要做的就是创建以下文件夹结构：

```text
src/
├─── app/
    ├─── api/
            ├─── actions/
                ├─── donate-mon/
                    ├─── route.ts
```

### 创建 actions.json

在 `app` 文件夹中为 `actions.json` 文件创建一个路由，该文件将托管在我们应用程序的根目录中。此文件需要告诉其他应用程序你的网站上有哪些 blink 提供者可用。**将其视为 blink 的站点地图。**

你可以在官方 [Dialect 文档](https://docs.dialect.to/documentation/actions/specification/actions.json) 中阅读更多关于 [actions.json](https://docs.dialect.to/documentation/actions/specification/actions.json) 的信息。

```text
src/
├─── app/
    ├─── actions.json/
        ├─── route.ts
```

route.ts src > app > actions.json

```js
import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      // 将所有根级路由映射到一个操作
      {
        pathPattern: "/*",
        apiPath: "/api/actions/*",
      },
      // 幂等规则作为回退
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// 不要忘记包含 `OPTIONS` HTTP 方法
// 这将确保 CORS 对 BLINKS 有效
export const OPTIONS = GET;
```

### 为 blink 添加图片

每个 blink 都有一个在顶部渲染的图片。如果你的图片已经托管在某处，你可以跳过此步骤，但如果没有，你可以在你的 `NextJS` 项目中创建一个 `public` 文件夹并将图片粘贴到那里。

在我们的示例中，我们将把一个名为 `donate-mon.png` 的文件粘贴到此 public 文件夹中。你可以右键单击并保存下面的图片。

![donate-mon](https://docs.monad.xyz/assets/images/donate-mon-edb8311848894b2ec7edae30bcaadaad.png)

![image](https://docs.monad.xyz/assets/images/1-c444ef3a9462501ae42703a600d0e3ee.png)

### OPTIONS 端点和请求头

这为跨源请求和 API 端点启用 CORS 标准请求头。这是你为每个 Blink 进行的标准配置。

route.ts src > app > api > actions > donate-mon

```js
// Monad 的 CAIP-2 格式
const blockchain = `eip155:10143`;

// 使用 CAIP 区块链 ID 创建请求头
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
  "Content-Type, x-blockchain-ids, x-action-version",
  "Content-Type": "application/json",
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.0",
};

// CORS 预检请求需要 OPTIONS 端点
// 如果你不添加这个，你的 Blink 将无法渲染
export const OPTIONS = async () => {
  return new Response(null, { headers });
};
```

### GET 端点

`GET` 返回 Blink 元数据和 UI 配置。

它描述：

- Action 在 Blink 客户端中的显示方式
- 用户需要提供的参数
- Action 应该如何执行

route.ts src > app > api > actions > donate-mon

```js
import {
  ActionGetResponse,
} from "@solana/actions";

// GET 端点返回 Blink 元数据（JSON）和 UI 配置
export const GET = async (req: Request) => {
  // 此 JSON 用于渲染 Blink UI
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/donate-mon.png", req.url).toString()}`,
    label: "1 MON",
    title: "Donate MON",
    description:
      "This Blink demonstrates how to donate MON on the Monad blockchain. It is a part of the official Blink Starter Guides by Dialect Labs.  \n\nLearn how to build this Blink: https://dialect.to/docs/guides/donate-mon",
    // Links 用于当你有多个操作或需要多个参数时
    links: {
      actions: [
        {
          // 将此定义为区块链交易
          type: "transaction",
          label: "0.01 MON",
          // 这是 POST 请求的端点
          href: `/api/actions/donate-mon?amount=0.01`,
        },
        {
          type: "transaction",
          label: "0.05 MON",
          href: `/api/actions/donate-mon?amount=0.05`,
        },
        {
          type: "transaction",
          label: "0.1 MON",
          href: `/api/actions/donate-mon?amount=0.1`,
        },
        {
          // 自定义输入字段示例
          type: "transaction",
          href: `/api/actions/donate-mon?amount={amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom MON amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  // 使用适当的请求头返回响应
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};
```

### 测试 Blink

访问 [dial.to](https://dial.to) 并输入你的 blink 链接，看看它是否有效。如果你的服务器在 localhost:3000 上运行，URL 应该是这样的：`http://localhost:3000/api/actions/donate-mon`

信息提示  
[dial.to](https://dial.to) 目前只支持 EVM 的 GET 预览。要测试你的 POST 端点，我们需要构建一个 Blink 客户端。

![testing blink](https://docs.monad.xyz/assets/images/2-45cfc9833636a2f6c3123d5267cd9cf8.png)

### POST 端点

`POST` 处理实际的 MON 转账交易。

#### 发送 POST 请求到端点

创建 post 请求结构并添加必要的导入以及文件顶部的 `donationWallet`。

route.ts src > app > api > actions > donate-mon

```js
// 更新导入
import { ActionGetResponse, ActionPostResponse } from "@solana/actions";
import { serialize } from "wagmi";
import { parseEther } from "viem";

// 将接收捐赠的钱包地址
const donationWallet = `<RECEIVER_ADDRESS>`;

// POST 端点处理实际的交易创建
export const POST = async (req: Request) => {
  try {
  
  // 下一步的代码放在这里
  
  } catch (error) {
    // 记录并返回错误响应
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
};
```

#### 从请求中提取数据

请求包含 URL 和付款人的账户（PublicKey）。

route.ts src > app > api > actions > donate-mon

```js
// POST 端点处理实际的交易创建
export const POST = async (req: Request) => {
  try {
    // 步骤 1
    // 从 URL 提取数量
    const url = new URL(req.url);
    const amount = url.searchParams.get("amount");

    if (!amount) {
        throw new Error("Amount is required");
    }

  } catch (error) {
    // 错误处理
  }
}
```

#### 创建交易

使用所有必要数据创建新交易并将其添加到 `POST` 请求下方。

route.ts src > app > api > actions > donate-mon

```js
// POST 端点处理实际的交易创建
export const POST = async (req: Request) => {
  try {

    // ... 步骤中的前一个代码
    
    // 构建交易
    const transaction = {
        to: donationWallet,
        value: parseEther(amount).toString(),
        chainId: 10143,
    };

    const transactionJson = serialize(transaction);
  
  } catch (error) {
    // 错误处理
  }
}
```

#### 在响应中返回交易

创建 `ActionPostResponse` 并将其返回给客户端。

route.ts src > app > api > actions > donate-mon

```ts
export const POST = async (req: Request) => {
  try {
    // ... 步骤 1 和 2 的前一个代码
    
    // 构建 ActionPostResponse
    const response: ActionPostResponse = {
        type: "transaction",
        transaction: transactionJson,
        message: "Donate MON",
    };

    // 使用适当的请求头返回响应
    return new Response(JSON.stringify(response), {
        status: 200,
        headers,
    });

  } catch (error) {
    // 错误处理
  }
}
```

### `route.ts` 中的完整代码

route.ts src > app > api > actions > donate-mon

```ts
import { ActionGetResponse, ActionPostResponse } from "@solana/actions";
import { serialize } from "wagmi";
import { parseEther } from "viem";

// Monad 的 CAIP-2 格式
const blockchain = `eip155:10143`;

// 将接收捐赠的钱包地址
const donationWallet = `<RECEIVER_ADDRESS>`;

// 使用 CAIP 区块链 ID 创建请求头
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
  "Content-Type, x-blockchain-ids, x-action-version",
  "Content-Type": "application/json",
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.0",
};

// CORS 预检请求需要 OPTIONS 端点
// 如果你不添加这个，你的 Blink 将无法渲染
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

// GET 端点返回 Blink 元数据（JSON）和 UI 配置
export const GET = async (req: Request) => {
  // 此 JSON 用于渲染 Blink UI
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/donate-mon.png", req.url).toString()}`,
    label: "1 MON",
    title: "Donate MON",
    description:
      "This Blink demonstrates how to donate MON on the Monad blockchain. It is a part of the official Blink Starter Guides by Dialect Labs.  \n\nLearn how to build this Blink: https://dialect.to/docs/guides/donate-mon",
    // Links 用于当你有多个操作或需要多个参数时
    links: {
      actions: [
        {
          // 将此定义为区块链交易
          type: "transaction",
          label: "0.01 MON",
          // 这是 POST 请求的端点
          href: `/api/actions/donate-mon?amount=0.01`,
        },
        {
          type: "transaction",
          label: "0.05 MON",
          href: `/api/actions/donate-mon?amount=0.05`,
        },
        {
          type: "transaction",
          label: "0.1 MON",
          href: `/api/actions/donate-mon?amount=0.1`,
        },
        {
          // 自定义输入字段示例
          type: "transaction",
          href: `/api/actions/donate-mon?amount={amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom MON amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  // 使用适当的请求头返回响应
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

// POST 端点处理实际的交易创建
export const POST = async (req: Request) => {
    try {
      // 从 URL 提取数量
      const url = new URL(req.url);
      const amount = url.searchParams.get("amount");

      if (!amount) {
          throw new Error("Amount is required");
      }

      // 构建交易
      const transaction = {
          to: donationWallet,
          value: parseEther(amount).toString(),
          chainId: 10143,
      };

      const transactionJson = serialize(transaction);

      // 构建 ActionPostResponse
      const response: ActionPostResponse = {
          type: "transaction",
          transaction: transactionJson,
          message: "Donate MON",
      };

      // 使用适当的请求头返回响应
      return new Response(JSON.stringify(response), {
          status: 200,
          headers,
      });
    } catch (error) {
      // 记录并返回错误响应
      console.error("Error processing request:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers,
      });
  }
};
```

此时 Blink 已准备就绪，但我们需要一个 Blink 客户端，因为 [dial.to](https://dial.to) 不支持 EVM 钱包。

## 实现 Blink 客户端

在此步骤中，你将学习实现 blink 客户端，这是 blink 的可视化表示。

### 安装依赖项

```bash
npm install connectkit @tanstack/react-query @dialectlabs/blinks
```

### 实现提供者

提供者是在 blink 中触发钱包操作所必需的。

### 为 `WagmiProvider` 创建配置

此文件用于在下一步为 `WagmiProvider` 设置适当的配置。

config.ts src

```ts
import { http, createConfig } from "wagmi";
import { monadTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
});
```

### 创建钱包连接上下文提供者

创建我们可以用来包装应用程序的提供者。如果你在 NextJS 项目中，不要忘记在文件顶部使用 `"use client";`。

信息提示  
在这个项目中，我们使用 [ConnectKit](https://docs.family.co/connectkit)，但你也可以使用其他替代方案（例如：[RainbowKit](https://www.rainbowkit.com/)）

provider.tsx src

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { type PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/config";

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
```

### 使用上下文提供者包装应用

如果你希望你的提供者在整个应用程序中可访问，建议在你的 `layout.tsx` 中围绕 `children` 元素进行包装。

layout.tsx src > app

```tsx
// 额外的导入
import { Providers } from "@/provider";

// 文件中的其他代码...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 使用 `Blink` 组件

现在我们已经包装了所有内容，我们可以开始实现 blink 渲染器。为此，打开你的 `/src/app` 文件夹中的 `page.tsx` 文件。

page.tsx src > app

```tsx
"use client";

import {
  Blink,
  useBlink,
  useActionsRegistryInterval,
} from "@dialectlabs/blinks";

import "@dialectlabs/blinks/index.css";

import { useEvmWagmiAdapter } from "@dialectlabs/blinks/hooks/evm";

import { ConnectKitButton, useModal } from "connectkit";

export default function Home() {
  // Actions 注册表间隔
  useActionsRegistryInterval();

  // ConnectKit 模态框
  const { setOpen } = useModal();

  // Wagmi 适配器，用于连接钱包
  const { adapter } = useEvmWagmiAdapter({
    onConnectWalletRequest: async () => {
      setOpen(true);
    },
  });

  // 我们想要在 Blink 中执行的操作
  const { blink, isLoading } = useBlink({
    url: "evm-action:http://localhost:3000/api/actions/donate-mon",
  });

  return (
    <main className="flex flex-col items-center justify-center">
      <ConnectKitButton />
      <div className="w-1/2 lg:px-4 lg:p-8">
        {isLoading || !blink ? (
          <span>Loading</span>
        ) : (
          // Blink 组件，用于执行操作
          <Blink blink={blink} adapter={adapter} securityLevel="all" />
        )}
      </div>
    </main>
  );
}
```

### 进行交易

就是这样。要测试它，访问 [localhost:3000](http://localhost:3000) 并点击按钮或输入你想要捐赠的自定义金额。

![blink client](https://docs.monad.xyz/assets/images/3-d36ed0ec501b4e794e39389b9c8a6c93.png)

## 结论

在本教程中，你学会了如何使用 `NextJS` 项目从头创建一个向另一个钱包发送 MON 的 blink。除了基本的项目设置之外，我们还构建了两个重要的东西。

第一个是 blink 提供者。此提供者作为 blink 的 API，处理 blink 在前端中的渲染方式（`GET` 请求）并执行区块链交易（`POST` 请求）。

第二个实现是 blink 客户端。此客户端作为 blink 的可视化表示，是用户看到并用于与 blink 提供者交互的内容。

这是两个独立的部分，这意味着你可以构建 blink 而无需担心客户端实现，你也可以为现有的 blink 实现客户端而无需构建自己的 blink。