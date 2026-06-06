"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateBlockNote, useEditorChange } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { markdownToBlocks, blocksToMarkdown } from "@blocknote/core";
import { zh } from "@blocknote/core/locales";
import { editorSchema } from "@/lib/blocknote-schema";
import { Loader2 } from "lucide-react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

interface BlockNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function EditorInner({ value, onChange }: BlockNoteEditorProps) {
  const initializedRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const editor = useCreateBlockNote({
    schema: editorSchema,
    dictionary: zh,
    initialContent: [{ type: "paragraph" } as any],
    uploadFile: async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || "上传失败");
        }
        return data.url;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[ImageUpload] error:", msg);
        throw new Error(msg);
      } finally {
        setUploading(false);
      }
    },
  });

  // Sync markdown → blocks after mount (avoid race with slash menu init)
  useEffect(() => {
    if (!mounted || !value || !editor || initializedRef.current) return;
    initializedRef.current = true;
    (async () => {
      try {
        const blocks = await markdownToBlocks(value, editor.pmSchema);
        editor.replaceBlocks(editor.document, blocks as any);
      } catch (e) {
        console.error("Failed to parse markdown:", e);
      }
    })();
  }, [mounted, value, editor]);

  // onChange via hook (callback first, editor second)
  useEditorChange(async () => {
    try {
      const md = await blocksToMarkdown(
        editor.document as any,
        editor.pmSchema,
        editor as any,
        { document: window.document }
      );
      onChange(md);
    } catch (e) {
      console.error("Failed to convert to markdown:", e);
    }
  }, editor);

  if (!editor) return null;

  return (
    <div className="bn-editor-wrapper relative h-full">
      {mounted ? (
        <BlockNoteView editor={editor} slashMenu />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          编辑器加载中...
        </div>
      )}
      {uploading && (
        <div className="absolute top-2 right-2 flex items-center gap-2 rounded-md bg-background/90 px-3 py-1.5 text-sm shadow-sm border">
          <Loader2 className="h-4 w-4 animate-spin" />
          上传图片中...
        </div>
      )}
    </div>
  );
}

export default function BlockNoteEditorWrapper(props: BlockNoteEditorProps) {
  return <EditorInner {...props} />;
}
