CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"title" text,
	"description" text,
	"content" text,
	"source_link" text,
	"source_type" text,
	"cover_img" text,
	"tags" text[],
	"category" text,
	"author" text,
	"translator" text,
	"publisher_id" integer,
	"publish_time" timestamp with time zone,
	"publish_status" integer DEFAULT 1,
	"view_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"name" varchar(50) NOT NULL,
	"desc" text,
	"full_name" text,
	"is_only_monad" integer DEFAULT 0,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"date" timestamp with time zone,
	"users" integer DEFAULT 0,
	"blogs" integer DEFAULT 0,
	"tutorials" integer DEFAULT 0,
	"events" integer DEFAULT 0,
	"posts" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "dapps" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"name" text,
	"description" text,
	"x" text,
	"logo" text,
	"site" text,
	"cover_img" text,
	"category_id" integer,
	"tags" text[],
	"user_id" integer,
	"is_feature" integer DEFAULT 2,
	"is_only_monad" integer DEFAULT 2
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"title" text,
	"description" text,
	"event_mode" text,
	"event_type" text,
	"location" text,
	"link" text,
	"registration_deadline" timestamp with time zone,
	"registration_link" text,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"cover_img" text,
	"tags" text[],
	"participants" integer DEFAULT 0,
	"status" integer DEFAULT 0,
	"publish_status" integer DEFAULT 1,
	"publish_time" timestamp with time zone,
	"twitter" text,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"content" text,
	"url" text,
	"email" text,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission_group_permissions" (
	"permission_group_id" integer,
	"permission_id" integer,
	CONSTRAINT "permission_group_permissions_permission_group_id_permission_id_unique" UNIQUE("permission_group_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "permission_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"name" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"name" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "post_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"title" text,
	"description" text,
	"twitter" text,
	"tags" text[],
	"view_count" integer DEFAULT 0,
	"user_id" integer,
	"like_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "recaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"content" text,
	"video" text,
	"recording" text,
	"twitter" text,
	"event_id" integer,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "role_permission_groups" (
	"role_id" integer,
	"permission_group_id" integer,
	CONSTRAINT "role_permission_groups_role_id_permission_group_id_unique" UNIQUE("role_id","permission_group_id")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer,
	"permission_id" integer,
	CONSTRAINT "role_permissions_role_id_permission_id_unique" UNIQUE("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"name" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "testnets" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"block_num" bigint,
	"avg_block_time" text,
	"contracts" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "tutorials" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"title" text,
	"description" text,
	"content" text,
	"source_link" text,
	"cover_img" text,
	"tags" text[],
	"author" text,
	"publisher_id" integer,
	"publish_time" timestamp with time zone,
	"publish_status" integer DEFAULT 1,
	"dapp_id" integer,
	"view_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"email" text NOT NULL,
	"username" text,
	"avatar" text,
	"github" text,
	"twitter" text,
	"uid" integer,
	"role_id" integer,
	"introduction" text
);
--> statement-breakpoint
CREATE TABLE "validators" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"t1_validators" integer DEFAULT 0,
	"t2_validators" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_publisher_id_users_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dapps" ADD CONSTRAINT "dapps_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dapps" ADD CONSTRAINT "dapps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_group_permissions" ADD CONSTRAINT "permission_group_permissions_permission_group_id_permission_groups_id_fk" FOREIGN KEY ("permission_group_id") REFERENCES "public"."permission_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_group_permissions" ADD CONSTRAINT "permission_group_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_favorites" ADD CONSTRAINT "post_favorites_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_favorites" ADD CONSTRAINT "post_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recaps" ADD CONSTRAINT "recaps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recaps" ADD CONSTRAINT "recaps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission_groups" ADD CONSTRAINT "role_permission_groups_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission_groups" ADD CONSTRAINT "role_permission_groups_permission_group_id_permission_groups_id_fk" FOREIGN KEY ("permission_group_id") REFERENCES "public"."permission_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_publisher_id_users_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_dapp_id_dapps_id_fk" FOREIGN KEY ("dapp_id") REFERENCES "public"."dapps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_parent_id" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_stats_date_unique" ON "daily_stats" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_follows_follower_id" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "idx_follows_following_id" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_follows_pair" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_post_favorite" ON "post_favorites" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_post" ON "post_likes" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_uid" ON "users" USING btree ("uid");