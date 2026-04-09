<div align="center">

# AI Tools Navigator

**中文 / English / 日本語**

一个可运营的 AI 工具导航站全栈模板，内置前台展示、用户投稿、后台审核、分类管理、批量导入、图片上传、站点设置与 Docker 部署能力。

A production-ready full-stack template for building and operating an AI tools directory, with public pages, user submissions, admin review, category management, batch import, image upload, site settings, and Docker deployment included.

運用を前提とした AI ツールナビサイト向けのフルスタックテンプレートです。公開ページ、ユーザー投稿、管理画面での審査、カテゴリ管理、一括インポート、画像アップロード、サイト設定、Docker デプロイをまとめて備えています。

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](#tech-stack)
[![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#tech-stack)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#tech-stack)
[![Prisma 6](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](#tech-stack)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](#tech-stack)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](#deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)

[README.zh](README.md) · [README.en](README.en.md) · [README.ja](README.ja.md)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [License](#license)

---

## Project Overview

### 中文

`AI Tools Navigator` 是一套面向 AI 工具导航站的全栈项目模板。它不是单纯的静态展示页，而是包含完整运营闭环：前台工具展示、用户投稿、后台审核发布、分类管理、批量图片上传、Excel 批量导入、站点内容配置，以及 Docker 部署。

当前版本已经支持：

- 首页热门工具区与普通分类区分开展示
- 普通子分类区域默认最多显示 2 排卡片，可展开/收起
- 搜索框文案 `Ctrl+K 全局搜索`
- 同一工具可归属多个主分类/子分类
- 工具按 `名称 + 简介 + 标准化链接 + logo` 去重归并
- 后台工具管理只维护一条工具主体记录
- Excel 导入与图片上传逻辑已兼容 OSS 场景

### English

`AI Tools Navigator` is a full-stack template for AI tools directory websites. It goes beyond a static catalog and includes a complete operations workflow: public tool listing, user submissions, admin review and publishing, category management, batch image upload, Excel import, site content settings, and Docker deployment.

Current highlights include:

- A separate featured tools section on the homepage
- Standard category sections that show up to 2 rows by default, with expand/collapse
- Search placeholder text set to `Ctrl+K 全局搜索`
- One tool can belong to multiple main/subcategory combinations
- Canonical deduplication based on `name + description + normalized URL + logo`
- A single canonical tool record in admin management
- OSS-friendly image upload and Excel import flow

### 日本語

`AI Tools Navigator` は AI ツールナビサイト向けのフルスタックテンプレートです。単なる静的カタログではなく、公開側のツール表示、ユーザー投稿、管理画面での審査と公開、カテゴリ管理、画像の一括アップロード、Excel 一括インポート、サイト内容設定、Docker デプロイまで含んだ運用向け構成になっています。

主な対応内容:

- ホーム上部の注目ツールエリアを独立表示
- 通常カテゴリは初期状態で 2 行まで表示し、展開・折りたたみに対応
- 検索ボックス文言は `Ctrl+K 全局搜索`
- 1 つのツールを複数カテゴリに所属可能
- `name + description + 正規化URL + logo` で重複統合
- 管理画面では canonical な 1 件として管理
- OSS を含む画像アップロードと Excel インポートに対応

---

## Core Features

### 中文

- 前台首页分类浏览、全部工具页、快捷搜索面板
- 用户投稿工具并进入后台待审核队列
- 后台工具新增、编辑、删除、热门设置、分类维护
- 支持一个工具挂载多个分类，前台与后台自动同步
- Excel 模板批量导入工具
- OSS 或本地图片上传
- 关于我们、商务合作、服务条款、隐私政策后台可编辑
- Docker + Compose 部署

### English

- Public homepage with category navigation, all-tools page, and command palette search
- User submission flow with admin review queue
- Admin CRUD for tools, featured status, and categories
- Multi-category assignment per tool with automatic frontend/backend sync
- Excel template based batch import
- Local or OSS-based image upload
- Editable About, Partners, Terms, and Privacy pages from admin
- Docker + Compose deployment support

### 日本語

- 公開ホーム、全ツール一覧、コマンドパレット検索
- ユーザー投稿と管理画面での審査フロー
- ツールの追加・編集・削除・注目設定・カテゴリ管理
- 1 ツール複数カテゴリ対応と公開側/管理側の自動同期
- Excel テンプレートによる一括インポート
- ローカルまたは OSS への画像アップロード
- About / Partners / Terms / Privacy の管理画面編集
- Docker + Compose によるデプロイ対応

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript 5, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| Backend | Express 4, Prisma 6, MySQL 8, Multer, jsonwebtoken |
| Security | helmet, express-rate-limit, xss |
| Content | md-editor-rt, react-markdown, rehype-raw, DOMPurify |
| File Storage | Local uploads or Alibaba Cloud OSS |
| Data Import | ExcelJS, XLSX |
| Deployment | Docker, Docker Compose, Nginx, Node.js 20 |

---

## Project Structure

```text
ai-tools-navigator/
├─ client/                  # Frontend
│  ├─ public/
│  │  └─ uploads/           # Local fallback upload directory
│  └─ src/
│     ├─ components/        # Shared UI components
│     ├─ pages/             # Public pages and admin entry
│     ├─ lib/               # Utilities and settings helpers
│     └─ types/             # TypeScript types
├─ server/
│  └─ index.ts              # Express API server
├─ prisma/
│  ├─ schema.prisma         # Prisma schema
│  └─ migrations/           # SQL migrations
├─ nginx/                   # Nginx config
├─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

---

## Quick Start

### 1. Install

```bash
pnpm install
```

### 2. Configure `.env`

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret"
PORT=3001
NODE_ENV=development
```

If you use Alibaba Cloud OSS, also configure:

```env
OSS_REGION=oss-cn-beijing
OSS_ACCESS_KEY_ID=your-key-id
OSS_ACCESS_KEY_SECRET=your-key-secret
OSS_BUCKET=your-bucket
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Start Development

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Admin: `http://localhost:3000/admin`

### 5. Build

```bash
npm run build
```

---

## Environment Variables

### 中文

生产环境至少要配置：

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV=production`

如果未配置 OSS，图片会自动回退到本地 `client/public/uploads/`。

### English

At minimum, production should define:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV=production`

If OSS is not configured, uploads fall back to `client/public/uploads/`.

### 日本語

本番環境では最低限以下を設定してください。

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV=production`

OSS 未設定時は `client/public/uploads/` にフォールバック保存されます。

---

## Deployment

### Docker

```bash
docker compose up -d --build
```

### Production Notes

#### 中文

- 生产环境必须配置 `ADMIN_PASSWORD` 与 `JWT_SECRET`
- 生产环境必须使用 `NODE_ENV=production`
- 建议先备份数据库，再执行部署脚本
- 如果依赖本地上传兜底目录，请确认容器持久化策略

#### English

- `ADMIN_PASSWORD` and `JWT_SECRET` are required in production
- `NODE_ENV` must be `production`
- Back up the database before deployment
- If you rely on local upload fallback, make sure storage is persisted

#### 日本語

- 本番では `ADMIN_PASSWORD` と `JWT_SECRET` が必須です
- `NODE_ENV=production` を設定してください
- デプロイ前に DB バックアップを推奨します
- ローカル保存を使う場合は永続化設定を確認してください

---

## Security Notes

### 中文

- 后台接口基于 JWT 鉴权
- 登录、投稿、公开上传均有限流
- 文本输入经过 XSS 过滤
- 当前已禁用 SVG 上传，降低图片上传攻击面
- 生产环境缺少关键密钥时会拒绝启动

### English

- Admin APIs are protected with JWT
- Login, submission, and public upload endpoints are rate-limited
- Text inputs are sanitized against XSS
- SVG upload is disabled to reduce upload attack surface
- Production startup fails fast if critical secrets are missing

### 日本語

- 管理 API は JWT で保護されています
- ログイン、投稿、公開アップロードにはレート制限があります
- テキスト入力は XSS 対策済みです
- SVG アップロードは無効化済みです
- 本番で重要な秘密情報が欠けている場合は起動を拒否します

---

## License

MIT

---

<div align="center">
Built with React, Express, Prisma, MySQL, and Tailwind CSS.
</div>
