CREATE TABLE "exercise_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_tr" varchar(255) NOT NULL,
	"muscle_group" varchar(50) NOT NULL,
	"equipment" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
