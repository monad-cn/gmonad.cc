'use client';
import React, { useEffect, useState } from 'react';
import { uploadImgToCloud } from '@/lib/cloudinary';

import styles from './VditorEditor.module.css';
import 'vditor/dist/index.css';

interface VditorEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: number;
  width?: number;
  mode?: 'wysiwyg' | 'ir' | 'sv';
  placeholder?: string;
  lang?: 'en_US' | 'zh_CN';
  disabled?: boolean;
  onFocus?: (value: string) => void;
  onBlur?: (value: string) => void;
}

const VditorEditor = React.forwardRef<any, VditorEditorProps>(
  (
    {
      value = '',
      onChange,
      height = 400,
      width,
      mode = 'wysiwyg',
      placeholder = '请输入内容...',
      disabled = false,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    const [vd, setVd] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      // 确保只在客户端环境下初始化
      if (typeof window === 'undefined' || !mounted) return;

      const initVditor = async () => {
        try {
          // 动态导入 Vditor 及其依赖
          const { default: Vditor } = await import('vditor');

          const vditor = new Vditor('vditor', {
            height,
            width,
            mode,
            placeholder,
            lang: 'zh_CN',
            cache: {
              enable: false, // 禁用缓存避免冲突
            },
            preview: {
              delay: 500,
              mode: 'both',
              maxWidth: 800,
              math: {
                engine: 'MathJax',
                inlineDigit: true,
                macros: {},
              },
            },
            toolbar: [
              'headings',
              'bold',
              'italic',
              'strike',
              'link',
              '|',
              'list',
              'ordered-list',
              'check',
              'indent',
              'outdent',
              '|',
              'quote',
              'line',
              'code',
              'inline-code',
              '|',
              'upload',
              'table',
              '|',
              'undo',
              'redo',
              '|',
              'fullscreen',
              'edit-mode',
              {
                name: 'more',
                toolbar: [
                  'both',
                  'code-theme',
                  'content-theme',
                  'export',
                  'outline',
                  'preview',
                  'devtools',
                  'info',
                  'help',
                ],
              },
            ],
            counter: {
              enable: true,
              type: 'markdown',
            },
            resize: {
              enable: true,
              position: 'bottom',
            },
            upload: {
              accept: 'image/*',
              max: 5 * 1024 * 1024, // 5MB
              handler: async (files: File[]) => {
                console.log('开始上传图片，文件数量:', files.length);

                try {
                  const uploadPromises = files.map(async (file, index) => {
                    console.log(
                      `上传第${index + 1}个文件:`,
                      file.name,
                      file.type,
                      file.size
                    );

                    // 验证文件类型
                    if (!file.type.startsWith('image/')) {
                      throw new Error('只能上传图片文件!');
                    }

                    // 验证文件大小 (5MB)
                    if (file.size / 1024 / 1024 > 5) {
                      throw new Error('图片大小不能超过 5MB!');
                    }

                    // 上传到 Cloudinary
                    console.log('正在上传到 Cloudinary...');
                    const result = await uploadImgToCloud(file);
                    console.log('Cloudinary上传结果:', result);

                    if (result && result.secure_url) {
                      const imageUrl = result.secure_url;
                      console.log('图片上传成功，URL:', imageUrl);
                      return imageUrl;
                    } else {
                      throw new Error('图片上传失败：未获取到URL');
                    }
                  });

                  const imageUrls = await Promise.all(uploadPromises);

                  // 手动插入图片到编辑器
                  imageUrls.forEach((url) => {
                    const markdown = `![image](${url})\n`;
                    vditor.insertValue(markdown);
                  });

                  console.log('所有图片已插入编辑器');
                  return null; // 返回null表示我们已手动处理
                } catch (error) {
                  const errorMsg = `图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`;
                  console.error(errorMsg);
                  setError(errorMsg);
                  throw new Error(errorMsg);
                }
              },
            },
            after: () => {
              console.log('Vditor初始化完成');
              console.log(vditor);
              console.log(value);

              if (value) {
                vditor.setValue(value);
              }
              setVd(vditor);
              setIsLoading(false);

              if (disabled) {
                vditor.disabled();
              }
            },
            input: (val: string) => {
              if (onChange) {
                onChange(val);
              }
            },
            focus: (val: string) => {
              if (onFocus) {
                onFocus(val);
              }
            },
            blur: (val: string) => {
              if (onBlur) {
                onBlur(val);
              }
            },
          });
        } catch (error) {
          console.error('Vditor 初始化失败:', error);
          setError('编辑器加载失败，请刷新页面重试');
          setIsLoading(false);
        }
      };

      initVditor();

      // Clear the effect
      return () => {
        vd?.destroy();
        setVd(undefined);
      };
    }, [mounted]);

    // 更新值
    useEffect(() => {
      if (vd && value !== vd.getValue()) {
        vd.setValue(value || '');
      }
    }, [value, vd]);

    // 更新禁用状态
    useEffect(() => {
      if (vd) {
        if (disabled) {
          vd.disabled();
        } else {
          vd.enable();
        }
      }
    }, [disabled, vd]);

    // 暴露实例方法给父组件
    React.useImperativeHandle(ref, () => ({
      getValue: () => vd?.getValue() || '',
      setValue: (val: string) => vd?.setValue(val),
      insertValue: (val: string) => vd?.insertValue(val),
      focus: () => vd?.focus(),
      blur: () => vd?.blur(),
      disabled: () => vd?.disabled(),
      enable: () => vd?.enable(),
      getHTML: () => vd?.getHTML() || '',
      destroy: () => vd?.destroy(),
    }));

    if (error) {
      return <div className={styles.error}>{error}</div>;
    }

    return (
      <div className={styles.container}>
        <div
          id="vditor"
          style={{ opacity: isLoading ? 0 : 1 }}
          className={`vditor ${styles.editor}`}
        />
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.loadingContent}>
              正在加载 Markdown 编辑器...
            </div>
          </div>
        )}
      </div>
    );
  }
);

VditorEditor.displayName = 'VditorEditor';

export default VditorEditor;
