import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const keyword = searchParams.get("keyword") || "";
  const tab = searchParams.get("tab") || "all"; // all | today | week | fastest

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  // Build date filter based on tab
  let dateFilter: { gte?: Date } = {};
  if (tab === "today") dateFilter = { gte: todayStart };
  if (tab === "week") dateFilter = { gte: weekStart };

  // Get all users with their submissions
  const users = await prisma.user.findMany({
    where: keyword
      ? { name: { contains: keyword } }
      : undefined,
    select: {
      id: true,
      name: true,
      createdAt: true,
      submissions: {
        where: {
          createdAt: dateFilter.gte ? { gte: dateFilter.gte } : undefined,
        },
        select: {
          id: true,
          problemId: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  // Compute stats per user
  let ranked = users.map((u) => {
    const acSubs = u.submissions.filter((s) => s.status === "AC");
    const acProblemIds = new Set(acSubs.map((s) => s.problemId));
    const totalSubs = u.submissions.length;
    const acRate = totalSubs > 0 ? Math.round((acSubs.length / totalSubs) * 100) : 0;
    const lastActive = u.submissions.length > 0
      ? u.submissions.reduce((max, s) => (s.createdAt > max ? s.createdAt : max), u.submissions[0].createdAt)
      : u.createdAt;

    return {
      id: u.id,
      name: u.name,
      acCount: acProblemIds.size,
      totalSubs,
      acRate,
      score: acProblemIds.size * 100 + acRate, // simple scoring
      lastActive,
    };
  });

  // Sort by AC count desc, then score desc
  ranked.sort((a, b) => {
    if (b.acCount !== a.acCount) return b.acCount - a.acCount;
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
  });

  const total = ranked.length;
  const start = (page - 1) * pageSize;
  const list = ranked.slice(start, start + pageSize);

  return NextResponse.json({
    users: list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
