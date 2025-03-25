/*
  Warnings:

  - The primary key for the `group_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `group_members` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedBigInt`.
  - You are about to alter the column `gid` on the `group_members` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedBigInt`.
  - You are about to alter the column `uid` on the `group_members` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedBigInt`.
  - The primary key for the `groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `groups` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedBigInt`.
  - You are about to alter the column `creator_id` on the `groups` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedBigInt`.
  - You are about to alter the column `owner_id` on the `groups` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedBigInt`.
  - Added the required column `chat_id` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `group_members` DROP PRIMARY KEY,
    MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `gid` BIGINT UNSIGNED NOT NULL,
    MODIFY `uid` BIGINT UNSIGNED NOT NULL,
    MODIFY `invite_uid` BIGINT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `groups` DROP PRIMARY KEY,
    ADD COLUMN `chat_id` VARCHAR(191) NOT NULL,
    MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `creator_id` BIGINT UNSIGNED NOT NULL,
    MODIFY `owner_id` BIGINT UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`id`);
