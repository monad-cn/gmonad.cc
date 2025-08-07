import styles from '@/pages/docs/[slug]/index.module.css';

interface TocItem {
  level: number;
  text: string;
  id: string;
}

interface RightSidebarProps {
  toc: TocItem[];
}

export function RightSidebar({ toc }: RightSidebarProps) {
  // 处理目录点击事件，平滑滚动到对应标题
  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 130; // 综合导航栏高度和额外偏移
      window.scrollTo({
        top: element.offsetTop - offset,
        behavior: 'smooth'
      });
    } else {
      console.warn('Element not found with ID:', id);
      
      // 显示页面上所有可用的标题 ID 进行比较
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingData = Array.from(allHeadings).map(h => ({
        tag: h.tagName,
        id: h.id,
        text: h.textContent?.trim().substring(0, 50) + '...'
      }));
      console.log('All available headings on page:', headingData);
    }
  };

  // 只有当 toc 有内容时才渲染
  if (toc.length === 0) {
    return null;
  }

  return (
    <aside className={styles.rightSidebar}>
      <div className={styles.sidebarContent}>
        <h3 className={styles.sidebarTitle}>目录</h3>
        <nav className={styles.tocNav}>
          {toc.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              className={styles.tocLink}
              data-level={item.level}
              onClick={() => handleTocClick(item.id)}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
