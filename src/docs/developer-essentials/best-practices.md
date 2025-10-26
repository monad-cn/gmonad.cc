# Best Practices for Building High Performance Apps

## Configure web hosting to keep costs under control

- Vercel and Railway provide convenient serverless platforms
- AWS and other cloud providers offer more flexibility and commodity pricing
- Check pricing carefully, especially for data transfer thresholds
- For production AWS deployments, consider:
  - Amazon S3 + CloudFront for static file hosting and CDN
  - AWS Lambda for serverless functions
  - Amazon ECS or EKS for containerized applications
  - Amazon RDS for database needs

## Use a hardcoded value instead of `eth_estimateGas` call if gas usage is static

Many on-chain actions have a fixed gas cost. For example, a native token transfer always costs 21,000 gas. Use a hardcoded value instead of calling `eth_estimateGas` to speed up the user workflow.

## Reduce `eth_call` latency by submitting multiple requests concurrently

### Condensing multiple `eth_call`s into one

- **Multicall:** Use a utility smart contract to aggregate multiple read requests
- **Custom Batching Contracts:** Deploy a custom contract that aggregates required data

### Submitting a batch of calls

Most major libraries support batching multiple RPC requests. Example with `viem`:

```typescript
const resultPromises = Array(BATCH_SIZE)
  .fill(null)
  .map(async (_, i) => {
    return await PUBLIC_CLIENT.simulateContract({
      address: ...,
      abi: ...,
      functionName: ...,
      args: [...],
    })
  })
const results = await Promise.all(resultPromises)
```

## Use an indexer instead of repeatedly calling `eth_getLogs`

The page provides detailed guides for several indexing solutions:
- Allium
- Envio HyperIndex
- GhostGraph
- Goldsky
- QuickNode Streams
- The Graph's Subgraph
- thirdweb's Insight API

## Manage nonces locally if sending multiple transactions in quick succession

Use local nonce tracking for transactions sent in short succession.

## Submit multiple transactions concurrently

Instead of waiting for each transaction to be mined before sending the next one, submit multiple transactions with sequential nonces concurrently.