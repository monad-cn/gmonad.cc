import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Tag, App as AntdApp, Image } from 'antd';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  User,
} from 'lucide-react';
import Link from 'next/link';
import styles from './index.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogById, updateBlogPublishStatus, Blog } from '@/pages/api/blog';
import dayjs from 'dayjs';
import { sanitizeMarkdown } from '@/lib/markdown';
import SEO from '@/components/SEO';
import { GetServerSideProps } from 'next';

export function formatTime(isoTime: string): string {
  return dayjs(isoTime).format('YYYY-MM-DD HH:MM');
}

interface BlogDetailPageProps {
  initialBlog: Blog | null;
  error?: string;
}

export default function BlogDetailPage({ initialBlog, error }: BlogDetailPageProps) {
  const { message } = AntdApp.useApp();
  const router = useRouter();

  const [blog] = useState<Blog | null>(initialBlog);
  // 使用统一的认证上下文，避免重复调用 useSession
  const { session, status } = useAuth();

  const permissions = session?.user?.permissions || [];

  // parseMarkdown将返回的markdown转为html展示
  const [blogContent, setBlogContent] = useState<string>('');

  useEffect(() => {
    if (blog?.content) {
      sanitizeMarkdown(blog.content).then((htmlContent) => {
        setBlogContent(htmlContent);
      });
    }
  }, [blog?.content]);

  const handleUpdatePublishStatus = async () => {
    if (!blog) return;
    try {
      const result = await updateBlogPublishStatus(blog.ID.toString(), 2);
      if (result.success) {
        router.reload();
        message.success(result.message);
      } else {
        message.error(result.message || '审核出错');
      }
    } catch (error) {
      message.error('审核出错，请重试');
    }
  };

  const isUnderReview = blog?.publish_status === 1;
  const isPublisher = blog?.publisher_id?.toString() === session?.user?.uid;
  const canReview = permissions.includes('blog:review');

  if (!blog || (isUnderReview && !isPublisher && !canReview)) {
    return (
      <div className={styles.error}>
        <h2>博客不存在</h2>
        <p>抱歉，找不到您要查看的博客</p>
        <Link href="/blogs" className={styles.backButton}>
          返回博客列表
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={blog.title}
        description={blog.description || blog.title}
        type="article"
        url={`/blogs/${blog.ID}`}
        image={blog.cover_img}
        publishedTime={blog.publish_time || blog.CreatedAt}
        author={blog.author || blog.publisher?.username || ''}
        tags={blog.tags}
      />
      <div className={`${styles.container} nav-t-top`}>
        {/* Header */}
        <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/blogs" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            返回博客列表
          </Link>
          <div className={styles.headerActions}>
            {status === 'authenticated' &&
            blog.publisher_id.toString() === session?.user?.uid ? (
              <Button
                icon={<Edit size={16} className={styles.actionIcon} />}
                className={styles.actionButton}
                onClick={() => router.push(`/blogs/${blog.ID}/edit`)}
              >
                编辑
              </Button>
            ) : null}
            {blog.publish_status === 1 &&
            status === 'authenticated' &&
            permissions.includes('blog:review') ? (
              <Button
                icon={<CheckCircle size={16} className={styles.actionIcon} />}
                className={styles.actionButton}
                onClick={() => handleUpdatePublishStatus()}
              >
                审核通过
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {blog.publish_status === 1 && (
                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: '#af78e7' }}
                >
                  待审核
                </div>
              )}
            </div>
            <h1 className={styles.title}>{blog.title}</h1>
            <h3 className={styles.description}>{blog.description}</h3>
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <Calendar className={styles.metaIcon} />
                <div className={styles.metaText}>
                  发布时间：{formatTime(blog.publish_time || blog.CreatedAt)}
                </div>
              </div>
              <div className={styles.metaItem}>
                <User className={styles.metaIcon} />
                <div className={styles.metaText}>
                  作者：{blog.author || blog.publisher?.username || ''}
                </div>
              </div>
              {blog.translator && (
                  <div className={styles.metaItem}>
                    <User className={styles.metaIcon} />
                    <div className={styles.metaText}>
                      译者：{blog.translator}
                    </div>
                  </div>
              )}
              <div className={styles.metaItem}>
                <User className={styles.metaIcon} />
                <div className={styles.metaText}>
                  发布者：{blog.publisher?.username || ''}
                </div>
              </div>
              <div className={styles.metaItem}>
                <Eye className={styles.metaIcon} />
                <div className={styles.metaText}>
                  浏览量：{blog.view_count || '0'}
                </div>
              </div>
              <div className={styles.tags}>
                {blog.tags.map((tag: string, index: number) => (
                  <Tag key={index} className={styles.tag}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.coverContainer}>
              <Image
                src={blog.cover_img || '/placeholder.svg'}
                alt={blog.title}
                width={400}
                height={300}
                className={styles.coverImage}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        <div className="marked-paper">
          {/* <h2 className={styles.sectionTitle}>{blog.title}</h2> */}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: blogContent }}
          />
        </div>
      </div>
      </div>
    </>
  );
}

// 服务端渲染 - 在服务器端获取博客数据
export const getServerSideProps: GetServerSideProps<BlogDetailPageProps> = async (context) => {
  const { id } = context.params as { id: string };
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return {
      props: {
        initialBlog: null,
        error: 'API URL is not configured',
      },
    };
  }

  try {
    // 直接在服务端调用 API
    const response = await fetch(`${apiUrl}/blogs/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        props: {
          initialBlog: null,
          error: 'Blog not found',
        },
      };
    }

    const result = await response.json();
    
    if (result.code === 200 && result.data) {
      return {
        props: {
          initialBlog: result.data as Blog,
        },
      };
    }

    return {
      props: {
        initialBlog: null,
        error: result.message || 'Failed to fetch blog',
      },
    };
  } catch (error) {
    console.error('Error fetching blog:', error);
    return {
      props: {
        initialBlog: null,
        error: 'Failed to fetch blog data',
      },
    };
  }
};
