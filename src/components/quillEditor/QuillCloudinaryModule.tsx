'use client';
import { uploadImgToCloud } from '@/lib/cloudinary';

// Quill Cloudinary 图片上传模块
export class QuillCloudinaryModule {
  quill: any;
  options: any;
  onError: (error: string) => void;

  constructor(quill: any, options: any = {}) {
    this.quill = quill;
    this.options = options;
    this.onError = options.onError || ((error: string) => console.error(error));
    
    // 绑定工具栏图片按钮
    this.bindToolbarImageButton();
    
    // 绑定粘贴事件
    this.bindPasteHandler();
  }

  // 绑定工具栏图片按钮
  bindToolbarImageButton() {
    const toolbar = this.quill.getModule('toolbar');
    if (toolbar) {
      // 重写图片按钮处理器
      toolbar.addHandler('image', () => {
        this.selectLocalImage();
      });
    }
  }

  // 绑定粘贴事件处理器
  bindPasteHandler() {
    this.quill.root.addEventListener('paste', (event: ClipboardEvent) => {
      this.handlePaste(event);
    });
  }

  // 选择本地图片
  selectLocalImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      await this.uploadAndInsertImage(file);
    };

    input.click();
  }

  // 处理粘贴事件
  async handlePaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const items = Array.from(clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));

    if (imageItem) {
      // 阻止默认粘贴行为
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      const file = imageItem.getAsFile();
      if (file) {
        // 立即执行上传
        await this.uploadAndInsertImage(file);
        
        // 上传完成后检查并清理可能的残留内容
        setTimeout(() => {
          const range = this.quill.getSelection();
          if (range) {
            // 检查光标后面是否有多余的字符
            const nextChar = this.quill.getText(range.index, 1);
            if (nextChar === '.' || nextChar === '…' || nextChar === ' ') {
              this.quill.deleteText(range.index, 1);
            }
          }
        }, 100);
      }
    }
  }

  // 上传并插入图片
  async uploadAndInsertImage(file: File) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      this.onError('只能上传图片文件!');
      return;
    }

    // 验证文件大小
    if (file.size / 1024 / 1024 > 5) {
      this.onError('图片大小不能超过 5MB!');
      return;
    }

    try {
      // 显示上传中的占位符
      const range = this.quill.getSelection(true) || { index: this.quill.getLength() };
      const placeholderText = '上传中...';
      this.quill.insertText(range.index, placeholderText, 'user');
      this.quill.setSelection(range.index + placeholderText.length);

      // 上传到Cloudinary
      const result = await uploadImgToCloud(file);

      if (result && result.secure_url) {
        // 删除占位符
        this.quill.deleteText(range.index, placeholderText.length);
        
        // 插入图片
        this.quill.insertEmbed(range.index, 'image', result.secure_url, 'user');
        this.quill.setSelection(range.index + 1);
      } else {
        // 删除占位符并显示错误
        this.quill.deleteText(range.index, placeholderText.length);
        this.quill.insertText(range.index, '上传失败', 'user');
        this.onError('图片上传失败，请重试');
      }
    } catch (error) {
      // 删除占位符并显示错误
      const range = this.quill.getSelection() || { index: this.quill.getLength() };
      const placeholderText = '上传中...';
      this.quill.deleteText(Math.max(0, range.index - placeholderText.length), placeholderText.length);
      this.quill.insertText(range.index - placeholderText.length, '上传失败', 'user');
      
      this.onError('图片上传失败，请检查网络连接');
    }
  }
}

// 模块将通过 QuillEditor 动态注册，避免循环引用
// 注意：此模块需要通过动态导入方式使用，以避免与主编辑器组件的循环依赖