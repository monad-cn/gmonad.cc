import React from 'react';
import { Button } from 'antd';
import { SiX } from 'react-icons/si';

interface TwitterShareProps {
  /**
   * 分享的标题
   */
  title: string;
  /**
   * 分享的描述文本
   */
  description?: string;
  /**
   * 分享的URL，默认为当前页面URL
   */
  url?: string;
  /**
   * 相关的hashtags，不需要包含#符号
   */
  hashtags?: string[];
  /**
   * 提及的用户，不需要包含@符号
   */
  via?: string;
  /**
   * 按钮样式类型
   */
  type?: 'primary' | 'default' | 'text' | 'link';
  /**
   * 按钮大小
   */
  size?: 'large' | 'middle' | 'small';
  /**
   * 自定义按钮文本
   */
  buttonText?: string;
  /**
   * 是否只显示图标
   */
  iconOnly?: boolean;
  /**
   * 自定义样式类名
   */
  className?: string;
  /**
   * 点击分享后的回调
   */
  onShare?: () => void;
}

export default function TwitterShare({
  title,
  description,
  url,
  hashtags = [],
  via = 'gmonad_cc',
  type = 'link',
  size = 'middle',
  buttonText = '分享到推特',
  iconOnly = false,
  className = '',
  onShare,
}: TwitterShareProps) {
  /**
   * 生成推特分享URL
   */
  const generateTwitterUrl = () => {
    const currentUrl =
      url || (typeof window !== 'undefined' ? window.location.href : '');

    // 构建推特分享文本
    let text = title;
    if (description) {
      text += `\n\n${description}`;
    }

    // 添加hashtags
    if (hashtags.length > 0) {
      text += '\n\n' + hashtags.map((tag) => `#${tag}`).join(' ');
    }

    // 构建URL参数
    const params = new URLSearchParams({
      text: text,
      url: currentUrl,
    });

    if (via) {
      params.append('via', via);
    }

    return `https://twitter.com/intent/tweet?${params.toString()}`;
  };

  /**
   * 处理分享点击
   */
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = generateTwitterUrl();

    // 在新标签页打开推特分享
    window.open(shareUrl, '_blank', 'noopener,noreferrer');

    // 触发回调
    onShare?.();
  };

  return (
    <Button
      type={type}
      size={size}
      icon={<SiX size={16} />}
      className={`twitter-share-btn ${className}`}
      onClick={handleShare}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: '#1d9bf0',
        borderColor: type === 'default' ? '#1d9bf0' : undefined,
      }}
    >
      {!iconOnly && buttonText}
    </Button>
  );
}

/**
 * 预设的分享内容生成器
 */
export const TwitterSharePresets = {
  /**
   * 博客文章分享
   */
  blogPost: (title: string, excerpt?: string, url?: string) => ({
    title: `📝 ${title}`,
    description: excerpt,
    url,
    hashtags: ['区块链', 'Web3', 'Monad', '技术分享'],
    buttonText: '分享文章',
  }),

  /**
   * 活动分享
   */
  event: (title: string, description?: string, url?: string) => ({
    title: `🎉 ${title}`,
    description: description,
    url,
    hashtags: ['活动', 'Monad', 'Web3', '区块链'],
    buttonText: '分享活动',
  }),

  /**
   * 教程分享
   */
  tutorial: (title: string, description?: string, url?: string) => ({
    title: `🎓 ${title}`,
    description: description,
    url,
    hashtags: ['教程', 'Web3', 'Monad', '学习'],
    buttonText: '分享教程',
  }),

  /**
   * DApp分享
   */
  dapp: (name: string, description?: string, url?: string) => ({
    title: `🚀 发现了一个不错的DApp：${name}`,
    description: description,
    url,
    hashtags: ['DApp', 'Web3', 'Monad', '去中心化应用'],
    buttonText: '分享DApp',
  }),

  /**
   * 社区动态分享
   */
  community: (content: string, url?: string) => ({
    title: `💬 ${content}`,
    url,
    hashtags: ['社区', 'Monad', 'Web3'],
    buttonText: '分享动态',
  }),
};
