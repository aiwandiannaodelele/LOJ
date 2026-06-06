"use client";

import { useEffect, useState } from "react";
import { useFeatureGuard } from "@/lib/use-feature-guard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Pin,
  Megaphone,
  Clock,
  MessageCircle,
  ArrowUpDown,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import BlockNoteEditor from "@/components/blocknote-editor";
import { Loader2, Send } from "lucide-react";

interface Discussion {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  createdAt: string;
  user: { id: number; name: string };
  problem: { id: number; title: string } | null;
  _count: { replies: number };
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const sortLabels: Record<string, string> = {
  newest: "最新发布",
  oldest: "最早发布",
  pinned: "置顶优先",
};

export default function DiscussionsPage() {
  useFeatureGuard("discussionEnabled");
  const router = useRouter();
  const { data: session } = useSession();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(() => {
    if (typeof window === "undefined") return "newest";
    return new URLSearchParams(window.location.search).get("sort") || "newest";
  });
  const [keyword, setKeyword] = useState("");
  const [problemId, setProblemId] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("problemId") || "";
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    params.set("sort", sort);
    if (problemId) params.set("problemId", problemId);

    fetch(`/api/discussions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setDiscussions(data.discussions || []);
        setTotal(data.total || 0);
      });
  }, [page, sort, problemId]);

  const totalPages = Math.ceil(total / pageSize);

  const filtered = discussions.filter((d) =>
    d.title.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">讨论</h1>
            <p className="text-muted-foreground text-sm">共 {total} 个话题</p>
          </div>
        </div>
        <Button size="sm" disabled={!session} onClick={() => setDialogOpen(true)}>
          <MessageCircle className="h-4 w-4 mr-1.5" />
          发起讨论
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-7xl h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>发起讨论</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col flex-1 min-h-0 pt-2">
              <input
                type="text"
                placeholder="讨论标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-lg font-semibold placeholder:text-muted-foreground/50 outline-none border-b border-border/50 pb-2 shrink-0"
              />
              <div className="flex-1 min-h-0 mt-4">
                <BlockNoteEditor
                  value={content}
                  onChange={setContent}
                  placeholder="详细描述你的问题或想法..."
                />
              </div>
              <div className="flex items-center justify-between pt-3 shrink-0">
                <span className="text-xs text-muted-foreground">
                  支持 Markdown、图片上传与富文本格式
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!title.trim() || !content.trim() || creating) return;
                      setCreating(true);
                      try {
                        const body: Record<string, unknown> = { title, content };
                        const pid = new URLSearchParams(window.location.search).get("problemId");
                        if (pid) body.problemId = parseInt(pid);
                        const res = await fetch("/api/discussions", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(body),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setDialogOpen(false);
                          setTitle("");
                          setContent("");
                          router.push(`/discussions/${data.id}`);
                        }
                      } finally {
                        setCreating(false);
                      }
                    }}
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索话题..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v ?? "newest");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{sortLabels[sort] ?? sort}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新发布</SelectItem>
              <SelectItem value="oldest">最早发布</SelectItem>
              <SelectItem value="pinned">置顶优先</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed bg-card/50">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
            暂无讨论话题
          </div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id}
              className={`group flex items-start gap-4 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-primary/30 ${
                d.isPinned ? "bg-primary/[0.02]" : ""
              }`}
            >
              {/* Avatar */}
              <Avatar name={d.user.name} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/discussions/${d.id}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {d.title}
                  </Link>
                  {d.isPinned && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 px-1.5 border-amber-500/30 text-amber-600 bg-amber-500/10"
                    >
                      <Pin className="h-3 w-3 mr-0.5" />
                      置顶
                    </Badge>
                  )}
                  {d.isAnnouncement && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                    >
                      <Megaphone className="h-3 w-3 mr-0.5" />
                      公告
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                  <span>{d.user.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(d.createdAt).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {d._count.replies} 回复
                  </span>
                  {d.problem && (
                    <Link
                      href={`/problems/${d.problem.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Hash className="h-3 w-3" />
                      {d.problem.id} {d.problem.title}
                    </Link>
                  )}
                </div>
              </div>

              {/* Replies count badge */}
              <div className="hidden sm:flex flex-col items-center justify-center shrink-0 min-w-[3rem]">
                <span className="text-lg font-semibold leading-none">
                  {d._count.replies}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">回复</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
