"use client";
import { useFeatureGuard } from "@/lib/use-feature-guard";


import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Swords, ArrowLeft, Clock, Hash, Users, Lock, Trophy,
  List, FileClock, Medal, AlertCircle, Megaphone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContestDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  password: boolean;
  problems: { id: number; title: string; order: number; difficulty: string; description: string; inputDesc: string; outputDesc: string; sampleInput: string; sampleOutput: string; timeLimit: number; memoryLimit: number }[];
  participantCount: number;
}

interface SubmissionInfo {
  status: string;
  attempts: number;
  runTime: number;
}

interface RankItem {
  userId: number;
  userName: string;
  solved: number;
  totalProblems: number;
  penalty: number;
  score: number;
  totalRunTime: number;
  submissionInfo: Record<string, SubmissionInfo>;
}

interface ProblemInfo {
  id: number;
  order: number;
  title: string;
}

interface SubmissionItem {
  id: number;
  userId: number;
  userName: string;
  problemTitle: string;
  problemOrder: number;
  status: string;
  time: number | null;
  memory: number | null;
  language: string;
  createdAt: string;
}

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  upcoming: { label: "未开始", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  running: { label: "进行中", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-500 animate-pulse" },
  ended: { label: "已结束", className: "bg-foreground/5 text-foreground", dot: "bg-foreground" },
};

const tabItems = [
  { key: "problems", label: "题目", icon: List },
  { key: "rank", label: "排行榜", icon: Trophy },
  { key: "submissions", label: "提交记录", icon: FileClock },
  { key: "announcements", label: "公告", icon: Megaphone },
];

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function formatCountdown(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}天`);
  if (h > 0) parts.push(`${h}时`);
  parts.push(`${String(m).padStart(2, "0")}分`);
  parts.push(`${String(s).padStart(2, "0")}秒`);
  return parts.join(" ");
}

const statusColors: Record<string, string> = {
  Accepted: "text-emerald-600",
  "Wrong Answer": "text-red-500",
  "Time Limit Exceeded": "text-yellow-600",
  "Memory Limit Exceeded": "text-orange-500",
  "Runtime Error": "text-purple-500",
};

const JUDGE_STATUS: Record<string, { short: string; rgb: string }> = {
  AC: { short: "AC", rgb: "#10b981" },
  PAC: { short: "PAC", rgb: "#f59e0b" },
  WA: { short: "WA", rgb: "#ef4444" },
  CE: { short: "CE", rgb: "#6b7280" },
  RE: { short: "RE", rgb: "#8b5cf6" },
  TLE: { short: "TLE", rgb: "#f97316" },
  MLE: { short: "MLE", rgb: "#ec4899" },
};

export default function ContestDetailPage() {
  useFeatureGuard("contestEnabled");
  const params = useParams();
  const router = useRouter();
  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [activeTab, setActiveTab] = useState("problems");
  const [rankList, setRankList] = useState<RankItem[]>([]);
  const [problems, setProblems] = useState<ProblemInfo[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loadingRank, setLoadingRank] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`/api/contest/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push("/contest");
        else setContest(data);
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
    if (!contest) return;

    const startTime = new Date(contest.startTime).getTime();
    const endTime = new Date(contest.endTime).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      if (now < startTime) {
        setCountdown(`距离开始：${formatCountdown(startTime - now)}`);
        setProgressValue(0);
      } else if (now < endTime) {
        setCountdown(`距离结束：${formatCountdown(endTime - now)}`);
        const total = endTime - startTime;
        const elapsed = now - startTime;
        setProgressValue(Math.min(100, (elapsed / total) * 100));
      } else {
        setCountdown("比赛已结束");
        setProgressValue(100);
      }
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [contest]);

  useEffect(() => {
    if (!contest) return;
    if (activeTab === "rank" && rankList.length === 0) {
      setLoadingRank(true);
      fetch(`/api/contest/${params.id}/rank`)
        .then((r) => r.json())
        .then((data) => {
          setRankList(data.rankList || []);
          setProblems(data.problems || []);
        })
        .finally(() => setLoadingRank(false));
    }
    if (activeTab === "submissions" && submissions.length === 0) {
      setLoadingSubs(true);
      fetch(`/api/contest/${params.id}/submissions`)
        .then((r) => r.json())
        .then((data) => setSubmissions(data.submissions || []))
        .finally(() => setLoadingSubs(false));
    }
    if (activeTab === "announcements" && announcements.length === 0) {
      setLoadingAnnouncements(true);
      fetch(`/api/contest/${params.id}/announcements`)
        .then((r) => r.json())
        .then((data) => setAnnouncements(data.announcements || []))
        .finally(() => setLoadingAnnouncements(false));
    }
  }, [activeTab, contest, params.id]);

  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      setPasswordError("请输入密码");
      return;
    }
    setPasswordLoading(true);
    setPasswordError("");
    try {
      const res = await fetch(`/api/contest/${params.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordVerified(true);
        localStorage.setItem(`contest_${params.id}_verified`, "true");
      } else {
        setPasswordError(data.error || "密码错误");
      }
    } catch {
      setPasswordError("网络错误");
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    const verified = localStorage.getItem(`contest_${params.id}_verified`);
    if (verified === "true") setPasswordVerified(true);
  }, [params.id]);

  if (!contest) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 text-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  const cfg = statusConfig[contest.status] || statusConfig.upcoming;
  const st = new Date(contest.startTime);
  const et = new Date(contest.endTime);
  const needsPassword = contest.password && !passwordVerified;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/contest")}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          title="返回"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Swords className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight">{contest.title}</h1>
            <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", cfg.className)}>
              <span className={cn("h-1.5 w-1.5 rounded-full mr-1", cfg.dot)} />
              {cfg.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{contest.type}</Badge>
            {contest.password && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                <Lock className="h-3 w-3 mr-0.5" />
                密码
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            开始：{st.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            结束：{et.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Hash className="h-3.5 w-3.5" />
            时长：{formatDuration(contest.duration)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {contest.participantCount} 人报名
          </span>
        </div>

        {/* Countdown & Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={cn(
              "font-medium",
              contest.status === "running" ? "text-emerald-600" : contest.status === "ended" ? "text-muted-foreground" : "text-primary"
            )}>
              {countdown}
            </span>
            <span className="text-xs text-muted-foreground">{Math.round(progressValue)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                contest.status === "running" ? "bg-emerald-500" : contest.status === "ended" ? "bg-foreground/30" : "bg-primary/50"
              )}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        {contest.description && (
          <p className="text-sm text-muted-foreground">{contest.description}</p>
        )}
      </div>

      {/* Password Verification */}
      {needsPassword && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">需要密码</span>
          </div>
          <p className="text-sm text-muted-foreground">该比赛需要密码才能查看题目和提交</p>
          <div className="flex gap-2">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              placeholder="输入比赛密码"
              className="flex-1 h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handlePasswordSubmit}
              disabled={passwordLoading}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {passwordLoading ? "验证中..." : "进入"}
            </button>
          </div>
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
        </div>
      )}

      {/* Tabs */}
      {!needsPassword && (
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
      )}

      {/* Problems Tab */}
      {!needsPassword && activeTab === "problems" && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-16">序号</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">题目</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-32">时限 / 内存</th>
              </tr>
            </thead>
            <tbody>
              {contest.problems.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b hover:bg-muted/20 transition-colors",
                    contest.status === "running" || contest.status === "ended" ? "cursor-pointer" : ""
                  )}
                  onClick={() => {
                    if (contest.status === "running" || contest.status === "ended") {
                      router.push(`/contest/${contest.id}/problem/${p.id}`);
                    }
                  }}
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {String.fromCharCode(65 + p.order)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "font-medium",
                      contest.status === "running" || contest.status === "ended" ? "hover:text-primary transition-colors" : ""
                    )}>{p.title}</span>
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

      {/* Rank Tab - HOJ Style Matrix */}
      {!needsPassword && activeTab === "rank" && (
        <div className="rounded-xl border border-border/50 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-center px-2 py-2.5 font-medium text-muted-foreground w-12 sticky left-0 bg-muted/30 z-10">#</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground min-w-[120px] sticky left-12 bg-muted/30 z-10">用户</th>
                {contest.type === "ACM" && (
                  <>
                    <th className="text-center px-2 py-2.5 font-medium text-muted-foreground w-16">AC</th>
                    <th className="text-center px-2 py-2.5 font-medium text-muted-foreground w-20">罚时</th>
                  </>
                )}
                {contest.type === "OI" && (
                  <th className="text-center px-2 py-2.5 font-medium text-muted-foreground w-16">得分</th>
                )}
                {problems.map((p) => (
                  <th key={p.id} className="text-center px-1 py-2.5 font-medium text-muted-foreground w-16">
                    <button
                      onClick={() => {
                        if (contest.status === "running" || contest.status === "ended") {
                          router.push(`/contest/${contest.id}/problem/${p.id}`);
                        }
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      {String.fromCharCode(65 + p.order)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingRank ? (
                <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">加载中...</td></tr>
              ) : rankList.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">暂无提交记录</td></tr>
              ) : (
                rankList.map((r, idx) => (
                  <tr
                    key={r.userId}
                    className={cn(
                      "border-b hover:bg-muted/20 transition-colors",
                      r.userId === currentUserId ? "bg-primary/5" : ""
                    )}
                  >
                    <td className="px-2 py-2 text-center sticky left-0 bg-background z-10">
                      {idx === 0 ? <Medal className="h-4 w-4 text-yellow-500 inline" /> :
                       idx === 1 ? <Medal className="h-4 w-4 text-gray-400 inline" /> :
                       idx === 2 ? <Medal className="h-4 w-4 text-amber-600 inline" /> :
                       <span className="text-muted-foreground">{idx + 1}</span>}
                    </td>
                    <td className="px-3 py-2 font-medium sticky left-12 bg-background z-10 truncate max-w-[150px]">
                      {r.userName}
                      {r.userId === currentUserId && (
                        <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1">我</Badge>
                      )}
                    </td>
                    {contest.type === "ACM" && (
                      <>
                        <td className="px-2 py-2 text-center">
                          <span className={cn("font-medium", r.solved > 0 && "text-emerald-600")}>
                            {r.solved}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center text-muted-foreground">{r.penalty}</td>
                      </>
                    )}
                    {contest.type === "OI" && (
                      <td className="px-2 py-2 text-center">
                        <span className="font-medium text-emerald-600">{r.score}</span>
                      </td>
                    )}
                    {problems.map((p) => {
                      const info = r.submissionInfo[p.id];
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

      {/* Submissions Tab */}
      {!needsPassword && activeTab === "submissions" && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-16">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">用户</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">题目</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">结果</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">语言</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">时间</th>
              </tr>
            </thead>
            <tbody>
              {loadingSubs ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">加载中...</td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">暂无提交记录</td></tr>
              ) : (
                submissions.map((s, idx) => (
                  <tr key={s.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">{s.userName}</td>
                    <td className="px-4 py-3">
                      {String.fromCharCode(65 + s.problemOrder)}. {s.problemTitle}
                    </td>
                    <td className={cn("px-4 py-3 font-medium", statusColors[s.status] || "text-muted-foreground")}>
                      {s.status}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.language}</td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Announcements Tab */}
      {!needsPassword && activeTab === "announcements" && (
        <div className="space-y-3">
          {loadingAnnouncements ? (
            <div className="rounded-xl border border-border/50 p-8 text-center text-muted-foreground">加载中...</div>
          ) : announcements.length === 0 ? (
            <div className="rounded-xl border border-border/50 p-8 text-center text-muted-foreground">暂无公告</div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{a.title}</h3>
                  <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
