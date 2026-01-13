import { eq } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const db = useDB();

  const logs = await db.query.workoutLogs.findMany({
    where: eq(schema.workoutLogs.userId, userId),
    orderBy: [schema.workoutLogs.date, schema.workoutLogs.setIndex],
  });

  return logs.map((log) => ({
    id: log.id,
    exerciseId: log.exerciseId,
    date: log.date,
    weight: log.weight / 1000, // Convert grams to kg
    rir: log.rir ?? null,
    setIndex: log.setIndex,
    reps: log.reps ?? null,
  }));
});
