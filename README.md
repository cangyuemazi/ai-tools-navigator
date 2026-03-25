# 🌟 智能零零 AI 工具导航站 (Smart Zero AI Tools Navigator)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC)

**智能零零 AI 工具导航站** 是一款面向商业化落地的现代化、全栈式 AI 资源收录与分发平台。

本项目不仅追求 **Apple 级的极致视觉美学**，更在底层架构上实现了完整的**商业闭环**：从前端客户自助提交、到后台微信联系谈合作，再到一键开启赞助高亮置顶，为您提供了一套开箱即用的 AI 导航站解决方案。

---

## ✨ 核心亮点 (Key Features)

### 💰 完整的商业变现链路
* **自助提交系统**：前台内置精美的提交页面，引导开发者留下联系方式（微信/邮箱），自动进入后台待审核池。
* **赞助商置顶 (Sponsored)**：支持后台一键开启“赞助高亮”模式。开启后，该工具将无视流量排名，永久固定在对应分类及首页的最黄金位置。
* **Pro 推荐标识**：付费工具自动佩戴带有发光阴影和微渐变效果的“✨ 推荐”角标，尊享金主排面。

### ⚙️ 强大的秘密管理后台 (Admin Console)
* **工具管理**：支持对全站 AI 工具进行增删改查，内置**子分类联动选择**。
* **分类目录系统**：支持无限添加主分类与二级子分类，可自定义 Lucide 图标。
* **一键“动态换皮”**：无需修改任何代码，直接在后台上传新 Logo、修改网站名称，全站（包括侧边栏、移动端导航、标题）实时生效。
* **审核池中心**：集中管理用户提交的意向产品，支持“一键录入”与“信息预填充”。

### 🎨 Apple 级视觉规范 (UI/UX)
* **极简主义**：采用 `#F5F5F7` 微暖灰底色与纯白卡片，呼吸感十足。
* **毛玻璃特效**：全站多处应用 `backdrop-blur-[20px]`，在滚动时呈现通透的高级感。
* **物理级动效**：基于 `Framer Motion` 的 `cubic-bezier(0.2, 0.9, 0.4, 1.1)` 弹簧动效，提供真实的交互反馈。

---

## 🛠️ 技术架构 (Tech Stack)

* **前端**：React 19 + Vite 7 + Tailwind CSS v4 + Wouter
* **后端**：Node.js + Express.js
* **数据库**：SQLite (轻量、高效、无需额外部署)
* **ORM 引擎**：Prisma v6 (强类型安全)
* **文件处理**：Multer (支持本地图片上传与图床化管理)

---

## 🚀 快速启动 (Getting Started)

### 1. 克隆与安装
```bash
git clone [https://github.com/cangyuemazi/ai-tools-navigator.git](https://github.com/cangyuemazi/ai-tools-navigator.git)
cd ai-tools-navigator
pnpm install
```

### 2. 数据库初始化

Bash

```
# 生成本地数据库文件并同步结构
pnpm prisma db push

# (可选) 如果需要导入初始 JSON 数据
pnpm dlx tsx scripts/seed.ts
```

### 3. 配置环境变量

在根目录创建 `.env` 文件：

代码段

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="您的管理后台密码"
```

### 4. 一键启动服务

Bash

```
# 同时启动前端 (3000) 和 后端 (3001)
pnpm run dev
```

------

## 📂 商业运营操作指南

### 如何管理数据？

访问 `http://localhost:3000/admin`，输入您在 `.env` 中设置的密码即可进入。

- **录入新产品**：在“工具管理”中点击新增，支持上传本地图片作为 Logo。
- **开启置顶**：在编辑弹窗底部开启“⭐ 设为付费赞助置顶”，并设置到期时间。
- **处理申请**：在“审核中心”查看开发者留下的微信，谈好合作后点击“收录并编辑”。

### 如何更换网站 Logo 和名称？

进入后台 -> **网站设置** -> 上传您的 Logo 图片并修改名称 -> 保存。首页将瞬间刷新呈现您的品牌。

------

## 📁 目录结构说明

Plaintext

```
├── client/              # 前端源码
│   ├── src/pages/       # 页面逻辑 (Home, Admin, Submit等)
│   ├── src/components/  # 核心组件 (Sidebar, ToolCard等)
│   └── public/uploads/  # 自动生成的本地图片存储目录
├── server/              # 后端 Express 源码 (API 路由与安全鉴权)
├── prisma/              # 数据库模型定义 (Schema)
└── scripts/             # 数据库迁移与初始化脚本
```

------

## 💡 开发者必看 (FAQ)

**Q：为什么上传图片后前台没反应？** A：项目已配置自动目录检测，请确保 `client/public/uploads` 存在。上传后的图片由 Express 静态路由托管。

**Q：如何部署到线上服务器？** A：建议使用 PM2 托管后端，前端通过 `pnpm build` 打包。如果是 Vercel 部署，请将 SQLite 替换为 PostgreSQL 或 Supabase。

------

*✨ Designed by 智能零零 & 你的努力. 祝您的 AI 导航站流量长虹，早日变现！*