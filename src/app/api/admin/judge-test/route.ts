import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getJudgeEngine } from "@/lib/judge";
import type { JudgeConfig } from "@/config/judge";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      engine?: string;
      config?: string;
      customCode?: string;
    };
    const judgeConfig: JudgeConfig = {
      engine: (body.engine as JudgeConfig["engine"]) || "onecompiler",
      judge0: {
        baseUrl: "https://judge0-ce.p.rapidapi.com",
        token: "",
        languageId: 54,
        timeLimit: 5,
        memoryLimit: 256,
      },
      onecompiler: {
        endpoint: "https://onecompiler.com/api/code/exec",
        timeLimit: 5,
      },
    };

    // 解析用户配置
    if (body.config) {
      try {
        const cfg = JSON.parse(body.config);
        if (cfg.judge0) Object.assign(judgeConfig.judge0, cfg.judge0);
        if (cfg.onecompiler) Object.assign(judgeConfig.onecompiler, cfg.onecompiler);
      } catch { /* 忽略解析错误 */ }
    }

    if (body.engine === "custom" && body.customCode) {
      judgeConfig.customCode = body.customCode;
    }

    const engine = getJudgeEngine(judgeConfig);

    // 用一段简单代码测试
    const result = await engine.run(
      "#include <iostream>\nint main() { std::cout << \"Hello\"; return 0; }",
      "cpp",
      "",
      5,
      256
    );

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "测试失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
