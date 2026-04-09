ALTER TABLE `tool`
  ADD COLUMN `canonicalKey` VARCHAR(64) NULL;

CREATE INDEX `Tool_canonicalKey_idx` ON `tool`(`canonicalKey`);

CREATE TABLE `toolcategory` (
  `id` VARCHAR(191) NOT NULL,
  `toolId` VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `subCategoryId` VARCHAR(191) NOT NULL DEFAULT '',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `ToolCategory_toolId_categoryId_subCategoryId_key`(`toolId`, `categoryId`, `subCategoryId`),
  INDEX `ToolCategory_toolId_idx`(`toolId`),
  INDEX `ToolCategory_categoryId_idx`(`categoryId`),
  INDEX `ToolCategory_subCategoryId_idx`(`subCategoryId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ToolCategory_toolId_fkey`
    FOREIGN KEY (`toolId`) REFERENCES `tool`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `toolcategory` (`id`, `toolId`, `categoryId`, `subCategoryId`, `createdAt`)
SELECT
  REPLACE(UUID(), '-', ''),
  `id`,
  `categoryId`,
  COALESCE(`subCategoryId`, ''),
  CURRENT_TIMESTAMP(3)
FROM `tool`
WHERE `categoryId` IS NOT NULL AND `categoryId` <> '';
