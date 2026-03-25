# 🌟 智能零零 AI 工具导航站 (Smart Zero AI Tools Navigator)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748)
![Express](https://img.shields.io/badge/Express-Backend-000000)

**智能零零 AI 工具导航站** 已经从一个静态网页，正式进化为一个**全栈驱动 (Full-Stack)**、具有极高商业落地价值的现代人工智能工具分发平台。

本项目不仅在 UI/UX 上深度融入了 Apple 级的设计规范（微暖灰底色、毛玻璃拟态、多层弥散阴影、物理级弹簧动效），在底层架构上更采用了强大的 **SQLite + Prisma ORM + Express API** 的前后端分离架构，支持商业赞助高亮与权重优先排序。

---

## ✨ 核心商业级亮点 (Key Features)

### 🚀 真正的全栈与数据库驱动
* **告别静态 JSON**：全站数据由底层关系型数据库 (SQLite) 强力驱动，通过 Express.js 提供标准 RESTful API，为未来的管理后台与高并发访问打下坚实基础。
* **商业赞助优先展示**：底层 API 原生集成商业化排序逻辑。被标记为“已赞助”(`isSponsored: true`) 的工具将无视流量规则，永远霸占对应分类的黄金头部广告位。

### 🎨 Apple 级极致视觉美学
* **色彩体系**：采用经典的 `#F5F5F7` 微暖灰作为全局主背景，卡片纯白悬浮，配合 `#0071E3` 经典苹果蓝交互色。
* **毛玻璃拟态 (Glassmorphism)**：在移动端导航栏、常驻悬浮组件等层级使用了精准的 `backdrop-blur`，视觉通透高级。
* **物理缓行动效**：深度集成 `Framer Motion`，卡片 Hover 时呈现极具真实物理质感的 `translateY(-4px)` 上浮与 `cubic-bezier` 弹簧缩放。

### 🧱 绝对稳定的真·瀑布流布局
* 彻底解决传统 CSS 多列布局（`columns`）导致的代码排版错乱 Bug。
* 采用 **JS 动态分列引擎**，卡片长文本展开时，绝对只平移当前列，相邻列稳如泰山，视觉体验极度舒适。

---

## 🛠️ 技术架构 (Tech Stack)

* **前端 (Client)**：React 19 + Vite 7 + Tailwind CSS v4 + Framer Motion
* **后端 (Server)**：Node.js + Express.js
* **数据库 & ORM**：SQLite + Prisma v6
* **进程管理**：Concurrently (支持单命令同时启动前后端)

---

## 🚀 快速启动 (Getting Started)

本项目使用 `pnpm` 作为包管理器。请确保你的本地已安装 Node.js 和 pnpm。

### 1. 克隆项目与安装依赖
```
git clone [https://github.com/cangyuemazi/ai-tools-navigator.git](https://github.com/cangyuemazi/ai-tools-navigator.git)
cd ai-tools-navigator
pnpm install
```

### 2. 初始化数据库与模型同步

生成本地 SQLite 数据库文件（`dev.db`）并同步 Prisma 模型：

Bash

```
pnpm prisma db push
```

### 3. （可选）导入初始数据

如果你是第一次运行且数据库为空，可通过内置脚本将旧的 JSON 数据一键导入至 SQLite 数据库中：

Bash

```
pnpm dlx tsx scripts/seed.ts
```

### 4. 一键启动全栈服务 🛫

Bash

```
pnpm run dev
```

此命令将同时唤醒：

- **后端 API 服务**：运行在 `http://localhost:3001`
- **前端 Vite 服务**：运行在 `http://localhost:3000` (内置自动代理转发至后端)

启动后，浏览器访问 `http://localhost:3000` 即可体验。

------

## 📂 核心目录结构 (Project Structure)

Plaintext

```
ai-tools-navigator/
├── client/              # 前端 React 源码与页面
├── server/              # 后端 Express 源码 (API 接口定义)
├── prisma/              # 数据库模型 (schema.prisma) 与本地数据库文件
├── scripts/             # 自动化脚本 (如数据库导入脚本 seed.ts)
├── package.json         # 项目依赖与一键启动命令配置
└── vite.config.ts       # Vite 配置 (包含 API 代理配置)
```

------

## 💡 常见问题 (FAQ / Troubleshooting)

**Q: 在 Windows 的 VS Code 终端运行 pnpm 报错 `因为在此系统上禁止运行脚本` 怎么办？** A: 这是 Windows 默认的安全策略限制。请以**管理员身份**打开 Windows PowerShell，运行以下命令即可永久解决：

PowerShell

```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

------

*✨ Designed with minimal aesthetics. Powered by 智能零零 & 你的努力.*