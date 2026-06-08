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
  const { name, slug, description, icon, color, sortOrder, enabled } = await request.json();
  const category = await prisma.discussionCategory.create({
    data: { name, slug, description, icon, color, sortOrder, enabled },
  });
  return NextResponse.json(category);
}
