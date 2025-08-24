import React from 'react';
import { Modal, Button, Tooltip } from 'antd';
import { Clock, Eye, Heart, Bookmark } from 'lucide-react';
import { SiX } from 'react-icons/si';
import Image from 'next/image';
import dayjs from 'dayjs';
import { PostType } from '@/types/posts';
import styles from '../../pages/posts/index.module.css';

interface PostDetailModalProps {
  visible: boolean;
  loading: boolean;
  post: PostType | null;
  postContent: string;
  isAuthenticated: boolean;
  likeState: boolean;
  bookmarkState: boolean;
  likeCount: number;
  favoriteCount: number;
  onClose: () => void;
  onLike: (postId: number, e: React.MouseEvent) => void;
  onBookmark: (postId: number, e: React.MouseEvent) => void;
}

export default function PostDetailModal({
  visible,
  loading,
  post,
  postContent,
  isAuthenticated,
  likeState,
  bookmarkState,
  likeCount,
  favoriteCount,
  onClose,
  onLike,
  onBookmark,
}: PostDetailModalProps) {
  if (!post) return null;

  const user =
    (post.user as { username?: string; name?: string; avatar?: string }) || {};
  const userName = user.username || user.name || '未知用户';
  const userAvatar = user.avatar || '/placeholder.svg';

  return (
    <Modal
      loading={loading}
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className={styles.postDetailModal}
    >
      <div className={styles.postDetailContent}>
        {/* 帖子头部 */}
        <div className={styles.postDetailHeader}>
          <div className={styles.postDetailAuthor}>
            <Image
              src={userAvatar}
              width={40}
              height={40}
              alt={userName}
              className={styles.postDetailAvatar}
            />
            <div className={styles.postDetailAuthorInfo}>
              <h4 className={styles.postDetailAuthorName}>{userName}</h4>

              <div className={styles.postDetailMeta}>
                <div className={styles.postDetailTime}>
                  <Clock size={16} />
                  <span>
                    {post.CreatedAt
                      ? dayjs(post.CreatedAt).format('YYYY-MM-DD HH:mm')
                      : '未知时间'}
                  </span>
                </div>

                {(post.view_count || 0) > 0 && (
                  <div className={styles.postDetailStat}>
                    <Eye size={16} />
                    <span>{post.view_count?.toLocaleString()} 浏览</span>
                  </div>
                )}

                <div className={styles.postDetailTags}>
                  {(post.tags || []).slice(0, 3).map((tag, index) => (
                    <span key={index} className={styles.postDetailTag}>
                      {tag}
                    </span>
                  ))}
                  {(post.tags || []).length > 3 && (
                    <span className={styles.postDetailTag}>
                      +{(post.tags || []).length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 推文链接 */}
          {post.twitter && (
            <a
              href={post.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.postDetailXLink}
            >
              <SiX size={18} />
              <span>查看推文</span>
            </a>
          )}
        </div>

        {/* 帖子标题 */}
        <h1 className={styles.postDetailTitle}>{post.title || '无标题'}</h1>

        {/* 帖子内容 */}
        <div className={styles.postDetailBody}>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: postContent || '' }}
          />
        </div>

        {/* 帖子统计和操作 */}
        <div className={styles.postDetailFooter}>
          <div className={styles.postDetailActions}>
            {/* 点赞按钮 */}
            <Tooltip
              title={
                !isAuthenticated
                  ? '登录后可点赞'
                  : likeState
                    ? '取消点赞'
                    : '点赞'
              }
              placement="top"
            >
              <Button
                type="text"
                size="large"
                icon={
                  <Heart size={16} fill={likeState ? 'currentColor' : 'none'} />
                }
                className={`${styles.postDetailActionBtn} ${
                  likeState ? styles.liked : ''
                } ${!isAuthenticated ? styles.guestBtn : ''}`}
                onClick={(e) => onLike(post.ID, e)}
              >
                {likeCount > 0 && <span>{likeCount}</span>}
              </Button>
            </Tooltip>

            {/* 收藏按钮 */}
            <Tooltip
              title={
                !isAuthenticated
                  ? '登录后可收藏'
                  : bookmarkState
                    ? '取消收藏'
                    : '收藏'
              }
              placement="top"
            >
              <Button
                type="text"
                size="large"
                icon={
                  <Bookmark
                    size={16}
                    fill={bookmarkState ? 'currentColor' : 'none'}
                  />
                }
                className={`${styles.postDetailActionBtn} ${
                  bookmarkState ? styles.bookmarked : ''
                } ${!isAuthenticated ? styles.guestBtn : ''}`}
                onClick={(e) => onBookmark(post.ID, e)}
              >
                {favoriteCount > 0 && <span>{favoriteCount}</span>}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </Modal>
  );
}
