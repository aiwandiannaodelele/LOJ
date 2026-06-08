import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.description !== undefined) data.description = body.description;
  if (body.icon !== undefined) data.icon = body.icon;
  if (body.color !== undefined) data.color = body.color;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
  if (body.enabled !== undefined) data.enabled = body.enabled;
  const category = await prisma.discussionCategory.update({ where: { id: parseInt(id) }, data: data as any });
  return NextResponse.json(category);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  await prisma.discussionCategory.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
