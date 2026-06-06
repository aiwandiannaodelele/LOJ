import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

const passwordAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_PASSWORD_ATTEMPTS = 10;
const PASSWORD_LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

function extractIP(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (ips.length > 0 && /^[\d.:]+$/.test(ips[0])) return ips[0];
  }
  const realIp = headersList.get("x-real-ip");
  if (realIp && /^[\d.:]+$/.test(realIp)) return realIp;
  const cf = headersList.get("cf-connecting-ip");
  if (cf && /^[\d.:]+$/.test(cf)) return cf;
  return "unknown";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contestId = parseInt(id);
  if (isNaN(contestId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const headersList = await headers();
  const ip = extractIP(headersList);
  const attemptKey = `contest:${contestId}:${ip}`;

  // Rate limiting per IP per contest
  const attempt = passwordAttempts.get(attemptKey);
  if (attempt) {
    if (Date.now() - attempt.lastAttempt > PASSWORD_LOCKOUT_MS) {
      passwordAttempts.delete(attemptKey);
    } else if (attempt.count >= MAX_PASSWORD_ATTEMPTS) {
      return NextResponse.json({ error: "尝试次数过多，请10分钟后再试" }, { status: 429 });
    }
  }

  const body = (await request.json()) as { password: string };
  if (!body.password) return NextResponse.json({ error: "密码不能为空" }, { status: 400 });

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    select: { password: true },
  });

  if (!contest) return NextResponse.json({ error: "比赛不存在" }, { status: 404 });
  if (!contest.password) return NextResponse.json({ error: "该比赛不需要密码" }, { status: 400 });

  const valid = await bcrypt.compare(body.password, contest.password);
  if (!valid) {
    const current = passwordAttempts.get(attemptKey) || { count: 0, lastAttempt: 0 };
    passwordAttempts.set(attemptKey, { count: current.count + 1, lastAttempt: Date.now() });
    return NextResponse.json({ error: "密码错误" }, { status: 403 });
  }

  passwordAttempts.delete(attemptKey);
  return NextResponse.json({ success: true });
}
