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
  Pagination,
  Button,
  Popconfirm,
  App as AntdApp
} from 'antd';
import { BookOpen, FileText, Eye, Clock, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import styles from './index.module.css';
import { deleteBlog, getBlogs } from '../api/blog';
import { deleteTutorial, getTutorials } from '../api/tutorial';
import { useAuth } from '@/contexts/AuthContext';
import AvatarEdit from '@/components/settings/AvatarEdit';
import NicknameEdit from '@/components/settings/NicknameEdit';
import { updateUser, User } from '../api/user';
import { useSession } from 'next-auth/react';


const { Title, Text } = Typography;

type ActiveTab = 'blogs' | 'tutorials';

export default function DashboardPage() {
  const { message } = AntdApp.useApp();
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
  const { update } = useSession();

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

  const handleAvatarSave = async (avatarUrl: string) => {
    try {
      const result = await updateUser(session?.user?.uid as unknown as number, {
        email: session?.user?.email ?? '',
        avatar: avatarUrl,
        github: session?.user?.github ?? '',
        username: session?.user?.username ?? ''
      });

      if (result.success) {
        message.success("头像更新成功")
        console.log('头像更新成功:', avatarUrl);
        
        // 刷新session，更新用户信息
        await update({
          ...session,
          user: {
            ...session?.user,
            avatar: avatarUrl
          }
        });
      } else {
        console.error('头像更新失败:', result.message);
        return Promise.reject(result.message);
      }
    } catch (error: any) {
      console.error('头像更新异常:', error);
    }
  };

  const handleNicknameSave = async (nickname: string) => {
    try {
      const result = await updateUser(session?.user?.uid as unknown as number, {
        email: session?.user?.email ?? '',
        avatar: session?.user?.avatar ?? '',
        github: session?.user?.github ?? '',
        username: nickname
      });

      if (result.success) {
        message.success("用户名更新成功")
        console.log('用户名更新成功:', nickname);
        
        // 刷新session，更新用户信息
        await update({
          ...session,
          user: {
            ...session?.user,
            username: nickname,
            name: nickname  // 同时更新name字段
          }
        });
      } else {
        console.error('用户名更新失败:', result.message);
      }
    } catch (error: any) {
      console.error('用户名更新异常:', error);
    }
  };


  const handleDeleteTutorial = async (id: number) => {
    try {
      const result = await deleteTutorial(id);
      if (result.success) {
        message.success("教程删除成功！");
        loadTutorials();
      } else {
        message.error('删除出错');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };


  const handleDeleteBlog = async (id: number) => {
    try {
      const result = await deleteBlog(id);
      if (result.success) {
        message.success("博客删除成功！");
        loadBlogs();
      } else {
        message.error('删除出错');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  if (!session) {
    return (
      <div className={styles.emptyState}>
        <img
          src="/meme1.gif"
          className={styles.emptyImage}
        />
        <p>请先登录以查看个人中心</p>
      </div>
    );
  }


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
                  <div className={styles.itemMeta}>
                    <Link href={`/blogs/${blog.ID}/edit`}><Edit size={16} className={styles.metaIcon} /></Link>
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
                        icon={<Trash2 size={16} />}
                        title="删除博客"
                      />
                    </Popconfirm>
                  </div>
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
                        <Eye size={14} className={styles.itemClock} />
                        <span>{blog.view_count || 0}</span>
                      </Space>
                    </div>
                  </div>
                </div>
              </List.Item >
            )
            }
          />
          < div className={styles.bottomPagination} >
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
          </div >
        </Card >
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
                  <div className={styles.itemMeta}>
                    <Link href={`/ecosystem/tutorials/${tutorial.ID}/edit`}>
                      <Edit size={16} className={styles.metaIcon} />
                    </Link>
                    <Popconfirm
                      title="删除教程"
                      description="你确定删除这个教程吗？"
                      okText="是"
                      cancelText="否"
                      onConfirm={() => handleDeleteTutorial(tutorial.ID)}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<Trash2 size={16} />}
                        title="删除教程"
                        className={styles.metaBtn}
                      />
                    </Popconfirm>
                  </div>
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
                        <Eye size={16} className={styles.itemClock} />
                        <span>{tutorial.view_count || 0}</span>
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
            <AvatarEdit
              currentAvatar={session?.user?.avatar}
              userName={session?.user?.name || ''}
              onSave={handleAvatarSave}
            />
            <div className={styles.profileDetails}>
              <NicknameEdit
                currentNickname={profileData.name}
                onSave={handleNicknameSave}
              />
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
