import { useState, useEffect } from 'react';
import {
  Pagination,
  Input,
  Button,
  Tag,
  Card,
  Popconfirm,
  Modal,
  Image,
  Row,
  Col,
  App as AntdApp,
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
  Eye,
} from 'lucide-react';
import { SiWechat, SiX, SiTelegram, SiDiscord } from 'react-icons/si';
import Link from 'next/link';
import styles from './index.module.css';
import { getEvents, deleteEvent } from '../api/event';
import router from 'next/router';
import { useSession } from 'next-auth/react';
import { getBlogs } from '../api/blog';

const { Search: AntSearch } = Input;

type ViewMode = 'grid' | 'list';

export function formatTime(isoTime: string): string {
  return dayjs(isoTime).format('YYYY-MM-DD HH:MM');
}

export default function BlogsPage() {
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
  const { message } = AntdApp.useApp();

  // 新增筛选状态
  const [locationKeyword, setLocationKeyword] = useState(''); // 地点
  const [blogModeFilter, setEventModeFilter] = useState(''); // 博客类型

  // 加载博客列表
  const loadBlogs = async (params?: {
    keyword?: string;
    tag?: string;
    order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
  }) => {
    try {
      setLoading(true);

      const queryParams = {
        keyword: params?.keyword || searchKeyword,
        tag: params?.tag || selectedTag,
        order: params?.order || sortOrder,
        page: params?.page || currentPage,
        page_size: params?.page_size || pageSize,
      };

      // const result = await getBlogs(queryParams);
      const result = {
        success: true,
        message: 'success',
        data: {
          blogs: [
            {
              ID: 1,
              CreatedAt: '2025-06-24T02:04:51.570294+08:00',
              UpdatedAt: '2025-06-24T02:04:51.570294+08:00',
              DeletedAt: null,
              title: 'Monad vs Rollups',
              description:
                'Monad 是一个兼容以太坊的高性能 L1 区块链，旨在解决传统区块链的性能瓶颈，其设计目标是实现每秒可 处理 10,0',
              content:
                '<p><span style="background-color: rgb(255, 255, 255); color: rgb(31, 35, 40);">Monad 是一个兼容以太坊的高性能 L1 区块链，旨在解决传统区块链的性能瓶颈，其设计目标是实现每秒可 处理 10,000 笔交易（TPS）的吞吐量，并在 1 秒内生成新的区块，提供单时隙最终性。</span></p>',
              source_link: 'https://www.monad.xyz/post/monad-vs-rollups',
              cover_img:
                'https://res.cloudinary.com/gmonad/image/upload/v1750701711/monad_img/nu1t0aen0gxi2ak8msor.jpg',
              tags: ['Rolluos', 'Monad', '并行执行'],
              category: 'blog',
              author: '小符',
              translator: '',
              publisher_id: 2,
              publisher: {
                ID: 2,
                CreatedAt: '2025-06-21T20:40:55.271972+08:00',
                UpdatedAt: '2025-06-24T19:44:20.010582+08:00',
                DeletedAt: null,
                email: 'smallfu666@gmail.com',
                username: 'Phoouze',
                avatar:
                  'https://file-cdn.openbuild.xyz/users/36689/avatar/7012805-958944400.jpg',
                github: 'phoouze',
                events: null,
                articles: null,
              },
              publish_time: null,
              publish_status: 1,
            },
          ],
          guides: null,
          page: 1,
          page_size: 6,
          total: 1,
        },
      };

      if (result.success && result.data) {
        // 处理后端返回的数据结构
        if (result.data.blogs && Array.isArray(result.data.blogs)) {
          console.log(result.data.blogs);
          setBlogs(result.data.blogs);
          setCurrentPage(result.data.page || 1);
          setPageSize(result.data.page_size || 6);
          setTotal(result.data.total || result.data.blogs.length);
        } else if (Array.isArray(result.data)) {
          setBlogs(result.data);
          setTotal(result.data.length);
        } else {
          console.warn('API 返回的数据格式不符合预期:', result.data);
          setBlogs([]);
          setTotal(0);
        }
      } else {
        console.error('获取博客列表失败:', result.message);
        setBlogs([]);
        setTotal(0);
      }
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
    loadBlogs();
  }, [status, searchKeyword]);

  return (
    <div className={styles.container}>
      {/* Title Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>社区博客</h1>
            <p className={styles.subtitle}>写下所思所感，遇见共鸣之人</p>
          </div>
          {status === 'authenticated' && permissions.includes('blog:write') ? (
            <Link href="/blogs/new" className={styles.createButton}>
              <Plus size={20} />
              创建博客
            </Link>
          ) : null}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <AntSearch
            placeholder="搜索博客标题、描述..."
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
            {searchKeyword || selectedTag || locationKeyword || blogModeFilter
              ? '没有找到符合条件的博客'
              : '还没有创建任何博客'}
          </div>
          {!searchKeyword && !selectedTag && !blogModeFilter && (
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
                        '/placeholder.svg?height=240&width=400&text=活动封面'
                      }
                      className={styles.coverImage}
                      preview={false}
                    />
                    <div className={styles.coverOverlay}>
                      {blog.publish_status === 1 && (
                        <Tag className={styles.noPublishStatus}>待审核</Tag>
                      )}
                      <div className={styles.cardActions}>
                        <Button
                          className={styles.actionIconButton}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/blogs/${blog.ID}/edit`);
                          }}
                          icon={<Edit className={styles.actionIcon} />}
                          title="编辑活动"
                        />

                        {/* {status === 'authenticated' &&
                        blog.publisher_id.toString() === session.user?.uid ? (
                          <Button
                            className={styles.actionIconButton}
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/blogs/${blog.ID}/edit`);
                            }}
                            icon={<Edit className={styles.actionIcon} />}
                            title="编辑活动"
                          />
                        ) : null}
                        <Button
                          className={styles.actionIconButton}
                          onClick={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(
                              `${window.location.href}/${blog.ID}`
                            );
                            message.success('链接已复制到剪贴板');
                          }}
                          icon={<Share2 className={styles.actionIcon} />}
                          title="分享博客"
                        /> */}
                      </div>
                    </div>
                  </div>
                }
              >
                <div className={styles.cardBodyNew}>
                  <h3 className={styles.blogTitleNew}>{blog.title}</h3>
                  <p className={styles.blogDescriptionNew}>
                    {blog.description}
                  </p>

                  <div className={styles.cardFooter}>
                    <div className={styles.authorInfo}>
                      <Image
                        src={blog.publisher.avatar}
                        alt={blog.publisher.username}
                        width={32}
                        height={32}
                        preview={false}
                        className={styles.avatar}
                      />
                      <div className={styles.authorText}>
                        <span className={styles.authorName}>
                          {blog.publisher?.username || ''}
                        </span>
                        <span className={styles.publishTime}>
                          {dayjs(blog.publish_time || blog.CreatedAt).format(
                            'YYYY年M月D日'
                          )}{' '}
                          · {blog.read_time || '6 分钟'}阅读
                        </span>
                      </div>
                      <div className={styles.viewCount}>
                        <Eye size={24} />
                        <span className={styles.viewCountText}>
                          {blog.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
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
              <div className={styles.listHeaderCell}>发布者</div>
              <div className={styles.listHeaderCell}>浏览量</div>
              <div className={styles.listHeaderCell}>状态</div>
              <div className={styles.listHeaderCell}>操作</div>
            </div>
            {currentBlogs.map((blog) => (
              <div key={blog.ID} className={styles.listRow}>
                <div className={styles.listCell}>
                  <div className={styles.blogInfo}>
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
                  <div className={styles.publisherInfo}>
                    <span>{blog.publisher.username}</span>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.listViewCount}>
                    <Eye size={24} />
                    <span className={styles.listViewCountText}>
                      {blog.view_count || '0'}
                    </span>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.publishStatusInfo}>
                    {blog.publish_status === 1 && (
                      <Tag color="warning">待审核</Tag>
                    )}
                    {blog.publish_status === 2 && (
                      <Tag color="success">已发布</Tag>
                    )}
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
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(
                          `${window.location.href}/${blog.ID}`
                        );
                        message.success('链接已复制到剪贴板');
                      }}
                      icon={<Share2 className={styles.listActionIcon} />}
                      title="分享活动"
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
