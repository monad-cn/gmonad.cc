import { getSession, signOut } from 'next-auth/react';
import { message } from 'antd';
import { API_BASE_PATH, getApiBaseUrl } from './base';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body: any = null
): Promise<ApiResponse<T>> => {
  const apiUrl = getApiBaseUrl();

  const session = await getSession();
  const token = session?.user?.token;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, options);
    // 捕获 401 和 403
    if (response.status === 401 || response.status === 403) {
      message.error('登录信息已过期，请重新登录');
      // await signOut({ redirect: true, callbackUrl: '/' });

      return {
        code: response.status,
        message:
          response.status === 401
            ? '登录信息已过期，请重新登录'
            : '无权限访问，请重新登录',
      };
    }

    const data = await response.json();

    return {
      code: data.code || 200,
      message: data.message,
      data: data.data,
    };
  } catch (error) {
    console.error('API 请求错误:', error);
    const errorMessage = error instanceof Error ? error.message : '服务器错误';
    message.error(errorMessage);
    return {
      code: 500,
      message: errorMessage,
    };
  }
};


export const StatisticsUrl = `${API_BASE_PATH}/statistics/stream`;
