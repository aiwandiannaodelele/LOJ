"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlockNoteEditor from "@/components/blocknote-editor";

export default function NewDiscussionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const getProblemId = () => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("problemId");
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || creating) return;
    setCreating(true);
    try {
      const body: Record<string, unknown> = { title, content };
      const problemId = getProblemId();
      if (problemId) body.problemId = parseInt(problemId);

      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/discussions/${data.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 text-center">
        <p className="text-muted-foreground mb-4">请先登录后再发起讨论</p>
        <Button onClick={() => router.push("/login")}>去登录</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">发起讨论</h1>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border/50">
          <input
            type="text"
            placeholder="讨论标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold placeholder:text-muted-foreground/50 outline-none"
          />
        </div>

        <div className="p-5">
          <BlockNoteEditor
            value={content}
            onChange={setContent}
            placeholder="详细描述你的问题或想法..."
          />
        </div>

        <div className="px-5 py-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            支持 Markdown、图片上传与富文本格式
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={creating || !title.trim() || !content.trim()}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Send className="h-4 w-4 mr-1.5" />
              )}
              发布讨论
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
