import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET!,
  callbacks: {
    async signIn({ user, account, profile }) {
      // 可在此自定义注册逻辑，例如：
      // - 白名单验证
      // - 限制特定域名邮箱
      // - 自动写入数据库等

      return true; // 返回 false 将拒绝登录
    },
    async session({ session, token, user }) {
      // 将 Google 返回的信息附加到 session 中（前端可用）
      return session;
    },
  },
});
