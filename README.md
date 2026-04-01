<div align="center">

# 🧭 AI Tools Navigator

**全栈 AI 工具导航站 · Full-Stack AI Tools Directory · フルスタック AI ツールナビ**

[![Stack](https://img.shields.io/badge/React_19-Vite_7-blue?style=flat-square)](#技术栈--tech-stack--技術スタック)
[![DB](https://img.shields.io/badge/Prisma_6-MySQL-orange?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)

[中文](#-中文文档) · [English](#-english-documentation) · [日本語](#-日本語ドキュメント)

</div>

---

# 🇨🇳 中文文档

## 项目简介

AI Tools Navigator 是一个开源的全栈 AI 工具导航站模板。它将前台展示、用户投稿、后台审核、分类管理、站点品牌配置、安全加固整合在同一个仓库中，适合快速搭建可持续运营的 AI 工具目录站。

本项目不是静态页面——前端通过 API 动态获取分类、工具和站点设置；后台管理审核投稿、发布工具、维护分类排序，并统一管理品牌信息与法律协议。

## 适用场景

- AI 工具导航站 / 资源目录站 / 产品收录站
- 需要开放用户投稿，运营人员审核上线
- 按赞助、权重、浏览量排序工具曝光位
- 非开发人员维护分类、工具和站点信息

## 功能一览

### 前台

| 功能 | 说明 |
|------|------|
| 分类浏览 | 首页按主分类 / 子分类组织工具卡片 |
| 全部工具 | `/all-tools` 独立展示所有工具 |
| 智能排序 | 赞助优先 → 手动排位分 → 浏览量 |
| 工具搜索 | 支持拼音 / 关键词搜索 |
| 工具投稿 | `/submit` 用户自助提交，含 Logo 上传 |
| 懒加载 | 工具卡片图片 `loading="lazy"` |
| 代码拆分 | Admin / Terms / Privacy 页面按需加载 |

### 管理后台 `/admin`

| 功能 | 说明 |
|------|------|
| 数据概览 | 工具总数、待审核、本周/月新增、分类分布、热门 TOP 10 |
| 审核中心 | 一键带入正式发布表单 |
| 工具管理 | 增删改查 + 批量赞助 / 批量删除 |
| 分类管理 | 主分类 / 子分类增删改 + 上下排序 |
| 站点设置 | 名称、Logo、Favicon、背景色、字号、页脚、协议 |

### 安全体系

| 措施 | 说明 |
|------|------|
| JWT 认证 | 登录返回 JWT Token，24h 有效期 |
| helmet | 安全响应头，隐藏服务器指纹 |
| 全局限流 | 每 IP 15 分钟最多 300 次请求 |
| 投稿限流 | 每 IP 1 小时最多 5 次 |
| 上传限流 | 公开上传每 IP 15 分钟最多 20 次 |
| MIME 白名单 | 仅允许 jpg/png/gif/webp/svg/ico |
| 文件名随机化 | UUID 命名，防止枚举遍历 |
| XSS 过滤 | 所有写入端点输入过滤 |
| 安全错误 | 500 错误不泄露堆栈信息 |
| 全局兜底 | Express 错误中间件捕获未处理异常 |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19, TypeScript, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| 后端 | Express 4, Prisma 6, MySQL, Multer, jsonwebtoken |
| 安全 | helmet, express-rate-limit, xss, crypto |
| 图表 | Recharts |
| 表单 | React Hook Form + Zod |

## 目录结构

```
.
├── client/                   # 前端 (Vite)
│   ├── public/uploads/       # 上传文件存储
│   └── src/
│       ├── components/       # 通用组件 + UI 库
│       ├── contexts/         # React Context
│       ├── hooks/            # 自定义 Hooks
│       ├── pages/            # 页面组件
│       │   └── admin/        # 后台子组件 (Dashboard/Pending/Tools/Categories/Settings)
│       ├── types/            # TypeScript 类型
│       └── App.tsx           # 路由入口 (React.lazy 代码拆分)
├── server/
│   └── index.ts              # Express API 服务 (JWT + 安全中间件)
├── prisma/
│   └── schema.prisma         # 数据模型 + 索引
├── scripts/
│   └── seed.ts               # 数据填充脚本
├── shared/
│   └── const.ts              # 前后端共享常量
└── vite.config.ts
```

## 数据模型

| 表 | 说明 |
|----|------|
| `Tool` | 正式工具 — 含 name, url, logo, categoryId, tags, views, order, isSponsored |
| `Category` | 分类 — 支持 parentId 父子关系，order 排序 |
| `PendingTool` | 待审核投稿 — 用户提交后等待管理员审核 |
| `SiteSetting` | 全局配置 — 站名、Logo、背景色、页脚、协议文本 (LongText) |

```
Tool:         @@index([categoryId]) @@index([subCategoryId]) @@index([isSponsored, order, views])
Category:     @@index([parentId])
```

## 快速开始

### 环境要求

- **Node.js** ≥ 18
- **pnpm**
- **MySQL**

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret-string"
PORT=3001
```

> 💡 生成 JWT_SECRET：`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

### 3. 初始化数据库

```bash
pnpm prisma generate
pnpm prisma db push        # 快速同步 schema
# 或
pnpm prisma migrate deploy  # 使用已有迁移
```

可选数据填充：

```bash
pnpm exec tsx scripts/seed.ts
```

### 4. 启动开发环境

```bash
pnpm dev
```

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 API | http://localhost:3001 |
| 管理后台 | http://localhost:3000/admin |

### 5. 生产构建

```bash
pnpm build                   # Vite 前端构建
pnpm exec tsc --noEmit       # TypeScript 类型检查
```

## API 参考

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/settings` | 读取站点配置 |
| GET | `/api/categories` | 读取分类树 |
| GET | `/api/tools` | 工具列表（可选分页 `?page=1&limit=50`） |
| POST | `/api/upload-public` | 公开图片上传（限流） |
| POST | `/api/submit-tool` | 提交工具到审核池（限流） |

### 管理接口（需 JWT）

所有管理接口需携带 Header：
```
Authorization: Bearer <jwt_token>
```

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 登录获取 JWT Token |
| POST | `/api/admin/upload` | 后台图片上传 |
| PUT | `/api/admin/settings` | 更新站点设置 |
| GET | `/api/admin/tools` | 读取全部工具 |
| POST | `/api/admin/tools` | 新增工具 |
| PUT | `/api/admin/tools/:id` | 编辑工具 |
| DELETE | `/api/admin/tools/:id` | 删除工具 |
| GET | `/api/admin/pending-tools` | 读取待审核列表 |
| DELETE | `/api/admin/pending-tools/:id` | 删除待审核记录 |
| POST | `/api/admin/categories` | 创建分类 |
| PUT | `/api/admin/categories/:id` | 编辑分类 |
| DELETE | `/api/admin/categories/:id` | 删除分类（含子分类） |
| POST | `/api/admin/categories/reorder` | 分类排序 |

## 运营流程

```
管理员配置分类 & 站点设置
        ↓
用户在 /submit 提交工具
        ↓
投稿进入审核池 (PendingTool)
        ↓
管理员审核 → 补充标签/排位分 → 发布
        ↓
前台自动按排序规则展示
```

## License

MIT

---

# 🇺🇸 English Documentation

## Overview

AI Tools Navigator is an open-source full-stack template for building AI tool directory websites. It integrates a public catalog, user submission workflow, admin review console, category management, site branding, and security hardening in a single repository.

This is not a static page — the frontend dynamically fetches categories, tools, and site settings via API; the admin console manages review, publishing, category ordering, branding, and legal content.

## Use Cases

- AI tool directories / resource catalogs / product listing sites
- Open user submissions with admin review before publishing
- Sponsored placement + manual ranking + view-based sorting
- Non-developers maintaining categories, tools, and site content

## Features

### Public Site

| Feature | Description |
|---------|-------------|
| Category Browsing | Home page organizes tool cards by category/subcategory |
| All Tools | Dedicated `/all-tools` view |
| Smart Sorting | Sponsored → manual order → view count |
| Search | Pinyin and keyword search support |
| Submissions | `/submit` with logo upload |
| Lazy Loading | Tool card images use `loading="lazy"` |
| Code Splitting | Admin/Terms/Privacy loaded on demand via React.lazy |

### Admin Console `/admin`

| Feature | Description |
|---------|-------------|
| Dashboard | Tool count, pending count, weekly/monthly growth, category distribution, Top 10 |
| Review Center | One-click import to publish form |
| Tool Management | Full CRUD + batch sponsor/delete |
| Category Management | Parent/child CRUD + drag-to-reorder |
| Site Settings | Name, logo, favicon, background color, font size, footer, legal text |

### Security

| Measure | Description |
|---------|-------------|
| JWT Auth | Login returns JWT token, 24h expiry |
| helmet | Security headers, hides server fingerprint |
| Global Rate Limit | 300 requests per IP per 15 minutes |
| Submit Rate Limit | 5 submissions per IP per hour |
| Upload Rate Limit | 20 public uploads per IP per 15 minutes |
| MIME Whitelist | Only jpg/png/gif/webp/svg/ico allowed |
| Random Filenames | UUID-based naming prevents enumeration |
| XSS Filtering | All write endpoints sanitized |
| Safe Errors | 500 responses never leak stack traces |
| Global Handler | Express error middleware catches unhandled exceptions |

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| Backend | Express 4, Prisma 6, MySQL, Multer, jsonwebtoken |
| Security | helmet, express-rate-limit, xss, crypto |
| Charts | Recharts |
| Forms | React Hook Form + Zod |

## Project Structure

```
.
├── client/                   # Frontend (Vite)
│   ├── public/uploads/       # Uploaded files
│   └── src/
│       ├── components/       # Shared components + UI library
│       ├── contexts/         # React Context
│       ├── hooks/            # Custom Hooks
│       ├── pages/            # Page components
│       │   └── admin/        # Admin sub-components (Dashboard/Pending/Tools/Categories/Settings)
│       ├── types/            # TypeScript types
│       └── App.tsx           # Router entry (React.lazy code splitting)
├── server/
│   └── index.ts              # Express API (JWT + security middleware)
├── prisma/
│   └── schema.prisma         # Data models + indexes
├── scripts/
│   └── seed.ts               # Database seed script
├── shared/
│   └── const.ts              # Shared constants
└── vite.config.ts
```

## Data Models

| Table | Description |
|-------|-------------|
| `Tool` | Published tools — name, url, logo, categoryId, tags, views, order, isSponsored |
| `Category` | Categories — parentId for hierarchy, order for sorting |
| `PendingTool` | Pending submissions — awaiting admin review |
| `SiteSetting` | Global config — site name, logo, background, footer, legal text (LongText) |

```
Tool:         @@index([categoryId]) @@index([subCategoryId]) @@index([isSponsored, order, views])
Category:     @@index([parentId])
```

## Quick Start

### Requirements

- **Node.js** ≥ 18
- **pnpm**
- **MySQL**

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env` file:

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret-string"
PORT=3001
```

> 💡 Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

### 3. Initialize Database

```bash
pnpm prisma generate
pnpm prisma db push        # Quick schema sync
# or
pnpm prisma migrate deploy  # Apply existing migrations
```

Optional seed data:

```bash
pnpm exec tsx scripts/seed.ts
```

### 4. Start Development

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Admin Console | http://localhost:3000/admin |

### 5. Production Build

```bash
pnpm build                   # Vite frontend build
pnpm exec tsc --noEmit       # TypeScript type check
```

## API Reference

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settings` | Fetch site settings |
| GET | `/api/categories` | Fetch category tree |
| GET | `/api/tools` | Tool list (optional pagination `?page=1&limit=50`) |
| POST | `/api/upload-public` | Public image upload (rate limited) |
| POST | `/api/submit-tool` | Submit tool for review (rate limited) |

### Admin Endpoints (JWT Required)

All admin endpoints require:
```
Authorization: Bearer <jwt_token>
```

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/login` | Login to get JWT token |
| POST | `/api/admin/upload` | Admin image upload |
| PUT | `/api/admin/settings` | Update site settings |
| GET | `/api/admin/tools` | List all tools |
| POST | `/api/admin/tools` | Create tool |
| PUT | `/api/admin/tools/:id` | Update tool |
| DELETE | `/api/admin/tools/:id` | Delete tool |
| GET | `/api/admin/pending-tools` | List pending submissions |
| DELETE | `/api/admin/pending-tools/:id` | Delete pending submission |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category (cascades children) |
| POST | `/api/admin/categories/reorder` | Reorder categories |

## Operations Workflow

```
Admin configures categories & site settings
        ↓
Users submit tools at /submit
        ↓
Submissions enter review queue (PendingTool)
        ↓
Admin reviews → adds tags/ranking → publishes
        ↓
Public site auto-renders by sort rules
```

## License

MIT

---

# 🇯🇵 日本語ドキュメント

## 概要

AI Tools Navigator は、AI ツールディレクトリサイトを構築するためのオープンソースのフルスタックテンプレートです。公開カタログ、ユーザー投稿フロー、管理画面での審査、カテゴリ管理、サイトブランディング、セキュリティ強化を 1 つのリポジトリに統合しています。

本プロジェクトは静的ページではありません。フロントエンドは API からカテゴリ・ツール・サイト設定を動的に取得し、管理画面で審査・公開・カテゴリ並び替え・ブランド設定・法務コンテンツを管理します。

## ユースケース

- AI ツールナビ / リソースディレクトリ / プロダクト掲載サイト
- ユーザー投稿を受け付け、管理者が審査後に公開
- スポンサー優先 + 手動順位 + 閲覧数ベースの並び替え
- 非エンジニアがカテゴリ・ツール・サイト情報を管理

## 機能一覧

### 公開サイト

| 機能 | 説明 |
|------|------|
| カテゴリ閲覧 | トップページでカテゴリ / サブカテゴリ別にツールカードを表示 |
| 全ツール表示 | `/all-tools` で全ツールを一覧表示 |
| スマートソート | スポンサー優先 → 手動順位 → 閲覧数 |
| 検索 | ピンイン・キーワード検索対応 |
| ツール投稿 | `/submit` からロゴ付きで投稿可能 |
| 遅延読み込み | ツールカード画像に `loading="lazy"` 適用 |
| コード分割 | Admin / Terms / Privacy を React.lazy でオンデマンド読み込み |

### 管理画面 `/admin`

| 機能 | 説明 |
|------|------|
| ダッシュボード | ツール数、審査待ち、週間/月間新規、カテゴリ分布、TOP 10 |
| 審査センター | ワンクリックで公開フォームに読み込み |
| ツール管理 | CRUD + 一括スポンサー設定 / 一括削除 |
| カテゴリ管理 | 親子カテゴリの CRUD + 並び替え |
| サイト設定 | 名前、ロゴ、ファビコン、背景色、フォントサイズ、フッター、法務テキスト |

### セキュリティ

| 対策 | 説明 |
|------|------|
| JWT 認証 | ログインで JWT トークンを発行、24 時間有効 |
| helmet | セキュリティヘッダー、サーバー情報を隠蔽 |
| グローバルレート制限 | IP あたり 15 分間 300 リクエストまで |
| 投稿レート制限 | IP あたり 1 時間 5 件まで |
| アップロードレート制限 | 公開アップロード IP あたり 15 分間 20 件まで |
| MIME ホワイトリスト | jpg/png/gif/webp/svg/ico のみ許可 |
| ファイル名ランダム化 | UUID ベースの命名で列挙攻撃を防止 |
| XSS フィルタリング | 全書き込みエンドポイントでサニタイズ |
| 安全なエラー応答 | 500 エラーでスタックトレースを漏洩しない |
| グローバルハンドラー | Express エラーミドルウェアで未処理例外をキャッチ |

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React 19, TypeScript, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| バックエンド | Express 4, Prisma 6, MySQL, Multer, jsonwebtoken |
| セキュリティ | helmet, express-rate-limit, xss, crypto |
| チャート | Recharts |
| フォーム | React Hook Form + Zod |

## ディレクトリ構成

```
.
├── client/                   # フロントエンド (Vite)
│   ├── public/uploads/       # アップロードファイル保存先
│   └── src/
│       ├── components/       # 共通コンポーネント + UI ライブラリ
│       ├── contexts/         # React Context
│       ├── hooks/            # カスタム Hooks
│       ├── pages/            # ページコンポーネント
│       │   └── admin/        # 管理画面サブコンポーネント (Dashboard/Pending/Tools/Categories/Settings)
│       ├── types/            # TypeScript 型定義
│       └── App.tsx           # ルーターエントリ (React.lazy コード分割)
├── server/
│   └── index.ts              # Express API (JWT + セキュリティミドルウェア)
├── prisma/
│   └── schema.prisma         # データモデル + インデックス
├── scripts/
│   └── seed.ts               # データ投入スクリプト
├── shared/
│   └── const.ts              # 共有定数
└── vite.config.ts
```

## データモデル

| テーブル | 説明 |
|----------|------|
| `Tool` | 公開ツール — name, url, logo, categoryId, tags, views, order, isSponsored |
| `Category` | カテゴリ — parentId で階層構造、order でソート |
| `PendingTool` | 審査待ち投稿 — 管理者の承認を待つ |
| `SiteSetting` | グローバル設定 — サイト名、ロゴ、背景色、フッター、法務テキスト (LongText) |

```
Tool:         @@index([categoryId]) @@index([subCategoryId]) @@index([isSponsored, order, views])
Category:     @@index([parentId])
```

## クイックスタート

### 必要環境

- **Node.js** ≥ 18
- **pnpm**
- **MySQL**

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env` ファイルを作成：

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret-string"
PORT=3001
```

> 💡 JWT_SECRET の生成：`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

### 3. データベースの初期化

```bash
pnpm prisma generate
pnpm prisma db push        # スキーマの即時同期
# または
pnpm prisma migrate deploy  # 既存マイグレーションの適用
```

サンプルデータの投入（任意）：

```bash
pnpm exec tsx scripts/seed.ts
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

| サービス | URL |
|----------|-----|
| フロントエンド | http://localhost:3000 |
| バックエンド API | http://localhost:3001 |
| 管理画面 | http://localhost:3000/admin |

### 5. 本番ビルド

```bash
pnpm build                   # Vite フロントエンドビルド
pnpm exec tsc --noEmit       # TypeScript 型チェック
```

## API リファレンス

### 公開エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/settings` | サイト設定を取得 |
| GET | `/api/categories` | カテゴリツリーを取得 |
| GET | `/api/tools` | ツール一覧（オプションページネーション `?page=1&limit=50`） |
| POST | `/api/upload-public` | 公開画像アップロード（レート制限あり） |
| POST | `/api/submit-tool` | ツール投稿（レート制限あり） |

### 管理エンドポイント（JWT 必須）

全管理エンドポイントに必要なヘッダー：
```
Authorization: Bearer <jwt_token>
```

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/api/admin/login` | ログインして JWT トークンを取得 |
| POST | `/api/admin/upload` | 管理画像アップロード |
| PUT | `/api/admin/settings` | サイト設定の更新 |
| GET | `/api/admin/tools` | 全ツール取得 |
| POST | `/api/admin/tools` | ツール作成 |
| PUT | `/api/admin/tools/:id` | ツール更新 |
| DELETE | `/api/admin/tools/:id` | ツール削除 |
| GET | `/api/admin/pending-tools` | 審査待ち一覧 |
| DELETE | `/api/admin/pending-tools/:id` | 審査待ち削除 |
| POST | `/api/admin/categories` | カテゴリ作成 |
| PUT | `/api/admin/categories/:id` | カテゴリ更新 |
| DELETE | `/api/admin/categories/:id` | カテゴリ削除（子カテゴリも含む） |
| POST | `/api/admin/categories/reorder` | カテゴリ並び替え |

## 運用フロー

```
管理者がカテゴリとサイト設定を構成
        ↓
ユーザーが /submit でツールを投稿
        ↓
投稿が審査キュー (PendingTool) に入る
        ↓
管理者が審査 → タグ/順位を設定 → 公開
        ↓
公開サイトがソートルールに従い自動表示
```

## License

MIT