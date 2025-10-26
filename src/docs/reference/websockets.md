# WebSocket 指南

Monad 的 RPC 服务器支持通过 WebSocket 连接进行 JSON-RPC 调用。此功能允许 JSON-RPC 调用通过持久连接进行，而不是作为单独的 HTTP 请求，但使用它的主要原因是使用 `eth_subscribe` 调用订阅[实时数据源](/docs/monad-architecture/realtime-data/data-sources)。

`eth_subscribe` 的行为类似于 Geth 以太坊客户端中的[行为方式](https://geth.ethereum.org/docs/interacting-with-geth/rpc/pubsub)：

- 支持订阅类型 `newHeads` 和 `logs`（在区块 `Finalized` 后立即返回更新）
- 不支持订阅类型 `syncing` 和 `newPendingTransactions`。
此外，还支持两个新变体：`monadNewHeads` 和 `monadLogs`。它们的行为类似于 `newHeads` 和 `logs`，但在节点看到区块并有机会[推测执行](/docs/monad-architecture/realtime-data/spec-realtime)后立即返回。

总结如下：

| 订阅类型 | 描述 
| `newHeads` | 在区块 `Finalized` 后，每次将新头添加到链时触发通知。与 geth 不同，不会发生重组。 
| `logs` | 在区块 `Finalized` 后，返回新区块中的日志（匹配给定的过滤条件）。与 geth 不同，不会发生重组。 
| `monadNewHeads` | 与 `newHeads` 相同，但在区块 `Proposed` 且节点有机会[推测执行](/docs/monad-architecture/realtime-data/spec-realtime)后立即返回。 
| `monadLogs` | 与 `logs` 相同，但在区块 `Proposed` 且节点有机会[推测执行](/docs/monad-architecture/realtime-data/spec-realtime)后立即返回。 

## 开始使用实时数据

- 通过 WebSocket 可用的实时数据源在[这里](/docs/monad-architecture/realtime-data/data-sources#how-do-i-receive-real-time-data)有描述
- 您可以通过这些[公共 RPC 端点](/docs/developer-essentials/network-information#public-rpc-endpoints)访问它们
- 实时数据通常在您的以太坊区块链接口库中以高级方式公开；我们在下面展示了使用 Python 的 [web3.py](https://web3py.readthedocs.io/en/stable/) 和 JavaScript 的 [ethers.js](https://docs.ethers.org/) 的示例

### web3.py (Python) 示例

如果尚未安装，请先安装 [web3.py](//web3py.readthedocs.io/en/stable/)。在此示例中，我们将直接使用 `pip`：

```shell
pip install web3
```

将以下代码保存到文件 `block-counter.py`：

```py
import asyncio

from web3 import AsyncWeb3
from web3.providers.persistent import WebSocketProvider

ws_url = 'wss://testnet-rpc.monad.xyz'

async def print_latest():
  async with AsyncWeb3(WebSocketProvider(ws_url)) as w3:
    subscription_id = await w3.eth.subscribe('newHeads', {})
    async for payload in w3.socket.process_subscriptions():
      print(f"New block received: {payload['result']['number']}")

if __name__ == "__main__":
  asyncio.run(print_latest())
```

最后，运行：

```shell
python block-counter.py
```

几秒钟后，您应该会看到类似的输出：

```shell
New block received: 29165925
New block received: 29165926
New block received: 29165927
```

### ethers.js (JavaScript) 示例

如果尚未安装，请先安装 [ethers.js](https://docs.ethers.org/)。在此示例中，我们将使用 [Node.js](https://nodejs.org/en) 和 [npm](https://www.npmjs.com/)：

```shell
npm install ethers
```

将以下代码保存到文件 `block-counter.js`：

```js
import { WebSocketProvider } from "ethers/providers";

const wsUrl = "wss://testnet-rpc.monad.xyz"

const provider = new WebSocketProvider(wsUrl);

provider.on("block", (blockNumber) => {
  console.log("New block received:", blockNumber);
});
```

最后，运行

```shell
node block-counter.js
```

几秒钟后，您应该会看到类似的输出：

```shell
New block received: 29165925
New block received: 29165926
New block received: 29165927
```

### 实时数据协议 vs 数据流 API

上述示例中使用的实时数据正式协议由 Geth 文档记录为[实时事件协议](https://geth.ethereum.org/docs/interacting-with-geth/rpc/pubsub)。其规范描述了：

- 创建和销毁订阅所需的 JSON-RPC 调用（`eth_subscribe` 和 `eth_unsubscribe`）
- 可用的订阅类型（`newHeads`、`logs` 等）
- 新数据到达时推送的 JSON 对象的结构
本文档通常以这些术语描述 Monad 的 WebSocket 支持。

请注意，在 Python 示例中，您明确看到订阅名称 `'newHeads'` 并调用名为 `subscribe` 的 API 函数：API 设计与协议设计非常匹配。另一方面，JavaScript 示例则不同：您看不到关于 `newHeads` 或"订阅"的任何内容。

在内部，这个 JavaScript 库就像 Python 版本一样使用 `newHeads` 订阅，但它使用 API 设计空间中的不同选择来呈现实时数据。其他语言中一些最流行的库（例如 Rust 中的 [alloy](https://alloy.rs/)）在其某些 API 中内部使用 `newHeads` 或 `logs`，尽管有时这是实现细节，它们没有明确说明。

本页的下一节记录了 Monad 扩展的 `eth_subscribe` 数据源（`monadNewHeads` 和 `monadLogs`）。如果您想访问这些扩展，您需要使用类似于 Python 示例中 web3 库的 API。因为它是底层协议之上的非常薄的一层，所以它也自然可扩展：Monad 特定的数据源无需更改库即可工作，因为 API 的级别足够低（例如，将 JSON 响应作为通用字典对象返回），因此可以在不进行任何修改的情况下与我们的新数据源一起工作。

## `monadNewHeads` 和 `monadLogs`

这些发布的数据与其标准化对应物（`newHeads` 和 `logs`）几乎相同，不同之处在于数据发布得更早——平均提前约一秒——但基于推测性基础。

要使用这些数据，用户需要了解推测执行及其如何影响实时数据。您需要了解的必要背景在[这里](/docs/monad-architecture/realtime-data/spec-realtime)有描述。本节的其余部分解释了这些概念如何出现在发布的数据中。

如[区块 ID](/docs/monad-architecture/realtime-data/spec-realtime#block-numbers-and-block-ids) 部分所述，您需要了解有关区块的两件事：

1. 区块处于什么*提交状态*
2. 区块的*唯一 ID* 是什么，因为在最终确定之前其区块号并不唯一
因此，`monadNewHeads` 更新看起来与 `newHeads` 更新相同，但它包含额外的 `blockId` 和 `commitState` 字段：

```json
{
  "blockId": "0x71ce47f39a1eb490354166f762d78bf6e2acaf80b24b4bcd756118d93ef81be0",
  "commitState": "Proposed",
  "hash": "0x7a7d7c23bb8c5e340eead8537bb5e2f3e125bfa0b588cf07e4aa140ba374295e",
  "parentHash": "0x9a71a95be3fe957457b11817587e5af4c7e24836d5b383c430ff25b9286a457f",
  "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  "miner": "0x1ad91ee08f21be3de0ba2ba6918e714da6b45836",
  "stateRoot": "0x5e215f13dce86552d9083116be9f2b71f639d014fa9694f3dca9fb579bf4a717",
  "transactionsRoot": "0xfe490e456649550c9f94cb46104da1d3eda87f06a1c33e578137d8cf1ef06fe6",
  "receiptsRoot": "0x9ae198972e011bf3617a28ec72bef9a515f66d1d15988d92191eb3c7f231640a",
  "logsBloom": "0x09e3c42e60df6a823da47b9b9e73b3a563ffddc9fb59802a087d92bf7e5bc92d7477f504864e1446cc46fb89c1bd63207f3f9bfbfba378f444f5895f53fee0fc10dbd395f546ffbefedfeef9712c4cf66ed3cf24df4f720b7bf67c2994337c607fa56e49ab6acd5efd7bb61428f8edcfa3e2d66dae3b8fd3c6942d36e8ea7403d107f7d97a57dfb50de96601410af486c7f5f6c55357a6fd2b30a979fb99d1a7bb9bbdbd1b227cbcdc9fff81ef73ab2bdc470a4bb9772eb658755fce551869a1f35b2e6338d06acd94e4dff638cf7dd74e5613ef178f16bbb0253f8f06eb7c64f6bbfffbeb165965d06f532da10edf63e54782c7ed9b05ca41efec457a95782f",
  "difficulty": "0x310db4075e35d4",
  "number": "0xe4e1c1",
  "gasLimit": "0x1c9c380",
  "gasUsed": "0x1579362",
  "timestamp": "0x62b12cf8",
  "extraData": "0x486976656f6e2072752d6865617679",
  "mixHash": "0xc808debc77a41b82b5a6780fb288a47593ec636cdedab4feaeb65d91322f30b6",
  "nonce": "0xdff7aec95842e5ed",
  "baseFeePerGas": "0x3b541e0b1",
  "totalDifficulty": "0x0",
  "size": "0x2fe"
}
```

上面的区块首次在 [`"Proposed"`](/docs/monad-architecture/consensus/block-states#proposed) 状态中看到。1 这意味着它已被推测执行，在本地共识节点发现其最终命运之前。

完全相同的更新可能会再看到几次——所有数据与上面完全相同——除了 `"commitState"` 会改变。在区块的"正常"[生命周期](/docs/monad-architecture/consensus/block-states)中，您会再看到此更新三次，但 `"commitState"` 会更改为 [`"Voted"`](/docs/monad-architecture/consensus/block-states#voted)，然后是 [`"Finalized"`](/docs/monad-architecture/consensus/block-states#finalized)，最后是 [`"Verified"`](/docs/monad-architecture/consensus/block-states#verified)。

关于区块提交状态转换的一些注意事项：

- 区块可能会跳过 `"Voted"` 状态，直接从 `"Proposed"` 变为 `"Finalized"`。当共识远远领先于执行时会发生这种情况 2
- 您可能会看到同一区块号的多个 `"Proposed"` 或 `"Voted"` 区块，如[区块 ID](/docs/monad-architecture/realtime-data/spec-realtime#block-numbers-and-block-ids) 部分所述。虽然这是可能的，但 Monad 共识算法的一个很好的特性是，一旦区块变为 `"Voted"`，这种情况应该极其罕见
- 当确实发生未能最终确定时，区块是*隐式*放弃的，而不是显式的；也就是说，某个区块号 `N` 的最终确定隐式放弃了该区块号的所有竞争区块，但不会为这些区块 ID 发布显式更新以将它们标记为已放弃（即没有显式的 `"Abandoned"` 提交状态）
目前还没有办法说"在区块进入 `"Voted"` 状态之前不要告诉我"之类的话，尽管这个功能将在 Monad 主网发布之前添加。

## 检查是否启用了 WebSocket 支持

WebSocket 支持是一个额外的功能，可能不会在 RPC 服务器上启用。检查 WebSocket 连接是否正常工作的一种快速方法是使用可以充当 WebSocket 客户端的通用命令行工具，例如 [`websocat`](https://github.com/vi/websocat)。

`websocat` 是一个强大的命令行"瑞士军刀"工具，类似于 `nc` 或原始的 `socat`。如果它在您的系统包管理器中不可用，可以使用 `cargo install websocat` 安装它，因为它是一个 Rust 实用程序。

这是在详细模式（`-v`）下运行它的示例：

```shell
> websocat -v wss://testnet-rpc.monad.xyz
[INFO  websocat::lints] Auto-inserting the line mode
[INFO  websocat::stdio_threaded_peer] get_stdio_peer (threaded)
[INFO  websocat::ws_client_peer] get_ws_client_peer
[INFO  websocat::net_peer] Connected to TCP 208.115.212.142:8081
[INFO  websocat::ws_client_peer] Connected to ws
```

要订阅，请在终端的 stdin 中键入 `eth_subscribe` 的订阅 JSON-RPC 调用并按 Enter：

```json
{ "id": 1, "jsonrpc": "2.0", "method": "eth_subscribe", "params": ["newHeads"] }
```

大约每半秒，您应该会看到有关新区块的更新。

## 脚注

1. 在当前实现中，区块总是首次在 `Proposed` 状态中看到，但您不应该编写假设始终如此的软件。如果共识守护进程远远领先于执行，则可以将更准确的提交状态从共识传播到执行。这是当前没有实现的优化，但未来的实现可能会这样做。↩
2. 在共识算法本身中，区块不能*直接*从 `Voted` 跳到 `Finalized`。然而，您看到的实时数据流是基于执行服务对共识正在做什么的稍微延迟的视图。如果出于某种原因执行开始落后于共识，它可能会在看到该区块的下一次更新时发现该区块已经 `Finalized`。在这种情况下，它不会发布投票状态转换的通知，而是将区块直接移至 `Finalized`。↩
