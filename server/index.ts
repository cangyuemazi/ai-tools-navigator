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

  // 初始化图片上传目录
  const uploadDir = path.resolve(__dirname, "..", "client", "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use("/uploads", express.static(uploadDir));

  // Multer 配置
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `img_${Date.now()}${path.extname(file.originalname)}`)
  });
  const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 限制 5MB

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
      // 👈 核心排序逻辑：先按赞助排，再按“自定义排序权重 order”倒序，最后按浏览量
      const tools = await prisma.tool.findMany({ orderBy: [{ isSponsored: 'desc' }, { order: 'desc' }, { views: 'desc' }] });
      res.json(tools.map(tool => ({ ...tool, tags: tool.tags ? JSON.parse(tool.tags) : [] })));
    } catch (e) { res.status(500).json({ error: "获取工具失败" }); }
  });

  // 公开图片上传接口 (客户提交表单专用)
  app.post("/api/upload-public", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // 前台客户提交接口
  app.post("/api/submit-tool", async (req, res) => {
    try {
      const { name, description, url, contactInfo, logo } = req.body;
      if (!name || !url) return res.status(400).json({ error: "工具名称和链接必填" });
      const pending = await prisma.pendingTool.create({
        data: { name, description, url, contactInfo, logo, status: "pending" }
      });
      res.json({ success: true, data: pending });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ==========================================
  // 2. 管理后台专用接口 (带鉴权)
  // ==========================================
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers.authorization === `Bearer ${ADMIN_PASS}`) next(); else res.status(401).json({ error: "无权访问" });
  };

  app.post("/api/admin/login", (req, res) => {
    if (req.body.password === ADMIN_PASS) res.json({ success: true }); else res.status(401).json({ error: "密码错误" });
  });

  app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.put("/api/admin/settings", requireAuth, async (req, res) => {
    const { name, logo, favicon, titleFontSize, backgroundColor, companyIntro, icp, email } = req.body;
    res.json(await prisma.siteSetting.upsert({ 
      where: { id: "default" }, 
      update: { name, logo, favicon, titleFontSize: Number(titleFontSize), backgroundColor, companyIntro, icp, email }, 
      create: { id: "default", name, logo, favicon, titleFontSize: Number(titleFontSize), backgroundColor, companyIntro, icp, email } 
    }));
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
    const { name, description, url, logo, categoryId, subCategoryId, tags, isSponsored, sponsorExpiry, order } = req.body;
    res.json(await prisma.tool.create({ data: { name, description, url, logo, categoryId, subCategoryId: subCategoryId || null, tags: JSON.stringify(tags || []), isSponsored: Boolean(isSponsored), sponsorExpiry: sponsorExpiry ? new Date(sponsorExpiry) : null, order: Number(order) || 0 } }));
  });
  app.put("/api/admin/tools/:id", requireAuth, async (req, res) => {
    const { name, description, url, logo, categoryId, subCategoryId, tags, isSponsored, sponsorExpiry, order } = req.body;
    res.json(await prisma.tool.update({ where: { id: req.params.id }, data: { name, description, url, logo, categoryId, subCategoryId: subCategoryId || null, tags: JSON.stringify(tags || []), isSponsored: Boolean(isSponsored), sponsorExpiry: sponsorExpiry ? new Date(sponsorExpiry) : null, order: Number(order) || 0 } }));
  });
  app.delete("/api/admin/tools/:id", requireAuth, async (req, res) => {
    await prisma.tool.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.get("/api/admin/pending-tools", requireAuth, async (req, res) => {
    res.json(await prisma.pendingTool.findMany({ orderBy: { createdAt: 'desc' } }));
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