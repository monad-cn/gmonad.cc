# Rust API


## 模块

Rust 执行事件 API 分为两个库包：

1. **`monad-event-ring`** - 此包提供核心事件环功能。回想一下，事件环是基于共享内存通信的通用广播工具，并且对它们包含的事件数据类型不可知。因此，此包*不*包括执行事件类型的定义（也不包括任何其他事件类型）
2. **`monad-exec-events`** - 执行事件数据类型在此库中定义，以及一些用于编写实时数据应用程序的有用工具

这些库以比 C 更结构化的方式配合使用。

在 C API 中，事件环 API 使用非结构化数据，例如，事件数字代码是 `uint16_t` 值，事件载荷是原始字节数组。读取器执行未经检查的类型转换以重新解释这些字节的含义。有一些[安全机制](/execution-events/event-ring#binary-schema-versioning-the-schema_hash-field)来检查事件环文件是否似乎包含正确类型的数据，但内容类型在类型系统中没有强烈表示。

在 Rust API 中，事件环不仅仅是一般意义上的"泛型"；它是一个字面上的泛型类型：

```rust
struct EventRing<D: EventDecoder>
```

事件环由"解码器"显式参数化。解码器知道如何解释特定事件内容类型的原始字节，例如执行事件。

## 核心概念

### 事件枚举类型

考虑解码在 C API 中的工作方式：它通常是一个"大型 switch 语句"模式，我们检查事件的数字代码，并通过未经检查的类型转换将原始字节重新解释为适当的载荷类型：

```c
const void *payload = monad_event_ring_payload_peek(&exec_ring, &event);

switch (event.event_type) {
case BLOCK_START:
    handle_block_start((const struct monad_exec_block_start *)payload);
    break;

case BLOCK_END:
    handle_block_end((const struct monad_exec_block_end *)payload);
    break;

// ... more event types handled here
}
```

Rust 的表达方式是使用 `enum` 类型：不同类型的事件载荷成为枚举的变体，`switch` 逻辑被更强大的 `match` 替换。

在 Rust 中，解码产生枚举类型 `ExecEvent` 的值，其定义如下：

```rust
#[derive(Clone, Debug)]
pub enum ExecEvent {
    BlockStart(monad_exec_block_start),
    BlockReject(monad_exec_block_reject),
    BlockEnd(monad_exec_block_end),
    // more variants follow
```

请注意，`ExecEvent` 的每个变体都保存一个值，其类型名称类似于 C 事件载荷结构。例如，`struct monad_exec_block_start` 是 C API 中的事件载荷结构定义。当新区块开始时记录它，并在文件 `exec_event_ctypes.h` 中定义。

使用这些完全相同的 C 结构名称——包括 `monad_exec` 前缀和小写蛇形拼写——旨在提醒您载荷类型具有与其 C API 对应类型*完全*相同的内存中表示。它们由 [bindgen](https://rust-lang.github.io/rust-bindgen/) 生成，并且通过 `#[repr(C)]` 属性与相同名称的 C 类型布局兼容。

### 事件环和 `'ring` 引用生命周期

`EventRing` 是一个 RAII-handle 类型：当您创建 `EventRing` 实例时，会为该事件环文件向您的进程添加新的共享内存映射。同样，当调用 `EventRing::drop` 时，这些共享内存映射将被删除。指向共享内存的任何指针或引用都需要在该点失效。

我们依赖 Rust 的内置引用生命周期分析框架来表达这一点。对位于事件环共享内存中的数据的引用始终带有称为 `'ring` 的引用生命周期。此生命周期对应于 `EventRing` 对象本身的生命周期。由于 `EventRing` 通过保持活动状态将共享内存映射固定在适当位置，因此 `'ring` 的真正含义通常可以被认为是"共享内存生命周期"，这是相同的。

### 零拷贝 API 和"事件引用"枚举类型

在前面的部分中，我们讨论了已解码的执行事件类型 `enum ExecEvent`。还有第二种具有类似设计的类型，称为 `enum ExecEventRef<'ring>`；它用于零拷贝 API。

为了比较两者，这里是 `ExecEvent` 类型：

```rust
#[derive(Clone, Debug)]
pub enum ExecEvent {
    BlockStart(monad_exec_block_start),
    BlockReject(monad_exec_block_reject),
    BlockEnd(monad_exec_block_end),
    // more variants follow
```

And here is the `ExecEventRef<'ring>` type:

```rust
#[derive(Clone, Debug)]
pub enum ExecEventRef<'ring> {
    BlockStart(&'ring monad_exec_block_start),
    BlockReject(&'ring monad_exec_block_reject),
    BlockEnd(&'ring monad_exec_block_end),
    // more variants follow
```

前者包含事件载荷的*副本*，而后者直接引用位于共享内存载荷缓冲区中的字节。通过使用 `ExecEventRef<'ring>`，您可以避免复制潜在的大量数据，例如特别大的 EVM 日志或调用帧。如果您无论如何都要过滤掉大多数事件，这很有价值。

"事件引用"枚举类型提供更好的性能，但它有两个缺点：

1. 因为它具有作为泛型参数的引用生命周期，所以使用起来可能更困难（即，更容易与借用检查器发生冲突）
2. 直接位于载荷缓冲区中的数据可以随时被覆盖，因此您不应该在首次查看后很长时间依赖它仍然存在

### 复制 vs. 零拷贝载荷 API

复制与零拷贝的决定仅适用于事件载荷；事件描述符很小，总是被复制。一旦您拥有事件的描述符，就有两种方法读取事件的载荷：

1. *复制风格* `EventDescriptor::try_read` - 这将返回一个 `EventPayloadResult` 枚举类型，其中包含"成功"变体（`EventPayloadResult::Ready`）或"失败"变体（`EventPayloadResult::Expired`）；前者包含 `ExecEvent` 载荷值，后者表示载荷已丢失
2. *零拷贝风格* `EventDescriptor::try_filter_map` - 您将一个非捕获闭包传递给此方法，并使用指向共享内存中事件载荷的 `ExecEventRef<'ring>` 引用回调它；由于您的闭包无法捕获任何内容，因此您对事件载荷做出反应的唯一方法是返回某个类型为 `T` 的值 `v`；`EventDescriptor::try_filter_map` 本身返回一个 `Option<T>`，其使用方式如下：

- 如果载荷在调用闭包之前已过期，则永远不会调用闭包，`try_filter_map` 返回 `Option::None`
- 否则运行闭包，其返回值 `v: T` 被移动到 `try_filter_map` 函数中
- 如果载荷在闭包运行后仍然有效，则通过返回 `Option::Some(v)` 将值传递给调用者，否则返回 `Option::None`

#### 为什么使用非捕获闭包？

零拷贝 API 的模式通常是这样工作的：

- 创建对事件环载荷缓冲区中数据的引用（`e: &'ring E`）并检查过期；如果未过期...
- ...根据事件载荷值计算某些内容，即计算 `let v = f(&e)`
- 一旦 `f` 完成，再次检查载荷是否过期；如果*现在*过期，那么它*可能*在计算 `v = f(&e)` 期间的某个时间点过期；我们唯一能做的安全的事情是丢弃计算值 `v`，因为我们无法确切知道过期何时发生

如果允许您在零拷贝闭包中捕获变量，您可以从库的载荷过期检测检查中"走私出"计算。也就是说，如果库后来检测到载荷在闭包运行期间的某个时间被覆盖，它将无法保证"毒化"您走私出的值。它只能*建议*您不要信任它，但这很容易出错。

惯用的 Rust 倾向于遵循"默认正确"的风格，并防范这些类型的不安全模式。在零拷贝 API 中，您只能通过返回值进行通信，因为您无法捕获任何内容。这样，如果库稍后发现它给您作为输入的载荷已过期，它可以决定根本不将返回值传播回给您。

## Rust API 中的重要类型

API 中有六个核心类型：

1. **事件环** `EventRing<D: EventDecoder>` - 给定事件环文件的路径，您创建其中一个以获得对该文件中事件环的共享内存段的访问权限；您通常使用类型别名 `ExecEventRing`，它是 `EventRing<ExecEventDecoder>` 的语法糖
2. **事件读取器** `EventReader<'ring, D: EventDecoder>` - 这是用于读取事件的类似迭代器的类型；它被称为"读取器"而不是"迭代器"，因为 [Iterator](https://doc.rust-lang.org/std/iter/trait.Iterator.html) 在 Rust 中已经有特定含义；事件读取器具有比 Rust 迭代器更复杂的返回类型，因为它具有"轮询"风格：它相当于 `next()` 的方法——称为 `next_descriptor()`——可以返回事件描述符、报告间隙或指示尚无新事件准备好
3. **事件描述符** `EventDescriptor<'ring, D: EventDecoder>` - 如果成功读取下一个事件，事件读取器会生成其中一个；回想一下，事件描述符包含事件的公共字段，并存储读取事件载荷和检查它是否过期所需的数据；在 Rust API 中，使用在事件描述符上定义的方法来读取载荷
4. **事件解码器** `trait EventDecoder` - 您不直接使用它，但实现此特征的类型——在执行事件环的情况下是 `ExecEventDecoder`——包含如何解码事件载荷的所有逻辑
5. **事件枚举类型**（关联类型 `EventDecoder::Event` 和 `EventDecoder::EventRef`）- 这些提供事件的"复制"和"零拷贝"解码形式；在 `ExecEventDecoder` 的情况下，`ExecEvent` 是"复制"类型，`ExecEventRef<'ring>` 是零拷贝（共享内存引用）类型
6. **执行事件载荷类型**（`monad_exec_block_start` 等）- 这些是 bindgen 生成的 `#[repr(C)]` 事件载荷类型，与其 C API 对应类型匹配

## 区块级实用工具

### `ExecutedBlockBuilder`

执行事件是细粒度的：EVM 采取的大多数操作都会发布描述该操作的单个事件，例如，发出的每个 EVM 日志都作为单独的 `ExecEvent::TxnLog` 事件发布。事件几乎在可用时立即流式传输给消费者，因此区块的实时数据是"一次一块"地到来的。

如果用户更喜欢使用完整的区块，名为 `ExecutedBlockBuilder` 的实用工具将把这些事件聚合回单个面向区块的更新。区块表示中的数据类型也是 [alloy_primitives types](https://docs.rs/alloy-primitives/latest/alloy_primitives/)，在 Rust 中使用起来更符合人体工程学。

### `CommitStateBlockBuilder`

如[推测性实时数据](/monad-arch/realtime-data/spec-realtime)部分所述，EVM 会尽快发布执行事件，这意味着它通常会发布有关推测性执行的区块的数据。我们不知道这些区块是否会附加到区块链上，因为共识决策与区块的执行并行发生（并将在区块执行之后完成）。

`CommitStateBlockBuilder` 在 `ExecutedBlockBuilder` 的基础上构建，还跟踪区块在共识生命周期中移动时的提交状态。区块更新本身通过 `Arc<ExecutedBlock>` 传递，因此复制对它的引用很便宜。随着区块提交状态的变化，您会收到描述新状态的更新，以及对 `Arc<ExecutedBlock>` 本身的另一个引用。

推测性实时数据指南经常指出，事件系统不会显式传达区块放弃（例如，[此处](/monad-arch/realtime-data/spec-realtime#third-commit-state-finalized)和[此处](/reference/websockets#monadnewheads-and-monadlogs)）。然而，`CommitStateBlockBuilder` *确实*报告失败提案的显式放弃，因为它是更高级别的用户友好实用工具。
