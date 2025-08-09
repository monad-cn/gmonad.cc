/**
 * 文档项接口定义
 * 表示单个文档页面的配置信息
 */
export interface DocItem {
  slug: string;        // 文档的唯一标识符，对应文件路径（不含扩展名）
  title: string;       // 文档显示标题
  hasArrow?: boolean;  // 是否显示外链箭头图标（可选）
}

/**
 * 文档分组接口定义
 * 用于将相关文档组织在一起，支持嵌套结构
 */
export interface DocGroup {
  id: string;                     // 分组的唯一标识符
  title: string;                  // 分组显示标题
  collapsed?: boolean;            // 是否默认折叠状态（可选）
  type: 'group';                  // 类型标识符，用于区分分组和文档项
  children: (DocItem | DocGroup)[]; // 子项数组，可以包含文档项或嵌套分组
}

/**
 * 文档分类接口定义
 * 顶级分类，用于组织整个文档结构
 */
export interface DocCategory {
  id: string;           // 分类的唯一标识符
  title: string;        // 分类显示标题
  collapsed?: boolean;  // 是否默认折叠状态（可选）
  docs?: DocItem[];     // 直属于该分类的文档列表（可选）
  groups?: DocGroup[];  // 该分类下的分组列表（可选）
}

/**
 * 文档分类配置数据
 * 定义了整个文档站点的结构和组织方式
 *
 * 配置说明：
 * - 每个分类可以包含直接的文档（docs）和分组（groups）
 * - 分组支持嵌套，可以创建多层级的文档结构
 * - collapsed 属性控制初始展开/折叠状态
 */
