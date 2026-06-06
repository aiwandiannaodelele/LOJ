"use client";
import { useFeatureGuard } from "@/lib/use-feature-guard";


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Dumbbell, ArrowLeft,
  List, Trophy, BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrainingDetail {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  difficulty: string;
  tags: string[];
  problems: {
    id: number;
    title: string;
    order: number;
    difficulty: string;
    description: string;
    inputDesc: string;
    outputDesc: string;
    sampleInput: string;
    sampleOutput: string;
    timeLimit: number;
    memoryLimit: number;
  }[];
}

interface SubmissionInfo {
  status: string;
  attempts: number;
  runTime: number;
}

interface UserStat {
  userId: number;
  userName: string;
  solved: number;
  totalProblems: number;
  totalAttempts: number;
  progress: number;
  lastSubmit: string | null;
  totalRunTime: number;
  submissionInfo: Record<string, SubmissionInfo>;
}

interface ProblemInfo {
  id: number;
  order: number;
  title: string;
}

interface ProblemStat {
  problemId: number;
  title: string;
  order: number;
  totalSubmissions: number;
  acCount: number;
  acRate: number;
}

const diffColors: Record<string, string> = {
  Easy: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
  Medium: "bg-yellow-500/15 text-yellow-500 border-yellow-500/25",
  Hard: "bg-red-500/15 text-red-500 border-red-500/25",
};

const tabItems = [
  { key: "problems", label: "题目", icon: List },
  { key: "stats", label: "通过统计", icon: BarChart3 },
  { key: "rank", label: "排行榜", icon: Trophy },
];

const JUDGE_STATUS: Record<string, { short: string; rgb: string }> = {
  AC: { short: "AC", rgb: "#10b981" },
  PAC: { short: "PAC", rgb: "#f59e0b" },
  WA: { short: "WA", rgb: "#ef4444" },
  CE: { short: "CE", rgb: "#6b7280" },
  RE: { short: "RE", rgb: "#8b5cf6" },
  TLE: { short: "TLE", rgb: "#f97316" },
  MLE: { short: "MLE", rgb: "#ec4899" },
};

export default function TrainingDetailPage() {
  useFeatureGuard("trainingEnabled");
  const params = useParams();
  const router = useRouter();
  const [training, setTraining] = useState<TrainingDetail | null>(null);
  const [activeTab, setActiveTab] = useState("problems");
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [problemStats, setProblemStats] = useState<ProblemStat[]>([]);
  const [problems, setProblems] = useState<ProblemInfo[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/training/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push("/training");
        else setTraining(data);
      });
  }, [params.id, router]);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) setCurrentUserId(parseInt(data.user.id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!training) return;
    if ((activeTab === "stats" || activeTab === "rank") && userStats.length === 0) {
      setLoadingStats(true);
      fetch(`/api/training/${params.id}/stats`)
        .then((r) => r.json())
        .then((data) => {
          setUserStats(data.stats || []);
          setProblemStats(data.problemStats || []);
          setProblems(data.problems || []);
        })
        .finally(() => setLoadingStats(false));
    }
  }, [activeTab, training, params.id]);

  if (!training) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 text-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/training")}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          title="返回"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{training.title}</h1>
          <p className="text-muted-foreground text-sm">
            共 {training.problems.length} 题 · {training.difficulty}
          </p>
        </div>
      </div>

      {/* Description */}
      {training.description && (
        <div className="rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground">
          {training.description}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 w-fit">
        {tabItems.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                activeTab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Problems Tab */}
      {activeTab === "problems" && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-16">序号</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">题目</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-24">难度</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-32">时限 / 内存</th>
              </tr>
            </thead>
            <tbody>
              {training.problems.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => router.push(`/training/${training.id}/problem/${p.id}`)}
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">{p.order + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium hover:text-primary transition-colors">{p.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-xs", diffColors[p.difficulty] || "")}>
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.timeLimit}ms / {p.memoryLimit}MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="space-y-5">
          {/* Problem AC Rate */}
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">题目 AC 率</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-16">序号</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">题目</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground w-24">提交</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground w-24">通过</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-24">AC 率</th>
                </tr>
              </thead>
              <tbody>
                {loadingStats ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">加载中...</td></tr>
                ) : problemStats.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>
                ) : (
                  problemStats.map((p) => (
                    <tr key={p.problemId} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{p.order + 1}</td>
                      <td className="px-4 py-3">{p.title}</td>
                      <td className="px-4 py-3 text-center">{p.totalSubmissions}</td>
                      <td className="px-4 py-3 text-center text-emerald-600">{p.acCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${p.acRate}%` }}
                            />
                          </div>
                          <span className="text-xs w-8 text-right">{p.acRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rank Tab - HOJ Style Matrix */}
      {activeTab === "rank" && (
        <div className="rounded-xl border border-border/50 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-center px-2 py-2.5 font-medium text-muted-foreground w-12 sticky left-0 bg-muted/30 z-10">#</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground min-w-[120px] sticky left-12 bg-muted/30 z-10">用户</th>
                <th className="text-center px-2 py-2.5 font-medium text-muted-foreground w-16">AC</th>
                <th className="text-center px-2 py-2.5 font-medium text-muted-foreground w-20">耗时</th>
                {problems.map((p) => (
                  <th key={p.id} className="text-center px-1 py-2.5 font-medium text-muted-foreground w-16">
                    <button
                      onClick={() => router.push(`/training/${training.id}/problem/${p.id}`)}
                      className="hover:text-primary transition-colors"
                    >
                      {p.order + 1}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingStats ? (
                <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">加载中...</td></tr>
              ) : userStats.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>
              ) : (
                userStats.map((u, idx) => (
                  <tr
                    key={u.userId}
                    className={cn(
                      "border-b hover:bg-muted/20 transition-colors",
                      u.userId === currentUserId ? "bg-primary/5" : ""
                    )}
                  >
                    <td className="px-2 py-2 text-center sticky left-0 bg-background z-10">
                      <span className="text-muted-foreground">{idx + 1}</span>
                    </td>
                    <td className="px-3 py-2 font-medium sticky left-12 bg-background z-10 truncate max-w-[150px]">
                      {u.userName}
                      {u.userId === currentUserId && (
                        <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1">我</Badge>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={cn("font-medium", u.solved > 0 && "text-emerald-600")}>
                        {u.solved}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-muted-foreground">
                      {u.totalRunTime}ms
                    </td>
                    {problems.map((p) => {
                      const info = u.submissionInfo[p.id];
                      if (!info) {
                        return <td key={p.id} className="px-1 py-2 text-center text-muted-foreground/30">-</td>;
                      }
                      const st = JUDGE_STATUS[info.status] || { short: info.status, rgb: "#6b7280" };
                      return (
                        <td key={p.id} className="px-1 py-2 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className="font-bold text-sm"
                              style={{ color: st.rgb }}
                            >
                              {st.short}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {info.attempts}{info.runTime > 0 ? ` (${info.runTime}ms)` : ""}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
