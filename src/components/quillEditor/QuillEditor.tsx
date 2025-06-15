'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

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
