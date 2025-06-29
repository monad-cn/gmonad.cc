import { apiRequest } from "./api";

// 登录参数
export interface LoginParams {
  code: string;
}

// 登录响应数据
export interface LoginUser {
  ID: number;
  username: string;
  github: string;
  email: string;
  avatar: string,
  permissions: string[],
  token: string,
}

// 登录结果
export interface LoginResult {
  success: boolean;
  message: string;
  data?: LoginUser;
}


export const loginUser = async (params: LoginParams): Promise<LoginResult> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      throw new Error('API URL is not defined');
    }

    const body = {
      code: params.code.trim(),
    };

    // 直接使用 fetch，避免在认证过程中调用 apiRequest（会尝试获取 session）
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok && data.code === 200 && data.data) {
      return {
        success: true,
        message: data.message ?? '登录成功',
        data: data.data as LoginUser,
      };
    }

    return { success: false, message: data.message ?? '登录失败' };
  } catch (error: any) {
    console.error('登录异常:', error);
    return { success: false, message: error?.message ?? '网络错误，请稍后重试' };
  }
};
