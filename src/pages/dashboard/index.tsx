import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  List,
  Avatar,
  Tag,
  Divider,
  Typography,
  Button,
  Space,
  Menu,
  Image,
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
  const { session } = useAuth();

  const loadBlogs = async () => {
    try {
      setBlogsLoading(true);
      const result = await getBlogs({
        page: 1,
        page_size: 6,
        publish_status: 2,
        order: 'desc',
      });
      if (result.success && result.data) {
        setBlogs(result.data.blogs || []);
      }
    } catch (error) {
      console.error('加载博客列表失败:', error);
      setBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  };

  const loadTutorials = async () => {
    try {
      setTutorialsLoading(true);
      const result = await getTutorials({
        page: 1,
        page_size: 6,
        publish_status: 2,
      });
      if (result.success && result.data) {
        setTutorials(result.data.tutorials || []);
      }
    } catch (error) {
      console.error('加载教程列表失败:', error);
      setTutorials([]);
    } finally {
      setTutorialsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
    loadTutorials();
  }, []);

  const profileData = {
    name: session?.user?.username || '',
    email: session?.user?.email || '',
    subtitle: '前端开发人员其他',
    avatar: session?.user?.avatar || '',
  };

  const menuItems = [
    {
      key: 'blogs',
      icon: <FileText className={styles.menuIcon} />,
      label: '博客',
    },
    {
      key: 'tutorials',
      icon: <BookOpen className={styles.menuIcon} />,
      label: '教程',
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
              最新博客
            </Title>
            
          </div>
          <Divider />
          <List
            loading={blogsLoading}
            dataSource={blogs}
            renderItem={(blog) => (
              <List.Item
                key={blog.ID}
                actions={[
                  <Space key="meta" className={styles.itemMeta}>
                    <Eye size={16} />
                    <span>{blog.view_count || 0}</span>
                  </Space>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={blog.publisher?.avatar}
                      className={styles.itemAvatar}
                    />
                  }
                  title={
                    <Link
                      href={`/blogs/${blog.ID}`}
                      className={styles.itemTitle}
                    >
                      {blog.title}
                    </Link>
                  }
                  description={
                    <div className={styles.itemDescription}>
                      <Text type="secondary" className={styles.itemDesc}>
                        {blog.description}
                      </Text>
                      <div className={styles.itemFooter}>
                        <Space>
                          <User size={14} />
                          <span>{blog.publisher?.username}</span>
                          <Clock size={14} />
                          <span>
                            {dayjs(blog.publish_time || blog.CreatedAt).format(
                              'YYYY-MM-DD'
                            )}
                          </span>
                        </Space>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      );
    }

    if (activeTab === 'tutorials') {
      return (
        <Card className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <Title level={3} className={styles.cardTitle}>
              <BookOpen className={styles.cardIcon} />
              热门教程
            </Title>
            
          </div>
          <Divider />
          <List
            loading={tutorialsLoading}
            dataSource={tutorials}
            renderItem={(tutorial) => (
              <List.Item
                key={tutorial.ID}
                actions={[
                  <Space key="meta" className={styles.itemMeta}>
                    <TrendingUp size={16} />
                    <span>热门</span>
                  </Space>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={tutorial.cover_img || '/placeholder.svg'}
                      className={styles.itemAvatar}
                      shape="square"
                    />
                  }
                  title={
                    <Link
                      href={`/ecosystem/tutorials/${tutorial.ID}`}
                      className={styles.itemTitle}
                    >
                      {tutorial.title}
                    </Link>
                  }
                  description={
                    <div className={styles.itemDescription}>
                      <Text type="secondary" className={styles.itemDesc}>
                        {tutorial.description}
                      </Text>
                      <div className={styles.itemFooter}>
                        <Space>
                          {tutorial.dapp?.name && (
                            <Tag className={styles.itemTag}>
                              {tutorial.dapp.name}
                            </Tag>
                          )}
                          {tutorial.tags?.slice(0, 2).map((tag: string) => (
                            <Tag key={tag} className={styles.itemTag}>
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.profileInfo}>
            <Image
              src={profileData.avatar}
              alt={profileData.name}
              width={80}
              height={80}
              preview={false}
              className={styles.avatar}
              referrerPolicy="no-referrer"
            />
            <div className={styles.profileDetails}>
              <Title level={2} className={styles.name}>
                {profileData.name}
              </Title>
              <Text className={styles.subtitle}>
                {' '}
                Emial: {profileData.email}
              </Text>
            </div>
          </div>
        </div>
      </div>

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
  );
}
