"use client";

import { useEffect, useState } from "react";
import { useFeatureGuard } from "@/lib/use-feature-guard";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Medal, Search, ChevronLeft, ChevronRight, Trophy, Clock, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RankUser {
  id: number;
  name: string;
  acCount: number;
  totalSubs: number;
  acRate: number;
  score: number;
  lastActive: string;
}

const tabs = [
  { value: "all", label: "总排名" },
  { value: "today", label: "今日刷题榜" },
  { value: "week", label: "本周活跃榜" },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-amber-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm text-muted-foreground w-5 text-center">{rank}</span>;
}

export default function RankPage() {
  useFeatureGuard("rankEnabled");
  const { data: session } = useSession();
  const [users, setUsers] = useState<RankUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [tab, setTab] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    params.set("tab", tab);
    if (keyword) params.set("keyword", keyword);

    fetch(`/api/rank?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, tab, keyword, pageSize]);

  const totalPages = Math.ceil(total / pageSize);
  const myId = session?.user?.id;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Medal className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">排行榜</h1>
          <p className="text-muted-foreground text-sm">共 {total} 名用户</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTab(t.value); setPage(1); }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                tab === t.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户名..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-16">排名</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">用户</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">通过题数</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">AC 率</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">积分</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">最近活跃</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-5 bg-muted rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  暂无数据
                </td>
              </tr>
            ) : (
              users.map((u, idx) => {
                const rank = (page - 1) * pageSize + idx + 1;
                const isMe = myId && String(u.id) === String(myId);
                return (
                  <tr
                    key={u.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/30",
                      isMe && "bg-primary/[0.04]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <RankBadge rank={rank} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/profile/${u.id}`} className="font-medium hover:text-primary transition-colors">
                        {u.name}
                      </Link>
                      {isMe && <span className="ml-2 text-[10px] text-primary border border-primary/30 rounded px-1">我</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{u.acCount}</td>
                    <td className="px-4 py-3 text-right font-mono">{u.acRate}%</td>
                    <td className="px-4 py-3 text-right font-mono">{u.score}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {new Date(u.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </p>
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
