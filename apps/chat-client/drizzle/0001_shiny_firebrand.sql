CREATE TABLE `collects` (
	`id` integer PRIMARY KEY NOT NULL,
	`from_author_id` integer,
	`from_author` text,
	`chat_id` text,
	`type` integer NOT NULL,
	`read_count` integer DEFAULT 0,
	`title` text,
	`data` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `collectTypeIdx` ON `collects` (`type`);--> statement-breakpoint
CREATE INDEX `collectCreateIdx` ON `collects` (`created_at`);