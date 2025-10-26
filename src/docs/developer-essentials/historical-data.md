# Historical Data

## Summary

Monad full nodes provide access to all historic transactional data, including:
- Blocks
- Transactions
- Receipts
- Events
- Traces

However, Monad full nodes do not provide access to arbitrary historic state.

## Background

Blockchains have two main types of data:
1. Transactional data: List of transactions and their artifacts
2. State data: Current state resulting from applying transactions

### Transactional Data Includes:
- Blocks
- Transactions
- Receipts
- Events
- Execution traces

### State Data Includes:
- Account native token balances
- Smart contract storage mappings

## Transactional Data

Monad full nodes provide complete access to historic transactional data.

## State

Unlike Ethereum, Monad's approach to historical state is unique:
- Every "full node" functions like an "archive node"
- Maintains historical per-block state tries based on disk size
- For a 2 TB SSD, this can cover around 40,000 blocks

**Important Limitation**: Full nodes do not provide access to arbitrary historic state due to storage constraints.

### Recommendations
- Use events to log state that might be needed later
- Utilize [smart contract indexers](/tooling-and-infra/indexers/indexing-frameworks)

## Footnotes

1. Transactional data storage may use separate archive nodes
2. High block frequency and larger block sizes limit historical state accessibility