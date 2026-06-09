import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const userId = parseInt(session.user.id);
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return NextResponse.json({ notifications, unreadCount: unread });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { ids } = await request.json();
  if (ids) {
    await prisma.notification.updateMany({ where: { id: { in: ids }, userId: parseInt(session.user.id) }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({ where: { userId: parseInt(session.user.id), isRead: false }, data: { isRead: true } });
  }
  return NextResponse.json({ ok: true });
}
