'use client';
import React, { useEffect, useState } from 'react';
import { uploadImgToCloud } from '@/lib/cloudinary';
import { emoji } from './emoji';

import styles from './VditorEditor.module.css';
import 'vditor/dist/index.css';

// 获取 ImagePlus 图标的 SVG 字符串
const getImagePlusSvg = (): string => {
  return `<svg t="1757168120066" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6241" width="64" height="64"><path d="M829 598q-9-9-22.5-9t-22.5 9l-90 90q-9 10-9 22.5t9.5 22 22 9.5 22.5-9l35-35v198q1 12 9.5 21.5t23 10 23-8T838 896V698l39 38q10 10 22.5 10t22-10 9.5-22.5-9-22.5zM410 358q11-27 5.5-55T390 253q-22-22-51.5-27t-56.5 4q-27 13-42.5 38.5T224 323q1 40 27 66t66 27q29 0 54.5-15.5T410 358z m-122-35q0-13 10-22 2-7 8.5-10t13.5-3q13 0 22.5 8.5T352 317t-8 22-21 13q-15 0-25-8.5T288 323zM896 96H128q-27 1-45 19t-19 45v640q1 27 19 45t45 19h544v-64H160q-15-1-23.5-10.5T128 768V192q0-13 8.5-22.5T160 160h704q15 0 23.5 9.5T896 192v416h64V160q-1-27-19-45t-45-19zM182 714q10 9 22.5 9t22.5-9l135-135 115 115h3q19 11 38-3l317-317q10-10 10-22t-10-22-22.5-10-22.5 10L496 624 381 506q-10-8-21-7.5T339 509L179 669q-7 10-6.5 22.5T182 714z" p-id="6242"></path></svg>`;
};

// 清理Markdown格式符号前后的空格
const cleanMarkdownSpaces = (text: string): string => {
  return text
    // 处理加粗：** text **、**text **、** text** → **text**
    .replace(/\*\*(\s*)([^*]+?)(\s*)\*\*/g, '**$2**')
    // 处理斜体：* text *、*text *、* text* → *text*
    .replace(/(?<!\*)\*(\s*)([^*]+?)(\s*)\*(?!\*)/g, '*$2*')
    // 处理行内代码：` text `、`text `、` text` → `text`
    .replace(/`(\s*)([^`]+?)(\s*)`/g, '`$2`')
    // 处理删除线：~~ text ~~、~~text ~~、~~ text~~ → ~~text~~
    .replace(/~~(\s*)([^~]+?)(\s*)~~/g, '~~$2~~');
};

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
            hint: {
              emoji,
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
              'emoji',
              'headings',
              'bold',
              'italic',
              'strike',
              'link',
              {
                name: 'upload',
                icon: getImagePlusSvg(),
                tip: '上传图片',
              },
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
              'table',
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
                console.log('开始上传图片，文件数量', files.length);

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
                    console.log('Cloudinary上传结果', result);

                    if (result && result.secure_url) {
                      const imageUrl = result.secure_url;
                      console.log('图片上传成功，URL', imageUrl);
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
              // 清理Markdown格式符号前后的空格
              const cleanedVal = cleanMarkdownSpaces(val);
           
              if (onChange) {
                onChange(cleanedVal);
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
          console.error('Vditor 初始化失败', error);
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
