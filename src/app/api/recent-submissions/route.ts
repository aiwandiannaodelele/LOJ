import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        problem: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        status: s.status,
        language: s.language,
        time: s.time,
        memory: s.memory,
        createdAt: s.createdAt,
        problem: s.problem,
        user: s.user,
      })),
    });
  } catch {
    return NextResponse.json({ submissions: [] });
  }
}
