# Execution Events

**Execution Events** 系统允许开发者构建高性能应用程序，通过共享内存队列从 Monad 节点接收最低延迟的事件数据。

要使用这些实时数据,您需要使用本页面描述的软件开发工具包，用 C、C++ 或 Rust 编写一些数据处理软件，并在运行由 Category Labs 构建的 Monad 节点软件的主机上运行它。

对于简单的数据处理用例来说，这可能过于复杂；请参阅[替代方案](#替代-execution-events-的方案)部分，了解使用 Monad 区块链数据的更便捷方法。

有关与其他系统（如 Reth 的 ExEx 或 Solana Geyser）的比较，请参阅[比较](#与其他数据系统的比较)部分。

## 什么是 "execution events"？

Category Labs 的[执行守护程序](https://docs.monad.xyz/)包含一个共享内存通信系统，该系统发布有关 EVM 在交易执行期间所采取的大多数操作的数据。这些 EVM 操作的原始二进制记录称为"execution events"（执行事件）。

需要最高性能的第三方应用程序可以在与节点软件相同的主机上运行，并直接从共享内存中消费执行事件记录。要读取这些数据，您的第三方应用程序需要调用 execution event SDK（我们的实时数据库）中的函数。

## Execution Events 文档

* [发布说明](./release-notes) - 查看 SDK 最新版本的新功能
* [快速入门](./getting-started) - 描述如何构建和运行一个简单的示例程序
* [事件概述](./overview) - 解释执行事件系统中的核心概念
* [详解事件环](./event-rings-in-detail) - 记录事件环文件和协议版本控制
* API 文档 - 我们为多种编程语言提供的编程库概述
  * [C API](./c-api)
  * [Rust API](./rust-api)
* [共识事件](./consensus-events) - 执行发布一些来自共识的信息，这些信息对于理解实时数据至关重要
* [高级主题](./advanced-topics) - 面向高级用户和为执行源代码做出贡献的软件开发人员的文档

## 替代 Execution Events 的方案

Category Labs 的节点软件包括一个 RPC 服务器组件。RPC 服务器支持两种更简单的区块链数据读取方式：

1. 大多数 EVM 兼容区块链节点（例如 Geth）支持的典型 JSON RPC 端点
2. Geth 实时事件 [WebSocket 协议](https://docs.monad.xyz/)（即 `eth_subscribe`）也受支持，同时还有一些 Monad 特定的扩展以提高性能；有关更多信息，请参阅 [WebSocket 指南](../rpc-reference/websockets)

这两种访问方法都在 EVM 兼容的区块链中标准化，并且比执行事件更易于使用。执行事件系统是为专门的应用程序设计的，例如运行索引器平台或需要尽可能低延迟的应用程序（例如做市）。这也是 RPC 服务器本身获取实时数据的地方。

## 与其他数据系统的比较

与其他区块链软件中的低延迟系统的简要比较：

* **Geth Live Tracing**（[链接](https://geth.ethereum.org/docs/developers/evm-tracing/live-tracing)）- 基于"钩子"的 API：您的代码作为插件加载到 Geth 节点中，并在执行期间同步运行（通过回调）
* **Reth ExEx**（[链接](https://www.paradigm.xyz/2024/05/reth-exex)和[链接](https://github.com/paradigmxyz/reth/blob/main/crates/exex/README.md)）- 基于异步函数的 API：您的代码加载到 Reth 节点中；执行在事后而非同步地看到事件
* **Solana Geyser**（[链接](https://docs.solanalabs.com/validator/geyser)）- 基于"钩子"的 API，一个在 Solana 验证器内部运行的插件，在执行期间调用回调

这三者都与 Execution Events 方法不同。在我们的方法中：

* 您看到的是"正在发生"的事件，就像 Geth Live Tracer 和 Solana Geyser 一样。与这些方法不同的是，您的代码不是作为插件在执行引擎内运行，而是在单独的进程中并行运行（大约晚一微秒）
* 像 Geth Live Tracer（但与 Reth 的 ExEx 不同），您将交易的每个"片段"——每个日志、每次余额变化等——视为单独的事件
* 与 Geth Live Tracer 或 Geyser 不同，您不安装"钩子"并接收回调；相反，您持续轮询新的事件记录，遍历返回给您的任何新事件（并忽略您不感兴趣的事件）
* 因为系统基于共享内存环形缓冲区，如果您的消费者太慢，您可能会丢失数据——您必须跟上！

