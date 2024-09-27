import React from 'react';
import Editor from "@monaco-editor/react";
import { FaCopy } from 'react-icons/fa';

const CodeEditor = ({ code, onChange, language }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="code-editor">
      <div >
        <button onClick={handleCopy} className="absolute top-7 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded text-sm transition duration-300 ease-in-out transform hover:scale-105">
          <FaCopy /> Copy Code
        </button>
      </div>
      <br />
      <br />
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default CodeEditor;
