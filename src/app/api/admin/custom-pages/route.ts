import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const where = session?.user?.isAdmin ? {} : { isPublic: true };
  const pages = await prisma.customPage.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  const body = (await request.json()) as { slug: string; title: string; content: string; icon?: string; pageType?: string; isPublic?: boolean };
  if (!body.slug || !body.title) {
    return NextResponse.json({ error: "slug 和 title 为必填" }, { status: 400 });
  }
  const existing = await prisma.customPage.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json({ error: "该 ID 已存在" }, { status: 409 });
  }
  const page = await prisma.customPage.create({
    data: {
      slug: body.slug,
      title: body.title,
      content: body.content || "",
      icon: body.icon || "FileText",
      pageType: body.pageType || "html",
      isPublic: body.isPublic ?? true,
    },
  });
  return NextResponse.json(page);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  const body = (await request.json()) as { id: number; slug?: string; title?: string; content?: string; icon?: string; pageType?: string; isPublic?: boolean };
  if (!body.id) {
    return NextResponse.json({ error: "id 为必填" }, { status: 400 });
  }
  const data: Record<string, unknown> = {};
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.title !== undefined) data.title = body.title;
  if (body.content !== undefined) data.content = body.content;
  if (body.icon !== undefined) data.icon = body.icon;
  if (body.pageType !== undefined) data.pageType = body.pageType;
  if (body.isPublic !== undefined) data.isPublic = body.isPublic;

  const page = await prisma.customPage.update({ where: { id: body.id }, data });
  return NextResponse.json(page);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "id 为必填" }, { status: 400 });
  await prisma.customPage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
