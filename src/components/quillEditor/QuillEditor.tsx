"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { App as AntdApp, } from 'antd'
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './QuillEditor.module.css';
import type { DeltaStatic } from 'react-quill-new';
import type ReactQuillType from 'react-quill-new';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }); // 直接引入ReactQuill在SSR情况下会报错
type ReactQuillProps = React.ComponentProps<typeof ReactQuillType>;
type DeltaOperation = {
  insert?: string | { [key: string]: any };
  delete?: number;
  retain?: number | Record<string, any>;
  attributes?: Record<string, any>;
};

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

function QuillEditor(props: ReactQuillProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { message } = AntdApp.useApp();
  const quillRef = useRef<any>(null);

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

  // 监听粘贴事件并处理图片
  // const handlePaste = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
  //   // 检查剪贴板中是否有图片文件
  //   const items = event.clipboardData.items;
  //   for (let i = 0; i < items.length; i++) {
  //     if (items[i].type.indexOf('image') !== -1) {
  //       event.preventDefault(); // 阻止默认的粘贴行为
  //       const file = items[i].getAsFile();
  //       if (file) {
  //         let hideLoading: any;
  //         try {
  //           if (!quillRef.current) {
  //             console.error("Quill editor instance is not available during paste.");
  //             return;
  //           }
  //           const { uploadImgToCloud } = await import('@/lib/cloudinary');
  //           hideLoading = message.loading('图片上传中...', 0);
  //           const result = await uploadImgToCloud(file);
  //           // const result: any = {}
  //           // result.secure_url = 'http://res.cloudinary.com/gmonad/image/upload/v1750928186/monad_img/rzrpgz11sasfrcfmpaug.avif'
  //           if (result && result.secure_url) {
  //             const quill = quillRef.current?.getEditor();
  //             const range = quill.getSelection();
  //             quill.insertEmbed(range.index, 'image', result.secure_url);
  //             quill.setSelection(range.index + 1);
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
  //       return
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   if (quillRef.current) {
  //     const quill = quillRef.current.getEditor();
  //     // 监听 Quill 的文本变化事件
  //     quill.on('text-change', (delta: DeltaStatic, oldDelta: DeltaStatic, source: 'user' | 'api') => {
  //       // if (source === 'user') {
  //       //   // 检查是否插入了 data:image 格式的图片
  //       //   const ops = delta.ops || [];
  //       //   ops.forEach((op: DeltaOperation, index: number) => {
  //       //     console.log('op', op)
  //       //     if (op.insert && typeof op.insert === 'object' && op.insert.image) {
  //       //       const imageUrl = op.insert.image;
  //       //       if (imageUrl.startsWith('data:image')) {
  //       //         // 删除这个 data:image 图片
  //       //         const currentContents = quill.getContents();
  //       //         let position = 0;
  //       //         for (let i = 0; i < index; i++) {
  //       //           if (typeof currentContents.ops[i].insert === 'string') {
  //       //             position += currentContents.ops[i].insert.length;
  //       //           } else {
  //       //             position += 1;
  //       //           }
  //       //         }
  //       //         quill.deleteText(position, 1);
  //       //         console.log('delete')
  //       //       }
  //       //     }
  //       //   });
  //       // }
  //       if (source === 'user') {
  //         const ops = delta.ops || [];
  //         let hasBase64Image = false;
  //         let imageIndex = -1;

  //         ops.forEach((op: DeltaOperation, index: number) => {
  //           if (
  //             typeof op.insert === 'object' &&
  //             op.insert !== null &&
  //             'image' in op.insert &&
  //             typeof op.insert.image === 'string' &&
  //             op.insert.image.startsWith('data:image')
  //           ) {
  //             hasBase64Image = true;
  //             imageIndex = index;
  //           }
  //         });

  //         if (hasBase64Image) {
  //           // 找到并删除 base64 图片
  //           const contents = quill.getContents();
  //           const newOps = contents.ops?.filter((op: any) => {
  //             return !(op.insert && op.insert.image && op.insert.image.startsWith('data:image'));
  //           });

  //           if (newOps) {
  //             quill.setContents({ ops: newOps });
  //           }
  //         }
  //       }
  //     });
  //   }
  // }, []);
  // onPaste={handlePaste}

  return (
    <div 
      className={`${styles.editorContainer} ${isFullscreen ? styles.fullscreenContainer : ''}`}
    >
      <ReactQuill
        placeholder="请输入..."
        {...props}
        modules={props.modules || modulesDefault}
        className={isFullscreen ? styles.fullscreenEditor : ''}
      />
    </div>
  );
}

export default QuillEditor;
