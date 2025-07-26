import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Tag, Avatar, Modal, App as AntdApp, Image } from 'antd';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  Share2,
  Heart,
  ExternalLink,
  Edit,
  Star,
  User,
  Mail,
  Copy,
  Download,
  CheckCircle,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';
import styles from './index.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { getEventById, updateEventPublishStatus } from '@/pages/api/event';
import { SiX } from 'react-icons/si';
import { getRecapByEventId } from '@/pages/api/recap';
import { sanitizeMarkdown } from '@/lib/markdown';

export default function EventDetailPage() {
  const { message } = AntdApp.useApp();
  const router = useRouter();
  const { id } = router.query; // 路由参数应该叫 id，不是 ids
  const rId = Array.isArray(id) ? id[0] : id;

  const [event, setEvent] = useState<any>(null);
  const [recap, setRecap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'intro' | 'recap'>('intro');

  // 使用统一的认证上下文，避免重复调用 useSession
  const { session, status } = useAuth();

  const permissions = session?.user?.permissions || [];

  // parseMarkdown将返回的markdown转为html展示
  const [eventContent, setEventContent] = useState<string>('');
  const [recapContent, setRecapContent] = useState<string>('');

  useEffect(() => {
    if (event?.description) {
      sanitizeMarkdown(event.description).then((htmlContent) => {
        setEventContent(htmlContent);
      });
    }
  }, [event?.description]);

  useEffect(() => {
    if (recap?.content) {
      sanitizeMarkdown(recap.content).then((htmlContent) => {
        setRecapContent(htmlContent);
      });
    }
  }, [recap?.content]);

  const handleUpdatePublishStatus = async () => {
    try {
      const result = await updateEventPublishStatus(event.ID, 2);
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
        // 获取活动详情
        const eventRes = await getEventById(rId);
        console.log('获取活动详情:', eventRes);
        setEvent(eventRes?.data ?? null);

        // 获取活动回顾
        const recapRes = await getRecapByEventId(rId);
        console.log('获取活动回顾:', recapRes);

        if (recapRes.success && recapRes.data) {
          setRecap(recapRes.data);
        } else {
          setRecap(null); // 没有数据也清空
        }
      } catch (error) {
        message.error('加载失败');
        setEvent(null);
        setRecap(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, rId]);

  const handleRegister = () => {
    if (isRegistered) {
      message.success('已取消报名');
      setIsRegistered(false);
    } else {
      message.success('报名成功！');
      setIsRegistered(true);
    }
  };

  const handleFavorite = () => {
    if (isFavorited) {
      message.success('已取消收藏');
      setIsFavorited(false);
    } else {
      message.success('已添加到收藏');
      setIsFavorited(true);
    }
  };

  const handleShare = (platform?: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      message.success('链接已复制到剪贴板');
    } else if (platform === 'twitter') {
      const text = `${event.title} - ${window.location.href}`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      );
    } else {
      setShareModalVisible(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (
    !event ||
    (event.publish_status === 1 && !permissions.includes('event:write'))
  ) {
    return (
      <div className={styles.error}>
        <h2>活动不存在</h2>
        <p>抱歉，找不到您要查看的活动</p>
        <Link href="/events" className={styles.backButton}>
          返回活动列表
        </Link>
      </div>
    );
  }

  const getEventStatus = () => {
    if (event.status === 0) {
      return { text: '即将开始', type: 'upcoming', color: '#10b981' };
    } else if (event.status === 1) {
      return { text: '进行中', type: 'ongoing', color: '#3b82f6' };
    } else {
      return { text: '已结束', type: 'ended', color: '#6b7280' };
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
      time: date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const eventStatus = getEventStatus();
  const startDateTime = formatDateTime(event.start_time);
  const endDateTime = formatDateTime(event.end_time);

  return (
    <div className={`${styles.container} nav-t-top`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/events" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            返回活动列表
          </Link>
          <div className={styles.headerActions}>
            {status === 'authenticated' &&
              permissions.includes('event:write') ? (
              <Button
                icon={<Edit size={16} className={styles.actionIcon} />}
                className={styles.actionButton}
                onClick={() => router.push(`/events/${event.ID}/edit`)}
              >
                编辑
              </Button>
            ) : null}
            {event.publish_status === 1 &&
              status === 'authenticated' &&
              permissions.includes('event:review') ? (
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
              <div
                className={styles.statusBadge}
                style={{ backgroundColor: eventStatus.color }}
              >
                {eventStatus.text}
              </div>
              {event.publish_status === 1 && (
                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: '#af78e7' }}
                >
                  待审核
                </div>
              )}
            </div>
            <h1 className={styles.title}>{event.title}</h1>
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <Calendar className={styles.metaIcon} />
                <div>
                  <div className={styles.metaText}>{startDateTime.date}</div>
                  <div className={styles.metaSubtext}>
                    {startDateTime.time} - {endDateTime.time}
                  </div>
                </div>
              </div>
              <div className={styles.metaItem}>
                {event.event_mode === '线上活动' ? (
                  <Globe className={styles.metaIcon} />
                ) : (
                  <MapPin className={styles.metaIcon} />
                )}
                <div>
                  <div className={styles.metaText}>
                    {event.event_mode === '线上活动'
                      ? '线上活动'
                      : event.location}
                  </div>
                </div>
              </div>
              <div className={styles.metaItem}>
                <Users className={styles.metaIcon} />
                <div>
                  <div className={styles.metaText}>{event.participants} 人</div>
                  {/* <div className={styles.metaSubtext}>已报名参与</div> */}
                </div>
              </div>
            </div>
            <div className={styles.tags}>
              {event.tags.map((tag: string, index: number) => (
                <Tag key={index} className={styles.tag}>
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.coverContainer}>
              <Image
                src={event.cover_img || '/placeholder.svg'}
                alt={event.title}
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
        <div className={styles.content}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Description */}
            <section className={styles.section}>
              <div className={styles.titleTabRow}>
                <div className={styles.sectionTabs}>
                  <Button
                    type="text"
                    className={`${styles.sectionTab} ${activeTab === 'intro' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('intro')}
                  >
                    活动介绍
                  </Button>
                  <Button
                    type="text"
                    className={`${styles.sectionTab} ${activeTab === 'recap' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('recap')}
                  >
                    活动回顾
                  </Button>
                </div>
              </div>

              {activeTab === 'intro' ? (
                <div
                  className={`${styles.richText} prose`}
                  dangerouslySetInnerHTML={{ __html: eventContent }}
                />
              ) : (
                recap?.content ? (
                  <div
                    className={`${styles.richText} prose`}
                    dangerouslySetInnerHTML={{ __html: recapContent }}
                  />
                ) : (
                  <div className={styles.richText}>暂无活动回顾内容</div>
                )
              )}
            </section>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>活动议程</h2>
                <div className={styles.agenda}>
                  {event.agenda.map((item: any, index: number) => (
                    <div key={index} className={styles.agendaItem}>
                      <div className={styles.agendaTime}>
                        <Clock size={16} />
                        {item.time}
                      </div>
                      <div className={styles.agendaContent}>
                        <h4 className={styles.agendaTitle}>{item.title}</h4>
                        <p className={styles.agendaDescription}>
                          {item.description}
                        </p>
                        <div className={styles.agendaSpeaker}>
                          <User size={14} />
                          {item.speaker}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements & Benefits */}
            <div className={styles.requirementsBenefits}>
              {event.requirements && event.requirements.length > 0 && (
                <div className={styles.requirements}>
                  <h3 className={styles.subsectionTitle}>参与要求</h3>
                  <ul className={styles.list}>
                    {event.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {event.benefits && event.benefits.length > 0 && (
                <div className={styles.benefits}>
                  <h3 className={styles.subsectionTitle}>你将获得</h3>
                  <ul className={styles.list}>
                    {event.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>


          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Registration Card */}
            {event.status !== 2 && (
              <div className={styles.registrationCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>参与活动</h3>
                  <div className={styles.price}>免费</div>
                </div>
                <div className={styles.cardContent}>
                  {event.event_mode === '线下活动' && event.registration_link && (
                    <>
                      <div className={styles.participantCount}>
                        <Users size={20} />
                        <span>
                          {event.participants} 人已报名
                          {/* {event.max_participants &&
                        ` / ${event.max_participants} 人`} */}
                        </span>
                      </div>
                      {event.registration_deadline && (
                        <div className={styles.deadline}>
                          <Clock size={16} />
                          报名截止：
                          {formatDateTime(event.registration_deadline).date}
                        </div>
                      )}
                      <Button
                        type="primary"
                        size="large"
                        className={styles.registerButton}
                        onClick={() => {
                          window.open(event.registration_link, '_blank');
                        }}
                      >

                        立即报名
                      </Button>
                    </>
                  )}
                  {event.event_mode === '线上活动' && event.link && (
                    <Button
                      icon={<ExternalLink size={16} />}
                      className={styles.joinButton}
                      onClick={() => window.open(event.link, '_blank')}
                    // disabled={eventStatus.type !== 'ongoing'}
                    >
                      加入会议
                    </Button>
                  )}
                </div>
              </div>
            )}
            {/* Organizer Card */}
            {event.status === 3 && (
              <div className={styles.organizerCard}>
                <h3 className={styles.cardTitle}>主办方</h3>
                <div className={styles.organizerInfo}>
                  <Avatar
                    size={64}
                    src={event.organizer?.avatar}
                    className={styles.organizerAvatar}
                  />
                  <div className={styles.organizerDetails}>
                    <h4 className={styles.organizerName}>
                      {event.organizer?.name}
                    </h4>
                    <p className={styles.organizerTitle}>
                      {event.organizer?.title} @ {event.organizer?.company}
                    </p>
                    <p className={styles.organizerBio}>
                      {event.organizer?.bio}
                    </p>
                    <div className={styles.organizerContact}>
                      {event.organizer?.email && (
                        <a
                          href={`mailto:${event.organizer?.email}`}
                          className={styles.contactLink}
                          title="发送邮件"
                        >
                          <Mail size={16} />
                        </a>
                      )}
                      {event.organizer?.twitter && (
                        <a
                          href={`https://twitter.com/${event.organizer?.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.contactLink}
                          title="Twitter"
                        >
                          <SiX size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Share Card */}
            <div className={styles.shareCard}>
              <h3 className={styles.cardTitle}>分享活动</h3>
              <div className={styles.shareButtons}>
                <Button
                  icon={<Copy size={16} />}
                  className={styles.shareButton}
                  onClick={() => handleShare('copy')}
                >
                  复制链接
                </Button>
                <Button
                  icon={<SiX size={16} />}
                  className={styles.shareButton}
                  onClick={() => handleShare('twitter')}
                >
                  分享到 X
                </Button>
              </div>
            </div>
            {status === 'authenticated' &&
              permissions.includes('blog:write') && !recap && event.status === 2 && // 用户默认拥有博客创作权限，默认用户都可以添加活动回顾
              <div className={styles.recapCard}>
                <h3 className={styles.cardTitle}>活动回顾</h3>
                <p className={styles.description}>你可以为本次活动添加活动回顾。</p>
                <Button
                  type="primary"
                  className={styles.actionButton}
                  onClick={() => {
                    router.push(`/events/${event.ID}/recap`);
                  }}
                >
                  添加活动回顾
                </Button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
