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
  const userExercises = await db.query.exercises.findMany({
    where: eq(schema.exercises.userId, userId),
  });

  // Import exercises
  if (body.exercises && Array.isArray(body.exercises)) {
    for (const exercise of body.exercises) {
      if (!exercise?.name || !exercise?.day) {
        continue;
      }

      const existingExercise = userExercises.find(
        (current) => current.name === exercise.name && current.day === exercise.day
      );

      if (!existingExercise) {
        const [insertedExercise] = await db.insert(schema.exercises).values({
          userId,
          name: exercise.name,
          day: exercise.day,
          notes: exercise.notes || '',
          targetSets: exercise.targetSets || 3,
          targetReps: exercise.targetReps || '10',
          imageUrl: exercise.imageUrl || null,
          muscleGroup: exercise.muscleGroup || null,
          supersetGroup: exercise.supersetGroup,
          orderIndex: exercise.orderIndex || 0,
        }).returning();

        if (insertedExercise) {
          userExercises.push(insertedExercise);
          importedExercises++;
        }
      }
    }
  }

  // Import workout logs
  if (body.logs && Array.isArray(body.logs)) {
    for (const log of body.logs) {
      if (!log?.exerciseName || !log?.date || typeof log.weight !== 'number') {
        continue;
      }

      const exercise = userExercises.find((current) =>
        current.name === log.exerciseName
        && (!log.exerciseDay || current.day === log.exerciseDay)
      );

      if (exercise) {
        await db.insert(schema.workoutLogs).values({
          userId,
          exerciseId: exercise.id,
          date: log.date,
          weight: Math.round(log.weight * 1000), // Convert to grams
          rir: log.rir ?? null,
          setIndex: log.setIndex ? Math.max(1, Math.round(log.setIndex)) : 1,
          reps: log.reps ?? null,
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
