import { GetStaticProps, GetStaticPaths } from 'next';
import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';

import { LeftSidebar } from '@/components/docs/LeftSidebar';
import { RightSidebar } from '@/components/docs/RightSidebar';
import { useDocExpansion } from '@/hooks/useDocExpansion';

import { parseMarkdown } from '@/lib/markdown';
import { getDocsByCategory, findDocCategory, DocCategory, DocGroup } from '@/lib/docsConfig';
import styles from './[slug]/index.module.css';

interface DocsPageProps {
  content: string;           // Markdown 文档内容
  slug: string;             // 文档的 URL 路径标识符
  docsCategories: DocCategory[];  // 所有文档分类配置
  currentDocTitle: string;  // 当前文档标题
  currentCategory: string;  // 当前文档所属分类
}

interface TocItem {
  level: number;  // 标题层级 (h1=1, h2=2, h3=3, 等)
  text: string;   // 标题文本内容
  id: string;     // 锚点 ID，用于页面内跳转
}

/**
 * 文档页面主组件
 * 负责渲染文档内容、侧边栏导航和目录
 */
export default function DocsPage({ content, slug, docsCategories, currentDocTitle, currentCategory }: DocsPageProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [toc, setToc] = useState<TocItem[]>([]);
  
  const { expandedItems, toggleItem } = useDocExpansion(docsCategories, currentCategory, slug);

  // Markdown 解析的副作用
  useEffect(() => {
    const renderMarkdown = async () => {
      // marked 已经自动处理了标题 ID，所以直接解析即可
      const originalHtml = await parseMarkdown(content);
      
      // 从生成的 HTML 中直接提取标题信息
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = originalHtml;
      
      const headingElements = tempDiv.querySelectorAll('h2, h3, h4');
      const tocData: TocItem[] = [];
      const idCounts = new Map<string, number>();
      
      headingElements.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent || '';
        let id = heading.id;
        
        // 如果没有 ID，我们自己生成一个
        if (!id) {
          const cleanText = text
            .toLowerCase()
            .trim()
            .replace(/[\s]+/g, '-')
            .replace(/[^\w\-\u4e00-\u9fa5]/g, '');
          
          const baseId = cleanText || `heading-${index}`;
          const count = idCounts.get(baseId) || 0;
          idCounts.set(baseId, count + 1);
          
          id = count > 0 ? `${baseId}-${count}` : baseId;
          
          // 为 HTML 中的标题元素设置 ID
          heading.id = id;
        }
        
        tocData.push({ level, text, id });
      });
      
      // 获取更新后的 HTML 内容
      const finalHtml = tempDiv.innerHTML;
      
      console.log('Generated TOC from HTML:', tocData); // 调试信息
      console.log('Sample HTML snippet:', finalHtml.substring(0, 500)); // 查看生成的 HTML
      
      setHtmlContent(finalHtml);
      setToc(tocData);
      window.scrollTo(0, 0);
    };

    renderMarkdown();
  }, [content]); 

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.layout}>
        
        {/* 左侧导航栏组件 */}
        <LeftSidebar 
          docsCategories={docsCategories}
          currentSlug={slug}
          expandedItems={expandedItems}
          toggleItem={toggleItem}
        />

        {/* 主要内容区域 */}
        <main className={styles.mainContent}>
          {/* 面包屑可以进一步拆分，但这里为了简洁暂时保留 */}
          <nav className={styles.breadcrumbWrapper}>
            <ol className={styles.breadcrumbList}>
              <li className={styles.breadcrumbItem}>
                <span>{docsCategories.find(cat => cat.id === currentCategory)?.title || 'Introduction'}</span>
              </li>
              <li className={styles.breadcrumbSeparator}><span>›</span></li>
              <li className={styles.breadcrumbItem}>
                <span className={styles.breadcrumbCurrent}>{currentDocTitle}</span>
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

        {/* 右侧目录组件 */}
        <RightSidebar toc={toc} />
        
      </div>
    </div>
  );
}

/**
 * 在构建时预生成所有可能的文档页面路径
 */
export const getStaticPaths: GetStaticPaths = async () => {
  // 从配置中获取所有文档的 slug
  const docsCategories = getDocsByCategory();
  const allSlugs = new Set<string>();

  /**
   * 递归收集分组中的所有文档 slug
   * @param groups 要处理的分组数组
   */
  const collectSlugsFromGroups = (groups: DocGroup[]): void => {
    groups.forEach(group => {
      group.children.forEach(child => {
        if ('slug' in child) {
          // 如果是文档项，添加其 slug
          allSlugs.add(child.slug);
        } else if ('type' in child && child.type === 'group') {
          // 如果是子分组，递归处理
          collectSlugsFromGroups([child]);
        }
      });
    });
  };

  // 遍历所有分类，收集 slug
  docsCategories.forEach(category => {
    // 收集直属于分类的文档
    if (category.docs) {
      category.docs.forEach(doc => {
        allSlugs.add(doc.slug);
      });
    }
    // 收集分组中的文档
    if (category.groups) {
      collectSlugsFromGroups(category.groups);
    }
  });

  const docsDirectory = path.join(process.cwd(), 'src/docs');

  /**
   * 递归扫描目录中的 markdown 文件
   * @param dir 要扫描的目录路径
   * @param basePath 相对于 docs 目录的基础路径
   */
  const scanDirectory = (dir: string, basePath = ''): void => {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

        if (item.isDirectory()) {
          // 递归扫描子目录
          scanDirectory(fullPath, relativePath);
        } else if (item.name.endsWith('.md')) {
          // 添加 markdown 文件的 slug（去掉 .md 扩展名）
          allSlugs.add(relativePath.replace(/\.md$/, ''));
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  };

  // 开始扫描文档目录
  scanDirectory(docsDirectory);

  // 将所有 slug 转换为 Next.js 路径格式
  // 例如: "introduction/why-blockchain" -> { params: { slug: ["introduction", "why-blockchain"] } }
  const paths = Array.from(allSlugs).map(slug => ({
    params: { slug: slug.split('/') }
  }));

  return {
    paths,
    fallback: false  // 如果路径不存在，返回 404
  };
};

/**
 * 在构建时为每个文档页面准备所需的数据
 * @param params 路由参数，包含文档的 slug 数组
 */
export const getStaticProps: GetStaticProps = async ({ params }) => {
  // 从路由参数中重建完整的 slug 路径
  const slugArray = params?.slug as string[];
  const slug = slugArray.join('/');
  
  // 构建文档文件的完整路径
  const docsDirectory = path.join(process.cwd(), 'src/docs');
  const filePath = path.join(docsDirectory, `${slug}.md`);

  try {
    // 读取 Markdown 文件内容
    const content = fs.readFileSync(filePath, 'utf8');

    // 获取文档分类配置
    const docsCategories = getDocsByCategory();

    // 查找当前文档所属的分类
    const docInfo = findDocCategory(slug);
    const currentCategory = docInfo?.category.id || 'introduction';

    // 从 Markdown 内容中提取文档标题
    // 匹配第一个 # 标题
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
    // 如果文件不存在或读取失败，返回 404
    console.error('Error reading file:', error);
    return {
      notFound: true
    };
  }
};
