# EVM 行为

URL: https://docs.monad.xyz/guides/evm-resources/evm-behavior

## EVM 行为规范

- [EVM 注释](https://github.com/CoinCulture/evm-tools/blob/master/analysis/guide.md)：EVM 的直接技术规范以及一些行为示例
- [EVM：从 Solidity 到字节码、内存和存储](https://www.youtube.com/watch?v=RxL_1AfV7N4)：Peter Robinson 和 David Hyland-Wood 的 90 分钟讲座
- [EVM 图解](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)：一套优秀的图表，用于确认你的心理模型
- [EVM 深度解析：通往影子超级程序员的道路](https://noxx.substack.com/p/evm-deep-dives-the-path-to-shadowy)

## 操作码参考

注意提示  
Monad 上的操作码定价已更改，以反映其在执行中的相对成本，在[此处](/developer-essentials/opcode-pricing)了解更多信息

[evm.codes](https://www.evm.codes/)：操作码参考和用于逐步执行字节码的交互式沙盒

## Solidity 存储布局

EVM 允许智能合约将数据存储在 32 字节字（"存储插槽"）中，但是复杂数据结构（如列表或映射）的详细信息留给高级语言作为实现细节。Solidity 有一种将变量分配给存储插槽的特定方式，如下所述：

- [存储布局官方文档](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html)
- [Solidity 中的存储模式](https://programtheblockchain.com/posts/2018/03/09/understanding-ethereum-smart-contract-storage/)