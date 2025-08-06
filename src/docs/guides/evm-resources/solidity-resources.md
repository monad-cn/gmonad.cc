# Solidity 资源

Monad 与 EVM 字节码完全兼容，支持[上海升级](https://www.evm.codes/?fork=shanghai)后的所有操作码和预编译，Monad 还保留了标准的以太坊 JSON-RPC 接口。

因此，以太坊主网的大部分开发资源都适用于 Monad。

本章节为在以太坊上构建去中心化应用程序的开发者提供了一套最基础的资源。

由于 [Solidity](https://docs.soliditylang.org/en/v0.8.25/) 是以太坊智能合约最常用的语言，因此本章节的资源主要集中在 Solidity，包括部分 [Vyper](other-languages/vyper) 和[Huff](other-languages/huff) 的资源。请注意，由于智能合约是可组合的，最初用一种语言编写的合约仍可以调用另一种语言的合约。

### **集成开发环境（IDEs）**

* [Remix](https://remix.ethereum.org/#lang=en\&optimize=false\&runs=200\&evmVersion=null)：一款交互式 Solidity 集成开发环境，它是编码和编译 Solidity 智能合约最简单快捷的方式，无需安装其他工具。
* [VSCode](https://code.visualstudio.com/) + [Solidity extension](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity)

### **Solidity 入门教程**

* [CryptoZombies](https://cryptozombies.io/en/course)：在 EVM 上构建去中心化应用程序的最佳学习教程。它为任何人提供了资源和课程，适用于从零代码编写经验，到希望探索区块链深度开发的所有人员。
* [Solidity by Example](https://solidity-by-example.org/)：通过简单的开发示例，循序渐进地介绍相关概念，最适合已有其他语言开发基础经验的人员阅读。
* [Blockchain Basics course by Cyfrin Updraft](https://updraft.cyfrin.io/courses/blockchain-basics)：区块链基础知识课程，内容包括区块链、DeFi 和智能合约的基础知识。
* [Solidity Smart Contract Development by Cyfrin Updraft](https://updraft.cyfrin.io/courses/solidity)：智能合约开发课程，开发人员可以通过此课程学习构建项目，以获得项目开发实践经验。
* [Ethereum Developer Degree by LearnWeb3](https://learnweb3.io/degrees/ethereum-developer-degree/)：适用于没有 Web3 开发背景的开发者构架 Web3 应用程序，课程提供了 Web3 开发领域关键协议、框架和概念的案例学习。

### **Solidity 中级教程**

* [Solidity Language](https://docs.soliditylang.org/en/v0.8.21/introduction-to-smart-contracts.html)：围绕 EVM 环境，对智能合约和区块链基础知识进行了详细阐述。除了 Solidity Language 文档外，它还涵盖了在 EVM 上编译代码、部署合约的基础知识，以及提供了在 EVM 上部署合约的相关基本组件。
* [Solidity Patterns](https://github.com/fravoll/solidity-patterns)：提供了代码模板库及其用法说明。
* [Uniswap V2](https://github.com/Uniswap/v2-core)：一个专业而易于理解的智能合约，它提供了一个正在运行中的 Solidity dApp 的全局视图，该合约的演示在[此处](https://ethereum.org/en/developers/tutorials/uniswap-v2-annotated-code/)。
* [Cookbook.dev](https://www.cookbook.dev/search?q=cookbook\&categories=Libraries)：提供了一套交互式合约模板示例，具有实时编译、一键部署和人工智能聊天集成功能，可帮助解决代码问题。
* [OpenZeppelin](https://www.openzeppelin.com/contracts)：为 ERC20、ERC712 和 ERC1155 等常见的以太坊代币部署提供了可定制的合约模板。请注意，它们没有进行 Gas 优化。
* [Rareskills Blog](https://www.rareskills.io/category/solidity)：一系列关于 Solidity 中各种概念的精彩深入的文章合集。
* [Foundry Fundamentals course by Cyfrin Updraft](https://updraft.cyfrin.io/courses/foundry)：一门全面的 Web3 开发课程，旨在向开发者介绍 Foundry，这是构建、部署和测试智能合约的行业标准框架。
* [Smart Contract Programmer YT channel](https://www.youtube.com/@smartcontractprogrammer)：一系列关于各种 Solidity 概念的视频合集，如 ABI 编码、EVM 内存等。

### **Solidity 高级教程**

* [Solmate](https://github.com/transmissions11/solmate) 和 [Solady](https://github.com/Vectorized/solady/tree/main) 资源库：利用 Solidity 或 Yul 提供 Gas 优化合约。
* [Yul](https://docs.soliditylang.org/en/latest/yul.html)：Solidity 的一种中间语言，一般可视为 EVM 的内联汇编。它并不完全是纯粹的汇编语言，它提供控制流结构并抽象出堆栈的内部工作，同时仍向开发人员提供原始内存后台。Yul 主要面向需要接触 EVM 原始内存后台的开发人员，以构建高性能、Gas 优化的 EVM 合约代码。
* [Huff](https://docs.huff.sh/get-started/overview/)：最接近于 EVM 的汇编语言，与 Yul 不同，Huff 不提供控制流结构，也不抽象程序堆栈的内部工作。只有对性能最敏感的应用程序才会使用 Huff，但它是学习 EVM 诠释最底层指令的绝佳教学工具。
* [Advanced Foundry course by Cyfrin Updraft](https://updraft.cyfrin.io/courses/advanced-foundry)：介绍 Foundry，以及如何开发 DeFi 协议和稳定币，如何开发 DAO，高级智能合约开发，高级智能合约测试、模糊测试以及手动验证。
* [Smart Contract Security course by Cyfrin Updraft](https://updraft.cyfrin.io/courses/security)：审计和编写安全协议所需的一切知识。
* [Assembly and Formal Verification course by Cyfrin Updraft](https://updraft.cyfrin.io/courses/formal-verification)：介绍 Assembly，以及使用 Huff 和 Yul 编写智能合约，介绍以太坊虚拟机 OPCode、Formal 验证测试、智能合约不变性测试以及 Halmos、Certora、Kontrol 等工具的使用。
* [Smart Contract DevOps course by Cyfrin Updraft](https://updraft.cyfrin.io/courses/wallets)：介绍使用钱包时的访问控制最佳实践，合约部署后的安全保障、智能合约和 Web3 DevOps 以及实时协议的维护和监控。
* [Secureum YT Channel](https://www.youtube.com/@SecureumVideos/videos)：一系列关于 Solidity 的视频合集，介绍从 Solidity 基础学习到模糊测试和 Solidity 审计等高级概念。

### &#x20;Solidity 游戏化教程

* [Ethernaut](https://ethernaut.openzeppelin.com/)：通过解谜学习 Solidity
* [Damn Vulnerable DeFi](https://www.damnvulnerabledefi.xyz/)：一系列智能合约的漏洞挑战游戏，由易受攻击的合约组成，开发者可以尝试寻找漏洞并破解合约。漏洞挑战是练习和获得 Solidity 开发技能的绝佳方法。

### **最佳实践/模式**

* [DeFi 开发者路线图](https://github.com/OffcierCia/DeFi-Developer-Road-Map)
* [Gas 优化技能书](https://www.rareskills.io/post/gas-optimization)

### **测试**

* [Echidna](https://github.com/crytic/echidna)：模糊测试
* [Slither](https://github.com/crytic/slither)：用于漏洞检测的静态分析
* [solidity-coverage](https://github.com/sc-forks/solidity-coverage/tree/master)：测试 Solidity 代码覆盖率

### **智能合约存档**

* [Smart contract sanctuary](https://github.com/tintinweb/smart-contract-sanctuary)：在以太坊上验证智能合约
* [EVM 函数签名数据库](https://www.4byte.directory/)
