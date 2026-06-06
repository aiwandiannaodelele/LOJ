import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const keyword = searchParams.get("keyword") || "";
  const difficulty = searchParams.get("difficulty") || "";

  const where: Record<string, unknown> = { isPublic: true };
  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { pinyin: { contains: keyword } },
    ];
  }
  if (difficulty) where.difficulty = difficulty;

  const [trainings, total] = await Promise.all([
    prisma.training.findMany({
      where,
      include: {
        _count: { select: { problems: true, submissions: true } },
        problems: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.training.count({ where }),
  ]);

  // Get unique participants count per training
  const trainingIds = trainings.map((t) => t.id);
  const participantCounts = await prisma.trainingSubmission.groupBy({
    by: ["trainingId"],
    where: { trainingId: { in: trainingIds } },
    _count: { userId: true },
  });
  const participantMap = new Map(participantCounts.map((p) => [p.trainingId, p._count.userId]));

  return NextResponse.json({
    trainings: trainings.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      coverImage: t.coverImage,
      difficulty: t.difficulty,
      tags: (() => { try { return JSON.parse(t.tags || "[]"); } catch { return []; } })(),
      problemCount: t._count.problems,
      submissionCount: t._count.submissions,
      participantCount: participantMap.get(t.id) || 0,
      createdAt: t.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
