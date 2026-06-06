import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const contestId = parseInt(id);
  if (isNaN(contestId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      problems: {
        orderBy: { order: "asc" },
      },
      _count: { select: { participants: true } },
    },
  });

  if (!contest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: contest.id,
    title: contest.title,
    description: contest.description,
    type: contest.type,
    startTime: contest.startTime,
    endTime: contest.endTime,
    hasPassword: !!contest.password,
    isPublic: contest.isPublic,
    problems: contest.problems.map((p) => ({
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
    participantCount: contest._count.participants,
    createdAt: contest.createdAt,
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
  const contestId = parseInt(id);
  if (isNaN(contestId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const { title, description, type, startTime, endTime, password, isPublic, problems } = body;

  const existing = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (type !== undefined) data.type = type;
  if (startTime !== undefined) data.startTime = new Date(startTime);
  if (endTime !== undefined) data.endTime = new Date(endTime);
  if (isPublic !== undefined) data.isPublic = isPublic;
  if (password !== undefined) {
    data.password = password ? await bcrypt.hash(password, 10) : null;
  }

  // If problems provided, replace them
  if (problems !== undefined) {
    await prisma.contestProblem.deleteMany({ where: { contestId } });
    if (problems.length > 0) {
      await prisma.contestProblem.createMany({
        data: problems.map((p: any, idx: number) => ({
          contestId,
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

  const updated = await prisma.contest.update({
    where: { id: contestId },
    data,
  });

  return NextResponse.json({ id: updated.id });
}
