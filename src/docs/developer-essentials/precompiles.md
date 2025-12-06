# 预编译合约

支持截至 Pectra 分叉的所有以太坊预编译合约（`0x01` 到 `0x11`），以及预编译合约 `0x0100`（[RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md)；`secp256r1` 又名 P256 的签名验证）。

一些外部参考资料很有帮助：

- 关于 `0x01` 到 `0x0a`，参见 [evm.codes](https://www.evm.codes/precompiled)
- 关于 `0x0b` 到 `0x11`（BLS12-381 工具），参见 [EIP-2537](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2537.md)
- 关于 `0x0100`（secp256r1/P256 签名验证），参见 [RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md)

| 地址     | 名称                  | Gas 费用                                                     | 备注                                                         |
| -------- | --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `0x01`   | `ecRecover`           | `6000`                                                       | ECDSA 公钥恢复函数                                           |
| `0x02`   | `sha256`              | `60 + 12 * word_size`                                        | 哈希函数                                                     |
| `0x03`   | `ripemd160`           | `600 + 120 * word_size`                                      | 哈希函数                                                     |
| `0x04`   | `identity`            | `15 + 3 * word_size`                                         | 返回输入                                                     |
| `0x05`   | `modexp`              | 参见 [gas 详情](https://www.evm.codes/precompiled)          | 模算术下的任意精度指数运算                                   |
| `0x06`   | `ecAdd`               | `300`                                                        | 椭圆曲线 `alt_bn128` 上的点加法（ADD）                       |
| `0x07`   | `ecMul`               | `30,000`                                                     | 椭圆曲线 `alt_bn128` 上的标量乘法（MUL）                     |
| `0x08`   | `ecPairing`           | `225,000`                                                    | 椭圆曲线 `alt_bn128` 上群的双线性函数                        |
| `0x09`   | `blake2f`             | `rounds * 2`                                                 | `BLAKE2` 密码学哈希算法中使用的压缩函数 `F`                  |
| `0x0a`   | `point_eval`          | `200,000`                                                    | 验证 KZG 承诺（参见 [EIP-4844 中的描述](https://eips.ethereum.org/EIPS/eip-4844#point-evaluation-precompile)） |
| `0x0b`   | `bls12_g1_add`        | `375`                                                        | G1 中的点加法（基础素数域上的曲线）。参见 [EIP-2537](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2537.md) |
| `0x0c`   | `bls12_g1_msm`        | 参见 [EIP-2537](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2537.md) | G1 中的多标量乘法（MSM）                                     |
| `0x0d`   | `bls12_g2_add`        | `600`                                                        | G2 中的点加法（基础素数域的二次扩展上的曲线）                |
| `0x0e`   | `bls12_g2_msm`        | 参见 [EIP-2537](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2537.md) | G2 中的 MSM                                                  |
| `0x0f`   | `bls12_pairing_check` | 参见 [EIP-2537](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2537.md) | 一组 (G1, G2) 点对之间的配对运算                            |
| `0x10`   | `bls12_map_fp_to_g1`  | `5500`                                                       | 将基础域元素映射到 G1 点                                     |
| `0x11`   | `bls12_map_fp2_to_g2` | `23800`                                                      | 将扩展域元素映射到 G2 点                                     |
| `0x0100` | `p256_verify`         | `6900`                                                       | `secp256r1`（又名 P256）椭圆曲线的签名验证。参见 [RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md) |

注意，相对于以太坊，一些预编译合约（即 `0x01`、`0x06`、`0x07`、`0x08`、`0x09` 和 `0x0a`）已经重新定价，详见[此处](https://docs.monad.xyz/developer-essentials/opcode-pricing#precompiles)讨论。

另请参见[源代码](https://github.com/category-labs/monad/blob/main/category/execution/ethereum/precompiles.cpp)。 