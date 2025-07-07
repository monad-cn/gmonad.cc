'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { App as AntdApp } from 'antd';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './QuillEditor.module.css';
import type ReactQuillType from 'react-quill-new';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }); // 直接引入ReactQuill在SSR情况下会报错
type ReactQuillProps = React.ComponentProps<typeof ReactQuillType>;

interface QuillEditorProps extends ReactQuillProps {
  height?: number | string;
  minHeight?: number | string;
  autoHeight?: boolean;
}

const FULLSCREEN_ICONS = {
  ENTER: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 3h6v6"/>
    <path d="M9 21H3v-6"/>
    <path d="M21 3l-7 7"/>
    <path d="M3 21l7-7"/>
  </svg>`,

  EXIT: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 14h6v6"/>
    <path d="M20 10h-6V4"/>
    <path d="m14 10 7-7"/>
    <path d="m3 21 7-7"/>
  </svg>`,
};

function QuillEditor(props: QuillEditorProps) {
  const { height, minHeight, autoHeight, ...restProps } = props;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { message } = AntdApp.useApp();

  // 图片上传错误处理
  const handleImageError = useCallback(
    (error: string) => {
      message.error(error);
    },
    [message]
  );

  // 高度样式计算
  const getContainerStyle = useCallback(() => {
    if (isFullscreen) return {};

    const style: React.CSSProperties = {};

    if (autoHeight) {
      style.height = '100%';
    } else if (height !== undefined) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }

    if (minHeight !== undefined) {
      style.minHeight =
        typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
    }

    return style;
  }, [height, minHeight, autoHeight, isFullscreen]);

  const getEditorStyle = useCallback(() => {
    if (isFullscreen) return {};

    const style: React.CSSProperties = {};

    if (autoHeight) {
      style.height = '100%';
      style.display = 'flex';
      style.flexDirection = 'column';
    } else if (height !== undefined) {
      const containerHeight =
        typeof height === 'number' ? `${height}px` : height;
      style.height = containerHeight;
      style.display = 'flex';
      style.flexDirection = 'column';
    }

    if (minHeight !== undefined) {
      style.minHeight =
        typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
      if (!style.display) {
        style.display = 'flex';
        style.flexDirection = 'column';
      }
    }

    return style;
  }, [height, minHeight, autoHeight, isFullscreen]);

  useEffect(() => {
    let fullscreenBtn: HTMLButtonElement | null = null;
    let observer: MutationObserver | null = null;
    let timer: NodeJS.Timeout | null = null;

    // 创建全屏按钮的函数
    const createFullscreenButton = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar && !toolbar.querySelector('.ql-fullscreen-group')) {
        // 创建全屏按钮
        fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = `ql-fullscreen ${styles.fullscreenButton}`;
        fullscreenBtn.type = 'button';
        fullscreenBtn.title = '全屏';

        // 创建图标容器
        const iconContainer = document.createElement('span');
        iconContainer.className = styles.iconContainer;

        // 设置初始图标
        iconContainer.innerHTML = FULLSCREEN_ICONS.ENTER;

        fullscreenBtn.appendChild(iconContainer);

        // 添加点击事件 - 使用当前状态的引用
        const handleClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          setIsFullscreen((prev) => {
            const newState = !prev;
            // 立即更新按钮状态
            setTimeout(() => updateButtonState(newState), 0);
            return newState;
          });
        };

        fullscreenBtn.addEventListener('click', handleClick);

        // 创建独立的全屏按钮组，确保位置稳定
        const fullscreenGroup = document.createElement('span');
        fullscreenGroup.className = 'ql-formats ql-fullscreen-group';

        // 设置按钮组样式，确保位置稳定
        Object.assign(fullscreenGroup.style, {
          marginLeft: '8px',
          borderLeft: '1px solid #ccc',
          paddingLeft: '8px',
        });

        fullscreenGroup.appendChild(fullscreenBtn);

        // 将全屏按钮组添加到工具栏末尾
        toolbar.appendChild(fullscreenGroup);

        return fullscreenBtn;
      }
      return null;
    };

    // 更新按钮状态的函数
    const updateButtonState = (fullscreenState: boolean) => {
      const btn = document.querySelector('.ql-fullscreen') as HTMLButtonElement;
      if (btn) {
        btn.title = fullscreenState ? '退出全屏' : '全屏';
        const iconContainer = btn.querySelector(`.${styles.iconContainer}`);
        if (iconContainer) {
          iconContainer.innerHTML = fullscreenState
            ? FULLSCREEN_ICONS.EXIT
            : FULLSCREEN_ICONS.ENTER;
        }
      }
    };

    // ESC键处理
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        // 立即更新按钮状态
        setTimeout(() => updateButtonState(false), 0);
      }
    };

    // 管理页面滚动
    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      // 更彻底地禁用页面滚动
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      // 恢复页面滚动
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    // 更新按钮状态
    updateButtonState(isFullscreen);

    // 如果是首次渲染，创建按钮
    if (!document.querySelector('.ql-fullscreen-group')) {
      // 使用MutationObserver监听DOM变化
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const toolbar = document.querySelector('.ql-toolbar');
            if (toolbar && !toolbar.querySelector('.ql-fullscreen-group')) {
              createFullscreenButton();
            }
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // 延迟添加按钮
      timer = setTimeout(() => {
        createFullscreenButton();
      }, 500);

      // 立即尝试添加
      createFullscreenButton();
    }

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // 确保恢复页面滚动
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';

      if (timer) clearTimeout(timer);
      if (observer) observer.disconnect();

      const fullscreenGroup = document.querySelector('.ql-fullscreen-group');
      if (fullscreenGroup && fullscreenGroup.parentNode) {
        fullscreenGroup.parentNode.removeChild(fullscreenGroup);
      }
    };
  }, [isFullscreen]);

  // 状态管理模块注册
  const [isModuleRegistered, setIsModuleRegistered] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // 动态注册Cloudinary模块到Quill
  useEffect(() => {
    let mounted = true;

    const initializeModule = async () => {
      try {
        // 使用单例模式的注册管理器
        const QuillModuleRegistry = (await import('./QuillModuleRegistry'))
          .default;
        const registry = QuillModuleRegistry.getInstance();

        const registered = await registry.ensureModuleRegistered();

        if (mounted) {
          setIsModuleRegistered(registered);
          setIsEditorReady(true);
        }
      } catch (error) {
        console.warn('Failed to initialize Quill module:', error);
        if (mounted) {
          setIsEditorReady(true); // 即使失败也允许编辑器加载
        }
      }
    };

    initializeModule();

    return () => {
      mounted = false;
    };
  }, []);

  // Quill模块配置中包含Cloudinary上传模块
  const modulesWithCloudinary = useCallback(() => {
    const defaultModules = restProps.modules || {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, false] }],

          [
            'bold',
            'italic',
            'underline',
            'strike',
            'blockquote',
            'formula',
            { align: [] },
            { color: [] },
            { background: [] },
          ],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
            'link',
            'image',
            'clean',
          ],
        ],
      },
    };

    // 只有在模块注册成功后才添加cloudinaryUploader配置
    if (isModuleRegistered) {
      return {
        ...defaultModules,
        cloudinaryUploader: {
          onError: handleImageError,
        },
      };
    }

    return defaultModules;
  }, [restProps.modules, handleImageError, isModuleRegistered]);

  return (
    <div
      className={`${styles.editorContainer} ${isFullscreen ? styles.fullscreenContainer : ''} ${autoHeight ? styles.autoHeightContainer : ''}`}
      style={getContainerStyle()}
    >
      {isEditorReady ? (
        <ReactQuill
          placeholder="请输入..."
          {...restProps}
          modules={modulesWithCloudinary()}
          className={`${isFullscreen ? styles.fullscreenEditor : ''} ${height !== undefined || minHeight !== undefined || autoHeight ? styles.heightControlledEditor : ''}`}
          style={getEditorStyle()}
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          正在加载编辑器...
        </div>
      )}
    </div>
  );
}

export default QuillEditor;
