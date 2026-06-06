import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);

  const [totalSubmissions, acSubmissions, attemptedProblems] =
    await Promise.all([
      prisma.submission.count({ where: { userId } }),
      prisma.submission.findMany({
        where: { userId, status: "AC" },
        select: { problemId: true },
      }),
      prisma.submission.findMany({
        where: { userId },
        select: { problemId: true },
      }),
    ]);

  const acProblemIds = new Set(acSubmissions.map((s) => s.problemId));
  const attemptedProblemIds = new Set(attemptedProblems.map((s) => s.problemId));

  return NextResponse.json({
    totalSubmissions,
    acCount: acProblemIds.size,
    problemCount: attemptedProblemIds.size,
  });
}
