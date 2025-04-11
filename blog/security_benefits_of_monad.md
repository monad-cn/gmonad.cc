---
title: Monad 的安全优势
description: 低 Gas 成本，强安全性——Monad 的双重优势
image: /blog/security_benefits_1.png
---

# Monad 的安全优势

:::tip 原文
https://monadxyz.substack.com/p/the-security-benefits-of-monad-7884c4c9b398   
翻译：小符
:::

![security_benefits_1](/blog/security_benefits_1.png)

在过去的三年里，由于链上漏洞，超过[四十亿美元](https://rekt.news/leaderboard/)的资产被盗；这些损失成为了去中心化应用（DApp）被主流采用的最大障碍之一。主要原因是在以太坊上实现智能合约的安全措施成本很高。在最大限度降低用户 gas 费用的同时，以太坊开发者常常因为要放弃一些额外的安全检查而很难取舍。

一些常见的 gas 优化手段：

- 限制防御性断言的使用，只包含对应用功能至关重要的代码。防御性断言对于保持不变量至关重要，尤其是在代码升级时。
- 使用一些反直觉的技巧来节省 gas，尽管这些技巧牺牲了可读性。例如，将任何函数设为 **payable**，使用映射代替数组，避免使用库等，都会让代码更难理解，并增加升级时出错的概率。
- 使用能减少链上交互的快捷方式，而更具交互性的设计可能提供更好的安全性。例如，最初的 ERC-20 设计是用户批准应用一个特定数量的代币，但实际上，大多数前端请求的是无限批准，部分原因是为了避免用户重复支付 gas 费用。

大约 250 亿美元的[价值](https://ultrasound.money/#tvs)以 ERC-20 代币和 NFT 的形式存在于以太坊上，这使的智能合约的安全性风险极高。而 Monad 大幅降低了 gas 成本，使得大部分当前的 gas 优化手段变得不再必要，从而让开发者能够专注于构建应用的最佳版本。


## 背景：以太坊的 Gas 模型

![security_benefits_2](/blog/security_benefits_2.png)  

在以太坊中，每个操作码（opcode）都会消耗一定数量的计算单位，即 Gas。计算越多，消耗的 Gas 就越多。当用户调用智能合约中的函数时，他们需要为该函数中操作码所消耗的 Gas 付费。

由于以太坊上的计算资源极为有限，每个操作的成本都非常高。因此，在不影响功能的情况下减少操作次数，对于降低用户成本至关重要。这些优化可以采取多种形式，但每种形式都伴随着一些潜在的风险。


## 防御性断言的重要性

经验丰富的开发者会在智能合约中加入防御性断言，以防止意外情况的发生。顾名思义，防御性断言是一种将预期行为编码为合约逻辑的方式，确保某些条件始终为真。例如，如果某个内部变量预期始终是非负的，开发者可以写出类似 require(var >= 0, 'encountered negative var') 的代码，确保如果该条件不成立，交易会回滚。这种方式有效防御了利用意外情况发起的攻击。

在 DeFi 领域，[很多致命漏洞](https://valid.network/post/the-reentrancy-strikes-again-the-case-of-lendf-me)皆由重入攻击（Reentrancy Attack）引发。在[重入攻击](https://medium.com/amber-group/preventing-re-entrancy-attacks-lessons-from-history-c2d96480fac3)中，智能合约进入一个意外的状态，通常是在被巧妙构造的合约递归调用后，利用某个逻辑错误进行攻击。重入攻击的核心是合约进入了错误的状态，但没有意识到这一点。通过防御性断言，可以“意识到”这种错误状态，并在错误发生时及时回滚。

防御性断言的作用不仅限于防止重入攻击，还能避免一些常见的低级错误。例如，一个常见的错误是将代币发送到包裹以太坊（WETH）合约中，导致代币永久卡住。虽然经常有关于增加额外检查来阻止这一错误的[讨论](https://twitter.com/Analytic_ETH/status/1487961665874415620)，但这些检查会增加额外的 Gas 费用，这对没有出现错误的用户来说是个不小的负担。

总体而言，防御性断言是一种有效的安全措施，能够帮助开发者规避常见的漏洞和错误，确保合约的逻辑始终按照预期执行。尽管它会增加 Gas 成本，但在确保合约安全性和防止重大漏洞的情况下，这样的开销是值得的。

[![security_benefits_3](/blog/security_benefits_3.png)](https://twitter.com/YannickCrypto/status/1487837906538483715)



仅在 WETH 合约上，由于缺乏这些防护措施，已经损失了超过[一百万美元的资产](https://etherscan.io/tokenholdings?a=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)。


## 微优化降低了代码的可读性

![107_4](/blog/security_benefits_4.png)

有一些巧妙的技巧可以节省 Gas，尽管这些做法可能会牺牲代码的可读性。以下是其中的一些例子：

将函数标记为 “payable”（即使该函数并不打算接收 Ether）减少 Gas 消耗：

[![107_5](/blog/security_benefits_5.png)](https://twitter.com/Mudit__Gupta/status/1482643410834300931)

[![107_6](/blog/security_benefits_6.png)](https://twitter.com/samczsun/status/1469477928350240771)


使用汇编（Assembly）：

[![107_7](/blog/security_benefits_7.png)](https://twitter.com/0xkkeon/status/1567254237171847168)

避免使用外部库：

[![107_8](/blog/security_benefits_8.png)](https://twitter.com/Mudit__Gupta/status/1474015257945264128)


更多巧妙的优化技巧：

- https://github.com/0xKitsune/EVM-Gas-Optimizations
- https://github.com/ControlCplusControlV/Yul-Optimization-Tips

可读性提高了理解，而理解又能提升安全性。团队成员和审计人员需要能够轻松理解代码，这样才能识别漏洞，并在进行后续修改时避免引入错误。


[![107_9](/blog/security_benefits_9.png)](https://twitter.com/stonecoldpat0/status/1149971603536666625)

[![107_10](/blog/security_benefits_10.png)](https://twitter.com/nassyweazy/status/1569399374924374026)

## 安全实践背后的原因

![107_11](/blog/security_benefits_11.png)

在某些情况下，开发者为了 Gas 效率，明确选择了不安全的做法。

ERC-20 授权是一个很好的例子。原始的 ERC-20 规范要求用户为应用程序授权一个特定数量的代币，以便应用程序只能花费预期的数量。但实际上，大多数前端会请求[无限量授权](https://twitter.com/larry0x/status/1466415608308850696)，部分原因是为了避免用户重复支付 Gas。如果应用程序的部署者被攻破，攻击者可以直接从给予这些授权的用户钱包中提取资金。

另一个例子是，Solidity 提供了 SafeMath，它用于检查溢出和下溢。一个流行的“技巧”是禁用这些安全检查，以节省一些 Gas：


[![107_12](/blog/security_benefits_12.png)](https://twitter.com/KhanAbbas201/status/1627907758409527297)

[![107_13](/blog/security_benefits_13.png)](https://twitter.com/bantg/status/1488660866547556354)

安全实践非常有必要，但在当前以太坊的状态下，绕过这些实践的确会节省 Gas。


## 需要改进的地方

![105_14](/blog/security_benefits_14.png)

由于计算成本较高，应用开发者目前必须在安全性和成本之间做出权衡。对于既安全又便宜的应用，最简单的路径是大幅降低计算成本。让开发者在编写代码时不必精打细算是一个简单却常被忽视的需求，而在 Monad 中这一点并没有被忽视。

[![107_15](/blog/security_benefits_15.png)](https://twitter.com/fubuloubu/status/1623301907866320897)

[![107_16](/blog/security_benefits_16.png)](https://twitter.com/LefterisJP/status/998693893918117889)

[![107_17](/blog/security_benefits_17.png)](https://twitter.com/maurelian_/status/1492307405815824385)

Monad 正在为开发者创造一个无需妥协的环境。迎接下一个十亿用户的道路将需要既安全又易用的应用；而在 Monad 上构建这些应用，便是最佳选择。
