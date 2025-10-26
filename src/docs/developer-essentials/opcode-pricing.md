# 操作码定价

## 概述

Monad 是一个高度优化的系统，在计算、状态访问和带宽利用率等各个维度都引入了效率提升。然而，相对于传统 EVM 系统的倍数增益在各个维度上并不相等。因此，需要对某些操作码的 gas 价格进行调整，以便应用程序能够充分释放链的潜力。

为了最小化 gas 价格变化的数量，Monad 不是将几乎所有操作码的 gas 定价向下调整，而是将少数操作码的价格向上调整。这与对几乎所有操作码进行折扣具有相同的相对效果。

以下成本发生了变化：

- [状态冷访问](https://docs.monad.xyz/developer-essentials/opcode-pricing#cold-access-cost)
- [少数预编译合约](https://docs.monad.xyz/developer-essentials/opcode-pricing#precompiles)

所有其他成本与以太坊相同；[evm.codes](https://www.evm.codes/) 是一个有用的参考。

注意

这些变化在 [Monad 初始规范提案](https://category-labs.github.io/category-research/monad-initial-spec-proposal.pdf) 中有正式说明

## 为什么需要变化？

EVM 当前的定价模型需要适应以支持高性能、低费用的体系。定价模型根据对系统的感知成本为每个操作码分配权重（gas 数量），然后仅根据计算出的权重总和向用户收费。随着资源稀缺性的变化——特别是在全新系统的情况下——这些权重必须被修订。

本页面描述的变化对 Monad 提供高性能和低费用所需的最小调整集，同时最小化对用户的干扰并保护系统免受 DOS 攻击。

## 冷访问成本

为了说明 Monad 执行客户端中从磁盘进行状态读取相对于计算的较高成本，"冷"账户和存储访问成本发生了变化：

| 访问类型 | 以太坊 | Monad |
| -------- | ------ | ----- |
| 账户     | 2600   | 10100 |
| 存储     | 2100   | 8100  |

由于 gas 成本差异，以下操作码受到影响：

- 账户访问：`BALANCE`、`EXTCODESIZE`、`EXTCODECOPY`、`EXTCODEHASH`、`CALL`、`CALLCODE`、`DELEGATECALL`、`STATICCALL`、`SELFDESTRUCT`
- 存储访问：`SLOAD`、`SSTORE`

注意

Monad 上的热账户访问（100 gas）和存储访问（100 gas）的 gas 成本与以太坊相同。

## 预编译合约

少数预编译合约已重新定价，以准确反映其在执行中的相对成本。

| 预编译合约   | 地址   | 以太坊          | Monad           | 倍数 |
| ------------ | ------ | --------------- | --------------- | ---- |
| `ecRecover`  | `0x01` | 3000            | 6000            | 2    |
| `ecAdd`      | `0x06` | 150*            | 300*            | 2    |
| `ecMul`      | `0x07` | 6000*           | 30,000*         | 5    |
| `ecPairing`  | `0x08` | 45,000*         | 225,000*        | 5    |
| `blake2f`    | `0x09` | rounds∗1rounds∗1 | rounds∗2rounds∗2 | 2    |
| `point eval` | `0x0a` | 50,000          | 200,000         | 4    |

∗：按输入/操作计算，如相应预编译合约规范中定义