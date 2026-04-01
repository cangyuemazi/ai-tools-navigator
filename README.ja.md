# AI Tools Navigator

言語: [中文](./README.zh-CN.md) | [English](./README.en.md) | [日本語](./README.ja.md)

## 概要

AI Tools Navigator は、AI ツールのディレクトリサイトを構築するためのフルスタックテンプレートです。公開向けの一覧サイト、ユーザー投稿フロー、管理画面での審査、カテゴリ管理、サイト全体のブランド設定、Prisma ベースのデータ管理を 1 つのリポジトリにまとめています。

現在の実装は単なる静的ページではありません。フロントエンドは API からカテゴリ、ツール、サイト設定を取得し、管理画面は公開承認、並び順、法務テキスト、ブランド設定を管理します。

## 現在の実装でできること

### 公開サイト

- カテゴリ別にツールを閲覧できるトップページ
- `/all-tools` の全ツール表示ページ
- スポンサー状態、手動の並び順、閲覧数に基づくツールソート
- `order` フィールドで制御されるカテゴリ表示順
- 管理画面以外では永続的なシェル構成を使い、画面遷移時の状態が安定

### 投稿フロー

- `/submit` から一般ユーザーがツールを投稿可能
- 公開アップロード API を使ったロゴ画像アップロード
- ロゴ、名前、説明、URL、連絡先、カテゴリ、サブカテゴリを投稿可能
- 投稿データは `PendingTool` に保存され、管理者承認後に公開
- 投稿 API には厳しめのレート制限あり

### 管理画面

- 管理画面の入口は `/admin`
- `ADMIN_PASSWORD` を使った Bearer 認証
- ツール数、審査待ち数、最近の追加数、カテゴリ分布、人気ツールを表示するダッシュボード
- 審査待ち投稿の確認と公開フロー
- ツールの作成、更新、削除
- カテゴリの作成、更新、削除
- 親カテゴリおよび同一親配下のサブカテゴリ並び替え
- サイト名、ロゴ、Favicon、タイトル文字サイズ、背景色、フッター情報、利用規約、プライバシーポリシーの編集

### バックエンド保護

- `helmet` によるセキュリティヘッダー
- API 全体のレート制限
- 投稿 API の追加レート制限
- 投稿内容に対する基本的な `xss` サニタイズ
- アップロード容量は 5MB まで

## ルート

### 公開ルート

- `/`
- `/all-tools`
- `/submit`
- `/about`
- `/partners`
- `/terms`
- `/privacy`

### 管理ルート

- `/admin`

## 技術スタック

### フロントエンド

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI 系コンポーネント
- Framer Motion
- Wouter

### バックエンド

- Express 4
- Prisma 6
- MySQL
- Multer

### 補助ライブラリ

- Recharts
- React Hook Form
- Zod
- helmet
- express-rate-limit
- xss

## ディレクトリ構成

```text
.
├─ client/                  # Vite フロントエンドのルート
│  ├─ public/               # 静的アセットとアップロード保存先
│  └─ src/
│     ├─ components/
│     ├─ contexts/
│     ├─ data/
│     ├─ hooks/
│     ├─ pages/
│     ├─ types/
│     └─ App.tsx
├─ server/                  # Express API サーバー
├─ prisma/                  # Prisma schema と migration
├─ scripts/                 # seed などの補助スクリプト
├─ shared/                  # 共通定数
└─ vite.config.ts           # Vite 設定。root は client/
```

## データモデル概要

主要なテーブルは次のとおりです。

- `Tool`
- `Category`
- `PendingTool`
- `SiteSetting`

重要な業務フィールド:

- `Tool.isSponsored`: スポンサー掲載フラグ
- `Tool.order`: 手動並び順の重み
- `Tool.views`: 人気順ソートに使う閲覧数
- `Category.order`: カテゴリ表示順
- `PendingTool.categoryId` と `PendingTool.subCategoryId`: 投稿時の分類情報

## ローカル開発

### 必要環境

- Node.js 18 以上
- pnpm
- MySQL

### 1. 依存関係をインストール

```bash
pnpm install
```

### 2. `.env` を作成

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/ai_tools_navigator"
ADMIN_PASSWORD="change-this-password"
PORT="3001"
```

任意のフロントエンド環境変数:

- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`

### 3. データベースを準備

既存 migration を適用する場合:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

ローカルで素早く schema を同期するだけなら:

```bash
pnpm prisma generate
pnpm prisma db push
```

任意で seed を投入する場合:

```bash
pnpm exec tsx scripts/seed.ts
```

### 4. 開発サーバーを起動

```bash
pnpm dev
```

既定のローカル URL:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Admin: `http://localhost:3000/admin`

`pnpm dev` では次の 2 つが同時起動されます。

- `vite --host`
- `tsx watch server/index.ts`

## API 概要

### 公開 API

- `GET /api/settings`
- `GET /api/categories`
- `GET /api/tools`
- `POST /api/upload-public`
- `POST /api/submit-tool`

### 管理 API

- `POST /api/admin/login`
- `POST /api/admin/upload`
- `PUT /api/admin/settings`
- `GET /api/admin/tools`
- `POST /api/admin/tools`
- `PUT /api/admin/tools/:id`
- `DELETE /api/admin/tools/:id`
- `GET /api/admin/pending-tools`
- `DELETE /api/admin/pending-tools/:id`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `POST /api/admin/categories/reorder`

管理 API では次のヘッダーを使います。

```http
Authorization: Bearer <ADMIN_PASSWORD>
```

## 想定される運用フロー

1. 管理画面でカテゴリ構成とサイトブランドを設定する。
2. ユーザーが `/submit` からツールを投稿する。
3. 投稿は審査待ちキューに入る。
4. 管理者がタグ、並び順、スポンサー状態を調整して公開する。
5. 公開サイトは既定のソートルールで一覧を表示する。

## 補足

- 実際のアプリは API とデータベースを前提に動作しており、純粋な JSON サイトではありません。
- リポジトリにはローカルサンプルデータや古い補助ドキュメントも残っているため、現在のソースコードと Prisma schema を正としてください。
- 現在の `package.json` には開発用コマンドとフロントエンドのビルドが含まれています。統合型の本番運用を行う場合は、バックエンド起動方法と静的アセット公開フローを環境に合わせて補うのが安全です。

## 確認済みコマンド

```bash
pnpm exec tsc --noEmit
pnpm build
```

## License

MIT