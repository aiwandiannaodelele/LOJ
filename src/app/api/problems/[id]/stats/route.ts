import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const problemId = parseInt(id);
  if (isNaN(problemId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true },
  });

  if (!problem) {
    return NextResponse.json({ error: "题目不存在" }, { status: 404 });
  }

  const stats = await prisma.submission.groupBy({
    by: ["status"],
    where: { problemId },
    _count: { status: true },
  });

  const total = stats.reduce((sum, s) => sum + s._count.status, 0);

  const result = stats.map((s) => ({
    status: s.status,
    count: s._count.status,
    percentage: total > 0 ? Number(((s._count.status / total) * 100).toFixed(1)) : 0,
  }));

  return NextResponse.json({ stats: result, total });
}
