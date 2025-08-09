import { useState, useEffect, useCallback } from 'react';
import { DocCategory, DocGroup } from '@/lib/docsConfig';

/**
 * 管理文档导航展开状态的自定义 Hook
 * @param docsCategories - 所有文档分类配置
 * @param currentCategory - 当前文档所属分类的 ID
 * @param currentSlug - 当前文档的 slug
 * @returns 展开状态集合和切换状态的函数
 */
export function useDocExpansion(
  docsCategories: DocCategory[],
  currentCategory: string,
  currentSlug: string
) {
  /**
   * 递归查找包含当前文档的所有父级分组 ID
   * @param slug 当前文档的标识符
   * @returns 包含当前文档的所有分组 ID 数组
   */
  const findGroupsContainingDoc = useCallback((slug: string): string[] => {
    const groupIds: string[] = [];

    const searchInGroups = (groups: DocGroup[], parentPath: string[] = []): boolean => {
      for (const group of groups) {
        const currentPath = [...parentPath, group.id];
        for (const child of group.children) {
          if ('slug' in child && child.slug === slug) {
            groupIds.push(...currentPath);
            return true;
          } else if ('type' in child && child.type === 'group') {
            if (searchInGroups([child], currentPath)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    docsCategories.forEach(category => {
      if (category.groups) {
        searchInGroups(category.groups);
      }
    });

    return groupIds;
  }, [docsCategories]); 

  // 初始化时，默认展开当前分类和所有包含当前文档的父级分组
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => 
    new Set([currentCategory, ...findGroupsContainingDoc(currentSlug)])
  );

  // 当路由切换时（slug 变化），同步更新展开状态
  useEffect(() => {
    const requiredGroups = new Set([currentCategory, ...findGroupsContainingDoc(currentSlug)]);
    setExpandedItems(requiredGroups);
  }, [currentSlug, currentCategory, findGroupsContainingDoc]);


  /**
   * 切换某个项目（分类或分组）的展开/折叠状态
   * @param itemId - 分类或分组的 ID
   */
  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  };

  return { expandedItems, toggleItem };
}
