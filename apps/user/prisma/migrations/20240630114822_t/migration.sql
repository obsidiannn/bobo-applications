-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(191) NULL,
    `nickName` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `addr` VARCHAR(191) NULL,
    `nickNameIdx` VARCHAR(191) NULL,
    `gender` INTEGER NULL DEFAULT 1,
    `sign` VARCHAR(191) NULL,
    `pubKey` VARCHAR(191) NOT NULL,
    `status` INTEGER NULL DEFAULT 1,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `users_userName_idx`(`userName`),
    INDEX `users_addr_idx`(`addr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
