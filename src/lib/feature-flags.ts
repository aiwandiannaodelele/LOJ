import prisma from "./prisma";

const cache = new Map<string, { value: boolean; timestamp: number }>();
const TTL = 30000; // 30s cache

async function getFeatureFlag(key: string): Promise<boolean> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < TTL) return cached.value;

  const settings = await prisma.settings.findFirst();
  const value = (settings as Record<string, unknown>)?.[key] === true;
  cache.set(key, { value, timestamp: Date.now() });
  return value;
}

export async function isTrainingEnabled() { return getFeatureFlag("trainingEnabled"); }
export async function isContestEnabled() { return getFeatureFlag("contestEnabled"); }
export async function isRankEnabled() { return getFeatureFlag("rankEnabled"); }
export async function isDiscussionEnabled() { return getFeatureFlag("discussionEnabled"); }
