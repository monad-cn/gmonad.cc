# 其他详细信息

### 账户 <a href="#block-0e0c4d2be856453c98d9e071c1482c1a" id="block-0e0c4d2be856453c98d9e071c1482c1a"></a>

Monad 中的账户与[以太坊账户](https://ethereum.org/en/developers/docs/accounts/)相同，使用与以太坊相同的地址空间（ ECDSA 的 20 字节地址）。与以太坊账户一样，Monad 也分外部账户（EOA）和合约账户。

### 交易 <a href="#block-7af06f7875d2419bb62672151ba60eb6" id="block-7af06f7875d2419bb62672151ba60eb6"></a>

Monad 中的交易格式与[以太坊一致](https://ethereum.org/en/developers/docs/transactions/)，即符合 [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718) 标准，交易使用 [RLP](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/) 编码。

支持可选访问列表 ([EIP-2930](https://eips.ethereum.org/EIPS/eip-2930))，但不是必需的。

### 区块和交易的线性 <a href="#block-1bc773c53b0a4b128696ae7c98a9d171" id="block-1bc773c53b0a4b128696ae7c98a9d171"></a>

区块仍然是线性的，区块内的交易也是线性的。并行执行仅用于提高效率，绝不会影响一系列交易的真实结果或结束状态。

### 燃料（Gas） <a href="#block-07e2a88f989443bea7514ba3d26cf84f" id="block-07e2a88f989443bea7514ba3d26cf84f"></a>

[Gas](https://ethereum.org/en/developers/docs/gas/)（或许更明确地命名为 "本币的计算单位"）的设置与以太坊相同，每个操作码都需要花费一定量的 Gas。在 Monad 中，每个操作码的 Gas 成本与以太坊相同，但未来可能会更新。

当用户提交交易时，会在交易中加入 Gas 限额（该函数调用在交易失败前可消耗的最大 Gas 数量）和 Gas 价格（每单位 Gas 成本，以本币为单位）。

默认 Monad 客户端中的领导人使用优先 Gas 竞拍（PGA）提交交易，即按照 Gas 报价从高到低排序交易，未来可能会有其他的交易排序机制。排序的选择与下游发生的一切无关，有效的排序选择并不包含在 Monad 协议中。
