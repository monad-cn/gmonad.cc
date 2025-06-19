import { apiRequest } from "./api";

// 登录参数
export interface LoginParams {
  email: string;
  password: string;
}

// 登录响应数据
export interface LoginUser {
  ID: number;
  username: string;
  email: string;
  avatar: string,
  permissions: string[],
}

// 登录结果
export interface LoginResult {
  success: boolean;
  message: string;
  data?: LoginUser;
}


export const loginUser = async (params: LoginParams): Promise<LoginResult> => {
  try {
    const body = {
      email: params.email.trim(),
      password: params.password.trim(),
    };

    const response = await apiRequest<LoginResult>('/login', 'POST', body);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '登录成功',
        data: response.data as unknown as LoginUser,
      };
    }

    return { success: false, message: response.message ?? '登录失败' };
  } catch (error: any) {
    console.error('登录异常:', error);
    return { success: false, message: error?.message ?? '网络错误，请稍后重试' };
  }
};
