-- CreateTable
CREATE TABLE `user_complain` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `complain_user_id` BIGINT NOT NULL,
    `from_user_id` BIGINT NOT NULL,
    `content` VARCHAR(191) NULL,
    `image_urls` TEXT NULL,
    `complain_status` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
