import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trainingId = parseInt(id);
  if (isNaN(trainingId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const training = await prisma.training.findUnique({
    where: { id: trainingId },
    include: {
      problems: { select: { id: true, order: true, title: true } },
      submissions: true,
    },
  });

  if (!training) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const problems = training.problems.sort((a, b) => a.order - b.order);
  const problemCount = problems.length;

  // Per-user stats with per-problem submission info
  const userMap = new Map<
    number,
    {
      solved: Set<number>;
      totalAttempts: number;
      lastSubmit: Date | null;
      submissionInfo: Map<number, { status: string; attempts: number; runTime: number }>;
      totalRunTime: number;
    }
  >();

  for (const sub of training.submissions) {
    if (!userMap.has(sub.userId)) {
      userMap.set(sub.userId, {
        solved: new Set(),
        totalAttempts: 0,
        lastSubmit: null,
        submissionInfo: new Map(),
        totalRunTime: 0,
      });
    }
    const u = userMap.get(sub.userId)!;
    const pid = sub.trainingProblemId;
    u.totalAttempts++;

    const prev = u.submissionInfo.get(pid);
    const attempts = (prev?.attempts || 0) + 1;
    const runTime = sub.time || 0;

    u.submissionInfo.set(pid, {
      status: sub.status,
      attempts,
      runTime,
    });

    if (sub.status === "AC") {
      u.solved.add(pid);
      u.totalRunTime += runTime;
    }

    const t = new Date(sub.createdAt);
    if (!u.lastSubmit || t > u.lastSubmit) u.lastSubmit = t;
  }

  const userIds = Array.from(userMap.keys());
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userNameMap = new Map(users.map((u) => [u.id, u.name]));

  const stats = Array.from(userMap.entries()).map(([userId, data]) => {
    const submissionInfoObj: Record<string, { status: string; attempts: number; runTime: number }> = {};
    for (const [pid, info] of data.submissionInfo) {
      submissionInfoObj[pid] = info;
    }

    return {
      userId,
      userName: userNameMap.get(userId) || "Unknown",
      solved: data.solved.size,
      totalProblems: problemCount,
      totalAttempts: data.totalAttempts,
      progress: problemCount > 0 ? Math.round((data.solved.size / problemCount) * 100) : 0,
      lastSubmit: data.lastSubmit,
      totalRunTime: data.totalRunTime,
      submissionInfo: submissionInfoObj,
    };
  });

  // Sort by solved desc, then attempts asc
  stats.sort((a, b) => {
    if (b.solved !== a.solved) return b.solved - a.solved;
    return a.totalAttempts - b.totalAttempts;
  });

  // Problem-level AC rate
  const problemStats = training.problems.map((p) => {
    const subs = training.submissions.filter((s) => s.trainingProblemId === p.id);
    const total = subs.length;
    const ac = subs.filter((s) => s.status === "AC").length;
    return {
      problemId: p.id,
      title: p.title,
      order: p.order,
      totalSubmissions: total,
      acCount: ac,
      acRate: total > 0 ? Math.round((ac / total) * 100) : 0,
    };
  });

  return NextResponse.json({
    stats,
    problemStats,
    problemCount,
    problems: problems.map((p) => ({ id: p.id, order: p.order, title: p.title })),
  });
}
