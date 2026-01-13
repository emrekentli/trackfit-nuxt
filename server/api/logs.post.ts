import { eq, and } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const body = await readBody(event);

  const { exerciseId, date, weight, rir, setIndex, reps, sets } = body;

  if (!exerciseId || !date) {
    throw createError({
      statusCode: 400,
      message: 'exerciseId and date are required',
    });
  }

  const db = useDB();

  if (Array.isArray(sets)) {
    const cleanedSets = (sets as { setIndex: number; weight: number; reps?: number | null; rir?: number | null }[])
      .filter((set) => set && typeof set.weight === 'number' && !Number.isNaN(set.weight))
      .map((set) => {
        const rawIndex = Number(set.setIndex);
        const setIndexValue = Number.isNaN(rawIndex) ? 1 : Math.max(1, Math.round(rawIndex));
        const rawReps = set.reps === undefined || set.reps === null ? null : Math.round(Number(set.reps));
        const repsValue = rawReps === null || Number.isNaN(rawReps) ? null : Math.max(0, rawReps);
        const rawRir = set.rir === undefined || set.rir === null ? null : Math.round(Number(set.rir));
        const rirValue = rawRir === null || Number.isNaN(rawRir) ? null : rawRir;

        return {
          setIndex: setIndexValue,
          weightInGrams: Math.round(set.weight * 1000),
          reps: repsValue,
          rir: rirValue,
        };
      });

    await db.transaction(async (tx) => {
      await tx.delete(schema.workoutLogs).where(
        and(
          eq(schema.workoutLogs.userId, userId),
          eq(schema.workoutLogs.exerciseId, exerciseId),
          eq(schema.workoutLogs.date, date)
        )
      );

      if (cleanedSets.length > 0) {
        await tx.insert(schema.workoutLogs).values(
          cleanedSets.map((set) => ({
            userId,
            exerciseId,
            date,
            setIndex: set.setIndex,
            weight: set.weightInGrams,
            reps: set.reps,
            rir: set.rir,
          }))
        );
      }
    });

    const inserted = await db.query.workoutLogs.findMany({
      where: and(
        eq(schema.workoutLogs.userId, userId),
        eq(schema.workoutLogs.exerciseId, exerciseId),
        eq(schema.workoutLogs.date, date)
      ),
      orderBy: schema.workoutLogs.setIndex,
    });

    return inserted.map((log) => ({
      id: log.id,
      exerciseId: log.exerciseId,
      date: log.date,
      weight: log.weight / 1000,
      rir: log.rir ?? null,
      setIndex: log.setIndex,
      reps: log.reps ?? null,
    }));
  }

  if (weight === undefined) {
    throw createError({
      statusCode: 400,
      message: 'weight is required when sets are not provided',
    });
  }

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
