"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send, Loader2, ChevronLeft, ChevronRight, Clock, User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  AC: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  WA: "bg-red-500/10 text-red-500 border-red-500/25",
  CE: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  RE: "bg-orange-500/10 text-orange-500 border-orange-500/25",
  TLE: "bg-violet-500/10 text-violet-500 border-violet-500/25",
  MLE: "bg-blue-500/10 text-blue-500 border-blue-500/25",
  Pending: "bg-muted text-muted-foreground",
};
const fallbackColor = "bg-muted text-muted-foreground";

interface SubmissionItem {
  id: number;
  status: string;
  language: string;
  time: number | null;
  memory: number | null;
  createdAt: string;
  problem: { id: number; title: string };
  user?: { id: number; name: string };
}

const PAGE_SIZE = 20;

export default function MySubmissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [scope, setScope] = useState<"mine" | "all">("mine");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const isAdmin = session?.user?.isAdmin;

  const fetchSubmissions = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: PAGE_SIZE.toString(),
    });
    if (scope === "mine" && session) {
      params.set("userId", session.user.id);
    }
    fetch(`/api/submissions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "authenticated") fetchSubmissions();
  }, [status, page, scope]);

  if (status === "loading" || status !== "authenticated") {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {scope === "all" ? "全部提交" : "我的提交"}
            </h1>
            <p className="text-muted-foreground text-sm">共 {total} 条提交记录</p>
          </div>
        </div>
        {isAdmin && (
          <Select value={scope} onValueChange={(v) => { setScope(v as "mine" | "all"); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mine">我的提交</SelectItem>
              <SelectItem value="all">全部提交</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Card className="border-border/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">暂无提交记录</div>
        ) : (
          <div className="divide-y">
            {submissions.map((sub) => (
              <Link
                key={sub.id}
                href={`/submissions/${sub.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-accent/20 transition-colors"
              >
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 shrink-0", statusColors[sub.status] || fallbackColor)}>
                  {sub.status}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{sub.problem.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                    <span>{sub.language}</span>
                    {sub.time !== null && <span>{sub.time}ms</span>}
                    {sub.memory !== null && <span>{(sub.memory / 1024).toFixed(1)}MB</span>}
                    {scope === "all" && sub.user && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {sub.user.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 hidden sm:flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(sub.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">第 {page} / {totalPages} 页</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
