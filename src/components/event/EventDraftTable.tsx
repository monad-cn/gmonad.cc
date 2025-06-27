import React, { Fragment } from 'react';
import { Table, Button } from 'antd';
import type { TableProps } from 'antd';
import router from 'next/router';
import { Edit } from 'lucide-react';

interface DataType {
  title: string;
  start_time: string;
  location: string;
  ID: number;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

interface EventDraftTableProps {
  styles?: { [key: string]: string };
  status: string;
  permissions: string[];
  data: DataType[];
  pagination: Pagination,
  loading: boolean;
}

const EventDraftTable: React.FC<EventDraftTableProps> = ({ styles, status, permissions, data, loading, pagination }) => {
  const columns: TableProps<DataType>['columns'] = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        return (
          <Button
            type="text"
            size="small"
            icon={<Edit className={styles?.listActionIcon} />}
            title="编辑活动"
            onClick={() => router.push(`/events/${record.ID}/edit`)}
          />
        )
      }
    },
  ];

  return <Fragment>
    <h3>已保存的活动草稿</h3>
    <Table<DataType> columns={columns} dataSource={data} size="small" loading={loading} pagination={pagination} />
  </Fragment>;
}

export default EventDraftTable;
