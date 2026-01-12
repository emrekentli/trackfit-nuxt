import { pgTable, uuid, varchar, text, integer, date, timestamp, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Exercises table
export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  day: varchar('day', { length: 20 }).notNull(), // Monday, Tuesday, etc.
  notes: text('notes').default(''),
  targetSets: integer('target_sets').default(3),
  targetReps: varchar('target_reps', { length: 20 }).default('10'),
  imageUrl: text('image_url'),
  muscleGroup: varchar('muscle_group', { length: 50 }), // Chest, Back, Shoulders, Arms, Legs, Abs, etc.
  supersetGroup: varchar('superset_group', { length: 50 }), // Group exercises as superset (e.g., "A", "B")
  orderIndex: integer('order_index').default(0), // For ordering exercises within a day
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Workout logs table
export const workoutLogs = pgTable('workout_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  weight: integer('weight').notNull(), // in grams for precision, convert to kg on client
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Body metrics table
export const bodyMetrics = pgTable('body_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  weight: real('weight'), // kg
  bodyFat: real('body_fat'), // percentage
  chest: real('chest'), // cm
  waist: real('waist'), // cm
  hips: real('hips'), // cm
  bicepLeft: real('bicep_left'), // cm
  bicepRight: real('bicep_right'), // cm
  thighLeft: real('thigh_left'), // cm
  thighRight: real('thigh_right'), // cm
  calfLeft: real('calf_left'), // cm
  calfRight: real('calf_right'), // cm
  neck: real('neck'), // cm
  shoulders: real('shoulders'), // cm
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  exercises: many(exercises),
  workoutLogs: many(workoutLogs),
  bodyMetrics: many(bodyMetrics),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  user: one(users, {
    fields: [exercises.userId],
    references: [users.id],
  }),
  logs: many(workoutLogs),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
  user: one(users, {
    fields: [workoutLogs.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [workoutLogs.exerciseId],
    references: [exercises.id],
  }),
}));

export const bodyMetricsRelations = relations(bodyMetrics, ({ one }) => ({
  user: one(users, {
    fields: [bodyMetrics.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type NewWorkoutLog = typeof workoutLogs.$inferInsert;
export type BodyMetric = typeof bodyMetrics.$inferSelect;
export type NewBodyMetric = typeof bodyMetrics.$inferInsert;
