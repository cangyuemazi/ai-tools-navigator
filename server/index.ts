import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ==========================================
  // 1. 公开数据接口 (前端展示用)
  // ==========================================
  app.get("/api/settings", async (req, res) => {
    try {
      let setting = await prisma.siteSetting.findUnique({ where: { id: "default" } });
      if (!setting) setting = await prisma.siteSetting.create({ data: { id: "default", name: "智能零零AI工具" } });
      res.json(setting);
    } catch (e) { res.status(500).json({ error: "获取设置失败" }); }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const mainCategories = await prisma.category.findMany({ where: { parentId: null }, orderBy: { order: 'asc' } });
      const subCategories = await prisma.category.findMany({ where: { parentId: { not: null } }, orderBy: { order: 'asc' } });
      res.json(mainCategories.map(cat => ({ ...cat, children: subCategories.filter(sub => sub.parentId === cat.id) })));
    } catch (e) { res.status(500).json({ error: "获取分类失败" }); }
  });

  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await prisma.tool.findMany({ orderBy: [{ isSponsored: 'desc' }, { views: 'desc' }] });
      res.json(tools.map(tool => ({ ...tool, tags: tool.tags ? JSON.parse(tool.tags) : [] })));
    } catch (e) { res.status(500).json({ error: "获取工具失败" }); }
  });

  // 👇 新增：前台客户自助提交工具接口 👇
  app.post("/api/submit-tool", async (req, res) => {
    try {
      const { name, description, url, contactInfo } = req.body;
      if (!name || !url) return res.status(400).json({ error: "工具名称和链接为必填项" });
      
      const pending = await prisma.pendingTool.create({
        data: { name, description, url, contactInfo, status: "pending" }
      });
      res.json({ success: true, data: pending });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ==========================================
  // 2. 管理后台专用接口 (带独立安全鉴权)
  // ==========================================
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers.authorization === `Bearer ${ADMIN_PASS}`) next();
    else res.status(401).json({ error: "无权访问" });
  };

  app.post("/api/admin/login", (req, res) => {
    if (req.body.password === ADMIN_PASS) res.json({ success: true });
    else res.status(401).json({ error: "密码错误" });
  });

  const uploadDir = path.resolve(__dirname, "..", "client", "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use("/uploads", express.static(uploadDir));
  const upload = multer({ storage: multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadDir), filename: (req, file, cb) => cb(null, `img_${Date.now()}${path.extname(file.originalname)}`) }) });

  app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.put("/api/admin/settings", requireAuth, async (req, res) => {
    const { name, logo } = req.body;
    res.json(await prisma.siteSetting.upsert({ where: { id: "default" }, update: { name, logo }, create: { id: "default", name, logo } }));
  });

  app.post("/api/admin/categories", requireAuth, async (req, res) => {
    res.json(await prisma.category.create({ data: { name: req.body.name, parentId: req.body.parentId, icon: req.body.icon || "Box" } }));
  });
  app.put("/api/admin/categories/:id", requireAuth, async (req, res) => {
    res.json(await prisma.category.update({ where: { id: req.params.id }, data: req.body }));
  });
  app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
    await prisma.category.deleteMany({ where: { parentId: req.params.id } });
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.get("/api/admin/tools", requireAuth, async (req, res) => {
    const tools = await prisma.tool.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(tools.map(t => ({ ...t, tags: t.tags ? JSON.parse(t.tags) : [] })));
  });
  app.post("/api/admin/tools", requireAuth, async (req, res) => {
    const { name, description, url, logo, categoryId, subCategoryId, tags, isSponsored, sponsorExpiry } = req.body;
    res.json(await prisma.tool.create({ data: { name, description, url, logo, categoryId, subCategoryId: subCategoryId || null, tags: JSON.stringify(tags || []), isSponsored: Boolean(isSponsored), sponsorExpiry: sponsorExpiry ? new Date(sponsorExpiry) : null } }));
  });
  app.put("/api/admin/tools/:id", requireAuth, async (req, res) => {
    const { name, description, url, logo, categoryId, subCategoryId, tags, isSponsored, sponsorExpiry } = req.body;
    res.json(await prisma.tool.update({ where: { id: req.params.id }, data: { name, description, url, logo, categoryId, subCategoryId: subCategoryId || null, tags: JSON.stringify(tags || []), isSponsored: Boolean(isSponsored), sponsorExpiry: sponsorExpiry ? new Date(sponsorExpiry) : null } }));
  });
  app.delete("/api/admin/tools/:id", requireAuth, async (req, res) => {
    await prisma.tool.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // 👇 新增：后台获取待审核列表与删除记录 👇
  app.get("/api/admin/pending-tools", requireAuth, async (req, res) => {
    const pending = await prisma.pendingTool.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(pending);
  });
  app.delete("/api/admin/pending-tools/:id", requireAuth, async (req, res) => {
    await prisma.pendingTool.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

  const port = process.env.PORT || 3001;
  server.listen(port, () => console.log(`🚀 后端已启动: http://localhost:${port}/`));
}

startServer().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});