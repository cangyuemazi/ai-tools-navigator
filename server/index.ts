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
import OSS from "ali-oss"; // 👈 新增：引入阿里云 OSS
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

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
  app.set("trust proxy", 1);
  const server = createServer(app);

  app.use(helmet({ 
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    }
  }));
  app.use(express.json());

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 300, 
    message: { error: "您的访问过于频繁，请稍后再试" }
  });
  app.use("/api/", globalLimiter);

  const uploadDir = path.resolve(__dirname, "..", "client", "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use("/uploads", express.static(uploadDir));

  // 👈 修改：Multer 改为内存存储，不再直接写磁盘，方便转存 OSS
  const storage = multer.memoryStorage();
  const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 限制 10MB

  // 👈 新增：核心上传逻辑分发器 (OSS 或 本地)
  const fixOriginalName = (name: string): string => {
    try { return Buffer.from(name, 'latin1').toString('utf-8'); } catch { return name; }
  };

  const uploadToStorage = async (file: Express.Multer.File): Promise<string> => {
    const originalName = fixOriginalName(file.originalname);
    const ext = path.extname(originalName);
    const filename = `img_${crypto.randomUUID()}${ext}`;

    if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_BUCKET) {
      // 存在配置，走阿里云 OSS
      const client = new OSS({
        region: process.env.OSS_REGION || "oss-cn-beijing", // 你的华北2默认地域
        accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
        bucket: process.env.OSS_BUCKET!,
      });
      const result = await client.put(`uploads/${filename}`, file.buffer);
      // 强制返回 HTTPS 链接
      return result.url.replace('http://', 'https://');
    } else {
      // 没配置 OSS 时，自动退回本地存储模式
      const localPath = path.join(uploadDir, filename);
      fs.writeFileSync(localPath, file.buffer);
      return `/uploads/${filename}`;
    }
  };

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

  const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"]);

  const uploadPublicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "上传过于频繁，请稍后再试" }
  });

  // 👈 修改：前台上传接口接入 OSS
  app.post("/api/upload-public", uploadPublicLimiter, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    if (!ALLOWED_IMAGE_MIMES.has(req.file.mimetype)) {
      return res.status(400).json({ error: "仅允许上传图片文件 (jpg/png/gif/webp/svg/ico)" });
    }
    try {
      const url = await uploadToStorage(req.file);
      res.json({ url });
    } catch (e) {
      console.error("OSS上传失败:", e);
      res.status(500).json({ error: "图片上传失败" });
    }
  });

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

  // 👈 修改：后台管理员上传接口接入 OSS
  app.post("/api/admin/upload", requireAuth, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    if (!ALLOWED_IMAGE_MIMES.has(req.file.mimetype)) {
      return res.status(400).json({ error: "仅允许上传图片文件" });
    }
    try {
      const url = await uploadToStorage(req.file);
      res.json({ url });
    } catch (e) {
      console.error("OSS上传失败:", e);
      res.status(500).json({ error: "图片上传失败" });
    }
  });

  // ====== 批量上传图片（多文件） ======
  app.post("/api/admin/upload-batch", requireAuth, upload.array("files", 100), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "未检测到文件" });

    const results: { originalName: string; url?: string; error?: string }[] = [];
    for (const file of files) {
      const originalName = fixOriginalName(file.originalname);
      if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
        results.push({ originalName, error: "不支持的图片格式" });
        continue;
      }
      try {
        // 使用原始文件名（去重用 UUID 前缀）
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        const safeBase = baseName.replace(/[^\w\u4e00-\u9fff\-\.]/g, "_");
        const filename = `${safeBase}_${crypto.randomUUID().slice(0, 8)}${ext}`;

        if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_BUCKET) {
          const client = new OSS({
            region: process.env.OSS_REGION || "oss-cn-beijing",
            accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
            accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
            bucket: process.env.OSS_BUCKET!,
          });
          const result = await client.put(`uploads/${filename}`, file.buffer);
          results.push({ originalName, url: result.url.replace('http://', 'https://') });
        } else {
          const localPath = path.join(uploadDir, filename);
          fs.writeFileSync(localPath, file.buffer);
          results.push({ originalName, url: `/uploads/${filename}` });
        }
      } catch (e) {
        results.push({ originalName, error: "上传失败" });
      }
    }

    const successCount = results.filter(r => r.url).length;
    const failCount = results.filter(r => r.error).length;
    res.json({ total: files.length, successCount, failCount, results });
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
      const aboutContent = req.body.aboutContent || "";
      const partnersContent = req.body.partnersContent || "";
      res.json(await prisma.siteSetting.upsert({ 
        where: { id: "default" }, 
        update: { name, logo, favicon, titleFontSize, backgroundColor, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText, aboutContent, partnersContent }, 
        create: { id: "default", name, logo, favicon, titleFontSize, backgroundColor, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText, aboutContent, partnersContent } 
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

  // ====== 批量导入工具：下载 Excel 模板 ======
  app.get("/api/admin/tools/template", requireAuth, async (_req, res) => {
    try {
      const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
      const mainCats = categories.filter(c => !c.parentId);
      const subCats = categories.filter(c => c.parentId);

      const wb = new ExcelJS.Workbook();

      // === 隐藏辅助 Sheet：分类数据 ===
      const catSheet = wb.addWorksheet("分类数据", { state: "veryHidden" });
      const mainCatNames = mainCats.map(mc => mc.name);
      // 第一行：主分类名称列表（从 B1 开始）
      catSheet.getRow(1).values = ["主分类列表", ...mainCatNames];
      // 后续行：每个主分类对应的子分类
      const maxSubCount = Math.max(1, ...mainCats.map(mc => subCats.filter(s => s.parentId === mc.id).length));
      for (let i = 0; i < maxSubCount; i++) {
        const row: (string | null)[] = [null];
        for (const mc of mainCats) {
          const children = subCats.filter(s => s.parentId === mc.id);
          row.push(children[i]?.name || null);
        }
        catSheet.getRow(i + 2).values = row;
      }

      // 为每个主分类创建命名范围（用于 INDIRECT 联动）
      // 注意：必须为每个主分类都创建，即使没有子分类也要创建空范围，
      // 以确保 MATCH 的索引和命名范围索引对齐
      mainCats.forEach((mc, idx) => {
        const children = subCats.filter(s => s.parentId === mc.id);
        const colLetter = String.fromCharCode(66 + idx); // B=66, C=67, ...
        const safeName = `_Cat_${idx}`;
        const endRow = children.length > 0 ? children.length + 1 : 2;
        wb.definedNames.add(`'分类数据'!$${colLetter}$2:$${colLetter}$${endRow}`, safeName);
      });

      // === 主工作表：工具导入模板 ===
      const ws = wb.addWorksheet("工具导入模板");
      const header = ["名称", "简介", "链接", "Logo图片名", "主分类", "子分类"];
      const headerRow = ws.getRow(1);
      headerRow.values = header;
      // 表头样式：加粗 + 浅灰背景
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8ED" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.protection = { locked: true };
      });

      // 示例行
      const exampleRow = ws.getRow(2);
      exampleRow.values = ["ChatGPT", "OpenAI 的智能对话工具", "https://chat.openai.com", "chatgpt", mainCats[0]?.name || "", ""];

      // 列宽
      ws.columns = [
        { width: 20 }, { width: 40 }, { width: 40 }, { width: 25 }, { width: 20 }, { width: 20 }
      ];

      // 数据区域：标记为 unlocked（可编辑）
      for (let r = 2; r <= 1001; r++) {
        const row = ws.getRow(r);
        for (let c = 1; c <= 6; c++) {
          const cell = row.getCell(c);
          cell.protection = { locked: false };
        }
      }

      // === 主分类下拉验证 (E2:E1001) ===
      // 使用直接列表方式（主分类数量一般不多）
      if (mainCatNames.length > 0) {
        for (let r = 2; r <= 1001; r++) {
          ws.getCell(`E${r}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`"${mainCatNames.join(",")}"`],
            showErrorMessage: true,
            errorTitle: "无效分类",
            error: "请从下拉列表中选择主分类",
          };
        }
      }

      // === 子分类联动下拉验证 (F2:F1001) ===
      // 使用 INDIRECT + MATCH 的方式根据 E 列的主分类查找对应命名范围
      // 因为 Excel Named Range 不能直接用中文做 INDIRECT，使用 INDEX+MATCH 间接引用
      // 策略：为每行构建 INDIRECT("_Cat_" & MATCH(E{row}, 主分类列表, 0)-1)
      if (mainCats.some((mc) => subCats.some(s => s.parentId === mc.id))) {
        // 计算主分类在分类数据 sheet 中的范围引用（B1:XX1）
        const lastColLetter = String.fromCharCode(65 + mainCatNames.length); // A + count
        for (let r = 2; r <= 1001; r++) {
          ws.getCell(`F${r}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`INDIRECT("_Cat_"&MATCH(E${r},'分类数据'!$B$1:$${lastColLetter}$1,0)-1)`],
            showErrorMessage: true,
            errorTitle: "无效子分类",
            error: "请先选择主分类，再从下拉列表中选择子分类",
          };
        }
      }

      // 工作表保护：只有表头行锁定，其余可编辑
      await ws.protect("", {
        selectLockedCells: true,
        selectUnlockedCells: true,
        formatCells: true,
        formatColumns: true,
        formatRows: true,
        insertRows: true,
        deleteRows: true,
        sort: true,
        autoFilter: true,
      });

      // 输出
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=tools_import_template.xlsx");
      const buffer = await wb.xlsx.writeBuffer();
      res.send(Buffer.from(buffer));
    } catch (e) {
      console.error("生成模板失败:", e);
      res.status(500).json({ error: "生成模板失败" });
    }
  });

  // ====== 批量导入工具：上传 Excel ======
  const ALLOWED_EXCEL_MIMES = new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/octet-stream",
  ]);
  app.post("/api/admin/tools/batch-import", requireAuth, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    if (!ALLOWED_EXCEL_MIMES.has(req.file.mimetype) && !req.file.originalname.match(/\.xlsx?$/i)) {
      return res.status(400).json({ error: "请上传 .xlsx 或 .xls 格式的 Excel 文件" });
    }

    try {
      const wb = XLSX.read(req.file.buffer, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (!rows.length) return res.status(400).json({ error: "Excel 中没有数据行" });

      const categories = await prisma.category.findMany();
      const mainCats = categories.filter(c => !c.parentId);
      const subCats = categories.filter(c => c.parentId);

      // 构建 OSS 前缀
      let ossPrefix = "";
      if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_BUCKET) {
        const region = process.env.OSS_REGION || "oss-cn-beijing";
        ossPrefix = `https://${process.env.OSS_BUCKET}.${region}.aliyuncs.com/uploads/`;
      }

      // 读取 uploads 目录中的所有文件用于按名称匹配（无后缀匹配）
      let uploadedFiles: string[] = [];
      try {
        uploadedFiles = fs.readdirSync(uploadDir);
      } catch { /* 目录不存在则跳过 */ }

      const results: { row: number; name: string; ok: boolean; error?: string }[] = [];

      // 支持中文列头和英文列头的字段映射
      const fieldMap: Record<string, string> = {
        "名称": "name", "name": "name",
        "简介": "description", "description": "description",
        "链接": "url", "url": "url",
        "Logo图片名": "logoFileName", "logoFileName": "logoFileName",
        "主分类": "categoryName", "categoryName": "categoryName",
        "子分类": "subCategoryName", "subCategoryName": "subCategoryName",
        "标签": "tags", "tags": "tags",
      };

      for (let i = 0; i < rows.length; i++) {
        const rawRow = rows[i];
        const rowNum = i + 2; // Excel 行号（跳过表头）

        // 将中文/英文列头统一映射
        const row: Record<string, string> = {};
        for (const [key, value] of Object.entries(rawRow)) {
          const mapped = fieldMap[key.trim()];
          if (mapped) row[mapped] = String(value || "").trim();
        }

        const name = xss(row.name || "");
        const description = xss(row.description || "");
        const url = xss(row.url || "");
        const logoFileName = (row.logoFileName || "").trim();
        const categoryName = (row.categoryName || "").trim();
        const subCategoryName = (row.subCategoryName || "").trim();

        if (!name || !url) {
          results.push({ row: rowNum, name: name || "(空)", ok: false, error: "名称和链接为必填项" });
          continue;
        }

        const mainCat = mainCats.find(c => c.name === categoryName);
        if (!mainCat) {
          results.push({ row: rowNum, name, ok: false, error: `主分类 "${categoryName}" 不存在` });
          continue;
        }

        let subCatId: string | null = null;
        if (subCategoryName) {
          const sub = subCats.find(c => c.name === subCategoryName && c.parentId === mainCat.id);
          if (!sub) {
            results.push({ row: rowNum, name, ok: false, error: `子分类 "${subCategoryName}" 不存在于 "${categoryName}" 下` });
            continue;
          }
          subCatId = sub.id;
        }

        let logo = "";
        if (logoFileName) {
          if (logoFileName.startsWith("http://") || logoFileName.startsWith("https://")) {
            logo = logoFileName;
          } else {
            // 按名称匹配（不要求后缀）：在uploads目录中查找文件名（不含后缀）匹配的文件
            const matchedFile = uploadedFiles.find(f => {
              const nameWithoutExt = path.basename(f, path.extname(f));
              return nameWithoutExt === logoFileName || f === logoFileName;
            });
            if (matchedFile) {
              if (ossPrefix) {
                logo = ossPrefix + matchedFile;
              } else {
                logo = `/uploads/${matchedFile}`;
              }
            } else if (ossPrefix) {
              logo = ossPrefix + logoFileName;
            } else {
              logo = `/uploads/${logoFileName}`;
            }
          }
        }

        try {
          await prisma.tool.create({
            data: {
              name,
              description,
              url,
              logo,
              categoryId: mainCat.id,
              subCategoryId: subCatId,
              tags: "[]",
            },
          });
          results.push({ row: rowNum, name, ok: true });
        } catch (e: any) {
          results.push({ row: rowNum, name, ok: false, error: "数据库写入失败" });
        }
      }

      const successCount = results.filter(r => r.ok).length;
      const failCount = results.filter(r => !r.ok).length;
      res.json({ success: true, total: rows.length, successCount, failCount, details: results });
    } catch (e) {
      console.error("批量导入失败:", e);
      res.status(500).json({ error: "Excel 解析失败，请检查文件格式" });
    }
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

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // 优雅处理 Multer 文件上传错误
    if (err.code === 'LIMIT_FILE_SIZE') {
      if (!res.headersSent) res.status(413).json({ error: "文件大小超出限制（最大 10MB）" });
      return;
    }
    if (err.name === 'MulterError') {
      if (!res.headersSent) res.status(400).json({ error: `上传错误：${err.message}` });
      return;
    }
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