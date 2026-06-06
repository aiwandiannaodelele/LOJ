import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizePage, sanitizePageSize } from "@/lib/security";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  if (searchParams.get("bank") === "1") {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        description: true,
        inputDesc: true,
        outputDesc: true,
        sampleInput: true,
        sampleOutput: true,
        testCases: true,
        timeLimit: true,
        memoryLimit: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ problems });
  }

  const page = sanitizePage(searchParams.get("page"));
  const pageSize = sanitizePageSize(searchParams.get("pageSize"), 20, 100);

  const [trainings, total] = await Promise.all([
    prisma.training.findMany({
      include: {
        _count: { select: { problems: true } },
      },
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.training.count(),
  ]);

  return NextResponse.json({
    trainings: trainings.map((t) => ({
      id: t.id,
      title: t.title,
      difficulty: t.difficulty,
      isPublic: t.isPublic,
      problemCount: t._count.problems,
      createdAt: t.createdAt,
    })),
    total,
    page,
    pageSize,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, difficulty, tags, problems } = body;

  if (!title || !problems?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const training = await prisma.training.create({
    data: {
      title,
      description: description || "",
      difficulty: difficulty || "入门",
      tags: JSON.stringify(tags || []),
      authorId: Number(session.user.id),
      problems: {
        create: problems.map((p: any, idx: number) => ({
          order: idx,
          title: p.title,
          difficulty: p.difficulty || "Easy",
          description: p.description || "",
          inputDesc: p.inputDesc || "",
          outputDesc: p.outputDesc || "",
          sampleInput: p.sampleInput || "",
          sampleOutput: p.sampleOutput || "",
          testCases: p.testCases || "[]",
          timeLimit: p.timeLimit || 5,
          memoryLimit: p.memoryLimit || 256,
          sourceProblemId: p.sourceProblemId || null,
        })),
      },
    },
  });

  return NextResponse.json({ id: training.id });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.training.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
