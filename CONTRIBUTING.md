# Contributing Guide

Welcome! Please read this before contributing.

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit changes (`git commit -m 'feat: add xxx'`)
4. Push to branch (`git push origin feat/your-feature`)
5. Open a Pull Request

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `chore:` | Build/config changes |
| `refactor:` | Code refactoring |
| `style:` | Formatting |

Example: `feat: add password reset`

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma 7 (SQLite / PostgreSQL)
- Tailwind CSS v4 + shadcn/ui
- NextAuth v5

## Local Development

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## PR Requirements

- Code passes `npm run build` and `npm run lint`
- New features must update `migrate.ts` for incremental migration
- Schema changes must update the Prisma model

## Feedback

Use [GitHub Discussions](https://github.com/aiwandiannaodelele/LOJ/discussions) or [Issues](https://github.com/aiwandiannaodelele/LOJ/issues).

<details>
<summary>🇨🇳 简体中文</summary>

## 贡献指南

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feat/your-feature`)
3. 提交更改 (`git commit -m 'feat: 添加xxx功能'`)
4. 推送到分支 (`git push origin feat/your-feature`)
5. 创建 Pull Request

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

| 前缀 | 用途 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `docs:` | 文档更新 |
| `chore:` | 杂项（依赖、配置等） |
| `refactor:` | 重构 |
| `style:` | 代码格式 |

### 技术栈

- Next.js 16 (App Router)
- TypeScript
- Prisma 7 (SQLite / PostgreSQL)
- Tailwind CSS v4 + shadcn/ui
- NextAuth v5

### 本地开发

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### PR 要求

- 代码通过 `npm run build` 和 `npm run lint`
- 新功能需同时更新 `migrate.ts` 增量迁移
- 涉及 Schema 变更时更新 Prisma 模型

</details>

<details>
<summary>🇭🇰 繁體中文</summary>

## 貢獻指南

### 如何貢獻

1. Fork 本倉庫
2. 創建特性分支 (`git checkout -b feat/your-feature`)
3. 提交更改 (`git commit -m 'feat: 添加xxx功能'`)
4. 推送到分支 (`git push origin feat/your-feature`)
5. 創建 Pull Request

### Commit 規範

| 前綴 | 用途 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | Bug 修復 |
| `docs:` | 文檔更新 |
| `chore:` | 雜項 |
| `refactor:` | 重構 |

### 技術棧

- Next.js 16 (App Router)
- TypeScript
- Prisma 7 (SQLite / PostgreSQL)
- Tailwind CSS v4 + shadcn/ui
- NextAuth v5

### 本地開發

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

</details>
