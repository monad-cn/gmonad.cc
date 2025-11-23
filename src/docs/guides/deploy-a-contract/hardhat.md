# Deploy a smart contract on Monad using Hardhat

[Hardhat](https://hardhat.org/docs) is a comprehensive development environment consisting of different components for editing, compiling, debugging, and deploying your smart contracts.

## Requirements

Before you begin, you need to install the following dependencies:

- Node.js v18.0.0 or later

⚠️If you are on Windows, we strongly recommend using [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about) when following this guide.



## Hardhat2

## 1. Create a new Hardhat project

You can use the `hardhat-monad` template to create a new project with Monad configuration already set up.

*[hardhat-monad](https://github.com/monad-developers/hardhat-monad) is a Hardhat template with Monad configuration.*

Clone the repository to your machine using the command below:

```sh
git clone https://github.com/monad-developers/hardhat-monad.git
cd hardhat-monad
```

## 2. Install dependencies

```sh
npm install
```

## 3. Create an .env file

```sh
cp .env.example .env
```

Edit the `.env` file with your private key:

```text
PRIVATE_KEY=your_private_key_here
```

⚠️Protect your private key carefully. Never commit it to version control, share it in public repositories, or expose it in client-side code. Your private key provides full access to your funds.

## 4. Deploy the smart contract

The following commands use [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview):

### Deploying to the local hardhat node

Run hardhat node by running:

```bash
npx hardhat node
```

To deploy the example contract to the local hardhat node, run the following command in a separate terminal:

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts
```

### Deploying to Monad Testnet

Ensure your private key is set in the `.env` file.

Deploy the contract to Monad Testnet:

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadTestnet
```

Redeploy the same code to a different address:

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadTestnet --reset
```

You can customize deployment parameters:

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadTestnet \
  --parameters '{"unlockTime": 1893456000, "lockedAmount": "1000000000000000"}'
```

### Deploying to Monad Mainnet

Ensure your private key is set in the `.env` file.

Deploy the contract to Monad Mainnet:

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadMainnet
```

Redeploy the same code to a different address:

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network monadMainnet --reset
```



## Hardhat3

## 1. Create a new Hardhat3 project

You can use the `hardhat3-monad` template to create a new project with Monad configuration already set up for Hardhat3.

*[hardhat3-monad](https://github.com/monad-developers/hardhat3-monad) is a Hardhat3 template with Monad configuration.*

To learn more about Hardhat3, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3).

Clone the repository to your machine using the command below:

```sh
git clone https://github.com/monad-developers/hardhat3-monad.git
cd hardhat3-monad
```

## 2. Install dependencies

```sh
npm install
```

## 3. Set up your private key

Hardhat3 uses Configuration Variables with the `hardhat-keystore` plugin for secure key management.

Set your private key using the keystore plugin:

```sh
npx hardhat keystore set PRIVATE_KEY
```

⚠️Protect your private key carefully. The `hardhat-keystore` plugin securely stores your key and prevents accidental exposure. Your private key provides full access to your funds.

## 4. Deploy the smart contract

The following commands use [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview):

### Deploying to a local chain

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts
```

### Deploying to Monad Testnet

Ensure your private key is set in the `.env` file.

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnet
```

### Deploying to Monad Mainnet

Ensure your private key is set in the `.env` file.

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet
```
