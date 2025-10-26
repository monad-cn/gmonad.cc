# Staking Behavior

## Overview for Users

Monad uses staking to determine the voting weights and leader schedule in [MonadBFT](https://docs.monad.xyz/monad-arch/consensus/monad-bft). Validators must stake at least a minimum amount, plus others can delegate to them.

When a block is produced, the leader who produced that block earns a block reward, which is distributed to each delegator of that leader, pro rata to their portion of that leader's stake, minus a commission.

Here's what you need to know as a user:

| Feature                       | Details                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| In-protocol delegation        | Supported                                                    |
| Validator commission          | Each validator sets a fixed percentage of the block reward to keep for themselves before sharing the rest of the reward prorata by stake.  You should choose a validator that you trust whose commission you're happy with.  The min commission is 0%, the max commission is 100%. |
| Source of rewards             | Successful proposal of a block by a leader earns a reward from two components: (1) a fixed reward derived from inflation (`REWARD`), and (2) the priority fees from all the transactions in the block. |
| Inflationary reward           | The fixed reward (`REWARD`) is shared among all delegators of that validator after deducting the validator commission.  As a delegator, your proportion of the remainder is your proportion of the total stake on that validator.  For example: if you have delegated to a validator and comprise 20% of that validator's total stake, the reward for that block is 10 MON, and the commission is 10%, then you would receive 10 MON * 90% * 20% = 1.8 MON. |
| Priority fees                 | Currently, priority fees only go to the validator. Validators may choose to donate their priority fees back to the delegators (including themselves) by using the [`externalReward`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#externalreward) method on the staking precompile. |
| Boundary block                | At each boundary block, staking changes and the associated validator set are committed for the following epoch. Consecutive boundary blocks are separated by 50,000 **blocks** (roughly 20,000 seconds or 5.5 hours without timeouts). |
| Epoch                         | After `EPOCH_DELAY_PERIOD` **rounds** has elapsed from the boundary block, the next epoch starts with the snapshot taken at the boundary block. Although you may initiate staking operations like (un)delegation at any time, these actions only take effect at the start of a new epoch. Note that a round is not a block - a round increments regardless of missed proposals. Epoch cannot be inferred by any mod operation on block or round number, and users should query via [`getEpoch`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#getepoch) for this information. |
| Stake activation              | New delegations made in epoch `n` become active at the start of epoch `n+1` (if submitted before the boundary block) or epoch `n+2` (if not). |
| Stake deactivation            | Tokens unstaked in epoch `n` become inactive at the start of epoch `n+1` (if submitted before the boundary block) or epoch `n+2` (if not).  Upon becoming inactive, this stake moves into a pending state for `WITHDRAWAL_DELAY` epochs before it is withdrawable.  When it becomes withdrawable, you have to submit a `withdraw` command to move the MON back to your account. |
| Reward claiming / compounding | Each delegation accumulates rewards. You can choose either to claim or compound any accumulated rewards.  Claimed rewards get withdrawn to your account, while compounded rewards are added to your delegation. |
| Active validator set          | Validatorsmust have self-delegated a minimum amount (`MIN_VALIDATE_STAKE`)must have a total delegation of at least a certain amount (`ACTIVE_VALIDATOR_STAKE`), andmust be in the top `NUM_ACTIVE_VALIDATORS` validators by stake weightin order to be part of the active validator set. |

## Constants

| Constant                                                     | Meaning                                                      | Value         |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------- |
| `EPOCH_LENGTH`[1](https://docs.monad.xyz/developer-essentials/staking/staking-behavior#user-content-fn-1) | epoch length                                                 | 50,000 blocks |
| `EPOCH_DELAY_PERIOD`[2](https://docs.monad.xyz/developer-essentials/staking/staking-behavior#user-content-fn-2) | number of rounds between the boundary block and the end of each epoch | 5,000 rounds  |
| `WITHDRAWAL_DELAY`                                           | number of epochs before unstaked tokens can be withdrawn     | 1 epoch       |
| `MIN_VALIDATE_STAKE`                                         | min amount of MON self-delegated by a validator for it to be eligible for the active set | TBD           |
| `ACTIVE_VALIDATOR_STAKE`                                     | min amount of MON staked with a validator for it to be eligible for the active set | TBD           |
| `ACTIVE_VALSET_SIZE`                                         | number of validators in the active set                       | 200           |
| `REWARD`                                                     | MON reward per block                                         | TBD           |

It's worth noting that the `EPOCH_LENGTH` is denominated in **blocks**, while `EPOCH_DELAY_PERIOD` is denominated in **rounds**. If perfect consensus is achieved, these will increment at the same rate. However, upon a failed block proposal (e.g. timeout), the round will increment while the block will not.

## Consensus and Execution

Monad nodes are split into consensus and execution components. The validator set is maintained by the execution component; all staking-related state changes are queued and applied deterministically in the execution system. The result of these changes is accepted by the consensus component when a predefined block finalization criterion is satisfied.

### Definitions

Consider the timeline below, which spans hundreds of thousands of [rounds](https://docs.monad.xyz/monad-arch/consensus/monad-bft#round) (each round in MonadBFT is 400 ms):

![timeline showing the placement of boundary blocks within an epoch](https://docs.monad.xyz/assets/images/staking-timeline-d66f162b241ec5402250e8bca4777e80.png)

**A. Epoch**: a range of rounds during which the validator set remains unchanged.

- In the diagram above, the epochs are the intervals `[0, 1]`, `[1, 2]`, `[2, 3]`, and so on. We refer to them by the starting index; for example, epoch `0` is `[0, 1]`.

**B. Boundary block**: the block marking the initial point of the end of an epoch. The epoch does not end at the boundary block; also the boundary block is finalized before the next epoch begins.

- In the diagram above, blocks `a`, `b`, `c`, and `d` are the boundary blocks of epochs `0`, `1`, `2`, `3`, respectively.

**C. Epoch delay period**: the period of time between a boundary block and the starting round of the next epoch, comprising `EPOCH_DELAY_PERIOD` rounds.

- In the diagram above, the epoch delay period for epoch `0` is `[a, 1]`.
- Note: the staking precompile has a boolean `in_epoch_delay_period` indicating whether the current round is within the epoch delay period.

**D. Snapshot interval:** the range between two consecutive boundary blocks. All staking requests in a snapshot interval take effect at the next epoch after the terminal boundary block.

- In the diagram above, the snapshot intervals are `[a, b]`, `[b, c]`, `[c, d]`.

The staking contract maintains three views of the validator set:

**A. Execution view**

- The Monad client's execution component is responsible for rewards and delegation. These actions are processed in real-time on every block, forming the execution view.
- Actions in each snapshot interval are applied at the next boundary block.

**B. Consensus view**

- The consensus view is a frozen copy of the execution view taken at the boundary block.
- The static validator set of a consensus view formed at the boundary block of epoch `n` will be the effective validator set for epoch `n+1` that starts in `EPOCH_DELAY_PERIOD` rounds.

**C. Snapshot view**

- The snapshot view is the previous consensus view. This is needed for consensus during the epoch delay period.

### Intuition on State Changes

Below is an intuitive example of the lifecycle of a transaction in the staking module. Suppose we fix a snapshot interval `m` in epoch `n`.

**1. Prior to the boundary block**

- Prior to the boundary block, various transactions invoke the [`addValidator`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#addvalidator), [`delegate`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#delegate), [`undelegate`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#undelegate), [`syscallReward`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallreward), [`syscallOnEpochChange`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallonepochchange), and [`syscallSnapshot`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallsnapshot) operations.
- These requests immediately update the execution view of the validator set.
  - `addValidator`, `delegate` , `undelegate` , and `syscallSnapshot` affect consensus in the next epoch `n+1`.
  - `syscallReward` and `syscallOnEpochChange` have an effect on execution in the current epoch `n`.

**2. Boundary block**

- At the boundary block, [`syscallSnapshot`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallsnapshot) is called, updating the consensus view of the validators.
- This view is the set of validators which will be able to participate in consensus during epoch `n+1`.

**3. During the epoch delay period**

- During the epoch delay period, transactions can call [`addValidator`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#addvalidator), [`delegate`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#delegate), [`undelegate`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#undelegate), and [`syscallReward`](https://docs.monad.xyz/developer-essentials/staking/staking-precompile#syscallreward)`.
- These requests occur in snapshot interval `m+1`. So they will not have an effect on the Consensus View until epoch `n+2`.

**4. `EPOCH_DELAY_PERIOD` rounds after the boundary block**

- Start of epoch `n+1`.
- The consensus view of the validator set is now the consensus view from snapshot in epoch `n`.
- The snapshot view of the validator set is now the consensus view of the validator set from epoch `n-1`.
- Execution view of the validator set is up to date.

## Slashing

Robust logging provides accountability for malicious, slashable offenses. However, in-protocol, automated slashing is not currently implemented.

## Footnotes

1. testnet-2 currently runs with `EPOCH_LENGTH = 5000` [↩](https://docs.monad.xyz/developer-essentials/staking/staking-behavior#user-content-fnref-1)
2. testnet-2 currently runs with `EPOCH_DELAY_PERIOD = 500` [↩](https://docs.monad.xyz/developer-essentials/staking/staking-behavior#user-content-fnref-2)