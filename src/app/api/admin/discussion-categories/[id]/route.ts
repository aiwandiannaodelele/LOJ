import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  const { name, slug, description, icon, color, sortOrder, enabled } = await request.json();
  const category = await prisma.discussionCategory.update({
    where: { id: parseInt(id) },
    data: { name, slug, description, icon, color, sortOrder, enabled },
  });
  return NextResponse.json(category);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  await prisma.discussionCategory.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
