# How to build a basic dApp with Scaffold-ETH

URL: https://docs.monad.xyz/guides/scaffold-eth

In this guide, you will learn how to use Scaffold-ETH 2 to quickly build a new dapp project.

## Requirements

Before you begin, you need to install the following tools:

- Node (>= v18.18)
- Yarn (v1 or v2+)
- Git

### Get funds on Monad Testnet

You will need funds on Monad Testnet in order to deploy smart contracts, you can get funds from the [Monad Faucet](https://testnet.monad.xyz) .

## Working with Scaffold-ETH

Scaffold-ETH can have two different solidity development frameworks: Foundry and Hardhat.

In this guide you can choose between Foundry and Hardhat.

- Foundry
- Hardhat

### Clone the scaffold-monad-foundry repo

```sh
git clone https://github.com/monad-developers/scaffold-monad-foundry.git
```

### Open the project directory and install dependencies

```sh
cd scaffold-monad-foundry && yarn install
```

### Start your local blockchain node

```sh
yarn chain
```

### Deploy your smart contract to your local blockchain node

```sh
yarn deploy
```

This command deploys `YourContract.sol` to your local blockchain node. The contract is located in `packages/foundry/contracts` and can be modified to suit your needs.

The `yarn deploy` command uses the deploy script located in `packages/foundry/deploy` to deploy the contract to the network. You can also customize the deploy script.

### Start your NextJS app

```sh
yarn start
```

Visit your app on: `http://localhost:3000` .

You can interact with your smart contract using the Debug Contracts page. You can tweak the app config in `packages/nextjs/scaffold.config.ts` .

### Deploy your smart contract to Monad Testnet

```sh
yarn deploy --network monadTestnet
```

This command deploys `YourContract.sol` to Monad Testnet. The contract is located in `packages/foundry/contracts` and can be modified to suit your needs.

### Verify your smart contract on Monad Testnet

```sh
yarn verify --network monadTestnet
```

This command verifies `YourContract.sol` on Monad Testnet.

### Clone the scaffold-monad-hardhat repo

```sh
git clone https://github.com/monad-developers/scaffold-monad-hardhat.git
```

### Open the project directory and install dependencies

```sh
cd scaffold-monad-hardhat && yarn install
```

### Start your local blockchain node

```sh
yarn chain
```

### Deploy your smart contract to your local blockchain node

```sh
yarn deploy
```

This command deploys `YourContract.sol` to your local blockchain node. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs.

The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

### Start your NextJS app

```sh
yarn start
```

Visit your app on: `http://localhost:3000` .

You can interact with your smart contract using the Debug Contracts page. You can tweak the app config in `packages/nextjs/scaffold.config.ts` .

### Generate a deployer account

```sh
yarn generate
```

This command will create a new deployer account. **Remember the password you create** as you'll need it for deployments.

### Deploy your smart contract to Monad Testnet

```sh
yarn deploy --network monadTestnet
```

This command deploys `YourContract.sol` to Monad Testnet. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs.

### Verify your smart contract on Monad Testnet

```sh
yarn verify --network monadTestnet
```

This command verifies `YourContract.sol` on Monad Testnet.

## Next steps

- Explore the Debug Contracts page to interact with your deployed contract.
- Modify `YourContract.sol` to build your own functionality.
- Learn more about [Scaffold-ETH](https://docs.scaffoldeth.io/) .