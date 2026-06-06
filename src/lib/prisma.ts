import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaD1 } from "@prisma/adapter-d1";
import path from "path";

function getD1Binding() {
  // Cloudflare Workers/Pages: D1 bindings are on env object, not process.env.
  // OpenNext may expose them via globalThis or process.env depending on version.
  const g = globalThis as Record<string, unknown>;
  if (g.DB && typeof g.DB === "object" && "prepare" in (g.DB as object)) return g.DB;
  return null;
}

function createPrismaClient() {
  const d1 = getD1Binding();
  if (d1) return new PrismaClient({ adapter: new PrismaD1(d1 as any) });

  const dbPath = path.join(process.cwd(), "dev.db");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: "file:" + dbPath }) });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
