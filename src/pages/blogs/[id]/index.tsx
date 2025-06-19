import React from 'react';
import { useRouter } from 'next/router';
import { Card, Tag, Button, Typography, Space, Result } from 'antd';
import { Blog } from '../../../types/blog';
import styles from '../index.module.css';

// mock数据，实际可替换为API
const blogs: Blog[] = [
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
];

const BlogDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const blog = blogs.find((b) => b.id === Number(id));

  if (!blog) {
    return (
      <div className={styles.container}>
        <Result
          status="404"
          title="未找到该博客"
          subTitle="你访问的博客不存在或已被删除。"
          extra={
            <Button type="primary" onClick={() => router.push('/blogs')}>
              返回博客列表
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card title={<span className={styles.cardTitle}>{blog.name}</span>}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <span className={styles.author}>作者：{blog.author}</span>
            <Tag color="purple" style={{ marginLeft: 8 }}>
              排版：{blog.layout}
            </Tag>
            <span className={styles.date} style={{ marginLeft: 8 }}>
              日期：{blog.date}
            </span>
          </div>
          <div className={styles.tags}>
            {blog.tags.map((tag) => (
              <Tag color="magenta" key={tag}>
                {tag}
              </Tag>
            ))}
          </div>
          {blog.translation && (
            <div className={styles.translation}>翻译：{blog.translation}</div>
          )}
          <Typography.Paragraph className={styles.content}>
            {blog.content}
          </Typography.Paragraph>
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={() => router.push(`/blogs/${blog.id}/edit`)}
            >
              编辑
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default BlogDetail;
