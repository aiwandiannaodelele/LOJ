import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const userId = parseInt(session.user.id);

  try {
    const body = (await req.json()) as { name: string; path?: string };
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: "文件夹名称不能为空" }, { status: 400 });
    }

    const path = body.path || "/";
    const folderName = body.name.trim();

    const saved = await prisma.file.create({
      data: {
        userId,
        name: folderName,
        path,
        size: 0,
        mimeType: "folder",
        url: "",
      },
    });

    return NextResponse.json({
      id: saved.id,
      name: saved.name,
      path: saved.path,
      mimeType: "folder",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "创建失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
