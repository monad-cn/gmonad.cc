import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { App as AntdApp } from 'antd';
import {Dapp, getDapps} from '@/pages/api/dapp';

export function useDAppSearch() {
  const { message } = AntdApp.useApp();

  const [dappList, setDappList] = useState<Dapp[]>([]);
  const [allDapps, setAllDapps] = useState<Dapp[]>([]);
  const [dappLoading, setDappLoading] = useState(false);
  const [dappSearchKeyword, setDappSearchKeyword] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 获取所有 Dapp 数据（本地搜索）
  const fetchAllDapps = useCallback(async () => {
    try {
      setDappLoading(true);
      const result = await getDapps({
        page: 1,
        page_size: 1000
      });

      if (result.success && result.data) {
        const allDappData = result.data.dapps || [];
        setAllDapps(allDappData);
        setDappList(allDappData);
      } else {
        message.warning(result.message || '获取 Dapp 列表失败');
      }
    } catch (error) {
      console.error('获取 Dapp 列表失败:', error);
      message.error('获取 Dapp 列表出错');
    } finally {
      setDappLoading(false);
    }
  }, [message]);

  // 本地搜索过滤函数（大小写不敏感，只搜索名字）
  const filterDappsByKeyword = useMemo(() => (keyword: string) => {
    if (!keyword.trim()) {
      return allDapps;
    }

    const lowerKeyword = keyword.toLowerCase().trim();
    return allDapps.filter(dapp =>
      dapp.name.toLowerCase().includes(lowerKeyword)
    );
  }, [allDapps]);

  // DApp 搜索处理（本地搜索，大小写不敏感，只搜索名字）
  const handleDappSearch = useCallback((value: string) => {
    setDappSearchKeyword(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const filteredDapps = filterDappsByKeyword(value);
      setDappList(filteredDapps);
    }, 200);
  }, [filterDappsByKeyword]);

  useEffect(() => {
    fetchAllDapps();

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchAllDapps]);

  return {
    dappList,
    allDapps,
    dappLoading,
    dappSearchKeyword,
    handleDappSearch,
    refetch: fetchAllDapps,
  };
}
