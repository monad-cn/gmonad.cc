# 构建高性能应用最佳实践

## 配置 Web 托管以控制成本

- Vercel 和 Railway 提供了便捷的无服务器平台来托管你的应用程序，相比直接使用云提供商，它们抽象了 Web 托管的复杂性。但你可能需要为这种便利性付出溢价，特别是在高流量情况下。
- AWS 和其他云提供商提供更多灵活性和更实惠的价格。
- 在选择任何服务之前，请检查定价，注意许多提供商在低流量时提供亏损定价，但一旦达到某个阈值就会收取更高费率。
  - 例如，假设有一个 $20 的计划，包含每月 1 TB 的数据传输，超出部分每 GB $0.20。计算一下会发现第二个 TB（及以后）将花费 $200。如果下一个等级显示"联系我们"，不要假设下一个等级会按 $20/TB 收费。
  - 如果你正在构建高流量应用，而且没有仔细考虑以更便宜的方式提供静态文件，很容易超出亏损定价等级，支付比预期多得多的费用。
- 对于 AWS 上的生产部署，考虑：
  - Amazon S3 + CloudFront 用于静态文件托管和 CDN
  - AWS Lambda 用于无服务器函数
  - Amazon ECS 或 EKS 用于容器化应用
  - Amazon RDS 用于数据库需求
  - 这种设置通常为高流量应用提供精细的成本控制和可扩展性。

## 在 gas 使用量固定时使用硬编码值而不是 `eth_estimateGas` 调用

许多链上操作都有固定的 gas 成本。最简单的例子是原生代币转账总是消耗 21,000 gas，但还有许多其他情况。这使得为每笔交易调用 `eth_estimateGas` 变得不必要。

