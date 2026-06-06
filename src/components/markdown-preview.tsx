"use client";

import React, { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { markdownToBlocks } from "@blocknote/core";
import { zh } from "@blocknote/core/locales";
import { editorSchema } from "@/lib/blocknote-schema";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [blocks, setBlocks] = useState<any[] | null>(null);

  const editor = useCreateBlockNote({
    schema: editorSchema,
    dictionary: zh,
    initialContent: [{ type: "paragraph" } as any],
    // Disable suggestions menu in read-only preview to avoid init errors
    _tiptapOptions: {
      extensions: [],
    } as any,
  });

  useEffect(() => {
    if (content && editor) {
      (async () => {
        try {
          const parsed = await markdownToBlocks(content, editor.pmSchema);
          setBlocks(parsed as any);
        } catch {
          setBlocks(null);
        }
      })();
    } else {
      setBlocks(null);
    }
  }, [content, editor]);

  useEffect(() => {
    if (blocks && editor) {
      editor.replaceBlocks(editor.document, blocks as any);
    }
  }, [blocks, editor]);

  if (!editor) return null;

  return (
    <div className="bn-preview-wrapper">
      <BlockNoteView
        editor={editor}
        editable={false}
        slashMenu={false}
        className="[&_.bn-editor]:!bg-transparent [&_.bn-editor]:!p-0"
      />
    </div>
  );
}
