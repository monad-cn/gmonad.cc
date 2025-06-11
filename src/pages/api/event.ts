import { apiRequest } from "./api"

// 定义创建事件的请求参数接口
export interface CreateEventParams {
  title: string
  desc: string
  categary: "online" | "offline"
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
  pageSize?: number // 每页数量，默认 10
  category?: string // 事件类型（保留兼容性）
  status?: string // 事件状态（保留兼容性）
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
  categary: string
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
    // 验证必填参数
    if (!eventParams.title || !eventParams.desc || !eventParams.categary || !eventParams.start_time) {
      return {
        success: false,
        message: "缺少必填参数：标题、描述、类型和开始时间不能为空",
      }
    }

    // 验证活动类型相关参数
    if (eventParams.categary === "online" && !eventParams.link) {
      return {
        success: false,
        message: "线上活动必须提供活动链接",
      }
    }

    if (eventParams.categary === "offline" && !eventParams.location) {
      return {
        success: false,
        message: "线下活动必须提供活动地址",
      }
    }

    // 构造请求体
    const requestBody = {
      title: eventParams.title.trim(),
      desc: eventParams.desc.trim(),
      categary: eventParams.categary,
      location: eventParams.categary === "offline" ? eventParams.location.trim() : "",
      link: eventParams.categary === "online" ? eventParams.link.trim() : "",
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
    const response = await apiRequest<EventApiResponse>(
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
      data: null,
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
    const pageSize = params?.pageSize || 10
    queryParams.append("pageSize", pageSize.toString())

    // 兼容性参数（如果后端也支持这些参数）
    if (params?.category && params.category.trim()) {
      queryParams.append("category", params.category.trim())
    }

    if (params?.status && params.status.trim()) {
      queryParams.append("status", params.status.trim())
    }

    const endpoint = `/events?${queryParams.toString()}`

    console.log("获取事件列表请求URL:", endpoint)

    const response = await apiRequest<EventApiResponse>(endpoint, "GET")

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
      data: null,
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

    const response = await apiRequest<EventApiResponse>(`/events/${eventId}`, "GET")

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
      data: null,
    }
  } catch (error: any) {
    console.error("获取事件详情异常:", error)

    return {
      success: false,
      message: error?.message || "网络错误，请稍后重试",
    }
  }
}

// 更新事件接口
export const updateEvent = async (eventId: string, eventParams: Partial<CreateEventParams>): Promise<EventResult> => {
  try {
    if (!eventId) {
      return {
        success: false,
        message: "事件ID不能为空",
      }
    }

    // 构造请求体，只包含需要更新的字段
    const requestBody: any = {}

    if (eventParams.title) requestBody.title = eventParams.title.trim()
    if (eventParams.desc) requestBody.desc = eventParams.desc.trim()
    if (eventParams.categary) requestBody.categary = eventParams.categary
    if (eventParams.location) requestBody.location = eventParams.location.trim()
    if (eventParams.link) requestBody.link = eventParams.link.trim()
    if (eventParams.start_time) requestBody.start_time = eventParams.start_time
    if (eventParams.end_time) requestBody.end_time = eventParams.end_time
    if (eventParams.cover_img !== undefined) requestBody.cover_img = eventParams.cover_img
    if (eventParams.tags) requestBody.tags = eventParams.tags
    if (eventParams.max_participants !== undefined) requestBody.max_participants = eventParams.max_participants
    if (eventParams.registration_deadline) requestBody.registration_deadline = eventParams.registration_deadline
    if (eventParams.require_approval !== undefined) requestBody.require_approval = eventParams.require_approval
    if (eventParams.allow_waitlist !== undefined) requestBody.allow_waitlist = eventParams.allow_waitlist

    console.log("更新事件请求参数:", requestBody)

    const response = await apiRequest<EventApiResponse>(`/events/${eventId}`, "PUT", requestBody)

    if (response.code === 200) {
      return {
        success: true,
        message: response.message || "事件更新成功",
        data: response.data,
      }
    }

    return {
      success: false,
      message: response.message || "事件更新失败",
      data: null,
    }
  } catch (error: any) {
    console.error("更新事件异常:", error)

    return {
      success: false,
      message: error?.message || "网络错误，请稍后重试",
    }
  }
}

// 删除事件接口
export const deleteEvent = async (eventId: string): Promise<EventResult> => {
  try {
    if (!eventId) {
      return {
        success: false,
        message: "事件ID不能为空",
      }
    }

    const response = await apiRequest<EventApiResponse>(`/events/${eventId}`, "DELETE")

    if (response.code === 200) {
      return {
        success: true,
        message: response.message || "事件删除成功",
        data: response.data,
      }
    }

    return {
      success: false,
      message: response.message || "事件删除失败",
      data: null,
    }
  } catch (error: any) {
    console.error("删除事件异常:", error)

    return {
      success: false,
      message: error?.message || "网络错误，请稍后重试",
    }
  }
}

// 工具函数：格式化事件参数
export const formatEventParams = (formData: any): CreateEventParams => {
  return {
    title: formData.title || "",
    desc: formData.description || "",
    categary: formData.eventType || "online",
    location: formData.eventType === "offline" ? formData.location || "" : "",
    link: formData.eventType === "online" ? formData.location || "" : "",
    start_time: formatDateTime(formData.startDate, formData.startTime),
    end_time: formatDateTime(formData.endDate, formData.endTime),
    cover_img: formData.coverImage || "",
    tags: formData.tags || [],
    max_participants: formData.maxParticipants,
    registration_deadline: formData.registrationDeadline,
    require_approval: formData.requireApproval,
    allow_waitlist: formData.allowWaitlist,
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

// 工具函数：验证事件参数
export const validateEventParams = (params: CreateEventParams): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!params.title || params.title.trim().length === 0) {
    errors.push("活动标题不能为空")
  }

  if (!params.desc || params.desc.trim().length === 0) {
    errors.push("活动描述不能为空")
  }

  if (!params.categary || !["online", "offline"].includes(params.categary)) {
    errors.push("活动类型必须是 online 或 offline")
  }

  if (!params.start_time) {
    errors.push("开始时间不能为空")
  }

  if (params.categary === "online" && (!params.link || params.link.trim().length === 0)) {
    errors.push("线上活动必须提供活动链接")
  }

  if (params.categary === "offline" && (!params.location || params.location.trim().length === 0)) {
    errors.push("线下活动必须提供活动地址")
  }

  if (!Array.isArray(params.tags)) {
    errors.push("标签必须是数组格式")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
