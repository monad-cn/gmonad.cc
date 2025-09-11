import React from 'react';
import { Card, Empty } from 'antd';
import { TrendingUp, Users, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { PostType, PostsStats } from '@/types/posts';
import styles from '../../pages/posts/index.module.css';
import Link from 'next/link';

interface PostSidebarProps {
  postsStats: PostsStats | null;
  onPostClick: (post: PostType) => void;
}

export default function PostSidebar({
  postsStats,
  onPostClick,
}: PostSidebarProps) {
  return (
    <div className={styles.sidebar}>
      {/* 热门帖子 */}
      <Card className={styles.sidebarCard}>
        <div className={styles.sidebarHeader}>
          <TrendingUp className={styles.sidebarIcon} />
          <h3 className={styles.sidebarTitle}>热门帖子</h3>
        </div>
        <div className={styles.hotPosts}>
          {(postsStats?.weekly_hot_posts ?? []).map((post, index) => {
            if (!post) return null;

            const user =
              (post.user as { username?: string; name?: string }) || {};
            const userName = user.username || user.name || '未知用户';

            return (
              <div
                key={post.ID}
                className={styles.hotPostItem}
                onClick={() => onPostClick(post)}
              >
                <div className={styles.hotPostRank}>{index + 1}</div>
                <div className={styles.hotPostContent}>
                  <h4 className={styles.hotPostTitle}>
                    {post.title || '无标题'}
                  </h4>
                  <div className={styles.hotPostMeta}>
                    <span className={styles.hotPostAuthor}>{userName}</span>
                    <span className={styles.hotPostViews}>
                      {post.view_count || 0} 浏览
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {(postsStats?.weekly_hot_posts?.length ?? 0) === 0 && (
            <Empty description="暂无热门帖子" />
          )}
        </div>
      </Card>

      {/* 活跃用户 */}
      <Card className={styles.sidebarCard}>
        <div className={styles.sidebarHeader}>
          <Users className={styles.sidebarIcon} />
          <h3 className={styles.sidebarTitle}>活跃作者</h3>
        </div>
        <div className={styles.activeUsers}>
          {(postsStats?.top_active_users ?? []).map((user) => {
            if (!user) return null;

            const userName = user.username || '未知用户';
            const userAvatar = user.avatar || '/placeholder.svg';

            return (
              <Link key={user.id} href={`/dashboard/${user.id}`} className={styles.activeUserItem}>
                <Image
                  width={40}
                  height={40}
                  src={userAvatar}
                  alt={userName}
                  className={styles.activeUserAvatar}
                />
                <div className={styles.activeUserInfo}>
                  <div className={styles.activeUserName}>{userName}</div>
                  <div className={styles.activeUserPosts}>
                    帖子数: {user.post_count || 0}
                  </div>
                </div>
              </Link>
            );
          })}
          {(postsStats?.top_active_users?.length ?? 0) === 0 && (
            <Empty description="暂无活跃用户" />
          )}
        </div>
      </Card>

      {/* 社区统计 */}
      <Card className={styles.sidebarCard}>
        <div className={styles.sidebarHeader}>
          <MessageCircle className={styles.sidebarIcon} />
          <h3 className={styles.sidebarTitle}>社区统计</h3>
        </div>
        <div className={styles.communityStats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {postsStats?.total_posts?.toLocaleString() ?? '0'}
            </div>
            <div className={styles.statLabel}>总帖子数</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {postsStats?.active_user_count?.toLocaleString() ?? '0'}
            </div>
            <div className={styles.statLabel}>活跃用户</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {postsStats?.weekly_post_count?.toLocaleString() ?? '0'}
            </div>
            <div className={styles.statLabel}>本周帖子</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
