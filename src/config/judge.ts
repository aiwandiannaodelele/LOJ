/**
 * 判题引擎配置
 * 修改 engine 字段即可切换判题引擎，上层业务代码无需任何修改
 */

export type JudgeEngineType = "onecompiler" | "judge0" | "custom";

export interface Judge0Config {
  baseUrl: string;
  token: string;
  languageId: number;
  timeLimit: number;
  memoryLimit: number;
}

export interface OneCompilerConfig {
  endpoint: string;
  timeLimit: number;
}

export interface JudgeConfig {
  engine: JudgeEngineType | "custom";
  judge0: Judge0Config;
  onecompiler: OneCompilerConfig;
  customCode?: string;
}

const judgeConfig: JudgeConfig = {
  // ===== 切换判题引擎：修改此处 =====
  engine: "onecompiler", // "onecompiler" | "judge0"

  judge0: {
    baseUrl: process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com",
    token: process.env.JUDGE0_TOKEN || "",
    languageId: 54, // C++ (GCC 9.2.0)
    timeLimit: 5,
    memoryLimit: 256,
  },

  onecompiler: {
    endpoint: "https://onecompiler.com/api/code/exec",
    timeLimit: 5,
  },
};

export default judgeConfig;
