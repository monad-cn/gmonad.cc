'use client';
import React, { useState } from 'react';
import { Form, Input, Button, Divider, App } from 'antd';
import { signIn } from 'next-auth/react';
import styles from './index.module.css';
import { useRouter } from 'next/router';

type FieldType = {
  username?: string;
  password?: string;
};

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  const onFinish = async (values: FieldType) => {
    console.log('登录表单提交: ', values);

    try {
      // 你自己的表单登录逻辑
      const { username, password } = values;
      setLoading(true);
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      console.log(res);

      if (res?.ok) {
        router.push('/'); // 登录成功跳转
      } else {
        message.warning('登录失败...');
      }
    } catch (error) {
      message.error('网络错误...');
    } finally {
      setLoading(false);
    }
  };

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
              block
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        {/*  Google 登录按钮 */}
        {/* <Button
          className={styles.googleLoginButton}
          type="default"
          block
          loading={loading}
          onClick={handleGoogleLogin} // 启动 Google OAuth 流程
        >
          使用 Google 登录
        </Button> */}

        {/* <div className={styles.link}>
          还没有账号？<Link href="/register">立即注册</Link>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;
