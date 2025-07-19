export interface DocCategory {
  id: string;
  title: string;
  collapsed?: boolean;
  docs: {
    slug: string;
    title: string;
    hasArrow?: boolean;
  }[];
}

export const docsCategories: DocCategory[] = [
  {
    id: 'introduction',
    title: '介绍',
    collapsed: false,
    docs: [{ slug: 'why-blockchain', title: '为什么是区块链？' }],
  },
  {
    id: 'developer-essentials',
    title: '开发人员必备',
    collapsed: true,
    docs: [{ slug: 'network-info', title: '网络信息' }],
  },
];

export function getDocsByCategory(): DocCategory[] {
  return docsCategories;
}

export function findDocCategory(
  slug: string
): { category: DocCategory; doc: any } | null {
  for (const category of docsCategories) {
    const doc = category.docs.find((d) => d.slug === slug);
    if (doc) {
      return { category, doc };
    }
  }
  return null;
}
