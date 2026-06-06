"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("./monaco-editor-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
      <div className="text-muted-foreground text-sm">加载编辑器中...</div>
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  fontSize?: number;
  tabSize?: number;
  onFontSizeChange?: (size: number) => void;
}

export default function CodeEditor({
  value,
  onChange,
  language = "cpp",
  readOnly = false,
  fontSize,
  tabSize,
  onFontSizeChange,
}: CodeEditorProps) {
  return (
    <MonacoEditor
      value={value}
      onChange={onChange}
      language={language}
      readOnly={readOnly}
      fontSize={fontSize}
      tabSize={tabSize}
      onFontSizeChange={onFontSizeChange}
    />
  );
}
