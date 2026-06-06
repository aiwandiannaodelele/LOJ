import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const userId = parseInt(session.user.id);
  const { id } = await params;
  const fileId = parseInt(id);
  if (isNaN(fileId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { userId: true },
    });

    if (!file) return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    if (file.userId !== userId) return NextResponse.json({ error: "无权限" }, { status: 403 });

    await prisma.file.delete({ where: { id: fileId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "删除失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const userId = parseInt(session.user.id);
  const { id } = await params;
  const fileId = parseInt(id);
  if (isNaN(fileId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { userId: true },
    });

    if (!file) return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    if (file.userId !== userId) return NextResponse.json({ error: "无权限" }, { status: 403 });

    const body = (await req.json()) as { name?: string; path?: string };
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.path !== undefined) data.path = body.path;

    const updated = await prisma.file.update({
      where: { id: fileId },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "更新失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
