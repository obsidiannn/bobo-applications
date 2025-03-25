ALTER TABLE `collects` ADD `msg_id` text;--> statement-breakpoint
CREATE INDEX `collectMsgIdx` ON `collects` (`msg_id`);