import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';

import { ConfigProvider, App as AntdApp } from 'antd';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { AuthProvider } from '@/contexts/AuthContext';

const customTheme = {
  token: {
    colorPrimary: '#6E54FF',
  },
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Monad 中文社区';
  
  return (
    <SessionProvider 
      session={session}
      // 优化 SessionProvider 配置，减少客户端请求
      refetchInterval={5 * 60} // 5分钟刷新一次
      refetchOnWindowFocus={false} // 禁用窗口聚焦时的自动刷新
      refetchWhenOffline={false} // 离线时不刷新
    >
      {/* 认证上下文提供者，统一管理认证状态，利用 NextAuth 内置缓存 */}
      <AuthProvider>
        <ConfigProvider theme={customTheme}>
          <AntdApp>
            <Layout>
              <Head>
                <title>{appName}</title>
              </Head>
              <Component {...pageProps} />
              {process.env.NEXT_PUBLIC_GA_ID && (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
              )}
            </Layout>
          </AntdApp>
        </ConfigProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
