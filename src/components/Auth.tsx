import React, { useEffect, useState, useRef } from 'react';
import { Dropdown, Button, message } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/router';
import { signIn, signOut } from 'next-auth/react';
import styles from '../styles/Auth.module.css';
import Image from 'next/image';
import AuthManager from '@/lib/authManager';
import { useAuth } from '@/contexts/AuthContext';

const Auth: React.FC = () => {
  // 使用简化的认证上下文，利用 NextAuth 内置缓存机制
  const { session } = useAuth();
  const router = useRouter();
  const { code } = router.query;
  const [loading, setLoading] = useState(false);
  const hasTriedLogin = useRef(false); // 防止重复登录

  // 页面初次加载时检测 query 中的 code 并尝试登录
  useEffect(() => {
    const tryLogin = async () => {
      // 如果已经尝试过登录、已有session、没有code，则跳过
      if (hasTriedLogin.current || session || !code) {
        return;
      }

      hasTriedLogin.current = true;
      setLoading(true);

      try {
        const authManager = AuthManager.getInstance();

        // 使用 AuthManager 确保只有一个登录请求在执行
        const res = await authManager.ensureLogin(async () => {
          return await signIn('credentials', {
            redirect: false,
            code: code as string,
          });
        });

        if (res?.ok) {
          message.success('登录成功');
          // 清除 URL 中的 code 参数，NextAuth 会自动更新 session 状态
          router.replace(router.pathname, undefined, { shallow: true });
        } else {
          message.warning('登录失败...');
          hasTriedLogin.current = false; // 允许重试
        }
      } catch (error) {
        console.error('Login error:', error);
        message.error('网络错误...');
        hasTriedLogin.current = false; // 允许重试
      } finally {
        setLoading(false);
      }
    };

    // 延迟执行，避免 React Strict Mode 导致的重复调用
    const timer = setTimeout(tryLogin, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [code, session, router]);

  const handleSignIn = () => {
    setLoading(true); // 点击按钮时设置为加载状态
    const currentUrl = window.location.origin + router.pathname;
    const oauthUrl = `${process.env.NEXT_PUBLIC_OAUTH}&redirect_uri=${currentUrl}`;
    router.push(oauthUrl); // 跳转 OAuth 授权页
  };

  const handleLogout = async () => {
    // 执行登出操作，NextAuth 会自动清除会话状态
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') handleLogout();
    if (key === 'profile') router.push('/dashboard');
  };

  const items: MenuProps['items'] = [
    {
      key: 'name',
      label: <span>{session?.user?.username}</span>,
      disabled: true,
    },
    {
      key: 'profile',
      label: '个人页面',
    },
    {
      key: 'logout',
      label: '退出登录',
    },
  ];

  return (
    <div className={styles.auth}>
      {session?.user ? (
        <>
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
        </>
      ) : (
        <Button
          type="primary"
          className={styles.navButton}
          onClick={handleSignIn}
          loading={loading} // 显示加载中状态
        >
          登录
        </Button>
      )}
    </div>
  );
};

// 使用 React.memo 防止不必要的重新渲染
export default React.memo(Auth);
