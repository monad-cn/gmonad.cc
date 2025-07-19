import { GetStaticProps, GetStaticPaths } from 'next';
import {
  House, ChevronDown, ChevronRight, ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseMarkdown, getTableOfContents } from '@/lib/markdown';
import { getDocsByCategory, findDocCategory, DocCategory } from '@/lib/docsConfig';
import styles from './index.module.css';

interface DocsPageProps {
  content: string;
  slug: string;
  docsCategories: DocCategory[];
  currentDocTitle: string;
  currentCategory: string;
}

interface TocItem {
  level: number;
  text: string;
  id: string;
}

export default function DocsPage({ content, slug, docsCategories, currentDocTitle, currentCategory }: DocsPageProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([currentCategory]));
  const router = useRouter();

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        const html = await parseMarkdown(content);
        const tocData = getTableOfContents(content);
        
        // 为HTML添加锚点ID
        const htmlWithAnchors = addAnchorIds(html, tocData);
        
        setHtmlContent(htmlWithAnchors);
        setToc(tocData);
        
        // 重置主内容滚动位置到顶部
        const mainContent = document.querySelector(`.${styles.mainContent}`) as HTMLElement;
        if (mainContent) {
          mainContent.scrollTop = 0;
        }
      } catch (error) {
        console.error('Failed to parse markdown:', error);
        setHtmlContent('<p>Error loading content</p>');
      }
    };

    renderMarkdown();
  }, [content]);

  const addAnchorIds = (html: string, tocItems: TocItem[]): string => {
    let result = html;
    
    tocItems.forEach(item => {
      const headingRegex = new RegExp(`<h${item.level}([^>]*)>${item.text}</h${item.level}>`, 'g');
      result = result.replace(headingRegex, `<h${item.level}$1 id="${item.id}">${item.text}</h${item.level}>`);
    });
    
    return result;
  };

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    const mainContent = document.querySelector(`.${styles.mainContent}`) as HTMLElement;
    
    if (element && mainContent) {
      // 获取目标元素在文档中的位置
      const elementOffsetTop = element.offsetTop;
      
      // 考虑 nav-t-top 的 6rem padding-top 和额外的偏移量
      // 6rem = 96px，再加上 20px 的额外偏移
      const navPadding = 110;
      const extraOffset = 20;
      
      mainContent.scrollTo({
        top: elementOffsetTop - navPadding - extraOffset,
        behavior: 'smooth'
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (category: DocCategory) => {
    // 如果分类已展开，则跳转到第一个文档
    if (expandedCategories.has(category.id) && category.docs.length > 0) {
      const firstDoc = category.docs[0];
      router.push(`/docs/${firstDoc.slug}`);
    } else {
      // 否则展开分类
      toggleCategory(category.id);
    }
  };

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.layout}>
        {/* 左侧文档导航 */}
        <aside className={styles.leftSidebar}>
          <div className={styles.sidebarContent}>
            <nav className={styles.docNav}>
              {docsCategories.map((category) => (
                <div key={category.id} className={styles.categoryGroup}>
                  <button
                    className={styles.categoryHeader}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <span className={styles.categoryTitle}>{category.title}</span>
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className={styles.categoryIcon} />
                    ) : (
                      <ChevronRight className={styles.categoryIcon} />
                    )}
                  </button>
                  
                  {expandedCategories.has(category.id) && (
                    <div className={styles.categoryDocs}>
                      {category.docs.map((doc, index) => (
                        <Link 
                          key={`${doc.slug}-${index}`} 
                          href={`/docs/${doc.slug}`}
                          className={`${styles.docLink} ${doc.slug === slug ? styles.docLinkActive : ''}`}
                        >
                          <span className={styles.docTitle}>{doc.title}</span>
                          {doc.hasArrow && (
                            <ArrowRight className={styles.docArrow} />
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* 主要内容区域 */}
        <main className={styles.mainContent}>
          {/* 面包屑导航 */}
          <nav className={styles.breadcrumbWrapper}>
            <ol className={styles.breadcrumbList}>
              <li className={styles.breadcrumbItem}>
                <span className={styles.breadcrumbLink}>
                  {docsCategories.find(cat => cat.id === currentCategory)?.title || 'Introduction'}
                </span>
              </li>
              <li className={styles.breadcrumbSeparator}>
                <span className={styles.separatorIcon}>›</span>
              </li>
              <li className={styles.breadcrumbItem}>
                <span className={styles.breadcrumbCurrent}>
                  {currentDocTitle}
                </span>
              </li>
            </ol>
          </nav>
          
          <div className={styles.paper}>
            <div 
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </main>

        {/* 右侧目录导航 */}
        {toc.length > 0 && (
          <aside className={styles.rightSidebar}>
            <div className={styles.sidebarContent}>
              <h3 className={styles.sidebarTitle}>目录</h3>
              <nav className={styles.tocNav}>
                {toc.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    className={styles.tocLink}
                    onClick={() => handleTocClick(item.id)}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // 从配置中获取所有文档的slug
  const docsCategories = getDocsByCategory();
  const allSlugs = new Set<string>();
  
  // 收集所有配置中的slug
  docsCategories.forEach(category => {
    category.docs.forEach(doc => {
      allSlugs.add(doc.slug);
    });
  });
  
  // 同时也扫描文件系统中的其他文档
  const docsDirectory = path.join(process.cwd(), 'src/docs');
  try {
    const fileNames = fs.readdirSync(docsDirectory);
    fileNames
      .filter(name => name.endsWith('.md'))
      .forEach(name => {
        allSlugs.add(name.replace(/\.md$/, ''));
      });
  } catch (error) {
    console.error('Error reading docs directory:', error);
  }

  const paths = Array.from(allSlugs).map(slug => ({
    params: { slug }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const docsDirectory = path.join(process.cwd(), 'src/docs');
  const filePath = path.join(docsDirectory, `${slug}.md`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 获取文档分类配置
    const docsCategories = getDocsByCategory();
    
    // 查找当前文档所属的分类
    const docInfo = findDocCategory(slug);
    const currentCategory = docInfo?.category.id || 'introduction';
    
    // 获取当前文档标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const currentDocTitle = titleMatch ? titleMatch[1] : (docInfo?.doc.title || slug);
    
    return {
      props: {
        content,
        slug,
        docsCategories,
        currentDocTitle,
        currentCategory
      }
    };
  } catch (error) {
    console.error('Error reading file:', error);
    return {
      notFound: true
    };
  }
};