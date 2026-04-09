import compression from "compression";
import OSS from "ali-oss";
import ExcelJS from "exceljs";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import helmet from "helmet";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";
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
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadLocalEnv();

const prisma = new PrismaClient();

const DEFAULT_SITE_NAME = "智能零零AI工具";
const TOOL_IMPORT_SHEET_NAME = "工具导入模板";
const UPLOADS_PREFIX = "uploads/";

type ToolCategoryInput = {
  categoryId: string;
  subCategoryId: string | null;
};

type UploadedAssetCandidate = {
  fileName: string;
  storageKey: string;
  url: string;
  source: "local" | "oss";
};

const sanitizeUploadBaseName = (value: string) => {
  const normalized = value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/:"*?<>|]+/g, "-")
    .replace(/[^\w\u4e00-\u9fff.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "");

  return normalized.slice(0, 80) || "image";
};

const getOssClient = () => {
  if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET || !process.env.OSS_BUCKET) return null;
  return new OSS({
    region: process.env.OSS_REGION || "oss-cn-beijing",
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
  });
};

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

const isMissingSchemaColumnError = (error: unknown) => /Unknown column|does not exist|P2021|P2022/i.test(getErrorMessage(error));

const normalizeImportHeader = (value: string) => value.replace(/\uFEFF/g, "").replace(/\s+/g, "").trim().toLowerCase();

const parseStoredSubCategoryId = (value: string | null | undefined) => value ? value : null;

const toStoredSubCategoryId = (value: string | null | undefined) => value || "";

const getUploadedFileName = (value: string) => value.replace(/\\/g, "/").split("/").pop() || value;

const getUploadedFileBaseName = (value: string) => {
  const fileName = getUploadedFileName(value);
  const ext = path.extname(fileName);
  return ext ? fileName.slice(0, -ext.length) : fileName;
};

const encodePathSegments = (value: string) => value.split("/").map((segment) => encodeURIComponent(segment)).join("/");

const buildOssObjectUrl = (storageKey: string) => {
  if (!process.env.OSS_BUCKET || !process.env.OSS_ACCESS_KEY_ID) return "";
  const region = process.env.OSS_REGION || "oss-cn-beijing";
  return `https://${process.env.OSS_BUCKET}.${region}.aliyuncs.com/${encodePathSegments(storageKey)}`;
};

const normalizeCanonicalUrl = (value: string) => {
  const rawValue = value.trim();
  if (!rawValue) return "";

  try {
    const parsed = new URL(rawValue);
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const auth = parsed.username ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@` : "";
    const isDefaultPort = (protocol === "http:" && parsed.port === "80") || (protocol === "https:" && parsed.port === "443");
    const port = parsed.port && !isDefaultPort ? `:${parsed.port}` : "";
    const trimmedPath = parsed.pathname.replace(/\/+$/, "");
    const pathname = trimmedPath && trimmedPath !== "/" ? trimmedPath : "";
    return `${protocol}//${auth}${hostname}${port}${pathname}${parsed.search}`;
  } catch {
    return rawValue;
  }
};

const buildToolCanonicalKey = (name: string, description: string, url: string, logo: string) => (
  crypto.createHash("sha256").update(JSON.stringify([name, description, normalizeCanonicalUrl(url), logo])).digest("hex")
);

const parseToolTags = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
};

