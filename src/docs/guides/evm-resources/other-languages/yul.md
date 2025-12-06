# Yul

[Yul](https://docs.soliditylang.org/en/latest/yul.html) 是 Solidity 的中间语言，通常可以被认为是 EVM 的内联汇编。它不是纯汇编，提供控制流构造并抽象出栈的内部工作，同时仍然向开发者暴露原始内存后端。Yul 针对需要访问 EVM 原始内存后端以构建高性能 gas 优化 EVM 代码的开发者。