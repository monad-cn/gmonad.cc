import { RiRegisteredLine } from 'react-icons/ri';
import { apiRequest } from './api';

// 创建事件请求参数接口
export interface CreateEventParams {
  title: string;
  description: string;
  event_mode: '线上活动' | '线下活动';
  event_type: 'meetup' | 'ama' | 'hackathon' | 'workshop';
  location: string;
  link: string;
  start_time: string;
  end_time: string;
  cover_img: string;
  tags: string[];
  twitter: string;
  registration_deadline?: string;
  registration_link?: string;
}

export interface UpdateEventParams {
  title: string;
  description: string;
  event_mode: '线上活动' | '线下活动';
  event_type: 'meetup' | 'ama' | 'hackathon' | 'workshop';
  location: string;
  link: string;
  start_time: string;
  end_time: string;
  cover_img: string;
  tags: string[];
  twitter: string;
  registration_deadline?: string;
  registration_link?: string;
}

export interface GetEventsParams {
  keyword?: string;
  tag?: string;
  order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
  status?: string | number;
  location?: string;
  event_mode?: string;
  event_type?: string;
  publish_status?: number;
}

export interface Event {
  ID: number;
  title: string;
  CreatedAt: string;
  UpdatedAt: string;
  description: string;
  event_mode: string;
  event_type: string;
  location: string;
  link: string;
  start_time: string;
  end_time: string;
  cover_img: string;
  tags: string[];
  twitter: string;
  participants: number;
  registration_link: string;
  registration_deadline: string;
}

// 分页返回数据结构
export interface PaginatedEventData {
  events: Event[];
  page: number;
  page_size: number;
  total: number;
}

// 统一结果结构
export interface EventListResult {
  success: boolean;
  message: string;
  data?: PaginatedEventData;
}

export interface EventResult {
  success: boolean;
  message: string;
  data?: Event;
}

