-- CreateTable
CREATE TABLE `user_firebase_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL DEFAULT 1,
    `token` VARCHAR(191) NULL,
    `platform` VARCHAR(191) NULL,
    `lang` VARCHAR(191) NULL,
    `os_version` VARCHAR(191) NULL,
    `app_version` VARCHAR(191) NULL,
    `device_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `user_firebase_tokens_user_id_idx`(`user_id`),
    INDEX `user_firebase_tokens_device_id_idx`(`device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `topics` LONGTEXT NULL,
    `user_ids` LONGTEXT NULL,
    `title` VARCHAR(255) NULL,
    `body` VARCHAR(255) NULL,
    `data` LONGTEXT NULL,
    `status` INTEGER NULL DEFAULT 0,
    `failed_reason` VARCHAR(255) NULL,
    `start_at` DATETIME(3) NULL,
    `end_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
