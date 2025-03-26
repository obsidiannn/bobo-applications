-- CreateTable
CREATE TABLE "nodes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "region" TEXT,
    "code" TEXT,
    "type" TEXT,
    "status" INTEGER,
    "addr" TEXT,
    "version" TEXT,
    "remark" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "app_versions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version_code" INTEGER,
    "version_name" TEXT,
    "description" TEXT,
    "force_update" INTEGER DEFAULT 0,
    "language" TEXT,
    "platform" TEXT,
    "download_url" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "sys_category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category_name" TEXT NOT NULL,
    "category_type" INTEGER NOT NULL,
    "category_describe" TEXT NOT NULL,
    "category_sort" INTEGER NOT NULL,
    "category_config" TEXT
);

-- CreateIndex
CREATE INDEX "nodes_addr_idx" ON "nodes"("addr");

-- CreateIndex
CREATE INDEX "nodes_status_idx" ON "nodes"("status");

-- CreateIndex
CREATE INDEX "nodes_code_idx" ON "nodes"("code");

-- CreateIndex
CREATE INDEX "nodes_type_idx" ON "nodes"("type");

-- CreateIndex
CREATE INDEX "nodes_version_idx" ON "nodes"("version");

-- CreateIndex
CREATE INDEX "app_versions_platform_idx" ON "app_versions"("platform");

-- CreateIndex
CREATE INDEX "app_versions_language_idx" ON "app_versions"("language");

-- CreateIndex
CREATE INDEX "sys_category_category_type_idx" ON "sys_category"("category_type");
