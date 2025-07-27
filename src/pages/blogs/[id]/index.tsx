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
import { getBlogById, updateBlogPublishStatus } from '@/pages/api/blog';
import dayjs from 'dayjs';
import { sanitizeMarkdown } from '@/lib/markdown';

export function formatTime(isoTime: string): string {
  return dayjs(isoTime).format('YYYY-MM-DD HH:MM');
}

export default function BlogDetailPage() {
  const { message } = AntdApp.useApp();
  const router = useRouter();
  const { id } = router.query; // 路由参数应该叫 id，不是 ids
  const rId = Array.isArray(id) ? id[0] : id;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const result = await updateBlogPublishStatus(blog.ID, 2);
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

  useEffect(() => {
    if (!router.isReady || !rId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getBlogById(rId);
        setBlog(response?.data);
      } catch (error) {
        message.error('加载失败');
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, id]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>加载中...</p>
      </div>
    );
  }

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
          <h2 className={styles.sectionTitle}>{blog.title}</h2>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: blogContent }}
          />
        </div>
      </div>
    </div>
  );
}
