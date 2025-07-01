import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

// 认证上下文类型定义
interface AuthContextType {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件的属性类型
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 简化的认证上下文提供者组件
 * 直接使用 NextAuth 的 useSession，利用其内置的缓存和去重机制
 * 避免与 NextAuth 内部机制冲突
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // 直接使用 NextAuth 的 useSession Hook
  const { data: session, status } = useSession();

  // 构建上下文值
  const contextValue: AuthContextType = {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 自定义 Hook：获取认证上下文
 * 利用 NextAuth 内置的缓存机制，避免重复请求
 * 
 * @returns 认证上下文数据
 * @throws 当在 AuthProvider 外部使用时抛出错误
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  
  return context;
}