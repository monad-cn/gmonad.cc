import { apiRequest } from "./api";

export interface UpdateUserParams {
    email: string;
    avatar: string;
    github: string;
    username: string;
}

export interface User {
    ID: number;
    username: string;
    github: string;
    email: string;
    avatar: string;
}

export interface UserResult {
    success: boolean;
    message: string;
    data?: User;
}

export const updateUser = async (
    userId: number,
    params: UpdateUserParams
): Promise<UserResult> => {
    try {
        const body = {
            email: params.email.trim(),
            avatar: params.avatar.trim(),
            github: params.github.trim(),
            username: params.username?.trim(),
        };

        const response = await apiRequest<UserResult>(
            `/users/${userId}`,
            'PUT',
            body
        );

        if (response.code === 200 && response.data) {
            return {
                success: true,
                message: response.message ?? '更新成功',
                data: response.data as unknown as User,
            };
        }

        return { success: false, message: response.message ?? '更新失败' };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message ?? '网络错误，请稍后重试',
        };
    }
};