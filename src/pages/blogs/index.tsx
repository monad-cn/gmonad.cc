import { useState, useEffect } from 'react';
import {
  Pagination,
  Input,
  Button,
  Tag,
  Card,
  Image,
  Popconfirm,
  message,
  Modal,
  Row,
  Col,
} from 'antd';
import dayjs from 'dayjs';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Star,
  Share2,
  LayoutGrid,
  List,
  BookOpenText,
  Languages,
  TypeOutline,
} from 'lucide-react';
import { SiWechat, SiX, SiTelegram, SiDiscord } from 'react-icons/si';
import Link from 'next/link';
import styles from './index.module.css';
import { getEvents, deleteEvent } from '../api/event';
import router from 'next/router';
import { useSession } from 'next-auth/react';

const { Search: AntSearch } = Input;

type ViewMode = 'grid' | 'list';

export function formatTime(isoTime: string): string {
  return dayjs(isoTime).format('YYYY-MM-DD');
}

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid'); // 视图模式
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [pageSize, setPageSize] = useState(6); // 每页条数
  const [blogs, setBlogs] = useState<any[]>([]); // 博客列表
  const [total, setTotal] = useState(0); // 总条数
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
  const [selectedTag, setSelectedTag] = useState(''); // 标签
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 排序方式
  const [wechatModalVisible, setWechatModalVisible] = useState(false); // 微信二维码弹窗
  const [publishStatus, setPublishStatus] = useState(2); // 发布状态
  const [readyToLoad, setReadyToLoad] = useState(false); // 是否加载
  const { data: session, status } = useSession(); // 用户会话
  const permissions = session?.user?.permissions || []; // 权限

  // 新增筛选状态
  const [statusFilter, setStatusFilter] = useState('3'); // 状态
  const [locationKeyword, setLocationKeyword] = useState(''); // 地点
  const [blogModeFilter, setEventModeFilter] = useState(''); // 博客类型

  // 加载博客列表
  const loadBlogs = async (params?: {
    keyword?: string;
    tag?: string;
    order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
    status?: string | number;
    location?: string;
    blog_mode?: string;
    publish_status?: number;
  }) => {
    try {
      setLoading(true);

      const queryParams = {
        keyword: params?.keyword || searchKeyword,
        tag: params?.tag || selectedTag,
        order: params?.order || sortOrder,
        page: params?.page || currentPage,
        page_size: params?.page_size || pageSize,
        status: params?.status || statusFilter,
        location: params?.location || locationKeyword,
        blog_mode: params?.blog_mode || blogModeFilter,
        publish_status: params?.publish_status || publishStatus,
      };

      const result = await getEvents(queryParams);

      // if (result.success && result.data) {
      //   // 处理后端返回的数据结构
      //   if (result.data.blogs && Array.isArray(result.data.blogs)) {
      //     setBlogs(result.data.blogs);
      //     setCurrentPage(result.data.page || 1);
      //     setPageSize(result.data.page_size || 6);
      //     setTotal(result.data.total || result.data.blogs.length);
      //   } else if (Array.isArray(result.data)) {
      //     setBlogs(result.data);
      //     setTotal(result.data.length);
      //   } else {
      //     console.warn('API 返回的数据格式不符合预期:', result.data);
      //     setBlogs([]);
      //     setTotal(0);
      //   }
      // } else {
      //   console.error('获取博客列表失败:', result.message);
      //   setBlogs([]);
      //   setTotal(0);
      // }
    } catch (error) {
      console.error('加载博客列表异常:', error);
      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 搜索博客
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1); // 重置到第一页
    await loadBlogs({ keyword, page: 1 });
  };

  // 分页处理
  const handlePageChange = async (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    await loadBlogs({ page, page_size: size || pageSize });
  };

  // 计算当前显示的博客
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  const currentBlogs = blogs; // 服务端已经处理了分页

  const handleDeleteEvent = async (id: number) => {
    // 调用创建博客接口
    try {
      const result = await deleteEvent(id);
      if (result.success) {
        message.success(result.message);
        loadBlogs();
      } else {
        message.error(result.message || '创建博客失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      setPublishStatus(0);
      setReadyToLoad(true);
    } else if (status === 'unauthenticated') {
      setReadyToLoad(true);
    } else {
      setReadyToLoad(true);
    }
    if (readyToLoad) {
      // 如果需要根据登录状态传递 publish_status，可在 loadBlogs 内部处理
      loadBlogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Title Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>社区博客</h1>
            <p className={styles.subtitle}>写下所思所感，遇见共鸣之人</p>
          </div>
          <div className={styles.headerRightActions}>
            <div className={styles.socialLinks}>
              <a
                href="https://x.com/monad_zw"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <SiX size={18} className={styles.socialIcon} />
                <span className={styles.socialButtonText}>关注 X</span>
              </a>
              <a
                href="https://t.me/Chinads"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <SiTelegram size={18} className={styles.socialIcon} />
                <span className={styles.socialButtonText}>加入 Telegram</span>
              </a>
              <a
                href="https://discord.gg/monad"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <SiDiscord size={18} className={styles.socialIcon} />{' '}
                {/* Lucide 没有 Discord 图标，用 Users 替代 */}
                <span className={styles.socialButtonText}>加入 Discord</span>
              </a>
              <button
                className={styles.socialButton}
                onClick={() => setWechatModalVisible(true)}
              >
                <SiWechat size={18} className={styles.socialIcon} />
                <span className={styles.socialButtonText}>微信群</span>
              </button>
            </div>
            {/* {status === 'authenticated' &&
            permissions.includes('blog:write') ? (
              <Link href="/blogs/new" className={styles.createButton}>
                <Plus size={20} />
                创建博客
              </Link>
            ) : null} */}
            <Link href="/blogs/new" className={styles.createButton}>
              <Plus size={20} />
              创建博客
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <AntSearch
            placeholder="搜索博客标题、描述..."
            allowClear
            size="small"
            enterButton="搜索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            onClear={() => handleSearch('')}
            loading={loading}
          />
        </div>
      </div>

      {/* View Controls */}
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
        <div className={styles.resultsInfo}>
          显示 {startIndex}-{endIndex} 项，共 {total} 项
        </div>
      </div>

      {/* Blogs Display */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>加载中...</div>
        </div>
      ) : blogs.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📖</div>
          <div className={styles.emptyTitle}>暂无博客</div>
          <div className={styles.emptyDescription}>
            {searchKeyword ||
            selectedTag ||
            statusFilter ||
            locationKeyword ||
            blogModeFilter
              ? '没有找到符合条件的博客'
              : '还没有创建任何博客'}
          </div>
          {!searchKeyword &&
            !selectedTag &&
            !statusFilter &&
            !locationKeyword &&
            !blogModeFilter && (
              <Link href="/blogs/new" className={styles.createButton}>
                <Plus className={styles.buttonIcon} />
                创建第一个博客
              </Link>
            )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className={styles.blogsGrid}>
          {blogs.map((blog) => (
            <Link
              href={`/blogs/${blog.ID}`}
              key={blog.ID}
              className={styles.cardLink}
            >
              <Card
                className={styles.blogCard}
                cover={
                  <div className={styles.cardCover}>
                    <Image
                      alt={blog.title}
                      src={
                        blog.cover_img ||
                        '/placeholder.svg?height=240&width=400&text=博客封面'
                      }
                      className={styles.coverImage}
                      preview={false}
                    />
                    <div className={styles.coverOverlay}>
                      {blog.publish_status === 1 && (
                        <Tag className={styles.noPublishStatus}>未发布</Tag>
                      )}
                      <div className={styles.cardActions}>
                        {status === 'authenticated' &&
                        permissions.includes('blog:write') ? (
                          <Button
                            className={styles.actionIconButton}
                            onClick={() =>
                              router.push(`/blogs/${blog.ID}/edit`)
                            }
                            icon={<Edit className={styles.actionIcon} />}
                            title="编辑博客"
                          />
                        ) : null}
                        <Button
                          className={styles.actionIconButton}
                          onClick={(e) => {
                            e.preventDefault(); /* 分享逻辑 */
                          }}
                          icon={<Share2 className={styles.actionIcon} />}
                          title="分享博客"
                        />
                        <Button
                          className={styles.actionIconButton}
                          onClick={(e) => {
                            e.preventDefault();
                            if (blog.twitter) {
                              window.open(blog.twitter, '_blank'); // 打开外部链接
                            }
                          }}
                          icon={<SiX className={styles.actionIcon} />}
                          title="查看推文"
                        />
                      </div>
                    </div>
                  </div>
                }
              >
                <div className={styles.cardBody}>
                  <h3 className={styles.blogTitle}>{blog.title}</h3>

                  <div className={styles.cardMeta}>
                    <Row justify="space-between">
                      <Col span={12}>
                        <div className={styles.metaItem}>
                          <Calendar className={styles.metaIcon} />
                          <span>时间：{formatTime(blog.start_time)}</span>
                        </div>
                      </Col>
                      <Col
                        span={12}
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <div className={styles.metaItem}>
                          <BookOpenText className={styles.metaIcon} />
                          <span>作者：小符</span>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <div className={styles.metaItem}>
                          <Languages className={styles.metaIcon} />
                          <span>翻译：Seven</span>
                        </div>
                      </Col>
                      <Col
                        span={12}
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <div className={styles.metaItem}>
                          <TypeOutline className={styles.metaIcon} />
                          <span>排版：QiuQiu</span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className={styles.cardTags}>
                      {blog.tags
                        .slice(0, 3)
                        .map((tag: string, index: number) => (
                          <Tag key={index} className={styles.blogTag}>
                            {tag}
                          </Tag>
                        ))}
                      {blog.tags.length > 3 && (
                        <Tag className={styles.moreTag}>
                          +{blog.tags.length - 3}
                        </Tag>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.listViewContainer}>
          {/* Blogs List */}
          <div className={styles.blogsList}>
            <div className={styles.listHeader}>
              <div className={styles.listHeaderCell}>博客信息</div>
              <div className={styles.listHeaderCell}>时间</div>
              <div className={styles.listHeaderCell}>作者</div>
              <div className={styles.listHeaderCell}>翻译</div>
              <div className={styles.listHeaderCell}>排版</div>
              <div className={styles.listHeaderCell}>操作</div>
            </div>
            {currentBlogs.map((blog) => (
              <div key={blog.ID} className={styles.listRow}>
                <div className={styles.listCell}>
                  <div className={styles.blogInfo}>
                    <div className={styles.blogTitleRow}>
                      <Link
                        href={`/blogs/${blog.ID}`}
                        key={blog.ID}
                        className={styles.listLink}
                      >
                        {blog.title}
                      </Link>
                      {blog.featured && (
                        <Star className={styles.listFeaturedIcon} />
                      )}
                    </div>
                    <p className={styles.listEventDescription}>{blog.desc}</p>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.timeInfo}>
                    <div className={styles.dateTime}>
                      <Calendar className={styles.listIcon} />
                      <span>{formatTime(blog.start_time)}</span>
                    </div>
                    {/* {blog.end_time && (
                      <div className={styles.time}>
                        至 {formatTime(blog.end_time)}
                      </div>
                    )} */}
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.participantsInfo}>
                    <BookOpenText className={styles.listIcon} />
                    <span>小符</span>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.participantsInfo}>
                    <Languages className={styles.listIcon} />
                    <span>Seven</span>
                  </div>
                </div>

                <div className={styles.listCell}>
                  <div className={styles.participantsInfo}>
                    <TypeOutline className={styles.listIcon} />
                    <span>QiuQiu</span>
                  </div>
                </div>

                <div className={styles.listCell}>
                  <div className={styles.listActions}>
                    {/* <Button
                      type="text"
                      size="small"
                      icon={<Eye className={styles.listActionIcon} />}
                      title="查看详情"
                    /> */}
                    {status === 'authenticated' &&
                    permissions.includes('blog:write') ? (
                      <Button
                        type="text"
                        size="small"
                        icon={<Edit className={styles.listActionIcon} />}
                        title="编辑博客"
                        onClick={() => router.push(`/blogs/${blog.ID}/edit`)}
                      />
                    ) : null}
                    <Button
                      type="text"
                      size="small"
                      icon={<Share2 className={styles.listActionIcon} />}
                      title="分享博客"
                    />
                    {status === 'authenticated' &&
                    permissions.includes('blog:delete') ? (
                      <Popconfirm
                        title="删除博客"
                        description="你确定删除这个博客吗？"
                        okText="是"
                        cancelText="否"
                        onConfirm={() => handleDeleteEvent(blog.ID)}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<Trash2 className={styles.listActionIcon} />}
                          title="删除博客"
                        />
                      </Popconfirm>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
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
            showQuickJumper={true}
            showTotal={(total, range) =>
              `显示 ${startIndex}-${endIndex} 项，共 ${total} 项`
            }
            className={styles.fullPagination}
          />
        </div>
      </div>

      <Modal
        open={wechatModalVisible}
        onCancel={() => setWechatModalVisible(false)}
        footer={null}
        centered
        className={styles.wechatModal}
      >
        <div className={styles.wechatModalContent}>
          <div className={styles.qrCodeSection}>
            <Image
              src="/wechat.png?height=200&width=200"
              alt="小助手二维码"
              width={200}
              height={200}
              preview={false}
            />
            <p>扫码加入微信群</p>
          </div>
          <div className={styles.qrCodeSection}>
            <Image
              src="/monad_cn_gzh.png?height=200&width=200"
              alt="公众号二维码"
              width={200}
              height={200}
              preview={false}
            />
            <p>扫码关注公众号</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
