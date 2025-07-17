import { useCallback } from 'react';

export function useLocalStorage<T = any>(key: string) {
  // 获取
  const get = useCallback((): T | undefined => {
    if (typeof window === 'undefined') return undefined;
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
  }, [key]);

  // 设置/新增
  const set = useCallback(
    (value: T) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(value));
    },
    [key]
  );

  // 删除
  const remove = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }, [key]);

  // 更新（本质上就是 set）
  const update = useCallback(
    (updater: (old: T | undefined) => T) => {
      const oldValue = get();
      set(updater(oldValue));
    },
    [get, set]
  );

  return { get, set, remove, update };
}
