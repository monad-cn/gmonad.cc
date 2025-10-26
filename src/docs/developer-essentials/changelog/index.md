# Changelog

We provide several changelogs:

- [Releases](/developer-essentials/changelog/releases): a list of all notable releases
- [Testnet Changelog](/developer-essentials/changelog/testnet): changes to `testnet`
- [Testnet-2 Changelog](/developer-essentials/changelog/testnet-2): changes to `testnet-2`

## How changes happen in Monad

"Revisions" are behavioral changes to the protocol (contrasted with efficiency improvements to the client). Monad tracks revisions with a counter, typically activating them at a future timestamp so validators can agree on upgrades.

### Revisions

Monad revisions are major behavioral changes defined in `revision.h`:

| Revision | Notes |
|----------|-------|
| `MONAD_FIVE` | - Opcode pricing implemented |
| `MONAD_FOUR` | - Staking<br>- Reserve balance<br>- EIP-7702<br>- Dynamic base fee<br>- Min base fee raised<br>- Per-transaction gas limit of 30M gas<br>- Block gas limit increased<br>- Enable EIP-2935, EIP-7951, EIP-2537<br>- Raised max contract size |
| `MONAD_THREE` | - MonadBFT implemented<br>- Block time reduced |
| `MONAD_TWO` | - Raised max contract size |
| `MONAD_ONE` | - Block time reduced<br>- Block gas limit changed<br>- Transactions charged by gas limit |

### ChainConfigs

Each ChainConfig describes a network's upgrade history:

| ChainConfig | Notes |
|-------------|-------|
| `mainnet` | Chain id 143 |
| `testnet` | Chain id 10143 |
| `testnet-2` | Chain id 30143 |
| `devnet` | Chain id 20143 |