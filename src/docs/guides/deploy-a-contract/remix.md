# Deploy a smart contract on Monad using Remix

[Remix IDE](https://remix.ethereum.org/) is a browser-based IDE that can be used for the entire journey of smart contract development by users at every knowledge level. It requires no setup, fosters a fast development cycle, and has a rich set of plugins with intuitive GUIs.

In this guide you will learn how to deploy and interact with a simple Greeting smart contract on Monad Testnet using [Remix IDE](https://remix.ethereum.org/).

## Requirements

- You need to have the Monad Testnet network added to your wallet.

## Deploying the smart contract

Head over to [Remix IDE](https://remix.ethereum.org/) in your browser. Click 'Start Coding' to create a new project template.

![remix-ide](https://docs.monad.xyz/assets/images/1-c5a764292444f02317f168bdcdf54f85.png)

Make sure the 'contracts' folder is selected, then create a new file using the "Create new file" button on top left corner.

![create-file](https://docs.monad.xyz/assets/images/2-b5960cf3275f124588549ddde07daa97.png)

Name the new file "Gmonad.sol" and add the following code to it

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



**Note:** You may see a red squiggly line underneath the `pragma solidity...` line; this is because the default compiler version is outside of the range specified in the contract. We'll fix that in the next step.

![code](https://docs.monad.xyz/assets/images/3-80dd9f1634900817cf36436fb5a360c9.png)

Let's compile the smart contract. Navigate to the compiler view by clicking the "Solidity compiler" tab on the far left. Then select the right compiler version (0.8.24).

![compiler](https://docs.monad.xyz/assets/images/4-7a157eb86687dbb12f0b3cfe5cb2790b.png)

Once you have the right compiler version selected, click on the "Compile Gmonad.sol" button. If succesful, you will see a green check mark on the "Solidity compiler" tab icon.

![compile](https://docs.monad.xyz/assets/images/5-9668d10462990c4133ed1cfb4759357c.png)

Now we can deploy the smart contract! Navigate to the deploy view using the "Deploy & run transactions" tab on the far left.

![deploy](https://docs.monad.xyz/assets/images/6-3bac983992d827ff1d12d96a017aeb16.png)

Using the "Environment" dropdown, select "Injected Provider" to connect to your wallet.

The screenshot below says "Injected Provider - Metamask"; in case you are using some wallet other than Metamask you may see an appropriate option.

![environment](https://docs.monad.xyz/assets/images/7-a85cdecb9808c94f5b90c10259447046.png)

Your wallet should pop up asking for permission to connect to Remix, click "Connect".

![connect](https://docs.monad.xyz/assets/images/8-270ef6ad5af641844c496ab927c290e9.png)

Once connected you should be able to see your address with your balance in the "Account" dropdown.

Make sure you also see the correct chain id under the "Environment" dropdown.

Now let's deploy the contract. `Gmonad.sol` requires a greeting message to be passed to the constructor before it can be deployed; choose the greeting message of your choice (in this example it is "gmonad").

Now you can deploy the smart contract by clicking the "Deploy" button.

![deploy](https://docs.monad.xyz/assets/images/9-5e9c8c1fa29b438be7af94b79054b6a6.png)

You should see a wallet popup asking for confirmation to deploy the smart contract. Click "Confirm".

![confirm](https://docs.monad.xyz/assets/images/10-b1edb0b5c3ecc1e74885fce0aacb3743.png)

Once the transaction is confirmed you will see the smart contract address in the "Deployed Contracts" section on the bottom left.

![deployed](https://docs.monad.xyz/assets/images/11-b29107fd4b4cb630edadb2eaf2029c22.png)

## Interacting with the smart contract

You can expand the smart contract to see the functions available.

There you will find a `greeting` button which can be used to read the current greeting message stored in the smart contract.

Click the "greeting" button to call the `greeting()` method (which outputs the current greeting message). You'll need to click the expand arrow in the terminal output to see the decoded output.

info

This "greeting" button is a getter function which is automatically created for the *public* `greeting` state variable in the smart contract.

![expand](https://docs.monad.xyz/assets/images/12-ebe7dd366f15645efac5aa0ebbb8b4bf.png)

You can change the greeting message by using the `setGreeting` function.

In this example, we will change the greeting message to "gmonad molandak".

Once again, click the "transact" button to initiate the transaction.

You should see a wallet popup asking for confirmation to change the greeting message. Click "Confirm".

![transact](https://docs.monad.xyz/assets/images/13-e1b2207f7175c30e8912792404fc4b6a.png)

Once the transaction is confirmed you can view the updated greeting message using the `greeting` button.

![updated](https://docs.monad.xyz/assets/images/14-66f39a1e1f3eb3ee5df2457c08dbc43b.png)

Congratulations! You have successfully deployed and interacted with a smart contract on Monad Testnet using Remix IDE.
