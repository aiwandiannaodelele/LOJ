import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizePage, sanitizePageSize } from "@/lib/security";

export async function GET(request: Request) {
  // CVE-15: 提交记录列表需要登录
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = sanitizePage(searchParams.get("page"));
  const pageSize = sanitizePageSize(searchParams.get("pageSize"));
  const problemId = searchParams.get("problemId");
  const status = searchParams.get("status");
  const userIdParam = searchParams.get("userId");

  const where: Record<string, unknown> = {};

  // 权限控制：普通用户只能查看自己的提交，管理员可查看全部
  const isAdmin = session.user.isAdmin;
  if (!isAdmin) {
    where.userId = parseInt(session.user.id);
  } else if (userIdParam) {
    // 管理员可以通过 userId 参数查看指定用户的提交
    where.userId = parseInt(userIdParam);
  }

  if (problemId) where.problemId = parseInt(problemId);
  if (status) where.status = status;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      include: {
        problem: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.submission.count({ where }),
  ]);

  return NextResponse.json({ submissions, total, page, pageSize });
}
