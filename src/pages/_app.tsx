import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';

import { ConfigProvider, App as AntdApp } from 'antd';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';

const customTheme = {
  token: {
    colorPrimary: '#7c3aed',
  },
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Monad 中文社区';
  // 定义不需要布局的页面
  const noLayoutPages = ['/login'];

  // 如果是登录或注册页，直接渲染页面，不应用布局
  if (noLayoutPages.includes(router.pathname)) {
    return (
      <SessionProvider session={session}>
        <ConfigProvider theme={customTheme}>
          <AntdApp>
            <Head>
              <title>{appName}</title>
            </Head>
            <Component {...pageProps} />
            {process.env.NEXT_PUBLIC_GA_ID && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
          </AntdApp>
        </ConfigProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
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
    </SessionProvider>
  );
}
