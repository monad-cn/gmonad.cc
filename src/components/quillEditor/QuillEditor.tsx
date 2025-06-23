import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './QuillEditor.module.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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

function QuillEditor(props: any) {
  const [value, setValue] = useState(props.value || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<any>(null);

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

  // 重点：handler 用 function，不要用箭头函数
  const modulesDefault = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        ['link', 'image'],
        ['clean'],
      ],
      // TODO 图片上传, 插入图片后输入文字导致图片重载，页面闪动。 复制粘贴图片上传cloudinary 还没处理
      // handlers: {
      //   image: async function imageHandler(this: any) {
      //     console.log('this', this);
      //     const input = document.createElement('input');
      //     input.setAttribute('type', 'file');
      //     input.setAttribute('accept', 'image/*');
      //     input.click();

      //     input.onchange = async () => {
      //       const file = input.files?.[0];
      //       if (file) {
      //         const { uploadImgToCloud } = await import('@/lib/cloudinary');

      //         let hideLoading: any;
      //         try {
      //           hideLoading = message.loading('图片上传中...', 0);
      //           const result = await uploadImgToCloud(file);
      //           if (result && result.secure_url) {
      //             const range = this.quill.getSelection();
      //             this.quill.insertEmbed(
      //               range.index,
      //               'image',
      //               result.secure_url
      //             );
      //             this.quill.setSelection(range.index + 1);
      //             hideLoading();

      //             message.success('图片上传成功');
      //           } else {
      //             hideLoading();
      //             message.error('图片上传失败，请重试');
      //           }
      //         } catch (error) {
      //           if (hideLoading) hideLoading();

      //           message.error('图片上传失败，请检查网络连接');
      //         }
      //       }
      //     };
      //   },
      // },
    },
  };

  function handleChange(newValue: string) {
    setValue(newValue);
    props.onChange(newValue);
  }

  return (
    <div
      className={`${styles.editorContainer} ${isFullscreen ? styles.fullscreenContainer : ''}`}
    >
      <ReactQuill
        {...props}
        ref={editorRef}
        value={value}
        onChange={handleChange}
        modules={props.modules || modulesDefault}
        className={isFullscreen ? styles.fullscreenEditor : ''}
      />
    </div>
  );
}

export default QuillEditor;
