import prisma from "./prisma";

export interface AIModelItem {
  id: string;
  name: string;
  icon: string;
}

export async function getAIConfig() {
  const envKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || "";
  const envBase = process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL || "";
  const envModel = process.env.AI_MODEL || "";

  if (envKey) {
    return {
      enabled: true,
      apiKey: envKey,
      baseURL: envBase || "https://api.openai.com/v1",
      model: envModel || "gpt-4o-mini",
      models: [] as AIModelItem[],
    };
  }

  const settings = await prisma.settings.findFirst();
  const dbKey = settings?.aiApiKey || "";
  let models: AIModelItem[] = [];
  if (settings?.aiModels) {
    try {
      models = JSON.parse(settings.aiModels);
    } catch { /* ignore */ }
  }

  return {
    enabled: Boolean(dbKey),
    apiKey: dbKey,
    baseURL: settings?.aiBaseUrl || "https://api.openai.com/v1",
    model: models.length > 0 ? models[0].id : "gpt-4o-mini",
    models,
  };
}
