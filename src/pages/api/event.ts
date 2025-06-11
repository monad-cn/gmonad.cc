import { apiRequest } from "./api"

// 定义创建事件的请求参数接口
export interface CreateEventParams {
  title: string
  desc: string
  event_mode: "线上活动" | "线下活动"
  location: string
  link: string
  start_time: string
  end_time: string
  cover_img: string
  tags: string[]
  max_participants?: number
  registration_deadline?: string
  require_approval?: boolean
  allow_waitlist?: boolean
}

// 定义获取事件列表的查询参数接口
export interface GetEventsParams {
  keyword?: string // 搜索关键词
  tag?: string // 标签筛选
  order?: "asc" | "desc" // 排序方式，默认 desc
  page?: number // 页码，默认 1
  page_size?: number // 每页数量，默认 10
  status?: string | number 
  location?: string
  event_mode?: string // 事件类型（保留兼容性）
}



// 定义 API 响应接口
export interface EventApiResponse {
  code: number
  message: string
  data: any
}

export interface Event {
  ID: number
  title: string
  CreatedAt: string
  UpdatedAt: string
  description: string
  event_mode: string
  location: string
  start_time: string  // 或者 Date
  end_time: string
  cover_img: string
  tags: string[]
}

// 返回结构（分页数据）
export interface PaginatedEventData {
  events: Event[]
  page: number
  page_size: number
  total: number
}

// API 统一返回结构
export interface EventResult {
  success: boolean
  message: string
  data?: PaginatedEventData
}

// 创建事件接口
export const createEvent = async (eventParams: CreateEventParams): Promise<EventResult> => {
  try {
    // 构造请求体
    const requestBody = {
      title: eventParams.title.trim(),
      desc: eventParams.desc.trim(),
      event_mode: eventParams.event_mode,
      location: eventParams.event_mode === "线下活动" ? eventParams.location.trim() : "",
      link: eventParams.event_mode === "线上活动" ? eventParams.link.trim() : "",
      start_time: eventParams.start_time,
      end_time: eventParams.end_time || "",
      cover_img: eventParams.cover_img || "",
      tags: eventParams.tags || [],
      // 可选参数
      ...(eventParams.max_participants && { max_participants: eventParams.max_participants }),
      ...(eventParams.registration_deadline && { registration_deadline: eventParams.registration_deadline }),
      ...(eventParams.require_approval !== undefined && { require_approval: eventParams.require_approval }),
      ...(eventParams.allow_waitlist !== undefined && { allow_waitlist: eventParams.allow_waitlist }),
    }

    console.log("创建事件请求参数:", requestBody)

    // 调用通用 API 请求函数
    const response = await apiRequest<PaginatedEventData>(
      "/events", // 事件接口端点
      "POST", // 请求方法
      requestBody, // 请求体
    )

    console.log("创建事件响应:", response)

    // 如果请求成功并返回数据
    if (response.code === 200) {
      return {
        success: true,
        message: response.message || "事件创建成功",
        data: response.data,
      }
    }

    // 如果请求失败，返回错误信息
    return {
      success: false,
      message: response.message || "事件创建失败",
    }
  } catch (error: any) {
    console.error("创建事件异常:", error)

    // 返回异常错误信息
    return {
      success: false,
      message: error?.message || "网络错误，请稍后重试",
    }
  }
}

// 获取事件列表接口 - 适配后端参数
export const getEvents = async (params?: GetEventsParams): Promise<EventResult> => {
  try {
    // 构造查询参数，使用后端期望的参数名
    const queryParams = new URLSearchParams()

    // 搜索关键词
    if (params?.keyword && params.keyword.trim()) {
      queryParams.append("keyword", params.keyword.trim())
    }

    // 标签筛选
    if (params?.tag && params.tag.trim()) {
      queryParams.append("tag", params.tag.trim())
    }

    // 排序方式，默认 desc
    const order = params?.order || "desc"
    queryParams.append("order", order)

    // 页码，默认 1
    const page = params?.page || 1
    queryParams.append("page", page.toString())

    // 每页数量，默认 10
    const pageSize = params?.page_size || 10
    queryParams.append("page_size", pageSize.toString())

    // 兼容性参数（如果后端也支持这些参数）
    if (params?.event_mode && params.event_mode.trim()) {
      queryParams.append("event_mode", params.event_mode.trim())
    }

    if (params?.status) {
      queryParams.append("status", params.status.toString())
    }

    if (params?.location && params.location.trim()) {
      queryParams.append("location", params.location.trim())
    }

    const endpoint = `/events?${queryParams.toString()}`

    console.log("获取事件列表请求URL:", endpoint)

    const response = await apiRequest<PaginatedEventData>(endpoint, "GET")

    console.log("获取事件列表响应:", response)

    if (response.code === 200) {
      return {
        success: true,
        message: response.message || "获取事件列表成功",
        data: response.data,
      }
    }

    return {
      success: false,
      message: response.message || "获取事件列表失败",
    }
  } catch (error: any) {
    console.error("获取事件列表异常:", error)

    return {
      success: false,
      message: error?.message || "网络错误，请稍后重试",
    }
  }
}

// 获取单个事件详情接口
export const getEventById = async (eventId: string): Promise<EventResult> => {
  try {
    if (!eventId) {
      return {
        success: false,
        message: "事件ID不能为空",
      }
    }

    const response = await apiRequest<PaginatedEventData>(`/events/${eventId}`, "GET")

    if (response.code === 200) {
      return {
        success: true,
        message: response.message || "获取事件详情成功",
        data: response.data,
      }
    }

    return {
      success: false,
      message: response.message || "获取事件详情失败",
    }
  } catch (error: any) {
    console.error("获取事件详情异常:", error)

    return {
      success: false,
      message: error?.message || "网络错误，请稍后重试",
    }
  }
}

// 工具函数：格式化日期时间
export const formatDateTime = (date: any, time: any): string => {
  if (!date || !time) return ""

  try {
    // 如果是 dayjs 对象
    if (date.format && time.format) {
      const dateStr = date.format("YYYY-MM-DD")
      const timeStr = time.format("HH:mm:ss")
      return `${dateStr} ${timeStr}`
    }

    // 如果是 Date 对象
    if (date instanceof Date && time instanceof Date) {
      const dateStr = date.toISOString().split("T")[0]
      const timeStr = time.toTimeString().split(" ")[0]
      return `${dateStr} ${timeStr}`
    }

    // 如果是字符串
    if (typeof date === "string" && typeof time === "string") {
      return `${date} ${time}`
    }

    return ""
  } catch (error) {
    console.error("格式化日期时间失败:", error)
    return ""
  }
}