export const docsCategories: DocCategory[] = [
  {
    id: 'introduction',
    title: '介绍 Monad',
    collapsed: false,
    docs: [
        { slug: 'introduction/why-blockchain', title: '为什么选择区块链？' },
        { slug: 'introduction/why-monad-decentralization-+-performance', title: '为什么选择 Monad: 去中心化+性能' },
        { slug: 'introduction/monad-for-users', title: '面向用户的 Monad' },
        { slug: 'introduction/monad-for-developers', title: '面向开发人员的 Monad' },
        { slug: 'introduction/devnet-request', title: 'Devnet 开发者申请' },
    ],
  },
  {
    id: 'getting-started',
    title: '快速入门',
    collapsed: false,
    groups: [
      {
        id: 'deploy-contract',
        title: '部署合约',
        collapsed: false,
        type: 'group',
        children: [
          { slug: 'getting-started/deploy-contract/foundry', title: '使用 Foundry 部署合约' },
          { slug: 'getting-started/deploy-contract/hardhat', title: '使用 Hardhat 部署合约' },
        ]
      },
      {
        id: 'verify-contract',
        title: '验证合约',
        collapsed: false,
        type: 'group',
        children: [
          { slug: 'getting-started/deploy-contract/verify-contract/foundry', title: '验证合约 (Foundry)' },
          { slug: 'getting-started/deploy-contract/verify-contract/hardhat', title: '验证合约 (Hardhat)' },
        ]
      }
    ]
  },
  {
    id: 'guides',
    title: '开发指南',
    collapsed: false,
    docs: [
      { slug: 'guides/scaffold-eth-monad', title: '使用 Scaffold-Eth-Monad 构建 dApp' },
    ],
    groups: [
      {
        id: 'evm-resources',
        title: 'EVM 资源',
        collapsed: false,
        type: 'group',
        children: [
          { slug: 'guides/evm-resources/evm-behavior', title: 'EVM Behavior' },
          { slug: 'guides/evm-resources/solidity-resources', title: 'Solidity 资源' },
          {
            id: 'other-languages',
            title: '其他编程语言',
            collapsed: false,
            type: 'group',
            children: [
              { slug: 'guides/evm-resources/other-languages/yul', title: 'Yul 语言' },
              { slug: 'guides/evm-resources/other-languages/huff', title: 'Huff 语言' },
              { slug: 'guides/evm-resources/other-languages/vyper', title: 'Vyper 语言' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'monad-architecture',
    title: 'Monad 架构',
    collapsed: false,
    docs: [
      { slug: 'monad-architecture/transaction-lifecycle-in-monad', title: 'Monad 的交易生命周期' },
      { slug: 'monad-architecture/hardware-requirements', title: '硬件要求' },
      { slug: 'monad-architecture/other-details', title: '其他详细信息' },
    ],
    groups: [
      {
        id: 'concepts',
        title: '相关概念',
        collapsed: false,
        type: 'group',
        children: [
          { slug: 'monad-architecture/concepts/asynchronous-i-o', title: 'Asynchronous I/O' },
          { slug: 'monad-architecture/concepts/pipelining', title: 'Pipelining' },
        ]
      },
      {
        id: 'consensus',
        title: '共识机制',
        collapsed: false,
        type: 'group',
        children: [
          { slug: 'monad-architecture/consensus/monadbft', title: 'MonadBFT 共识机制' },
          { slug: 'monad-architecture/consensus/deferred-execution', title: '延迟执行' },
          { slug: 'monad-architecture/consensus/shared-mempool', title: '共享内存池' },
          { slug: 'monad-architecture/consensus/carriage-cost-and-reserve-balance', title: '传输成本和储备余额' },
        ]
      },
      {
        id: 'execution',
        title: '执行机制',
        collapsed: false,
        type: 'group',
        children: [
          { slug: 'monad-architecture/execution/parallel-execution', title: '并行执行' },
          { slug: 'monad-architecture/execution/monaddb', title: 'MonadDb 数据库' },
        ]
      }
    ]
  },
  {
    id: 'reference',
    title: '参考资料',
    collapsed: true,
    docs: [
      { slug: 'reference/rpc-overview', title: 'RPC 概览' },
      { slug: 'reference/rpc-error-codes', title: 'RPC 故障代码' },
    ],
  },
  {
    id: 'developer-essentials',
    title: '开发人员必备',
    collapsed: true,
    docs: [{ slug: 'developer/network-info', title: '网络信息' }],
  },
];

/**
 * 获取所有文档分类配置
 * @returns 文档分类配置数组
 */
export function getDocsByCategory(): DocCategory[] {
  return docsCategories;
}

/**
 * 根据文档 slug 查找对应的分类和文档信息
 * 支持在所有分类和嵌套分组中递归搜索
 *
 * @param slug 文档的唯一标识符
 * @returns 包含分类和文档信息的对象，如果未找到则返回 null
 */
export function findDocCategory(
  slug: string
): { category: DocCategory; doc: DocItem } | null {
  for (const category of docsCategories) {
    // 首先搜索分类下直接的文档
    if (category.docs) {
      const doc = category.docs.find((d) => d.slug === slug);
      if (doc) {
        return { category, doc };
      }
    }

    // 然后递归搜索分类下的分组中的文档
    if (category.groups) {
      const result = searchInGroups(category.groups, slug);
      if (result) {
        return { category, doc: result };
      }
    }
  }
  return null;
}

/**
 * 在分组中递归搜索指定 slug 的文档
 * 支持多层嵌套的分组结构
 *
 * @param groups 要搜索的分组数组
 * @param slug 要查找的文档 slug
 * @returns 找到的文档项，如果未找到则返回 null
 */
function searchInGroups(groups: DocGroup[], slug: string): DocItem | null {
  for (const group of groups) {
    for (const child of group.children) {
      // 如果子项是文档项且 slug 匹配
      if ('slug' in child && child.slug === slug) {
        return child;
      }
      // 如果子项是嵌套分组，递归搜索
      if ('type' in child && child.type === 'group') {
        const result = searchInGroups([child], slug);
        if (result) return result;
      }
    }
  }
  return null;
}
