# RPC 限制


## `eth_call` / `eth_estimateGas`

每次调用的 Gas 限制：

| 提供商 | Gas 限制 
| QuickNode | 200M gas 
| Ankr | 200M gas 
| Alchemy | 200M gas 
| Monad Foundation | 200M gas 

注意：这些由节点运营商使用 [`--eth-call-provider-gas-limit`](https://github.com/category-labs/monad-bft/blob/master/monad-rpc/src/cli.rs#L121) 和 [`--eth-estimate-gas-provider-gas-limit`](https://github.com/category-labs/monad-bft/blob/master/monad-rpc/src/cli.rs#L125) 配置。

## `eth_getLogs`

每次调用的范围限制：

| 提供商 | 限制 
| QuickNode | 100 个区块 
| Ankr | 1000 个区块 
| Alchemy | 1000 个区块和 10,000 条日志（以更严格的为准） 
| Monad Foundation | 100 个区块 

注意：这些由节点运营商使用 [`--eth-get-logs-max-block-range`](https://github.com/category-labs/monad-bft/blob/master/monad-rpc/src/cli.rs#L89) 配置。

> **💡 提示**
> 
> 要了解有关这些限制背后原因的更多信息，请查看 [RPC 差异](/docs/reference/rpc-differences)。
