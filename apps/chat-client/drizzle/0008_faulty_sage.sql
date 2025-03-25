CREATE TABLE `friend_apply` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`friend_id` integer NOT NULL,
	`status` integer,
	`remark` text,
	`reject_reason` text,
	`created_at` integer,
	`updated_at` integer
);
