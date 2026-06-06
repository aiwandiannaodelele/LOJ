import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizePage, sanitizePageSize, MAX_FIELD_LENGTH } from "@/lib/security";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = sanitizePage(searchParams.get("page"));
  const pageSize = sanitizePageSize(searchParams.get("pageSize"));
  const problemId = searchParams.get("problemId");
  const sort = searchParams.get("sort") || "newest"; // newest | oldest | pinned

  const where: Record<string, unknown> = {};
  if (problemId) {
    const parsedProblemId = parseInt(problemId);
    if (!isNaN(parsedProblemId)) {
      where.problemId = parsedProblemId;
    }
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "pinned") {
    orderBy = { isPinned: "desc" };
  }

  const [discussions, total] = await Promise.all([
    prisma.discussion.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        problem: { select: { id: true, title: true } },
        _count: { select: { replies: true } },
      },
      orderBy: sort === "pinned"
        ? [{ isPinned: "desc" }, { createdAt: "desc" }]
        : [orderBy],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.discussion.count({ where }),
  ]);

  return NextResponse.json({ discussions, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const body = (await request.json()) as {
    problemId?: number;
    title: string;
    content: string;
    isAnnouncement?: boolean;
  };

  if (!body.title || !body.content) {
    return NextResponse.json({ error: "标题和内容为必填" }, { status: 400 });
  }

  if (body.title.length > 200) {
    return NextResponse.json({ error: "标题过长" }, { status: 400 });
  }
  if (body.content.length > MAX_FIELD_LENGTH) {
    return NextResponse.json({ error: "内容过长" }, { status: 400 });
  }

  // 仅管理员可发公告
  const isAdmin = session.user.isAdmin;
  const isAnnouncement = isAdmin ? (body.isAnnouncement ?? false) : false;

  const discussion = await prisma.discussion.create({
    data: {
      userId: parseInt(session.user.id),
      problemId: body.problemId || null,
      title: body.title,
      content: body.content,
      isAnnouncement,
    },
    include: {
      user: { select: { id: true, name: true } },
      problem: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(discussion, { status: 201 });
}
