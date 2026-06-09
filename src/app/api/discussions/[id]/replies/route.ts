import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MAX_FIELD_LENGTH } from "@/lib/security";

export async function POST(
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
    select: { id: true },
  });

  if (!discussion) {
    return NextResponse.json({ error: "讨论不存在" }, { status: 404 });
  }

  const body = (await request.json()) as { content: string };
  if (!body.content || body.content.trim().length === 0) {
    return NextResponse.json({ error: "回复内容不能为空" }, { status: 400 });
  }
  if (body.content.length > MAX_FIELD_LENGTH) {
    return NextResponse.json({ error: "内容过长" }, { status: 400 });
  }

  const reply = await prisma.discussionReply.create({
    data: { discussionId, userId: parseInt(session.user.id), content: body.content },
    include: { user: { select: { id: true, name: true } } },
  });

  // 通知帖主
  const discussionFull = await prisma.discussion.findUnique({ where: { id: discussionId }, select: { userId: true, title: true } });
  if (discussionFull && discussionFull.userId !== parseInt(session.user.id)) {
    await prisma.notification.create({
      data: {
        userId: discussionFull.userId,
        type: "reply",
        title: "新回复",
        body: `${session.user.name} 回复了你的讨论「${discussionFull.title.slice(0, 50)}」`,
        link: `/discussions/${discussionId}`,
      },
    });
  }

  return NextResponse.json(reply, { status: 201 });
}
