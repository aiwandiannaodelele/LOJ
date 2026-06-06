<div align="center">
  <img src="./public/logo.svg" alt="LOJ Logo" width="120" height="120" />
  <h1>LOJ</h1>
  <p><strong>Lightweight Online Judge — 轻量在线评测系统</strong></p>
  <p>
    <a href="#简体中文">简体中文</a> · <a href="#繁體中文">繁體中文</a> · <a href="#english">English</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/Prisma-7-2D3748" alt="Prisma 7" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4" alt="Tailwind v4" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  </p>
</div>

---

<a id="简体中文"></a>

# 🇨🇳 简体中文

## 📖 简介

**LOJ** 是一个现代化的在线评测（Online Judge）平台，使用 Next.js 16 构建。支持编程题目练习、比赛、训练题单、AI 智能助教以及多引擎代码执行评测。

### ✨ 特性

- **题目系统** — 创建和管理编程题目，支持多测试用例、自测样例、BlockNote 富文本编辑
- **比赛系统** — 支持 ACM / OI 赛制，实时排名，独立题目副本
- **训练题单** — 按主题组织题目，循序渐进的学习路径
- **AI 智能助教** — 集成 AI 对话，题目上下文感知的编程辅导
- **多引擎判题** — 可插拔评测引擎：OneCompiler（默认）、Judge0、Runoob
- **代码编辑器** — Monaco Editor（VS Code 内核）支持多语言语法高亮
- **用户系统** — NextAuth 认证，JWT Session，角色权限管理
- **管理后台** — 用户、题目、比赛、训练、设置、存储全管理
- **多存储支持** — 本地文件系统 / S3 兼容对象存储
- **安全加固** — 内置速率限制、权限校验、IP 伪造防护、SSRF 防护
- **国际化** — 支持简体中文、繁体中文、English

### 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/your-org/loj.git
cd loj

# 安装依赖
npm install

# 初始化数据库（SQLite）
npm run db:push
npm run db:seed

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

### 📦 命令参考

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (localhost:3000) |
| `npm run build` | 构建生产版本 |
| `npm run lint` | ESLint 代码检查 |
| `npm run db:push` | 同步数据库 Schema |
| `npm run db:seed` | 填充示例数据 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run cf:build` | Cloudflare Pages 构建 |
| `npm run cf:deploy` | Cloudflare 部署 |

### 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| **Next.js 16** | React 框架（App Router） |
| **Tailwind CSS v4** | 样式 |
| **shadcn/ui** | UI 组件库 |
| **Prisma 7** | ORM / 数据库 |
| **SQLite / D1** | 数据库（开发 / 生产） |
| **NextAuth v5** | 认证（凭证 + JWT） |
| **Monaco Editor** | 代码编辑器 |
| **BlockNote** | 富文本编辑器 |
| **OneCompiler / Judge0** | 评测引擎 |

### ☁️ 部署

详见 [Cloudflare Pages 部署文档](https://developers.cloudflare.com/pages/framework-guides/nextjs/) 和 `wrangler.toml`。

---

<a id="繁體中文"></a>

# 🇭🇰 繁體中文

## 📖 簡介

**LOJ** 是一個現代化的在線評測（Online Judge）平台，使用 Next.js 16 構建。支持編程題目練習、比賽、訓練題單、AI 智能助教以及多引擎代碼執行評測。

### ✨ 特性

- **題目系統** — 創建和管理編程題目，支持多測試用例、自測樣例、BlockNote 富文本編輯
- **比賽系統** — 支持 ACM / OI 賽制，實時排名，獨立題目副本
- **訓練題單** — 按主題組織題目，循序漸進的學習路徑
- **AI 智能助教** — 集成 AI 對話，題目上下文感知的編程輔導
- **多引擎判題** — 可插拔評測引擎：OneCompiler（默認）、Judge0、Runoob
- **代碼編輯器** — Monaco Editor（VS Code 內核）支持多語言語法高亮
- **用戶系統** — NextAuth 認證，JWT Session，角色權限管理
- **管理後臺** — 用戶、題目、比賽、訓練、設置、存儲全管理
- **多存儲支持** — 本地文件系統 / S3 兼容對象存儲
- **安全加固** — 內置速率限制、權限校驗、IP 偽造防護、SSRF 防護
- **國際化** — 支持简体中文、繁體中文、English

### 🚀 快速開始

```bash
# 克隆倉庫
git clone https://github.com/your-org/loj.git
cd loj

# 安裝依賴
npm install

# 初始化數據庫（SQLite）
npm run db:push
npm run db:seed

# 啟動開發服務器
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000) 即可訪問。

### 📦 命令參考

| 命令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發服務器 |
| `npm run build` | 構建生產版本 |
| `npm run lint` | ESLint 代碼檢查 |
| `npm run db:push` | 同步數據庫 Schema |
| `npm run db:seed` | 填充示例數據 |
| `npm run db:generate` | 生成 Prisma 客戶端 |
| `npm run cf:build` | Cloudflare Pages 構建 |
| `npm run cf:deploy` | Cloudflare 部署 |

---

<a id="english"></a>

# 🇬🇧 English

## 📖 Introduction

**LOJ** (Lightweight Online Judge) is a modern online judge platform built with Next.js 16. It supports programming problem solving, contests, training tracks, an AI teaching assistant, and multi-engine code execution evaluation.

### ✨ Features

- **Problem System** — Create and manage programming problems with multiple test cases, self-test samples, and BlockNote rich text editing
- **Contest System** — ACM / OI scoring modes, real-time rankings, independent problem copies
- **Training Tracks** — Themed problem sets for progressive learning paths
- **AI Assistant** — Integrated AI chat with problem-context-aware programming guidance
- **Multi-Engine Judging** — Pluggable evaluation engines: OneCompiler (default), Judge0, Runoob
- **Code Editor** — Monaco Editor (VS Code engine) with multi-language syntax highlighting
- **User System** — NextAuth authentication, JWT sessions, role-based access control
- **Admin Panel** — Full management for users, problems, contests, training, settings, storage
- **Storage Backends** — Local filesystem / S3-compatible object storage
- **Security Hardening** — Built-in rate limiting, permission validation, IP spoofing protection, SSRF protection
- **Internationalization** — 简体中文, 繁體中文, English

### 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/loj.git
cd loj

# Install dependencies
npm install

# Initialize database (SQLite)
npm run db:push
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

### 📦 Command Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Build for production |
| `npm run lint` | ESLint code check |
| `npm run db:push` | Push database schema |
| `npm run db:seed` | Seed sample data |
| `npm run db:generate` | Generate Prisma client |
| `npm run cf:build` | Cloudflare Pages build |
| `npm run cf:deploy` | Cloudflare deploy |

### 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework (App Router) |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui** | UI component library |
| **Prisma 7** | ORM / Database |
| **SQLite / D1** | Database (dev / production) |
| **NextAuth v5** | Authentication (credentials + JWT) |
| **Monaco Editor** | Code editor |
| **BlockNote** | Rich text editor |
| **OneCompiler / Judge0** | Judging engines |

### ☁️ Deployment

See [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/framework-guides/nextjs/) and `wrangler.toml` for details.

---

<div align="center">
  <sub>Built with ❤️ using Next.js 16, Tailwind CSS v4, and Prisma 7</sub>
</div>