export const createEvent = async (
  params: CreateEventParams
): Promise<EventResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      event_mode: params.event_mode,
      event_type: params.event_type,
      location: params.location ?? '',
      link: params.link ?? '',
      start_time: params.start_time,
      end_time: params.end_time,
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      twitter: params.twitter ?? '',
      registration_link: params.registration_link ?? '',
      registration_deadline: params.registration_deadline ?? '',
    };

    const response = await apiRequest<EventResult>('/events', 'POST', body);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '活动创建成功',
        data: response.data as unknown as Event,
      };
    }

    return { success: false, message: response.message ?? '活动创建失败' };
  } catch (error: any) {
    console.error('创建活动异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// export const saveEventDraft = async (
//   params: CreateEventParams
// ): Promise<EventResult> => {
//   try {
//     const body = {
//       title: params.title.trim(),
//       desc: params.description.trim(),
//       event_mode: params.event_mode,
//       location: params.event_mode === '线下活动' ? params.location.trim() : '',
//       link: params.event_mode === '线上活动' ? params.link.trim() : '',
//       start_time: params.start_time,
//       end_time: params.end_time,
//       cover_img: params.cover_img,
//       tags: params.tags ?? [],
//       twitter: params.twitter ?? '',
//       ...(params.max_participants != null && {
//         max_participants: params.max_participants,
//       }),
//       ...(params.registration_deadline && {
//         registration_deadline: params.registration_deadline,
//       }),
//       ...(typeof params.require_approval === 'boolean' && {
//         require_approval: params.require_approval,
//       }),
//       ...(typeof params.allow_waitlist === 'boolean' && {
//         allow_waitlist: params.allow_waitlist,
//       }),
//     };

//     const response = await apiRequest<EventResult>(
//       '/events/draft',
//       'POST',
//       body
//     );

//     if (response.code === 200 && response.data) {
//       return {
//         success: true,
//         message: response.message ?? '保存草稿成功',
//         data: response.data as unknown as Event,
//       };
//     }

//     return { success: false, message: response.message ?? '保存草稿失败' };
//   } catch (error: any) {
//     console.error('保存草稿异常:', error);
//     return {
//       success: false,
//       message: error?.message ?? '网络错误，请稍后重试',
//     };
//   }
// };

export const updateEventDraft = async (
  eventId: string,
  params: UpdateEventParams
): Promise<EventResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      event_mode: params.event_mode,
      event_type: params.event_type,
      location: params.location,
      link: params.link,
      start_time: params.start_time,
      end_time: params.end_time,
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      twitter: params.twitter ?? '',
      registration_deadline: params.registration_deadline,
      registration_link: params.registration_link,
    };

    const response = await apiRequest<EventResult>(
      `/events/draft/${eventId}`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '活动草稿更新成功',
        data: response.data as unknown as Event,
      };
    }

    return { success: false, message: response.message ?? '活动草稿更新失败' };
  } catch (error: any) {
    console.error('活动草稿更新异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const updateEvent = async (
  eventId: string,
  params: UpdateEventParams
): Promise<EventResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      event_mode: params.event_mode,
      event_type: params.event_type,
      location: params.location,
      link: params.link,
      start_time: params.start_time,
      end_time: params.end_time,
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      twitter: params.twitter ?? '',
      registration_deadline: params.registration_deadline,
      registration_link: params.registration_link,
    };

    const response = await apiRequest<EventResult>(
      `/events/${eventId}`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '活动创建成功',
        data: response.data as unknown as Event,
      };
    }

    return { success: false, message: response.message ?? '活动创建失败' };
  } catch (error: any) {
    console.error('创建活动异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const updateEventPublishStatus = async (
  eventId: string,
  publishStatus: number
): Promise<EventResult> => {
  try {
    const body = {
      publish_status: publishStatus,
    };

    const response = await apiRequest<EventResult>(
      `/events/${eventId}/status`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '活动状态更新成功',
        data: response.data as unknown as Event,
      };
    }

    return { success: false, message: response.message ?? '活动状态更新失败' };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const getEvents = async (
  params: GetEventsParams = {}
): Promise<EventListResult> => {
  try {
    const query = new URLSearchParams();

    if (params.keyword?.trim()) query.append('keyword', params.keyword.trim());
    if (params.tag?.trim()) query.append('tag', params.tag.trim());
    if (params.location?.trim())
      query.append('location', params.location.trim());
    if (params.event_mode?.trim())
      query.append('event_mode', params.event_mode.trim());
    if (params.event_type?.trim())
      query.append('event_type', params.event_type.trim());

    if (params.status != null) query.append('status', params.status.toString());
    if (params.publish_status != null)
      query.append('publish_status', params.publish_status.toString());

    query.append('order', params.order ?? 'desc');
    query.append('page', (params.page ?? 1).toString());
    query.append('page_size', (params.page_size ?? 6).toString());

    const response = await apiRequest<EventListResult>(
      `/events?${query.toString()}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取活动列表成功',
        data: response.data as unknown as PaginatedEventData,
      };
    }

    return { success: false, message: response.message ?? '获取活动列表失败' };
  } catch (error: any) {
    console.error('获取活动列表异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// export const getEventDrafts = async (
//   params: GetEventsParams = {}
// ): Promise<EventListResult> => {
//   try {
//     const query = new URLSearchParams();

//     query.append('page', (params.page ?? 1).toString());
//     query.append('page_size', (params.page_size ?? 6).toString());

//     const response = await apiRequest<EventListResult>(
//       `/events/draft?${query.toString()}`,
//       'GET'
//     );

//     if (response.code === 200 && response.data) {
//       return {
//         success: true,
//         message: response.message ?? '获取活动草稿列表成功',
//         data: response.data as unknown as PaginatedEventData,
//       };
//     }

//     return {
//       success: false,
//       message: response.message ?? '获取活动草稿列表失败',
//     };
//   } catch (error: any) {
//     console.error('获取活动草稿列表异常:', error);
//     return {
//       success: false,
//       message: error?.message ?? '网络错误，请稍后重试',
//     };
//   }
// };

// 获取单个事件详情
export const getEventById = async (eventId: string): Promise<EventResult> => {
  try {
    if (!eventId) {
      return { success: false, message: '活动ID不能为空' };
    }

    const response = await apiRequest<EventResult>(`/events/${eventId}`, 'GET');

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取活动成功',
        data: response.data as unknown as Event,
      };
    }

    return { success: false, message: response.message ?? '获取活动失败' };
  } catch (error: any) {
    console.error('获取活动异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 删除事件
export const deleteEvent = async (eventId: number): Promise<EventResult> => {
  try {
    const response = await apiRequest<EventResult>(
      `/events/${eventId}`,
      'DELETE'
    );

    if (response.code === 200) {
      return { success: true, message: response.message ?? '删除成功' };
    }

    return { success: false, message: response.message ?? '删除失败' };
  } catch (error: any) {
    console.error('删除活动异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 工具函数：格式化日期时间
export const formatDateTime = (date: any, time: any): string => {
  try {
    if (!date || !time) return '';

    if (
      typeof date?.format === 'function' &&
      typeof time?.format === 'function'
    ) {
      return `${date.format('YYYY-MM-DD')} ${time.format('HH:mm:ss')}`;
    }

    if (date instanceof Date && time instanceof Date) {
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = time.toTimeString().split(' ')[0];
      return `${dateStr} ${timeStr}`;
    }

    if (typeof date === 'string' && typeof time === 'string') {
      return `${date} ${time}`;
    }

    return '';
  } catch (error) {
    console.error('格式化日期时间失败:', error);
    return '';
  }
};
