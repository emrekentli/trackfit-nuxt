ALTER TABLE "workout_logs" ADD COLUMN "rir" integer;
ALTER TABLE "workout_logs" ADD COLUMN "set_index" integer DEFAULT 1 NOT NULL;
ALTER TABLE "workout_logs" ADD COLUMN "reps" integer;
