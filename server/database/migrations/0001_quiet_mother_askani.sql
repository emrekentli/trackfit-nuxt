CREATE TABLE "body_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"weight" real,
	"body_fat" real,
	"chest" real,
	"waist" real,
	"hips" real,
	"bicep_left" real,
	"bicep_right" real,
	"thigh_left" real,
	"thigh_right" real,
	"calf_left" real,
	"calf_right" real,
	"neck" real,
	"shoulders" real,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "superset_group" varchar(50);--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "order_index" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;