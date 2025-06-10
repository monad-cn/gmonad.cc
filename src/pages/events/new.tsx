import type React from "react"

import { ArrowLeft, Calendar, MapPin, Users, Video, Globe, FileText, ImageIcon, Save, X, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import styles from "./new.module.css"
import router from "next/router"

export default function NewEventPage() {
  const [eventType, setEventType] = useState<"online" | "offline">("online")
  const [tags, setTags] = useState<string[]>(["技术分享"])

  const handleAddTag = () => {
    const newTag = prompt("请输入标签名称:")
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 这里处理表单提交逻辑
    console.log("提交活动创建表单")
    // 可以跳转回活动列表页面
    router.push('/events')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/events" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          返回活动列表
        </Link>
        <h1 className={styles.title}>新建活动</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* 左侧表单 */}
          <div className={styles.leftColumn}>
            {/* 基本信息 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FileText className={styles.sectionIcon} />
                基本信息
              </h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>活动标题 *</label>
                <input type="text" className={styles.input} placeholder="请输入活动标题" required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>活动描述 *</label>
                <textarea className={styles.textarea} placeholder="请详细描述活动内容、目标和亮点" rows={4} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>活动类型 *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="eventType"
                      value="online"
                      checked={eventType === "online"}
                      onChange={(e) => setEventType(e.target.value as "online" | "offline")}
                      className={styles.radio}
                    />
                    <Video className={styles.radioIcon} />
                    线上活动
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="eventType"
                      value="offline"
                      checked={eventType === "offline"}
                      onChange={(e) => setEventType(e.target.value as "online" | "offline")}
                      className={styles.radio}
                    />
                    <MapPin className={styles.radioIcon} />
                    线下活动
                  </label>
                </div>
              </div>
            </div>

            {/* 时间和地点 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Calendar className={styles.sectionIcon} />
                时间和地点
              </h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>开始日期 *</label>
                  <input type="date" className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>开始时间 *</label>
                  <input type="time" className={styles.input} required />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>结束日期</label>
                  <input type="date" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>结束时间</label>
                  <input type="time" className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{eventType === "online" ? "活动链接" : "活动地址"} *</label>
                <div className={styles.inputWithIcon}>
                  {eventType === "online" ? (
                    <Globe className={styles.inputIcon} />
                  ) : (
                    <MapPin className={styles.inputIcon} />
                  )}
                  <input
                    type="text"
                    className={styles.inputWithIconField}
                    placeholder={eventType === "online" ? "请输入会议链接或直播地址" : "请输入详细地址"}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 参与设置 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Users className={styles.sectionIcon} />
                参与设置
              </h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>最大参与人数</label>
                  <input type="number" className={styles.input} placeholder="不限制请留空" min="1" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>报名截止时间</label>
                  <input type="datetime-local" className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  需要审核报名
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  允许候补报名
                </label>
              </div>
            </div>
          </div>

          {/* 右侧表单 */}
          <div className={styles.rightColumn}>
            {/* 活动封面 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <ImageIcon className={styles.sectionIcon} />
                活动封面
              </h2>

              <div className={styles.imageUpload}>
                <div className={styles.imagePreview}>
                  <ImageIcon className={styles.imageIcon} />
                  <p className={styles.imageText}>点击上传活动封面</p>
                  <p className={styles.imageHint}>建议尺寸: 1200x630px</p>
                </div>
                <input type="file" accept="image/*" className={styles.fileInput} />
              </div>
            </div>

            {/* 标签 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Plus className={styles.sectionIcon} />
                活动标签
              </h2>

              <div className={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <div key={index} className={styles.tag}>
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.tagRemove}>
                      <X className={styles.tagRemoveIcon} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddTag} className={styles.addTagButton}>
                  <Plus className={styles.addTagIcon} />
                  添加标签
                </button>
              </div>
            </div>

            {/* 其他设置 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>其他设置</h2>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  活动结束后发送感谢邮件
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  允许参与者邀请朋友
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} />
                  立即发布活动
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className={styles.submitSection}>
          <Link href="/" className={styles.cancelButton}>
            取消
          </Link>
          <button type="submit" className={styles.submitButton}>
            <Save className={styles.submitIcon} />
            创建活动
          </button>
        </div>
      </form>
    </div>
  )
}
