import dayjs from 'dayjs';
import { Button, ButtonProps } from 'antd';

interface DateButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null];// 原本的时间
  handleDateRangeChange: (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => void;
  loading: boolean;
  label: string;
  dates:[dayjs.Dayjs | null, dayjs.Dayjs | null] // 修改的时间
}

export default function DateButton({ 
  dateRange, 
  handleDateRangeChange, 
  loading, 
  label, 
  dates,
  ...buttonProps 
}: DateButtonProps) {
  const handleButtonDate = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();

    handleDateRangeChange(dates);
  };

  return (
    <Button 
      {...buttonProps}
      loading={loading}
      onClick={(e) => handleButtonDate(e)}
    >
      {label}
    </Button>
  );
}
