# 如何使用 Envio HyperIndex 构建转账通知机器人

URL: https://docs.monad.xyz/guides/indexers/tg-bot-using-envio

在本指南中，您将学习如何使用 [Envio](https://envio.dev/) HyperIndex 创建一个 Telegram 机器人，在 Monad 测试网上发生 WMON 代币转账时发送通知。我们将详细介绍如何设置索引器和 Telegram 机器人。

Envio HyperIndex 是一个用于构建区块链应用后端的开源开发框架。它提供实时索引、从合约地址自动生成索引器，以及外部 API 调用的触发器功能。

## 前置条件

您需要安装以下工具：

- Node.js v18 或更新版本
- pnpm v8 或更新版本
- Docker Desktop（本地运行 Envio 索引器所需）

## 项目设置

首先，创建并进入一个新目录：

```shell
mkdir envio-mon && cd envio-mon
```

### 获取合约 ABI

1. 创建 `abi.json` 文件：

```shell
touch abi.json
```

1. 从浏览器复制 [WrappedMonad](https://testnet.monadvision.com/token/0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701?tab=Contract) 的 ABI

![image of explorer](https://docs.monad.xyz/assets/images/1-6ec0bf9121d2156336449792541fd837.png)

1. 将 ABI 粘贴到您的 `abi.json` 文件中

### 初始化项目

运行初始化命令：

```shell
pnpx envio init
```

按照提示操作：

1. 询问文件夹名称时按回车（使用当前目录）
2. 选择 `TypeScript` 作为开发语言
3. 选择 `Evm` 作为区块链生态系统
4. 选择 `Contract Import` 进行初始化
5. 选择 `Local ABI` 作为导入方法
6. 输入 `./abi.json` 作为 ABI 文件路径
7. 仅选择 `Transfer` 事件进行索引
8. 选择 `<Enter Network Id>` 并输入 `10143`（Monad 测试网链 ID）
9. 输入 `WrappedMonad` 作为合约名称
10. 输入合约地址：`0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701`
11. 选择 `I'm finished`，因为我们只索引一个合约
12. 选择是否创建或添加现有 API 令牌。如果选择创建新令牌，您将看到如下页面：
![新 API 令牌视图](https://docs.monad.xyz/img/guides/indexers/tg-bot-using-envio/2.png)项目初始化完成后，您应该在项目目录中看到以下项目结构。

![envio 控制台](https://docs.monad.xyz/img/guides/indexers/tg-bot-using-envio/3.png)在 `config.yaml` 文件中添加以下代码，以便在事件处理器中使用交易哈希：

config.yaml

```yaml
# 默认配置...
field_selection:
    transaction_fields:
      - hash
```

*有关 `field_selection` 配置的更多详情请查看[这里](https://docs.envio.dev/docs/HyperIndex/configuration-file#field-selection)*

## 启动索引器

启动 Docker Desktop。

在项目目录中运行以下命令启动索引器：

```shell
pnpx envio dev
```

您应该在终端中看到类似下图的内容；这表示索引器正在同步并最终将到达链的最新状态。

![envio 索引器同步中](https://docs.monad.xyz/img/guides/indexers/tg-bot-using-envio/4.png)您还将看到浏览器自动打开此页面，密码是 `testing`。

![hasura 本地页面](https://docs.monad.xyz/img/guides/indexers/tg-bot-using-envio/5.png)我们可以使用此界面通过 GraphQL 查询索引器。结果将取决于同步进度：

![查询界面](https://docs.monad.xyz/assets/images/6-99a5807f78d42faf895b04bdd141a085.png)

目前，索引器正在追赶链的最新状态。同步完成后，索引器将能够识别最新的 WMON 转账。

现在我们可以暂时关闭索引器，以便进行 Telegram 集成。

## 创建 Telegram 机器人

1. 访问 [BotFather](https://t.me/botfather) 创建您的机器人并获取 API 令牌
2. 在您的 `.env` 文件中添加这些环境变量：

```text
ENVIO_BOT_TOKEN=<your_bot_token>
ENVIO_TELEGRAM_CHAT_ID=<your_chat_id>
```

获取聊天 ID：

1. 创建一个 Telegram 群组并添加您的机器人
2. 向机器人发送 `/start` 命令：`@YourBot /start`
3. 访问 `https://api.telegram.org/bot<YourBOTToken>/getUpdates`
4. 查找频道聊天 ID（应该以"-"开头）

注意：如果您没有看到聊天 ID，请尝试移除机器人后重新添加到群组。

Telegram 机器人现在已准备就绪。

## 将 Telegram API 集成到 HyperIndex 事件处理器

在项目目录的 `src` 文件夹内创建 `libs` 文件夹，在其中创建 `telegram.ts` 文件并添加以下代码

telegram.ts src > libs

```ts
import axios from "axios";
import { CHAT_ID, BOT_TOKEN } from "../constants";

export const sendMessageToTelegram = async (message: string): Promise<void> => {
  try {
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    await axios.post(apiUrl, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("发送消息时出错：", error);
  }
};
```

您会遇到一些错误，让我们修复它们。

安装 `axios` 包

```bash
pnpm i axios
```

在 `src` 文件夹中创建名为 `constants.ts` 的文件并添加以下代码：

constants.ts src

```ts
export const EXPLORER_URL_MONAD = "https://testnet.monadvision.com/";

// WMON 转账金额阈值，超过此值机器人将发送通知
export const THRESHOLD_WEI: string = process.env.ENVIO_THRESHOLD_WEI ?? "1000000000000000000"; // 以 wei 为单位

export const BOT_TOKEN = process.env.ENVIO_BOT_TOKEN; // Telegram 机器人令牌
export const CHAT_ID = process.env.ENVIO_TELEGRAM_CHAT_ID; // WMON 转账通知频道 ID

// 获取提供地址的浏览器 URL 的函数
export const explorerUrlAddress = (address: string) =>
  EXPLORER_URL_MONAD + "address/" + address;

// 获取提供交易哈希的浏览器 URL 的函数
export const explorerUrlTx = (txHash: string) =>
  EXPLORER_URL_MONAD + "tx/" + txHash;
```

现在我们可以编辑 `src` 文件夹中的 `EventHandlers.ts`，添加发送 telegram 消息的代码：

EventHandlers.ts src

```ts
import {
  WrappedMonad,
} from "generated";
import { isIndexingAtHead, weiToEth } from "./libs/helpers";
import { sendMessageToTelegram } from "./libs/telegram";
import { THRESHOLD_WEI, explorerUrlAddress, explorerUrlTx } from "./constants";

// 其他事件处理器可以删除...

WrappedMonad.Transfer.handler(async ({ event, context }) => {
    const from_address = event.params.src;
    const to_address = event.params.dst;

  if (isIndexingAtHead(event.block.timestamp) && event.params.wad >= BigInt(THRESHOLD_WEI)) {
    // 仅在索引器从启动时间开始索引事件而非历史转账时发送消息，且仅在转账金额大于或等于 THRESHOLD_WEI 时发送消息。

    // 示例消息
    // WMON 转账警报：0x65C3564f1DD63eA81C11D8FE9a93F8FFb5615233 向 0xBA5Cf1c0c1238F60832618Ec49FC81e8C7C0CF01 转账了 2.0000 WMON！🔥 - 在浏览器中查看

    const msg = `WMON 转账警报：<a href="${explorerUrlAddress(from_address)}">${from_address}</a> 向 <a href="${explorerUrlAddress(to_address)}">${to_address}</a> 转账了 ${weiToEth(event.params.wad)} WMON！🔥 - <a href="${explorerUrlTx(
      event.transaction.hash
    )}">在浏览器中查看</a>`;

    await sendMessageToTelegram(msg);
  }
});
```

现在让我们修复导入错误。

在 `src/libs` 文件夹中创建名为 `helpers.ts` 的文件，将以下代码粘贴进去：

helpers.ts src > libs

```ts
// 用于确保仅在索引最新状态时发送通知，而不是在历史同步时
const INDEXER_START_TIMESTAMP = Math.floor(new Date().getTime() / 1000);

export const isIndexingAtHead = (timestamp: number): boolean => {
    return timestamp >= INDEXER_START_TIMESTAMP;
}

// 将 wei 转换为 ether 以提高可读性
export const weiToEth = (bigIntNumber: bigint): string => {
  // 将 BigInt 转换为字符串
  const numberString = bigIntNumber.toString();

  const decimalPointsInEth = 18;

  // 提取整数部分和小数部分
  const integerPart = numberString.substring(
    0,
    numberString.length - decimalPointsInEth
  );

  const decimalPart = numberString.slice(-decimalPointsInEth);

  // 插入小数点
  const decimalString =
    (integerPart ? integerPart : "0") +
    "." +
    decimalPart.padStart(decimalPointsInEth, "0");

  // 必要时添加负号
  return decimalString.slice(0, -14);
};
```

完成！我们现在可以运行索引器，当索引器检测到 WMON 转账时，telegram 机器人将开始在 telegram 频道中发送消息！

![机器人消息示例](https://docs.monad.xyz/assets/images/9-7340460fcfb839f45b4f5df724ae7494.png)*注意：截图拍摄于消息格式更改之前。如果您按照指南操作，消息会略有不同。*

注意：您可能不会立即看到消息，因为索引器需要一些时间才能追上最新区块的状态。

机器人仅在索引器在最终确定的区块中检测到 WMON 转账时发送通知，且时间戳大于或等于索引器启动时间。