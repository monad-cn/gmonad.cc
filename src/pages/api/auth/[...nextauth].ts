import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginUser } from '../login';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      avatar?: string;
      permissions?: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string;
    email?: string;
    avatar?: string;
    permissions?: string[];
  }
}

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
        const loginParams = { email, password };

        const res = await loginUser(loginParams);

        if (res.success && res.data?.ID) {
          return {
            id: res.data.ID.toString(),
            email: res.data.email,
            username: res.data.username,
            avatar: res.data.avatar,
            permissions: res.data.permissions,
          };
        }

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
      if (user) {
        token.username = (user as any).username;
        token.email = (user as any).email;
        token.avatar = (user as any).avatar;
        token.permissions = (user as any).permissions;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.avatar = token.avatar;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
});
