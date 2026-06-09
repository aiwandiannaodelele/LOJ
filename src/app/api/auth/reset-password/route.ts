import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(request: Request) {
  const { email, token, password } = await request.json();

  // Step 1: 发送重置邮件
  if (email && !token) {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return NextResponse.json({ ok: true }); // 不泄露用户是否存在
    
    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
    await prisma.passwordReset.create({
      data: { userId: user.id, token: resetToken, expiresAt: new Date(Date.now() + 1000 * 60 * 30) },
    });

    const origin = request.headers.get("origin") || "";
    const link = `${origin}/reset-password?token=${resetToken}`;
    const sent = await sendEmail(user.email, "密码重置 - LOJ", 
      `<p>点击下方链接重置密码（30 分钟有效）：</p><a href="${link}">${link}</a>`);
    
    return NextResponse.json({ ok: true, sent: !!sent });
  }

  // Step 2: 重置密码
  if (token && password) {
    if (password.length < 6) return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.expiresAt < new Date()) return NextResponse.json({ error: "链接已过期" }, { status: 400 });
    
    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } });
    await prisma.passwordReset.delete({ where: { id: reset.id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "参数错误" }, { status: 400 });
}