请使用硬编码值，如[这里](https://docs.monad.xyz/developer-essentials/gas-pricing#set-the-gas-limit-explicitly-if-it-is-constant)所建议的。消除 `eth_estimateGas` 调用大大加速了钱包中的用户工作流，并避免了当 `eth_estimateGas` 回滚时某些钱包的潜在不良行为（在链接页面中讨论）。

## 通过并发提交多个请求来减少 `eth_call` 延迟

串行发起多个 `eth_call` 请求会由于与 RPC 节点的多次往返而引入不必要的延迟。你可以并发进行多个 `eth_call`，要么将它们合并为单个 `eth_call`，要么提交一批调用。或者，你可能发现切换到索引器更好。

### 将多个 `eth_call` 合并为一个

- **Multicall：** Multicall 是一个实用工具智能合约，允许你将多个读取请求（`eth_call`）聚合为一个。这对于同时获取代币余额、授权额度或合约参数等数据点特别有效。标准的 `Multicall3` 合约部署在 Monad 测试网上，地址为 [`0xcA11bde05977b3631167028862bE2a173976CA11`](https://testnet.monadexplorer.com/address/0xcA11bde05977b3631167028862bE2a173976CA11)。许多库提供了简化 multicall 使用的辅助函数，例如 [viem](https://viem.sh/docs/contract/multicall.html)。了解更多关于 `Multicall3` 的信息请看[这里](https://www.multicall3.com/)。
- **自定义批处理合约：** 对于复杂的读取模式或标准 multicall 合约难以处理的场景，你可以部署一个自定义智能合约，将所需数据聚合在一个函数中，然后通过单个 `eth_call` 调用。

注意

Multicall 按顺序执行调用，如你在[**这里**](https://testnet.monadexplorer.com/address/0xcA11bde05977b3631167028862bE2a173976CA11?tab=Contract#file-Multicall3.sol)的代码中所见。因此，虽然使用 multicall 避免了与 RPC 服务器的多次往返，但仍不建议将太多昂贵的调用放入一个 multicall 中。批量调用（接下来解释）可以在 RPC 上并行执行。

### 提交一批调用

大多数主要库支持将多个 RPC 请求批处理为单个消息。

例如，`viem` 通过将承诺数组作为单个批次提交来处理 `Promise.all()`：

```javascript
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



### 对于读取密集型负载使用索引器

如果你的应用程序经常查询历史事件或派生状态，请考虑使用索引器，如下所述。

## 使用索引器而不是重复调用 `eth_getLogs` 来监听事件

以下是最流行的数据索引解决方案的快速入门指南。更多详细信息请查看[索引器文档](https://docs.monad.xyz/tooling-and-infra/indexers/)。

### 使用 Allium

注意

另请参见：[**Allium**](https://docs.monad.xyz/tooling-and-infra/indexers/common-data#allium)

你需要一个 Allium 账户，可以在[这里](https://www.allium.so/contact)申请。

- Allium Explorer
  - 区块链分析平台，提供对历史区块链数据（区块、交易、日志、追踪和合约）的基于 SQL 的访问。
  - 你可以通过 [GUI](https://app.allium.so/explorer/api) 创建 Explorer API 来查询和分析历史区块链数据。在[这里](https://app.allium.so/explorer/queries)为 API 创建查询时（使用 `New` 按钮），从链列表中选择 `Monad Testnet`。
  - 相关文档：
    - [Explorer 文档](https://docs.allium.so/data-products-analytics/allium-explorer)
    - [Explorer API 教程](https://docs.allium.so/data-products-analytics/allium-explorer/explorer-api/explorer-api-user-tutorial)
- Allium Datastreams
  - 通过 Kafka、Pub/Sub 和 Amazon SNS 提供实时区块链数据流（包括区块、交易、日志、追踪、合约和余额快照）。
  - [GUI](https://app.allium.so/developer/streams/new) 用于为链上数据创建新流。创建流时，从 `Select topics` 下拉菜单中选择相关的 `Monad Testnet` 主题。
  - 相关文档：
    - [Datastreams 文档](https://docs.allium.so/data-products-real-time/allium-datastreams)
    - [Google Pub/Sub 入门指南](https://docs.allium.so/data-products-real-time/allium-datastreams/kafka-pubsub/getting-started-with-google-pub-sub)
- Allium Developers
  - 支持获取钱包交易活动和跟踪余额（原生代币、ERC20、ERC721、ERC1155）。
  - 在请求体中，使用 `monad_testnet` 作为 `chain` 参数。
  - 相关文档：
    - [API 密钥设置指南](https://docs.allium.so/data-products-real-time/allium-developer/wallet-apis-1#getting-started)
    - [钱包 API 文档](https://docs.allium.so/data-products-real-time/allium-developer/wallet-apis)

### 使用 Envio HyperIndex

注意

另请参见：[**Envio**](https://docs.monad.xyz/tooling-and-infra/indexers/indexing-frameworks#envio) 和 [**指南：如何使用 Envio HyperIndex 构建代币转账通知机器人**](https://docs.monad.xyz/guides/indexers/tg-bot-using-envio)

- 按照[快速开始](https://docs.envio.dev/docs/HyperIndex/contract-import)创建索引器。在 `config.yaml` 文件中，使用网络 ID `10143` 来选择 Monad 测试网。

- 示例配置

  - 示例 `config.yaml` 文件

    config.yaml

    ```yaml
    name: your-indexers-name
    networks:
    - id: 10143  # Monad 测试网
      # 可选的自定义 RPC 配置 - 仅在默认索引有问题时添加
      # rpc_config:
      #   url: YOUR_RPC_URL_HERE  # 替换为你的 RPC URL（例如来自 Alchemy）
      #   interval_ceiling: 50     # 单次请求中获取的最大区块数
      #   acceleration_additive: 10  # 区块获取的加速因子
      #   initial_block_interval: 10  # 初始区块获取间隔大小
      start_block: 0  # 替换为你想要开始索引的区块
      contracts:
      - name: YourContract  # 替换为你的合约名称
        address:
        - 0x0000000000000000000000000000000000000000  # 替换为你的合约地址
        # 如果同一合约有多个部署，可以添加更多地址
        handler: src/EventHandlers.ts
        events:
        # 替换为你的事件签名
        # 格式：EventName(paramType paramName, paramType2 paramName2, ...)
        # 示例：Transfer(address from, address to, uint256 amount)
        # 示例：OrderCreated(uint40 orderId, address owner, uint96 size, uint32 price, bool isBuy)
        - event: EventOne(paramType1 paramName1, paramType2 paramName2)
        # 根据需要添加更多事件
    ```

    

  - 示例 `EventHandlers.ts`

    EventHandlers.ts

    ```tsx
    import {
      YourContract,
      YourContract_EventOne,
    } from "generated";
    
    
    // EventOne 的处理器
    // 根据你的事件定义替换参数类型和名称
    YourContract.EventOne.handler(async ({ event, context }) => {
      // 为此事件实例创建唯一 ID
      const entity: YourContract_EventOne = {
        id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
        // 替换为你的实际事件参数
        paramName1: event.params.paramName1,
        paramName2: event.params.paramName2,
        // 添加你想要存储的任何其他字段
      };
    
    
      // 将事件存储到数据库
      context.YourContract_EventOne.set(entity);
    })
    
    
    // 根据需要添加更多事件处理器
    ```

    

- 重要提示：网络下的 `rpc_config` 部分（查看 `config.yaml` 示例）是可选的，仅在默认 Envio 设置出现问题时才应配置。此配置允许你：

  - 使用自己的 RPC 端点
  - 配置区块获取参数以获得更好的性能

- 相关文档：

  - [概述](https://docs.envio.dev/docs/HyperIndex/overview)

### 使用 GhostGraph

注意

另请参见：[**Ghost**](https://docs.monad.xyz/tooling-and-infra/indexers/indexing-frameworks#ghost)

- 相关文档：
  - [入门指南](https://docs.tryghost.xyz/category/-getting-started)
  - [在 Monad 测试网上设置 GhostGraph 索引器](https://docs.monad.xyz/guides/indexers/ghost#setting-up-ghostgraph-indexing)

### 使用 Goldsky

注意

另请参见：[**Goldsky**](https://docs.monad.xyz/tooling-and-infra/indexers/common-data#goldsky)

- Goldsky 子图

  - 要部署 Goldsky 子图，请按照[此指南](https://docs.goldsky.com/subgraphs/deploying-subgraphs#from-source-code)操作。
  - 作为网络标识符，请使用 `monad-testnet`。有关子图配置示例，请参考下面的 [The Graph Protocol 部分](https://docs.monad.xyz/developer-essentials/best-practices#using-the-graphs-subgraph)。
  - 有关查询 Goldsky 子图的信息，请参见 [GraphQL API 文档](https://docs.goldsky.com/subgraphs/graphql-endpoints)。

- Goldsky Mirror

  - 支持将链上数据直接流式传输到你的数据库。

  - 在为管道创建 `source` 时，在 `dataset_name` 字段中的链名称使用 `monad_testnet`（查看下面的示例）

  - 示例

     

    ```
    pipeline.yaml
    ```

     

    配置文件

    pipeline.yaml

    ```yaml
    name: monad-testnet-erc20-transfers
    apiVersion: 3
    sources:
      monad_testnet_erc20_transfers:
        dataset_name: monad_testnet.erc20_transfers
        filter: address = '0x0' # 添加 erc20 合约地址。可以使用 'OR' 操作符添加多个地址：address = '0x0' OR address = '0x1'
        version: 1.2.0
        type: dataset
        start_at: earliest
    
    
    # 数据转换逻辑（可选）
    transforms:
      select_relevant_fields:
        sql: |
          SELECT
              id,
              address,
              event_signature,
              event_params,
              raw_log.block_number as block_number,
              raw_log.block_hash as block_hash,
              raw_log.transaction_hash as transaction_hash
          FROM
              ethereum_decoded_logs
        primary_key: id
    
    
    # 接收器配置，指定数据去向，例如数据库
    sinks:
      postgres:
        type: postgres
        table: erc20_transfers
        schema: goldsky
        secret_name: A_POSTGRESQL_SECRET
        from: select_relevant_fields
    ```

    

  - 相关文档：

    - [Mirror 入门指南](https://docs.goldsky.com/mirror/create-a-pipeline#goldsky-cli)
    - [数据流指南](https://docs.goldsky.com/mirror/guides/)

### 使用 QuickNode Streams

注意

另请参见：[**QuickNode Streams**](https://docs.monad.xyz/tooling-and-infra/indexers/common-data#quicknode)

- 在你的 QuickNode 仪表板上，选择 `Streams` > `Create Stream`。在创建流的 UI 中，在网络下选择 Monad Testnet。或者，你可以使用 [Streams REST API](https://www.quicknode.com/docs/streams/rest-api/getting-started) 来创建和管理流——使用 `monad-testnet` 作为网络标识符。
- 你可以通过在创建流时选择目标来消费流。支持的目标包括 Webhooks、S3 存储桶和 PostgreSQL 数据库。了解更多信息请看[这里](https://www.quicknode.com/docs/streams/destinations)。
- 相关文档：
  - [入门指南](https://www.quicknode.com/docs/streams/getting-started)

### 使用 The Graph 的子图

注意

另请参见：[**The Graph**](https://docs.monad.xyz/tooling-and-infra/indexers/indexing-frameworks#the-graph)

- 用于 Monad 测试网的网络 ID：`monad-testnet`

- 示例配置

  - 示例 `subgraph.yaml` 文件

    subgraph.yaml

    ```yaml
    specVersion: 1.2.0
    indexerHints:
      prune: auto
    schema:
      file: ./schema.graphql
    dataSources:
      - kind: ethereum
        name: YourContractName # 替换为你的合约名称
        network: monad-testnet # Monad 测试网配置
        source:
          address: "0x0000000000000000000000000000000000000000" # 替换为你的合约地址
          abi: YourContractABI # 替换为你的合约 ABI 名称
          startBlock: 0 # 替换为你的合约部署的区块/你想要从哪个区块开始索引
        mapping:
          kind: ethereum/events
          apiVersion: 0.0.9
          language: wasm/assemblyscript
          entities:
            # 在这里列出你的实体 - 这些应该与 schema.graphql 中定义的相匹配
            # - Entity1
            # - Entity2
          abis:
            - name: YourContractABI # 应该与上面指定的 ABI 名称匹配
              file: ./abis/YourContract.json # 你的合约 ABI JSON 文件路径
          eventHandlers:
            # 在这里添加你的事件处理器，例如：
            # - event: EventName(param1Type, param2Type, ...)
            #   handler: handleEventName
          file: ./src/mapping.ts # 你的事件处理器实现路径
    ```

    

  - Sample `mappings.ts` file

    mappings.ts

    ```tsx
    import {
      // Import your contract events here
      // Format: EventName as EventNameEvent
      EventOne as EventOneEvent,
      // Add more events as needed
    } from "../generated/YourContractName/YourContractABI" // Replace with your contract name, abi name you supplied in subgraph.yaml
    
    
    import {
      // Import your schema entities here
      // These should match the entities defined in schema.graphql
      EventOne,
      // Add more entities as needed
    } from "../generated/schema"
    
    
    /**
      * EventOne 的处理器
      * 根据你的事件结构更新函数参数和主体
      */
    export function handleEventOne(event: EventOneEvent): void {
      // 为此实体创建唯一 ID
      let entity = new EventOne(
        event.transaction.hash.concatI32(event.logIndex.toI32())
      )
      
      // 将事件参数映射到实体字段
      // entity.paramName = event.params.paramName
      
      // 示例：
      // entity.sender = event.params.sender
      // entity.amount = event.params.amount
    
    
      // 添加元数据字段
      entity.blockNumber = event.block.number
      entity.blockTimestamp = event.block.timestamp
      entity.transactionHash = event.transaction.hash
    
    
      // 将实体保存到存储中
      entity.save()
    }
    
    
    /**
      * 根据需要添加更多事件处理器
      * 格式：
      * 
      * export function handleEventName(event: EventNameEvent): void {
      *   let entity = new EventName(
      *     event.transaction.hash.concatI32(event.logIndex.toI32())
      *   )
      *   
      *   // 映射参数
      *   entity.param1 = event.params.param1
      *   entity.param2 = event.params.param2
      *   
      *   // 添加元数据
      *   entity.blockNumber = event.block.number
      *   entity.blockTimestamp = event.block.timestamp
      *   entity.transactionHash = event.transaction.hash
      *   
      *   entity.save()
      * }
      */
    ```

    

  - 示例 `schema.graphql` 文件

    schema.graphql

    ```graphql
    # 在这里定义你的实体
    # 这些应该与你的 subgraph.yaml 中列出的实体匹配
    
    
    # 通用事件的示例实体
    type EventOne @entity(immutable: true) {
      id: Bytes!
      
      # 添加与你的事件参数对应的字段
      # 常见参数类型示例：
      # paramId: BigInt!              # uint256, uint64, 等
      # paramAddress: Bytes!          # address
      # paramFlag: Boolean!           # bool
      # paramAmount: BigInt!          # uint96, 等
      # paramPrice: BigInt!           # uint32, 等
      # paramArray: [BigInt!]!        # uint[] 数组
      # paramString: String!          # string
      
      # 标准元数据字段
      blockNumber: BigInt!
      blockTimestamp: BigInt!
      transactionHash: Bytes!
    }
    
    
    # 根据需要为不同事件添加更多实体类型
    # 基于 Transfer 事件的示例：
    # type Transfer @entity(immutable: true) {
    #   id: Bytes!
    #   from: Bytes!                  # address
    #   to: Bytes!                    # address
    #   tokenId: BigInt!              # uint256
    #   blockNumber: BigInt!
    #   blockTimestamp: BigInt!
    #   transactionHash: Bytes!
    # }
    
    
    # 基于 Approval 事件的示例：
    # type Approval @entity(immutable: true) {
    #   id: Bytes!
    #   owner: Bytes!                 # address
    #   approved: Bytes!              # address
    #   tokenId: BigInt!              # uint256
    #   blockNumber: BigInt!
    #   blockTimestamp: BigInt!
    #   transactionHash: Bytes!
    # }
    ```

    

- 相关文档：

  - [快速开始](https://thegraph.com/docs/en/subgraphs/quick-start/)

### 使用 thirdweb 的 Insight API

注意

另请参见：[**thirdweb**](https://docs.monad.xyz/tooling-and-infra/indexers/common-data#thirdweb)

- REST API，提供广泛的链上数据，包括事件、区块、交易、代币数据（如转账交易、余额和代币价格）、合约详情等。

- 在构造请求 URL 时，使用链 ID

   

  ```
  10143
  ```

   

  作为 Monad 测试网。

  - 示例：`https://insight.thirdweb.com/v1/transactions?chain=10143`

- 相关文档：

  - [入门指南](https://portal.thirdweb.com/insight/get-started)
  - [API 演示场](https://playground.thirdweb.com/insight)

## 在快速连续发送多个交易时本地管理 nonce

注意

这仅在你手动设置 nonce 时适用。如果你将此任务委托给钱包，则无需担心此问题。

- `eth_getTransactionCount` 仅在交易完成后更新。如果你在短时间内从同一个钱包发送多个交易，你应该实现本地 nonce 跟踪。

## 并发提交多个交易

如果你要提交一系列交易，而不是顺序提交，请实现并发交易提交以提高效率。

之前：

```jsx
for (let i = 0; i < TIMES; i++) {
  const tx_hash = await WALLET_CLIENT.sendTransaction({
    account: ACCOUNT,
    to: ACCOUNT_1,
    value: parseEther('0.1'),
    gasLimit: BigInt(21000),
    baseFeePerGas: BigInt(50000000000),
    chain: CHAIN,
    nonce: nonce + Number(i),
  })
}
```



之后：

```jsx
const transactionsPromises = Array(BATCH_SIZE)
  .fill(null)
  .map(async (_, i) => {
    return await WALLET_CLIENT.sendTransaction({
      to: ACCOUNT_1,
      value: parseEther('0.1'),
      gasLimit: BigInt(21000),
      baseFeePerGas: BigInt(50000000000),
      chain: CHAIN,
      nonce: nonce + Number(i),
    })
  })
const hashes = await Promise.all(transactionsPromises)
```