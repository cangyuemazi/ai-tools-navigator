# 🌟 智能零零 AI 工具导航站 (AI Tools Navigator)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6)

智能零零 AI 工具导航站是一个现代化、轻量级且高度可配置的 AI 工具分类与展示平台。本项目旨在帮助用户快速查找、检索和探索各类前沿的人工智能工具，同时也为开发者提供了一个开箱即用的导航网站模板。

## ✨ 核心特性 (Features)

* **⚡️ 极速响应**：基于 Vite 驱动，提供极致的本地开发启动速度和生产环境打包性能。
* **🔍 智能检索**：支持对 AI 工具名称、描述进行实时全文搜索。
* **📂 数据驱动**：无需配置复杂的数据库！工具和分类数据完全基于本地 JSON 文件读取，非技术人员也能轻松修改和维护。
* **📱 响应式设计**：完美适配桌面端、平板和移动端，侧边栏支持平滑折叠与展开。
* **🎨 现代 UI**：采用 Tailwind CSS v4 进行原子化样式管理，配合 Radix UI 无障碍组件库和 Framer Motion 流畅动画，带来原生级的用户体验。

## 🛠️ 技术栈 (Tech Stack)

* **前端框架**：React 19 (搭配 Wouter 进行轻量级路由管理)
* **构建工具**：Vite 7
* **语言**：TypeScript
* **样式方案**：Tailwind CSS 4.1
* **图标库**：Lucide React

## 🚀 快速开始 (Getting Started)

本项目使用 `pnpm` 作为包管理工具。请确保你的本地环境已安装 Node.js 和 pnpm。

### 1. 克隆项目
```bash
git clone [https://github.com/cangyuemazi/ai-tools-navigator.git](https://github.com/cangyuemazi/ai-tools-navigator.git)
cd ai-tools-navigator
```

### 2. 安装依赖

由于项目中指定了 `packageManager` 为 pnpm，请使用以下命令安装：

Bash

```
pnpm install
```

### 3. 启动开发服务器

Bash

```
pnpm run dev
```

启动后，浏览器会自动运行，默认访问地址为 `http://localhost:3000`。

## ⚙️ 项目配置与数据修改 (Configuration)

本项目的核心内容完全通过静态 JSON 文件驱动，无需修改代码逻辑即可更新网站内容。你可以在 `client/src/data/` 目录下找到它们：

- **修改工具分类**：编辑 `categories.json`。支持多级分类结构配置。
- **添加/删除 AI 工具**：编辑 `tools.json`。只需按照预设的字段（如 `name`, `url`, `logo`, `description`）新增 JSON 对象即可。

## 📦 生产环境构建 (Build for Production)

如果需要将项目部署到线上服务器，请运行：

Bash

```
pnpm run build
```

这将会通过 Vite 构建前端资产，并通过 esbuild 打包 Node 服务端文件，输出到 `dist` 目录。

随后可以使用以下命令启动生产环境：

Bash

```
pnpm run start
```

## 📝 目录结构简析 (Project Structure)

Plaintext

```
ai-tools-navigator/
├── client/              # 前端 React 源码目录
│   ├── src/
│   │   ├── components/  # 通用 UI 组件与核心布局
│   │   ├── pages/       # 页面级组件 (Home, About 等)
│   │   └── data/        # JSON 数据源 (categories.json, tools.json)
├── server/              # Node.js 后端服务源码
├── vite.config.ts       # Vite 与插件配置文件
└── package.json         # 项目依赖与脚本清单
```

## 📄 开源协议 (License)

本项目基于 [MIT License](https://www.google.com/search?q=LICENSE) 协议开源。你可以自由地使用、修改和分发本项目代码。