# EVM Behavior

URL: https://docs.monad.xyz/guides/evm-resources/evm-behavior

## EVM Behavioral Specification

- [Notes on the EVM](https://github.com/CoinCulture/evm-tools/blob/master/analysis/guide.md) : straightforward technical specification of the EVM plus some behavioral examples
- [EVM: From Solidity to bytecode, memory and storage](https://www.youtube.com/watch?v=RxL_1AfV7N4) : a 90-minute talk from Peter Robinson and David Hyland-Wood
- [EVM illustrated](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf) : an excellent set of diagrams for confirming your mental model
- [EVM Deep Dives: The Path to Shadowy Super-Coder](https://noxx.substack.com/p/evm-deep-dives-the-path-to-shadowy)

## Opcode Reference

note
Opcode pricing on Monad has been changed to reflect their relative costs in execution, learn more about it [here](/developer-essentials/opcode-pricing)

[evm.codes](https://www.evm.codes/) : opcode reference and an interactive sandbox for stepping through bytecode execution

## Solidity Storage Layout

The EVM allows smart contracts to store data in 32-byte words ("storage slots"), however the details of how complex datastructures such as lists or mappings is left as an implementation detail to the higher-level language. Solidity has a specific way of assigning variables to storage slots, described below:

- [Official docs on storage layout](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html)
- [Storage patterns in Solidity](https://programtheblockchain.com/posts/2018/03/09/understanding-ethereum-smart-contract-storage/)