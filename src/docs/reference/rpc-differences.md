# RPC 差异

Monad 旨在尽可能匹配 Geth 的 RPC 行为，但由于基本架构差异，存在以下一些不同之处。

## 日志

1. `eth_getLogs` 有最大区块范围限制，由 RPC 提供商配置，但通常设置为 1000。由于 Monad 区块比以太坊区块大得多，我们建议使用较小的区块范围（例如 1-10 个区块）以获得最佳性能。当请求更长的范围时，请求可能需要很长时间才能完成，并可能超时。

## 交易

1. `eth_sendRawTransaction` 可能不会像以太坊那样立即拒绝具有 nonce 间隙或余额不足的交易。RPC 服务器在设计时考虑了异步执行，在异步执行下，RPC 服务器可能没有最新的账户状态。因此，这些交易最初是被允许的，因为它们可能在区块创建期间成为有效交易。
2. `eth_sendRawTransaction`、`eth_call` 和 `eth_estimateGas` 不接受 EIP-4844 交易类型，因为不支持 EIP-4844。
3. `eth_getTransactionByHash` 不返回待处理的交易。此方法仅返回已包含在区块中的交易。如果查询仍在内存池中的交易，该方法将返回 `null`。

## `eth_call`

1. 依赖于旧状态（即使用旧区块号）的 `eth_call` 可能会失败，因为全节点不提供对任意历史状态的访问。有关更完整的讨论，请参阅[历史数据](/docs/developer-essentials/historical-data)。

## 费用相关方法

1. `eth_maxPriorityFeePerGas` 目前返回硬编码的建议费用 2 gwei。这是临时的。
2. `eth_feeHistory` 目前也返回默认值。这是临时的。

## WebSocket（`eth_subscribe`）行为

父页面：[WebSocket 指南](/docs/reference/websockets)

1. `eth_subscribe` 不支持 `syncing` 或 `newPendingTransactions` 订阅类型
2. 重组永远不会在 `newHeads` 和 `logs` 订阅类型中发生，因为仅呈现**已确认**区块的实时数据
3. 提供了 `newHeads` 和 `logs` 订阅类型的 Monad 特定扩展（称为 `monadNewHeads` 和 `monadLogs`），以提供[更好的延迟](/docs/monad-architecture/realtime-data/data-sources#source-2-monad-extensions-to-geth-real-time-events)

## 调试/跟踪方法

1. `debug_traceCall`、`debug_traceTransaction` 以及相关的 `debug_trace*` 方法要求明确提供跟踪选项对象参数。与标准 EVM 客户端（此参数是可选的）不同，如果完全省略该参数，Monad RPC 将返回错误（`-32602 Invalid params`）。

**解决方法**：始终包含跟踪选项参数，即使为空：

```json
{
  "method": "debug_traceCall",
  "params": [
    {
      "to": "0x6b175474e89094c44da98b954eedeac495271d0f"
    },
    "latest",
    {}
  ]
}
```
2. 当提供空的跟踪选项对象 `{}` 时，Monad 默认使用 `callTracer` 而不是其他 EVM 客户端中典型的结构日志跟踪器。这是因为 Monad 目前不支持虚拟机级别的操作码级结构日志。
