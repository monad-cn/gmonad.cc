import { getSession, signOut } from 'next-auth/react';

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
  // 获取 API 域名（根据环境变量）
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('API URL is not defined');
  }

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
    return {
      code: 500,
      message: error instanceof Error ? error.message : '服务器错误',
    };
  }
};


export const StatisticsUrl = process.env.NEXT_PUBLIC_API_URL + "/statistics/stream"