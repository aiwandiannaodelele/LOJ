import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const userId = parseInt(session.user.id);
  const [received, sent] = await Promise.all([
    prisma.message.findMany({ where: { toUserId: userId }, include: { fromUser: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.message.findMany({ where: { fromUserId: userId }, include: { toUser: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const unread = await prisma.message.count({ where: { toUserId: userId, isRead: false } });
  return NextResponse.json({ received, sent, unreadCount: unread });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { toUserId, title, content } = await request.json();
  if (!toUserId || !title || !content) return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  const msg = await prisma.message.create({
    data: { fromUserId: parseInt(session.user.id), toUserId, title, content },
  });
  return NextResponse.json(msg);
}
