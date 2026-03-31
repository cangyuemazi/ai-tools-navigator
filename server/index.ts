import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";
// 👇 新增的安全防护库
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadLocalEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadLocalEnv();

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 👇 1. 开启基础安全头，隐藏 Express 指纹
  app.use(helmet({ crossOriginResourcePolicy: false })); // 允许跨域加载图片
  app.use(express.json());

  // 👇 2. 全局基础限流 (每个IP 15分钟内最多请求 300 次)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 300, 
    message: { error: "您的访问过于频繁，请稍后再试" }
  });
  app.use("/api/", globalLimiter);

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
      const tools = await prisma.tool.findMany({ orderBy: [{ isSponsored: 'desc' }, { order: 'desc' }, { views: 'desc' }] });
      res.json(tools.map(tool => ({ ...tool, tags: tool.tags ? JSON.parse(tool.tags) : [] })));
    } catch (e) { res.status(500).json({ error: "获取工具失败" }); }
  });

  app.post("/api/upload-public", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // 👇 3. 针对“提交工具”接口开启严苛限流 (每个IP 1小时只能提交 5 次)
  const submitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: "提交过于频繁，请休息一小时后再提交" }
  });

  app.post("/api/submit-tool", submitLimiter, async (req, res) => {
    try {
      const name = xss(req.body.name);
      const description = xss(req.body.description);
      const url = xss(req.body.url);
      const contactInfo = xss(req.body.contactInfo || "");
      const logo = xss(req.body.logo || "");
      const categoryId = xss(req.body.categoryId || "");
      const subCategoryId = xss(req.body.subCategoryId || "");

      if (!name || !description || !url || !logo || !categoryId) {
        return res.status(400).json({ error: "Logo、工具名称、简介、官网链接和分类必填" });
      }
      const pending = await prisma.pendingTool.create({
        data: { name, description, url, contactInfo, logo, categoryId, subCategoryId: subCategoryId || null, status: "pending" }
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
  const normalizeParentId = (value: unknown) => {
    const stringValue = typeof value === "string" ? value.trim() : "";
    return stringValue ? stringValue : null;
  };

  app.post("/api/admin/login", (req, res) => {
    if (req.body.password === ADMIN_PASS) res.json({ success: true }); else res.status(401).json({ error: "密码错误" });
  });

  app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.put("/api/admin/settings", requireAuth, async (req, res) => {
    // 👇 接收前端传来的 termsText 和 privacyText
    const { name, logo, favicon, titleFontSize, backgroundColor, companyIntro, icp, email, termsText, privacyText } = req.body;
    res.json(await prisma.siteSetting.upsert({ 
      where: { id: "default" }, 
      update: { name, logo, favicon, titleFontSize: Number(titleFontSize), backgroundColor, companyIntro, icp, email, termsText, privacyText }, 
      create: { id: "default", name, logo, favicon, titleFontSize: Number(titleFontSize), backgroundColor, companyIntro, icp, email, termsText, privacyText } 
    }));
  });

  app.post("/api/admin/categories", requireAuth, async (req, res) => {
    const parentId = normalizeParentId(req.body.parentId);
    const lastCategory = await prisma.category.findFirst({ where: { parentId }, orderBy: { order: "desc" } });
    res.json(await prisma.category.create({ data: { name: req.body.name, parentId, icon: parentId ? null : (req.body.icon || "Box"), order: (lastCategory?.order || 0) + 1 } }));
  });
  app.put("/api/admin/categories/:id", requireAuth, async (req, res) => {
    const parentId = normalizeParentId(req.body.parentId);
    res.json(await prisma.category.update({ where: { id: req.params.id }, data: { name: req.body.name, parentId, icon: parentId ? null : (req.body.icon || "Box") } }));
  });
  app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
    await prisma.category.deleteMany({ where: { parentId: req.params.id } });
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });
  app.post("/api/admin/categories/reorder", requireAuth, async (req, res) => {
    const orderedIds = Array.isArray(req.body.orderedIds)
      ? req.body.orderedIds.filter((id: unknown): id is string => typeof id === "string")
      : [];
    if (!orderedIds.length) return res.status(400).json({ error: "缺少排序数据" });

    await prisma.$transaction(
      orderedIds.map((id: string, index: number) => prisma.category.update({ where: { id }, data: { order: index + 1 } }))
    );

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

  app.get("/api/admin/pending-tools", requireAuth, async (_req, res) => {
    try {
      res.json(await prisma.pendingTool.findMany({ orderBy: { createdAt: 'desc' } }));
    } catch (e: any) {
      res.status(500).json({ error: e.message || "获取待审核工具失败" });
    }
  });
  app.delete("/api/admin/pending-tools/:id", requireAuth, async (req, res) => {
    try {
      await prisma.pendingTool.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "删除待审核工具失败" });
    }
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