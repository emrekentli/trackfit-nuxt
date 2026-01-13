import { eq, and } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const body = await readBody(event);

  const { exerciseId, date, weight, rir, setIndex, reps } = body;

  if (!exerciseId || !date || weight === undefined) {
    throw createError({
      statusCode: 400,
      message: 'exerciseId, date and weight are required',
    });
  }

  const db = useDB();

  const weightInGrams = Math.round(weight * 1000); // Store as grams for precision
  let rirValue: number | null = null;
  if (rir !== undefined && rir !== null) {
    const parsedRir = Number(rir);
    rirValue = Number.isNaN(parsedRir) ? null : Math.round(parsedRir);
  }

  const rawSetIndex = Number(setIndex);
  const setIndexValue = Number.isNaN(rawSetIndex) ? 1 : Math.max(1, Math.round(rawSetIndex));
  const rawReps = reps === undefined || reps === null ? null : Math.round(Number(reps));
  const repsValue = rawReps === null || Number.isNaN(rawReps) ? null : Math.max(0, rawReps);

  const existing = await db.query.workoutLogs.findFirst({
    where: and(
      eq(schema.workoutLogs.userId, userId),
      eq(schema.workoutLogs.exerciseId, exerciseId),
      eq(schema.workoutLogs.date, date),
      eq(schema.workoutLogs.setIndex, setIndexValue)
    ),
  });

  if (existing) {
    // Update existing log
    const [updated] = await db.update(schema.workoutLogs)
      .set(
        rir === undefined && reps === undefined
          ? { weight: weightInGrams }
          : { weight: weightInGrams, rir: rirValue, reps: repsValue }
      )
      .where(eq(schema.workoutLogs.id, existing.id))
      .returning();

    if (!updated) {
      throw createError({ statusCode: 500, message: 'Failed to update log' });
    }

    return {
      id: updated.id,
      exerciseId: updated.exerciseId,
      date: updated.date,
      weight: updated.weight / 1000,
      rir: updated.rir ?? null,
      setIndex: updated.setIndex,
      reps: updated.reps ?? null,
    };
  }

  // Create new log
  const [log] = await db.insert(schema.workoutLogs).values({
    userId,
    exerciseId,
    date,
    weight: weightInGrams,
    rir: rirValue,
    setIndex: setIndexValue,
    reps: repsValue,
  }).returning();

  if (!log) {
    throw createError({ statusCode: 500, message: 'Failed to create log' });
  }

  return {
    id: log.id,
    exerciseId: log.exerciseId,
    date: log.date,
    weight: log.weight / 1000,
    rir: log.rir ?? null,
    setIndex: log.setIndex,
    reps: log.reps ?? null,
  };
});
