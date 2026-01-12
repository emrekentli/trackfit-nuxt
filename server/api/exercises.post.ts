import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const body = await readBody(event);

  const { name, day, notes, targetSets, targetReps, imageUrl } = body;

  if (!name || !day) {
    throw createError({
      statusCode: 400,
      message: 'Name and day are required',
    });
  }

  const db = useDB();

  const [exercise] = await db.insert(schema.exercises).values({
    userId,
    name,
    day,
    notes: notes || '',
    targetSets: targetSets || 3,
    targetReps: targetReps || '10',
    imageUrl: imageUrl || null,
  }).returning();

  if (!exercise) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create exercise',
    });
  }

  return {
    id: exercise.id,
    name: exercise.name,
    day: exercise.day,
    notes: exercise.notes || '',
    targetSets: exercise.targetSets || 3,
    targetReps: exercise.targetReps || '10',
    imageUrl: exercise.imageUrl || undefined,
  };
});
