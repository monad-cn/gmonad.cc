---
title: 浅析 MonadBFT
description: MonadBFT 可以通过抵御尾部分叉提供更可预测、更稳定的区块链环境。
image: /blog/monadbft_1.png
---

# 浅析 MonadBFT

:::tip 原文
https://x.com/category_xyz/status/1907442601822707922  
https://x.com/Harveycww/status/1907636324368285734  
翻译： Harvey
:::

Category Labs 正式发布 @monad_xyz 的下一代共识协议 —— MonadBFT。它专为高速度（可达 10,000 笔交易/秒）、安全性以及亚秒级最终确认（sub-second finality）而设计，确保网络能更高效地在有效区块上达成共识。

![monadbft_1](/blog/monadbft_1.png)
让我们一同来了解 MonadBFT 的特性👇

## MonadBFT 的核心亮点

MonadBFT 基于经过验证的管道化 HotStuff（pipelined HotStuff）协议，同时具备以下独特属性：  
1. 抵御尾部分叉（Tail-forking resistance）：可有效防止扰乱网络的区块重组（reorg）和延迟。  
2. 单轮投机最终性（Single-round speculative finality）：加速交易处理、降低延迟。  
3. 乐观响应性（Optimistic responsiveness）：没有人为延迟，完全依赖于实际网络速度。  
4. 在“快乐路径”（happy path）下具有线性复杂度（Linear complexity）：随着验证者数量的增加，依然可有效扩展。  


## 核心创新：尾部分叉阻力

尾部分叉（tail-forking） 是什么？当一个已经获得绝大多数（supermajority）投票的区块被放弃并被新提案的区块取代时，就会发生尾部分叉。这并不算严格意义上的“硬分叉”，但会在链上造成重组和混乱。对于 PoS 而言，这是一个常被忽视、但又十分严重的问题。

为什么尾部分叉会造成危害？以下是当前测试网中的一个示例：验证者 Valerie 提议了一个有效区块。但下一位验证者 Will 离线了，导致 Valerie 提出的区块没有继续推进，即使 Valerie 没有任何过错。

在很多管道化系统中，下一位提议者需要为前一个区块（Valerie 的区块）打包投票。如果下一位提议者中断或者无法执行，那么前一个区块也会随之失败。

![monadbft_2](/blog/monadbft_2.png)

这样会带来两个问题：不公平：像 Valerie 这样的诚实验证者会因为他人的错误而失去奖励或手续费。糟糕的用户体验：一些应用在显示“Voted”（大约 500ms）和“Finalized”（大约 1s）之间的过渡状态时，如果遇到尾部分叉就会被回滚，对于高频交易（HFT）、游戏和实时应用尤其糟糕！尾部分叉还可能被恶意利用，带来 MEV（最大可提取价值） 风险。

一个在线且逐利的验证者可能与下一位提议者串通，故意让前一轮提案超时，使原有区块被放弃，然后再发出新的提案，从而窃取被放弃区块中的交易与 MEV，这类似“自私挖矿”，会导致网络不稳定甚至中断。

## MonadBFT 的解决方案

MonadBFT 确保任何获得足够投票（supermajority 或诚实多数）的区块最终一定会被确定（finalized）。它是怎么做到的？

超时消息（timeout messages） 包含对最新已投票区块的信息。下一位提议者如果发现前一个区块尚未最终确定，必须先重新提议那个区块，而不是任其被放弃。

在前面的示例中，如果 Valerie 提议区块后，Will 离线了，那么下一位提议者 Xander 会根据超时消息发现 Valerie 的区块还没最终确认：  
- Xander 先重新提议 Valerie 的区块。  
- 然后 Xander 再提出自己的区块。  

这样就保证 Valerie 的区块没有被白白丢弃，诚实验证者的努力和奖励都能得到保障。


## 总结

MonadBFT 通过抵御尾部分叉带来以下好处：  
🛡️ 保护诚实验证者的工作与奖励。  
⛓️ 提供更可预测、更稳定的区块链环境。  
💸 抑制利用重组进行的恶意 MEV 行为。   
⚡ 提升投机最终性的安全性，改善用户体验。  

当然，这只是 MonadBFT 众多强大功能的冰山一角。我们会在后续分享中继续探讨更多精彩特性！

想更深入地了解 MonadBFT？  
📄 阅读博客：https://category.xyz/blogs/monadbft-fast-responsive-fork-resistant-streamlined-consensus  
🔬 查看论文：https://arxiv.org/abs/2502.20692  






