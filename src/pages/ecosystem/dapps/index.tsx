import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Search,
  Star,
  BookOpen,
  BarChart3,
  Plus,
  Globe,
} from 'lucide-react';
import { Pagination, Tag, Input, Select, Button } from 'antd';
import styles from './index.module.css';
import { getCategories, getDapps } from '@/services/api/dapp';
import { SiX } from 'react-icons/si';
import { useAuth } from '@/contexts/AuthContext';
import { getTutorials } from '@/services/api/tutorial';

interface Tutorial {
  ID: string;
  title: string;
}

interface Category {
  ID: number;
  name: string;
  children: Category[];
}

interface DApp {
  ID: string;
  name: string;
  description: string;
  logo: string;
  cover_img: string;
  site: string;
  category: Category;
  x?: string;
  tags: string[];
  featured?: boolean;
  tutorials: Tutorial[];
}

export default function EcosystemPage() {
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [isOnlyMonad, setIsOnlyMonad] = useState<boolean>(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dapps, setDapps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [tutorialTotal, setTutorialTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { session, status } = useAuth();
  const permissions = session?.user?.permissions || [];
  const router = useRouter();

  // 获取一级分类
  useEffect(() => {
    const fetchMainCategories = async () => {
      setLoadingCategories(true);
      const res = await getCategories({ parent_id: 0, order: 'asc' });
      if (res.success && Array.isArray(res.data?.categories)) {
        setMainCategories(res.data.categories);
      }
      setLoadingCategories(false);
    };
    fetchMainCategories();
  }, []);

  function parseUrlParams() {
    const { main_category, sub_category } = router.query;
    let mainCat: Category | null = null;
    let subIds: number[] = [];

    if (main_category) {
      mainCat = mainCategories.find((c) => c.name === main_category) || null;
      if (mainCat) {
        if (sub_category) {
          const subNames = (sub_category as string).split(',');
          subIds = mainCat.children
            .filter((sub) => subNames.includes(sub.name))
            .map((sub) => sub.ID);
        }
      }
    }

    return { mainCat, subIds };
  }

  useEffect(() => {
    if (mainCategories.length === 0) return;

    const { mainCat, subIds } = parseUrlParams();

    if (mainCat) {
      setSelectedMainCategory(mainCat);
      setSubCategories(mainCat.children);
      setSelectedSubCategories(subIds);
      setIsOnlyMonad(false);

      router.replace(router.pathname, undefined, { shallow: true });
    }

  }, [router.query, mainCategories]);

  // 获取 DApps
  const fetchDapps = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: pageSize,
        is_only_monad: isOnlyMonad ? 1 : 0,
      };
      if (searchQuery) {
        params.keyword = searchQuery;
      }

      if (selectedSubCategories.length > 0) {
        params.sub_category = selectedSubCategories.join(',');
      } else if (selectedMainCategory) {
        params.main_category = selectedMainCategory.ID.toString();
      }

      const result = await getDapps(params);
      if (result.success && result.data && Array.isArray(result.data.dapps)) {
        setDapps(result.data.dapps);
        setTotal(result.data.total || 0);
      } else {
        setDapps([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('加载 DApps 列表异常:', error);
      setDapps([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        page_size: 100,
      };

      const result = await getTutorials(params);
      if (result.success && result.data) {
        setTutorialTotal(result.data.total);
      }
    } catch (error) {
      setTutorialTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };


  // 点击时清除 URL 参数
  const handleResetFilters = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategories([]);
    setSearchQuery('');
    setCurrentPage(1);
    setIsOnlyMonad(false);

    router.replace(router.pathname, undefined, { shallow: true });
  };

  const handleOnlyMonad = (val: boolean) => {
    setSelectedMainCategory(null);
    setSelectedSubCategories([]);
    setSearchQuery('');
    setCurrentPage(1);
    setIsOnlyMonad(val);

    router.replace(router.pathname, undefined, { shallow: true });
  };

  useEffect(() => {
    fetchDapps();
    fetchTutorials();
  }, [searchQuery, isOnlyMonad, selectedMainCategory, selectedSubCategories, currentPage, pageSize]);

  const stats = {
    totalDapps: total,
    totalTutorials: tutorialTotal,
    categories: mainCategories.reduce((acc, cat) => acc + (cat.children?.length || 0), 0),
  };

  const handleMainCategorySelect = (category: Category) => {
    setIsOnlyMonad(false);
    if (selectedMainCategory?.ID === category.ID) {
      setSelectedMainCategory(null);
      setSelectedSubCategories([]);
      setSubCategories([]);
    } else {
      setSelectedMainCategory(category);
      setSelectedSubCategories([]);
      setSubCategories(category.children);
      setCurrentPage(1);
    }
    router.replace(router.pathname, undefined, { shallow: true });
  };

  return (
    <div className={`${styles.container} nav-t-top`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>Monad 生态系统</h1>
              <p className={styles.heroDescription}>
                探索基于 Monad 构建的去中心化应用生态系统。从 DeFi 协议到基础设施工具，通过交互式教程开始体验和使用。
              </p>
            </div>
            {status === 'authenticated' && permissions.includes('dapp:write') && (
              <Link href="/ecosystem/dapps/new" className={styles.addDappButton}>
                <Plus className={styles.addIcon} />
                添加 DApp
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><BarChart3 className={styles.statIconSvg} /></div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.totalDapps}</div>
                <div className={styles.statLabel}>DApps</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><BookOpen className={styles.statIconSvg} /></div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.totalTutorials}</div>
                <div className={styles.statLabel}>教程</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Star className={styles.statIconSvg} /></div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.categories}</div>
                <div className={styles.statLabel}>分类</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.sectionContainer}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {loadingCategories ? (
              <div></div>
            ) : (
              mainCategories.map((cat) => (
                <Button
                  size="large"
                  key={cat.ID}
                  type={selectedMainCategory?.ID === cat.ID ? 'primary' : 'default'}
                  onClick={() => handleMainCategorySelect(cat)}
                >
                  {cat.name}
                </Button>
              ))
            )}
            <Button
              size="large"
              type={isOnlyMonad ? 'primary' : 'default'}
              onClick={() => handleOnlyMonad(!isOnlyMonad)}
            >
              Monad 原生项目
            </Button>
            <Button
              size="large"
              onClick={handleResetFilters}
            >
              重置
            </Button>
          </div>

          {selectedMainCategory && (
            <Select
              mode="multiple"
              size="large"
              allowClear
              className={styles.mainCategory}
              placeholder="请选择二级分类"
              value={selectedSubCategories}
              onChange={(values) => setSelectedSubCategories(values)}
              style={{ minWidth: 300, marginBottom: '12px' }}
              options={subCategories.map((sub) => ({
                label: sub.name,
                value: sub.ID,
              }))}
            />
          )}

          <Input
            placeholder="搜索 DApps..."
            value={searchQuery}
            size="large"
            onChange={handleSearchInputChange}
            prefix={<Search size={16} />}
            style={{ width: '300px' }}
            allowClear
          />
        </div>
      </section>

      {/* Results */}
      <section className={styles.resultsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.resultsHeader}>
            <h4 className={styles.resultsTitle}>
              {selectedMainCategory
                ? selectedSubCategories.length === 0
                  ? `${selectedMainCategory.name} DApps`
                  : `${selectedMainCategory.name}`
                : '所有 DApps'}
              <span className={styles.resultsCount}>({total})</span>
            </h4>
          </div>

          {loading ? (
            <div className={styles.loading}><div className={styles.loadingSpinner}></div></div>
          ) : (
            <div className={styles.dappsGrid}>
              {dapps.map((dapp) => (
                <DAppCard key={dapp.ID} dapp={dapp} />
              ))}
            </div>
          )}

          {dapps.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>未找到 DApps</h3>
              <p className={styles.emptyDescription}>尝试调整您的搜索或筛选条件来找到您要寻找的内容。</p>
            </div>
          )}


          <div className={styles.paginationWrapper}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size!);
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function DAppCard({ dapp }: { dapp: DApp }) {
  return (
    <div className={styles.dappCard}>
      <div className={styles.coverContainer}>
        <img src={dapp.cover_img} alt={`${dapp.name} cover`} className={styles.coverImage} />
        <div className={styles.cardTop}>
          <div className={styles.cardActions}>
            {dapp.featured && <div className={styles.featuredBadge}><Star className={styles.featuredIcon} /></div>}
            {dapp.x && (
              <Link href={dapp.x} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                <SiX className={styles.actionIcon} />
              </Link>
            )}
            {dapp.site && (
              <Link href={dapp.site} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                <Globe className={styles.actionIcon} />
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className={styles.logoContainer}>
        <img src={dapp.logo || '/placeholder.svg'} alt={`${dapp.name} logo`} className={styles.logo} />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.dappName}>{dapp.name}</h3>
        <p className={styles.dappDescription}>{dapp.description}</p>
        <div className={styles.category}>
          <Tag className={styles.tag}>{dapp.category?.name}</Tag>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.tutorialsInfo}>
          <BookOpen className={styles.tutorialIcon} />
          <span className={styles.tutorialCount}>{dapp?.tutorials?.length || 0} 个教程</span>
        </div>
        <Link href={`/ecosystem/dapps/${dapp.ID}`} className={styles.tutorialsButton}>查看教程</Link>
      </div>
    </div>
  );
}
