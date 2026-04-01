# AI Tools Navigator

语言切换: [中文](./README.zh-CN.md) | [English](./README.en.md) | [日本語](./README.ja.md)

## 项目简介

AI Tools Navigator 是一个面向 AI 工具导航站场景的全栈网站模板。它把前台展示、用户投稿、后台审核、工具管理、分类排序、站点品牌配置和基础安全控制整合在同一个仓库里，适合用来搭建可持续运营的 AI 工具目录站。

当前代码实现不是静态导航页，而是基于 Prisma 和 MySQL 的动态数据站点。前台通过 API 获取分类、工具和站点设置；后台负责审核投稿、发布工具、维护分类顺序，并统一管理站点品牌信息与协议文案。

## 适用场景

- 搭建 AI 工具导航站、资源目录站、产品收录站
- 需要开放用户投稿，再由运营人员审核上线
- 需要区分公开展示与后台运营能力
- 需要按赞助、高权重和浏览量排序工具曝光位置
- 需要让非开发人员维护分类、工具和站点基础信息

## 当前版本包含的能力

### 1. 前台浏览与发现

- 首页按分类展示工具内容
- 提供独立的“全部工具”视图
- 工具列表来自 `/api/tools`，排序规则为：赞助优先、手动排序值优先、浏览量优先
- 分类来自 `/api/categories`，主分类和子分类都按 `order` 字段升序排列
- 非后台页面使用持久化壳层结构，侧边栏和主内容区切换更稳定

### 2. 工具投稿流程

- 用户可在 `/submit` 页面提交工具
- 支持上传 Logo，文件通过公开上传接口保存到 `client/public/uploads/`
- 提交字段包括 Logo、工具名、简介、官网、联系方式、主分类和子分类
- 前台提交会进入 `PendingTool` 审核池，不会直接公开上线
- 提交接口带有更严格的限流保护，默认每个 IP 每小时最多 5 次

### 3. 管理后台

- 后台入口为 `/admin`
- 使用简单 Bearer Token 方式鉴权，令牌即 `.env` 中的 `ADMIN_PASSWORD`
- 支持查看数据概览，包括工具数量、待审核数量、近一周新增、近一月新增、分类分布和热门工具
- 支持审核待发布工具，一键带入正式发布表单
- 支持新增、编辑、删除工具
- 支持新增、编辑、删除分类
- 支持主分类和同父级子分类排序
- 支持编辑站点名称、Logo、Favicon、标题字号、背景色、页脚信息、服务协议和隐私政策

### 4. 基础安全与运营保护

- 全局 `helmet` 安全头
- 全局 API 限流
- 投稿接口单独限流
- 对投稿内容做基础 `xss` 过滤
- 上传大小限制为 5MB

## 页面与路由说明

### 公开页面

- `/`：首页，按分类浏览工具
- `/all-tools`：全部工具视图
- `/submit`：用户投稿页面
- `/about`：关于页面
- `/partners`：合作页面
- `/terms`：提交服务协议
- `/privacy`：隐私政策

### 后台页面

- `/admin`：管理后台入口

## 技术栈

### 前端

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI / shadcn 风格组件
- Framer Motion
- Wouter

### 后端

- Express 4
- Prisma 6
- MySQL
- Multer

### 辅助能力

- Recharts：后台图表
- React Hook Form + Zod：表单能力
- helmet：安全头
- express-rate-limit：限流
- xss：输入过滤

## 目录结构

```text
.
├─ client/                  # Vite 前端项目根目录
│  ├─ public/               # 静态资源与上传文件目录
│  └─ src/
│     ├─ components/        # 页面组件与基础 UI
│     ├─ contexts/          # 上下文
│     ├─ data/              # 本地示例数据
│     ├─ hooks/             # 自定义 Hook
│     ├─ pages/             # 页面级组件
│     ├─ types/             # 类型定义
│     └─ App.tsx            # 路由入口
├─ server/                  # Express API 服务
├─ prisma/                  # Prisma Schema 与迁移
├─ scripts/                 # 辅助脚本，例如 seed
├─ shared/                  # 前后端共享常量
└─ vite.config.ts           # Vite 配置，前端根目录指向 client/
```

## 数据模型概览

当前核心表如下：

- `Tool`：正式上线工具
- `Category`：主分类与子分类
- `PendingTool`：用户投稿待审核数据
- `SiteSetting`：站点名称、品牌视觉、页脚信息、协议文本等全局配置

其中需要特别注意的业务字段：

- `Tool.isSponsored`：是否赞助
- `Tool.order`：手动排序权重，越高越靠前
- `Tool.views`：浏览量排序依据之一
- `Category.order`：分类显示顺序
- `PendingTool.categoryId / subCategoryId`：投稿时提交的分类信息

## 本地开发

### 环境要求

- Node.js 18 或更高版本
- pnpm
- MySQL

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在项目根目录创建 `.env`：

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/ai_tools_navigator"
ADMIN_PASSWORD="change-this-password"
PORT="3001"
```

可选的前端环境变量还包括：

- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`

### 3. 初始化数据库

如果你要应用当前迁移：

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

如果你只是本地快速同步 schema，也可以使用：

```bash
pnpm prisma generate
pnpm prisma db push
```

如需导入示例数据：

```bash
pnpm exec tsx scripts/seed.ts
```

### 4. 启动开发环境

```bash
pnpm dev
```

默认地址：

- 前端: `http://localhost:3000`
- 后端: `http://localhost:3001`
- 管理后台: `http://localhost:3000/admin`

`pnpm dev` 会同时启动：

- `vite --host`
- `tsx watch server/index.ts`

## API 概览

### 公开接口

- `GET /api/settings`：读取站点配置
- `GET /api/categories`：读取分类树
- `GET /api/tools`：读取正式上线工具列表
- `POST /api/upload-public`：公开上传图片
- `POST /api/submit-tool`：提交工具到审核池

### 后台接口

- `POST /api/admin/login`：后台登录验证
- `POST /api/admin/upload`：后台上传图片
- `PUT /api/admin/settings`：更新站点设置
- `GET /api/admin/tools`：读取全部工具
- `POST /api/admin/tools`：新建工具
- `PUT /api/admin/tools/:id`：更新工具
- `DELETE /api/admin/tools/:id`：删除工具
- `GET /api/admin/pending-tools`：读取待审核列表
- `DELETE /api/admin/pending-tools/:id`：删除待审核记录
- `POST /api/admin/categories`：创建分类
- `PUT /api/admin/categories/:id`：编辑分类
- `DELETE /api/admin/categories/:id`：删除分类
- `POST /api/admin/categories/reorder`：提交分类排序

后台请求需要携带：

```http
Authorization: Bearer <ADMIN_PASSWORD>
```

## 运营流程建议

典型流程如下：

1. 运营人员在后台预先配置分类结构与站点品牌信息。
2. 用户通过 `/submit` 提交工具。
3. 投稿进入待审核池。
4. 管理员在后台审核、补充标签、调整排序值或赞助状态后发布。
5. 前台工具列表自动按排序规则展示。

## 需要注意的实现细节

- 前台真实数据来源是数据库和 API，不是纯 JSON 文件。
- 仓库里仍保留了部分本地示例数据和旧说明文档，使用前请以当前 `client/src`、`server/index.ts` 和 `prisma/schema.prisma` 为准。
- 当前 `package.json` 已提供开发与前端构建命令；如果你要部署集成式生产服务，需要根据目标环境补充后端启动方式与静态资源发布流程。

## 可执行校验命令

仓库记忆中已验证可用的命令包括：

```bash
pnpm exec tsc --noEmit
pnpm build
```

## License

MIT