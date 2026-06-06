import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ALLOWED_ROLES, containsHtml, MAX_NAME_LENGTH, MAX_BIO_LENGTH, MAX_SIGNATURE_LENGTH } from "@/lib/security";
import bcrypt from "bcryptjs";

const MAX_GITHUB_USERNAME_LENGTH = 39;
const MAX_AVATAR_LENGTH = 50000;
const SAFE_AVATAR_PATTERN = /^data:image\/(png|jpeg|webp|gif);base64,[a-zA-Z0-9+/=]+$/;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "无效的用户 ID" }, { status: 400 });
  }

  const body = (await request.json()) as {
    userGroupId?: number;
    storageLimit?: number | null;
    name?: string;
    bio?: string;
    signature?: string;
    avatar?: string;
    githubUsername?: string;
    websiteUrl?: string;
    password?: string;
  };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userGroup: true },
  });
  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  // 用户组更新
  if (body.userGroupId !== undefined) {
    const group = await prisma.userGroup.findUnique({
      where: { id: body.userGroupId },
    });
    if (!group) {
      return NextResponse.json({ error: "无效的用户组" }, { status: 400 });
    }
    // 防止移除最后一位管理员
    if (user.userGroup?.isAdmin && !group.isAdmin) {
      const adminCount = await prisma.user.count({
        where: { userGroup: { isAdmin: true } },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "不能移除最后一位管理员" }, { status: 400 });
      }
    }
    // 防止管理员降权自己
    if (user.id === parseInt(session.user.id) && !group.isAdmin) {
      return NextResponse.json({ error: "不能降权自己" }, { status: 400 });
    }
    updateData.userGroupId = body.userGroupId;
    updateData.role = group.isAdmin ? "admin" : "user";
  }

  // 自定义云盘容量
  if (body.storageLimit !== undefined) {
    if (body.storageLimit !== null && (typeof body.storageLimit !== "number" || body.storageLimit < 0)) {
      return NextResponse.json({ error: "容量限制无效" }, { status: 400 });
    }
    updateData.storageLimit = body.storageLimit;
  }

  // 昵称
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
    }
    if (body.name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: `昵称不能超过${MAX_NAME_LENGTH}个字符` }, { status: 400 });
    }
    if (containsHtml(body.name)) {
      return NextResponse.json({ error: "昵称不能包含HTML内容" }, { status: 400 });
    }
    updateData.name = body.name.trim();
  }

  // 简介
  if (body.bio !== undefined) {
    if (typeof body.bio === "string" && body.bio.length > MAX_BIO_LENGTH) {
      return NextResponse.json({ error: `简介不能超过${MAX_BIO_LENGTH}个字符` }, { status: 400 });
    }
    updateData.bio = body.bio;
  }

  // 签名
  if (body.signature !== undefined) {
    if (typeof body.signature === "string" && body.signature.length > MAX_SIGNATURE_LENGTH) {
      return NextResponse.json({ error: `签名不能超过${MAX_SIGNATURE_LENGTH}个字符` }, { status: 400 });
    }
    updateData.signature = body.signature;
  }

  // 头像
  if (body.avatar !== undefined) {
    if (typeof body.avatar !== "string") {
      return NextResponse.json({ error: "头像格式不正确" }, { status: 400 });
    }
    if (body.avatar !== "" && (body.avatar.length > MAX_AVATAR_LENGTH || !SAFE_AVATAR_PATTERN.test(body.avatar))) {
      return NextResponse.json({ error: "头像格式不合法或超出大小限制" }, { status: 400 });
    }
    updateData.avatar = body.avatar;
  }

  // GitHub 用户名
  if (body.githubUsername !== undefined) {
    if (typeof body.githubUsername !== "string") {
      return NextResponse.json({ error: "GitHub 用户名格式不正确" }, { status: 400 });
    }
    if (body.githubUsername.length > MAX_GITHUB_USERNAME_LENGTH) {
      return NextResponse.json({ error: `GitHub 用户名不能超过${MAX_GITHUB_USERNAME_LENGTH}个字符` }, { status: 400 });
    }
    updateData.githubUsername = body.githubUsername;
  }

  // 个人网站
  if (body.websiteUrl !== undefined) {
    if (body.websiteUrl !== "" && !body.websiteUrl.match(/^https?:\/\//)) {
      return NextResponse.json({ error: "网站 URL 格式不合法" }, { status: 400 });
    }
    updateData.websiteUrl = body.websiteUrl;
  }

  // 密码
  if (body.password !== undefined) {
    if (typeof body.password !== "string" || body.password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 个字符" }, { status: 400 });
    }
    updateData.password = await bcrypt.hash(body.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { userGroup: { select: { id: true, name: true, isAdmin: true, color: true, storageLimit: true } } },
  });

  return NextResponse.json(updated);
}
