# 如何使用 QuickNode Streams 索引每一笔 WMON 转账

URL: https://docs.monad.xyz/guides/indexers/quicknode-streams

在本指南中，您将学习如何使用 QuickNode Streams 索引 Monad 测试网上每一笔 [WMON](https://testnet.monadvision.com/token/0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701) 转账，包括内部交易。

## 什么是 QuickNode Streams？

[QuickNode Streams](https://www.quicknode.com/docs/streams/getting-started) 是一个 Web3 数据流解决方案，支持实时和历史 Monad 数据，提供以下功能：

- **可靠的数据传输** - 精确一次、保证传输，无缝集成到您的数据湖。Streams 确保每个区块、收据或跟踪都按数据集最终性顺序精确传输一次，防止数据损坏或丢失等问题
- **实时数据一致性** - 一致的实时数据流
- **高效的历史数据处理** - 可配置的日期范围和目标，简化历史数据管理
- **易于集成** - 通过用户友好界面简单设置
- **透明的用户体验** - 清晰的日志记录、指标和使用跟踪

## 设置指南

### 1. 初始设置

1. 注册 [QuickNode](https://dashboard.quicknode.com/?prompt=signup) 并登录到您的控制台。
2. 点击左侧边栏中的"Streams"。
![QuickNode 控制台](https://docs.monad.xyz/assets/images/1-e44c6a49a03ba48444f2c82f45f81b06.png)

1. 点击"Create Stream"。
![创建流按钮](https://docs.monad.xyz/assets/images/2-0475f9d7f84bf980bfd61938d6b923ef.png)

### 2. 配置流范围

1. 为您的流命名。在此示例中，我们将其命名为 `monad-quicknode-stream`。
2. 在"Network"部分，从下拉菜单中选择 `Monad`。
3. 在"Stream Start"部分，您可以选择从最新区块开始流或从特定区块号开始。
![流配置](https://docs.monad.xyz/assets/images/3-4f724774cb60c4b933ecfdf708fe56b7.png)

1. 在"Stream End"部分，您可以选择流运行直到手动暂停或在特定区块号结束。
2. 在"Latest block delay"部分，您可以设置接收数据的区块号延迟。对于本指南，我们将在数据可用时立即接收数据。

例如：如果区块延迟为 `3`，您将仅在包括最新区块在内的 `3` 个区块有**新数据可用**时接收数据，这有助于防止重组。
3. 在"Restream on reorg"部分，您可以决定是否在重组情况下重新流式传输更新的数据。对于本指南，我们将保持关闭状态。
4. 完成后点击"Next"。
![附加设置](https://docs.monad.xyz/assets/images/4-1ec6aca440c17ab3d4d3e780a4e1e8e8.png)

### 3. 设置数据集

1. 在"Dataset"下拉菜单中，您可以根据用例选择所需的数据集。对于本指南，我们将选择 `Block with Receipts`，因为我们要过滤 WMON 合约发出事件的日志。

- 可选：启用"Batch messages"以在单个消息中接收多个区块。当流不是从最新区块开始时，这可能很有用。
![数据集选择](https://docs.monad.xyz/assets/images/5-db2bcd4dceb4210f1afcdff5bfe5e976.png)

1. 您可以通过输入区块号并点击"Fetch payload"来测试。
![原始负载示例](https://docs.monad.xyz/assets/images/6-003111519bce304d2f52f0ff69f3a5a4.png)

### 4. 创建 WMON 转账过滤器

1. 在"Modify the stream payload"部分，您可以通过点击**"Customize your payload"**定义过滤器。对于本指南，我们将过滤以仅检索涉及 WMON 转账的收据。
![修改流图像](https://docs.monad.xyz/assets/images/7-1393c3b984c2c78a1b29878b95999683.png)

1. QuickNode 有一组过滤器模板。选择**解码的 ERC20 转账**模板：
![过滤器图像](https://docs.monad.xyz/assets/images/8-c798283fcc88e8e7b43857d095cf3155.png)

1. 编辑器将出现：
![过滤器编辑器图像](https://docs.monad.xyz/assets/images/9-8dbd25c196f63f7d54d62072658f8db1.png)

当前过滤器允许所有 ERC20 转账通过。将过滤器代码替换为：

```js
function main(stream) {  
  const erc20Abi = `[{
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address", "name": "from"},
      {"indexed": true, "type": "address", "name": "to"},
      {"indexed": false, "type": "uint256", "name": "value"}
    ],
    "name": "Transfer",
    "type": "event"
  }]`;
  
  const data = stream.data ? stream.data : stream;
  
  // 从匹配 Transfer 事件 ABI 的收据中解码日志
  var result = decodeEVMReceipts(data[0].receipts, [erc20Abi]);
  
  // 过滤具有解码日志的收据
  result = result.filter(receipt => {
        // 检查是否有任何 ERC20 转账
        if(receipt.decodedLogs) {
            // 检查是否有任何 WMON 转账
            receipt.decodedLogs = receipt.decodedLogs.filter(log => log.address == "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701");
            
            // 如果有表明 WMON 转账的日志，则返回收据
            return receipt.decodedLogs.length > 0;
        }

        // 如果没有 ERC20 转账则返回空
        return false;
    });
  
  return { result };
}
```

1. 使用"Run test"测试过滤器
![运行测试图像](https://docs.monad.xyz/assets/images/10-581e33b351b314a24b2f236fcd8443a7.png)

1. "Save & close"保存过滤器。
![保存并关闭图像](https://docs.monad.xyz/assets/images/11-0c6109073814911fdfe898b6882362d9.png)

1. 点击"Next"

### 5. 设置流目标

对于本指南，我们将保持流目标简单，使用 `Webhook` 作为"Destination Type"。

1. 让我们使用像 [Svix Play](https://www.svix.com/play/) 这样的网站快速获取 webhook 并测试流。
![svix play 图像](https://docs.monad.xyz/assets/images/12-7c47a21d187cd2a9ebe9e225a8bcf7eb.png)

1. 从 Svix Play 复制 webhook url：
![svix play 复制 url 图像](https://docs.monad.xyz/assets/images/13-5a98140ef7def4905f19c6ee7673d7c4.png)

1. 在 QuickNode 中：

- 选择 `Webhook` 作为目标类型
- 粘贴您的 webhook URL
- 我们可以保持其他设置为默认值
![webhook 下拉图像](https://docs.monad.xyz/assets/images/14-db08e8eba828bff26f6b01091e3da874.png)

1. 点击"Check Connection"测试 webhook url。检查您是否在 Svix Play 控制台中收到了"PING"消息。
![检查连接图像](https://docs.monad.xyz/assets/images/15-3068daa0ac05f6de73942dbab0eb64c6.png)

![ping 消息图像](https://docs.monad.xyz/assets/images/16-f9ec583f8fe88c01fdbc0ea604924420.png)

1. 点击"Send Payload"向 webhook 发送测试负载。
![添加发送负载图像](https://docs.monad.xyz/assets/images/17-6c8de643bde3065f405d9a55939f38e2.png)

![svix 负载图像](https://docs.monad.xyz/assets/images/18-e5e77d3b84736ca6ec9a1e5f658b3831.png)

1. 最后点击"Create a Stream"创建流。
![创建流图像](https://docs.monad.xyz/assets/images/19-09c29dd2b50693670d95a9088ebd5022.png)

### 6. 启动和监控

您现在应该能够看到流向 webhook 传输消息了！

![流传输图像](https://docs.monad.xyz/assets/images/20-5360727c8e272af09ad198b0ebedad3a.png)

![svix 流接收消息视频](https://docs.monad.xyz/assets/images/1-d404d7aa9fbb1e12dc07a1be19570e2d.gif)

您可以通过点击右上角的开关来暂停流。

![暂停开关图像](https://docs.monad.xyz/assets/images/21-97162eac1d96a635487439bdda885524.png)

## 下一步

- 在 QuickNode 控制台中监控您的流性能
- 根据需要调整过滤器参数
- 准备就绪时连接到您的生产 webhook 端点
您的流现在将跟踪所有 WMON 转账，直到手动暂停或达到您指定的结束区块。