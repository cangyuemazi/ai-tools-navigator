import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 唤醒我们的数据库连接大脑
const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 允许服务器接收和解析 JSON 格式的数据
  app.use(express.json());

  // ==========================================
  // 👇 我们的核心商业 API 接口 👇
  // ==========================================

  // 接口 1: 获取所有分类 (自动拼接成父子树形结构)
  app.get("/api/categories", async (req, res) => {
    try {
      // 找出所有主分类（没有父分类的）
      const mainCategories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
      });

      // 找出所有子分类
      const subCategories = await prisma.category.findMany({
        where: { parentId: { not: null } },
        orderBy: { order: 'asc' },
      });

      // 组装成前端需要的树形结构
      const categoryTree = mainCategories.map(cat => ({
        ...cat,
        children: subCategories.filter(sub => sub.parentId === cat.id),
      }));

      res.json(categoryTree);
    } catch (error) {
      console.error("获取分类失败:", error);
      res.status(500).json({ error: "获取分类数据失败，请联系管理员" });
    }
  });

  // 接口 2: 获取所有工具 (包含赞助商排序逻辑)
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await prisma.tool.findMany({
        orderBy: [
          { isSponsored: 'desc' }, // 核心商业逻辑：赞助的工具永远排在最前面！
          { views: 'desc' }        // 普通工具按照点击浏览量排序
        ]
      });

      // 把数据库里存成字符串的 tags 还原成数组，给前端使用
      const formattedTools = tools.map(tool => ({
        ...tool,
        tags: tool.tags ? JSON.parse(tool.tags) : []
      }));

      res.json(formattedTools);
    } catch (error) {
      console.error("获取工具失败:", error);
      res.status(500).json({ error: "获取工具数据失败，请联系管理员" });
    }
  });

  // ==========================================
  // 👆 API 接口结束 👆
  // ==========================================

  // 静态资源与前端路由兜底配置
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // 注意：这个必须放在所有 API 接口的下面，作用是把未知的链接交给前端去处理
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`🚀 智能零零后端大脑已启动: http://localhost:${port}/`);
  });
}

startServer().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect(); // 断开数据库连接
  process.exit(1);
});