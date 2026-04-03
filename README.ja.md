<div align="center">

# 🧭 AI Tools Navigator

**フルスタック AI ツールナビ · 全栈 AI 工具导航站 · Full-Stack AI Tools Directory**

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](#技術スタック)
[![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#技術スタック)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#技術スタック)
[![Prisma 6](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](#技術スタック)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](#技術スタック)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](#技術スタック)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](#docker-デプロイ)

<br />

[English](README.en.md) · [中文](README.md) · **日本語**

<br />

<em>オールインワンの AI ツールディレクトリソリューション — セットアップから運用まで、すぐに使えます。</em>

</div>

---

## 📖 目次

- [概要](#概要)
- [ユースケース](#ユースケース)
- [機能一覧](#機能一覧)
- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [データモデル](#データモデル)
- [クイックスタート](#クイックスタート)
- [環境変数](#環境変数)
- [Docker デプロイ](#docker-デプロイ)
- [API リファレンス](#api-リファレンス)
- [運用フロー](#運用フロー)
- [セキュリティ](#セキュリティ)
- [FAQ](#faq)
- [License](#license)

---

## 概要

AI Tools Navigator は、AI ツールディレクトリサイトを構築するための**オープンソースのフルスタックテンプレート**です。公開カタログ、ユーザー投稿、管理画面での審査、カテゴリ管理、サイトブランディング、セキュリティ強化を 1 つのリポジトリに統合しています。

本プロジェクトは静的ページではありません — フロントエンドは API からカテゴリ・ツール・サイト設定を動的に取得し、管理画面で審査・公開・カテゴリ並び替え・ブランド設定・法務コンテンツを管理します。

### 主な特徴

- 🎨 **Apple スタイル UI** — 角丸カード、すりガラスナビバー、滑らかなアニメーション — 開封即プレミアムデザイン
- 📱 **レスポンシブデザイン** — モバイルから 4K まで完全対応、折りたたみ可能なサイドバー（ドラッグでリサイズ）
- 🔍 **インスタント検索** — ピンイン・キーワード検索対応、Command Palette（`Ctrl+K`）クイックアクセス
- 📊 **充実した管理画面** — ダッシュボード、審査センター、一括操作、Excel インポート / エクスポート
- 🛡️ **本番グレードセキュリティ** — JWT 認証、レート制限、XSS フィルタリング、Helmet ヘッダー、MIME 検証
- ☁️ **柔軟なストレージ** — ローカルアップロードまたは Alibaba Cloud OSS、環境変数で切り替え
- 🐳 **ワンクリックデプロイ** — Docker Compose + Nginx リバースプロキシ、本番環境対応

---

## ユースケース

- AI ツールナビ / リソースディレクトリ / プロダクト掲載サイト
- ユーザー投稿を受け付け、管理者が審査後に公開
- スポンサー優先 + 手動順位 + 閲覧数ベースの並び替え
- 非エンジニアがカテゴリ・ツール・サイト情報を管理

---

## 機能一覧

### 🌐 公開サイト

| 機能 | 説明 |
|------|------|
| カテゴリ閲覧 | トップページでカテゴリ / サブカテゴリ別にツールカードを表示、タブ切り替え対応 |
| 全ツール表示 | `/all-tools` で全ツールを一覧表示 |
| スマートソート | スポンサー優先 → 手動順位 → 閲覧数 |
| 検索 | ピンイン・キーワード検索対応、Command Palette（`Ctrl+K`） |
| ツール投稿 | `/submit` からロゴ付きでセルフ投稿可能 |
| スポンサー枠 | トップページ先頭の横スクロール推薦表示 |
| 会社概要 | `/about` — 管理画面から Markdown 編集、フロントエンドでリッチテキスト描画 |
| ビジネス提携 | `/partners` — 同様の Markdown 編集機能 |
| 利用規約 & プライバシー | `/terms`、`/privacy` — 管理画面から編集可能 |
| カスタマーサービス | フローティング QR コードウィジェット、管理画面から設定可能 |
| 遅延読み込み | ツールカード画像に `loading="lazy"` 適用 |
| コード分割 | Admin / Terms / Privacy を `React.lazy` でオンデマンド読み込み |

### 🔧 管理画面 `/admin`

| 機能 | 説明 |
|------|------|
| ダッシュボード | ツール数、審査待ち数、週間/月間新規、カテゴリ分布グラフ、TOP 10 |
| 審査センター | ユーザー投稿を確認、ワンクリックで公開フォームに読み込み |
| ツール管理 | CRUD + 一括スポンサー設定 / 一括削除 |
| 一括インポート | Excel テンプレートをダウンロード → 記入 → アップロードで一括登録 |
| 一括画像アップロード | 複数画像の同時アップロード対応 |
| カテゴリ管理 | 親子カテゴリの CRUD + ドラッグ並び替え |
| サイト設定 | 名前、ロゴ、ファビコン、背景色、タイトルフォントサイズ、フッター、法務テキスト |

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| **フロントエンド** | React 19, TypeScript 5, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| **バックエンド** | Express 4, Prisma 6, MySQL 8, Multer, jsonwebtoken |
| **セキュリティ** | helmet, express-rate-limit, xss, crypto (timingSafeEqual) |
| **チャート** | Recharts |
| **フォーム** | React Hook Form + Zod |
| **ファイルストレージ** | ローカルディスク / Alibaba Cloud OSS（オプション） |
| **Excel** | ExcelJS（テンプレートエクスポート）、XLSX（一括インポート解析） |
| **Markdown** | md-editor-rt（管理画面エディタ）、react-markdown + rehype-raw + DOMPurify（フロントエンド描画） |
| **デプロイ** | Docker, Nginx, Node.js 20 |

---

## ディレクトリ構成

```
ai-tools-navigator/
├── client/                         # フロントエンド (Vite + React)
│   ├── index.html                  # HTML エントリ
│   ├── public/
│   │   └── uploads/                # ローカルアップロードストレージ
│   └── src/
│       ├── App.tsx                  # ルーターエントリ (React.lazy コード分割)
│       ├── main.tsx                # React マウントポイント
│       ├── components/
│       │   ├── AppShell.tsx        # 永続シェル（サイドバーの再レンダリング回避）
│       │   ├── Layout.tsx          # メインレイアウト（サイドバー + トップバー + コンテンツ）
│       │   ├── Sidebar.tsx         # サイドバー（カテゴリナビ、折りたたみ、ドラッグリサイズ）
│       │   ├── ToolCard.tsx        # ツールカードコンポーネント
│       │   ├── ToolGrid.tsx        # ツールグリッドレイアウト
│       │   ├── CommandPalette.tsx   # Command Palette 検索パネル
│       │   ├── FloatingWidgets.tsx  # フローティング CS ウィジェット / トップへ戻る
│       │   ├── MarkdownEditor.tsx   # Markdown エディタラッパー
│       │   └── ui/                 # Radix ベースの UI コンポーネントライブラリ
│       ├── contexts/               # React Context
│       ├── hooks/                  # カスタム Hooks
│       ├── lib/                    # ユーティリティ + サイト設定キャッシュ
│       ├── pages/
│       │   ├── Home.tsx            # ホーム / 全ツール (デュアルモード)
│       │   ├── Admin.tsx           # 管理画面エントリ
│       │   ├── Submit.tsx          # ツール投稿ページ
│       │   ├── About.tsx           # 会社概要
│       │   ├── Partners.tsx        # ビジネス提携
│       │   ├── Terms.tsx           # 利用規約
│       │   ├── Privacy.tsx         # プライバシーポリシー
│       │   └── admin/              # 管理画面サブコンポーネント
│       │       ├── Dashboard.tsx   # 分析ダッシュボード
│       │       ├── PendingTools.tsx # 審査センター
│       │       ├── Tools.tsx       # ツール管理
│       │       ├── Categories.tsx  # カテゴリ管理
│       │       └── Settings.tsx    # サイト設定
│       └── types/                  # TypeScript 型定義
├── server/
│   └── index.ts                    # Express API + 全ルート
├── shared/
│   └── const.ts                    # 共有定数（フロントエンド + バックエンド）
├── prisma/
│   ├── schema.prisma               # データモデル + インデックス定義
│   └── migrations/                 # データベースマイグレーションファイル
├── scripts/
│   └── seed.ts                     # データ投入スクリプト
├── nginx/
│   └── default.conf                # Nginx リバースプロキシ + セキュリティヘッダー + キャッシュ戦略
├── Dockerfile                      # マルチステージビルド
├── docker-compose.yml              # Docker Compose オーケストレーション
├── vite.config.ts                  # Vite 設定
├── tsconfig.json                   # TypeScript 設定
└── package.json
```

---

## データモデル

| テーブル | 用途 | 主要フィールド |
|----------|------|----------------|
| **Tool** | 公開ツール | name, url, logo, description, categoryId, subCategoryId, tags (JSON), views, order, isSponsored, sponsorExpiry |
| **Category** | カテゴリ | name, parentId（階層構造）, icon, order |
| **PendingTool** | 審査待ち投稿 | name, url, logo, contactInfo, categoryId, subCategoryId, status |
| **SiteSetting** | グローバル設定 | name, logo, favicon, backgroundColor, titleFontSize, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText, aboutContent, partnersContent |

### インデックス戦略

```
Tool:         @@index([categoryId])
              @@index([subCategoryId])
              @@index([isSponsored, order, views])   -- ホームページソート用複合インデックス
              @@index([createdAt])

Category:     @@index([parentId])

PendingTool:  @@index([status])
              @@index([createdAt])
```

---

## クイックスタート

### 必要環境

| 依存関係 | 最低バージョン |
|----------|----------------|
| Node.js | >= 18 |
| pnpm | >= 8 |
| MySQL | >= 5.7 |

### 1. クローン & インストール

```bash
git clone https://github.com/your-org/ai-tools-navigator.git
cd ai-tools-navigator
pnpm install
```

### 2. 環境変数の設定

`.env` ファイルを作成（下記の [環境変数](#環境変数) を参照）：

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret-string"
PORT=3001
```

### 3. データベースの初期化

```bash
# Prisma Client を生成
pnpm prisma generate

# スキーマの即時同期（開発環境推奨）
pnpm prisma db push

# または既存マイグレーションを適用（本番環境推奨）
pnpm prisma migrate deploy
```

オプション — サンプルデータの投入：

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
pnpm exec tsc --noEmit       # TypeScript 型チェック（オプション）
```

---

## 環境変数

プロジェクトルートに `.env` ファイルを作成：

| 変数 | 必須 | 説明 | 例 |
|------|------|------|-----|
| `DATABASE_URL` | はい | MySQL 接続文字列 | `mysql://root:pass@localhost:3306/ai_tools` |
| `ADMIN_PASSWORD` | はい | 管理画面ログインパスワード | `my-strong-password-123` |
| `JWT_SECRET` | 推奨 | JWT 署名シークレット（未設定の場合、再起動ごとにランダム生成） | 下記の生成コマンドを参照 |
| `PORT` | いいえ | サーバーポート | `3001`（デフォルト） |
| `OSS_ACCESS_KEY_ID` | いいえ | Alibaba Cloud OSS Access Key ID | — |
| `OSS_ACCESS_KEY_SECRET` | いいえ | Alibaba Cloud OSS Access Key Secret | — |
| `OSS_BUCKET` | いいえ | Alibaba Cloud OSS バケット名 | `my-ai-tools` |
| `OSS_REGION` | いいえ | Alibaba Cloud OSS リージョン | `oss-cn-beijing`（デフォルト） |

> **ストレージについて**: OSS 環境変数が未設定の場合、アップロードファイルはローカルの `client/public/uploads/` に保存されます。設定すると自動的に OSS に切り替わります。

安全な JWT シークレットを生成：

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Docker デプロイ

プロジェクトにはマルチステージ Dockerfile と Docker Compose による完全な Docker サポートが含まれています。

### アーキテクチャ

```
┌──────────┐         ┌──────────────┐         ┌───────┐
│ クライアント│  :80 →  │    Nginx     │  :3001 → │ Node  │ → MySQL
│          │         │(プロキシ+キャッシュ)│      │ (API) │
└──────────┘         └──────────────┘         └───────┘
```

### ワンクリック起動

```bash
# .env が設定済みであること（DATABASE_URL がアクセス可能な MySQL を指していること）
docker compose up -d --build
```

### Nginx の特徴

- 🔒 セキュリティヘッダー（X-Frame-Options, CSP, X-Content-Type-Options 等）
- 📦 Gzip 圧縮
- ⏱️ 静的リソースの長期キャッシュ（Vite ハッシュ付き `/assets/` を 365 日キャッシュ）
- 🔄 Node.js バックエンドへのリバースプロキシ

---

## API リファレンス

### 公開エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| `GET` | `/api/settings` | サイト設定を取得 |
| `GET` | `/api/categories` | カテゴリツリーを取得 |
| `GET` | `/api/tools` | ツール一覧（オプションページネーション `?page=1&limit=50`） |
| `POST` | `/api/upload-public` | 公開画像アップロード（レート制限あり） |
| `POST` | `/api/submit-tool` | ツール投稿（レート制限あり） |

### 管理エンドポイント（JWT 必須）

全管理エンドポイントに必要なヘッダー：

```
Authorization: Bearer <jwt_token>
```

| メソッド | パス | 説明 |
|----------|------|------|
| `POST` | `/api/admin/login` | ログインして JWT トークンを取得 |
| `POST` | `/api/admin/upload` | 管理画像アップロード |
| `POST` | `/api/admin/upload-batch` | 一括画像アップロード（最大 100 枚） |
| `PUT` | `/api/admin/settings` | サイト設定の更新 |
| `GET` | `/api/admin/tools` | 全ツール取得 |
| `POST` | `/api/admin/tools` | ツール作成 |
| `PUT` | `/api/admin/tools/:id` | ツール更新 |
| `DELETE` | `/api/admin/tools/:id` | ツール削除 |
| `GET` | `/api/admin/tools/template` | Excel インポートテンプレートをダウンロード |
| `POST` | `/api/admin/tools/batch-import` | Excel から一括インポート |
| `GET` | `/api/admin/pending-tools` | 審査待ち一覧 |
| `DELETE` | `/api/admin/pending-tools/:id` | 審査待ち削除 |
| `POST` | `/api/admin/categories` | カテゴリ作成 |
| `PUT` | `/api/admin/categories/:id` | カテゴリ更新 |
| `DELETE` | `/api/admin/categories/:id` | カテゴリ削除（子カテゴリも含む） |
| `POST` | `/api/admin/categories/reorder` | カテゴリ並び替え |

---

## 運用フロー

```
┌─────────────────────────────────────────────┐
│  管理者がカテゴリとサイト設定を構成            │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  ユーザーが /submit でツールを投稿             │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  投稿が審査キュー (PendingTool) に入る        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  管理者が審査 → タグ/順位を設定 → 公開        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  公開サイトが自動ソート:                       │
│  スポンサー > 順位スコア > 閲覧数              │
└─────────────────────────────────────────────┘
```

---

## セキュリティ

| レイヤー | 対策 | 説明 |
|----------|------|------|
| **認証** | JWT トークン | 管理エンドポイントに有効なトークンが必須、24 時間有効 |
| **パスワード** | SHA-256 + timingSafeEqual | タイミング攻撃に耐性のあるパスワード比較 |
| **レート制限** | グローバル | IP あたり 15 分間 300 リクエストまで |
| | ログイン | IP あたり 15 分間 10 回まで |
| | 投稿 | IP あたり 1 時間 5 件まで |
| | 公開アップロード | IP あたり 15 分間 20 件まで |
| **入力** | XSS フィルタリング | 全書き込みエンドポイントで `xss()` によるサニタイズ |
| **アップロード** | MIME ホワイトリスト | `jpg/png/gif/webp/svg/ico` のみ許可 |
| | マジックバイト検証 | ファイルヘッダ検証による MIME スプーフィング防止 |
| | ファイル名ランダム化 | UUID ベースの命名でパストラバーサルと列挙攻撃を防止 |
| **HTTP** | Helmet | セキュリティヘッダー、サーバー情報を隠蔽 |
| | Nginx CSP | Content-Security-Policy の適用 |
| **エラー** | 安全な応答 | 500 エラーでスタックトレースや内部情報を漏洩しない |
| | グローバルハンドラー | Express エラーミドルウェアで未処理例外をキャッチ |

---

## FAQ

<details>
<summary><strong>Q: 管理者パスワードを変更するには？</strong></summary>

`.env` ファイルの `ADMIN_PASSWORD` を編集してサーバーを再起動してください。データベースの変更は不要です。

</details>

<details>
<summary><strong>Q: Alibaba Cloud OSS ストレージに切り替えるには？</strong></summary>

`.env` に `OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_BUCKET` を追加して再起動してください。コード変更は不要で、自動的に切り替わります。

</details>

<details>
<summary><strong>Q: データベースマイグレーションエラーの対処法は？</strong></summary>

```bash
# Prisma Client を再生成
pnpm prisma generate

# スキーマを強制同期（データが消えます — 開発環境のみ）
pnpm prisma db push --force-reset

# または新しいマイグレーションを作成
pnpm prisma migrate dev --name describe_your_change
```

</details>

<details>
<summary><strong>Q: 安全な JWT_SECRET を生成するには？</strong></summary>

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

</details>

<details>
<summary><strong>Q: Docker デプロイで MySQL に接続するには？</strong></summary>

MySQL がホストマシンで動作している場合、`DATABASE_URL` の `localhost` を `host.docker.internal` に置き換えてください：

```env
DATABASE_URL="mysql://root:pass@host.docker.internal:3306/ai_tools"
```

`docker-compose.yml` には `extra_hosts` マッピングが設定済みです。

</details>

<details>
<summary><strong>Q: アップロードした画像はどこに保存される？</strong></summary>

- **ローカルモード**（デフォルト）: `client/public/uploads/`
- **OSS モード**: 設定した Alibaba Cloud OSS バケットの `uploads/` パス配下

</details>

---

## License

[MIT](LICENSE)

---

<div align="center">
<sub>Built with ❤️ using React, Express, Prisma & Tailwind CSS</sub>
</div>
