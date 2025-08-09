# MonadDb 数据库

MonadDb 是用于存储区块链状态的自定义数据库。

大多数以太坊客户端使用的键值数据库都是以 B-Tree（例如[LMDB](https://www.symas.com/lmdb)）或 LSM-Tree（例如 [LevelDB](https://github.com/google/leveldb) 和 [RocksDB](https://rocksdb.org/)）数据结构实现的，然而以太坊却使用 [Merkle Patricia Trie](https://ethereum.org/zh/developers/docs/data-structures-and-encoding/patricia-merkle-trie/)（MPT）数据结构来存储状态。这是一种次优解决方案，一种数据结构被嵌入到另一种不同类型的数据结构中。为了避免这种情况发生，MonadDb 在磁盘和内存中都原生实现了 Patricia Trie 数据结构。

Monad 可以并行执行多笔交易，当一笔交易需要从磁盘读取状态时，系统不应停滞等待前序操作完成，而应启动读取，然后在此期间同步处理另一笔交易。关键在于此操作要求数据库支持[异步输入/输出](../concepts/asynchronous-i-o)（async i/o），而上述提到的键值数据库缺乏相应的异步输入/输出支持（尽管在这方面有一些改进）。MonadDb 充分利用了最新内核支持异步输入/输出（在 Linux 上是 [io\_uring](https://unixism.net/loti/index.html)），这就避免了为了异步执行交易而产生大量内核线程来处理待处理的输入/输出请求。

MonadDb 还对输入/输出进行了其他一些优化，例如绕过文件系统，因为文件系统会增加昂贵的开销。
