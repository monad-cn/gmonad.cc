import { useEffect, useState } from 'react';
import { App as AntdApp, Button, Image, Tag } from 'antd';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { ArrowLeft, CheckCircle, Edit, Eye } from 'lucide-react';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeMarkdown } from '@/lib/markdown';
import {
  Newsletter,
  NEWSLETTER_CATEGORY,
  updateNewsletterPublishStatus,
} from '@/pages/api/newsletter';
import styles from '../../blogs/[id]/index.module.css';

const formatTime = (isoTime: string) => dayjs(isoTime).format('YYYY-MM-DD HH:mm');

interface NewsletterDetailPageProps {
  initialNewsletter: Newsletter | null;
}

export default function NewsletterDetailPage({
  initialNewsletter,
}: NewsletterDetailPageProps) {
  const router = useRouter();
  const { message } = AntdApp.useApp();
  const { session, status } = useAuth();
  const permissions = session?.user?.permissions || [];
  const [newsletter] = useState<Newsletter | null>(initialNewsletter);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (newsletter?.content) {
      sanitizeMarkdown(newsletter.content).then(setContent);
    }
  }, [newsletter?.content]);

  const handleUpdatePublishStatus = async () => {
    if (!newsletter) return;
    try {
      const result = await updateNewsletterPublishStatus(
        newsletter.ID.toString(),
        2
      );
      if (result.success) {
        message.success('周报审核通过');
        router.reload();
      } else {
        message.error(result.message || '审核周报失败');
      }
    } catch {
      message.error('审核周报出错，请重试');
    }
  };

  const isUnderReview = newsletter?.publish_status === 1;
  const isPublisher =
    newsletter?.publisher_id?.toString() === session?.user?.uid;
  const canReview = permissions.includes('blog:review');

  if (!newsletter || (isUnderReview && !isPublisher && !canReview)) {
    return (
      <div className={styles.error}>
        <h2>周报不存在</h2>
        <p>抱歉，找不到您要查看的周报</p>
        <Link href="/newsletter" className={styles.backButton}>
          返回周报列表
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={newsletter.title}
        description={newsletter.description || newsletter.title}
        type="article"
        url={`/newsletter/${newsletter.ID}`}
        image={newsletter.cover_img}
        publishedTime={newsletter.publish_time || newsletter.CreatedAt}
        author={newsletter.author || newsletter.publisher?.username || ''}
        tags={newsletter.tags}
      />
      <div className={`${styles.container} nav-t-top`}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/newsletter" className={styles.backLink}>
              <ArrowLeft className={styles.backIcon} />
              返回周报列表
            </Link>
            <div className={styles.headerActions}>
              {status === 'authenticated' && isPublisher ? (
                <Button
                  icon={<Edit size={16} className={styles.actionIcon} />}
                  className={styles.actionButton}
                  onClick={() => router.push(`/newsletter/${newsletter.ID}/edit`)}
                >
                  编辑
                </Button>
              ) : null}
              {newsletter.publish_status === 1 &&
              status === 'authenticated' &&
              canReview ? (
                <Button
                  icon={<CheckCircle size={16} className={styles.actionIcon} />}
                  className={styles.actionButton}
                  onClick={handleUpdatePublishStatus}
                >
                  审核通过
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              {newsletter.publish_status === 1 ? (
                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: '#af78e7' }}
                >
                  待审核
                </div>
              ) : null}
              <h1 className={styles.title}>{newsletter.title}</h1>
              <h3 className={styles.description}>{newsletter.description}</h3>

              {newsletter.source_link ? (
                <a
                  href={newsletter.source_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourceLinkButton}
                >
                  查看原文 →
                </a>
              ) : null}

              <div className={styles.tags}>
                {(newsletter.tags || []).map((tag) => (
                  <Tag key={tag} className={styles.tag}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.coverContainer}>
                <Image
                  src={newsletter.cover_img || '/placeholder.svg'}
                  alt={newsletter.title}
                  width={350}
                  height={220}
                  className={styles.coverImage}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.main}>
          <div className="marked-paper">
            <div className={styles.articleMeta}>
              <span>{newsletter.author || newsletter.publisher?.username || ''}</span>
              <span className={styles.metaSeparator}>·</span>
              <span>{formatTime(newsletter.publish_time || newsletter.CreatedAt)}</span>
              {newsletter.translator ? (
                <>
                  <span className={styles.metaSeparator}>·</span>
                  <span>整理 / 翻译：{newsletter.translator}</span>
                </>
              ) : null}
              <span className={styles.metaSeparator}>·</span>
              <span className={styles.viewCount}>
                <Eye size={14} />
                {newsletter.view_count || 0}
              </span>
            </div>

            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  NewsletterDetailPageProps
> = async (context) => {
  const { id } = context.params as { id: string };
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return { props: { initialNewsletter: null } };
  }

  try {
    const response = await fetch(`${apiUrl}/blogs/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return { props: { initialNewsletter: null } };
    }

    const result = await response.json();
    const newsletter =
      result.code === 200 ? (result.data as Newsletter) : null;

    return {
      props: {
        initialNewsletter:
          newsletter?.category === NEWSLETTER_CATEGORY ? newsletter : null,
      },
    };
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    return { props: { initialNewsletter: null } };
  }
};
