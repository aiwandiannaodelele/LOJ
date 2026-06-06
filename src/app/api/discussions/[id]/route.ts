import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MAX_FIELD_LENGTH } from "@/lib/security";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const discussionId = parseInt(id);
  if (isNaN(discussionId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: {
      user: { select: { id: true, name: true } },
      problem: { select: { id: true, title: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { replies: true } },
    },
  });

  if (!discussion) {
    return NextResponse.json({ error: "讨论不存在" }, { status: 404 });
  }

  return NextResponse.json(discussion);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const discussionId = parseInt(id);
  if (isNaN(discussionId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    select: { userId: true },
  });

  if (!discussion) {
    return NextResponse.json({ error: "讨论不存在" }, { status: 404 });
  }

  const isAdmin = session.user.isAdmin;
  const isOwner = discussion.userId === parseInt(session.user.id);
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const body = (await request.json()) as {
    title?: string;
    content?: string;
    isPinned?: boolean;
    isAnnouncement?: boolean;
  };

  if (body.title && body.title.length > 200) {
    return NextResponse.json({ error: "标题过长" }, { status: 400 });
  }
  if (body.content && body.content.length > MAX_FIELD_LENGTH) {
    return NextResponse.json({ error: "内容过长" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.content !== undefined) data.content = body.content;
  if (isAdmin && body.isPinned !== undefined) data.isPinned = body.isPinned;
  if (isAdmin && body.isAnnouncement !== undefined) data.isAnnouncement = body.isAnnouncement;

  const updated = await prisma.discussion.update({
    where: { id: discussionId },
    data,
    include: {
      user: { select: { id: true, name: true } },
      problem: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const discussionId = parseInt(id);
  if (isNaN(discussionId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    select: { userId: true },
  });

  if (!discussion) {
    return NextResponse.json({ error: "讨论不存在" }, { status: 404 });
  }

  const isAdmin = session.user.isAdmin;
  const isOwner = discussion.userId === parseInt(session.user.id);
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  await prisma.discussion.delete({ where: { id: discussionId } });
  return NextResponse.json({ success: true });
}
