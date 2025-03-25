DROP INDEX IF EXISTS `collectTypeIdx`;--> statement-breakpoint
ALTER TABLE `collects` ADD `collect_type` text NOT NULL;--> statement-breakpoint
CREATE INDEX `collectTypeIdx` ON `collects` (`collect_type`);--> statement-breakpoint
ALTER TABLE `collects` DROP COLUMN `type`;