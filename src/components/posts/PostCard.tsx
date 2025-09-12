import React from 'react';
import { Card, Button, Tooltip, Popconfirm } from 'antd';
import { Edit, Trash2, Heart, Bookmark, Eye, Check, Plus } from 'lucide-react';
import { SiX } from 'react-icons/si';
import Image from 'next/image';
import dayjs from 'dayjs';
import { PostType } from '@/types/posts';
import styles from '../../pages/posts/index.module.css';

import { parseMd } from '@/utils/posts';
import Link from 'next/link';

interface PostCardProps {
  post: PostType;
  isOwner: boolean;
  isAuthenticated: boolean;
  currentUserId?: number;
  likeState: boolean;
  bookmarkState: boolean;
  followingState: boolean;
  likeCount: number;
  favoriteCount: number;
  onPostClick: (post: PostType) => void;
  onLike: (postId: number, e: React.MouseEvent) => void;
  onBookmark: (postId: number, e: React.MouseEvent) => void;
  onFollow: (userId: number, e: React.MouseEvent) => void;
  onEdit: (post: PostType) => void;
  onDelete: (postId: number) => void;
}

export default function PostCard({
  post,
  isOwner,
  isAuthenticated,
  currentUserId,
  likeState,
  bookmarkState,
  followingState,
  likeCount,
  favoriteCount,
  onPostClick,
  onLike,
  onBookmark,
  onFollow,
  onEdit,
  onDelete,
}: PostCardProps) {
  if (!post) {
    return null;
  }

  const user =
    (post.user as { ID?: number; username?: string; name?: string; avatar?: string }) || {};
  const userName = user.username || user.name || '未知用户';
  const userAvatar = user.avatar || '/placeholder.svg';
  const userId = user.ID;

  return (
    <Card className={styles.postCard} onClick={() => onPostClick(post)}>
      <div className={styles.postContent}>
        {/* 帖子头部 */}
        <div className={styles.postHeader}>
          <div className={styles.authorSection}>
            <div className={styles.avatarContainer}>
              {/* 点击头像跳转 */}
              <Link href={`/dashboard/${userId}`} passHref>
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={36}
                  height={36}
                  className={styles.avatar}
                />
              </Link>

              {/* Follow/Unfollow button overlay */}
              {isAuthenticated &&
                userId &&
                currentUserId !== userId && (
                  <button
                    className={`${styles.followButtonOverlay} ${followingState ? styles.following : styles.notFollowing
                      }`}
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ 阻止冒泡，避免触发头像的跳转
                      onFollow(userId, e);
                    }}
                    title={followingState ? "取消关注" : "关注用户"}
                  >
                    {followingState ? <Check size={12} /> : <Plus size={12} />}
                  </button>
                )}
            </div>
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{userName}</span>
              <span className={styles.postDate}>
                {post.CreatedAt
                  ? dayjs(post.CreatedAt).format('YYYY-MM-DD HH:mm')
                  : '未知时间'}
              </span>
            </div>
          </div>

          {/* 右侧操作按钮 */}
          <div className={styles.headerActions}>
            {post.twitter && (
              <a
                href={post.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.twitterLink}
                onClick={(e) => e.stopPropagation()}
                title="查看推文"
              >
                <SiX size={14} />
                <span className={styles.twitterText}>查看推文</span>
              </a>
            )}
            {isOwner && (
              <div className={styles.ownerActions}>
                <Button
                  type="text"
                  size="small"
                  icon={<Edit size={14} />}
                  className={styles.editButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(post);
                  }}
                />
                <Popconfirm
                  title="确认删除该帖子吗？"
                  description="删除后将无法恢复"
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    onDelete(post.ID);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<Trash2 size={14} />}
                    className={styles.deleteButton}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            )}
          </div>
        </div>

        {/* 帖子标题 */}
        <h3 className={styles.postTitle}>{post.title || '无标题'}</h3>

        {/* 帖子描述 */}
        <div className={styles.postDescription}>
          <div
            dangerouslySetInnerHTML={{
              __html: parseMd(post.description || ''),
            }}
          />
        </div>

        {/* 帖子底部 */}
        <div className={styles.postFooter}>
          <div className={styles.tagsSection}>
            {(post.tags || []).slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
            {(post.tags || []).length > 3 && (
              <span className={styles.moreTagsIndicator}>
                +{(post.tags || []).length - 3}
              </span>
            )}
          </div>

          <div className={styles.interactionSection}>
            {/* 浏览量 */}
            {(post.view_count || 0) > 0 && (
              <Tooltip title="浏览量" placement="top">
                <Button
                  type="text"
                  size="small"
                  icon={<Eye size={14} />}
                  className={`${styles.interactionBtn} ${styles.viewCount}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{post.view_count?.toLocaleString()}</span>
                </Button>
              </Tooltip>
            )}

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
                size="small"
                icon={
                  <Heart size={14} fill={likeState ? 'currentColor' : 'none'} />
                }
                className={`${styles.interactionBtn} ${likeState ? styles.liked : ''
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
                size="small"
                icon={
                  <Bookmark
                    size={14}
                    fill={bookmarkState ? 'currentColor' : 'none'}
                  />
                }
                className={`${styles.interactionBtn} ${bookmarkState ? styles.bookmarked : ''
                  } ${!isAuthenticated ? styles.guestBtn : ''}`}
                onClick={(e) => onBookmark(post.ID, e)}
              >
                {favoriteCount > 0 && <span>{favoriteCount}</span>}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  );
}
