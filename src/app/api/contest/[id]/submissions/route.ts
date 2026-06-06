import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const contestId = parseInt(id);
  if (isNaN(contestId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          problem: { select: { title: true, order: true } },
        },
      },
    },
  });

  if (!contest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.isAdmin;
  const userId = parseInt(session.user.id);

  // 非管理员只能看到自己的提交
  const visibleSubmissions = isAdmin
    ? contest.submissions
    : contest.submissions.filter((s) => s.userId === userId);

  // Fetch user names
  const userIds = [...new Set(visibleSubmissions.map((s) => s.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userNameMap = new Map(users.map((u) => [u.id, u.name]));

  return NextResponse.json({
    submissions: visibleSubmissions.map((s) => ({
      id: s.id,
      userId: s.userId,
      userName: userNameMap.get(s.userId) || "Unknown",
      problemTitle: s.problem.title,
      problemOrder: s.problem.order,
      status: s.status,
      time: s.time,
      memory: s.memory,
      language: s.language,
      createdAt: s.createdAt,
    })),
  });
}
