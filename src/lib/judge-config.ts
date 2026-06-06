import prisma from "@/lib/prisma";
import type { JudgeConfig } from "@/config/judge";

/** 从数据库加载判题配置（回退到默认值） */
export async function getJudgeConfig(): Promise<JudgeConfig> {
  const settings = await prisma.settings.findFirst();

  const base: JudgeConfig = {
    engine: "onecompiler",
    judge0: {
      baseUrl: process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com",
      token: process.env.JUDGE0_TOKEN || "",
      languageId: 54,
      timeLimit: 5,
      memoryLimit: 256,
    },
    onecompiler: {
      endpoint: "https://onecompiler.com/api/code/exec",
      timeLimit: 5,
    },
  };

  if (!settings) return base;

  // 解析数据库中的 JSON 配置
  let dbConfig: Record<string, unknown> = {};
  try {
    dbConfig = JSON.parse(settings.judgeConfig || "{}");
  } catch {
    dbConfig = {};
  }

  return {
    engine: (settings.judgeEngine as JudgeConfig["engine"]) || base.engine,
    judge0: {
      baseUrl: (dbConfig.judge0 as Record<string, string>)?.baseUrl || base.judge0.baseUrl,
      token: (dbConfig.judge0 as Record<string, string>)?.token || base.judge0.token,
      languageId: (dbConfig.judge0 as Record<string, number>)?.languageId || base.judge0.languageId,
      timeLimit: (dbConfig.judge0 as Record<string, number>)?.timeLimit || base.judge0.timeLimit,
      memoryLimit: (dbConfig.judge0 as Record<string, number>)?.memoryLimit || base.judge0.memoryLimit,
    },
    onecompiler: {
      endpoint: (dbConfig.onecompiler as Record<string, string>)?.endpoint || base.onecompiler.endpoint,
      timeLimit: (dbConfig.onecompiler as Record<string, number>)?.timeLimit || base.onecompiler.timeLimit,
    },
    customCode: settings.judgeCustomCode || undefined,
  };
}
