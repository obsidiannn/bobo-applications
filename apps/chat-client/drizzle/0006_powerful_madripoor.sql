ALTER TABLE `collect_detail` ADD `from_author_id` integer;--> statement-breakpoint
ALTER TABLE `collect_detail` ADD `from_author` text;--> statement-breakpoint
ALTER TABLE `collect_detail` ADD `chat_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `collect_detail` ADD `msg_id` text NOT NULL;