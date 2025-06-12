'use client';

import React, { useState, useRef } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { base64toFile } from './upload';
import { uploadImgToCloud } from '@/utils/cloudinary';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
});

interface QuillEditorProps {
  bounds?: string | HTMLElement;
  children?: React.ReactElement<any>;
  className?: string;
  defaultValue?: string;
  formats?: string[];
  id?: string;
  modules?: any;
  onChange: (val: string) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  onFocus?(selection: Range): void;
  onBlur?(previousSelection: Range): void;
  onKeyDown?: React.EventHandler<any>;
  onKeyPress?: React.EventHandler<any>;
  onKeyUp?: React.EventHandler<any>;
  placeholder?: string;
  preserveWhitespace?: boolean;
  readOnly?: boolean;
  style?: React.CSSProperties;
  tabIndex?: number;
  theme?: string;
  value?: string;
}

function QuillEditor(props: QuillEditorProps) {
  const [value, setValue] = useState(props.value || '');

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
    },
  };

  function handleChange(newValue: string) {
    setValue(newValue);
    props.onChange(newValue);
  }

  const handleEditorChange = async (
    ctx: any,
    delta: any,
    source: any,
    editor: any
  ) => {
    // 获取当前富文本内容
    const quillContent = editor.getContents();
    if (!delta?.ops?.length) return;

    // 收集需要上传的图片
    const imagesToUpload: { index: number; base64: string }[] = [];
    quillContent.ops.forEach((item: any, index: number) => {
      if (item.insert?.image?.startsWith('data:image/')) {
        imagesToUpload.push({ index, base64: item.insert.image });
      }
    });

    // 如果没有需要上传的图片，直接更新内容
    if (!imagesToUpload.length) {
      setValue(ctx);
      props.onChange(ctx);
      return;
    }

    // 批量上传图片
    const uploadPromises = imagesToUpload.map(async ({ index, base64 }) => {
      const file = base64toFile(base64);
      try {
        const result = await uploadImgToCloud(file);
        return { index, filePath: result.secure_url, success: true };
      } catch (error) {
        console.error('Image upload failed:', error);
        return { index, filePath: base64, success: false }; // 保留原 base64 作为回退
      }
    });

    // 等待所有图片上传完成
    const uploadResults = await Promise.allSettled(uploadPromises);

    // 更新 quillContent 中的图片地址
    const updatedOps = [...quillContent.ops];
    uploadResults.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value.success) {
        updatedOps[imagesToUpload[i].index].insert.image =
          result.value.filePath;
      }
    });

    // 获取 HTML 字符串
    const htmlContent = editor.getHTML();

    // 一次性更新内容和表单
    setValue(htmlContent);
    props.onChange(htmlContent);
  };

  return (
    <ReactQuill
      bounds={props.bounds}
      children={props.children}
      defaultValue={props.defaultValue}
      id={props.id}
      formats={props.formats}
      className={props.className}
      modules={props.modules || modulesDefault}
      theme={props.theme || 'snow'}
      value={value}
      placeholder={props.placeholder || '请详细描述活动内容、目标和亮点'}
      onChange={handleChange}
    />
  );
}

export default QuillEditor;
