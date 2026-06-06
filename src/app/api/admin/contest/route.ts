import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizePage, sanitizePageSize } from "@/lib/security";
import bcrypt from "bcryptjs";

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

  const [contests, total] = await Promise.all([
    prisma.contest.findMany({
      include: {
        _count: { select: { participants: true, problems: true } },
      },
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contest.count(),
  ]);

  return NextResponse.json({
    contests: contests.map((c) => {
      const now = new Date();
      const st = new Date(c.startTime);
      const et = new Date(c.endTime);
      let status: string;
      if (now < st) status = "upcoming";
      else if (now >= st && now <= et) status = "running";
      else status = "ended";

      return {
        id: c.id,
        title: c.title,
        type: c.type,
        startTime: c.startTime,
        endTime: c.endTime,
        status,
        hasPassword: !!c.password,
        isPublic: c.isPublic,
        participantCount: c._count.participants,
        problemCount: c._count.problems,
        createdAt: c.createdAt,
      };
    }),
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
  const { title, description, type, startTime, endTime, password, problems } = body;

  if (!title || !startTime || !endTime || !problems?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const contest = await prisma.contest.create({
    data: {
      title,
      description: description || "",
      type: type || "ACM",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      password: hashedPassword,
      createdBy: Number(session.user.id),
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

  return NextResponse.json({ id: contest.id });
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

  await prisma.contest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
