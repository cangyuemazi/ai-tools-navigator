import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始将 JSON 数据导入 SQLite 数据库...');

  // 读取旧的 JSON 文件
  const categoriesPath = path.join(__dirname, '../client/src/data/categories.json');
  const toolsPath = path.join(__dirname, '../client/src/data/tools.json');

  if (!fs.existsSync(categoriesPath) || !fs.existsSync(toolsPath)) {
    console.error('❌ 找不到 JSON 数据文件，请检查路径！');
    return;
  }

  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
  const toolsData = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));

  // 1. 导入分类数据
  console.log(`📦 准备导入分类数据...`);
  for (const cat of categoriesData) {
    // 写入主分类
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
      },
    });

    // 写入子分类
    if (cat.children && cat.children.length > 0) {
      for (const sub of cat.children) {
        await prisma.category.create({
          data: {
            id: sub.id,
            name: sub.name,
            parentId: cat.id,
          },
        });
      }
    }
  }
  console.log('✅ 分类数据导入完成！');

  // 2. 导入工具数据
  console.log(`🛠️ 准备导入 ${toolsData.length} 个工具数据...`);
  for (const tool of toolsData) {
    await prisma.tool.create({
      data: {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        url: tool.url,
        logo: tool.logo,
        categoryId: tool.categoryId,
        subCategoryId: tool.subCategoryId,
        tags: JSON.stringify(tool.tags), // 将数组转换为 JSON 字符串存储
        views: tool.views || 0,
      },
    });
  }
  console.log('✅ 工具数据导入完成！所有数据已成功搬家！');
}

main()
  .catch((e) => {
    console.error('❌ 导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });