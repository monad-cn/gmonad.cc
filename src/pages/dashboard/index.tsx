import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  List,
  Tag,
  Divider,
  Typography,
  Space,
  Menu,
  Image,
  Pagination,
  Button,
} from 'antd';
import { BookOpen, FileText, Eye, Clock, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import styles from './index.module.css';
import { getBlogs } from '../api/blog';
import { getTutorials } from '../api/tutorial';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

type ActiveTab = 'blogs' | 'tutorials';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('blogs');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [tutorialsLoading, setTutorialsLoading] = useState(false);
  const [blogsPagination, setBlogsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [tutorialsPagination, setTutorialsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { session } = useAuth();

  const loadBlogs = async (page = 1, pageSize = 10) => {
    try {
      setBlogsLoading(true);
      
      const result = await getBlogs({
        page,
        page_size: pageSize,
        user_id: session?.user?.uid as unknown as number,
        publish_status: 0,
        order: 'desc',
      });
      if (result.success && result.data) {
        setBlogs(result.data.blogs || []);
        setBlogsPagination({
          current: result.data.page || 1,
          pageSize: result.data.page_size || pageSize,
          total: result.data.total || 0,
        });
      }
    } catch (error) {
      console.error('加载博客列表失败:', error);
      setBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  };

  const loadTutorials = async (page = 1, pageSize = 10) => {
    try {
      setTutorialsLoading(true);
      const result = await getTutorials({
        page,
        page_size: pageSize,
        user_id: session?.user?.uid as unknown as number,
        publish_status: 0,
      });
      if (result.success && result.data) {
        setTutorials(result.data.tutorials || []);
        setTutorialsPagination({
          current: result.data.page || 1,
          pageSize: result.data.page_size || pageSize,
          total: result.data.total || 0,
        });
      }
    } catch (error) {
      console.error('加载教程列表失败:', error);
      setTutorials([]);
    } finally {
      setTutorialsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.uid) {
      loadBlogs();
      loadTutorials();
    }
  }, [session]);

  const profileData = {
    name: session?.user?.username || '',
    email: session?.user?.email || '',
    // subtitle: '前端开发人员其他',
    avatar: session?.user?.avatar || '',
  };

  const menuItems = [
    {
      key: 'blogs',
      icon: <FileText className={styles.menuIcon} />,
      label: '我的博客',
    },
    {
      key: 'tutorials',
      icon: <BookOpen className={styles.menuIcon} />,
      label: '我的教程',
    },
  ];

  const handleMenuClick = (key: string) => {
    setActiveTab(key as ActiveTab);
  };

  const renderContent = () => {
    if (activeTab === 'blogs') {
      return (
        <Card className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <Title level={3} className={styles.cardTitle}>
              <FileText className={styles.cardIcon} />
              我的博客
            </Title>
          </div>
          <Divider />
          <List
            loading={blogsLoading}
            dataSource={blogs}
            renderItem={(blog) => (
              <List.Item
                key={blog.ID}
                className={styles.listItem}
                actions={[
                  <Space key="meta" className={styles.itemMeta}>
                    <Eye size={16} />
                    <span>{blog.view_count || 0}</span>
                  </Space>,
                ]}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemMain}>
                    <div className={styles.titleRow}>
                      <Link
                        href={`/blogs/${blog.ID}`}
                        className={styles.itemTitle}
                      >
                        {blog.title}
                      </Link>
                      {blog.publish_status === 1 && (
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          待审核
                        </Tag>
                      )}
                      {blog.publish_status === 2 && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          已发布
                        </Tag>
                      )}
                      {blog.publish_status === 3 && (
                        <Tag color="red" style={{ marginLeft: 8 }}>
                          未通过
                        </Tag>
                      )}
                    </div>
                    <Text type="secondary" className={styles.itemDesc}>
                      {blog.description}
                    </Text>

                    <div className={styles.itemFooter}>
                      <Space>
                        <Clock size={14} className={styles.itemClock} />
                        <span>
                          {dayjs(blog.publish_time || blog.CreatedAt).format(
                            'YYYY-MM-DD HH:MM'
                          )}
                        </span>
                      </Space>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div className={styles.bottomPagination}>
            <Pagination
              current={blogsPagination.current}
              total={blogsPagination.total}
              pageSize={blogsPagination.pageSize}
              onChange={(page, pageSize) => loadBlogs(page, pageSize)}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
            />
          </div>
        </Card>
      );
    }

    if (activeTab === 'tutorials') {
      return (
        <Card className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <Title level={3} className={styles.cardTitle}>
              <BookOpen className={styles.cardIcon} />
              我的教程
            </Title>
          </div>
          <Divider />
          <List
            loading={tutorialsLoading}
            dataSource={tutorials}
            renderItem={(tutorial) => (
              <List.Item
                key={tutorial.ID}
                className={styles.listItem}
                actions={[
                  <Space key="meta" className={styles.itemMeta}>
                    <TrendingUp size={16} />
                    <span>热门</span>
                  </Space>,
                ]}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemMain}>
                    <div className={styles.titleRow}>
                      <Link
                        href={`/ecosystem/tutorials/${tutorial.ID}`}
                        className={styles.itemTitle}
                      >
                        {tutorial.title}
                      </Link>
                      {tutorial.publish_status === 1 && (
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          待审核
                        </Tag>
                      )}
                      {tutorial.publish_status === 2 && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          已发布
                        </Tag>
                      )}
                      {tutorial.publish_status === 3 && (
                        <Tag color="red" style={{ marginLeft: 8 }}>
                          未通过
                        </Tag>
                      )}
                    </div>
                    <Text type="secondary" className={styles.itemDesc}>
                      {tutorial.description}
                    </Text>
                    <div className={styles.itemFooter}>
                      <Space>
                        {/* {tutorial.dapp?.name && (
                          <Tag className={styles.itemTag}>
                            {tutorial.dapp.name}
                          </Tag>
                        )} */}
                        {/* {tutorial.tags?.slice(0, 2).map((tag: string) => (
                          <Tag key={tag} className={styles.itemTag}>
                            {tag}
                          </Tag>
                        ))} */}
                        <Clock size={14} className={styles.itemClock} />
                        <span>
                          {dayjs(
                            tutorial.publish_time || tutorial.CreatedAt
                          ).format('YYYY-MM-DD HH:MM')}
                        </span>
                      </Space>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {/* 
          <Pagination
            current={tutorialsPagination.current}
            total={tutorialsPagination.total}
            pageSize={tutorialsPagination.pageSize}
            onChange={(page, pageSize) => loadTutorials(page, pageSize)}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
            }
          /> */}

          <div className={styles.bottomPagination}>
            <Pagination
              current={tutorialsPagination.current}
              total={tutorialsPagination.total}
              pageSize={tutorialsPagination.pageSize}
              onChange={(page, pageSize) => loadTutorials(page, pageSize)}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
            />
          </div>
        </Card>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.profileInfo}>
            {profileData.avatar ? (
              <Image
                src={profileData.avatar}
                alt={profileData.name}
                width={80}
                height={80}
                preview={false}
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`${styles.avatar} ${styles.avatarFallback}`}>
                <span className={styles.avatarText}>
                  {profileData.name
                    ? profileData.name.charAt(0).toUpperCase()
                    : 'U'}
                </span>
              </div>
            )}
            <div className={styles.profileDetails}>
              <Title level={2} className={styles.name}>
                {profileData.name}
              </Title>
              <Text className={styles.subtitle}>
                Email: {profileData.email}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <Row gutter={[24, 24]} className={styles.content}>
          <Col span={6}>
            <Card className={styles.sidebarCard}>
              <div className={styles.menuSection}>
                <Title level={4} className={styles.sectionTitle}>
                  内容导航
                </Title>
                <Menu
                  mode="vertical"
                  selectedKeys={[activeTab]}
                  items={menuItems}
                  onClick={({ key }) => handleMenuClick(key)}
                  className={styles.navigationMenu}
                />
              </div>
            </Card>
          </Col>

          <Col span={18}>
            <div className={styles.mainContent}>{renderContent()}</div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
