import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migrate diff/studio) 使用此 URL 连接本地数据库做 schema 对比
    // Cloudflare D1 运行时连接走 @prisma/adapter-d1，不使用此 URL
    url: process.env["DATABASE_URL"] || "file:./dev.db",
  },
});
