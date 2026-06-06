"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  MessageSquare,
  Plus,
  Pin,
  Megaphone,
  Clock,
  MessageCircle,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import MarkdownPreview from "@/components/markdown-preview";
import BlockNoteEditor from "@/components/blocknote-editor";

interface Discussion {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  createdAt: string;
  user: { id: number; name: string };
  _count: { replies: number };
}

interface Problem {
  id: number;
  title: string;
}

export default function ProblemDiscussionsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const problemId = parseInt(params.id as string);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/problems/${problemId}`).then((r) => r.json()),
      fetch(`/api/discussions?problemId=${problemId}&sort=newest&pageSize=100`).then((r) =>
        r.json()
      ),
    ]).then(([p, d]) => {
      setProblem(p);
      setDiscussions(d.discussions || []);
      setLoading(false);
    });
  }, [problemId]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, title: newTitle, content: newContent }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        setDialogOpen(false);
        const updated = await fetch(
          `/api/discussions?problemId=${problemId}&sort=newest&pageSize=100`
        ).then((r) => r.json());
        setDiscussions(updated.discussions || []);
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => router.push(`/problems/${problemId}`)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            返回题目
          </button>
          <h1 className="text-2xl font-bold tracking-tight">
            {problem?.title} 的讨论
          </h1>
        </div>
        {session && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button onClick={(e) => e.stopPropagation()}>
                <Plus className="h-4 w-4 mr-1.5" />
                发起讨论
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>发起讨论</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col flex-1 min-h-0 space-y-4">
                <Input
                  placeholder="标题"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="shrink-0"
                />
                <div className="flex-1 min-h-0">
                  <BlockNoteEditor
                    value={newContent}
                    onChange={setNewContent}
                    placeholder="写下你的问题或想法..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreate} disabled={creating || !newTitle.trim() || !newContent.trim()}>
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <Send className="h-4 w-4 mr-1.5" />
                    )}
                    发布
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {discussions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
            暂无讨论，来发起第一个话题吧
          </div>
        ) : (
          discussions.map((d) => (
            <Card
              key={d.id}
              className={`border-border/50 transition-colors hover:border-primary/30 cursor-pointer ${d.isPinned ? "bg-primary/[0.02]" : ""}`}
              onClick={() => router.push(`/discussions/${d.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {d.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium hover:text-primary transition-colors">
                        {d.title}
                      </span>
                      {d.isPinned && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-amber-500/30 text-amber-600 bg-amber-500/10">
                          <Pin className="h-3 w-3 mr-0.5" />
                          置顶
                        </Badge>
                      )}
                      {d.isAnnouncement && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                          <Megaphone className="h-3 w-3 mr-0.5" />
                          公告
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>{d.user.name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(d.createdAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {d._count.replies} 回复
                      </span>
                    </div>
                    <div className="mt-2 line-clamp-2">
                      <MarkdownPreview content={d.content} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
