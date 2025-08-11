import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Input, Select, Card, Tag, Empty, Spin, Image, Pagination } from 'antd';
import { Search, BookOpen,   Filter, Plus } from 'lucide-react';
import { debounce } from 'lodash';
import styles from './index.module.css';
import { getTutorials } from '@/pages/api/tutorial';
import { useAuth } from '@/contexts/AuthContext';

const { Option } = Select;

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<any[]>([]);
  // const [selectedCategory, setSelectedCategory] = useState('all');
  // const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [publishStatus, setPublishStatus] = useState(2);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { session, status } = useAuth();
  const permissions = session?.user?.permissions || [];

  // const categories = ['all', 'DeFi', 'NFT', '钱包', '游戏', '工具'];
  // const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  const handleSortChange = async (order: 'asc' | 'desc') => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  // 防抖处理搜索关键词
  const debouncedUpdateSearchKeyword = useCallback(
    debounce((keyword: string) => {
      setDebouncedSearchKeyword(keyword);
      setCurrentPage(1); // 搜索时重置到第一页
    }, 500),
    []
  );

  // 当搜索关键词改变时，触发防抖更新
  useEffect(() => {
    debouncedUpdateSearchKeyword(searchKeyword);
    return () => {
      debouncedUpdateSearchKeyword.cancel();
    };
  }, [searchKeyword, debouncedUpdateSearchKeyword]);

  const fetchData = useCallback(
    async (targetPublishStatus: number) => {
      try {
        setLoading(true);

        const params = {
          keyword: debouncedSearchKeyword || undefined,
          order: sortOrder,
          page: currentPage,
          page_size: pageSize,
          publish_status: targetPublishStatus,
        };

        const result = await getTutorials(params);
        if (result.success && result.data) {
          setTutorials(result.data.tutorials || []);
          setCurrentPage(result.data.page || 1);
          setPageSize(result.data.page_size || 6);
          setTotal(result.data.total || 0);
        } else {
          console.error('获取教程列表失败:', result.message);
          setTutorials([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('加载教程列表异常:', error);
        setTutorials([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearchKeyword, sortOrder, currentPage, pageSize]
  );

  useEffect(() => {
    if (status === 'loading') return;

    const newPublishStatus =
      status === 'authenticated' && permissions.includes('tutorial:review')
        ? 0
        : 2;

    // 如果publishStatus已经是正确的值，避免重复设置
    if (newPublishStatus !== publishStatus) {
      setPublishStatus(newPublishStatus);
    }

    fetchData(newPublishStatus);
  }, [status, permissions.length, fetchData, publishStatus]);

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <BookOpen className={styles.titleIcon} />
              DApp 交互教程
            </h1>
            <p className={styles.subtitle}>
              从基础到进阶，掌握各种 DApp
              的使用技巧。跟随我们的详细教程，轻松上手区块链应用，探索 Web3
              世界的无限可能。
            </p>
          </div>
          {status === 'authenticated' &&
            permissions.includes('tutorial:write') && (
              <Link
                href="/ecosystem/tutorials/new"
                className={styles.addTutorialButton}
              >
                <Plus className={styles.addIcon} />
                添加教程
              </Link>
            )}
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.filters}>
          <div className={styles.searchBox}>
            <Input
              size="large"
              placeholder="搜索教程、DApp 名称或关键词..."
              prefix={<Search size={20} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterItem}>
              <Filter size={16} className={styles.filterIcon} />
              {/* <span className={styles.filterLabel}>分类：</span> */}
              <Select
                value={sortOrder}
                onChange={handleSortChange}
                className={styles.select}
                size="middle"
              >
                <Option value="desc">最新</Option>
                <Option value="asc">最早</Option>
              </Select>
            </div>

            {/* <div className={styles.filterItem}>
                            <Star size={16} className={styles.filterIcon} />
                            <span className={styles.filterLabel}>难度：</span>
                            <Select
                                value={selectedDifficulty}
                                onChange={setSelectedDifficulty}
                                className={styles.select}
                                size="middle"
                            >
                                {difficulties.map((difficulty) => (
                                    <Option key={difficulty} value={difficulty}>
                                        {difficulty === "all" ? "全部难度" : difficulty}
                                    </Option>
                                ))}
                            </Select>
                        </div> */}
          </div>
        </Card>

        {loading ? (
          <div className={styles.loading}>
            <Spin size="large" />
          </div>
        ) : tutorials.length > 0 ? (
          <div className={styles.tutorialGrid}>
            {tutorials.map((tutorial) => (
              <Link
                key={tutorial.ID}
                href={`/ecosystem/tutorials/${tutorial.ID}`}
                className={styles.tutorialLink}
              >
                <Card
                  hoverable
                  className={styles.tutorialCard}
                  cover={
                    <div className={styles.cardImage}>
                      <Image
                        src={tutorial.cover_img || '/placeholder.svg'}
                        alt={tutorial.title}
                        className={styles.image}
                        preview={false}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  }
                >
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{tutorial.title}</h3>
                      <div className={styles.cardMeta}>
                        <span className={styles.dappName}>
                          {tutorial.dapp?.name}
                        </span>
                      </div>
                    </div>

                    <p className={styles.cardDescription}>
                      {tutorial.description}
                    </p>

                    <div className={styles.cardFooter}>
                      <div className={styles.tags}>
                        {tutorial.tags?.slice(0, 2).map((tag: any) => (
                          <Tag key={tag} className={styles.tag}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <h3>未找到相关教程</h3>
                  <p>请尝试调整搜索条件</p>
                </div>
              }
            />
          </div>
        )}

        <div className={styles.paginationContainer}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => handlePageChange(page)}
            showTotal={(total, range) =>
              `显示 ${range[0]}-${range[1]} 项，共 ${total} 项`
            }
            className={styles.pagination}
          />
        </div>
      </div>
    </div>
  );
}
