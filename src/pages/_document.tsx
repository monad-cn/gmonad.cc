import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* OpenGraph Meta Tags */}
        <meta property="og:title" content="GMonad" />
        <meta
          property="og:description"
          content="加入我们，和 Nads 一起了解、参与、构建 Monad。"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gmonad.cc" />
        <meta property="og:image" content="https://gmonad.cc/cover.png" />
        <meta property="og:site_name" content="GMonad" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GMonad" />
        <meta
          name="twitter:description"
          content="加入我们，和 Nads 一起了解、参与、构建 Monad。"
        />
        <meta name="twitter:image" content="https://gmonad.cc/cover.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
