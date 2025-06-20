import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { App as AntdApp } from 'antd';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

function QuillEditor(props: any) {
  const [value, setValue] = useState(props.value || '');
  const { message } = AntdApp.useApp();

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
    <ReactQuill
      {...props}
      value={value}
      onChange={handleChange}
      modules={props.modules || modulesDefault}
    />
  );
}

export default QuillEditor;
