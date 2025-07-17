import { useState } from "react"
import { Form, Input, Button, message } from "antd"
import { Send, MessageSquare, LinkIcon, Mail, CheckCircle } from "lucide-react"
import styles from "./index.module.css"
import { createFeedback } from "../api/feedback"
import { useAuth } from '@/contexts/AuthContext'

const { TextArea } = Input

interface FeedbackForm {
  content: string
  url?: string
  email?: string
}

export default function FeedbackPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { session, status } = useAuth()

  const handleSubmit = async (values: FeedbackForm) => {
    try {
      setLoading(true)

      const createFeedbackRequest: any = {
        content: values.content || '',
        url: values.url || '',
        email: values.email || '',
      }

      const result = await createFeedback(createFeedbackRequest)
      if (result.success) {
        message.success(result.message || '反馈提交成功')
        setSubmitted(true)
      } else {
        message.error(result.message || '反馈提交失败')
      }
    } catch (error) {
      console.error('创建反馈异常:', error)
      message.error('提交反馈出错，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroMain}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>意见反馈</h1>
              <p className={styles.heroDescription}>
                您的意见对我们非常重要。请告诉我们您的想法、建议或遇到的问题，我们会认真对待每一条反馈。
              </p>
            </div>
            <div className={styles.heroImage}>
              <img src="/memework.jpeg" alt="Monad 吉祥物在工作" className={styles.mascotImage} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className={styles.mainSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>提交反馈</h2>
              <p className={styles.formSubtitle}>请详细描述您的问题或建议，这将帮助我们更好地提升用户体验</p>
            </div>

            <div className={styles.formContent}>
              {!session ? (
                <div className={styles.loginNotice}>
                  <p>您需要先登录才能提交反馈。</p>
                </div>
              ) : submitted ? (
                <div className={styles.successMessage}>
                  <CheckCircle className={styles.successIcon} />
                  <div className={styles.successText}>反馈提交成功！感谢您的宝贵意见，我们会尽快处理。</div>
                </div>
              ) : (
                <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={loading}>
                  <div className={styles.formGroup}>
                    <div className={styles.formLabel}>
                      <MessageSquare size={16} />
                      反馈内容
                      <span className={styles.requiredMark}>*</span>
                    </div>
                    <Form.Item
                      name="content"
                      rules={[
                        { required: true, message: "请输入反馈内容" },
                        { min: 10, message: "反馈内容至少需要10个字符" },
                        { max: 1000, message: "反馈内容不能超过1000个字符" },
                      ]}
                    >
                      <TextArea
                        placeholder="请详细描述您遇到的问题、建议或想法..."
                        className={styles.formTextarea}
                        showCount
                        maxLength={1000}
                      />
                    </Form.Item>
                    <div className={styles.helpText}>请尽可能详细地描述问题，包括操作步骤、预期结果和实际结果等</div>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.formLabel}>
                      <LinkIcon size={16} />
                      相关链接
                      <span className={styles.optionalMark}>(可选)</span>
                    </div>
                    <Form.Item name="url" rules={[{
                      type: "url",
                      message: "请输入有效的链接地址"
                    }]}>
                      <Input
                        placeholder="如果问题与特定页面相关，请提供链接"
                        className={styles.formInput}
                      />
                    </Form.Item>
                    <div className={styles.helpText}>提供相关链接有助于我们更快定位和解决问题</div>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.formLabel}>
                      <Mail size={16} />
                      联系方式
                      <span className={styles.optionalMark}>(可选)</span>
                    </div>
                    <Form.Item
                      name="email"
                      rules={[
                        {
                          type: "email",
                          message: "请输入有效的邮箱地址",
                        },
                      ]}
                    >
                      <Input
                        placeholder="请输入您的邮箱地址，方便我们联系您"
                        className={styles.formInput}
                      />
                    </Form.Item>
                    <div className={styles.helpText}>提供联系方式后，我们可以及时向您反馈处理进度</div>
                  </div>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      className={styles.submitButton}
                    >
                      <span className={styles.innerContent}>
                        <Send className={styles.submitIcon} />
                        {loading ? "提交中..." : "提交反馈"}
                      </span>
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
