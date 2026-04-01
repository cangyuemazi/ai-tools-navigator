import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss";
import jwt from "jsonwebtoken";

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
    filename: (req, file, cb) => cb(null, `img_${crypto.randomUUID()}${path.extname(file.originalname)}`)
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
      const page = parseInt(req.query.page as string) || 0;
      const limit = parseInt(req.query.limit as string) || 0;
      const orderBy = [{ isSponsored: 'desc' as const }, { order: 'desc' as const }, { views: 'desc' as const }];

      if (page > 0 && limit > 0) {
        const safeLimit = Math.min(limit, 200);
        const [tools, total] = await Promise.all([
          prisma.tool.findMany({ orderBy, skip: (page - 1) * safeLimit, take: safeLimit }),
          prisma.tool.count()
        ]);
        res.json({ tools: tools.map(tool => ({ ...tool, tags: tool.tags ? JSON.parse(tool.tags) : [] })), total, page, limit: safeLimit });
      } else {
        const tools = await prisma.tool.findMany({ orderBy });
        res.json(tools.map(tool => ({ ...tool, tags: tool.tags ? JSON.parse(tool.tags) : [] })));
      }
    } catch (e) { res.status(500).json({ error: "获取工具失败" }); }
  });

  // 允许上传的图片 MIME 白名单
  const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"]);

  const uploadPublicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "上传过于频繁，请稍后再试" }
  });

  app.post("/api/upload-public", uploadPublicLimiter, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    if (!ALLOWED_IMAGE_MIMES.has(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "仅允许上传图片文件 (jpg/png/gif/webp/svg/ico)" });
    }
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
    } catch { res.status(500).json({ error: "提交工具失败，请稍后重试" }); }
  });

  // ==========================================
  // 2. 管理后台专用接口 (带鉴权)
  // ==========================================
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";
  const JWT_SECRET = process.env.JWT_SECRET || crypto.randomUUID() + crypto.randomUUID();
  const JWT_EXPIRES_IN = "24h";

  if (ADMIN_PASS === "admin123") {
    console.warn("⚠️  警告：正在使用默认管理员密码，请在 .env 中设置 ADMIN_PASSWORD 以确保安全");
  }
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️  警告：未配置 JWT_SECRET，已使用随机值（重启后所有已登录 token 将失效）。建议在 .env 中设置 JWT_SECRET");
  }

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "无权访问" });
    const token = authHeader.slice(7);
    try {
      jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ error: "登录已过期，请重新登录" });
    }
  };
  const normalizeParentId = (value: unknown) => {
    const stringValue = typeof value === "string" ? value.trim() : "";
    return stringValue ? stringValue : null;
  };

  app.post("/api/admin/login", (req, res) => {
    if (req.body.password === ADMIN_PASS) {
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "密码错误" });
    }
  });

  app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    if (!ALLOWED_IMAGE_MIMES.has(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "仅允许上传图片文件" });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.put("/api/admin/settings", requireAuth, async (req, res) => {
    try {
      const name = xss(req.body.name || "");
      const logo = req.body.logo || "";
      const favicon = req.body.favicon || "";
      const titleFontSize = Number(req.body.titleFontSize) || 17;
      const backgroundColor = xss(req.body.backgroundColor || "#f5f5f7");
      const companyIntro = xss(req.body.companyIntro || "");
      const icp = xss(req.body.icp || "");
      const email = xss(req.body.email || "");
      const customerServiceQrCode = req.body.customerServiceQrCode || "";
      const termsText = req.body.termsText || "";
      const privacyText = req.body.privacyText || "";
      res.json(await prisma.siteSetting.upsert({ 
        where: { id: "default" }, 
        update: { name, logo, favicon, titleFontSize, backgroundColor, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText }, 
        create: { id: "default", name, logo, favicon, titleFontSize, backgroundColor, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText } 
      }));
    } catch { res.status(500).json({ error: "保存设置失败" }); }
  });

  app.post("/api/admin/categories", requireAuth, async (req, res) => {
    try {
      const parentId = normalizeParentId(req.body.parentId);
      const name = xss(req.body.name || "");
      const icon = parentId ? null : xss(req.body.icon || "Box");
      const lastCategory = await prisma.category.findFirst({ where: { parentId }, orderBy: { order: "desc" } });
      res.json(await prisma.category.create({ data: { name, parentId, icon, order: (lastCategory?.order || 0) + 1 } }));
    } catch { res.status(500).json({ error: "创建分类失败" }); }
  });
  app.put("/api/admin/categories/:id", requireAuth, async (req, res) => {
    try {
      const parentId = normalizeParentId(req.body.parentId);
      const name = xss(req.body.name || "");
      const icon = parentId ? null : xss(req.body.icon || "Box");
      res.json(await prisma.category.update({ where: { id: req.params.id }, data: { name, parentId, icon } }));
    } catch { res.status(500).json({ error: "更新分类失败" }); }
  });
  app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
    try {
      await prisma.category.deleteMany({ where: { parentId: req.params.id } });
      await prisma.category.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch { res.status(500).json({ error: "删除分类失败" }); }
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
    try {
      const tools = await prisma.tool.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(tools.map(t => ({ ...t, tags: t.tags ? JSON.parse(t.tags) : [] })));
    } catch { res.status(500).json({ error: "获取工具列表失败" }); }
  });
  app.post("/api/admin/tools", requireAuth, async (req, res) => {
    try {
      const data = {
        name: xss(req.body.name || ""),
        description: xss(req.body.description || ""),
        url: xss(req.body.url || ""),
        logo: req.body.logo || "",
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategoryId || null,
        tags: JSON.stringify(req.body.tags || []),
        isSponsored: Boolean(req.body.isSponsored),
        sponsorExpiry: req.body.sponsorExpiry ? new Date(req.body.sponsorExpiry) : null,
        order: Number(req.body.order) || 0
      };
      res.json(await prisma.tool.create({ data }));
    } catch { res.status(500).json({ error: "创建工具失败" }); }
  });
  app.put("/api/admin/tools/:id", requireAuth, async (req, res) => {
    try {
      const data = {
        name: xss(req.body.name || ""),
        description: xss(req.body.description || ""),
        url: xss(req.body.url || ""),
        logo: req.body.logo || "",
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategoryId || null,
        tags: JSON.stringify(req.body.tags || []),
        isSponsored: Boolean(req.body.isSponsored),
        sponsorExpiry: req.body.sponsorExpiry ? new Date(req.body.sponsorExpiry) : null,
        order: Number(req.body.order) || 0
      };
      res.json(await prisma.tool.update({ where: { id: req.params.id }, data }));
    } catch { res.status(500).json({ error: "更新工具失败" }); }
  });
  app.delete("/api/admin/tools/:id", requireAuth, async (req, res) => {
    try {
      await prisma.tool.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch { res.status(500).json({ error: "删除工具失败" }); }
  });

  app.get("/api/admin/pending-tools", requireAuth, async (_req, res) => {
    try {
      res.json(await prisma.pendingTool.findMany({ orderBy: { createdAt: 'desc' } }));
    } catch {
      res.status(500).json({ error: "获取待审核工具失败" });
    }
  });
  app.delete("/api/admin/pending-tools/:id", requireAuth, async (req, res) => {
    try {
      await prisma.pendingTool.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "删除待审核工具失败" });
    }
  });

  // 全局错误兜底中间件 — 捕获所有未处理的异步/同步异常
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "服务器内部错误，请稍后重试" });
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