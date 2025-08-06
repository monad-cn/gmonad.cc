import Link from 'next/link';
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { DocCategory, DocGroup } from '@/lib/docsConfig';
import styles from '@/pages/docs/[slug]/index.module.css'; 

interface LeftSidebarProps {
  docsCategories: DocCategory[];
  currentSlug: string;
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
}

export function LeftSidebar({ docsCategories, currentSlug, expandedItems, toggleItem }: LeftSidebarProps) {
  const renderGroup = (group: DocGroup, level: number = 0) => {
    const isExpanded = expandedItems.has(group.id);
    return (
      <div key={group.id} className={styles.categoryGroup}>
        <button
          className={styles.categoryHeader}
          onClick={() => toggleItem(group.id)}
          style={{ paddingLeft: `${(level + 1) * 16}px` }}
        >
          <span className={styles.categoryTitle}>{group.title}</span>
          {isExpanded ? <ChevronDown className={styles.categoryIcon} /> : <ChevronRight className={styles.categoryIcon} />}
        </button>
        {isExpanded && (
          <div className={styles.categoryDocs}>
            {group.children.map((child, index) => {
              if ('slug' in child) {
                return (
                  <Link
                    key={`${child.slug}-${index}`}
                    href={`/docs/${child.slug}`}
                    className={`${styles.docLink} ${child.slug === currentSlug ? styles.docLinkActive : ''}`}
                    style={{ paddingLeft: `${(level + 2) * 16}px` }}
                  >
                    <span className={styles.docTitle}>{child.title}</span>
                    {child.hasArrow && <ArrowRight className={styles.docArrow} />}
                  </Link>
                );
              } else if (child.type === 'group') {
                return renderGroup(child, level + 1);
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={styles.leftSidebar}>
      <div className={styles.sidebarContent}>
        <nav className={styles.docNav}>
          {docsCategories.map((category) => {
            const isExpanded = expandedItems.has(category.id);
            return (
              <div key={category.id} className={styles.categoryGroup}>
                <button className={styles.categoryHeader} onClick={() => toggleItem(category.id)}>
                  <span className={styles.categoryTitle}>{category.title}</span>
                  {isExpanded ? <ChevronDown className={styles.categoryIcon} /> : <ChevronRight className={styles.categoryIcon} />}
                </button>
                {isExpanded && (
                  <div className={styles.categoryDocs}>
                    {category.groups?.map((group) => renderGroup(group, 0))}
                    {category.docs?.map((doc, index) => (
                      <Link
                        key={`${doc.slug}-${index}`}
                        href={`/docs/${doc.slug}`}
                        className={`${styles.docLink} ${doc.slug === currentSlug ? styles.docLinkActive : ''}`}
                      >
                        <span className={styles.docTitle}>{doc.title}</span>
                        {doc.hasArrow && <ArrowRight className={styles.docArrow} />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
