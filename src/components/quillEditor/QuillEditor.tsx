'use client';

import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface QuillEditorProps {
  style?: React.CSSProperties;
  theme?: string;
  modules?: Record<string, unknown>;
  formats?: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modulesDefault = {
  toolbar: [
    [{ header: [1, 2, false] }],
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
};

function QuillEditor(props: QuillEditorProps) {
  const [value, setValue] = useState(props.value || '');

  function handleChange(newValue: string) {
    setValue(newValue);
    props.onChange(newValue);
  }
  return (
    <ReactQuill
      style={
        props.style || {
          width: 'auto',
          height: '200px',
          overflow: 'hidden',
          borderBottom: '1px solid #ccc',
        }
      }
      modules={props.modules || modulesDefault}
      formats={props.formats}
      theme={props.theme || 'snow'}
      value={value}
      placeholder={props.placeholder || '请输入...'}
      onChange={handleChange}
    />
  );
}

export default QuillEditor;
