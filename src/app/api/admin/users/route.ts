import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizePage, sanitizePageSize } from "@/lib/security";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  // CVE-13: 分页参数边界校验
  const page = sanitizePage(searchParams.get("page"));
  const pageSize = sanitizePageSize(searchParams.get("pageSize"));

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      include: {
        userGroup: { select: { id: true, name: true, isAdmin: true, color: true, storageLimit: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      userGroupId: u.userGroupId,
      userGroup: u.userGroup,
      storageLimit: u.storageLimit,
      bio: u.bio,
      signature: u.signature,
      avatar: u.avatar,
      githubUsername: u.githubUsername,
      websiteUrl: u.websiteUrl,
      createdAt: u.createdAt,
      submissionCount: u._count.submissions,
    })),
    total,
    page,
    pageSize,
  });
}
