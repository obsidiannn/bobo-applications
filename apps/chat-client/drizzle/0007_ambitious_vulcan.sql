ALTER TABLE `messages` ADD `data_type` text NOT NULL;--> statement-breakpoint
CREATE INDEX `message_data_type_index` ON `messages` (`data_type`);