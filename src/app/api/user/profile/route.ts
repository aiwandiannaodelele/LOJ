import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidUrl, containsHtml, MAX_NAME_LENGTH, MAX_BIO_LENGTH, MAX_SIGNATURE_LENGTH } from "@/lib/security";

const MAX_GITHUB_USERNAME_LENGTH = 39;
const MAX_AVATAR_LENGTH = 50000;
const SAFE_AVATAR_PATTERN = /^data:image\/(png|jpeg|webp|gif);base64,[a-zA-Z0-9+/=]+$/;

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      role: true,
      bio: true,
      signature: true,
      githubUsername: true,
      avatar: true,
      image: true,
      oauthAccounts: true,
      websiteUrl: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const body = await request.json();

  const { name, bio, signature, githubUsername, avatar, websiteUrl } = body;

  // 昵称校验
  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
  }
  if (name !== undefined && name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `昵称不能超过${MAX_NAME_LENGTH}个字符` }, { status: 400 });
  }
  if (name !== undefined && containsHtml(name)) {
    return NextResponse.json({ error: "昵称不能包含HTML内容" }, { status: 400 });
  }

  // 简介长度校验
  if (bio !== undefined && typeof bio === "string" && bio.length > MAX_BIO_LENGTH) {
    return NextResponse.json({ error: `简介不能超过${MAX_BIO_LENGTH}个字符` }, { status: 400 });
  }

  // 签名长度校验
  if (signature !== undefined && typeof signature === "string" && signature.length > MAX_SIGNATURE_LENGTH) {
    return NextResponse.json({ error: `签名不能超过${MAX_SIGNATURE_LENGTH}个字符` }, { status: 400 });
  }

  // GitHub 用户名校验
  if (githubUsername !== undefined) {
    if (typeof githubUsername !== "string") {
      return NextResponse.json({ error: "GitHub 用户名格式不正确" }, { status: 400 });
    }
    if (githubUsername.length > MAX_GITHUB_USERNAME_LENGTH) {
      return NextResponse.json({ error: `GitHub 用户名不能超过${MAX_GITHUB_USERNAME_LENGTH}个字符` }, { status: 400 });
    }
  }

  // 头像校验：仅允许空字符串或安全的 data URI
  if (avatar !== undefined) {
    if (typeof avatar !== "string") {
      return NextResponse.json({ error: "头像格式不正确" }, { status: 400 });
    }
    if (avatar !== "" && (avatar.length > MAX_AVATAR_LENGTH || !SAFE_AVATAR_PATTERN.test(avatar))) {
      return NextResponse.json({ error: "头像格式不合法或超出大小限制" }, { status: 400 });
    }
  }

  // CVE-9: URL 格式校验，防止 javascript: 协议注入
  if (websiteUrl !== undefined && websiteUrl !== "" && !isValidUrl(websiteUrl)) {
    return NextResponse.json({ error: "网站 URL 格式不合法" }, { status: 400 });
  }

  const updateData: Record<string, string> = {};
  if (name !== undefined) updateData.name = name.trim();
  if (bio !== undefined) updateData.bio = bio;
  if (signature !== undefined) updateData.signature = signature;
  if (githubUsername !== undefined) updateData.githubUsername = githubUsername;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      name: true,
      email: true,
      role: true,
      bio: true,
      signature: true,
      githubUsername: true,
      avatar: true,
      websiteUrl: true,
    },
  });

  return NextResponse.json(user);
}
