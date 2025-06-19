import React from 'react';
import { Avatar, Dropdown, Button } from 'antd';
import { CiUser } from 'react-icons/ci';
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
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'name',
      label: <span>{session?.user?.username}</span>,
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
              key={session.expires}
              src={session.user?.avatar || undefined}
              icon={session.user?.avatar ? undefined : <CiUser />}
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
