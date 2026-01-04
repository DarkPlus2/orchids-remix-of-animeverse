CREATE TABLE `anime` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`japanese_title` text NOT NULL,
	`synopsis` text NOT NULL,
	`cover_image` text NOT NULL,
	`banner_image` text NOT NULL,
	`rating` real NOT NULL,
	`genres` text NOT NULL,
	`status` text NOT NULL,
	`release_year` integer NOT NULL,
	`total_episodes` integer NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`trending` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `anime_slug_unique` ON `anime` (`slug`);--> statement-breakpoint
CREATE TABLE `episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`anime_id` integer NOT NULL,
	`episode_number` integer NOT NULL,
	`title` text NOT NULL,
	`streamtape_url` text NOT NULL,
	`thumbnail` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON UPDATE no action ON DELETE cascade
);
