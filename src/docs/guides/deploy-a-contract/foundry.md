# Deploy a smart contract on Monad using Foundry

[Foundry](https://book.getfoundry.sh/) is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.

## Requirements

Before you begin, you need to install the following tools:

- [Rust](https://www.rust-lang.org/)

## 1. Installing `foundryup`

Foundryup is the official installer for the Foundry toolchain.

```sh
curl -L https://foundry.paradigm.xyz | bash
```



This will install Foundryup. Simply follow the on-screen instructions, and the `foundryup` command will become available in your CLI.

## 2. Installing `forge`, `cast`, `anvil` and `chisel` binaries

```sh
foundryup
```



note

If you're on Windows, you'll need to use WSL, since Foundry currently doesn't work natively on Windows. Please follow [this link](https://learn.microsoft.com/en-us/windows/wsl/install) to learn more about WSL.

## 3. Create a new foundry project

tip

You can use `foundry-monad` template to create a new project.

*[Foundry-Monad](https://github.com/monad-developers/foundry-monad) is a Foundry template with Monad configuration.*

The below command uses `foundry-monad` to create a new foundry project:

```sh
forge init --template monad-developers/foundry-monad [project_name]
```



Alternatively, you can create a foundry project using the command below:

```sh
forge init [project_name]
```



## 4. Modify Foundry configuration

Update the `foundry.toml` file to add Monad Testnet configuration.

foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
# Monad Testnet Configuration
eth-rpc-url="https://testnet-rpc.monad.xyz"
chain_id = 10143
```



## 5. Write a smart contract

You can write your smart contracts under the `src` folder. There is already a `Counter` contract in the project located at `src/Counter.sol`.

Counter.solsrc

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


contract Counter {
    uint256 public number;


    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }


    function increment() public {
        number++;
    }
}
```



## 6. Compile the smart contract

```sh
forge compile
```



Compilation process output can be found in the newly created `out` directory, which includes contract ABI and bytecode.

## 7. Deploy the smart contract

⚠️For deploying contracts, we recommend using keystores instead of private keys.

### Get testnet funds

Deploying smart contracts requires testnet funds. Claim testnet funds via a [faucet](https://testnet.monad.xyz/).

### Deploy smart contract

Using a keystore is much safer than using a private key because keystore encrypts the private key and can later be referenced in any commands that require a private key.

Create a new keystore by importing a newly generated private key with the command below.

```sh
cast wallet import monad-deployer --private-key $(cast wallet new | grep 'Private key:' | awk '{print $3}')
```



Here is what the command above does, step by step:

- Generates a new private key
- Imports the private key into a keystore file named `monad-deployer`
- Prints the address of the newly created wallet to the console

After creating the keystore, you can read its address using:

```sh
cast wallet address --account monad-deployer
```



Provide a password to encrypt the keystore file when prompted and do not forget it.

Run the below command to deploy your smart contracts

```sh
forge create src/Counter.sol:Counter --account monad-deployer --broadcast
```



On successful deployment of the smart contract, the output should be similar to the following:

```sh
[⠊] Compiling...
Deployer: 0xB1aB62fdFC104512F594fCa0EF6ddd93FcEAF67b
Deployed to: 0x67329e4dc233512f06c16cF362EC3D44Cdc800e0
Transaction hash: 0xa0a40c299170c9077d321a93ec20c71e91b8aff54dd9fa33f08d6b61f8953ee0
```
