import { eq } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const db = useDB();

  const exercises = await db.query.exercises.findMany({
    where: eq(schema.exercises.userId, userId),
    orderBy: schema.exercises.createdAt,
  });

  return exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    day: ex.day,
    notes: ex.notes || '',
    targetSets: ex.targetSets || 3,
    targetReps: ex.targetReps || '10',
    imageUrl: ex.imageUrl || undefined,
  }));
});
