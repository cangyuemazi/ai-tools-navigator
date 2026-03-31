ALTER TABLE `PendingTool`
  ADD COLUMN `categoryId` VARCHAR(191) NULL,
  ADD COLUMN `subCategoryId` VARCHAR(191) NULL;

CREATE INDEX `PendingTool_categoryId_idx` ON `PendingTool`(`categoryId`);
CREATE INDEX `PendingTool_subCategoryId_idx` ON `PendingTool`(`subCategoryId`);