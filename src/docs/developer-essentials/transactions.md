# 交易

## 概述

- 与以太坊使用相同的地址空间和交易格式/字段，因此支持相同的钱包软件。
- 目前支持交易类型 0（"legacy"）、1（"EIP-2930"）、2（"EIP-1559"）和 4（"EIP-7702"）。
- 协议层面允许 [EIP-155](https://eips.ethereum.org/EIPS/eip-155) 之前的交易，这与以太坊和许多其他 EVM 兼容区块链一致。因此，不建议用户使用之前发送过 EIP-155 之前交易的以太坊地址。

## 地址空间

与以太坊使用相同的地址空间（ECDSA 公钥的最后 20 字节）

## 交易格式

[与以太坊相同](https://ethereum.org/en/developers/docs/transactions/)。Monad 交易使用 [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718) 中引入的相同类型化交易封装，采用 [RLP](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/) 编码。

## 交易类型

支持以下[交易类型](https://ethereum.org/en/developers/docs/transactions/#typed-transaction-envelope)：

- Type 0（"legacy"）
- Type 1（["EIP-2930"](https://eips.ethereum.org/EIPS/eip-2930)）
- Type 2（["EIP-1559"](https://eips.ethereum.org/EIPS/eip-1559)；以太坊中的默认类型）
- Type 4（["EIP-7702"](https://eips.ethereum.org/EIPS/eip-7702)）（参见 [Monad 上的 EIP-7702](https://docs.monad.xyz/developer-essentials/eip-7702)）

不支持以下类型：

- Type 3（"EIP-4844"）

## 访问列表

支持访问列表（[EIP-2930](https://eips.ethereum.org/EIPS/eip-2930)）但不是必需的。

## 不包含 chain_id 的交易

[EIP-155](https://eips.ethereum.org/EIPS/eip-155) 引入了包含链 ID 的交易标准，以防止一个区块链上的交易在另一个区块链上被重放。

Monad 上的交易应始终设置链 ID，除了一个非常特殊的情况：

注意

**特殊情况：** 一些标准智能合约（如 ERC-1820）使用无密钥部署方法（也称为 Nick 方法），利用可重放性，如[此处](https://eips.ethereum.org/EIPS/eip-1820#deployment-method)所述。在此方法中，交易在以太坊上提交，但旨在在其他链上重放，以便在其他区块链上以相同地址部署合约。

为了支持此用例，Monad 在协议层面（即根据共识规则）仍然允许 EIP-155 之前的交易。这使 Monad 与包括以太坊在内的大多数区块链保持一致。（试图在协议层面禁止 EIP-155 之前交易的区块链通常最终会改变方向，例如 [Celo](https://github.com/celo-org/celo-blockchain/issues/1734)。）

然而，因此请注意以下警告：

警告

由于允许重放 EIP-155 之前的交易，不建议向之前发送过 EIP-155 之前交易的以太坊地址发送资金。