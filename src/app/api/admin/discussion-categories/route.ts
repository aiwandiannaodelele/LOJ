import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.discussionCategory.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const body = await request.json();
  const category = await prisma.discussionCategory.create({
    data: { name: body.name, slug: body.slug, description: body.description || "", icon: body.icon || "MessageSquare", color: body.color || "#3b82f6", sortOrder: body.sortOrder || 0, enabled: body.enabled ?? true },
  });
  return NextResponse.json(category);
}
