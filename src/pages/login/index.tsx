import React from 'react';
import { Form, Input, Button } from 'antd';
import styles from './index.module.css';
import Link from 'next/link';

type FieldType = {
  username?: string;
  password?: string;
};

const onFinish = (values: FieldType) => {
  console.log('登录表单提交: ', values);
};

const Login: React.FC = () => {
  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <h2 className={styles.title}>欢迎登录</h2>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名或邮箱' }]}
          >
            <Input placeholder="用户名或邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.link}>
          还没有账号？
          <Link href="/register">立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
