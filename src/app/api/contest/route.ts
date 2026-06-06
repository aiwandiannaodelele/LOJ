import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = { isPublic: true };
  const now = new Date();

  if (status === "upcoming") where.startTime = { gt: now };
  if (status === "running") where.startTime = { lte: now }, where.endTime = { gte: now };
  if (status === "ended") where.endTime = { lt: now };

  const [contests, total] = await Promise.all([
    prisma.contest.findMany({
      where,
      include: {
        _count: { select: { participants: true, problems: true } },
      },
      orderBy: { startTime: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contest.count({ where }),
  ]);

  return NextResponse.json({
    contests: contests.map((c) => {
      const st = new Date(c.startTime);
      const et = new Date(c.endTime);
      let contestStatus: string;
      if (now < st) contestStatus = "upcoming";
      else if (now >= st && now <= et) contestStatus = "running";
      else contestStatus = "ended";

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.type,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: Math.round((et.getTime() - st.getTime()) / 60000),
        status: contestStatus,
        participantCount: c._count.participants,
        problemCount: c._count.problems,
        createdBy: c.createdBy,
      };
    }),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
