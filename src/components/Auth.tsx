import React, { useEffect } from 'react';
import { Avatar, Dropdown, Button, message } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from '../styles/Auth.module.css';
import Image from 'next/image';

const Auth: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { code } = router.query;

  // 页面初次加载时检测 query 中的 code 并尝试登录
  useEffect(() => {
    const tryLogin = async () => {
      if (!session && code) {
        try {
          const res = await signIn('credentials', {
            redirect: false,
            code,
          });

          if (res?.ok) {
            message.success('登录成功');
            router.replace('/'); // 登录成功后清除 query 参数
          } else {
            message.warning('登录失败...');
          }
        } catch (error) {
          message.error('网络错误...');
        }
      }
    };

    tryLogin();
  }, [code, session, router]);

  const handleSignIn = () => {
    const currentUrl = window.location.origin + router.pathname;
    const oauthUrl = `${process.env.NEXT_PUBLIC_OAUTH}&redirect_uri=${currentUrl}`;
    router.push(oauthUrl);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') handleLogout();
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
            <Image
              src={session.user.avatar as string}
              alt="avatar"
              width={40}
              height={40}
              className={styles.avatarImage}
            />
          </div>
        </Dropdown>
      ) : (
        <Button
          type="primary"
          className={styles.navButton}
          onClick={handleSignIn}
        >
          登录
        </Button>
      )}
    </div>
  );
};

export default Auth;
