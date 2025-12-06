# Solidity 资源

URL: https://docs.monad.xyz/guides/evm-resources/solidity-resources

Monad 完全兼容 EVM 字节码，支持截至 [Cancun 分叉](https://www.evm.codes/?fork=cancun) 的所有操作码和预编译合约。Monad 还保留了标准的以太坊 JSON-RPC 接口。

因此，大多数以太坊主网的开发资源同样适用于 Monad 上的开发。

本页面建议了一套用于构建以太坊去中心化应用的**基本**资源。子页面提供了额外的详细信息或选择。

由于 [Solidity](https://docs.soliditylang.org/) 是以太坊智能合约最流行的语言，本页面的资源主要关注 Solidity；或者查看关于 [Vyper](/guides/evm-resources/other-languages/vyper) 或 [Huff](/guides/evm-resources/other-languages/huff) 的资源。请注意，由于智能合约是可组合的，最初用一种语言编写的合约仍然可以调用用另一种语言编写的合约。

## **IDE**

- [Remix](https://remix.ethereum.org/#lang=en&optimize=false&runs=200&evmVersion=null) 是一个交互式 Solidity IDE。它是开始编码和编译 Solidity 智能合约最简单、最快速的方式，无需安装额外工具。
- [VSCode](https://code.visualstudio.com/) + [Solidity 扩展](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity)

## **基础 Solidity**

- [CryptoZombies](https://cryptozombies.io/en/course) 是构建 EVM 上 dApps 的优秀端到端入门教程。它为从未编程过的人到希望探索区块链开发的其他学科经验丰富的开发者提供资源和课程。
- [Solidity by Example](https://solidity-by-example.org/) 通过简单示例逐步介绍概念；最适合已有其他语言基础经验的开发者。
- [Cyfrin Updraft 区块链基础课程](https://updraft.cyfrin.io/courses/blockchain-basics) 教授区块链、DeFi 和智能合约的基础知识。
- [Cyfrin Updraft Solidity 智能合约开发](https://updraft.cyfrin.io/courses/solidity) 将教你如何成为智能合约开发者。通过项目学习构建并获得实践经验。
- [LearnWeb3 以太坊开发者学位](https://learnweb3.io/degrees/ethereum-developer-degree/) 是一个很好的课程，可以从没有 web3 背景知识开始，到能够构建多个应用程序并理解 web3 领域的几个关键协议、框架和概念。

## **中级 Solidity**

- [Solidity 语言](https://docs.soliditylang.org/en/v0.8.21/introduction-to-smart-contracts.html) 官方文档是以 EVM 环境为中心的智能合约和区块链基础的端到端描述。除了 Solidity 语言文档外，还涵盖了为在 EVM 上部署编译代码的基础知识以及在 EVM 上部署智能合约相关的基本组件。
- [Solidity 模式](https://github.com/fravoll/solidity-patterns) 仓库提供了代码模板库和使用说明。
- [Uniswap V2](https://github.com/Uniswap/v2-core) 合约是一个专业但易于理解的智能合约，提供了生产环境中 Solidity dApp 的绝佳概览。合约的指导性演练可以在[这里](https://ethereum.org/en/developers/tutorials/uniswap-v2-annotated-code/)找到。
- [Cookbook.dev](https://www.cookbook.dev/search?q=cookbook&categories=Contracts&sort=popular&filter=&page=1) 提供了一套交互式示例模板合约，具有实时编辑、一键部署和 AI 聊天集成，可帮助解决代码问题。
- [OpenZeppelin](https://www.openzeppelin.com/contracts) 为常见的以太坊代币部署（如 ERC20、ERC712 和 ERC1155）提供可定制的模板合约库。注意，它们没有进行 gas 优化。
- [Rareskills 博客](https://www.rareskills.io/category/solidity) 有一些关于 Solidity 各种概念的优秀深度文章。
- [Cyfrin Updraft Foundry 基础课程](https://updraft.cyfrin.io/courses/foundry) 是一个全面的 web3 开发课程，旨在教你 Foundry 这个行业标准框架，用于构建、部署和测试你的智能合约。
- [Smart Contract Programmer YT 频道](https://www.youtube.com/@smartcontractprogrammer) 有很多关于各种 Solidity 概念的深度视频，如 ABI 编码、EVM 内存等。

## **高级 Solidity**

- [Solmate 仓库](https://github.com/transmissions11/solmate) 和 [Solady 仓库](https://github.com/Vectorized/solady/tree/main) 提供使用 Solidity 或 Yul 的 gas 优化合约。
- [Yul](https://docs.soliditylang.org/en/latest/yul.html) 是 Solidity 的中间语言，通常可以被认为是 EVM 的内联汇编。它不是纯汇编，提供控制流构造并抽象出栈的内部工作，同时仍然向开发者暴露原始内存后端。Yul 针对需要访问 EVM 原始内存后端以构建高性能 gas 优化 EVM 代码的开发者。
- [Huff](https://docs.huff.sh/get-started/overview/) 最贴切地描述为 EVM 汇编。与 Yul 不同，Huff 不提供控制流构造或抽象出程序栈的内部工作。只有最注重性能的应用才会利用 Huff，但它是学习 EVM 如何在最低级别解释指令的绝佳教育工具。
- [Cyfrin Updraft 高级 Foundry 课程](https://updraft.cyfrin.io/courses/advanced-foundry) 教你关于 Foundry、如何开发 DeFi 协议和稳定币、如何开发 DAO、高级智能合约开发、高级智能合约测试和模糊测试以及手动验证。
- [Cyfrin Updraft 智能合约安全课程](https://updraft.cyfrin.io/courses/security) 将教你开始审计和编写安全协议所需了解的一切。
- [Cyfrin Updraft 汇编和形式验证课程](https://updraft.cyfrin.io/courses/formal-verification) 教你汇编、使用 Huff 和 Yul 编写智能合约、以太坊虚拟机操作码、形式验证测试、智能合约不变量测试和 Halmos、Certora、Kontrol 等工具。
- [Cyfrin Updraft 智能合约 DevOps 课程](https://updraft.cyfrin.io/courses/wallets) 教授使用钱包时的访问控制最佳实践、部署后安全、智能合约和 web3 DevOps 以及实时协议维护和监控。
- [Secureum YT 频道](https://www.youtube.com/@SecureumVideos/videos) 有很多关于 Solidity 的视频，从 Solidity 基础一直到模糊测试和 Solidity 审计等高级概念。

## 教程

- [Ethernaut](https://ethernaut.openzeppelin.com/)：通过解决谜题学习
- [Damn Vulnerable DeFi](https://www.damnvulnerabledefi.xyz)：DVD 是一系列智能合约挑战，包含有漏洞的合约，你应该能够破解它。这些挑战是练习和应用你已掌握的 Solidity 技能的好方法。

## 最佳实践/模式

- [DeFi 开发者路线图](https://github.com/OffcierCia/DeFi-Developer-Road-Map)
- [RareSkills Gas 优化手册](https://www.rareskills.io/post/gas-optimization)

## 测试

- [Echidna](https://github.com/crytic/echidna)：模糊测试
- [Slither](https://github.com/crytic/slither)：漏洞检测静态分析
- [solidity-coverage](https://github.com/sc-forks/solidity-coverage/tree/master)：Solidity 测试代码覆盖率

## 智能合约存档

- [智能合约保护区](https://github.com/tintinweb/smart-contract-sanctuary) - 在 Etherscan 上验证的合约
- [EVM 函数签名数据库](https://www.4byte.directory/)