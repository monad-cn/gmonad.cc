import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      avatar?: string | null;
      username?: string | null;
      id?: string | null;
    };
  }
  interface User extends DefaultUser {
    avatar?: string | null;
    username?: string | null;
    id?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    avatar?: string;
    // 其它自定义字段
  }
}
