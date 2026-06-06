"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Swords, Plus, Trash2, Pencil, Loader2, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Contest {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
  hasPassword: boolean;
  isPublic: boolean;
  participantCount: number;
  problemCount: number;
  createdAt: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  upcoming: { label: "未开始", className: "bg-blue-500/15 text-blue-500 border-blue-500/25" },
  running: { label: "进行中", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25" },
  ended: { label: "已结束", className: "bg-muted text-muted-foreground border-border" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminContestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !session.user.isAdmin) {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchContests = () => {
    fetch("/api/admin/contest?pageSize=100")
      .then((r) => r.json())
      .then((data) => {
        setContests(data.contests || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此比赛？将同时删除所有相关题目和提交记录")) return;
    await fetch(`/api/admin/contest?id=${id}`, { method: "DELETE" });
    fetchContests();
  };

  if (status === "loading" || status !== "authenticated") {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">比赛管理</h1>
            <p className="text-muted-foreground text-sm">管理所有比赛，创建、编辑、删除</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            返回管理主页
          </Button>
          <Link href="/admin/contest/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> 新建比赛
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead className="w-20">赛制</TableHead>
              <TableHead className="w-20">状态</TableHead>
              <TableHead className="w-40">时间</TableHead>
              <TableHead className="w-20">题目</TableHead>
              <TableHead className="w-20">参赛</TableHead>
              <TableHead className="w-28">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : contests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  暂无比赛，点击右上角新建
                </TableCell>
              </TableRow>
            ) : (
              contests.map((c) => {
                const st = statusMap[c.status] || { label: c.status, className: "" };
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {c.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {c.title}
                        {c.hasPassword && (
                          <span className="text-[10px] text-yellow-500 border border-yellow-500/25 rounded px-1.5 py-0.5">
                            加密
                          </span>
                        )}
                        {!c.isPublic && (
                          <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                            隐藏
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">{c.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${st.className}`}>
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>{formatDate(c.startTime)}</div>
                        <div>至 {formatDate(c.endTime)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.problemCount} 题
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.participantCount} 人
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/contest/${c.id}`} target="_blank">
                          <Button variant="ghost" size="sm" title="查看">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/contest/${c.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(c.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
