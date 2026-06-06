import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contestId = parseInt(id);
  if (isNaN(contestId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      problems: { select: { id: true, order: true, title: true } },
      submissions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!contest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const problems = contest.problems.sort((a, b) => a.order - b.order);
  const problemCount = problems.length;

  // Build rank map: userId -> per-problem submission info
  const userMap = new Map<
    number,
    {
      submissionInfo: Map<number, { status: string; attempts: number; runTime: number }>;
      solved: Set<number>;
      penalty: number;
      score: number;
      totalRunTime: number;
    }
  >();

  for (const sub of contest.submissions) {
    if (!userMap.has(sub.userId)) {
      userMap.set(sub.userId, {
        submissionInfo: new Map(),
        solved: new Set(),
        penalty: 0,
        score: 0,
        totalRunTime: 0,
      });
    }
    const u = userMap.get(sub.userId)!;
    const pid = sub.contestProblemId;

    // If already AC on this problem, skip (first AC counts)
    if (u.solved.has(pid)) continue;

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
      const timeMin = Math.floor(
        (new Date(sub.createdAt).getTime() - new Date(contest.startTime).getTime()) / 60000
      );
      if (contest.type === "ACM") {
        u.penalty += timeMin + (attempts - 1) * 20;
      }
      u.totalRunTime += runTime;
    }
  }

  // Calculate score for OI
  if (contest.type === "OI") {
    for (const [, u] of userMap) {
      u.score = u.solved.size * 100;
    }
  } else {
    for (const [, u] of userMap) {
      u.score = u.solved.size;
    }
  }

  // Fetch user names
  const userIds = Array.from(userMap.keys());
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userNameMap = new Map(users.map((u) => [u.id, u.name]));

  const rankList = Array.from(userMap.entries()).map(([userId, data]) => {
    // Convert submissionInfo map to object with problemId keys
    const submissionInfoObj: Record<string, { status: string; attempts: number; runTime: number }> = {};
    for (const [pid, info] of data.submissionInfo) {
      submissionInfoObj[pid] = info;
    }

    return {
      userId,
      userName: userNameMap.get(userId) || "Unknown",
      solved: data.solved.size,
      totalProblems: problemCount,
      penalty: data.penalty,
      score: data.score,
      totalRunTime: data.totalRunTime,
      submissionInfo: submissionInfoObj,
    };
  });

  // Sort: ACM -> more solved, then less penalty; OI -> higher score
  rankList.sort((a, b) => {
    if (contest.type === "OI") return b.score - a.score;
    if (b.solved !== a.solved) return b.solved - a.solved;
    return a.penalty - b.penalty;
  });

  return NextResponse.json({
    type: contest.type,
    rankList,
    problemCount,
    problems: problems.map((p) => ({ id: p.id, order: p.order, title: p.title })),
  });
}
