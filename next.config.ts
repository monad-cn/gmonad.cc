import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // 忽略 TypeScript 检查
  },
  reactStrictMode: true,
  // 优化构建性能
  experimental: {
    // 启用构建缓存优化
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  // 添加空的 turbopack 配置以兼容 Next.js 16
  turbopack: {},
  // 优化Webpack构建
  webpack: (config: any, { dev }: { dev: boolean; isServer: boolean }) => {
    // 生产环境优化
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        // 限制并发构建任务
        minimize: true,
        // 启用代码分割优化
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
      // 限制CPU使用
      config.parallelism = 2;
    }
    return config;
  },
  transpilePackages: [
    '@ant-design',
    'antd',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-tree',
    'rc-table',
    'rc-input',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
       {
        protocol: 'https',
        hostname: 'file-cdn.openbuild.xyz',
         pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
         pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
