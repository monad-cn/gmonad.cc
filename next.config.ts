import type { NextConfig } from 'next';
import { bootstrap } from 'global-agent';

// 处理本地node 未走vpn代理，导致访问OAuth被拒绝，开发环境强制走代理
// curl https://accounts.google.com/.well-known/openid-configuration 先确认是否能够访问谷歌认证
// 修改下面 GLOBAL_AGENT.HTTP_PROXY ， 注意代理端口与自己VPN代理端口一致
if (process.env.NEXT_USE_PROXY === 'true') {
  bootstrap();
  (
    global as typeof globalThis & { GLOBAL_AGENT: any }
  ).GLOBAL_AGENT.HTTP_PROXY = 'http://127.0.0.1:7890';
}

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // 忽略 eslint 检查
  },
  typescript: {
    ignoreBuildErrors: true, // 忽略 TypeScript 检查
  },
  reactStrictMode: true,
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
    ],
  },
};

export default nextConfig;