const uniqueAssignments = (assignments: ToolCategoryInput[]) => {
  const seen = new Set<string>();
  return assignments.filter((assignment) => {
    const key = `${assignment.categoryId}::${assignment.subCategoryId || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const choosePrimaryAssignment = (assignments: ToolCategoryInput[], fallbackCategoryId?: string | null, fallbackSubCategoryId?: string | null) => {
  const dedupedAssignments = uniqueAssignments(assignments.filter((assignment) => assignment.categoryId));
  if (!dedupedAssignments.length) {
    return { categoryId: fallbackCategoryId || "", subCategoryId: fallbackSubCategoryId || null };
  }

  const preferredAssignment = dedupedAssignments.find((assignment) => (
    assignment.categoryId === (fallbackCategoryId || "")
    && (assignment.subCategoryId || null) === (fallbackSubCategoryId || null)
  ));

  return preferredAssignment || dedupedAssignments[0];
};

const mergeSponsorExpiry = (...values: (Date | null | undefined)[]) => (
  values.filter((value): value is Date => value instanceof Date).sort((left, right) => right.getTime() - left.getTime())[0] || null
);

const matchUploadedAsset = (assets: UploadedAssetCandidate[], lookupValue: string) => {
  const trimmedValue = lookupValue.trim();
  if (!trimmedValue) return null;

  const directFileName = getUploadedFileName(trimmedValue);
  const decodedFileName = (() => {
    try {
      return decodeURIComponent(directFileName);
    } catch {
      return directFileName;
    }
  })();
  const rawBaseName = getUploadedFileBaseName(directFileName);
  const decodedBaseName = getUploadedFileBaseName(decodedFileName);
  const normalizedFileNames = new Set([directFileName.toLowerCase(), decodedFileName.toLowerCase()]);
  const normalizedBaseNames = new Set([
    rawBaseName.toLowerCase(),
    decodedBaseName.toLowerCase(),
    sanitizeUploadBaseName(rawBaseName).toLowerCase(),
    sanitizeUploadBaseName(decodedBaseName).toLowerCase(),
  ]);

  return assets.find((candidate) => {
    const candidateFileName = candidate.fileName;
    const decodedCandidateFileName = (() => {
      try {
        return decodeURIComponent(candidateFileName);
      } catch {
        return candidateFileName;
      }
    })();
    const candidateBaseNames = [
      getUploadedFileBaseName(candidateFileName),
      getUploadedFileBaseName(decodedCandidateFileName),
    ].flatMap((baseName) => [baseName.toLowerCase(), sanitizeUploadBaseName(baseName).toLowerCase()]);

    if (normalizedFileNames.has(candidateFileName.toLowerCase()) || normalizedFileNames.has(decodedCandidateFileName.toLowerCase())) {
      return true;
    }

    return candidateBaseNames.some((candidateBaseName) => (
      normalizedBaseNames.has(candidateBaseName)
      || Array.from(normalizedBaseNames).some((baseName) => candidateBaseName.startsWith(`${baseName}_`))
    ));
  }) || null;
};

const formatToolRecord = (tool: any) => {
  const assignmentList = Array.isArray(tool.categoryAssignments) ? tool.categoryAssignments : [];
  const categoryAssignments = uniqueAssignments([
    ...assignmentList.map((assignment: any) => ({
      categoryId: assignment.categoryId,
      subCategoryId: parseStoredSubCategoryId(assignment.subCategoryId),
    })),
    ...(tool.categoryId ? [{ categoryId: tool.categoryId, subCategoryId: parseStoredSubCategoryId(tool.subCategoryId) }] : []),
  ]);

  return {
    ...tool,
    subCategoryId: parseStoredSubCategoryId(tool.subCategoryId),
    canonicalKey: tool.canonicalKey || null,
    tags: parseToolTags(tool.tags),
    categoryAssignments,
  };
};

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);
  const isProd = process.env.NODE_ENV === "production";

  app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", ...(isProd ? [] : ["'unsafe-inline'", "'unsafe-eval'"])],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(compression());

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: "您的访问过于频繁，请稍后再试" },
  });
  app.use("/api/", globalLimiter);

  const uploadDir = path.resolve(__dirname, "..", "client", "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use("/uploads", express.static(uploadDir));

  const storage = multer.memoryStorage();
  const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

  const UPLOAD_EXTENSION_BY_MIME = new Map<string, string>([
    ["image/jpeg", ".jpg"],
    ["image/png", ".png"],
    ["image/gif", ".gif"],
    ["image/webp", ".webp"],
    ["image/x-icon", ".ico"],
    ["image/vnd.microsoft.icon", ".ico"],
  ]);

  const recoverUtf8FileName = (value: string) => {
    if (!value) return value;

    try {
      const recovered = Buffer.from(value, "latin1").toString("utf8");
      if (recovered.includes("\uFFFD")) return value;

      const sourceHasCjk = /[\u4e00-\u9fff]/.test(value);
      const recoveredHasCjk = /[\u4e00-\u9fff]/.test(recovered);
      if (!sourceHasCjk && recoveredHasCjk) return recovered;
      return value;
    } catch {
      return value;
    }
  };

  const normalizeUploadOriginalName = (value: string) => {
    const trimmed = value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
    const fileName = trimmed.replace(/\\/g, "/").split("/").pop() || trimmed;
    return recoverUtf8FileName(fileName);
  };

  const resolveUploadFileExtension = (originalName: string, mimetype: string) => {
    const normalizedExtension = path.extname(originalName).toLowerCase();
    if (normalizedExtension) return normalizedExtension;
    return UPLOAD_EXTENSION_BY_MIME.get(mimetype) || ".bin";
  };

  const buildStoredUploadFileName = (originalName: string, mimetype: string, buffer: Buffer) => {
    const normalizedOriginalName = normalizeUploadOriginalName(originalName);
    const extension = resolveUploadFileExtension(normalizedOriginalName, mimetype);
    const rawBaseName = path.basename(normalizedOriginalName, path.extname(normalizedOriginalName));
    const safeBaseName = sanitizeUploadBaseName(rawBaseName);
    const fileHash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 12);
    return `${safeBaseName}_${fileHash}${extension}`;
  };

  const uploadToStorage = async (file: Express.Multer.File, preferredOriginalName?: string) => {
    const originalName = normalizeUploadOriginalName(preferredOriginalName || file.originalname || "image");
    const filename = buildStoredUploadFileName(originalName, file.mimetype, file.buffer);
    const client = getOssClient();

    if (client) {
      try {
        const storageKey = `${UPLOADS_PREFIX}${filename}`;
        await client.put(storageKey, file.buffer);
        return buildOssObjectUrl(storageKey);
      } catch (error) {
        console.error("OSS upload failed, fallback to local storage:", error);
      }
    }

    const localPath = path.join(uploadDir, filename);
    fs.writeFileSync(localPath, file.buffer);
    return `/uploads/${encodePathSegments(filename)}`;
  };

  const fetchCategories = async () => {
    const allCategories = await prisma.category.findMany({ orderBy: { order: "asc" } });
    const mainCategories = allCategories.filter((category) => !category.parentId);
    const subCategories = allCategories.filter((category) => category.parentId);
    return { allCategories, mainCategories, subCategories };
  };

  const buildCategoryTree = async () => {
    const { mainCategories, subCategories } = await fetchCategories();
    return mainCategories.map((category) => ({
      ...category,
      children: subCategories.filter((subCategory) => subCategory.parentId === category.id),
    }));
  };

  const resolveCategoryAssignments = async (rawAssignments: unknown, fallbackCategoryId?: unknown, fallbackSubCategoryId?: unknown) => {
    const { mainCategories, subCategories } = await fetchCategories();
    const inputAssignments = Array.isArray(rawAssignments) && rawAssignments.length > 0
      ? rawAssignments
      : [{ categoryId: fallbackCategoryId, subCategoryId: fallbackSubCategoryId }];

    const parsedAssignments = inputAssignments
      .map((value) => {
        const categoryId = typeof value === "object" && value !== null && "categoryId" in value
          ? String((value as { categoryId?: unknown }).categoryId || "")
          : "";
        const subCategoryId = typeof value === "object" && value !== null && "subCategoryId" in value
          ? String((value as { subCategoryId?: unknown }).subCategoryId || "")
          : "";
        return {
          categoryId: categoryId.trim(),
          subCategoryId: subCategoryId.trim() || null,
        };
      })
      .filter((assignment) => assignment.categoryId);

    if (!parsedAssignments.length) {
      throw new Error("至少需要保留一个分类");
    }

    const dedupedAssignments = uniqueAssignments(parsedAssignments);

    for (const assignment of dedupedAssignments) {
      const mainCategory = mainCategories.find((category) => category.id === assignment.categoryId);
      if (!mainCategory) throw new Error("存在无效的主分类");

      if (assignment.subCategoryId) {
        const subCategory = subCategories.find((category) => category.id === assignment.subCategoryId);
        if (!subCategory || subCategory.parentId !== assignment.categoryId) {
          throw new Error("子分类与主分类不匹配");
        }
      }
    }

    return dedupedAssignments;
  };

  const fetchUploadedAssetCandidates = async () => {
    const candidates = new Map<string, UploadedAssetCandidate>();

    try {
      for (const fileName of fs.readdirSync(uploadDir)) {
        candidates.set(`local:${fileName}`, {
          fileName,
          storageKey: fileName,
          url: `/uploads/${encodePathSegments(fileName)}`,
          source: "local",
        });
      }
    } catch {
      // ignore local upload directory read failures
    }

    const client = getOssClient();
    if (!client) return Array.from(candidates.values());

    try {
      let marker: string | undefined;
      do {
        const listResult = await client.list({ prefix: UPLOADS_PREFIX, marker, "max-keys": 1000 }, {});
        for (const object of listResult.objects || []) {
          const storageKey = object.name;
          const fileName = storageKey.startsWith(UPLOADS_PREFIX) ? storageKey.slice(UPLOADS_PREFIX.length) : storageKey;
          candidates.set(`oss:${storageKey}`, {
            fileName,
            storageKey,
            url: buildOssObjectUrl(storageKey),
            source: "oss",
          });
        }
        marker = listResult.isTruncated ? listResult.nextMarker : undefined;
      } while (marker);
    } catch (error) {
      console.error("读取 OSS 图片列表失败:", error);
    }

    return Array.from(candidates.values());
  };

  const saveToolRecord = async (payload: {
    toolId?: string;
    name: string;
    description: string;
    url: string;
    logo: string;
    tags: string[];
    isSponsored: boolean;
    sponsorExpiry: Date | null;
    order: number;
    categoryAssignments: ToolCategoryInput[];
  }) => {
    const canonicalKey = buildToolCanonicalKey(payload.name, payload.description, payload.url, payload.logo);
    const categoryAssignments = uniqueAssignments(payload.categoryAssignments);
    if (!categoryAssignments.length) throw new Error("至少需要保留一个分类");

    return prisma.$transaction(async (tx) => {
      const conflictTool = await tx.tool.findFirst({
        where: {
          canonicalKey,
          ...(payload.toolId ? { NOT: { id: payload.toolId } } : {}),
        },
        include: { categoryAssignments: true },
      });

      if (payload.toolId && conflictTool) {
        const currentTool = await tx.tool.findUnique({ where: { id: payload.toolId }, include: { categoryAssignments: true } });
        if (!currentTool) throw new Error("工具不存在");

        const mergedAssignments = uniqueAssignments([
          ...categoryAssignments,
          ...currentTool.categoryAssignments.map((assignment) => ({ categoryId: assignment.categoryId, subCategoryId: parseStoredSubCategoryId(assignment.subCategoryId) })),
          ...conflictTool.categoryAssignments.map((assignment) => ({ categoryId: assignment.categoryId, subCategoryId: parseStoredSubCategoryId(assignment.subCategoryId) })),
          ...(currentTool.categoryId ? [{ categoryId: currentTool.categoryId, subCategoryId: parseStoredSubCategoryId(currentTool.subCategoryId) }] : []),
          ...(conflictTool.categoryId ? [{ categoryId: conflictTool.categoryId, subCategoryId: parseStoredSubCategoryId(conflictTool.subCategoryId) }] : []),
        ]);
        const primaryAssignment = choosePrimaryAssignment(mergedAssignments, conflictTool.categoryId, parseStoredSubCategoryId(conflictTool.subCategoryId));
        const mergedTags = Array.from(new Set([...parseToolTags(conflictTool.tags), ...parseToolTags(currentTool.tags), ...payload.tags]));

        await tx.tool.update({
          where: { id: conflictTool.id },
          data: {
            name: payload.name,
            description: payload.description,
            url: payload.url,
            logo: payload.logo,
            canonicalKey,
            categoryId: primaryAssignment.categoryId,
            subCategoryId: primaryAssignment.subCategoryId,
            tags: JSON.stringify(mergedTags),
            isSponsored: conflictTool.isSponsored || currentTool.isSponsored || payload.isSponsored,
            sponsorExpiry: mergeSponsorExpiry(conflictTool.sponsorExpiry, currentTool.sponsorExpiry, payload.sponsorExpiry),
            order: Math.max(conflictTool.order || 0, currentTool.order || 0, payload.order || 0),
            views: (conflictTool.views || 0) + (currentTool.views || 0),
          },
        });
        await tx.toolCategory.deleteMany({ where: { toolId: conflictTool.id } });
        await tx.toolCategory.createMany({
          data: mergedAssignments.map((assignment) => ({
            toolId: conflictTool.id,
            categoryId: assignment.categoryId,
            subCategoryId: toStoredSubCategoryId(assignment.subCategoryId),
          })),
          skipDuplicates: true,
        });
        await tx.tool.delete({ where: { id: currentTool.id } });
        return tx.tool.findUniqueOrThrow({ where: { id: conflictTool.id }, include: { categoryAssignments: true } });
      }

      if (payload.toolId) {
        const primaryAssignment = choosePrimaryAssignment(categoryAssignments, categoryAssignments[0].categoryId, categoryAssignments[0].subCategoryId);
        await tx.tool.update({
          where: { id: payload.toolId },
          data: {
            name: payload.name,
            description: payload.description,
            url: payload.url,
            logo: payload.logo,
            canonicalKey,
            categoryId: primaryAssignment.categoryId,
            subCategoryId: primaryAssignment.subCategoryId,
            tags: JSON.stringify(payload.tags),
            isSponsored: payload.isSponsored,
            sponsorExpiry: payload.sponsorExpiry,
            order: payload.order,
          },
        });
        await tx.toolCategory.deleteMany({ where: { toolId: payload.toolId } });
        await tx.toolCategory.createMany({
          data: categoryAssignments.map((assignment) => ({
            toolId: payload.toolId!,
            categoryId: assignment.categoryId,
            subCategoryId: toStoredSubCategoryId(assignment.subCategoryId),
          })),
          skipDuplicates: true,
        });
        return tx.tool.findUniqueOrThrow({ where: { id: payload.toolId }, include: { categoryAssignments: true } });
      }

      if (conflictTool) {
        const mergedAssignments = uniqueAssignments([
          ...conflictTool.categoryAssignments.map((assignment) => ({ categoryId: assignment.categoryId, subCategoryId: parseStoredSubCategoryId(assignment.subCategoryId) })),
          ...(conflictTool.categoryId ? [{ categoryId: conflictTool.categoryId, subCategoryId: parseStoredSubCategoryId(conflictTool.subCategoryId) }] : []),
          ...categoryAssignments,
        ]);
        const primaryAssignment = choosePrimaryAssignment(mergedAssignments, conflictTool.categoryId, parseStoredSubCategoryId(conflictTool.subCategoryId));
        const mergedTags = Array.from(new Set([...parseToolTags(conflictTool.tags), ...payload.tags]));

        await tx.tool.update({
          where: { id: conflictTool.id },
          data: {
            categoryId: primaryAssignment.categoryId,
            subCategoryId: primaryAssignment.subCategoryId,
            tags: JSON.stringify(mergedTags),
            isSponsored: conflictTool.isSponsored || payload.isSponsored,
            sponsorExpiry: mergeSponsorExpiry(conflictTool.sponsorExpiry, payload.sponsorExpiry),
            order: Math.max(conflictTool.order || 0, payload.order || 0),
          },
        });
        await tx.toolCategory.deleteMany({ where: { toolId: conflictTool.id } });
        await tx.toolCategory.createMany({
          data: mergedAssignments.map((assignment) => ({
            toolId: conflictTool.id,
            categoryId: assignment.categoryId,
            subCategoryId: toStoredSubCategoryId(assignment.subCategoryId),
          })),
          skipDuplicates: true,
        });
        return tx.tool.findUniqueOrThrow({ where: { id: conflictTool.id }, include: { categoryAssignments: true } });
      }

      const primaryAssignment = choosePrimaryAssignment(categoryAssignments, categoryAssignments[0].categoryId, categoryAssignments[0].subCategoryId);
      return tx.tool.create({
        data: {
          name: payload.name,
          description: payload.description,
          url: payload.url,
          logo: payload.logo,
          canonicalKey,
          categoryId: primaryAssignment.categoryId,
          subCategoryId: primaryAssignment.subCategoryId,
          tags: JSON.stringify(payload.tags),
          isSponsored: payload.isSponsored,
          sponsorExpiry: payload.sponsorExpiry,
          order: payload.order,
          categoryAssignments: {
            create: categoryAssignments.map((assignment) => ({
              categoryId: assignment.categoryId,
              subCategoryId: toStoredSubCategoryId(assignment.subCategoryId),
            })),
          },
        },
        include: { categoryAssignments: true },
      });
    });
  };

  const syncToolAssignmentsAndCanonicals = async () => {
    const tools = await prisma.tool.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: { categoryAssignments: true },
    });
    if (!tools.length) return;

    const groupedTools = new Map<string, any[]>();
    for (const tool of tools) {
      const canonicalKey = buildToolCanonicalKey(tool.name, tool.description, tool.url, tool.logo || "");
      const group = groupedTools.get(canonicalKey) || [];
      group.push(tool);
      groupedTools.set(canonicalKey, group);
    }

    for (const [canonicalKey, group] of Array.from(groupedTools.entries())) {
      const primaryTool = group[0];
      const mergedAssignments = uniqueAssignments(group.flatMap((tool: any) => [
        ...(tool.categoryAssignments || []).map((assignment: any) => ({ categoryId: assignment.categoryId, subCategoryId: parseStoredSubCategoryId(assignment.subCategoryId) })),
        ...(tool.categoryId ? [{ categoryId: tool.categoryId, subCategoryId: parseStoredSubCategoryId(tool.subCategoryId) }] : []),
      ]));
      const primaryAssignment = choosePrimaryAssignment(mergedAssignments, primaryTool.categoryId, parseStoredSubCategoryId(primaryTool.subCategoryId));
      const mergedTags = Array.from(new Set(group.flatMap((tool: any) => parseToolTags(tool.tags))));
      const mergedViews = group.reduce((sum: number, tool: any) => sum + (tool.views || 0), 0);
      const mergedOrder = Math.max(...group.map((tool: any) => tool.order || 0), 0);
      const mergedSponsorExpiry = mergeSponsorExpiry(...group.map((tool: any) => tool.sponsorExpiry));

      await prisma.$transaction(async (tx) => {
        await tx.tool.update({
          where: { id: primaryTool.id },
          data: {
            canonicalKey,
            categoryId: primaryAssignment.categoryId,
            subCategoryId: primaryAssignment.subCategoryId,
            tags: JSON.stringify(mergedTags),
            views: mergedViews,
            order: mergedOrder,
            isSponsored: group.some((tool: any) => tool.isSponsored),
            sponsorExpiry: mergedSponsorExpiry,
          },
        });
        await tx.toolCategory.deleteMany({ where: { toolId: primaryTool.id } });
        if (mergedAssignments.length > 0) {
          await tx.toolCategory.createMany({
            data: mergedAssignments.map((assignment) => ({
              toolId: primaryTool.id,
              categoryId: assignment.categoryId,
              subCategoryId: toStoredSubCategoryId(assignment.subCategoryId),
            })),
            skipDuplicates: true,
          });
        }

        const duplicateIds = group.slice(1).map((tool: any) => tool.id);
        if (duplicateIds.length > 0) {
          await tx.tool.deleteMany({ where: { id: { in: duplicateIds } } });
        }
      });
    }
  };

  try {
    await syncToolAssignmentsAndCanonicals();
  } catch (error) {
    if (isMissingSchemaColumnError(error)) {
      console.error("数据库结构未更新，请先执行 Prisma 迁移后再启动服务。");
    }
    throw error;
  }

  const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]);

  const validateImageMagicBytes = (buffer: Buffer, mimetype: string) => {
    if (buffer.length < 4) return false;
    const b = buffer;
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true;
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return true;
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return true;
    if (buffer.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true;
    if (b[0] === 0x00 && b[1] === 0x00 && b[2] === 0x01 && b[3] === 0x00) return true;
    return false;
  };

  const validateUrlProtocol = (value: string) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  };

  const ADMIN_PASS = process.env.ADMIN_PASSWORD?.trim() || (isProd ? "" : "admin123");
  const JWT_SECRET = process.env.JWT_SECRET?.trim() || (isProd ? "" : `${crypto.randomUUID()}${crypto.randomUUID()}`);
  const JWT_EXPIRES_IN = "24h";

  if (isProd) {
    if (!ADMIN_PASS) {
      throw new Error("生产环境必须配置 ADMIN_PASSWORD");
    }
    if (ADMIN_PASS === "admin123") {
      throw new Error("生产环境禁止使用默认后台密码 admin123");
    }
    if (!JWT_SECRET) {
      throw new Error("生产环境必须配置 JWT_SECRET");
    }
  }

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "无权访问" });
    }

    try {
      jwt.verify(authHeader.slice(7), JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ error: "登录已过期，请重新登录" });
    }
  };

  const normalizeParentId = (value: unknown) => {
    const stringValue = typeof value === "string" ? value.trim() : "";
    return stringValue || null;
  };

  app.get("/api/settings", async (_req, res) => {
    try {
      let setting = await prisma.siteSetting.findUnique({ where: { id: "default" } });
      if (!setting) {
        setting = await prisma.siteSetting.create({ data: { id: "default", name: DEFAULT_SITE_NAME } });
      }
      res.json(setting);
    } catch (error) {
      console.error("获取站点设置失败:", error);
      res.status(500).json({ error: isMissingSchemaColumnError(error) ? "站点设置数据表结构未更新，请先执行数据库迁移" : "获取站点设置失败" });
    }
  });

  app.get("/api/categories", async (_req, res) => {
    try {
      res.json(await buildCategoryTree());
    } catch {
      res.status(500).json({ error: "获取分类失败" });
    }
  });

  app.get("/api/tools", async (req, res) => {
    try {
      const page = Math.max(0, Number(req.query.page) || 0);
      const limit = Math.max(0, Number(req.query.limit) || 0);
      const orderBy = [{ isSponsored: "desc" as const }, { order: "desc" as const }, { views: "desc" as const }];

      if (page > 0 && limit > 0) {
        const safeLimit = Math.min(limit, 200);
        const [tools, total] = await Promise.all([
          prisma.tool.findMany({
            orderBy,
            skip: (page - 1) * safeLimit,
            take: safeLimit,
            include: { categoryAssignments: true },
          }),
          prisma.tool.count(),
        ]);
        res.json({ tools: tools.map(formatToolRecord), total, page, limit: safeLimit });
        return;
      }

      const tools = await prisma.tool.findMany({ orderBy, include: { categoryAssignments: true } });
      res.json(tools.map(formatToolRecord));
    } catch {
      res.status(500).json({ error: "获取工具失败" });
    }
  });

  const uploadPublicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "上传过于频繁，请稍后再试" },
  });

  app.post("/api/upload-public", uploadPublicLimiter, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    if (!ALLOWED_IMAGE_MIMES.has(req.file.mimetype)) {
      return res.status(400).json({ error: "仅允许上传图片文件 (jpg/png/gif/webp/ico)" });
    }
    if (!validateImageMagicBytes(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ error: "文件内容与声明类型不匹配" });
    }

    try {
      const originalName = typeof req.body?.originalName === "string" ? req.body.originalName : req.file.originalname;
      const normalizedOriginalName = normalizeUploadOriginalName(originalName);
      const url = await uploadToStorage(req.file, normalizedOriginalName);
      res.json({ url, originalName: normalizedOriginalName });
    } catch (error) {
      console.error("公共上传失败:", error);
      res.status(500).json({ error: "图片上传失败" });
    }
  });

  const submitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: "提交过于频繁，请稍后再试" },
  });

  app.post("/api/submit-tool", submitLimiter, async (req, res) => {
    try {
      const name = xss(req.body.name || "");
      const description = xss(req.body.description || "");
      const url = xss(req.body.url || "");
      const contactInfo = xss(req.body.contactInfo || "");
      const logo = req.body.logo || "";
      const categoryId = xss(req.body.categoryId || "");
      const subCategoryId = xss(req.body.subCategoryId || "");

      if (!name || !description || !url || !logo || !categoryId) {
        return res.status(400).json({ error: "Logo、工具名称、简介、官网链接和分类为必填项" });
      }
      if (!validateUrlProtocol(url)) {
        return res.status(400).json({ error: "链接必须以 http:// 或 https:// 开头" });
      }

      const pending = await prisma.pendingTool.create({
        data: {
          name,
          description,
          url,
          contactInfo,
          logo,
          categoryId,
          subCategoryId: subCategoryId || null,
          status: "pending",
        },
      });

      res.json({ success: true, data: pending });
    } catch {
      res.status(500).json({ error: "提交工具失败，请稍后再试" });
    }
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "登录尝试次数过多，请 15 分钟后再试" },
  });

  app.post("/api/admin/login", loginLimiter, (req, res) => {
    const inputPassword = typeof req.body.password === "string" ? req.body.password : "";
    const inputHash = crypto.createHash("sha256").update(inputPassword).digest();
    const passHash = crypto.createHash("sha256").update(ADMIN_PASS).digest();

    if (crypto.timingSafeEqual(inputHash, passHash)) {
      res.json({ success: true, token: jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }) });
      return;
    }

    res.status(401).json({ error: "密码错误" });
  });

  app.post("/api/admin/upload", requireAuth, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未检测到文件" });
    if (!ALLOWED_IMAGE_MIMES.has(req.file.mimetype)) {
      return res.status(400).json({ error: "仅允许上传图片文件" });
    }
    if (!validateImageMagicBytes(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ error: "文件内容与声明类型不匹配" });
    }

    try {
      const originalName = typeof req.body?.originalName === "string" ? req.body.originalName : req.file.originalname;
      const normalizedOriginalName = normalizeUploadOriginalName(originalName);
      const url = await uploadToStorage(req.file, normalizedOriginalName);
      res.json({ url, originalName: normalizedOriginalName });
    } catch (error) {
      console.error("管理员上传失败:", error);
      res.status(500).json({ error: "图片上传失败" });
    }
  });

  app.post("/api/admin/upload-batch", requireAuth, upload.array("files", 100), async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) return res.status(400).json({ error: "未检测到文件" });

    const hintedOriginalNames = Array.isArray(req.body?.originalNames)
      ? req.body.originalNames
      : (typeof req.body?.originalNames === "string" ? [req.body.originalNames] : []);
    const results: { originalName: string; url?: string; error?: string }[] = [];
    const client = getOssClient();

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const originalName = normalizeUploadOriginalName(hintedOriginalNames[index] || file.originalname || "image");
      if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
        results.push({ originalName, error: "不支持的图片格式" });
        continue;
      }
      if (!validateImageMagicBytes(file.buffer, file.mimetype)) {
        results.push({ originalName, error: "文件内容与声明类型不匹配" });
        continue;
      }

      try {
        const storedFileName = buildStoredUploadFileName(originalName, file.mimetype, file.buffer);

        if (client) {
          try {
            const storageKey = `${UPLOADS_PREFIX}${storedFileName}`;
            await client.put(storageKey, file.buffer);
            results.push({ originalName, url: buildOssObjectUrl(storageKey) });
            continue;
          } catch (error) {
            console.error(`OSS 批量上传 ${originalName} 失败，回退到本地存储:`, error);
          }
        }

        fs.writeFileSync(path.join(uploadDir, storedFileName), file.buffer);
        results.push({ originalName, url: `/uploads/${encodePathSegments(storedFileName)}` });
      } catch (error) {
        results.push({ originalName, error: `上传失败: ${getErrorMessage(error)}` });
      }
    }

    res.json({
      total: files.length,
      successCount: results.filter((item) => item.url).length,
      failCount: results.filter((item) => item.error).length,
      results,
    });
  });

  app.put("/api/admin/settings", requireAuth, async (req, res) => {
    try {
      const name = xss(req.body.name || "").trim() || DEFAULT_SITE_NAME;
      const logo = req.body.logo || "";
      const favicon = req.body.favicon || "";
      const titleFontSize = Math.min(72, Math.max(12, Number(req.body.titleFontSize) || 17));
      const backgroundColor = xss(req.body.backgroundColor || "#f5f5f7").trim() || "#f5f5f7";
      const companyIntro = xss(req.body.companyIntro || "");
      const icp = xss(req.body.icp || "");
      const email = xss(req.body.email || "");
      const customerServiceQrCode = req.body.customerServiceQrCode || "";
      const maxLongText = 500000;
      const termsText = xss(typeof req.body.termsText === "string" ? req.body.termsText.slice(0, maxLongText) : "");
      const privacyText = xss(typeof req.body.privacyText === "string" ? req.body.privacyText.slice(0, maxLongText) : "");
      const aboutContent = typeof req.body.aboutContent === "string" ? req.body.aboutContent.slice(0, maxLongText) : "";
      const partnersContent = typeof req.body.partnersContent === "string" ? req.body.partnersContent.slice(0, maxLongText) : "";

      res.json(await prisma.siteSetting.upsert({
        where: { id: "default" },
        update: { name, logo, favicon, titleFontSize, backgroundColor, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText, aboutContent, partnersContent },
        create: { id: "default", name, logo, favicon, titleFontSize, backgroundColor, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText, aboutContent, partnersContent },
      }));
    } catch (error) {
      console.error("保存站点设置失败:", error);
      res.status(500).json({ error: isMissingSchemaColumnError(error) ? "站点设置数据表结构未更新，请先执行数据库迁移" : "保存站点设置失败" });
    }
  });

  app.post("/api/admin/categories", requireAuth, async (req, res) => {
    try {
      const parentId = normalizeParentId(req.body.parentId);
      const name = xss(req.body.name || "");
      const icon = parentId ? null : xss(req.body.icon || "Box");
      const lastCategory = await prisma.category.findFirst({ where: { parentId }, orderBy: { order: "desc" } });
      res.json(await prisma.category.create({ data: { name, parentId, icon, order: (lastCategory?.order || 0) + 1 } }));
    } catch {
      res.status(500).json({ error: "创建分类失败" });
    }
  });

  app.put("/api/admin/categories/:id", requireAuth, async (req, res) => {
    try {
      const parentId = normalizeParentId(req.body.parentId);
      const name = xss(req.body.name || "");
      const icon = parentId ? null : xss(req.body.icon || "Box");
      res.json(await prisma.category.update({ where: { id: req.params.id }, data: { name, parentId, icon } }));
    } catch {
      res.status(500).json({ error: "更新分类失败" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
    try {
      await prisma.category.deleteMany({ where: { parentId: req.params.id } });
      await prisma.category.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "删除分类失败" });
    }
  });

  app.post("/api/admin/categories/reorder", requireAuth, async (req, res) => {
    const orderedIds = Array.isArray(req.body.orderedIds)
      ? req.body.orderedIds.filter((id: unknown): id is string => typeof id === "string")
      : [];
    if (!orderedIds.length) return res.status(400).json({ error: "缺少排序数据" });

    await prisma.$transaction(orderedIds.map((id: string, index: number) => prisma.category.update({ where: { id }, data: { order: index + 1 } })));
    res.json({ success: true });
  });

  app.get("/api/admin/tools/template", requireAuth, async (_req, res) => {
    try {
      const { mainCategories: mainCats, subCategories: subCats } = await fetchCategories();
      const workbook = new ExcelJS.Workbook();
      const categorySheet = workbook.addWorksheet("分类数据", { state: "veryHidden" });
      const mainCategoryNames = mainCats.map((category) => category.name);
      categorySheet.getRow(1).values = ["主分类列表", ...mainCategoryNames];

      const maxSubCount = Math.max(1, ...mainCats.map((mainCategory) => subCats.filter((subCategory) => subCategory.parentId === mainCategory.id).length));
      for (let index = 0; index < maxSubCount; index++) {
        const row: (string | null)[] = [null];
        for (const mainCategory of mainCats) {
          const children = subCats.filter((subCategory) => subCategory.parentId === mainCategory.id);
          row.push(children[index]?.name || null);
        }
        categorySheet.getRow(index + 2).values = row;
      }

      mainCats.forEach((mainCategory, index) => {
        const children = subCats.filter((subCategory) => subCategory.parentId === mainCategory.id);
        const colLetter = String.fromCharCode(66 + index);
        const safeName = `_Cat_${index}`;
        const endRow = children.length > 0 ? children.length + 1 : 2;
        workbook.definedNames.add(`'分类数据'!$${colLetter}$2:$${colLetter}$${endRow}`, safeName);
      });

      const worksheet = workbook.addWorksheet(TOOL_IMPORT_SHEET_NAME);
      worksheet.getRow(1).values = ["名称", "简介", "链接", "Logo图片名", "主分类", "子分类"];
      worksheet.getRow(2).values = ["ChatGPT", "OpenAI 的智能对话工具", "https://chat.openai.com", "chatgpt", mainCats[0]?.name || "", ""];
      worksheet.columns = [{ width: 20 }, { width: 40 }, { width: 40 }, { width: 25 }, { width: 20 }, { width: 20 }];

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8ED" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.protection = { locked: true };
      });

      for (let rowIndex = 2; rowIndex <= 1001; rowIndex++) {
        for (let colIndex = 1; colIndex <= 6; colIndex++) {
          worksheet.getRow(rowIndex).getCell(colIndex).protection = { locked: false };
        }
      }

      if (mainCategoryNames.length > 0) {
        for (let rowIndex = 2; rowIndex <= 1001; rowIndex++) {
          worksheet.getCell(`E${rowIndex}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`"${mainCategoryNames.join(",")}"`],
            showErrorMessage: true,
            errorTitle: "无效分类",
            error: "请从下拉列表中选择主分类",
          };
        }
      }

      if (mainCats.some((mainCategory) => subCats.some((subCategory) => subCategory.parentId === mainCategory.id))) {
        const lastColLetter = String.fromCharCode(65 + mainCategoryNames.length);
        for (let rowIndex = 2; rowIndex <= 1001; rowIndex++) {
          worksheet.getCell(`F${rowIndex}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`INDIRECT("_Cat_"&MATCH(E${rowIndex},'分类数据'!$B$1:$${lastColLetter}$1,0)-1)`],
            showErrorMessage: true,
            errorTitle: "无效子分类",
            error: "请先选择主分类，再从下拉列表中选择子分类",
          };
        }
      }

      await worksheet.protect("", {
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

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=tools_import_template.xlsx");
      const buffer = await workbook.xlsx.writeBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("生成导入模板失败:", error);
      res.status(500).json({ error: "生成导入模板失败" });
    }
  });

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
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const worksheetName = workbook.SheetNames.find((name) => name === TOOL_IMPORT_SHEET_NAME)
        || workbook.SheetNames.find((name, index) => !workbook.Workbook?.Sheets?.[index]?.Hidden)
        || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      if (!worksheet) {
        return res.status(400).json({ error: "未找到可导入的工作表，请使用系统模板重新下载后填写" });
      }

      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      if (!rows.length) {
        return res.status(400).json({ error: "Excel 中没有数据行" });
      }

      const { mainCategories: mainCats, subCategories: subCats } = await fetchCategories();
      const uploadedAssets = await fetchUploadedAssetCandidates();
      const results: { row: number; name: string; ok: boolean; error?: string }[] = [];
      let processedRowCount = 0;

      const fieldMap: Record<string, string> = {
        "名称": "name",
        name: "name",
        "简介": "description",
        description: "description",
        "链接": "url",
        url: "url",
        "logo图片名": "logoFileName",
        logofilename: "logoFileName",
        "主分类": "categoryName",
        categoryname: "categoryName",
        "子分类": "subCategoryName",
        subcategoryname: "subCategoryName",
        "标签": "tags",
        tags: "tags",
      };

      for (let index = 0; index < rows.length; index++) {
        const rawRow = rows[index];
        const rowNumber = index + 2;
        const row: Record<string, string> = {};

        for (const [key, value] of Object.entries(rawRow)) {
          const mapped = fieldMap[normalizeImportHeader(key)];
          if (mapped) row[mapped] = String(value || "").trim();
        }

        if (!Object.values(row).some((value) => value)) continue;
        processedRowCount += 1;

        const name = xss(row.name || "");
        const description = xss(row.description || "");
        const url = xss(row.url || "");
        const logoFileName = (row.logoFileName || "").trim();
        const categoryName = (row.categoryName || "").trim();
        const subCategoryName = (row.subCategoryName || "").trim();

        if (!name || !url) {
          results.push({ row: rowNumber, name: name || "(空)", ok: false, error: "名称和链接为必填项" });
          continue;
        }
        if (!validateUrlProtocol(url)) {
          results.push({ row: rowNumber, name, ok: false, error: "链接必须以 http:// 或 https:// 开头" });
          continue;
        }
        if (!categoryName) {
          results.push({ row: rowNumber, name, ok: false, error: "主分类为必填项" });
          continue;
        }

        const mainCategory = mainCats.find((category) => category.name === categoryName);
        if (!mainCategory) {
          results.push({ row: rowNumber, name, ok: false, error: `主分类“${categoryName}”不存在` });
          continue;
        }

        let subCategoryId: string | null = null;
        if (subCategoryName) {
          const subCategory = subCats.find((category) => category.name === subCategoryName && category.parentId === mainCategory.id);
          if (!subCategory) {
            results.push({ row: rowNumber, name, ok: false, error: `子分类“${subCategoryName}”不属于“${categoryName}”` });
            continue;
          }
          subCategoryId = subCategory.id;
        }

        let logo = "";
        if (logoFileName) {
          if (logoFileName.startsWith("http://") || logoFileName.startsWith("https://")) {
            logo = logoFileName;
          } else {
            const matchedAsset = matchUploadedAsset(uploadedAssets, logoFileName);
            if (!matchedAsset) {
              results.push({ row: rowNumber, name, ok: false, error: `未找到与 Logo 图片名“${logoFileName}”对应的已上传图片` });
              continue;
            }
            logo = matchedAsset.url;
          }
        }

        try {
          await saveToolRecord({
            name,
            description,
            url,
            logo,
            tags: [],
            isSponsored: false,
            sponsorExpiry: null,
            order: 0,
            categoryAssignments: [{ categoryId: mainCategory.id, subCategoryId }],
          });
          results.push({ row: rowNumber, name, ok: true });
        } catch (error) {
          results.push({ row: rowNumber, name, ok: false, error: getErrorMessage(error) || "数据库写入失败" });
        }
      }

      if (!processedRowCount) {
        return res.status(400).json({ error: "Excel 中没有有效数据行，请确认填写的是“工具导入模板”工作表" });
      }

      res.json({
        success: true,
        total: processedRowCount,
        successCount: results.filter((item) => item.ok).length,
        failCount: results.filter((item) => !item.ok).length,
        details: results,
      });
    } catch (error) {
      console.error("批量导入失败:", error);
      res.status(500).json({ error: "Excel 解析失败，请检查文件格式" });
    }
  });

  app.get("/api/admin/tools", requireAuth, async (_req, res) => {
    try {
      const tools = await prisma.tool.findMany({
        orderBy: { createdAt: "desc" },
        include: { categoryAssignments: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } },
      });
      res.json(tools.map(formatToolRecord));
    } catch {
      res.status(500).json({ error: "获取工具列表失败" });
    }
  });

  app.post("/api/admin/tools", requireAuth, async (req, res) => {
    try {
      const name = xss(req.body.name || "");
      const description = xss(req.body.description || "");
      const url = xss(req.body.url || "");
      const logo = req.body.logo || "";
      if (url && !validateUrlProtocol(url)) {
        return res.status(400).json({ error: "链接必须以 http:// 或 https:// 开头" });
      }

      const categoryAssignments = await resolveCategoryAssignments(req.body.categoryAssignments, req.body.categoryId, req.body.subCategoryId);
      const tool = await saveToolRecord({
        name,
        description,
        url,
        logo,
        tags: Array.isArray(req.body.tags) ? req.body.tags.filter((tag: unknown): tag is string => typeof tag === "string") : [],
        isSponsored: Boolean(req.body.isSponsored),
        sponsorExpiry: req.body.sponsorExpiry ? new Date(req.body.sponsorExpiry) : null,
        order: Number(req.body.order) || 0,
        categoryAssignments,
      });
      res.json(formatToolRecord(tool));
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) || "创建工具失败" });
    }
  });

  app.put("/api/admin/tools/:id", requireAuth, async (req, res) => {
    try {
      const name = xss(req.body.name || "");
      const description = xss(req.body.description || "");
      const url = xss(req.body.url || "");
      const logo = req.body.logo || "";
      if (url && !validateUrlProtocol(url)) {
        return res.status(400).json({ error: "链接必须以 http:// 或 https:// 开头" });
      }

      const categoryAssignments = await resolveCategoryAssignments(req.body.categoryAssignments, req.body.categoryId, req.body.subCategoryId);
      const tool = await saveToolRecord({
        toolId: req.params.id,
        name,
        description,
        url,
        logo,
        tags: Array.isArray(req.body.tags) ? req.body.tags.filter((tag: unknown): tag is string => typeof tag === "string") : [],
        isSponsored: Boolean(req.body.isSponsored),
        sponsorExpiry: req.body.sponsorExpiry ? new Date(req.body.sponsorExpiry) : null,
        order: Number(req.body.order) || 0,
        categoryAssignments,
      });
      res.json(formatToolRecord(tool));
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) || "更新工具失败" });
    }
  });

  app.delete("/api/admin/tools/:id", requireAuth, async (req, res) => {
    try {
      await prisma.tool.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "删除工具失败" });
    }
  });

  app.get("/api/admin/pending-tools", requireAuth, async (_req, res) => {
    try {
      res.json(await prisma.pendingTool.findMany({ orderBy: { createdAt: "desc" } }));
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
    if (err.code === "LIMIT_FILE_SIZE") {
      if (!res.headersSent) res.status(413).json({ error: "文件大小超出限制（最大 10MB）" });
      return;
    }
    if (err.name === "MulterError") {
      if (!res.headersSent) res.status(400).json({ error: `上传错误：${err.message}` });
      return;
    }
    console.error("Unhandled error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "服务器内部错误，请稍后重试" });
    }
  });

  const staticPath = process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

  const port = Number(process.env.PORT) || 3001;
  server.listen(port, () => {
    console.log(`后端已启动: http://localhost:${port}/`);
  });
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
