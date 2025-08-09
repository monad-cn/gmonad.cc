# RPC 故障代码

Monad 支持用于与区块链交互的 [JSON-RPC](https://www.jsonrpc.org/specification) 接口。Monad JSON-RPC 旨在等效于以太坊 JSON-RPC，但由于以太坊客户端之间缺乏标准化，一些故障代码可能略有偏差，以下仅供参考。

### Monad 故障代码参考

<table><thead><tr><th width="148">故障代码</th><th width="239">消息提示</th><th>故障解释</th></tr></thead><tbody><tr><td><strong>-32601</strong></td><td>Parse error</td><td>无法解析 JSON-RPC 请求</td></tr><tr><td><strong>-32601</strong></td><td>Invalid request</td><td>请求无效，例如请求超出大小限制</td></tr><tr><td><strong>-32601</strong></td><td>Method not found</td><td>不符合 JSON-RPC 规范</td></tr><tr><td><strong>-32601</strong></td><td>Method not supported</td><td>符合 JSON-RPC 规范，但 Monad 尚未支持</td></tr><tr><td><strong>-32602</strong></td><td>Invalid block range</td><td>eth_getLogs 过滤器范围限制为 1000 个区块</td></tr><tr><td><strong>-32602</strong></td><td>Invalid params</td><td>请求包含与特定方法关联的错误参数</td></tr><tr><td><strong>-32603</strong></td><td>Internal error</td><td>由于内部错误而无法完成的请求</td></tr><tr><td><strong>-32603</strong></td><td>Execution reverted</td><td>eth_call 和 eth_estimateGas 模拟还原交易</td></tr><tr><td><strong>-32603</strong></td><td>Transaction decoding error</td><td>请求包含无法解码的原始交易</td></tr></tbody></table>
