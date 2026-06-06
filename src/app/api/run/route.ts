import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getJudgeEngine } from "@/lib/judge";
import { getJudgeConfig } from "@/lib/judge-config";
import { auth } from "@/lib/auth";
import { validateCodeAndLanguage } from "@/lib/security";

// 运行操作独立限频（内存 Map）
const runCooldowns = new Map<number, { lastRun: number }>();

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      problemId?: number;
      code: string;
      language?: string;
      stdin?: string;
      expectedOutput?: string;
      timeLimit?: number;
      memoryLimit?: number;
    };

    const { problemId, code, language = "cpp", stdin, expectedOutput, timeLimit, memoryLimit } = body;

    if (!code) {
      return NextResponse.json(
        { error: "code is required" },
        { status: 400 }
      );
    }

    // CVE-11 + CVE-12: 代码长度限制 + 语言白名单
    const validationError = validateCodeAndLanguage(code, language);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // stdin 长度限制
    if (stdin && stdin.length > 65536) {
      return NextResponse.json({ error: "输入数据过长" }, { status: 400 });
    }

    // timeLimit/memoryLimit upper bound
    const MAX_RUN_TIME = 30; // 30 seconds max
    const MAX_RUN_MEMORY = 1024; // 1GB max
    if (timeLimit !== undefined && (timeLimit < 0 || timeLimit > MAX_RUN_TIME)) {
      return NextResponse.json({ error: `时间限制超出范围（最大${MAX_RUN_TIME}秒）` }, { status: 400 });
    }
    if (memoryLimit !== undefined && (memoryLimit < 0 || memoryLimit > MAX_RUN_MEMORY)) {
      return NextResponse.json({ error: `内存限制超出范围（最大${MAX_RUN_MEMORY}MB）` }, { status: 400 });
    }

    const settings = await prisma.settings.findFirst();
    const userId = parseInt(session.user.id);

    // 使用独立运行冷却（而非查 submission 表）
    if (settings && settings.runCooldown > 0) {
      const runRecord = runCooldowns.get(userId);
      if (runRecord) {
        const secondsSince = (Date.now() - runRecord.lastRun) / 1000;
        if (secondsSince < settings.runCooldown) {
          return NextResponse.json(
            {
              error: `自测太频繁，请等待 ${Math.ceil(
                settings.runCooldown - secondsSince
              )} 秒`,
            },
            { status: 429 }
          );
        }
      }
    }

    let tl = timeLimit;
    let ml = memoryLimit;
    let sampleInput = "";

    if (!tl || !ml) {
      if (!problemId) {
        return NextResponse.json(
          { error: "problemId or timeLimit/memoryLimit is required" },
          { status: 400 }
        );
      }
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
      });
      if (!problem) {
        return NextResponse.json(
          { error: "Problem not found" },
          { status: 404 }
        );
      }
      tl = problem.timeLimit;
      ml = problem.memoryLimit;
      sampleInput = problem.sampleInput;
    }

    // 记录运行时间（在执行前记录，避免判题时间影响冷却精度）
    runCooldowns.set(userId, { lastRun: Date.now() });

    const engine = getJudgeEngine(await getJudgeConfig());

    const result = await engine.run(
      code,
      language,
      stdin ?? sampleInput,
      tl,
      ml
    );

    // If expectedOutput provided, compare stdout with expected output
    if (expectedOutput && result.status === "AC") {
      const normalizedOutput = result.stdout.replace(/\r\n/g, "\n").trim();
      const normalizedExpected = expectedOutput.trim().replace(/\r\n/g, "\n");
      if (normalizedOutput !== normalizedExpected) {
        return NextResponse.json({
          status: "WA",
          stdout: result.stdout,
          stderr: `Expected:\n${normalizedExpected}\n\nGot:\n${normalizedOutput}`,
          time: result.time,
          memory: result.memory,
        });
      }
      return NextResponse.json({
        status: "AC",
        stdout: result.stdout,
        stderr: "",
        time: result.time,
        memory: result.memory,
      });
    }

    return NextResponse.json({
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      time: result.time,
      memory: result.memory,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
