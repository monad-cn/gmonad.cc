---
title: Monad Games 密码挑战赛技术深度探讨
description: Monad Games 是一场有趣的竞赛，参与者是一些精选的社区成员，他们竞争的目标是赢取测试网 \$MON 和 \$5000，然后将这些奖励赠送给他们的社区。
image: /blog/monad_game_cipher_challenge_title.png
---

# Monad Games 密码挑战赛技术深度探讨

:::tip 原文
https://x.com/HarpalJadeja11/status/1913303414844408043  
作者：[HarpalJadeja11](https://x.com/HarpalJadeja11)  
翻译：LeoWei  
:::

Monad Games 是一场有趣的竞赛，参与者是一些精选的社区成员，他们竞争的目标是赢取测试网 \$MON 和 \$5000，然后将这些奖励赠送给他们的社区。

你可以在这里观看完整的视频：
https://www.youtube.com/watch?v=rMKgIvN962o

为了增加趣味性，让观众能够参与进来，我们在视频中隐藏了一个秘密密码，这个密码能让任何人通过 Monad Testnet 上的智能合约，领取一大笔锁定的测试网 \$MON。

我们将这个活动称为“Monad Games 密码挑战”。

这篇文章将深入探讨密码挑战的技术实现，介绍我们在构建过程中做出的决策，希望你能学到一些新知识！

游戏的运作方式如下：

![monad_game_cipher_challenge_1](/blog/monad_game_cipher_challenge_1.png)

- 用户访问网站 [cipher.monad.xyz](https://cipher.monad.xyz)
- 连接他们的钱包
- 签署一条消息以证明他们拥有连接的钱包地址
- 网站上有一个输入框，用户可以用来进行猜测（我们现在已将其移除）
- 每次用户进行猜测时，他们需要支付 0.25 MON
- 如果猜对了，游戏会暂停。
- 当游戏暂停时，用户将无法再进行猜测。
- 在游戏暂停期间，我们会手动检查用户的猜测是否有效。（为什么我们这么做，下面会解释）
- 一旦检查完成，我们会奖励获胜者，并宣布游戏结束。

*附注：用户可以进行任意数量的猜测，猜测次数没有限制。*

我们在 4 月 11 日宣布了挑战，并且在 48 小时内就有了赢家！  

这款游戏看起来简单，但背后的技术并不那么简单。  

以下是 “密码挑战赛 ”各部分的架构。  

![monad_game_cipher_challenge_2](/blog/monad_game_cipher_challenge_2.png)

首先，我们需要决定用户每次猜测需要支付多少 MON，我们选择了 0.25 MON，这是基于 Monad Testnet 上钱包持有的 MON 数量。

我们希望允许最大范围的参与，同时也保持金额足够高，以避免垃圾猜测。

我们尽可能保持透明，因此我们将 MonadGames 智能合约的逻辑公开，供他人查看。不过，合约是有一个所有者的，稍后会详细解释。


## 密码挑战赛的前端
Cipher Challenge 前端托管在 [cipher.monad.xyz](https://cipher.monad.xyz)。

用户可以访问该网站，连接他们的钱包，签署一条消息并进行猜测。

我们还嵌入了包含密码线索和答案的 YouTube 视频。

此外，我们还设置了一个小提示区域，令人惊讶的是，我们从未需要发布任何提示！

当用户进行猜测时，用户的猜测字符串会被转换为小写字母，这样即使用户以不同的字母大小写提交猜测，它仍然会被视为有效。

一旦点击提交按钮，用户的猜测字符串会首先被发送到后端 API 路由 "/hash"，在这里我们将用户的猜测字符串与一个秘密字符串连接，编码结果字符串并进行 Keccak 哈希处理。为什么这么做，稍后会解释。

让我们通过一个例子来理解这个过程：

用户的猜测 = "gmonad"

后端的 "/hash" 路由执行以下操作：

- "gmonad" + "some secret string" = A

- encodeAbiParameters([{ type: 'string' }], [A]) = B （我们使用了 Viem，这与 abi.encode(A) 相同）

- keccak256(B) = C

C 就是从 "/hash" 路由返回给前端的结果。

C 被提交到链上，作为 _userGuess（智能合约参数），并附带 0.25 MON 的费用。

## 为什么这么做？
这个问题有争议，但我们不想让用户认为哈希函数仅仅是 keccak256。因为如果仅仅简单的使用keccak256，用户通过区块链浏览器查看交易，他们很容易就能弄清楚使用的哈希函数是什么。

上述过程在本地生成链上结果时增加了额外的复杂性，也让某些人很难运行索引器来检查是否有人已经猜测过相同的内容。

因此，这样的设计确保了我们能够最大化地获得链上的参与度。

可以做得更好吗？
可能可以，欢迎在评论中提出任何建议。

我们还添加了 CORS 策略，以确保 "/hash" 路由只能从 Cipher Challenge 前端进行调用。

前端也设计了游戏暂停时的 UI，因为我们在评估赢家。

没有用于调用智能合约的管理员界面，我们只是使用了区块链浏览器，因为智能合约已经过验证。

我们使用了 Vercel 来托管网站，它设置简单，能够设置密码保护页面，并在流量较大时开启挑战模式。

对于钱包连接库，我们使用了 Reown 的 AppKit，设置以太坊登录（SIWE）非常简单。

我们希望通过 SIWE 确保用户使用的是他们自己拥有的钱包地址来进行猜测。

AppKit 还展示了有关钱包连接的统计信息，以及用户使用了哪些钱包！不过，我不确定这些数据的准确性 😅

![monad_game_cipher_challenge_3](/blog/monad_game_cipher_challenge_3.png)

"/hash" 路由函数托管在 CloudFlare 上，因为 CloudFlare 的函数比 Vercel 更便宜。

一旦用户签署了交易以提交猜测，智能合约中的 guess(bytes32) 函数会被触发，关于智能合约的更多内容请见下文。


## Monad Games 智能合约


智能合约的核心功能很简单，它允许任何人通过支付 0.25 MON 来进行猜测。每当有人进行猜测时，智能合约会触发一个 "Guess(address, bytes32)" 事件。
![monad_game_cipher_challenge_4](/blog/monad_game_cipher_challenge_4.png)

我们在合约中有一个 "receive" 函数，它允许我们将 MON 代币发送到合约中，我们用这个机制启动了 Monad Games Cipher Challenge Pool，注入了 5,000 MON 代币。  
```solidity
receive() external payable {}
```

用户只能在游戏未暂停且我们没有决定赢家时进行猜测。

暂停游戏和决定赢家是两种不同的智能合约状态。  

我们有一个机制可以暂停合约，从而暂停游戏，我们使用了 Openzeppelin 的 Pausable 合约来实现这一点。  
```solidity
contract MonadGames is Pausable, Ownable {
```

这个暂停机制是为了应急情况，以防发生意外。  

只有合约的所有者可以暂停游戏，对于所有权机制，我们使用了 Openzeppelin 的 Ownable 合约。

![monad_game_cipher_challenge_5](/blog/monad_game_cipher_challenge_5.png)

我们有一个类似暂停的额外状态，我们称其为 "decidingWinner"，当某个用户猜对时，合约进入 "decidingWinner" 状态。  

这个状态有两个作用：
- 游戏暂停，其他用户无法再进行猜测，从而避免浪费 0.25 MON。
- 前端可以区分游戏是因为紧急情况暂停，还是因为正在决定赢家而暂停。

我们通过一个简单的布尔状态变量和两个函数来实现这一点，函数会切换该变量并触发事件。 

![monad_game_cipher_challenge_6](/blog/monad_game_cipher_challenge_6.png)

只有合约的所有者可以更改合约的状态。

我们有一个 "declareWinner" 函数，只有合约所有者并且游戏处于 "decidingWinner" 状态时才能调用。  

![monad_game_cipher_challenge_7](/blog/monad_game_cipher_challenge_7.png)

这个函数需要提供猜测者的地址 (_winner) 和猜测值 (_userGuess)。  

一旦调用，它会检查 _userGuess 是否与 _winner 地址的猜测匹配，有些人可能认为这个检查是多余的，但我们希望通过这一步公平地披露猜测和作出猜测的地址。  

如果 _userGuess 与 _winner 地址匹配，那么 _winner 地址将收到智能合约中所有的 MON 余额。  

这个机制的思路是，合约的所有者调用这个函数，传入获胜猜测和获胜者地址。

上述机制是有争议的，因为智能合约的所有者可以控制谁是赢家。 

**是的，但我们希望确保获胜者不是恶意行为者，这样他们就不会拿走 MON 代币并做出破坏其他用户测试网体验的事情。**

我们还实现了一个 "withdraw" 函数，用于应急情况，只有合约的所有者且游戏处于暂停状态时才能调用。

![monad_game_cipher_challenge_8](/blog/monad_game_cipher_challenge_8.png)

这基本上涵盖了智能合约的所有内容。  

你可能会想，比较用户猜测和正确答案的逻辑在哪里？  

猜猜看，我们并没有在智能合约中存储获胜者的答案，当然显然不是以明文形式存储，因为任何人都可以读取，但也没有以哈希形式存储。😏  

那么答案在哪里呢……继续读下去！



## Monad Games 索引器

一旦用户在链上提交了猜测，智能合约会触发 Guess(address, bytes32) 事件，而该事件由索引器进行索引。  

索引器监听的两个最重要的事件是：
- Guess(address, bytes32)
- OwnershipTransferred(address, address)

![monad_game_cipher_challenge_9](/blog/monad_game_cipher_challenge_9.png)

当 MonadGames 合约触发 Guess 事件时，索引器会：

- 检查 _userGuess 是否与正确答案匹配！ 

是的，索引器有正确答案。此外，答案是以哈希形式存储的。 

**正确答案的明文形式没有在线存储过。**

- 如果猜测正确，索引器会向我们为密码挑战专门设置的 Slack 渠道发送一条消息，以便我们收到通知。  
- 索引器还可以访问一个私钥，该私钥可用于将智能合约的状态更改为 pausedDecidingWinner，然后它会发送另一条 Slack 消息，指示游戏已暂停，并且我们找到了潜在的赢家。 

我们使用了 Slack 的 [@slack/web-api](https://x.com/@slack/web-api) npm 包，并创建了一个 Slack 应用程序，以便让索引器发送 Slack 消息。

对于链上操作，我们使用了 "viem"。  
```javascript
MonadGames.OwnershipTransferred.handler(async ({ event, context }) => {
  // 发送 Slack 通知
  await sendSlackMessage(`🚨 Ownership Transferred!\nFrom: ${event.params.previousOwner}\nTo: ${event.params.newOwner}.\nContact Harpal or someone from eng team`);
});
```

"OwnershipTransferred" 是索引器监听的另一个重要事件。当所有权转移时，索引器会发送 Slack 消息，团队可以立即采取行动。  

我们这样做是因为我们预计智能合约会持有大量的测试网 MON，事实也证明是这样，因为赢家获得了大约 15.5k MON。  

索引器还监听了 Paused 和 Winner 事件，并分别发送 Slack 通知。  

我们选择了 Envio 的自托管选项来部署索引器。我们选择自托管是因为我们有一个私钥，它作为环境变量具有更高权限，可以更改智能合约的状态。

索引器本身使用 Envio CLI 很容易设置，困难的部分可能是将应用程序 Docker 化，这样你就可以将其托管在云端。  

我们使用了 Koyeb 来托管索引器。

这可以做得更好吗？ 

可能可以。  

可以使用 QuickNode 的流式服务、托管的 Webhook，跳过 Docker 部分。  

可以使用 Google Cloud 或其他流行提供商提供的 HSM（硬件安全模块）代替使用私钥作为环境变量。

就是这样！

这就是 Cipher Challenge 技术部分的概述，介绍了它们如何协同工作，如何相互通信以构建每个人都参与的游戏。  

我们希望你喜欢这款游戏以及技术深度解析！
