"use client";

import { useEffect, useState } from "react";
import { useFeatureGuard } from "@/lib/use-feature-guard";
import { useRouter } from "next/navigation";
import { Dumbbell, Search, ChevronLeft, ChevronRight, BookOpen, Hash, Users, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Training {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  difficulty: string;
  tags: string[];
  problemCount: number;
  submissionCount: number;
  participantCount: number;
  createdAt: string;
}

const difficulties = ["全部", "入门", "Easy", "Medium", "Hard"];
const diffColors: Record<string, string> = {
  "入门": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Easy": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Medium": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  "Hard": "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function TrainingPage() {
  useFeatureGuard("trainingEnabled");
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [difficulty, setDifficulty] = useState("全部");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    if (keyword) params.set("keyword", keyword);
    if (difficulty !== "全部") params.set("difficulty", difficulty);

    fetch(`/api/training?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setTrainings(data.trainings || []);
        setTotal(data.total || 0);
      });
  }, [page, keyword, difficulty, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">训练题单</h1>
          <p className="text-muted-foreground text-sm">共 {total} 个题单</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索题单..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(1); }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                difficulty === d
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {trainings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed bg-card/50">
            <Dumbbell className="h-8 w-8 mx-auto mb-3 opacity-40" />
            暂无训练题单
          </div>
        ) : (
          trainings.map((t) => (
            <div
              key={t.id}
              onClick={() => router.push(`/training/${t.id}`)}
              className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-primary/30 cursor-pointer"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium group-hover:text-primary transition-colors">{t.title}</h3>
                  <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", diffColors[t.difficulty] || "")}>
                    {t.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{t.description || "暂无简介"}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {t.problemCount} 题
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {t.participantCount} 人参与
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCheck className="h-3 w-3" />
                    {t.submissionCount} 次提交
                  </span>
                  {t.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
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
