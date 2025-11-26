# 使用 Remix 在 Monad 上部署智能合约

[Remix IDE](https://remix.ethereum.org/) 是一个基于浏览器的 IDE，可供各个知识级别的用户在整个智能合约开发过程中使用。它不需要任何设置，促进快速开发周期，并具有丰富的插件集和直观的 GUI。

在本指南中，您将学习如何使用 [Remix IDE](https://remix.ethereum.org/) 在 Monad 测试网上部署并与简单的问候智能合约进行交互。

## 环境要求

- 您需要在您的钱包中添加 Monad 测试网网络。

## 部署智能合约

在浏览器中访问 [Remix IDE](https://remix.ethereum.org/)。点击 'Start Coding' 创建新的项目模板。

![remix-ide](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/1-c5a764292444f02317f168bdcdf54f85.png)

确保选中 'contracts' 文件夹，然后使用左上角的 "Create new file" 按钮创建新文件。

![create-file](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/2-b5960cf3275f124588549ddde07daa97.png)

将新文件命名为 "Gmonad.sol" 并添加以下代码：

Gmonad.solsrc

```solidity
// SPDX-License-Identifier: MIT


// Make sure the compiler version is below 0.8.24 since Cancun compiler is not supported just yet
pragma solidity >=0.8.0 <=0.8.24;


contract Gmonad { 
    string public greeting;


    constructor(string memory _greeting) {
        greeting = _greeting;
    }


    function setGreeting(string calldata _greeting) external {
        greeting = _greeting;
    }
}
```



**注意：** 您可能会在 `pragma solidity...` 行下面看到一条红色波浪线；这是因为默认的编译器版本超出了合约中指定的范围。我们将在下一步中修复这个问题。

![code](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/3-80dd9f1634900817cf36436fb5a360c9.png)

现在让我们编译智能合约。点击最左侧的 "Solidity compiler" 选项卡进入编译器视图。然后选择正确的编译器版本（0.8.24）。

![compiler](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/4-7a157eb86687dbb12f0b3cfe5cb2790b.png)

一旦您选择了正确的编译器版本，请点击 "Compile Gmonad.sol" 按钮。如果成功，您将在 "Solidity compiler" 选项卡图标上看到绿色的对勾标记。

![compile](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/5-9668d10462990c4133ed1cfb4759357c.png)

现在我们可以部署智能合约了！使用最左侧的 "Deploy & run transactions" 选项卡进入部署视图。

![deploy](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/6-3bac983992d827ff1d12d96a017aeb16.png)

使用 "Environment" 下拉菜单，选择 "Injected Provider" 连接到您的钱包。

下面的截图显示 "Injected Provider - Metamask"；如果您使用非 Metamask 的其他钱包，您可能会看到相应的选项。

![environment](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/7-a85cdecb9808c94f5b90c10259447046.png)

您的钱包应该会弹出请求连接到 Remix 的权限，点击 "Connect"。

![connect](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/8-270ef6ad5af641844c496ab927c290e9.png)

连接后，您应该能够在 "Account" 下拉菜单中看到您的地址和余额。

请确保您也在 "Environment" 下拉菜单下看到正确的链 ID。

现在让我们部署合约。`Gmonad.sol` 需要在部署之前将问候消息传递给构造函数；选择您喜欢的问候消息（在本例中是 "gmonad"）。

现在您可以通过点击 "Deploy" 按钮来部署智能合约。

![deploy](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/9-5e9c8c1fa29b438be7af94b79054b6a6.png)

您应该会看到钱包弹窗请求确认部署智能合约。点击 "Confirm"。

![confirm](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/10-b1edb0b5c3ecc1e74885fce0aacb3743.png)

交易确认后，您将在左下角的 "Deployed Contracts" 部分中看到智能合约地址。

![deployed](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/11-b29107fd4b4cb630edadb2eaf2029c22.png)

## 与智能合约交互

您可以展开智能合约以查看可用的函数。

在那里您将找到一个 `greeting` 按钮，可以用来读取存储在智能合约中的当前问候消息。

点击 "greeting" 按钮调用 `greeting()` 方法（输出当前的问候消息）。您需要点击终端输出中的展开箭头以查看解码后的输出。

信息

这个 "greeting" 按钮是为智能合约中的 *公开* `greeting` 状态变量自动创建的 getter 函数。

![expand](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/12-ebe7dd366f15645efac5aa0ebbb8b4bf.png)

您可以使用 `setGreeting` 函数更改问候消息。

在本例中，我们将问候消息更改为 "gmonad molandak"。

再次点击 "transact" 按钮启动交易。

您应该会看到钱包弹窗请求确认更改问候消息。点击 "Confirm"。

![transact](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/13-e1b2207f7175c30e8912792404fc4b6a.png)

交易确认后，您可以使用 `greeting` 按钮查看更新后的问候消息。

![updated](https://docs.monad.xyzhttps://docs.monad.xyz/assets/images/14-66f39a1e1f3eb3ee5df2457c08dbc43b.png)

恭喜您！您已成功使用 Remix IDE 在 Monad 测试网上部署并与智能合约进行交互。
