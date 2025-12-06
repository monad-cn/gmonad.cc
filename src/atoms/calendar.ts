import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import dayjs, { Dayjs } from 'dayjs'

// 日历选中日期的原子
export const selectedDateAtom = atom<Dayjs>(dayjs())

// 日历状态筛选的原子 - 持久化存储
export const statusFilterAtom = atomWithStorage<string>(
  'calendar-status-filter',
  '3',
  {
    getItem: (key) => {
      if (typeof window === 'undefined') return '3'
      return localStorage.getItem(key) ?? '3'
    },
    setItem: (key, value) => {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, value)
    },
    removeItem: (key) => {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    }
  }
)

// 当前查看月份的原子，用于数据加载 - 持久化存储
export const currentMonthAtom = atomWithStorage<string>(
  'calendar-current-month',
  dayjs().format('YYYY-MM'),
  {
    getItem: (key) => {
      if (typeof window === 'undefined') return dayjs().format('YYYY-MM')
      return localStorage.getItem(key) ?? dayjs().format('YYYY-MM')
    },
    setItem: (key, value) => {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, value)
    },
    removeItem: (key) => {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    }
  }
)

// 派生原子：将字符串转换为 Dayjs 对象
export const currentMonthDayjsAtom = atom<Dayjs, [Dayjs], void>(
  (get) => {
    const monthStr = get(currentMonthAtom)
    // 确保使用存储的值，避免每次都生成新的当前月份
    return dayjs(monthStr)
  },
  (_, set, newValue: Dayjs) => {
    set(currentMonthAtom, newValue.format('YYYY-MM'))
  }
)