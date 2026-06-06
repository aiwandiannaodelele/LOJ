import { NextResponse } from "next/server";
import { getAIConfig } from "@/lib/ai-config";

export async function GET() {
  const config = await getAIConfig();
  return NextResponse.json({
    model: config.model,
    enabled: config.enabled,
    models: config.models,
  });
}
