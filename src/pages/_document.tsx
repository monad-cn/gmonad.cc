import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Monad中文社区';

  return (
    <Html lang="en">
      <Head>
        {/* OpenGraph Meta Tags */}
        <meta property="og:title" content="GMonad" />
        <meta
          property="og:description"
          content="探索高性能区块链的无限可能，与顶尖开发者一起构建去中心化的未来。
加入我们，成为区块链革命的先锋。"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gmonad.cc" />
        <meta property="og:image" content="https://gmonad.cc/og-image.png" />
        <meta property="og:site_name" content="GMonad" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GMonad" />
        <meta
          name="twitter:description"
          content="探索高性能区块链的无限可能，与顶尖开发者一起构建去中心化的未来。
加入我们，成为区块链革命的先锋。"
        />
        <meta name="twitter:image" content="https://gmonad.cc/og-image.png" />
        {/* title */}
        <title>{appName}</title>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
