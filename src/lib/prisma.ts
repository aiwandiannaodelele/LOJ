import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaD1 } from "@prisma/adapter-d1";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Cloudflare D1: 检测 wrangler D1 binding (env.DB)
  // OpenNext for Cloudflare 会将 binding 挂载到 process.env
  const d1 = process.env.DB as unknown;
  if (d1 && typeof d1 === "object" && "prepare" in (d1 as object)) {
    const adapter = new PrismaD1(d1 as any);
    return new PrismaClient({ adapter });
  }

  // 本地开发: Better-SQLite3
  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: "file:" + dbPath });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
