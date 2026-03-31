# 🌟 智能零零 AI 工具导航站 (Smart Zero Navigator)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)

**智能零零 AI 工具导航站** 是一款为高净值流量变现而生的现代全栈导航系统。

本项目深度贯彻 **"Apple 级高级视觉美学"** 与 **"极致 UX 交互"**，并内置了强大的闭环商业变现引擎。从前端的客户自助提交、流量漏斗，到后台的零代码动态换皮、付费高亮权重控制，它为您提供了一套开箱即用的企业级资源分发解决方案。

---

## 📑 目录 (Table of Contents)

- [核心特性](#-核心杀手级特性-key-features)
- [技术栈](#️-技术栈-tech-stack)
- [项目架构](#-项目架构-project-structure)
- [快速启动](#-快速启动-getting-started)
- [环境变量说明](#-环境变量说明)
- [API 接口文档](#-api-接口文档)
- [数据库模型](#️-数据库模型-database-schema)
- [核心运营指南](#-核心运营指南)
- [安全特性](#-安全特性)
- [生产部署](#-生产部署-production-deployment)
- [常见问题](#-常见问题-faq)
- [贡献指南](#-贡献指南-contributing)
- [许可证](#-许可证-license)

---

## ✨ 核心杀手级特性 (Key Features)

### 💰 极简商业变现引擎
* **全自动获客漏斗**：前台提供极美的 `/submit` 工具提交页，支持客户直传 Logo 与预留联系方式。数据自动进入后台"审核池"，方便您添加微信进行商务转化。
* **双擎排位系统**：支持一键开启"⭐ 赞助高亮"（佩戴专属渐变发光徽章），同时支持精确到个位数的 **自定义排位分 (Order Score)** 控制，把流量入口牢牢抓在手里。
* **一键审核发布**：在后台审核池中点击"收录"，客户数据自动带入发布表单，1 秒完成工具上线。

### 🎨 零代码"动态换皮"系统
* **全局品牌定制**：无需修改任何前端代码，直接在管理后台修改**网站名称、全局背景色、标题字号、侧边栏 Logo、浏览器 Favicon 图标**，全站即刻生效。
* **页脚自定义**：支持在后台配置公司简介、ICP 备案号、联系邮箱，自动生成专业级网站页脚。
* **法律协议管理**：后台可直接编辑《提交服务协议》和《隐私政策》的全文，前台 `/terms` 和 `/privacy` 页面实时同步。

### 🍎 Apple 级极致交互 (UX/UI)
* **智能防抖悬浮气泡**：彻底解决传统瀑布流卡片展开导致的"页面弹跳"问题。当页面滑至最底部时，卡片简介会自动切换为**向上弹出的苹果风气泡对话框**，细节拉满。
* **无级调节侧边栏**：左侧导航栏内置隐形拖拽热区，用户可极致丝滑地自由调节侧边栏宽度（220px–450px），并自动记忆用户偏好至 `localStorage`。
* **物理级弹簧动效**：深度集成 `Framer Motion`，悬浮、展开、侧边栏切换均采用真实的 `cubic-bezier(0.2, 0.9, 0.4, 1.1)` 物理阻尼曲线。
* **全局命令面板**：`Ctrl+K` / `⌘+K` 呼出全局搜索，支持拼音/首字母模糊匹配（基于 `pinyin-match`），键盘上下导航 + Enter 直达。
* **骨架屏加载**：数据加载期间展示精心设计的骨架屏占位，与真实卡片尺寸 1:1 对齐，零布局抖动。
* **动态 SEO**：基于 `react-helmet-async` 实现页面级 `<title>` 和 `<meta>` 动态注入，分类切换时自动更新浏览器标签标题。

### 🧱 强悍的全栈底层架构
* **一键双端启动**：通过 `concurrently` 实现单个命令 `pnpm run dev` 同时唤醒 React 前端 (`:3000`) 与 Express 后端 (`:3001`)。Vite 自动将 `/api` 请求代理到后端。
* **健壮的 ORM 数据层**：采用 Prisma + MySQL，自带完整的关联级联删除（删除主分类自动清理子分类）。
* **自建图床服务**：内置 Multer 处理图片上传（单文件限制 5MB），自动接管客户提交与后台管理的 Logo 文件，存储于 `client/public/uploads/`。
* **安全防护层**：集成 `helmet` 安全头、`express-rate-limit` 全局限流 + 提交接口严苛限流、`xss` 输入过滤。

---

## 🛠️ 技术栈 (Tech Stack)

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | React + TypeScript | 19.2 + 5.6 |
| **构建工具** | Vite | 7.x |
| **样式方案** | Tailwind CSS v4 + Radix UI | 4.1 |
| **动效引擎** | Framer Motion | 12.x |
| **路由** | Wouter（轻量级，~2KB） | 3.x |
| **组件库** | Radix UI Primitives + shadcn/ui 风格 | — |
| **图表** | Recharts（后台数据概览） | 2.x |
| **搜索增强** | pinyin-match（拼音搜索） | 1.x |
| **SEO** | react-helmet-async | 3.x |
| **后端框架** | Express.js | 4.x |
| **ORM** | Prisma | 6.x |
| **数据库** | MySQL | — |
| **文件上传** | Multer | 2.x |
| **安全** | helmet + express-rate-limit + xss | — |
| **表单验证** | Zod + React Hook Form | 4.x / 7.x |
| **包管理器** | pnpm | 10.x |

---

## 📁 项目架构 (Project Structure)

```
ai-tools-navigator/
├── client/                          # 前端应用
│   ├── index.html                   # HTML 入口
│   ├── public/
│   │   └── uploads/                 # 用户上传的图片存储目录
│   └── src/
│       ├── App.tsx                  # 应用根组件（路由分发）
│       ├── main.tsx                 # React 入口
│       ├── index.css                # 全局样式
│       ├── const.ts                 # 前端常量（OAuth 等）
│       ├── components/
│       │   ├── AppShell.tsx         # 主应用壳层（页面调度中心）
│       │   ├── Layout.tsx           # 全局布局（侧边栏 + 主内容区 + 页脚 + SEO）
│       │   ├── Sidebar.tsx          # 侧边栏导航（可折叠/拖拽/移动端抽屉）
│       │   ├── ToolCard.tsx         # 工具卡片（React.memo 优化）
│       │   ├── ToolGrid.tsx         # 工具网格/瀑布流（React.memo + 骨架屏）
│       │   ├── CommandPalette.tsx   # 全局搜索命令面板（Ctrl+K）
│       │   ├── FloatingWidgets.tsx  # 浮动组件（回到顶部 + 客服二维码）
│       │   ├── ErrorBoundary.tsx    # React 错误边界
│       │   ├── ManusDialog.tsx      # 通用对话框
│       │   ├── Map.tsx              # Google Maps 集成
│       │   └── ui/                  # shadcn/ui 基础组件库（40+ 组件）
│       │       ├── button.tsx
│       │       ├── dialog.tsx
│       │       ├── skeleton.tsx
│       │       └── ... (40+ 组件)
│       ├── contexts/
│       │   └── ThemeContext.tsx      # 主题上下文（Light/Dark 切换）
│       ├── hooks/
│       │   ├── useComposition.ts    # 中文输入法组合事件处理
│       │   ├── useDebounce.ts       # 防抖 Hook（搜索优化）
│       │   ├── useMobile.tsx        # 响应式移动端检测
│       │   └── usePersistFn.ts      # 持久化函数引用（替代 useCallback）
│       ├── lib/
│       │   └── utils.ts             # cn() 工具函数（clsx + tailwind-merge）
│       ├── pages/
│       │   ├── Home.tsx             # 首页（瀑布流 + 分类锚点 + 搜索）
│       │   ├── Admin.tsx            # 管理后台（仪表盘/审核/工具/分类/设置）
│       │   ├── Submit.tsx           # 工具提交页（客户自助提交）
│       │   ├── About.tsx            # 关于我们
│       │   ├── Partners.tsx         # 商务合作
│       │   ├── Terms.tsx            # 提交服务协议
│       │   ├── Privacy.tsx          # 隐私政策
│       │   └── NotFound.tsx         # 404 页面
│       └── types/
│           └── index.ts             # TypeScript 类型定义（Tool, Category, SubCategory）
├── server/
│   └── index.ts                     # Express 后端入口（API + 安全 + 静态资源）
├── shared/
│   └── const.ts                     # 前后端共享常量
├── prisma/
│   ├── schema.prisma                # 数据库模型定义
│   └── migrations/                  # 数据库迁移记录
├── scripts/
│   └── seed.ts                      # 数据库种子脚本
├── patches/
│   └── wouter@3.7.1.patch           # Wouter 补丁
├── package.json
├── vite.config.ts                   # Vite 配置（代理 + 别名 + Tailwind 插件）
├── tsconfig.json
└── components.json                  # shadcn/ui 配置
```

---

## 🚀 快速启动 (Getting Started)

### 前置要求

| 工具 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | >= 18 | 20 LTS |
| pnpm | >= 8 | 10.x |
| MySQL | >= 5.7 | 8.x |

### 1. 克隆与安装

```bash
git clone https://github.com/cangyuemazi/ai-tools-navigator.git
cd ai-tools-navigator
pnpm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库连接（MySQL）
DATABASE_URL="mysql://用户名:密码@localhost:3306/ai_tools_navigator"

# 管理后台密码（务必修改为强密码）
ADMIN_PASSWORD="your_secure_admin_password_here"
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端并推送数据库结构
pnpm prisma generate
pnpm prisma db push
```

*(可选) 导入演示数据：*

```bash
pnpm dlx tsx scripts/seed.ts
```

### 4. 一键启动 🛫

```bash
pnpm run dev
```

启动成功后：

| 服务 | 地址 | 说明 |
|------|------|------|
| 🌐 前台 | `http://localhost:3000` | 用户访问入口 |
| 👑 管理后台 | `http://localhost:3000/admin` | 输入 `.env` 中设置的密码 |
| ⚙️ API 后端 | `http://localhost:3001` | Express 服务（Vite 自动代理） |

### 5. 生产构建

```bash
pnpm run build     # 生成 dist/ 产物
pnpm run preview   # 本地预览生产构建
```

---

## 📝 环境变量说明

| 变量名 | 必填 | 示例值 | 说明 |
|--------|------|--------|------|
| `DATABASE_URL` | ✅ | `mysql://root:123456@localhost:3306/ai_tools` | MySQL 连接字符串 |
| `ADMIN_PASSWORD` | ✅ | `my_secure_password` | 后台管理密码（默认 `admin123`） |
| `PORT` | ❌ | `3001` | 后端服务端口（默认 3001） |
| `NODE_ENV` | ❌ | `production` | 运行环境 |
| `VITE_FRONTEND_FORGE_API_KEY` | ❌ | `your_api_key` | Google Maps API Key（地图功能） |
| `VITE_FRONTEND_FORGE_API_URL` | ❌ | `https://forge.example.com` | Maps 代理地址 |
| `VITE_OAUTH_PORTAL_URL` | ❌ | `https://auth.example.com` | OAuth 登录门户地址 |
| `VITE_APP_ID` | ❌ | `your_app_id` | OAuth 应用 ID |

---

## 📡 API 接口文档

### 公开接口（无需鉴权）

| 方法 | 路径 | 说明 | 限流 |
|------|------|------|------|
| `GET` | `/api/settings` | 获取网站全局配置 | 全局 300次/15min |
| `GET` | `/api/categories` | 获取分类树（含子分类） | 全局 300次/15min |
| `GET` | `/api/tools` | 获取工具列表（赞助优先→排位分→浏览量排序） | 全局 300次/15min |
| `POST` | `/api/submit-tool` | 客户提交工具（进入审核池） | **5次/小时** |
| `POST` | `/api/upload-public` | 公开图片上传（工具提交用） | 全局 300次/15min |

### 管理接口（需 `Authorization: Bearer <密码>` 头）

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/admin/login` | 管理员登录验证 |
| `POST` | `/api/admin/upload` | 后台图片上传 |
| `PUT` | `/api/admin/settings` | 更新全站设置（名称/Logo/协议等） |
| `GET` | `/api/admin/tools` | 获取全部工具（含未发布） |
| `POST` | `/api/admin/tools` | 新建工具 |
| `PUT` | `/api/admin/tools/:id` | 更新工具 |
| `DELETE` | `/api/admin/tools/:id` | 删除工具 |
| `GET` | `/api/admin/pending-tools` | 获取待审核工具列表 |
| `DELETE` | `/api/admin/pending-tools/:id` | 删除/拒绝待审核工具 |
| `POST` | `/api/admin/categories` | 新建分类 |
| `PUT` | `/api/admin/categories/:id` | 更新分类 |
| `DELETE` | `/api/admin/categories/:id` | 删除分类（级联删除子分类） |
| `POST` | `/api/admin/categories/reorder` | 分类排序（拖拽排序） |

---

## 🗄️ 数据库模型 (Database Schema)

### Tool（工具表）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | String (cuid) | 主键 |
| `name` | String | 工具名称 |
| `description` | String | 工具简介 |
| `url` | String | 官网链接 |
| `logo` | String? | Logo 图片地址 |
| `categoryId` | String | 所属主分类 ID |
| `subCategoryId` | String? | 所属子分类 ID |
| `tags` | String (JSON) | 标签数组（JSON 序列化存储） |
| `views` | Int | 浏览量（默认 0） |
| `isSponsored` | Boolean | 是否为赞助商推荐 |
| `sponsorExpiry` | DateTime? | 赞助到期时间 |
| `order` | Int | 排位权重分（越高越靠前） |
| `createdAt` | DateTime | 创建时间 |
| `updatedAt` | DateTime | 更新时间 |

### Category（分类表）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | String (cuid) | 主键 |
| `name` | String | 分类名称 |
| `parentId` | String? | 父分类 ID（null = 主分类） |
| `icon` | String? | Lucide 图标名（如 `Brain`, `Video`） |
| `order` | Int | 排序权重 |

### PendingTool（待审核工具表）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | String (cuid) | 主键 |
| `name` | String | 工具名称 |
| `description` | String | 工具简介 |
| `url` | String | 官网链接 |
| `logo` | String? | Logo 图片地址 |
| `contactInfo` | String? | 提交者联系方式 |
| `categoryId` | String? | 选择的主分类 |
| `subCategoryId` | String? | 选择的子分类 |
| `status` | String | 状态（pending / approved / rejected） |
| `createdAt` | DateTime | 提交时间 |

### SiteSetting（全站设置表）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | String | 网站名称 |
| `logo` | String? | 网站 Logo |
| `favicon` | String? | 浏览器 Favicon |
| `titleFontSize` | Int | 侧边栏标题字号（默认 17） |
| `backgroundColor` | String | 全局背景色（默认 `#f5f5f7`） |
| `companyIntro` | String? | 页脚公司简介 |
| `icp` | String? | ICP 备案号 |
| `email` | String? | 联系邮箱 |
| `termsText` | LongText? | 《提交服务协议》全文 |
| `privacyText` | LongText? | 《隐私政策》全文 |

---

## 📂 核心运营指南

### 🔧 初始化配置

1. **首次登录**：前往 `http://localhost:3000/admin`，进入 **「全站高级设置」** 面板：
   - 上传企业 Logo 和 Favicon
   - 设定品牌背景色（推荐 `#f5f5f7` 苹果灰）
   - 填写公司简介、ICP 备案号、联系邮箱
   - 编辑《提交服务协议》和《隐私政策》

2. **构建分类树**：在 **「分类目录」** 中创建主分类，填入 Lucide 图标名称：
   - 支持的图标：`Brain`, `Video`, `Image`, `Code`, `PenTool`, `Music`, `Palette`, `Briefcase` 等
   - 创建主分类后可继续添加子分类
   - 支持拖拽排序（上移/下移）

### 💼 日常运营

3. **审核商务合作**：定期查看 **「审核中心」**：
   - 查看客户提交的工具信息和联系方式
   - 点击「收录」将工具信息一键带入发布表单
   - 谈妥推广费后，勾选"赞助"标签 + 设置高排位分（如 999）

4. **数据概览**：**「仪表盘」** 实时展示：
   - 总工具数、待审核数、本周/本月新增
   - 各分类工具分布柱状图
   - 热门工具 TOP 10（按浏览量排序）

---

## 🔒 安全特性

本项目内置多层安全防护，达到生产级别安全标准：

| 特性 | 说明 |
|------|------|
| **Helmet** | 自动注入安全 HTTP 响应头（X-Content-Type-Options, X-Frame-Options 等） |
| **速率限制** | 全局：300 次/15 分钟；提交接口：5 次/小时 |
| **XSS 防护** | 所有用户输入经 `xss` 库过滤后入库 |
| **鉴权中间件** | 所有管理接口要求 `Authorization: Bearer <password>` |
| **文件上传限制** | 单文件最大 5MB，按时间戳重命名防止路径遍历 |
| **外链安全** | 所有 `target="_blank"` 链接自动添加 `rel="noopener noreferrer"` |
| **React 错误边界** | `ErrorBoundary` 组件捕获渲染错误，防止白屏崩溃 |

---

## 🚢 生产部署 (Production Deployment)

### 方案一：传统服务器部署

```bash
# 1. 构建前端
pnpm run build

# 2. 启动后端（推荐配合 pm2）
NODE_ENV=production node --import tsx server/index.ts
# 或
pm2 start server/index.ts --interpreter tsx --name ai-tools
```

### 方案二：Docker 部署（推荐）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm prisma generate && pnpm run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npx", "tsx", "server/index.ts"]
```

### 反向代理（Nginx 参考配置）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 图片上传目录，可配置缓存
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 注意事项

- **图片迁移**：生产环境建议将 `client/public/uploads` 替换为对象存储（阿里云 OSS / AWS S3），修改 Multer 目标即可。
- **数据库**：确保 MySQL 连接字符串中包含正确的主机、端口、用户名和密码。
- **HTTPS**：生产环境务必配置 SSL 证书（可使用 Let's Encrypt 免费证书）。

---

## 💡 常见问题 (FAQ)

<details>
<summary><b>Q：Windows 运行 pnpm 报错"禁止运行脚本"？</b></summary>

以管理员身份打开 PowerShell，运行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
</details>

<details>
<summary><b>Q：上传的图片存在哪里？</b></summary>

默认保存在 `client/public/uploads/` 目录，文件名格式为 `img_时间戳.扩展名`。生产环境建议迁移至云对象存储。
</details>

<details>
<summary><b>Q：如何修改后台密码？</b></summary>

修改 `.env` 文件中的 `ADMIN_PASSWORD` 值，然后重启后端服务。密码以 Bearer Token 方式传输，存储在客户端 `localStorage` 中。
</details>

<details>
<summary><b>Q：如何添加新的 Lucide 图标？</b></summary>

在 `client/src/components/Sidebar.tsx` 和 `client/src/pages/Home.tsx` 的 `iconMap` 中导入并注册新图标：

```tsx
import { NewIcon } from "lucide-react";
const iconMap = { ..., NewIcon };
```

然后在后台创建分类时填写对应的图标名称即可。
</details>

<details>
<summary><b>Q：支持从 SQLite 迁移到 MySQL 吗？</b></summary>

当前项目已配置为 MySQL。如需使用 SQLite，修改 `prisma/schema.prisma` 中的 `provider` 为 `"sqlite"`，`DATABASE_URL` 改为 `"file:./dev.db"`，并移除 `@db.LongText` 注解即可。
</details>

<details>
<summary><b>Q：Ctrl+K 搜索支持拼音吗？</b></summary>

支持。集成了 `pinyin-match` 库，可通过拼音全拼、首字母进行模糊匹配搜索。
</details>

---

## 🤝 贡献指南 (Contributing)

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 发起 Pull Request

**开发约定：**
- 组件使用 `React.memo` 包裹以优化渲染性能
- TypeScript 严格类型，避免使用 `any`
- API 错误都应有 `console.error` 记录
- 外部链接添加 `rel="noopener noreferrer"`

---

## 📄 许可证 (License)

本项目基于 [MIT License](LICENSE) 开源。

---

<p align="center">
  <i>✨ Crafted with passion and meticulous attention to detail. Built for the future.</i>
</p>

