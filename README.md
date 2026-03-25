# 🌟 智能零零 AI 工具导航站 (Smart Zero AI Tools Navigator)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6)

**智能零零 AI 工具导航站** 是一个现代化、轻量级且极具设计感的人工智能工具收录与分发平台。

本项目致力于打造“开箱即用”的高颜值商业级网站模板。不仅具备极简的本地 JSON 数据驱动能力，更在 UI/UX 上深度融入了 Apple 级的设计规范——微暖灰底色、毛玻璃拟态、多层弥散阴影以及物理级弹簧动效，为用户带来极度丝滑流畅的浏览体验。

---

## ✨ 核心亮点 (Key Features)

### 🎨 Apple 级极致视觉美学
* **色彩体系**：采用经典的 `#F5F5F7` 微暖灰作为全局主背景，卡片使用纯白 `#FFFFFF` 悬浮其上，辅以 `#0071E3` 经典苹果蓝作为主色调，留白充足，呼吸感极强。
* **圆角与阴影**：统一采用 20px (Squircle) 大圆角设计，卡片摒弃生硬边框，使用极低透明度（4%）的多层弥散阴影，营造高级的“悬浮”质感。
* **毛玻璃拟态 (Glassmorphism)**：在移动端导航栏、悬浮组件等层级使用了精准的 `backdrop-blur` 半透明模糊设计，既不遮挡内容，又尽显现代感。

### 🌊 丝滑流畅的物理动效
* 全站抛弃生硬的线性过渡，深度集成 `Framer Motion`，采用 `cubic-bezier(0.2, 0.9, 0.4, 1.1)` 弹簧缓动曲线。
* 鼠标悬停（Hover）时，卡片呈现极具物理质感的 `translateY(-4px)` 上浮与阴影加深；点击时带有极其轻微的 `scale(0.98)` 缩放反馈。

### 🧱 真正稳定的瀑布流布局 (True Masonry)
* 抛弃了传统 CSS `columns` 带来的跨列错位 Bug。
* 采用基于 JavaScript 动态计算的物理分列机制（动态切分 1~4 列）。展开长文本介绍时，**绝对只影响当前列的位移**，彻底解决“牵一发而动全身”的排版错位痛点。

### ⚙️ 零门槛的数据配置
* **无需部署数据库**！所有的分类菜单和 AI 工具数据均由静态 JSON 文件 (`categories.json` & `tools.json`) 驱动。
* 即使是非技术人员，只需按照固定格式修改 JSON 文本，即可一秒完成网站内容的增删改查。

### 📱 响应式与贴心组件
* **全端适配**：完美适配超大宽屏、普通桌面端、平板以及手机端。移动端自动切换为底部抽屉式菜单与单列卡片。
* **全局检索**：输入框自带苹果级 Focus 光晕效果，支持对工具名称和简介的实时全文检索。
* **智能悬浮窗**：右下角常驻高级毛玻璃悬浮控件，支持“一键平滑置顶”与“Hover 平滑展示客服微信二维码”。

---

## 🛠️ 技术架构 (Tech Stack)

* **前端框架**：React 19 (搭配 Wouter 进行轻量级路由管理)
* **构建生态**：Vite 7 + TypeScript
* **样式引擎**：Tailwind CSS v4 (原子化 CSS)
* **动效库**：Framer Motion (物理缓动动画)
* **图标库**：Lucide React

---

## 🚀 快速启动 (Getting Started)

本项目推荐使用 `pnpm` 作为包管理工具。

### 1. 克隆项目
```bash
git clone [https://github.com/cangyuemazi/ai-tools-navigator.git](https://github.com/cangyuemazi/ai-tools-navigator.git)
cd ai-tools-navigator
```

### 2. 安装依赖

Bash

```
pnpm install
```

### 3. 本地开发服务器

Bash

```
pnpm run dev
```

启动后，浏览器会自动打开 `http://localhost:3000`。

------

## 📂 数据维护与定制 (Configuration)

你可以轻松定制你的专属导航站，核心数据位于 `client/src/data/` 目录下：

1. **修改网站工具数据**：编辑 `tools.json`。

   JSON

   ```
   {
     "id": "chatgpt",
     "name": "ChatGPT",
     "url": "[https://chatgpt.com](https://chatgpt.com)",
     "logo": "[https://example.com/logo.png](https://example.com/logo.png)",
     "description": "OpenAI 开发的强大语言模型...",
     "categoryId": "ai-chat",
     "tags": ["热门", "免费"],
     "views": 150000
   }
   ```

2. **修改左侧分类树**：编辑 `categories.json`。支持添加父级分类和子级分类，以及绑定不同的 Icon。

3. **更改客服二维码**：只需将你的微信二维码重命名为 `qrcode.png`，并替换掉 `client/public/qrcode.png` 即可，无需改动任何代码。

------

## 📦 生产环境部署 (Deployment)

当你的网站准备好面向世界时，运行以下命令进行生产环境打包：

Bash

```
pnpm run build
```

打包输出的文件将存放在 `dist` 目录中。本项目为纯静态 SPA 应用，你可以零成本将其一键部署到 Vercel, Netlify, Cloudflare Pages 或 GitHub Pages 上！

------

*✨ Designed with minimal aesthetics. Powered by 智能零零 & 你的努力.*