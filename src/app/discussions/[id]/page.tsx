"use client";
import { useFeatureGuard } from "@/lib/use-feature-guard";


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Pin,
  Megaphone,
  Clock,
  MessageCircle,
  Send,
  Trash2,
  Loader2,
  Reply,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarkdownPreview from "@/components/markdown-preview";
import BlockNoteEditor from "@/components/blocknote-editor";

interface Reply {
  id: number;
  content: string;
  createdAt: string;
  user: { id: number; name: string };
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  createdAt: string;
  user: { id: number; name: string };
  problem: { id: number; title: string } | null;
  replies: Reply[];
  _count: { replies: number };
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : size === "md"
      ? "h-10 w-10 text-sm"
      : "h-8 w-8 text-xs";
  return (
    <div
      className={`${sizeClass} shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function PostMeta({
  user,
  createdAt,
  isPinned,
  isAnnouncement,
}: {
  user: { name: string };
  createdAt: string;
  isPinned?: boolean;
  isAnnouncement?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap text-sm">
      <span className="font-medium text-foreground">{user.name}</span>
      {(isPinned || isAnnouncement) && (
        <div className="flex items-center gap-1">
          {isPinned && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 border-amber-500/30 text-amber-600 bg-amber-500/10"
            >
              <Pin className="h-3 w-3 mr-0.5" />
              置顶
            </Badge>
          )}
          {isAnnouncement && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
            >
              <Megaphone className="h-3 w-3 mr-0.5" />
              公告
            </Badge>
          )}
        </div>
      )}
      <span className="text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {new Date(createdAt).toLocaleString()}
      </span>
    </div>
  );
}

export default function DiscussionDetailPage() {
  useFeatureGuard("discussionEnabled");
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/discussions/${params.id}`)
      .then((r) => r.json())
      .then(setDiscussion);
  }, [params.id]);

  const handleReply = async () => {
    if (!replyContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${params.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });
      if (res.ok) {
        setReplyContent("");
        const updated = await fetch(`/api/discussions/${params.id}`).then((r) =>
          r.json()
        );
        setDiscussion(updated);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定删除此讨论？")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/discussions/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/discussions");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!discussion) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        加载中...
      </div>
    );
  }

  const isOwner = session?.user?.id === String(discussion.user.id);
  const isAdmin = session?.user?.isAdmin;
  const canDelete = isOwner || isAdmin;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-4">
      {/* Back */}
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => router.push("/discussions")}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <h1 className="text-sm font-medium text-muted-foreground">讨论</h1>
      </div>

      {/* Main Post */}
      <div className="flex gap-4">
        {/* Left: Author */}
        <div className="w-40 shrink-0 hidden sm:flex flex-col items-center pt-3">
          <Avatar name={discussion.user.name} size="lg" />
          <div className="mt-2 text-sm font-medium text-center">
            {discussion.user.name}
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="p-5">
              {/* Mobile author row */}
              <div className="sm:hidden flex items-center gap-3 mb-3">
                <Avatar name={discussion.user.name} size="md" />
                <PostMeta
                  user={discussion.user}
                  createdAt={discussion.createdAt}
                  isPinned={discussion.isPinned}
                  isAnnouncement={discussion.isAnnouncement}
                />
              </div>

              {/* Desktop meta */}
              <div className="hidden sm:flex items-center justify-between mb-3">
                <PostMeta
                  user={discussion.user}
                  createdAt={discussion.createdAt}
                  isPinned={discussion.isPinned}
                  isAnnouncement={discussion.isAnnouncement}
                />
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <h1 className="text-xl font-bold mb-4">{discussion.title}</h1>

              {discussion.problem && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/problems/${discussion.problem!.id}`)
                    }
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    #{discussion.problem.id} {discussion.problem.title}
                  </button>
                </div>
              )}

              <MarkdownPreview content={discussion.content} />
            </div>

            {/* Post actions */}
            <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3.5 w-3.5" />
                {discussion._count.replies} 回复
              </div>
              <div className="sm:hidden">
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-sm font-medium px-1">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          {discussion._count.replies} 条回复
        </div>

        {discussion.replies.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground rounded-xl border border-dashed text-sm bg-card/50">
            <Reply className="h-6 w-6 mx-auto mb-2 opacity-40" />
            暂无回复，来发表第一条回复吧
          </div>
        ) : (
          discussion.replies.map((reply) => (
            <div key={reply.id} className="flex gap-4">
              {/* Left: Author */}
              <div className="w-40 shrink-0 hidden sm:flex flex-col items-center pt-3">
                <Avatar name={reply.user.name} size="lg" />
                <div className="mt-2 text-sm font-medium text-center">
                  {reply.user.name}
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  <div className="p-5">
                    {/* Mobile author row */}
                    <div className="sm:hidden flex items-center gap-2 mb-3">
                      <Avatar name={reply.user.name} size="sm" />
                      <span className="text-sm font-medium">{reply.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Desktop meta */}
                    <div className="hidden sm:flex items-center gap-2 mb-3 text-sm">
                      <span className="font-medium">{reply.user.name}</span>
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <MarkdownPreview content={reply.content} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Editor */}
      {session ? (
        <div className="flex gap-4 pt-2">
          <div className="w-40 shrink-0 hidden sm:flex flex-col items-center pt-3">
            <Avatar name={session.user?.name || "?"} size="lg" />
            <div className="mt-2 text-sm font-medium text-center">
              {session.user?.name || "我"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="text-sm font-medium">发表回复</div>
                <BlockNoteEditor
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder="写下你的回复..."
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleReply}
                    disabled={submitting || !replyContent.trim()}
                    size="sm"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <Send className="h-4 w-4 mr-1.5" />
                    )}
                    回复
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-muted-foreground rounded-xl border border-dashed bg-card/50">
          <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
            登录后参与讨论
          </Button>
        </div>
      )}
    </div>
  );
}
