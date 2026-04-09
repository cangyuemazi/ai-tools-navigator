ALTER TABLE `pendingtool`
  ADD COLUMN `categoryId` VARCHAR(191) NULL,
  ADD COLUMN `subCategoryId` VARCHAR(191) NULL;

CREATE INDEX `PendingTool_categoryId_idx` ON `pendingtool`(`categoryId`);
CREATE INDEX `PendingTool_subCategoryId_idx` ON `pendingtool`(`subCategoryId`);
