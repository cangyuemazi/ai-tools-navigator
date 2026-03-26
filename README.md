# 🌟 智能零零 AI 工具导航站 (Smart Zero Navigator)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue)
![Express](https://img.shields.io/badge/Express.js-Backend-000000)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC)

**智能零零 AI 工具导航站** 是一款为高净值流量变现而生的现代全栈导航系统。

本项目深度贯彻 **“Apple 级高级视觉美学”** 与 **“极致 UX 交互”**，并内置了强大的闭环商业变现引擎。从前端的客户自助提交、流量漏斗，到后台的零代码动态换皮、付费高亮权重控制，它为您提供了一套开箱即用的企业级资源分发解决方案。

---

## ✨ 核心杀手级特性 (Key Features)

### 💰 极简商业变现引擎
* **全自动获客漏斗**：前台提供极美的 `/submit` 工具提交页，支持客户直传 Logo 与预留联系方式。数据自动进入后台“审核池”，方便您添加微信进行商务转化。
* **双擎排位系统**：支持一键开启“⭐ 赞助高亮”（佩戴专属渐变发光徽章），同时支持精确到个位数的 **自定义排位分 (Order Score)** 控制，把流量入口牢牢抓在手里。
* **一键审核发布**：在后台审核池中点击“收录”，客户数据自动带入发布表单，1 秒完成工具上线。

### 🎨 零代码“动态换皮”系统
* **全局品牌定制**：无需修改任何前端代码，直接在管理后台修改**网站名称、全局背景色、标题字号、侧边栏 Logo、浏览器 Favicon 图标**，全站即刻生效。
* **页脚自定义**：支持在后台配置公司简介、ICP 备案号、联系邮箱，自动生成专业级网站页脚。

### 🍎 Apple 级极致交互 (UX/UI)
* **智能防抖悬浮气泡**：彻底解决传统瀑布流卡片展开导致的“页面弹跳”问题。当页面滑至最底部时，卡片简介会自动切换为**向上弹出的苹果风气泡对话框**，细节拉满。
* **无级调节侧边栏**：左侧导航栏内置隐形拖拽热区，用户可极致丝滑地自由调节侧边栏宽度，并自动记忆用户偏好。
* **物理级弹簧动效**：深度集成 `Framer Motion`，悬浮、展开、侧边栏切换均采用真实的 `cubic-bezier(0.2, 0.9, 0.4, 1.1)` 物理阻尼曲线。

### 🧱 强悍的全栈底层架构
* **一键双端启动**：通过 `concurrently` 实现单个命令 `pnpm run dev` 同时唤醒 React 前端与 Express 后端。
* **健壮的 ORM 数据层**：采用 Prisma + SQLite，自带完整的关联级联删除（删除主分类自动清理子分类）。
* **自建图床服务**：内置 Multer 处理图片上传，自动接管客户提交与后台管理的 Logo 文件。

---

## 🛠️ 技术栈 (Tech Stack)

* **前端客户端**：React 19 + Vite 7 + Tailwind CSS v4 + Framer Motion
* **后端服务端**：Node.js + Express.js + Multer
* **数据库 & ORM**：SQLite + Prisma v6
* **路由与图标**：Wouter + Lucide React

---

## 🚀 快速启动 (Getting Started)

本项目使用 `pnpm` 进行极速依赖管理。请确保您已安装 Node.js (>=18) 和 pnpm。

### 1. 克隆与安装
```bash
git clone [https://github.com/cangyuemazi/ai-tools-navigator.git](https://github.com/cangyuemazi/ai-tools-navigator.git)
cd ai-tools-navigator
pnpm install
```

### 2. 环境与数据库初始化

在项目根目录创建 `.env` 文件，并设置您的专属后台密码：

代码段

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="您的超强管理密码"
```

生成数据库表结构并同步：

Bash

```
pnpm prisma db push
```

*(可选：如需导入预设演示数据，可运行 `pnpm dlx tsx scripts/seed.ts`)*

### 3. 一键启动服务 🛫

Bash

```
pnpm run dev
```

启动成功后：

- 🌐 前台访问：`http://localhost:3000/`
- 👑 后台访问：`http://localhost:3000/admin` (输入 `.env` 中的密码进入)

------

## 📂 核心运营指南

1. **第一次登录**：请前往 `http://localhost:3000/admin`，进入 **【全站高级设置】** 面板，上传您的企业 Logo、Favicon，设定品牌背景色（如 `#f5f5f7` 或浅色系），填写备案号。
2. **构建分类树**：在 **【分类目录】** 中，您可以自由创建主分类（填入对应的英文 Lucide Icon 名称，如 `Brain`, `Video`），并随时添加子分类。
3. **处理商务合作**：定期查看 **【审核中心】**，联系提交工具的用户。谈妥高亮展示费后，给该工具分配极高的排位分（如 999），并勾选赞助标签。

------

## 💡 常见问题 (FAQ)

**Q：Windows 系统在 VS Code 运行 pnpm 报错“禁止运行脚本”怎么办？** A：以管理员身份打开 PowerShell，运行此命令永久解决：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`。

**Q：上传的图片存在哪里？可以迁移吗？** A：默认保存在 `client/public/uploads` 目录。生产环境中建议搭配云服务器的挂载盘，或后续将 Express API 中的 Multer 目标修改为 OSS/S3 服务。

------

*✨ Crafted with passion and meticulous attention to detail. Built for the future.*