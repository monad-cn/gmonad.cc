# Getting Started with Reown AppKit on Monad Testnet using AppKit CLI

URL: https://docs.monad.xyz/guides/reown-guide

This guide shows you how to use [Reown AppKit](https://reown.com/appkit) to enable wallet connections and interact with the Monad network. AppKit provides seamless wallet connections, including email/social logins, smart accounts, one-click authentication, and wallet notifications.

For this tutorial, we'll be using Next.js, though you can use any other framework compatible with AppKit.

note
AppKit is available on eight frameworks, including React, Next.js, Vue, JavaScript, React Native, Flutter, Android, iOS, and Unity.

**What you'll learn:**

- Set up a new project using AppKit CLI
- Configure the project for Monad Testnet
- Connect wallets to your application
**Time to complete:** ~5 minutes

## Prerequisites

- Node.js installed on your system

## Step 1: Create a New Project

Run the AppKit CLI to create a new project configured with Reown AppKit:

```bash
npx @reown/appkit-cli
```

When prompted, provide:

1. **Project Name** : Choose a name (e.g., `my-monad-appkit-app` )
2. **Framework** : Select `Next.js` (or your preferred framework)
3. **Blockchain Library** : Choose whether you want to install Wagmi, Ethers, Solana, or Multichain (EVM + Solana). In this case, you need to either pick `Wagmi` or `Ethers` since Monad is an EVM compatible blockchain. We will be choosing `Wagmi` for the sake of this tutorial.
The CLI will create a minimal AppKit example with your selected configuration.

## Step 2: Set Up the Project

Navigate to your project directory and install dependencies:

```bash
cd my-monad-appkit-app
npm install
```

note
You can also use other package managers such as `yarn` , `bun` , `pnpm` , etc.

## Step 3: Get Your Project ID

The example is pre-configured with a `projectId` that will only work on `localhost` . To fully configure your project, you will need to get a `projectId` from the [Reown Dashboard](https://dashboard.reown.com/?utm_source=monad&utm_medium=docs&utm_campaign=backlinks) , as described below:

1. Go to [dashboard.reown.com](https://dashboard.reown.com/?utm_source=monad&utm_medium=docs&utm_campaign=backlinks) and sign in
2. Navigate to your team's Cloud Dashboard
3. Click "+ Project"
![Create Project](https://docs.monad.xyz/assets/images/1-a0b1b598ec863d13c9c317ccfc72fb38.webp)

1. If prompted to choose a product type, select "AppKit" (otherwise ignore this step)
![Enter Project Name](https://docs.monad.xyz/assets/images/2-95d19bd01edad703cb78c8eae5d275b6.webp)

1. Choose a project name
2. Click "Create"
![Select Framework](https://docs.monad.xyz/assets/images/3-699c9ee3671a5b33bba0c8f7dd72c550.webp)

1. Copy the generated Project ID from the bottom of the page
![Project ID](https://docs.monad.xyz/assets/images/4-0c5cd198092f90a1287ae966cb48a156.webp)

## Step 4: Configure Environment Variables

Create a `.env` file in your project root:

.env

```js
NEXT_PUBLIC_PROJECT_ID="YOUR_PROJECT_ID_HERE"
```

Replace `YOUR_PROJECT_ID_HERE` with the Project ID you copied in the previous step.

warning
Environment variables starting with `NEXT_PUBLIC_` are exposed to the client. Only include non-sensitive configuration data.

## Step 5: Configure for Monad Testnet

Update `/src/config/index.ts` to use Monad Testnet:

index.ts src > config

```ts
import { mainnet, monadTestnet } from '@reown/appkit/networks'

export const networks = [monadTestnet] as [AppKitNetwork, ...AppKitNetwork[]]
```

This configures your app to use Monad Testnet instead of the default networks.

## Step 6: Run Your Application

Start the development server:

```bash
npm run dev
```

Your app will be available at `http://localhost:3000` .

note
If you are using alternative package managers, you can try either of these commands - `yarn dev` , `pnpm dev` , or `bun dev` .

## 结论

您现在已经学会如何使用 AppKit CLI 创建一个简单的应用程序，允许用户连接他们的钱包并与 Monad 测试网交互。

**Reown AppKit** 是开发者在任何 EVM 链上将钱包连接和其他 Web3 功能集成到应用程序中的强大解决方案。只需几个简单步骤，您就可以为用户提供无缝的钱包访问、一键认证、社交登录和通知——简化他们的体验，同时启用入金功能和智能账户等高级功能。

## 下一步是什么？

- 探索 [Reown 博客](https://reown.com/blog)
- 查看完整示例：[Reown AppKit EVM](https://github.com/rohit-710/reown-appkit-evm)