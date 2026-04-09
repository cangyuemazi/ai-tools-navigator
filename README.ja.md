<div align="center">

# AI Tools Navigator

**日本語 / 中文 / English**

運用を前提とした AI ツールナビサイト向けのフルスタックテンプレートです。公開ページ、ユーザー投稿、管理画面での審査、カテゴリ管理、一括インポート、画像アップロード、サイト設定、Docker デプロイをまとめて備えています。

[README.zh](README.md) · [README.en](README.en.md) · [README.ja](README.ja.md)

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](#tech-stack)
[![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#tech-stack)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#tech-stack)
[![Prisma 6](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](#tech-stack)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](#tech-stack)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](#deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)

</div>

---

## 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [プロジェクト構成](#プロジェクト構成)
- [クイックスタート](#クイックスタート)
- [環境変数](#環境変数)
- [デプロイ](#デプロイ)
- [セキュリティ](#セキュリティ)
- [License](#license)

---

## 概要

`AI Tools Navigator` は AI ツールナビサイト向けのフルスタックテンプレートです。単なる静的カタログではなく、公開側のツール表示、ユーザー投稿、管理画面での審査と公開、カテゴリ管理、画像の一括アップロード、Excel 一括インポート、サイト内容設定、Docker デプロイまで含んだ運用向け構成になっています。

現在の主な対応内容:

- ホーム上部の注目ツールエリアを独立表示
- 通常カテゴリは初期状態で 2 行まで表示し、展開・折りたたみに対応
- 検索ボックス文言は `Ctrl+K 全局搜索`
- 1 つのツールを複数カテゴリに所属可能
- `name + description + 正規化URL + logo` で重複統合
- 管理画面では canonical な 1 件として管理
- OSS を含む画像アップロードと Excel インポートに対応

---

## 主な機能

- 公開ホーム、全ツール一覧、コマンドパレット検索
- ユーザー投稿と管理画面での審査フロー
- ツールの追加・編集・削除・注目設定・カテゴリ管理
- 1 ツール複数カテゴリ対応と公開側/管理側の自動同期
- Excel テンプレートによる一括インポート
- ローカルまたは OSS への画像アップロード
- About / Partners / Terms / Privacy の管理画面編集
- Docker + Compose によるデプロイ対応

---

## 技術スタック

| レイヤー | スタック |
|---|---|
| Frontend | React 19, TypeScript 5, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| Backend | Express 4, Prisma 6, MySQL 8, Multer, jsonwebtoken |
| Security | helmet, express-rate-limit, xss |
| Content | md-editor-rt, react-markdown, rehype-raw, DOMPurify |
| File Storage | ローカルアップロード または Alibaba Cloud OSS |
| Data Import | ExcelJS, XLSX |
| Deployment | Docker, Docker Compose, Nginx, Node.js 20 |

---

## プロジェクト構成

```text
ai-tools-navigator/
├─ client/                  # Frontend
│  ├─ public/
│  │  └─ uploads/           # ローカルのフォールバック保存先
│  └─ src/
│     ├─ components/        # 共通 UI コンポーネント
│     ├─ pages/             # 公開ページと管理画面入口
│     ├─ lib/               # ユーティリティと設定関連
│     └─ types/             # TypeScript 型定義
├─ server/
│  └─ index.ts              # Express API server
├─ prisma/
│  ├─ schema.prisma         # Prisma schema
│  └─ migrations/           # SQL migrations
├─ nginx/                   # Nginx config
├─ Dockerfile
├─ docker-compose.yml
└─ README.ja.md
```

---

## クイックスタート

### 1. インストール

```bash
pnpm install
```

### 2. `.env` を設定

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret"
PORT=3001
NODE_ENV=development
```

Alibaba Cloud OSS を使う場合は以下も設定してください。

```env
OSS_REGION=oss-cn-beijing
OSS_ACCESS_KEY_ID=your-key-id
OSS_ACCESS_KEY_SECRET=your-key-secret
OSS_BUCKET=your-bucket
```

### 3. Prisma Client を生成

```bash
npx prisma generate
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Admin: `http://localhost:3000/admin`

### 5. ビルド

```bash
npm run build
```

---

## 環境変数

本番環境では最低限以下を設定してください。

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV=production`

OSS 未設定時は `client/public/uploads/` にフォールバック保存されます。

---

## デプロイ

### Docker

```bash
docker compose up -d --build
```

### 本番メモ

- 本番では `ADMIN_PASSWORD` と `JWT_SECRET` が必須です
- `NODE_ENV=production` を設定してください
- デプロイ前に DB バックアップを推奨します
- ローカル保存を使う場合は永続化設定を確認してください

---

## セキュリティ

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
