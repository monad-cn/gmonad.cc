# EVM Behavior

### **EVM** B**ehavior 规范**

* [关于EVM的说明](https://github.com/CoinCulture/evm-tools/blob/master/analysis/guide.md)：EVM 的直接技术规范和一些 behavior 示例
* [EVM：从Solidity到字节码、内存和存储](https://www.youtube.com/watch?v=RxL_1AfV7N4): Peter Robinson 和 David Hyland-Wood 90 分钟的讲座
* [EVM图解](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)：一套用于衡量开发者心智水平的出色图表
* [EVM深度挖掘：通往隐形超级编码器之路](https://noxx.substack.com/p/evm-deep-dives-the-path-to-shadowy)

### **操作码参考**

[evm.codes](https://www.evm.codes/)：操作码参考（包括 Gas 成本）和用于单步执行字节码的交互式沙盒

### **Solidity 存储布局**

EVM 允许智能合约将数据存储在 32 字节的单词（"存储槽"）中，但复杂数据结构（如列表或映射）则留给更高级的语言来处理，Solidity 有一种将变量分配到存储槽的特定方法，如下所述：

* [关于存储布局的官方文件](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html)
* [Solidity中的存储模式](https://programtheblockchain.com/posts/2018/03/09/understanding-ethereum-smart-contract-storage/)
