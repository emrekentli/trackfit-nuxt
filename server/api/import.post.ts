import { eq } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const body = await readBody(event);

  if (!body || !body.version) {
    throw createError({
      statusCode: 400,
      message: 'Invalid import data format',
    });
  }

  const db = useDB();

  let importedExercises = 0;
  let importedLogs = 0;
  let importedMetrics = 0;

  // Import exercises
  if (body.exercises && Array.isArray(body.exercises)) {
    for (const exercise of body.exercises) {
      // Check if exercise already exists
      const existing = await db.query.exercises.findFirst({
        where: eq(schema.exercises.userId, userId),
      });

      // Only insert if it doesn't exist (by name and day)
      const existingByName = await db.query.exercises.findFirst({
        where: eq(schema.exercises.name, exercise.name),
      });

      if (!existingByName) {
        await db.insert(schema.exercises).values({
          userId,
          name: exercise.name,
          day: exercise.day,
          notes: exercise.notes || '',
          targetSets: exercise.targetSets || 3,
          targetReps: exercise.targetReps || '10',
          supersetGroup: exercise.supersetGroup,
          orderIndex: exercise.orderIndex || 0,
        });
        importedExercises++;
      }
    }
  }

  // Import workout logs
  if (body.logs && Array.isArray(body.logs)) {
    // Get all exercises for this user to map names to IDs
    const userExercises = await db.query.exercises.findMany({
      where: eq(schema.exercises.userId, userId),
    });

    for (const log of body.logs) {
      const exercise = userExercises.find((e) => e.name === log.exerciseName);
      if (exercise) {
        await db.insert(schema.workoutLogs).values({
          userId,
          exerciseId: exercise.id,
          date: log.date,
          weight: Math.round(log.weight * 1000), // Convert to grams
        }).onConflictDoNothing();
        importedLogs++;
      }
    }
  }

  // Import body metrics
  if (body.bodyMetrics && Array.isArray(body.bodyMetrics)) {
    for (const metric of body.bodyMetrics) {
      await db.insert(schema.bodyMetrics).values({
        userId,
        date: metric.date,
        weight: metric.weight,
        bodyFat: metric.bodyFat,
        chest: metric.chest,
        waist: metric.waist,
        hips: metric.hips,
        bicepLeft: metric.bicepLeft,
        bicepRight: metric.bicepRight,
        thighLeft: metric.thighLeft,
        thighRight: metric.thighRight,
        calfLeft: metric.calfLeft,
        calfRight: metric.calfRight,
        neck: metric.neck,
        shoulders: metric.shoulders,
        notes: metric.notes,
      }).onConflictDoNothing();
      importedMetrics++;
    }
  }

  return {
    success: true,
    imported: {
      exercises: importedExercises,
      logs: importedLogs,
      bodyMetrics: importedMetrics,
    },
  };
});
