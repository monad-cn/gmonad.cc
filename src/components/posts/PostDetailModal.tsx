import React from 'react';
import { Modal, Button, Tooltip } from 'antd';
import { Clock, Eye, Heart, Bookmark, UserPlus, Check } from 'lucide-react';
import { SiX } from 'react-icons/si';
import Image from 'next/image';
import dayjs from 'dayjs';
import { PostType } from '@/types/posts';
import styles from '../../pages/posts/index.module.css';

// 优化头像组件，避免不必要的重新渲染
const MemoizedAvatar = React.memo(({ src, alt, width, height, className }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}) => (
  <Image
    src={src}
    width={width}
    height={height}
    alt={alt}
    className={className}
  />
));

// 优化作者信息部分，避免因为点赞收藏状态变化导致重新渲染
const MemoizedAuthorSection = React.memo(({ 
  userAvatar, 
  userName, 
  post, 
  isAuthenticated, 
  userId, 
  currentUserId, 
  followingState, 
  onFollow 
}: {
  userAvatar: string;
  userName: string;
  post: PostType;
  isAuthenticated: boolean;
  userId?: number;
  currentUserId?: number;
  followingState?: boolean;
  onFollow: (userId: number, e: React.MouseEvent) => void;
}) => (
  <div className={styles.postDetailAuthor}>
    <div className={styles.avatarContainer}>
      <MemoizedAvatar
        src={userAvatar}
        width={40}
        height={40}
        alt={userName}
        className={styles.postDetailAvatar}
      />
      {/* 关注按钮 - 只有登录且不是自己的帖子时显示 */}
      {isAuthenticated && userId && currentUserId !== userId && (
        <Button
          type="primary"
          size="small"
          icon={
            followingState ? (
              <Check size={12} />
            ) : (
              <UserPlus size={12} />
            )
          }
          className={`${styles.followButton} ${
            followingState ? styles.following : ''
          }`}
          onClick={(e) => onFollow(userId, e)}
        >
          {followingState ? '已关注' : '关注'}
        </Button>
      )}
    </div>
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
));

// 优化内容部分，避免因为点赞收藏状态变化导致重新渲染
const MemoizedPostContent = React.memo(({ 
  title, 
  postContent 
}: {
  title: string;
  postContent: string;
}) => (
  <>
    {/* 帖子标题 */}
    <h1 className={styles.postDetailTitle}>{title || '无标题'}</h1>

    {/* 帖子内容 */}
    <div className={styles.postDetailBody}>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: postContent || '' }}
      />
    </div>
  </>
));

interface PostDetailModalProps {
  visible: boolean;
  loading: boolean;
  post: PostType | null;
  postContent: string;
  isAuthenticated: boolean;
  currentUserId?: number;
  likeState?: boolean;
  bookmarkState?: boolean;
  followingState?: boolean;
  likeCount: number;
  favoriteCount: number;
  isShowOperate?: boolean;
  onClose: () => void;
  onLike: (postId: number, e: React.MouseEvent) => void;
  onBookmark: (postId: number, e: React.MouseEvent) => void;
  onFollow: (userId: number, e: React.MouseEvent) => void;
}

export default function PostDetailModal({
  visible,
  loading,
  post,
  postContent,
  isAuthenticated,
  currentUserId,
  likeState,
  bookmarkState,
  followingState,
  likeCount,
  favoriteCount,
  isShowOperate,
  onClose,
  onLike,
  onBookmark,
  onFollow,
}: PostDetailModalProps) {
  const user = post
    ? (post.user as {
        ID?: number;
        username?: string;
        name?: string;
        avatar?: string;
      }) || {}
    : {};
  const userName = user.username || user.name || '未知用户';
  const userAvatar = user.avatar || '/placeholder.svg';
  const userId = user.ID;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className={styles.postDetailModal}
    >
      {loading || !post ? (
        <div className={styles.postDetailLoading}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
          <p className={styles.loadingText}>加载中...</p>
        </div>
      ) : (
        <div className={styles.postDetailContent}>
          {/* 帖子头部 */}
          <div className={styles.postDetailHeader}>
            <MemoizedAuthorSection
              userAvatar={userAvatar}
              userName={userName}
              post={post}
              isAuthenticated={isAuthenticated}
              userId={userId}
              currentUserId={currentUserId}
              followingState={followingState}
              onFollow={onFollow}
            />

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

          <MemoizedPostContent
            title={post.title}
            postContent={postContent}
          />

          {/* 帖子统计和操作 */}
          <div className={styles.postDetailFooter}>
            <div className={styles.postDetailActions}>
              {/* 点赞按钮 */}
              {isShowOperate ? (
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
                      <Heart
                        size={16}
                        fill={likeState ? 'currentColor' : 'none'}
                      />
                    }
                    className={`${styles.postDetailActionBtn} ${
                      likeState ? styles.liked : ''
                    } ${!isAuthenticated ? styles.guestBtn : ''}`}
                    onClick={(e) => onLike(post.ID, e)}
                  >
                    {likeCount > 0 && <span>{likeCount}</span>}
                  </Button>
                </Tooltip>
              ) : null}

              {/* 收藏按钮 */}
              {isShowOperate ? (
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
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
