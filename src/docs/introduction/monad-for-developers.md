# 面向开发人员的 Monad

Monad 是与以太坊兼容的 Layer1 区块链，吞吐量为 10,000 tps，区块时间为1秒，采用[单时隙确定性](https://ethereum.org/zh/roadmap/single-slot-finality/)（single-slot finality）。

Monad 对以太坊虚拟机的优化符合[上海升级](https://www.evm.codes/?fork=shanghai)的要求，使用 Monad 执行环境模拟以太坊历史交易会产生相同的结果。Monad 还与以太坊 RPC 完全兼容，因此用户可以使用 MetaMask 和 Etherscan 等熟悉的工具与 Monad 进行交互。

Monad 通过引入以下四项重大创新实现了这些性能的优化：

* [MonadBFT 共识机制](../monad-architecture/consensus/monadbft)（pipelined HotStuff 共识机制，以及更多的研究改进）
* [Deferred Execution / 延迟执行](../monad-architecture/consensus/deferred-execution)（在达成共识和执行之间进行 pipelining 作业，以大幅增加执行预算）
* [Parallel Execution / 并行执行](../monad-architecture/execution/parallel-execution)
* [MonadDb 数据库](../monad-architecture/execution/monaddb)（高性能状态后端）

虽然 Monad 具有并行执行和流水线执行功能，但需要注意的是，Monad 中的区块是线性的，交易在每个区块中也是线性排序的。

### 交易格式

<table><thead><tr><th width="128">相关属性</th><th>属性描述</th></tr></thead><tbody><tr><td>地址空间</td><td>使用 ECDSA 匹配以太坊 20 字节地址</td></tr><tr><td>交易格式</td><td><p>符合 <a href="https://ethereum.org/zh/developers/docs/transactions/">以太坊</a> </p><p>符合 <a href="https://eips.ethereum.org/EIPS/eip-2718">EIP-2718</a>，使用 <a href="https://ethereum.org/zh/developers/docs/data-structures-and-encoding/rlp/">RLP</a> 编码。支持但不要求访问列表（<a href="https://eips.ethereum.org/EIPS/eip-2930">EIP-2930</a>）。</p></td></tr><tr><td>钱包兼容性</td><td>Monad 与 Metamask 等标准以太坊钱包兼容。唯一需要更改的是 RPC URL 和 ChainId。</td></tr></tbody></table>

### 智能合约

* Monad 支持 EVM 字节码，与以太坊字节码等效，支持所有 [操作码](https://www.evm.codes/?fork=shanghai)（截至上海升级）。

### 共识机制

<table><thead><tr><th width="134">相关属性</th><th>属性描述</th></tr></thead><tbody><tr><td>抗 51% 攻击</td><td>权益证明（PoS）</td></tr><tr><td>委托投票权</td><td>允许（协议原生）</td></tr><tr><td>共识机制和流水线机制</td><td><p><a href="../monad-architecture/consensus/monadbft">MonadBFT</a> 是一种基于领导人选举的共识算法，用于在部分同步条件下就交易排序和打包达成一致。广义上，它是 HotStuff 的衍生算法，并进行了额外的研究优化。</p><p></p><p>MonadBFT 是一种流水线式两阶段 BFT 算法，在一般情况下具有线性的 communication overhead。与大多数 BFT 算法一样，通信分阶段进行，在每个阶段，领导人向投票者发送签名信息，投票者再发回签名回执。流水线作业允许区块 <code>k</code> 的法定人数证书（QC）或超时证书（TC）包含区块 <code>k+1</code> 的提议，超时会进行二次消息传递。</p></td></tr><tr><td>区块时间</td><td>1秒</td></tr><tr><td>最终确定性</td><td>单时隙确定性，一旦2/3的验证者对整块提议投了"支持"票，区块即最终确定。</td></tr><tr><td>内存池</td><td>有<a href="../monad-architecture/consensus/shared-mempool">内存池</a>，交易采用纠删码，并使用 broadcast tree 进行通信，以提高效率。</td></tr><tr><td>抵制垃圾交易</td><td>用户为交易打包进区块（“<a href="../monad-architecture/consensus/carriage-cost-and-reserve-balance">传输成本</a>”）和交易执行（“执行成本”）付费。</td></tr><tr><td>共识参与者</td><td>直接共识参与者对区块提议进行投票，并担任领导人。要成为直接参与者，节点必须至少有 <code>MinStake</code> 质押，并且按投票权排在 <code>MaxConsensusNodes</code> 参与者的前列，这些参数在代码中设定。</td></tr><tr><td>交易哈希</td><td>为提高效率，区块提议<a href="../monad-architecture/consensus/shared-mempool">仅通过哈希值</a>来引用交易。如果一个节点没有参与交易，它将通过哈希向邻居节点请求交易。</td></tr><tr><td>延迟执行和燃料成本</td><td><p>在 Monad 中，共识和执行以流水线方式进行。节点在执行正式交易排序（<a href="../monad-architecture/consensus/deferred-execution">延迟执行</a>）之前，会就该排序达成共识，执行结果并不是达成共识的先决条件。</p><p></p><p>在区块链中，通常执行是达成共识的先决条件，而执行的时间预算只占区块时间的一小部分。将共识和执行流水线化后，Monad 就可以将全部区块时间用于共识和执行。</p><p></p><p>区块提议由交易哈希有序列表和 <code>D</code> 个区块前的状态 merkle 根组成，延迟参数 <code>D</code> 在代码中设定，预计最初 <code>D = 10</code>。</p><p></p><p>用户必须支付费用（"<a href="../monad-architecture/consensus/carriage-cost-and-reserve-balance">传输费用</a>"）才能将交易打包进区块。对于每个交易账户，节点保留两个余额：</p><p>• 储备余额，用于支付传输费用</p><p>• 执行余额，用于支付执行费用</p><p></p><p>当交易被纳入区块（共识）时，传输费用从储备余额中扣除；当交易被执行时，传输费用从执行余额中扣除（双重费用）；在 <code>D</code> 个区块的延迟期后，将剩余费用偿还给储备余额。</p><p></p><p>账户的储备余额实际是"待处理"交易的费用预算，它的存在是为了确保只有已支付交易费用的交易被打包进区块。</p><p></p><p>每个账户都有一个预留储备余额，该余额可通过与内置的智能合约交互进行更改，例如，对于计划发送大量交易的 EOA 账户而言。</p></td></tr><tr><td>状态确认</td><td><p>最终确定性发生在共识时间，在这一点上，交易的官方排序是神圣的。对于任何全节点来说，结果都是完全确定的，它们通常会在1秒内执行该新块的交易。</p><p></p><p>状态 merkle 根的 <code>D</code> 区块延迟仅用于状态根验证，例如允许节点验证自己没有计算错误。</p></td></tr></tbody></table>

### 执行机制

每个区块的执行阶段，在该区块达成共识后开始，并允许节点继续就后续区块达成共识。

#### **并行执行**

交易是按线性顺序排列的，执行作业是得出串行执行交易列表后的状态，最简单的方法就是一个接一个地执行交易。我们能做得更好吗？可以！

Monad 采用[并行执行](../monad-architecture/execution/parallel-execution)：

* 执行器是执行交易的虚拟机，Monad 可并行运行多个执行器。
* 执行器接收一笔交易并产生一个**结果**，结果是该笔交易的**输入**和**输出**列表，其中输入是执行过程 SLOAD 的（ContractAddress、Slot、Value）元组，输出是交易结果 SSTORE 的（ContractAddress、Slot、Value）元组。
* 结果最初在待处理状态下产生，然后按照交易的原始排序提交，当结果提交时，其输出会更新当前状态。在结果提交时，Monad 会检查其输入是否仍与当前状态匹配，如果不匹配，Monad 会重新安排交易。由于采用了并发控制，Monad 能确保生成与串行执行交易相同的结果。
* 当交易被重新安排时，许多或全部需要的输入都已被缓存，因此重新执行的成本通常相对较低。需要注意的是，在重新执行时，交易可能会生成与上次执行不同的输入集。

#### **MonadDb：高性能状态后端**

所有交易的活动状态都存储在 [MonadDb](../monad-architecture/execution/monaddb) 中，MonadDb 是由固态硬盘（SSD）组成的存储后端，专为存储 merkle trie 数据而优化。该数据更新是分批进行的，因此可以提高 merkle 根的更新效率。

MonadDb 实现了内存缓存，并使用 [asio](https://think-async.com/Asio/) 实现了高效的异步读写。节点至少配置 32GB 内存，以获得最佳性能。

### 与以太坊的比较：用户角度

| 相关属性                                                                                  | Ethereum                                                                   | Monad                                                                      |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 每秒交易量（合约调用和转账）                                                                        | \~10次                                                                      | \~10,000次                                                                  |
| 区块时间                                                                                  | 12秒                                                                        | 1秒                                                                         |
| 最终确定性                                                                                 | [2 epochs](https://hackmd.io/@prysmaticlabs/finality) (12-18分钟)            | 单时隙确定性 (1秒)                                                                |
| 字节码标准                                                                                 | EVM ([上海升级](https://www.evm.codes/?fork=shanghai))                         | EVM ([上海升级](https://www.evm.codes/?fork=shanghai))                         |
| RPC API                                                                               | [Ethereum RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) | [Ethereum RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) |
| 密码学                                                                                   | ECDSA                                                                      | ECDSA                                                                      |
| 账户                                                                                    | ECDSA 算法中，keccak-256 公钥的最后20个字节                                            | ECDSA 算法中，keccak-256公钥的最后20个字节                                             |
| 共识机制                                                                                  | Gasper (Casper-FFG finality gadget + LMD-GHOST fork-choice rule)           | MonadBFT (pipelined HotStuff 以及更多的研究优化)                                    |
| 内存池                                                                                   | 有                                                                          | 有                                                                          |
| 交易排序                                                                                  | <p>Leader's discretion </p><p>(实际：PBS)</p>                                 | <p>Leader's discretion </p><p>(默认方案：PGA)</p>                               |
| 抗51%攻击                                                                                | PoS                                                                        | PoS                                                                        |
| 投票权委托                                                                                 | 不允许，需通过 LSTs 实现                                                            | 允许                                                                         |
| [硬件要求](https://docs.monad.xyz/using-monad/running-a-node/hardware-requirements) (全节点) | <p>4核 CPU </p><p>16GB 内存 </p><p>1TB 固态硬盘 </p><p>25Mbit/s 带宽</p>            | <p>16核 CPU</p><p>32GB 内存</p><p>2TB 固态硬盘</p><p>100Mbit/s 带宽</p>             |
