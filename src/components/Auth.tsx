import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Dropdown, Menu, Button } from 'antd';
import { useRouter } from 'next/router';
import { getSession, signOut } from 'next-auth/react';
import styles from '../styles/Auth.module.css';

// 定义用户信息类型
interface UserSession {
  name: string;
  email: string;
  image?: string; // 用户头像可能为空
}

const Auth: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null); // 存储用户登录信息
  const router = useRouter();

  // 检查登录 session
  const fetchSession = useCallback(async () => {
    const session = await getSession();
    if (session && session.user) {
      console.log('Session:', session); // 打印 session 数据
      setUserSession({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
      });
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // 退出登录
  const handleLogout = async () => {
    await signOut(); // 清空 Google OAuth 信息
    setUserSession(null); // 清空本地用户信息
    router.push('/login'); // 跳转到登录页面
  };

  // 下拉菜单内容
  const menu = (
    <Menu>
      <Menu.Item key="name" disabled>
        <span>{userSession?.name}</span>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.auth}>
      {userSession ? (
        <Dropdown overlay={menu} trigger={['hover']}>
          <div className={styles.userInfo}>
            <Avatar size="large" src={userSession.image} />
          </div>
        </Dropdown>
      ) : (
        <Button
          type="primary"
          className={styles.navButton}
          onClick={() => router.push('/login')}
        >
          登录
        </Button>
      )}
    </div>
  );
};

export default Auth;
