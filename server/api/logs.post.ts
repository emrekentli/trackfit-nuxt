import { eq, and } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const body = await readBody(event);

  const { exerciseId, date, weight } = body;

  if (!exerciseId || !date || weight === undefined) {
    throw createError({
      statusCode: 400,
      message: 'exerciseId, date and weight are required',
    });
  }

  const db = useDB();

  // Check if log exists for this exercise and date
  const existing = await db.query.workoutLogs.findFirst({
    where: and(
      eq(schema.workoutLogs.userId, userId),
      eq(schema.workoutLogs.exerciseId, exerciseId),
      eq(schema.workoutLogs.date, date)
    ),
  });

  const weightInGrams = Math.round(weight * 1000); // Store as grams for precision

  if (existing) {
    // Update existing log
    const [updated] = await db.update(schema.workoutLogs)
      .set({ weight: weightInGrams })
      .where(eq(schema.workoutLogs.id, existing.id))
      .returning();

    return {
      id: updated.id,
      exerciseId: updated.exerciseId,
      date: updated.date,
      weight: updated.weight / 1000,
    };
  }

  // Create new log
  const [log] = await db.insert(schema.workoutLogs).values({
    userId,
    exerciseId,
    date,
    weight: weightInGrams,
  }).returning();

  return {
    id: log.id,
    exerciseId: log.exerciseId,
    date: log.date,
    weight: log.weight / 1000,
  };
});
