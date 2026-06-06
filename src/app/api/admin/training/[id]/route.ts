import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const trainingId = parseInt(id);
  if (isNaN(trainingId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const training = await prisma.training.findUnique({
    where: { id: trainingId },
    include: {
      problems: {
        orderBy: { order: "asc" },
      },
      _count: { select: { submissions: true } },
    },
  });

  if (!training) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: training.id,
    title: training.title,
    description: training.description,
    difficulty: training.difficulty,
    tags: (() => { try { return JSON.parse(training.tags || "[]"); } catch { return []; } })(),
    isPublic: training.isPublic,
    problems: training.problems.map((p) => ({
      id: p.id,
      order: p.order,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      inputDesc: p.inputDesc,
      outputDesc: p.outputDesc,
      sampleInput: p.sampleInput,
      sampleOutput: p.sampleOutput,
      testCases: p.testCases,
      timeLimit: p.timeLimit,
      memoryLimit: p.memoryLimit,
      sourceProblemId: p.sourceProblemId,
    })),
    submissionCount: training._count.submissions,
    createdAt: training.createdAt,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const trainingId = parseInt(id);
  if (isNaN(trainingId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const { title, description, difficulty, tags, isPublic, problems } = body;

  const existing = await prisma.training.findUnique({ where: { id: trainingId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (difficulty !== undefined) data.difficulty = difficulty;
  if (tags !== undefined) data.tags = JSON.stringify(tags);
  if (isPublic !== undefined) data.isPublic = isPublic;

  if (problems !== undefined) {
    await prisma.trainingProblem.deleteMany({ where: { trainingId } });
    if (problems.length > 0) {
      await prisma.trainingProblem.createMany({
        data: problems.map((p: any, idx: number) => ({
          trainingId,
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
      });
    }
  }

  const updated = await prisma.training.update({
    where: { id: trainingId },
    data,
  });

  return NextResponse.json({ id: updated.id });
}
