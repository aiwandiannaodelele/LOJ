import type { IJudgeEngine } from "./types";
import type { JudgeConfig } from "@/config/judge";
import { Judge0Engine } from "./judge0";
import { OneCompilerEngine } from "./onecompiler";
import { CustomJudgeEngine } from "./custom";

/**
 * 根据配置获取判题引擎实例
 * 支持预置引擎 + 自定义引擎（通过代码动态加载）
 */
export function getJudgeEngine(config: JudgeConfig): IJudgeEngine {
  switch (config.engine) {
    case "judge0":
      return new Judge0Engine(config);
    case "onecompiler":
      return new OneCompilerEngine(config);
    case "custom":
      return new CustomJudgeEngine(config);
    default:
      throw new Error(`Unknown judge engine: ${config.engine}`);
  }
}

export type { JudgeResult, JudgeStatus, IJudgeEngine } from "./types";
