# 如何使用 GhostGraph 索引代币转账

URL: https://docs.monad.xyz/guides/indexers/ghost

## 介绍

在本指南中，您将在 Monad 测试网上创建一个 ERC20 代币并使用 [GhostGraph](https://docs.tryghost.xyz/) 索引其转账。您将学习如何：

- 部署基本的 ERC20 代币合约
- 本地测试合约
- 部署到 Monad 测试网
- 使用 GhostGraph 设置事件跟踪

## 前置条件

开始之前，请确保您拥有：

- 已安装 Node.js（v16 或更新版本）
- 已安装 Git
- 已安装 [Foundry](https://github.com/foundry-rs/foundry)
- 一些 MONAD 测试网代币（用于gas费）
- Solidity 和 ERC20 代币的基础知识

## 项目设置

首先，克隆启动仓库：

```sh
git clone https://github.com/chrischang/cat-token-tutorial.git
cd cat-token-tutorial
```

## CatToken 合约实现

`src/CatToken.sol` 合约实现了具有固定供应量的基本 ERC20 代币。代码如下：

CatToken.sol src

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CatToken is ERC20 {
    /**
     * @dev 构造函数将所有现有代币分配给 msg.sender。
     * 初始供应量为 10 亿代币。
     */
    constructor() ERC20("CatToken", "CAT") {
        // 向部署者铸造 10 亿代币的初始供应量
        // 这将发出 GhostGraph 可以索引的 Transfer 事件
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals());
    }
}
```

此实现：

- 创建名称为"CatToken"、符号为"CAT"的代币
- 向部署者地址铸造 10 亿代币
- 使用 OpenZeppelin 经过实战测试的 ERC20 实现

## 测试合约

导航到测试文件 `test/CatToken.t.sol`：

CatToken.t.sol test

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/CatToken.sol";

contract CatTokenTest is Test {
    CatToken public token;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1);

        token = new CatToken();
    }

    function testInitialSupply() public view {
        assertEq(token.totalSupply(), 1_000_000_000 * 10**18);
        assertEq(token.balanceOf(owner), 1_000_000_000 * 10**18);
    }

    function testTransfer() public {
        uint256 amount = 1_000_000 * 10**18;
        token.transfer(user, amount);
        assertEq(token.balanceOf(user), amount);
        assertEq(token.balanceOf(owner), 999_000_000 * 10**18);
    }
}
```

运行测试：

```sh
forge test -vv
```

## 部署设置

### 1. 创建 `.env` 文件：

```sh
cp .env.example .env
```

### 2. 将您的凭据添加到 `.env` 文件：

```sh
PRIVATE_KEY=your_private_key_here
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
```

### 3. 创建部署脚本 `script/DeployCatToken.s.sol`：

DeployCatToken.s.sol script

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CatToken.sol";

contract DeployCatToken is Script {
    function run() external {
        // 从环境中检索私钥
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        CatToken token = new CatToken();
        vm.stopBroadcast();

        // 记录代币地址 - GhostGraph 索引和提交交易将需要此地址
        console.log("CatToken deployed to:", address(token));
    }
}
```

## 在 Monad 测试网上部署 CatToken

### 1. 加载环境变量：

```sh
source .env
```

### 2. 部署合约：

```sh
forge script script/DeployCatToken.s.sol \
--rpc-url $MONAD_TESTNET_RPC \
--broadcast
```

保存部署的合约地址以供下一步使用。

记住将 `TOKEN_ADDRESS` 添加到您的 `.env` 文件中

您现在应该有

```sh
PRIVATE_KEY=your_private_key_here
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
TOKEN_ADDRESS=0x...
```

## 验证智能合约

### 1. 加载环境变量：

```sh
source .env
```

### 2. 验证合约：

```sh
forge verify-contract \
  --rpc-url $MONAD_TESTNET_RPC \
  --verifier sourcify \
  --verifier-url 'https://sourcify-api-monad.blockvision.org' \
  $TOKEN_ADDRESS \
  src/CatToken.sol:CatToken
```

验证后，您应该在 [MonadVision](https://testnet.monadvision.com) 上看到合约已验证。您应该看到复选标记和表明合约源代码已验证的横幅。

![已验证的合约](https://docs.monad.xyz/assets/images/verified-contract-82a14c97a8ec3bed742cbc412cb301e1.png)

## 链上代币转账交易脚本

我们在链上执行一些代币转账交易以触发 GhostGraph 将索引的 `Transfer` 事件。

查看转账脚本 `script/TransferCatTokens.s.sol`：

TransferCatTokens.s.sol script

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CatToken.sol";

contract TransferCatTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address token = vm.envAddress("TOKEN_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 向测试地址发送代币
        CatToken(token).transfer(address(0x1), 1000 * 10**18);
        CatToken(token).transfer(address(0x2), 2000 * 10**18);
        CatToken(token).transfer(address(0x3), 3000 * 10**18);

        vm.stopBroadcast();
    }
}
```

运行以下命令执行转账：

```sh
forge script script/TransferCatTokens.s.sol \
--rpc-url $MONAD_TESTNET_RPC \
--broadcast
```

您现在已经部署了您的 ERC-20 合约并在 Monad 测试网上提交了交易。让我们使用 GhostGraph 跟踪这些链上事件。

## 设置 GhostGraph 索引

1. 访问 [GhostGraph](https://tryghost.xyz/) 并点击注册账户
2. 创建新的 GhostGraph
![创建 ghost graph](https://docs.monad.xyz/assets/images/create_ghost_graph-c09a4e7281041e387a6464e752caa8a5.png)

1. 将此内容复制粘贴到 `events.sol` 文件中。我们有兴趣跟踪代币流。让我们在这里插入此事件。要了解更多关于事件的信息：[https://docs.tryghost.xyz/ghostgraph/getting-started/define-events](https://docs.tryghost.xyz/ghostgraph/getting-started/define-events)
events.sol

```solidity
interface Events {
    event Transfer(address indexed from, address indexed to, uint256 value);
}
```

1. 将此内容复制粘贴到 `schema.sol` 文件中。在这种情况下，我们正在创建一些结构，我们将使用它们将实体保存到 Ghost 数据库中。要了解更多关于架构的信息：[https://docs.tryghost.xyz/ghostgraph/getting-started/define-schema](https://docs.tryghost.xyz/ghostgraph/getting-started/define-schema)
schema.sol

```solidity
struct Global {
    string id;
    uint256 totalHolders;
}

struct User {
    address id;
    uint256 balance;
}

struct Transfer {
    string id;
    address from;
    address to;
    uint256 amount;

    uint64 block;
    address emitter;
    uint32 logIndex;
    bytes32 transactionHash;
    uint32 txIndex;
    uint32 timestamp;
}
```

1. 点击 `generate code` 按钮生成 `indexer.sol` 文件以及一些其他只读文件。此文件将是逻辑和转换所在的地方。
2. 将此内容复制粘贴到 `indexer.sol` 中，确保将您的代币地址插入到 `CAT_TESTNET_TOKEN_CONTRACT_ADDRESS` 变量中。
indexer.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./gen_schema.sol";
import "./gen_events.sol";
import "./gen_base.sol";
import "./gen_helpers.sol";

contract MyIndex is GhostGraph {
    using StringHelpers for EventDetails;
    using StringHelpers for uint256;
    using StringHelpers for address;

    address constant CAT_TESTNET_TOKEN_CONTRACT_ADDRESS = <插入您的代币地址>;

    function registerHandles() external {
        graph.registerHandle(CAT_TESTNET_TOKEN_CONTRACT_ADDRESS);
    }

    function onTransfer(EventDetails memory details, TransferEvent memory ev) external {
        // 获取全局状态以跟踪持有者数量
        Global memory global = graph.getGlobal("1");

        // 处理发送者余额
        if (ev.from != address(0)) {
            // 如果是铸造则跳过
            User memory sender = graph.getUser(ev.from);
            if (sender.balance == ev.value) {
                // 用户正在转账他们的全部余额
                global.totalHolders -= 1; // 减少持有者数量
            }
            sender.balance -= ev.value;
            graph.saveUser(sender);
        }

        // 处理接收者余额
        User memory receiver = graph.getUser(ev.to);
        if (receiver.balance == 0 && ev.value > 0) {
            // 新持有者
            global.totalHolders += 1; // 增加持有者数量
        }
        receiver.balance += ev.value;
        graph.saveUser(receiver);

        // 保存全局状态
        graph.saveGlobal(global);

        // 创建并保存转账记录
        Transfer memory transfer = graph.getTransfer(details.uniqueId());
        transfer.from = ev.from;
        transfer.to = ev.to;
        transfer.amount = ev.value;
        
        // 存储交易元数据
        transfer.block = details.block;
        transfer.emitter = details.emitter;
        transfer.logIndex = details.logIndex;
        transfer.transactionHash = details.transactionHash;
        transfer.txIndex = details.txIndex;
        transfer.timestamp = details.timestamp;
        
        graph.saveTransfer(transfer);
    }
}
```

1. 编译并部署您的 GhostGraph。几秒钟后，您应该看到 GhostGraph 已成功索引您的合约。
![ghostgraph 游乐场](https://docs.monad.xyz/assets/images/ghostgraph_playground-59cc4d3df1d49432301ac0761c7b659b.png)

1. 点击游乐场将带您到 GraphQL 游乐场，您可以在那里确保数据被正确索引。让我们将此内容复制粘贴到我们的游乐场中，并点击播放按钮从 GhostGraph 获取数据。
GraphQL 游乐场

```graphql
query FetchRecentTransfers {
  transfers(
    orderBy: "block", 
    orderDirection: "desc"
    limit: 50
  ) {
    items {
      amount
      block
      emitter
      from
      id
      logIndex
      timestamp
      to
      transactionHash
      txIndex
    }
  }
}
```

![graphql 游乐场](https://docs.monad.xyz/assets/images/graphql_playground-d1197eff8e49c2d20f9ca64296d39294.png)

提示：尝试再次运行转账脚本提交额外的交易。您应该看到 GhostGraph 自动索引新交易。

## 结论

您现在已经成功创建了一个 GhostGraph 来跟踪合约的链上数据。下一步是将其连接到您的前端。

Ghost 团队已经创建了端到端教程，介绍如何做到这一点，请点击[这里](https://docs.tryghost.xyz/blog/connect_ghost_graph_to_frontend/)