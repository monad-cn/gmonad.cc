# Monad 的交易生命周期

### 交易提交 <a href="#block-22af2c5f82f043228d62ccbe7d8ad026" id="block-22af2c5f82f043228d62ccbe7d8ad026"></a>

交易的生命周期开始于用户发起一个已签名的交易并将其提交给 RPC 节点。

交易通常由应用程序前端准备，然后提交给用户钱包进行签名。大多数钱包都会调用 `eth_estimateGas` RPC来预设该笔交易的 Gas **限制**，不过用户也可以在钱包中修改该限额，用户通常还会被要求选择交易的 Gas **价格**，即每单位 Gas 的本机代币数量。

用户在其钱包中批准签名后，签名交易将通过 `eth_sendTransaction` 或 `eth_sendRawTransaction` API 调用提交到 RPC 节点。

值得注意的是，在 Monad 中，Gas 限额是传输成本 Gas 和执行成本 Gas 之和，传输 Gas 是一个常数。

### 内存池广播 <a href="#block-657dc51bf3b540e3ba2aaad028492ebf" id="block-657dc51bf3b540e3ba2aaad028492ebf"></a>

RPC 节点会将待处理交易广播给参与共识的其他 Monad 节点，待处理交易集也叫"内存池"。有关内存池作业的更多详情，请参阅[内存池](consensus/shared-mempool)章节。

出于防止垃圾交易的原因，只有当[储备金余额](consensus/carriage-cost-and-reserve-balance)中有足够的 Gas 时，节点才会将该笔交易添加到其内存池中。

### 区块打包 <a href="#block-4f4825341e524560986b525f079e828d" id="block-4f4825341e524560986b525f079e828d"></a>

MonadBFT 采用轮值领导人机制来生成区块，每一轮的领导人都会从待处理交易集中选出一个区块。在将一笔交易打包进区块后，领导人会对储备金余额中的传输成本进行递减操作。

如 [MonadBFT](consensus/monadbft) 所述，区块会在网络中广播，该区块的法定人数证书（QC）会在随后一轮共识中广播（即由下一任领导人发出）；接收到 QC 证书后，投票节点会相互发送投票；当一个节点检测到 2/3 的投票权投同意票时，它就会最终确认该区块。

一旦区块被最终确认，该笔交易就在区块链交易历史上正式"发生"了。由于其排序已确定，因此其真值（即成功还是失败，以及执行后的结果）也就确定了。

### 本地执行 <a href="#block-fbd2d4f7131a40519c852bc20a1b451c" id="block-fbd2d4f7131a40519c852bc20a1b451c"></a>

节点一旦确认一个区块，就会开始执行该区块中的交易。出于效率考虑，交易以并行方式优化执行，由于结果总是按原始排序提交，因此就像串行执行交易一样。

### 结果查询 <a href="#block-0432fa8485ec4af5a93af1d14b51beef" id="block-0432fa8485ec4af5a93af1d14b51beef"></a>

用户可以在任何 RPC 节点上调用 `eth_getTransactionByHash` 或 `eth_getTransactionReceipt` 来查询交易结果，RPC 节点上的本地执行完成后，将立即返回结果。
