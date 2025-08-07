# MonadBFT 共识机制

流水线式两阶段 HotStuff 共识机制（Pipelined two-phase HotStuff）

MonadBFT 是一种高性能共识机制，用于在拜占庭参与者存在的情况下，在部分同步条件下就交易排序达成一致。它是 [HotStuff](https://arxiv.org/pdf/1803.05069) 的衍生机制，在 [Jolteon](https://arxiv.org/pdf/2106.10362.pdf)/[DiemBFT](https://developers.diem.com/papers/diem-consensus-state-machine-replication-in-the-diem-blockchain/2021-08-17.pdf)/[Fast-HotStuff](https://arxiv.org/abs/2010.11454) 中采用了优化方案，即在领导人超时的情况下，利用二次通信复杂度将三轮共识减少到两轮。

MonadBFT 是一种流水线式两阶段 BFT 算法，具有乐观响应性，在普通情况下通信开销为线性，在超时情况下通信开销为二次方。与大多数 BFT 算法一样，通信分阶段进行，在每个阶段，领导人向投票者发送签名信息，投票者再向下一位领导人发送签名回执，流水线作业允许区块 `k` 的法定人数证书（QC）或超时证书（TC）捎带区块 `k+1` 的提议。

### **基本情况**

| 相关属性     | 属性描述       |
| -------- | ---------- |
| 抗51%攻击机制 | 权益证明 （PoS） |
| 区块时间     | 1 秒        |
| 最终确定性    | 单时隙确定性     |
| 投票权委托    | 允许         |

### **内存池**

请参阅 [共享内存池](shared-mempool)

### **共识协议**

MonadBFT 是一种流水线式共识机制，分轮次进行。以下内容提供了对协议的高级直观理解。

按照惯例，假设有 `n=3f+1` 个节点，其中 `f` 是拜占庭节点的最大数量， `2f+1`（即 2/3）个节点是非拜占庭节点。在下面的讨论中，我们将所有节点视为具有相同投票权，实际上，所有阈值都可以用投票权而不是节点数来表示。

* 在每一轮中，领导人都会发出一个新的区块，以及上一轮的 QC 或 TC（稍后将详细介绍）。
* 每个验证者都会审查该区块是否符合协议，如果通过，则将签名的”同意"选票发送给下一轮领导人，然后该领导人通过汇总（通过阈值签名）来自 `2f+1` 个验证者的 "同意"选票，得出 QC（法定人数证书）。请注意，这种情况下的消息是线性的：领导人向验证者发送区块，验证者直接向下一轮领导人发送选票。
* 另外，如果验证者在预先指定的时间内没有收到有效数据块，它就会向所有对等设备广播一个签名的超时消息，该超时消息还包括验证者观察到的最高 QC。如果任何验证者积累了 `2f+1` 个超时消息，它就会将这些消息（同样通过阈值签名）组合成一个 TC（超时证书），然后直接发送给下一轮领导人。
* 每个验证者在收到第 `k+1` 轮的 QC 时（在第 `k+2` 轮领导人的消息中），最终确定第 `k` 轮提出的区块。具体来说：
* 第 `k` 轮的领导人 _**Alice**_ 会向所有人发送一个新的区块（同时发送第 `k-1` 轮的QC或TC。我们忽略这一点，因为它并不重要）。
* 如果有 `2f+1` 个验证者通过向 _**Bob**_（第 `k+1` 轮的领导人）发送选票来对该区块投同意票，那么 `k+1` 中的区块将包含第 `k` 轮的 QC。然而，验证者 _**Valerie**_ 此时看到第 `k` 轮的 QC 并不足以让她知道第 `k` 轮的区块已被纳入。原因例如：_**Bob**_ 可能是恶意的，他只向 _**Valerie**_ 发送了该区块，_**Valerie**_ 所能做的就是对区块 `k+1` 进行投票，并将她的投票发送给 _**Charlie**_（第 `k+2` 轮的领导人）。
* 如果有 `2f+1` 个验证者对区块 `k+1` 投同意票，那么 _**Charlie**_ 就会发布 `k+1` 轮的 QC 以及 `k+2` 轮的区块提议。一旦 _**Valerie**_ 收到这个区块，她就知道第 `k` 轮的区块（即 _**Alice**_ 的区块）已经最终确定。
* 假设 _**Bob**_ 在第 `k+1` 轮恶意发送了一个无效的区块提议，或者向少于 `2f+1` 个验证者发送了该提议，那么至少有 `f+1` 个验证者会超时，然后触发其他非拜占庭验证者超时，这样至少有一个验证者产生 `k+1` 轮的 TC。然后，_**Charlie**_ 将在他的提议中公布第 `k+1` 轮的 TC（他必须这样做才能提出提议，因为第 `k+1` 轮没有 QC）。
* 我们把这种提交流程称为 2-chain 提交规则，因为只要验证者看到 2 个相邻的被证明块 `B` 和 `B'`，就可以提交 `B` 及其所有祖先块。

参考资料：

* Maofan Yin, Dahlia Malkhi, Michael K. Reiter, Guy Golan Gueta, and Ittai Abraham. [HotStuff: BFT Consensus in the Lens of Blockchain](https://arxiv.org/abs/1803.05069), 2018.
* Mohammad M. Jalalzai, Jianyu Niu, Chen Feng, Fangyu Gai. [Fast-HotStuff: A Fast and Resilient HotStuff Protocol](https://arxiv.org/abs/2010.11454), 2020.
* Rati Gelashvili, Lefteris Kokoris-Kogias, Alberto Sonnino, Alexander Spiegelman, and Zhuolun Xiang. [Jolteon and ditto: Network-adaptive efficient consensus with asynchronous fallback](https://arxiv.org/pdf/2106.10362.pdf). arXiv preprint arXiv:2106.10362, 2021.
* The Diem Team. [DiemBFT v4: State machine replication in the diem blockchain](https://developers.diem.com/papers/diem-consensus-state-machine-replication-in-the-diem-blockchain/2021-08-17.pdf). 2021.

### **BLS多重签名**

证书（QC 和 TC）可以在 secp256k1 curve 上以 ECDSA 签名向量的形式简单实现，这些证书是明确的，易于构建和验证。但是证书的大小与签名者的数量成线性关系，除了投票信息外，几乎每条共识消息都包含证书，这限制了区块链扩容。

BLS12-381 curve 上基于配对的 BLS 签名有助于解决扩容问题，签名可以逐步聚合成一个签名，验证单个有效的聚合签名就能证明与公钥相关的投票权都已在消息上签名。

BLS 签名比 ECDSA 签名慢得多，出于性能考虑，MonadBFT 采用了一种混合签名方案：BLS 签名只用于可聚合的消息类型（投票和超时），消息的完整性和真实性仍由 ECDSA 签名提供。
