import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 本地 SQLite | Supabase PostgreSQL | Turso — 由 DATABASE_URL 决定
    url: process.env["DATABASE_URL"] || "file:./dev.db",
  },
});
