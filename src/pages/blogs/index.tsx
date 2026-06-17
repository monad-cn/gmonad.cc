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
  Eye,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import styles from './index.module.css';

import router from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogs,deleteBlog } from '@/services/api/blog';

const { Search: AntSearch } = Input;

type ViewMode = 'grid' | 'list';

export function formatTime(isoTime: string): string {
  return dayjs(isoTime).format('YYYY-MM-DD HH:mm');
}

export default function BlogsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [wechatModalVisible, setWechatModalVisible] = useState(false);
  const [publishStatus, setPublishStatus] = useState(2);
  // 使用统一的认证上下文，避免重复调用 useSession
  const { session, status } = useAuth();

  const permissions = session?.user?.permissions || [];

  const { message } = AntdApp.useApp();

  // 加载博客列表
  const loadBlogs = async (params?: {
    keyword?: string;
    tag?: string;
    order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
    publish_status?: number;
  }) => {
    try {
      setLoading(true);

      const queryParams = {
        keyword: params?.keyword ?? searchKeyword,
        tag: params?.tag ?? selectedTag,
        order: params?.order ?? sortOrder,
        page: params?.page ?? currentPage,
        page_size: params?.page_size ?? pageSize,
        publish_status: params?.publish_status ?? publishStatus,
      };

      const result = await getBlogs(queryParams);
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

  const handleDeleteBlog = async (id: number) => {
    // 调用创建博客接口
    try {
      const result = await deleteBlog(id);
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

  const handleSwitchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (status === 'loading') return; // 等待认证状态确定
    const newPublishStatus =
      status === 'authenticated' && permissions.includes('blog:review') ? 0 : 2;
    setPublishStatus(newPublishStatus);

    // 直接调用 loadBlogs，避免 publishStatus 状态更新延迟
    loadBlogs({ publish_status: newPublishStatus });
  }, [status, permissions.length]);

  return (
    <div className={`${styles.container} nav-t-top`}>
      {/* Title Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>博客</h1>
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
            onClick={() => handleSwitchViewMode('grid')}
          >
            <LayoutGrid className={styles.viewModeIcon} />
            卡片视图
          </button>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => handleSwitchViewMode('list')}
          >
            <List className={styles.viewModeIcon} />
            列表视图
          </button>
        </div>
        <div className={styles.resultsInfo}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showTotal={(total, range) =>
              `显示 ${startIndex}-${endIndex} 项，共 ${total} 项`
            }
            className={styles.fullPagination}
          />
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
            {searchKeyword || selectedTag
              ? '没有找到符合条件的博客'
              : '还没有创建任何博客'}
          </div>
          {!searchKeyword && !selectedTag && (
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
                        {/* 只有博客作者才可以编辑 */}
                        {status === 'authenticated' &&
                        blog.publisher_id.toString() === session?.user?.uid ? (
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
                        />
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
                        referrerPolicy="no-referrer"
                      />
                      <div className={styles.authorText}>
                        <span className={styles.authorName}>
                          {blog.publisher?.username || ''}
                        </span>
                        <span className={styles.publishTime}>
                          {dayjs(blog.publish_time || blog.CreatedAt).format(
                            'YYYY年M月D日'
                          )}{' '}
                          {/* · {blog.read_time || '6 分钟'}阅读 */}
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
              <div className={styles.listHeaderCell}>作者</div>
              <div className={styles.listHeaderCell}>时间</div>
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
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.publisherInfo}>
                    <UserRound className={styles.listIcon} />
                    <span>{blog.author}</span>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.timeInfo}>
                    <div className={styles.dateTime}>
                      <Calendar className={styles.listIcon} />
                      <span>{formatTime(blog.start_time)}</span>
                    </div>
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
                    {/* 只有博客发布者才可以编辑 */}
                    {status === 'authenticated' &&
                    blog.publisher_id.toString() === session?.user?.uid ? (
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
                    {/* 只有博客发布者才可以删除*/}
                    {status === 'authenticated' &&
                    blog.publisher_id?.toString() === session?.user?.uid ? (
                      <Popconfirm
                        title="删除博客"
                        description="你确定删除这个博客吗？"
                        okText="是"
                        cancelText="否"
                        onConfirm={() => handleDeleteBlog(blog.ID)}
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
            // showQuickJumper={true}
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
