import { useCallback, useEffect, useState } from 'react';
import {
  App as AntdApp,
  Button,
  Card,
  Image,
  Input,
  Pagination,
  Popconfirm,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import {
  Calendar,
  Edit,
  Eye,
  LayoutGrid,
  List,
  Plus,
  Share2,
  Trash2,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  Newsletter,
  deleteNewsletter,
  getNewsletters,
} from '../api/newsletter';
import styles from '../blogs/index.module.css';

const { Search: AntSearch } = Input;

type ViewMode = 'grid' | 'list';

const formatTime = (isoTime?: string) =>
  isoTime ? dayjs(isoTime).format('YYYY-MM-DD HH:mm') : '';

export default function NewsletterPage() {
  const router = useRouter();
  const { message } = AntdApp.useApp();
  const { session, status } = useAuth();
  const permissions = session?.user?.permissions || [];
  const canReview = permissions.includes('blog:review');
  const canCreate = status === 'authenticated' && permissions.includes('blog:write');

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [publishStatus, setPublishStatus] = useState(2);

  // 周报列表通过独立的 newsletter API 封装获取，避免页面直接依赖博客 API。
  const loadNewsletters = useCallback(async (params?: {
    keyword?: string;
    page?: number;
    page_size?: number;
    publish_status?: number;
  }) => {
    try {
      setLoading(true);
      const result = await getNewsletters({
        keyword: params?.keyword ?? searchKeyword,
        order: 'desc',
        page: params?.page ?? currentPage,
        page_size: params?.page_size ?? pageSize,
        publish_status: params?.publish_status ?? publishStatus,
      });

      if (result.success && result.data?.newsletters) {
        setNewsletters(result.data.newsletters);
        setCurrentPage(result.data.page || 1);
        setPageSize(result.data.page_size || 6);
        setTotal(result.data.total || result.data.newsletters.length);
        return;
      }

      setNewsletters([]);
      setTotal(0);
    } catch (error) {
      console.error('加载周报列表异常:', error);
      setNewsletters([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, publishStatus, searchKeyword]);

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
    await loadNewsletters({ keyword, page: 1 });
  };

  const handlePageChange = async (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) setPageSize(size);
    await loadNewsletters({ page, page_size: size || pageSize });
  };

  const handleDeleteNewsletter = async (id: number) => {
    try {
      const result = await deleteNewsletter(id);
      if (result.success) {
        message.success(result.message);
        await loadNewsletters();
      } else {
        message.error(result.message || '删除周报失败');
      }
    } catch {
      message.error('删除周报出错，请重试');
    }
  };

  const handleShare = async (id: number) => {
    await navigator.clipboard.writeText(`${window.location.origin}/newsletter/${id}`);
    message.success('周报链接已复制到剪贴板');
  };

  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  useEffect(() => {
    if (status === 'loading') return;
    const nextPublishStatus = status === 'authenticated' && canReview ? 0 : 2;
    setPublishStatus(nextPublishStatus);
    loadNewsletters({ publish_status: nextPublishStatus });
  }, [status, canReview, loadNewsletters]);

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>周报</h1>
            <p className={styles.subtitle}>聚合 Monad 中文社区每周重点动态</p>
          </div>
          {canCreate ? (
            <Link href="/newsletter/new" className={styles.createButton}>
              <Plus size={20} />
              创建周报
            </Link>
          ) : null}
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <AntSearch
            placeholder="搜索周报标题、摘要..."
            allowClear
            size="large"
            enterButton="搜索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            onClear={() => handleSearch('')}
            loading={loading}
          />
        </div>
      </div>

      <div className={styles.viewControls}>
        <div className={styles.viewModeToggle}>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className={styles.viewModeIcon} />
            卡片视图
          </button>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List className={styles.viewModeIcon} />
            列表视图
          </button>
        </div>
        <Pagination
          current={currentPage}
          total={total}
          pageSize={pageSize}
          onChange={handlePageChange}
          showTotal={(total) => `显示 ${startIndex}-${endIndex} 项，共 ${total} 项`}
          className={styles.fullPagination}
        />
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>加载中...</div>
        </div>
      ) : newsletters.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📰</div>
          <div className={styles.emptyTitle}>暂无周报</div>
          <div className={styles.emptyDescription}>
            {searchKeyword ? '没有找到符合条件的周报' : '还没有创建任何周报'}
          </div>
          {canCreate ? (
            <Link href="/newsletter/new" className={styles.createButton}>
              <Plus className={styles.buttonIcon} />
              创建第一篇周报
            </Link>
          ) : null}
        </div>
      ) : viewMode === 'grid' ? (
        <div className={styles.blogsGrid}>
          {newsletters.map((newsletter) => {
            const isPublisher =
              newsletter.publisher_id?.toString() === session?.user?.uid;

            return (
              <Link
                href={`/newsletter/${newsletter.ID}`}
                key={newsletter.ID}
                className={styles.cardLink}
              >
                <Card
                  className={styles.blogCard}
                  cover={
                    <div className={styles.cardCover}>
                      <Image
                        alt={newsletter.title}
                        src={newsletter.cover_img || '/placeholder.svg'}
                        className={styles.coverImage}
                        preview={false}
                      />
                      <div className={styles.coverOverlay}>
                        {newsletter.publish_status === 1 ? (
                          <Tag className={styles.noPublishStatus}>待审核</Tag>
                        ) : null}
                        <div className={styles.cardActions}>
                          {status === 'authenticated' && isPublisher ? (
                            <Button
                              className={styles.actionIconButton}
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(`/newsletter/${newsletter.ID}/edit`);
                              }}
                              icon={<Edit className={styles.actionIcon} />}
                              title="编辑周报"
                            />
                          ) : null}
                          <Button
                            className={styles.actionIconButton}
                            onClick={(e) => {
                              e.preventDefault();
                              handleShare(newsletter.ID);
                            }}
                            icon={<Share2 className={styles.actionIcon} />}
                            title="分享周报"
                          />
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className={styles.cardBodyNew}>
                    <h3 className={styles.blogTitleNew}>{newsletter.title}</h3>
                    <p className={styles.blogDescriptionNew}>
                      {newsletter.description}
                    </p>
                    <div className={styles.cardFooter}>
                      <div className={styles.authorInfo}>
                        <Image
                          src={newsletter.publisher?.avatar || '/logo.png'}
                          alt={newsletter.publisher?.username || '发布者'}
                          width={32}
                          height={32}
                          preview={false}
                          className={styles.avatar}
                          referrerPolicy="no-referrer"
                        />
                        <div className={styles.authorText}>
                          <span className={styles.authorName}>
                            {newsletter.publisher?.username || newsletter.author || ''}
                          </span>
                          <span className={styles.publishTime}>
                            {dayjs(newsletter.publish_time || newsletter.CreatedAt).format(
                              'YYYY年M月D日'
                            )}
                          </span>
                        </div>
                        <div className={styles.viewCount}>
                          <Eye size={24} />
                          <span className={styles.viewCountText}>
                            {newsletter.view_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={styles.listViewContainer}>
          <div className={styles.blogsList}>
            <div className={styles.listHeader}>
              <div className={styles.listHeaderCell}>周报信息</div>
              <div className={styles.listHeaderCell}>作者</div>
              <div className={styles.listHeaderCell}>时间</div>
              <div className={styles.listHeaderCell}>浏览量</div>
              <div className={styles.listHeaderCell}>状态</div>
              <div className={styles.listHeaderCell}>操作</div>
            </div>
            {newsletters.map((newsletter) => {
              const isPublisher =
                newsletter.publisher_id?.toString() === session?.user?.uid;

              return (
                <div key={newsletter.ID} className={styles.listRow}>
                  <div className={styles.listCell}>
                    <Link
                      href={`/newsletter/${newsletter.ID}`}
                      className={styles.listLink}
                    >
                      {newsletter.title}
                    </Link>
                  </div>
                  <div className={styles.listCell}>
                    <div className={styles.publisherInfo}>
                      <UserRound className={styles.listIcon} />
                      <span>{newsletter.author || newsletter.publisher?.username || ''}</span>
                    </div>
                  </div>
                  <div className={styles.listCell}>
                    <div className={styles.dateTime}>
                      <Calendar className={styles.listIcon} />
                      <span>
                        {formatTime(newsletter.publish_time || newsletter.CreatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.listCell}>
                    <div className={styles.listViewCount}>
                      <Eye size={24} />
                      <span className={styles.listViewCountText}>
                        {newsletter.view_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className={styles.listCell}>
                    {newsletter.publish_status === 1 ? (
                      <Tag color="warning">待审核</Tag>
                    ) : null}
                    {newsletter.publish_status === 2 ? (
                      <Tag color="success">已发布</Tag>
                    ) : null}
                  </div>
                  <div className={styles.listCell}>
                    <div className={styles.listActions}>
                      {status === 'authenticated' && isPublisher ? (
                        <Button
                          type="text"
                          size="small"
                          icon={<Edit className={styles.listActionIcon} />}
                          title="编辑周报"
                          onClick={() => router.push(`/newsletter/${newsletter.ID}/edit`)}
                        />
                      ) : null}
                      <Button
                        type="text"
                        size="small"
                        icon={<Share2 className={styles.listActionIcon} />}
                        title="分享周报"
                        onClick={() => handleShare(newsletter.ID)}
                      />
                      {status === 'authenticated' && isPublisher ? (
                        <Popconfirm
                          title="删除周报"
                          description="你确定删除这篇周报吗？"
                          okText="是"
                          cancelText="否"
                          onConfirm={() => handleDeleteNewsletter(newsletter.ID)}
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<Trash2 className={styles.listActionIcon} />}
                            title="删除周报"
                          />
                        </Popconfirm>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.listBottomControls}>
        <div className={styles.bottomPagination}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showTotal={(total) => `显示 ${startIndex}-${endIndex} 项，共 ${total} 项`}
            className={styles.fullPagination}
          />
        </div>
      </div>
    </div>
  );
}
