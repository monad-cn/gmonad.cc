import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Tag, Avatar, Modal, App as AntdApp, Image } from 'antd';
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
import {
  getTutorialById,
  updateTutorialPublishStatus,
  Tutorial,
} from '@/pages/api/tutorial';
import dayjs from 'dayjs';
import { sanitizeMarkdown } from '@/lib/markdown';
import SEO from '@/components/SEO';
import { GetServerSideProps } from 'next';

export function formatTime(isoTime: string): string {
  return dayjs(isoTime).format('YYYY-MM-DD HH:mm');
}

interface TutorialDetailPageProps {
  initialTutorial: Tutorial | null;
  error?: string;
}

export default function TutorialDetailPage({ initialTutorial, error }: TutorialDetailPageProps) {
  const { message } = AntdApp.useApp();
  const router = useRouter();

  const [tutorial] = useState<Tutorial | null>(initialTutorial);
  const { session, status } = useAuth();
  const permissions = session?.user?.permissions || [];

  // parseMarkdown将返回的markdown转为html展示
  const [tutorialContent, setTutorialContent] = useState<string>('');

  useEffect(() => {
    if (tutorial?.content) {
      sanitizeMarkdown(tutorial.content).then((htmlContent) => {
        setTutorialContent(htmlContent);
      });
    }
  }, [tutorial?.content]);

  const handleUpdatePublishStatus = async () => {
    if (!tutorial) return;
    try {
      const result = await updateTutorialPublishStatus(tutorial.ID.toString(), 2);
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

  const isUnderReview = tutorial?.publish_status === 1;
  const isPublisher = tutorial?.publisher_id?.toString() === session?.user?.uid;
  const canReview = permissions.includes('tutorial:review');

  if (!tutorial || (isUnderReview && !isPublisher && !canReview)) {
    return (
      <div className={styles.error}>
        <h2>教程不存在</h2>
        <p>抱歉，找不到您要查看的教程</p>
        <Link href="/ecosystem/tutorials" className={styles.backButton}>
          返回教程列表
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={tutorial.title}
        description={tutorial.description || tutorial.title}
        type="article"
        url={`/ecosystem/tutorials/${tutorial.ID}`}
        image={tutorial.cover_img}
        publishedTime={tutorial.publish_time || tutorial.CreatedAt}
        author={tutorial.author || tutorial.publisher?.username || ''}
        tags={tutorial.tags}
      />
      <div className={`${styles.container} nav-t-top`}>
        {/* Header */}
        <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/ecosystem/tutorials" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            返回教程列表
          </Link>
          <div className={styles.headerActions}>
            {status === 'authenticated' &&
            tutorial.publisher_id?.toString() === session?.user?.uid ? (
              <Button
                icon={<Edit size={16} className={styles.actionIcon} />}
                className={styles.actionButton}
                onClick={() =>
                  router.push(`/ecosystem/tutorials/${tutorial.ID}/edit`)
                }
              >
                编辑
              </Button>
            ) : null}
            {tutorial.publish_status === 1 &&
            status === 'authenticated' &&
            canReview ? (
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
              {tutorial.publish_status === 1 && (
                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: '#af78e7' }}
                >
                  待审核
                </div>
              )}
            </div>
            <h1 className={styles.title}>{tutorial.title}</h1>
            <h3 className={styles.description}>{tutorial.description}</h3>
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <Calendar className={styles.metaIcon} />
                <div className={styles.metaText}>
                  发布时间：
                  {formatTime(tutorial.publish_time || tutorial.CreatedAt)}
                </div>
              </div>
              <div className={styles.metaItem}>
                <User className={styles.metaIcon} />
                <div className={styles.metaText}>
                  作者：{tutorial?.author || tutorial.publisher?.username}
                </div>
              </div>
              <div className={styles.metaItem}>
                <User className={styles.metaIcon} />
                <div className={styles.metaText}>
                  发布者：{tutorial.publisher?.username || ''}
                </div>
              </div>
              {tutorial.dapp && (
                <div className={styles.metaItem}>
                  <User className={styles.metaIcon} />
                  <div className={styles.metaText}>
                    DApp：{tutorial.dapp.name}
                  </div>
                </div>
              )}
              <div className={styles.metaItem}>
                <Eye className={styles.metaIcon} />
                <div className={styles.metaText}>
                  浏览量：{tutorial.view_count || '0'}
                </div>
              </div>
              <div className={styles.tags}>
                {tutorial.tags.map((tag: string, index: number) => (
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
                src={tutorial.cover_img || '/placeholder.svg'}
                alt={tutorial.title}
                width={400}
                height={300}
                className={styles.coverImage}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.main}>
        <div className="marked-paper">
          <h2 className={styles.sectionTitle}>{tutorial.title}</h2>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: tutorialContent }}
          />
        </div>
      </div>
      </div>
    </>
  );
}

// 服务端渲染 - 在服务器端获取教程数据
export const getServerSideProps: GetServerSideProps<TutorialDetailPageProps> = async (context) => {
  const { id } = context.params as { id: string };
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return {
      props: {
        initialTutorial: null,
        error: 'API URL is not configured',
      },
    };
  }

  try {
    // 直接在服务端调用 API
    const response = await fetch(`${apiUrl}/tutorials/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        props: {
          initialTutorial: null,
          error: 'Tutorial not found',
        },
      };
    }

    const result = await response.json();
    
    if (result.code === 200 && result.data) {
      return {
        props: {
          initialTutorial: result.data as Tutorial,
        },
      };
    }

    return {
      props: {
        initialTutorial: null,
        error: result.message || 'Failed to fetch tutorial',
      },
    };
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    return {
      props: {
        initialTutorial: null,
        error: 'Failed to fetch tutorial data',
      },
    };
  }
};
