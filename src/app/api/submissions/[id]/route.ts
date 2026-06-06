import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const submissionId = parseInt(id);
  if (isNaN(submissionId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      problem: { select: { id: true, title: true, slug: true } },
      user: { select: { id: true, name: true } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  // CVE-2: 非本人且非管理员只能看到摘要，不暴露代码和输出
  const isAdmin = session.user.isAdmin;
  const isOwner = submission.userId === parseInt(session.user.id);

  if (!isAdmin && !isOwner) {
    return NextResponse.json({
      id: submission.id,
      problemId: submission.problemId,
      userId: submission.userId,
      language: submission.language,
      status: submission.status,
      time: submission.time,
      memory: submission.memory,
      createdAt: submission.createdAt,
      problem: submission.problem,
      user: { id: submission.user.id, name: submission.user.name },
    });
  }

  return NextResponse.json(submission);
}
