import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { ConfigProvider, theme } from 'antd';

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
  // 定义不需要布局的页面
  const noLayoutPages = ['/login', '/register'];

  // 如果是登录或注册页，直接渲染页面，不应用布局
  if (noLayoutPages.includes(router.pathname)) {
    return (
      <SessionProvider session={session}>
        <ConfigProvider theme={customTheme}>
          <Component {...pageProps} />
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </ConfigProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
      <ConfigProvider theme={customTheme}>
        <Layout>
          <Component {...pageProps} />

          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </Layout>
      </ConfigProvider>
    </SessionProvider>
  );
}
