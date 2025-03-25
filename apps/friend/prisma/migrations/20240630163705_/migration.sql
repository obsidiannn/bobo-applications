-- CreateTable
CREATE TABLE `friend_user_extend_infos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NULL,
    `lastFriendApplyId` BIGINT UNSIGNED NULL DEFAULT 0,
    `lastReadFriendApplyId` BIGINT UNSIGNED NULL DEFAULT 0,

    INDEX `friend_user_extend_infos_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `friends` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `hashKey` CHAR(32) NULL,
    `userId` BIGINT UNSIGNED NULL DEFAULT 0,
    `friendId` BIGINT UNSIGNED NULL DEFAULT 0,
    `remark` VARCHAR(128) NULL,
    `remarkIdx` VARCHAR(32) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `relation` INTEGER NULL,
    `chatId` VARCHAR(128) NULL,

    INDEX `friends_userId_idx`(`userId`),
    INDEX `friends_friendId_idx`(`friendId`),
    INDEX `friends_hashKey_idx`(`hashKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `friend_applies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `hashKey` CHAR(32) NULL,
    `userId` BIGINT UNSIGNED NULL DEFAULT 0,
    `friendId` BIGINT UNSIGNED NULL DEFAULT 0,
    `status` INTEGER NULL DEFAULT 1,
    `remark` VARCHAR(191) NULL,
    `rejectReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiredAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,

    INDEX `friend_applies_userId_idx`(`userId`),
    INDEX `friend_applies_friendId_idx`(`friendId`),
    INDEX `friend_applies_status_idx`(`status`),
    INDEX `friend_applies_hashKey_idx`(`hashKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
