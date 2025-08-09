# Pipelining

Pipelining 技术是一种实现并行化的技术，它将事务拆分成一系列可并行处理的较小事务。

Pipelining 技术用于计算机处理器，致力于提高以相同时钟频率顺序执行一系列指令的吞吐量(处理器中还使用了其他技术来提高吞吐量）。有关指令级并行（ILP）的更多信息，请点击[此处](https://en.wikipedia.org/wiki/Instruction_pipelining)。

解释 Pipelining 技术的一个简单案例：

<figure><img src="https://3402452340-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FPaHQrSOuX4vToXCmyjn9%2Fuploads%2FKYb18Igx3akjuUxH9M7h%2F001_.png?alt=media&#x26;token=0672f963-f31f-4aa0-a9d8-614419031df8" alt=""><figcaption><p>Pipelining 洗衣作业的日常，上: 普通洗衣作业; 下: pipelined 洗衣作业<br>资料来源: <a href="https://www.cs.fsu.edu/~hawkes/cda3101lects/chap6/index.html?$$$F6.1.html$$$">Prof. Lois Hawkes, FSU</a></p></figcaption></figure>

当洗四件衣服时，“普通洗衣作业”的策略是在洗第二件衣服之前，完成第一件衣服的洗涤、烘干、折叠和储存。“pipelined 洗衣作业”的策略是当第一件衣服洗涤完成进入烘干机时，开始洗涤第二件衣服，通过同时利用多个资源来更有效地完成工作。
