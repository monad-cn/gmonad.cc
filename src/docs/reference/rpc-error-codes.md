# RPC 错误代码


Monad 支持 [JSON-RPC](https://www.jsonrpc.org/specification) 接口与区块链交互。Monad JSON-RPC 旨在与以太坊 JSON-RPC 等效，但由于以太坊客户端之间缺乏标准化，某些错误代码略有偏差。

## Monad 错误代码参考

| 错误代码 | 消息 | 说明 |
| --- | --- | --- |
| **-32601** | Parse error | 无法解析 JSON-RPC 请求 |
| **-32601** | Invalid request | 无效请求，例如超出大小限制的请求 |
| **-32601** | Method not found | 不属于 JSON-RPC 规范的方法 |
| **-32601** | Method not supported | 属于 JSON-RPC 规范但 Monad 尚不支持的方法 |
| **-32602** | Invalid block range | eth_getLogs 的最大区块范围由每个 RPC 提供商配置，但通常限制为 1000 个区块 |
| **-32602** | Invalid params | 请求包含与特定方法相关的错误参数 |
| **-32603** | Internal error | 由于内部错误而无法完成的请求 |
| **-32603** | Execution reverted | eth_call 和 eth_estimateGas 模拟交易回滚 |
| **-32603** | Transaction decoding error | 请求包含无法解码的原始交易 |
