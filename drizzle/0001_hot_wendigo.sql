CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(200) NOT NULL,
	`title` varchar(300) NOT NULL,
	`metaDescription` varchar(500) NOT NULL,
	`body` longtext NOT NULL,
	`tldr` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`tags` json NOT NULL DEFAULT ('[]'),
	`asinsUsed` json NOT NULL DEFAULT ('[]'),
	`internalLinksUsed` json NOT NULL DEFAULT ('[]'),
	`heroUrl` text NOT NULL,
	`heroAlt` varchar(300) NOT NULL,
	`wordCount` int NOT NULL,
	`readingTime` int NOT NULL,
	`openerType` enum('gut-punch','question','story','counterintuitive') NOT NULL,
	`conclusionType` enum('cta','reflection','question','challenge','benediction') NOT NULL,
	`faqCount` int NOT NULL DEFAULT 0,
	`hasOraclelinkBacklink` boolean NOT NULL DEFAULT false,
	`hasExternalAuthLink` boolean NOT NULL DEFAULT false,
	`status` enum('queued','published') NOT NULL DEFAULT 'queued',
	`queuedAt` timestamp NOT NULL DEFAULT (now()),
	`publishedAt` timestamp,
	`lastModifiedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `asins` (
	`asin` varchar(20) NOT NULL,
	`title` varchar(500) NOT NULL,
	`category` varchar(80) NOT NULL,
	`tags` json NOT NULL DEFAULT ('[]'),
	`status` enum('valid','invalid','unverified') NOT NULL DEFAULT 'unverified',
	`lastChecked` timestamp,
	`invalidReason` varchar(200),
	CONSTRAINT `asins_asin` PRIMARY KEY(`asin`)
);
--> statement-breakpoint
CREATE TABLE `cronRuns` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`jobName` varchar(80) NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	`success` boolean NOT NULL DEFAULT false,
	`note` text,
	CONSTRAINT `cronRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `articles_status_idx` ON `articles` (`status`);--> statement-breakpoint
CREATE INDEX `articles_published_at_idx` ON `articles` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `articles_queued_at_idx` ON `articles` (`queuedAt`);--> statement-breakpoint
CREATE INDEX `articles_category_idx` ON `articles` (`category`);--> statement-breakpoint
CREATE INDEX `articles_slug_idx` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `asins_category_idx` ON `asins` (`category`);--> statement-breakpoint
CREATE INDEX `asins_status_idx` ON `asins` (`status`);--> statement-breakpoint
CREATE INDEX `cron_job_name_idx` ON `cronRuns` (`jobName`);--> statement-breakpoint
CREATE INDEX `cron_started_at_idx` ON `cronRuns` (`startedAt`);