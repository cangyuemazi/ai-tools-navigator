<div align="center">

# 🧭 AI Tools Navigator

**全栈 AI 工具导航站 · Full-Stack AI Tools Directory · フルスタック AI ツールナビ**

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](#技术栈)
[![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#技术栈)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#技术栈)
[![Prisma 6](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](#技术栈)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](#技术栈)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](#技术栈)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](#docker-部署)

<br />

[English](README.en.md) · **中文** · [日本語](README.ja.md)

<br />

<em>一站式 AI 工具导航解决方案 — 从搭建到运营，开箱即用。</em>

</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [适用场景](#适用场景)
- [功能一览](#功能一览)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [数据模型](#数据模型)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [Docker 部署](#docker-部署)
- [API 参考](#api-参考)
- [运营流程](#运营流程)
- [安全体系](#安全体系)
- [常见问题](#常见问题)
- [License](#license)

---

## 项目简介

AI Tools Navigator 是一个**开源的全栈 AI 工具导航站模板**。它将前台展示、用户投稿、后台审核、分类管理、站点品牌配置、安全加固整合在同一个仓库中，适合快速搭建可持续运营的 AI 工具目录站。

本项目不是静态页面——前端通过 API 动态获取分类、工具和站点设置；后台管理审核投稿、发布工具、维护分类排序，并统一管理品牌信息与法律协议。

### 核心亮点

- 🎨 **Apple 风格 UI** — 圆角卡片、毛玻璃导航栏、流畅动画，开箱即为精品站
- 📱 **响应式设计** — 从手机到 4K 屏全适配，侧边栏可折叠/展开
- 🔍 **即时搜索** — 支持拼音匹配和关键词搜索，Command Palette 快捷呼出
- 📊 **丰富后台** — 数据看板、审核中心、批量操作、Excel 导入导出
- 🛡️ **生产级安全** — JWT 认证、限流、XSS 过滤、Helmet 安全头、MIME 校验
- ☁️ **灵活存储** — 支持本地上传和阿里云 OSS，按需切换
- 🐳 **一键部署** — Docker Compose + Nginx 反向代理，生产环境开箱即用

---

## 适用场景

- AI 工具导航站 / 资源目录站 / 产品收录站
- 需要开放用户投稿，运营人员审核上线
- 按赞助、权重、浏览量排序工具曝光位
- 非开发人员维护分类、工具和站点信息

---

## 功能一览

### 🌐 前台功能

| 功能 | 说明 |
|------|------|
| 分类浏览 | 首页按主分类 / 子分类组织工具卡片，支持子分类 Tab 切换 |
| 全部工具 | `/all-tools` 独立展示所有已收录工具 |
| 智能排序 | 赞助位优先 → 手动排位分 → 浏览量自动排序 |
| 搜索 | 支持拼音 / 关键词搜索，Command Palette（`Ctrl+K`）快捷呼出 |
| 工具投稿 | `/submit` 用户自助提交工具，支持 Logo 上传 |
| 赞助商展位 | 首页顶部横滚赞助推荐位 |
| 关于我们 | `/about` 支持后台 Markdown 编辑，前端渲染富文本 |
| 商务合作 | `/partners` 同上，Markdown 可视化编辑 |
| 服务协议 & 隐私政策 | `/terms`、`/privacy` 后台可编辑 |
| 客服浮窗 | 悬浮客服二维码，后台可上传替换 |
| 懒加载 | 工具卡片图片 `loading="lazy"` |
| 代码拆分 | Admin / Terms / Privacy 页面通过 `React.lazy` 按需加载 |

### 🔧 管理后台 `/admin`

| 功能 | 说明 |
|------|------|
| 数据概览 | 工具总数、待审核数、本周/月新增、分类分布图、热门 TOP 10 |
| 审核中心 | 查看用户投稿、一键带入正式发布表单 |
| 工具管理 | 增删改查 + 批量赞助 / 批量删除 |
| 批量导入 | 下载 Excel 模板 → 填写 → 上传批量导入工具 |
| 批量图片上传 | 支持一次上传多张图片到后台 |
| 分类管理 | 主分类 / 子分类增删改 + 上下拖拽排序 |
| 站点设置 | 名称、Logo、Favicon、背景色、标题字号、页脚信息、法律协议 |

---

## 技术栈

| 层 | 技术 |
|----|------|
| **前端** | React 19, TypeScript 5, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| **后端** | Express 4, Prisma 6, MySQL 8, Multer, jsonwebtoken |
| **安全** | helmet, express-rate-limit, xss, crypto (timingSafeEqual) |
| **图表** | Recharts |
| **表单** | React Hook Form + Zod |
| **文件存储** | 本地磁盘 / 阿里云 OSS（可选） |
| **Excel** | ExcelJS（模板导出）, XLSX（批量导入解析）|
| **Markdown** | md-editor-rt（后台编辑器）, react-markdown + rehype-raw + DOMPurify（前台渲染）|
| **部署** | Docker, Nginx, Node.js 20 |

---

## 项目结构

```
ai-tools-navigator/
├── client/                         # 前端 (Vite + React)
│   ├── index.html                  # HTML 入口
│   ├── public/
│   │   └── uploads/                # 本地上传文件存储
│   └── src/
│       ├── App.tsx                  # 路由入口 (React.lazy 代码拆分)
│       ├── main.tsx                # React 挂载点
│       ├── components/
│       │   ├── AppShell.tsx        # 持久化壳组件（避免侧栏重渲染）
│       │   ├── Layout.tsx          # 主布局（侧栏 + 顶栏 + 内容区）
│       │   ├── Sidebar.tsx         # 侧边栏（分类导航、折叠、拖拽调宽）
│       │   ├── ToolCard.tsx        # 工具卡片
│       │   ├── ToolGrid.tsx        # 工具网格
│       │   ├── CommandPalette.tsx   # Command Palette 搜索面板
│       │   ├── FloatingWidgets.tsx  # 悬浮客服 / 回到顶部
│       │   ├── MarkdownEditor.tsx   # Markdown 编辑器封装
│       │   └── ui/                 # Radix UI 组件库
│       ├── contexts/               # React Context
│       ├── hooks/                  # 自定义 Hooks
│       ├── lib/                    # 工具函数 + 站点设置缓存
│       ├── pages/
│       │   ├── Home.tsx            # 首页 / 全部工具 (双模式)
│       │   ├── Admin.tsx           # 后台入口
│       │   ├── Submit.tsx          # 工具投稿页
│       │   ├── About.tsx           # 关于我们
│       │   ├── Partners.tsx        # 商务合作
│       │   ├── Terms.tsx           # 服务协议
│       │   ├── Privacy.tsx         # 隐私政策
│       │   └── admin/              # 后台子组件
│       │       ├── Dashboard.tsx   # 数据看板
│       │       ├── PendingTools.tsx # 审核中心
│       │       ├── Tools.tsx       # 工具管理
│       │       ├── Categories.tsx  # 分类管理
│       │       └── Settings.tsx    # 站点设置
│       └── types/                  # TypeScript 类型定义
├── server/
│   └── index.ts                    # Express API 服务 + 所有路由
├── shared/
│   └── const.ts                    # 前后端共享常量
├── prisma/
│   ├── schema.prisma               # 数据模型 + 索引定义
│   └── migrations/                 # 数据库迁移文件
├── scripts/
│   └── seed.ts                     # 数据填充脚本
├── nginx/
│   └── default.conf                # Nginx 反向代理 + 安全头 + 缓存策略
├── Dockerfile                      # 多阶段构建镜像
├── docker-compose.yml              # Docker Compose 编排
├── vite.config.ts                  # Vite 配置
├── tsconfig.json                   # TypeScript 配置
└── package.json
```

---

## 数据模型

| 表 | 用途 | 核心字段 |
|----|------|----------|
| **Tool** | 正式工具 | name, url, logo, description, categoryId, subCategoryId, tags (JSON), views, order, isSponsored, sponsorExpiry |
| **Category** | 分类 | name, parentId（父子关系）, icon, order |
| **PendingTool** | 待审核投稿 | name, url, logo, contactInfo, categoryId, subCategoryId, status |
| **SiteSetting** | 全局配置 | name, logo, favicon, backgroundColor, titleFontSize, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText, aboutContent, partnersContent |

### 索引策略

```
Tool:         @@index([categoryId])
              @@index([subCategoryId])
              @@index([isSponsored, order, views])   -- 首页排序复合索引
              @@index([createdAt])

Category:     @@index([parentId])

PendingTool:  @@index([status])
              @@index([createdAt])
```

---

## 快速开始

### 前置要求

| 依赖 | 最低版本 |
|------|----------|
| Node.js | ≥ 18 |
| pnpm | ≥ 8 |
| MySQL | ≥ 5.7 |

### 1. 克隆并安装依赖

```bash
git clone https://github.com/your-org/ai-tools-navigator.git
cd ai-tools-navigator
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件（参考下方 [环境变量](#环境变量) 章节）：

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret-string"
PORT=3001
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
pnpm prisma generate

# 同步 Schema（开发环境推荐）
pnpm prisma db push

# 或应用已有迁移（生产环境推荐）
pnpm prisma migrate deploy
```

可选 — 填充示例数据：

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
pnpm exec tsc --noEmit       # TypeScript 类型检查（可选）
```

---

## 环境变量

在项目根目录创建 `.env` 文件：

| 变量 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `DATABASE_URL` | ✅ | MySQL 连接字符串 | `mysql://root:pass@localhost:3306/ai_tools` |
| `ADMIN_PASSWORD` | ✅ | 管理后台登录密码 | `my-strong-password-123` |
| `JWT_SECRET` | ⚠️ 推荐 | JWT 签名密钥（不设则每次重启 token 失效）| `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `PORT` | ❌ | 服务端口 | `3001`（默认） |
| `OSS_ACCESS_KEY_ID` | ❌ | 阿里云 OSS Access Key ID | — |
| `OSS_ACCESS_KEY_SECRET` | ❌ | 阿里云 OSS Access Key Secret | — |
| `OSS_BUCKET` | ❌ | 阿里云 OSS Bucket 名称 | `my-ai-tools` |
| `OSS_REGION` | ❌ | 阿里云 OSS 地域 | `oss-cn-beijing`（默认） |

> **文件存储说明**：未配置 OSS 环境变量时，上传文件自动存储在本地 `client/public/uploads/` 目录。配置后自动切换为 OSS 云存储。

---

## Docker 部署

项目提供了完整的 Docker 支持，包含多阶段构建 Dockerfile 和 Docker Compose 编排。

### 架构

```
┌──────────┐         ┌──────────────┐         ┌───────┐
│  客户端  │  :80 →  │  Nginx       │  :3001 → │ Node  │ → MySQL
│          │         │  (反代+缓存) │         │ (API) │
└──────────┘         └──────────────┘         └───────┘
```

### 一键启动

```bash
# 确保 .env 文件已配置（DATABASE_URL 指向可访问的 MySQL）
docker compose up -d --build
```

### docker-compose.yml

```yaml
services:
  app:
    build: .
    expose: ["3001"]
    env_file: [.env]
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [app]
    restart: unless-stopped
```

### Nginx 特性

- 🔒 安全响应头（X-Frame-Options, CSP, X-Content-Type-Options 等）
- 📦 Gzip 压缩
- ⏱️ 静态资源长缓存（Vite 带 hash 的 `/assets/` 目录 365 天缓存）
- 🔄 反向代理到 Node.js 后端

---

## API 参考

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/settings` | 获取站点配置 |
| `GET` | `/api/categories` | 获取分类树 |
| `GET` | `/api/tools` | 工具列表（支持分页 `?page=1&limit=50`）|
| `POST` | `/api/upload-public` | 公开图片上传（限流）|
| `POST` | `/api/submit-tool` | 提交工具到审核池（限流）|

### 管理接口（需 JWT Token）

所有管理接口需携带请求头：

```
Authorization: Bearer <jwt_token>
```

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/admin/login` | 登录获取 JWT Token |
| `POST` | `/api/admin/upload` | 后台图片上传 |
| `POST` | `/api/admin/upload-batch` | 批量图片上传（最多 100 张）|
| `PUT` | `/api/admin/settings` | 更新站点设置 |
| `GET` | `/api/admin/tools` | 读取全部工具 |
| `POST` | `/api/admin/tools` | 新增工具 |
| `PUT` | `/api/admin/tools/:id` | 编辑工具 |
| `DELETE` | `/api/admin/tools/:id` | 删除工具 |
| `GET` | `/api/admin/tools/template` | 下载 Excel 导入模板 |
| `POST` | `/api/admin/tools/batch-import` | Excel 批量导入工具 |
| `GET` | `/api/admin/pending-tools` | 读取待审核列表 |
| `DELETE` | `/api/admin/pending-tools/:id` | 删除待审核记录 |
| `POST` | `/api/admin/categories` | 创建分类 |
| `PUT` | `/api/admin/categories/:id` | 编辑分类 |
| `DELETE` | `/api/admin/categories/:id` | 删除分类（级联子分类）|
| `POST` | `/api/admin/categories/reorder` | 分类排序 |

---

## 运营流程

```
┌─────────────────────────────────────────┐
│  管理员配置分类 & 站点设置                │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  用户在 /submit 投稿工具（支持 Logo）     │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  投稿进入审核池 (PendingTool)             │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  管理员审核 → 补充标签/排位分 → 发布      │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  前台自动按 赞助>排位分>浏览量 排序展示   │
└─────────────────────────────────────────┘
```

---

## 安全体系

| 层级 | 措施 | 说明 |
|------|------|------|
| **认证** | JWT Token | 管理接口必须携带有效 Token，24 小时有效期 |
| **密码** | SHA-256 + timingSafeEqual | 防止计时攻击的密码比对 |
| **限流** | 全局限流 | 每 IP 每 15 分钟最多 300 次请求 |
| | 登录限流 | 每 IP 每 15 分钟最多 10 次尝试 |
| | 投稿限流 | 每 IP 每小时最多 5 次提交 |
| | 上传限流 | 公开上传每 IP 每 15 分钟最多 20 次 |
| **输入** | XSS 过滤 | 所有写入端点的文本输入均经过 `xss()` 过滤 |
| **上传** | MIME 白名单 | 仅允许 `jpg/png/gif/webp/svg/ico` |
| | Magic Bytes 校验 | 校验文件头魔术字节，防止 MIME 伪造 |
| | 文件名随机化 | UUID 命名，防止路径遍历和文件枚举 |
| **HTTP** | Helmet | 安全响应头，隐藏服务器指纹 |
| | Nginx CSP | Content-Security-Policy 内容安全策略 |
| **错误** | 安全错误响应 | 500 错误不泄露堆栈和内部信息 |
| | 全局兜底 | Express 错误中间件捕获未处理异常 |

---

## 常见问题

<details>
<summary><strong>Q: 如何更改管理员密码？</strong></summary>

修改 `.env` 文件中的 `ADMIN_PASSWORD`，然后重启服务即可。不需要修改数据库。

</details>

<details>
<summary><strong>Q: 如何切换到阿里云 OSS 存储？</strong></summary>

在 `.env` 中添加 `OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_BUCKET` 三个变量，重启服务即自动切换。无需修改代码。

</details>

<details>
<summary><strong>Q: 数据库迁移报错怎么办？</strong></summary>

```bash
# 重新生成 Prisma Client
pnpm prisma generate

# 强制同步 Schema（会丢失数据，仅开发环境用）
pnpm prisma db push --force-reset

# 或创建新的迁移
pnpm prisma migrate dev --name describe_your_change
```

</details>

<details>
<summary><strong>Q: 如何生成安全的 JWT_SECRET？</strong></summary>

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

</details>

<details>
<summary><strong>Q: Docker 部署时 MySQL 怎么连？</strong></summary>

如果 MySQL 运行在宿主机上，`.env` 中的 `DATABASE_URL` 使用 `host.docker.internal` 替代 `localhost`：

```env
DATABASE_URL="mysql://root:pass@host.docker.internal:3306/ai_tools"
```

`docker-compose.yml` 中已配置 `extra_hosts` 映射。

</details>

<details>
<summary><strong>Q: 上传的图片存在哪里？</strong></summary>

- **本地模式**（默认）：`client/public/uploads/`
- **OSS 模式**：阿里云 OSS 对应 Bucket 的 `uploads/` 路径下

</details>

---

## License

[MIT](LICENSE)

---

<div align="center">
<sub>Built with ❤️ using React, Express, Prisma & Tailwind CSS</sub>
</div>
