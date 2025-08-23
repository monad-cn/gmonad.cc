import React from 'react';
import { Card, Input, Select, DatePicker, Button } from 'antd';
import { Search, Calendar, RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';
import DateButton from '@/components/base/DateButton';
import styles from '../index.module.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface PostFiltersProps {
  searchTerm: string;
  sortBy: string;
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null];
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onDateRangeChange: (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => void;
  onReset: () => void;
}

export default function PostFilters({
  searchTerm,
  sortBy,
  dateRange,
  onSearchChange,
  onSortChange,
  onDateRangeChange,
  onReset,
}: PostFiltersProps) {
  return (
    <Card className={styles.filtersCard}>
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <Input
            placeholder="搜索帖子、作者..."
            prefix={<Search className={styles.searchIcon} />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
            size="large"
          />
        </div>

        <div className={styles.dateContainer}>
          <RangePicker
            prefix={
              <>
                <DateButton
                  style={{ marginRight: '4px' }}
                  size="small"
                  color="primary"
                  variant="filled"
                  dateRange={dateRange}
                  handleDateRangeChange={onDateRangeChange}
                  label="今天"
                  dates={[dayjs(), dayjs()]}
                  active={
                    dateRange?.[0]?.format('YYYY-MM-DD') ===
                      dayjs().format('YYYY-MM-DD') &&
                    dateRange?.[1]?.format('YYYY-MM-DD') ===
                      dayjs().format('YYYY-MM-DD')
                  }
                />
                <DateButton
                  size="small"
                  color="primary"
                  variant="filled"
                  dateRange={dateRange}
                  handleDateRangeChange={onDateRangeChange}
                  label="近一周"
                  dates={[dayjs().subtract(1, 'week'), dayjs()]}
                  active={
                    dateRange[0]?.format('YYYY-MM-DD') ===
                      dayjs().subtract(1, 'week').format('YYYY-MM-DD') &&
                    dateRange[1]?.format('YYYY-MM-DD') ===
                      dayjs().format('YYYY-MM-DD')
                  }
                />
                <DateButton
                  size="small"
                  color="default"
                  variant="filled"
                  dateRange={dateRange}
                  handleDateRangeChange={onDateRangeChange}
                  label="全部"
                  dates={[null, null]}
                  active={!dateRange[0] && !dateRange[1]}
                />
              </>
            }
            placeholder={['开始日期', '结束日期']}
            value={dateRange}
            onChange={onDateRangeChange}
            className={styles.dateRangePicker}
            size="large"
            suffixIcon={<Calendar className={styles.calendarIcon} />}
            format="YYYY-MM-DD"
            allowClear
          />
        </div>

        <div className={styles.sortContainer}>
          <Select
            value={sortBy}
            onChange={onSortChange}
            className={styles.sortSelect}
            size="large"
          >
            <Option value="desc">最新发布</Option>
            <Option value="asc">最早发布</Option>
          </Select>
        </div>

        <div className={styles.resetContainer}>
          <Button
            icon={<RotateCcw size={16} />}
            onClick={onReset}
            className={styles.resetButton}
            size="large"
          >
            重置
          </Button>
        </div>
      </div>
    </Card>
  );
}
