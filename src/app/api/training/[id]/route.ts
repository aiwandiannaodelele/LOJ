import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trainingId = parseInt(id);
  if (isNaN(trainingId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const training = await prisma.training.findUnique({
    where: { id: trainingId },
    include: {
      problems: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          difficulty: true,
          description: true,
          inputDesc: true,
          outputDesc: true,
          sampleInput: true,
          sampleOutput: true,
          order: true,
          timeLimit: true,
          memoryLimit: true,
        },
      },
    },
  });

  if (!training) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: training.id,
    title: training.title,
    description: training.description,
    coverImage: training.coverImage,
    difficulty: training.difficulty,
    tags: (() => { try { return JSON.parse(training.tags || "[]"); } catch { return []; } })(),
    problems: training.problems.map((p) => ({
      id: p.id,
      title: p.title,
      order: p.order,
      difficulty: p.difficulty,
      description: p.description,
      inputDesc: p.inputDesc,
      outputDesc: p.outputDesc,
      sampleInput: p.sampleInput,
      sampleOutput: p.sampleOutput,
      timeLimit: p.timeLimit,
      memoryLimit: p.memoryLimit,
    })),
  });
}
