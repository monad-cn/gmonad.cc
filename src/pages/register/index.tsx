import React from 'react';
import { Form, Input, Button, Divider } from 'antd';
import styles from './index.module.css';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // ✅ 引入 signIn 方法

type FieldType = {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

const onFinish = (values: FieldType) => {
  console.log('注册表单提交: ', values);
  // 可以调用你自己的注册 API
};

const RegisterPage: React.FC = () => {
  return (
    <div className={styles.registerPage}>
      <div className={styles.container}>
        <h2 className={styles.title}>创建账户</h2>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.registerButton}
              block
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>或</Divider>

        {/* ✅ Google 注册按钮 */}
        <Button
          className={styles.googleRegisterButton}
          type="default"
          block
          onClick={() => signIn('google', { callbackUrl: '/' })}
        >
          使用 Google 注册
        </Button>

        <div className={styles.link}>
          已有账号？<Link href="/login">前往登录</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
