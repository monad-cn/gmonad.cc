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

export interface FollowResult {
    success: boolean;
    message: string;
}


export const getUser = async (userId: number): Promise<UserResult> => {
  try {
    const response = await apiRequest<UserResult>(
      `/users/${userId}`,
      "GET"
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? "获取成功",
        data: response.data as unknown as User,
      };
    }

    return { success: false, message: response.message ?? "获取失败" };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? "网络错误，请稍后重试",
    };
  }
};


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


export const followUser = async (userId: number): Promise<FollowResult> => {
    try {
        const response = await apiRequest<FollowResult>(
            `/users/follow/${userId}`,
            "POST"
        );

        if (response.code === 200) {
            return {
                success: true,
                message: response.message ?? "关注成功",
            };
        }

        return {
            success: false,
            message: response.message ?? "关注失败",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message ?? "网络错误，请稍后重试",
        };
    }
};

export const unfollowUser = async (userId: number): Promise<FollowResult> => {
    try {
        const response = await apiRequest<FollowResult>(
            `/users/unfollow/${userId}`,
            "POST"
        );

        if (response.code === 200) {
            return {
                success: true,
                message: response.message ?? "取消关注成功",
            };
        }

        return {
            success: false,
            message: response.message ?? "取消关注失败",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message ?? "网络错误，请稍后重试",
        };
    }
};


export interface FollowState {
  user_id: number;
  is_following: boolean;
}

export interface FollowStatesResult {
  success: boolean;
  message: string;
  data?: FollowState[];
}

export const getFollowStates = async (
  userIds: number[]
): Promise<FollowStatesResult> => {
  try {
    const response = await apiRequest<FollowStatesResult>(
      "/users/follow/states",
      "POST",
      { user_ids: userIds }
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? "ok",
        data: response.data as unknown as FollowState[],
      };
    }

    return { success: false, message: response.message ?? "查询失败" };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? "网络错误，请稍后重试",
    };
  }
};