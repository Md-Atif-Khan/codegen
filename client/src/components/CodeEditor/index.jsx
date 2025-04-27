import React from 'react';
import Editor from "@monaco-editor/react";
import './style.css';

const CodeEditor = ({ code, onChange, language, editorRef }) => {
  return (
    <div className="code-editor">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        onChange={onChange}
        onMount={(editor) => {
          if (editorRef) {
            editorRef.current = editor;
          }
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
        }}
      />
    </div>
  );
};

export default CodeEditor;
