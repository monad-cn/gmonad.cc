import React, { useState } from 'react';
import {
  Card,
  Button,
  Tag,
  Row,
  Col,
  Input,
  Select,
  Space,
  Pagination,
} from 'antd';
import { AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';
import styles from './index.module.css';
import { useRouter } from 'next/router';

const { Option } = Select;

// mock数据
const blogs = [
  {
    id: 1,
    name: 'Monad是什么？',
    content: 'Monad 是下一代区块链技术...',
    author: 'Alice',
    translation: 'What is Monad?',
    layout: '默认',
    tags: ['区块链', '技术'],
    date: '2024-06-01',
  },
  {
    id: 2,
    name: '区块链的未来',
    content: '区块链将如何改变世界...',
    author: 'Bob',
    translation: 'phoouze',
    layout: '科技',
    tags: ['区块链', '未来'],
    date: '2024-06-02',
  },
  {
    id: 3,
    name: '区块链的未来',
    content: '区块链将如何改变世界...',
    author: 'Bob',
    translation: 'phoouze',
    layout: '科技',
    tags: ['区块链', '未来'],
    date: '2024-06-02',
  },
  {
    id: 4,
    name: '区块链的未来',
    content: '区块链将如何改变世界...',
    author: 'Bob',
    translation: 'phoouze',
    layout: '科技',
    tags: ['区块链', '未来'],
    date: '2024-06-02',
  },
  {
    id: 5,
    name: '区块链的未来',
    content: '区块链将如何改变世界...',
    author: 'Bob',
    translation: 'phoouze',
    layout: '科技',
    tags: ['区块链', '未来'],
    date: '2024-06-02',
  },
  {
    id: 6,
    name: '区块链的未来',
    content: '区块链将如何改变世界...',
    author: 'Bob',
    translation: 'phoouze',
    layout: '科技',
    tags: ['区块链', '未来'],
    date: '2024-06-02',
  },
  {
    id: 7,
    name: '区块链的未来',
    content: '区块链将如何改变世界...',
    author: 'Bob',
    translation: 'phoouze',
    layout: '科技',
    tags: ['区块链', '未来'],
    date: '2024-06-02',
  },
  {
    id: 8,
    name: '区块链的未来',
    content: '区块链将如何改变世界...',
    author: 'Bob',
    translation: 'phoouze',
    layout: '科技',
    tags: ['区块链', '未来'],
    date: '2024-06-02',
  },
  {
    id: 9,
    name: '区块链的未来',
    content: '区块链将如何改变世界...',
    author: 'Bob',
    translation: 'phoouze',
    layout: '科技',
    tags: ['区块链', '未来'],
    date: '2024-06-02',
  },
];

const allTags = Array.from(new Set(blogs.flatMap((b) => b.tags)));
const PAGE_SIZE = 8;

const BlogList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const router = useRouter();

  const filtered = blogs.filter((blog) => {
    const matchSearch =
      blog.name.includes(search) || blog.content.includes(search);
    const matchTag = tag ? blog.tags.includes(tag) : true;
    return matchSearch && matchTag;
  });

  // 分页数据
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>博客列表</h2>
        <Space>
          <Input
            className={styles.search}
            placeholder="搜索博客..."
            prefix={<AiOutlineSearch />}
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            size="middle"
          />
          <Select
            className={styles.tagSelect}
            placeholder="标签筛选"
            allowClear
            value={tag}
            onChange={(v) => {
              setTag(v);
              setPage(1);
            }}
            size="middle"
            style={{ minWidth: 100 }}
          >
            {allTags.map((t) => (
              <Option value={t} key={t}>
                {t}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<AiOutlinePlus />}
            className={styles.createBtn}
            onClick={() => router.push('/blogs/new')}
          >
            创建博客
          </Button>
        </Space>
      </div>
      {paged.length > 0 ? (
        <Row gutter={[16, 16]}>
          {paged.map((blog) => (
            <Col xs={24} sm={12} md={8} lg={6} key={blog.id}>
              <Card
                className={styles.card}
                title={<span className={styles.cardTitle}>{blog.name}</span>}
                bordered={false}
                bodyStyle={{ padding: 16 }}
              >
                <div className={styles.tags}>
                  {blog.tags.map((tag) => (
                    <Tag color="purple" key={tag}>
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div className={styles.content}>
                  {blog.content.slice(0, 32)}...
                </div>
                {blog.translation && (
                  <div className={styles.translation}>
                    翻译：{blog.translation}
                  </div>
                )}
                <div className={styles.layout}>排版：{blog.layout}</div>
                <div className={styles.cardFooter}>
                  <span className={styles.date}>{blog.date}</span>
                  <Space>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => router.push(`/blogs/${blog.id}`)}
                    >
                      详情
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => router.push(`/blogs/${blog.id}/edit`)}
                    >
                      编辑
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className={styles.emptyWrap}>
          <div className={styles.emptyIcon}>📖</div>
          <div className={styles.emptyTitle}>暂无博客</div>
          <div className={styles.emptyDesc}>没有找到符合条件的博客</div>
        </div>
      )}
      <div className={styles.paginationWrap}>
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default BlogList;
