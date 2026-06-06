import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStorageProvider } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "没有上传文件" }, { status: 400 });
    }

    // 验证文件大小和类型（最大 10MB，仅限图片）
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (file.size > maxSize) {
      return NextResponse.json({ error: "文件大小不能超过 10MB" }, { status: 400 });
    }
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "仅支持 PNG、JPEG、WebP、GIF 格式" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = await getStorageProvider();
    const result = await storage.upload(buffer, file.name, file.type);

    const userId = parseInt(session.user.id);
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: result.url },
    });

    return NextResponse.json({ url: result.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "上传失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
