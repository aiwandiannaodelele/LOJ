import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getJudgeEngine } from "@/lib/judge";
import { getJudgeConfig } from "@/lib/judge-config";
import { auth } from "@/lib/auth";
import { validateCodeAndLanguage } from "@/lib/security";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { id, pid } = await params;
    const trainingId = parseInt(id);
    const trainingProblemId = parseInt(pid);
    const body = (await request.json()) as { code: string; language?: string };
    const { code, language = "cpp" } = body;

    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const validationError = validateCodeAndLanguage(code, language);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const userId = parseInt(session.user.id);

    // Check submit cooldown (shared across all submission types)
    const settings = await prisma.settings.findFirst();
    if (settings && settings.submitCooldown > 0) {
      const latest = await prisma.trainingSubmission.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (latest) {
        const secondsSince =
          (Date.now() - new Date(latest.createdAt).getTime()) / 1000;
        if (secondsSince < settings.submitCooldown) {
          return NextResponse.json(
            {
              error: `提交太频繁，请等待 ${Math.ceil(
                settings.submitCooldown - secondsSince
              )} 秒`,
            },
            { status: 429 }
          );
        }
      }
    }

    // Check hourly training submission limit
    if (settings && settings.maxSubmitsPerHour > 0) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const count = await prisma.trainingSubmission.count({
        where: { userId, createdAt: { gte: oneHourAgo } },
      });
      if (count >= settings.maxSubmitsPerHour) {
        return NextResponse.json(
          { error: "每小时提交次数已达上限" },
          { status: 429 }
        );
      }
    }

    const problem = await prisma.trainingProblem.findFirst({
      where: { id: trainingProblemId, trainingId },
    });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    let testCases: Array<{ input: string; output: string }>;
    try {
      testCases = JSON.parse(problem.testCases);
      if (!Array.isArray(testCases) || testCases.length === 0) {
        return NextResponse.json({ error: "No test cases configured" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "题目测试用例配置错误" }, { status: 500 });
    }

    const engine = getJudgeEngine(await getJudgeConfig());
    let finalStatus = "AC";
    let stdout = "";
    let stderr = "";
    let totalTime = 0;
    let maxMemory = 0;
    let passedCount = 0;
    let failedResult: { status: string; stdout: string; stderr: string } | null = null;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const result = await engine.submit(
        code,
        language,
        tc.input,
        tc.output,
        problem.timeLimit,
        problem.memoryLimit
      );
      totalTime += result.time;
      maxMemory = Math.max(maxMemory, result.memory);
      if (result.status === "AC") {
        passedCount++;
        stdout = result.stdout;
      } else if (!failedResult) {
        failedResult = { status: result.status, stdout: result.stdout, stderr: result.stderr };
      }
    }

    if (passedCount === testCases.length) {
      finalStatus = "AC";
      stdout = "All test cases passed!";
      stderr = "";
    } else if (passedCount > 0 && failedResult) {
      finalStatus = failedResult.status === "CE" ? "CE" : "PAC";
      stdout = "";
      stderr = failedResult.status === "CE" ? failedResult.stderr || "编译错误" : `通过了 ${passedCount}/${testCases.length} 个测试用例`;
    } else if (failedResult) {
      finalStatus = failedResult.status;
      stdout = "";
      if (finalStatus === "CE") stderr = failedResult.stderr || "编译错误";
      else if (finalStatus === "WA") stderr = "答案错误";
      else if (finalStatus === "RE") stderr = failedResult.stderr || "运行时错误";
      else if (finalStatus === "TLE") stderr = "运行超时";
      else if (finalStatus === "MLE") stderr = "内存超限";
      else stderr = failedResult.stderr || "";
    }

    const submission = await prisma.trainingSubmission.create({
      data: {
        trainingId,
        userId: parseInt(session.user.id),
        trainingProblemId,
        language,
        code,
        status: finalStatus,
        stdout,
        stderr,
        time: totalTime,
        memory: maxMemory,
      },
      select: {
        id: true,
        status: true,
        time: true,
        memory: true,
        createdAt: true,
      },
    });

    return NextResponse.json(submission);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
