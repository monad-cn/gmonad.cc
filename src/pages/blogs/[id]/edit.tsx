import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, Button, Select, Card, App as AntdApp } from 'antd';
import { Blog } from '../../../types/blog';
import styles from '../index.module.css';
import QuillEditor from '@/components/quillEditor/QuillEditor';

const { Option } = Select;

// mock数据，实际应替换为API
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

const layoutOptions = ['默认', '科技', '生活', '随笔'];
const tagOptions = ['区块链', '技术', '未来', '生活', '随笔'];

const EditBlog: React.FC = () => {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = router.query;
  const blog = blogs.find((b) => b.id === Number(id));

  if (!blog) {
    return <div style={{ padding: 32 }}>未找到该博客</div>;
  }

  const onFinish = (values: Omit<Blog, 'id' | 'date'> & { tags: string[] }) => {
    // 实际应调用API，这里仅做演示
    message.success('博客修改成功！');
    setTimeout(() => {
      router.push(`/blogs/${blog.id}`);
    }, 800);
  };

  // 富文本处理
  const handleQuillEditorChange = useCallback(
    (value: string) => {
      form.setFieldValue('description', value);
    },
    [form]
  );

  return (
    <div className={styles.containerEdit}>
      <Card
        bordered={false}
        className={styles.card}
        title={<span className={styles.cardTitle}>编辑博客</span>}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={blog}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入博客名称' }]}
          >
            <Input placeholder="请输入博客名称" />
          </Form.Item>
          <Form.Item
            name="author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item name="translation" label="翻译">
            <Input placeholder="请输入翻译（可选）" />
          </Form.Item>
          <Form.Item
            name="layout"
            label="排版"
            rules={[{ required: true, message: '请选择排版' }]}
          >
            <Select placeholder="请选择排版">
              {layoutOptions.map((l) => (
                <Option value={l} key={l}>
                  {l}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请选择标签' }]}
          >
            <Select mode="tags" placeholder="请选择标签">
              {tagOptions.map((t) => (
                <Option value={t} key={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <QuillEditor
              placeholder="请输入博客内容"
              value={form.getFieldValue('content')}
              onChange={handleQuillEditorChange}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
            <Button
              style={{ marginLeft: 16 }}
              onClick={() => router.push(`/blogs/${blog.id}`)}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditBlog;
