import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';

import { ConfigProvider, App as AntdApp } from 'antd';

const customTheme = {
  token: {
    colorPrimary: '#7c3aed',
  },
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ConfigProvider theme={customTheme}>
      <AntdApp>
        <Layout>
          <Component {...pageProps} />

          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </Layout>
      </AntdApp>
    </ConfigProvider>
  );
}
