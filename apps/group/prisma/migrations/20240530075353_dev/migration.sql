-- CreateTable
CREATE TABLE `groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator_id` INTEGER NOT NULL,
    `owner_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `notice` VARCHAR(191) NULL,
    `describe` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `cover` VARCHAR(191) NOT NULL,
    `is_enc` INTEGER NOT NULL DEFAULT 0,
    `type` INTEGER NOT NULL DEFAULT 1,
    `ban_type` INTEGER NOT NULL DEFAULT 1,
    `search_type` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `total` INTEGER NOT NULL DEFAULT 1,
    `member_limit` INTEGER NOT NULL DEFAULT 100,
    `weight` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tags` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gid` INTEGER NOT NULL,
    `uid` INTEGER NOT NULL,
    `enc_pri` VARCHAR(191) NOT NULL,
    `enc_key` VARCHAR(191) NOT NULL,
    `invite_uid` INTEGER NULL,
    `role` INTEGER NOT NULL DEFAULT 3,
    `join_type` INTEGER NOT NULL,
    `my_alias` VARCHAR(191) NULL,
    `alias_idx` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `ban_type` INTEGER NOT NULL DEFAULT 1,
    `admin_at` DATETIME(3) NULL,
    `package_expired_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `remark` VARCHAR(191) NULL,

    INDEX `group_member_idx_gid`(`gid`),
    INDEX `group_member_idx_uid`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
