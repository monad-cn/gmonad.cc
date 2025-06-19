import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginUser } from '../login';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { email, password } = credentials;
        const loginParams = {
          email: email,
          password: password,
        };

        const res = await loginUser(loginParams);

        if (res.success && res.data?.ID) {
          return {
            id: res.data.ID.toString(),
            username: res.data.username,
            email: res.data.email,
            avatar: res.data.avatar,
          };
        }

        // 否则返回 null 表示认证失败
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // 登录时把 user 字段合并到 token
      if (user) {
        token.id = user.id ?? undefined;
        token.username = user.username ?? undefined;
        token.avatar = user.avatar ?? undefined; // 你自定义的字段
      }
      return token;
    },
    async session({ session, token }) {
      // 每次 session 获取时，把 token 字段合并到 session.user
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
});
