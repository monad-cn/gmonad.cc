# 质押

Monad 使用质押来确定 [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft) 中的投票权重和出块者调度。验证者必须质押至少最小数量的代币，其他人也可以向他们委托。

当产生一个区块时，产生该区块的出块者获得区块奖励，该奖励按照每个委托者在该出块者质押中的比例分配给该出块者的每个委托者，减去佣金。

查看以下主题：

- [质押行为](https://docs.monad.xyz/developer-essentials/staking/staking-behavior) 描述了质押系统的工作原理。用户应参考此页面了解相关参数和时间周期。
- [质押预编译](https://docs.monad.xyz/developer-essentials/staking/staking-precompile) 描述了质押预编译的接口。构建与交易系统交互功能的开发者应先查看质押行为，然后再来这里。