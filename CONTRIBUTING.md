# 贡献指南

欢迎为 LOJ 贡献代码！请先阅读以下指引。

## 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feat/your-feature`)
3. 提交更改 (`git commit -m 'feat: 添加xxx功能'`)
4. 推送到分支 (`git push origin feat/your-feature`)
5. 创建 Pull Request

## Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

| 前缀 | 用途 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `docs:` | 文档更新 |
| `chore:` | 杂项（依赖、配置等） |
| `refactor:` | 重构 |
| `style:` | 代码格式（不影响功能） |

示例：`feat: 添加密码重置功能`

## 技术栈

- Next.js 16 (App Router)
- TypeScript
- Prisma 7 (SQLite / PostgreSQL)
- Tailwind CSS v4 + shadcn/ui
- NextAuth v5

## 本地开发

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Pull Request 要求

- 代码通过 `npm run build` 和 `npm run lint`
- 新功能需同时更新 `migrate.ts` 增量迁移
- 涉及 Schema 变更时更新 Prisma 模型

## 问题反馈

使用 [GitHub Discussions](https://github.com/aiwandiannaodelele/LOJ/discussions) 或 [Issues](https://github.com/aiwandiannaodelele/LOJ/issues)。
