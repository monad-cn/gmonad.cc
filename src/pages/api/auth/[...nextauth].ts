import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginUser } from '../login';

declare module 'next-auth' {
  interface Session {
    user?: {
      uid?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      github?: string;
      avatar?: string;
      permissions?: string[];
      token?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    email?: string;
    avatar?: string;
    permissions?: string[];
    token?: string;
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { code } = credentials;
        const loginParams = { code };

        const res = await loginUser(loginParams);

        if (res.success && res.data?.ID) {
          return {
            id: res.data.ID.toString(),
            email: res.data.email,
            username: res.data.username,
            github: res.data.github,
            avatar: res.data.avatar,
            permissions: res.data.permissions,
            token: res.data.token,
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - 减少 session 更新频率
  },

  // 优化客户端配置，减少不必要的请求
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // 配置 JWT 和 session 的缓存策略
  jwt: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  pages: {
    signIn: '/login',
  },

  // 减少不必要的请求
  events: {
    async signIn(message) {
      // 登录成功时的处理
      console.log('User signed in:', message.user.email);
    },
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 首次登录时保存用户信息到token
      if (user) {
        token.uid = (user as any).id;
        token.username = (user as any).username;
        token.github = (user as any).github;
        token.email = (user as any).email;
        token.avatar = (user as any).avatar;
        token.permissions = (user as any).permissions;
        token.token = (user as any).token;
      }
      
      // 当触发update()时，更新token中的用户信息
      if (trigger === 'update' && session?.user) {
        token.username = session.user.username || token.username;
        token.avatar = session.user.avatar || token.avatar;
        token.email = session.user.email || token.email;
        token.github = session.user.github || token.github;
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.uid = token.uid as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.github = token.github as string;
        session.user.avatar = token.avatar as string;
        session.user.permissions = token.permissions as string[];
        session.user.token = token.token as string;
      }
      return session;
    },
  },
});
