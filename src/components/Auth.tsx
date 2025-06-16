import React from 'react';
import { Avatar, Dropdown, Button } from 'antd';

import type { MenuProps } from 'antd';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import styles from '../styles/Auth.module.css';

const Auth: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 退出登录
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' }); // 清空 Google OAuth 信息并重定向到首页
  };

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'name',
      label: <span>{session?.user?.name}</span>,
      disabled: true,
    },
    {
      key: 'logout',
      label: '退出登录',
    },
  ];

  return (
    <div className={styles.auth}>
      {session?.user ? (
        <Dropdown menu={{ items, onClick }} trigger={['hover']}>
          <div className={styles.userInfo}>
            <Avatar
              size={40}
              key={session.expires} // 每次 image 变就强制重新渲染 Avatar
              src={session.user?.image || undefined}
              onError={() => false} // 防止报错闪动
            />
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
