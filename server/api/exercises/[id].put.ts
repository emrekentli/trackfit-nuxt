import { eq, and } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Exercise ID is required',
    });
  }

  const db = useDB();

  // Check if exercise belongs to user
  const existing = await db.query.exercises.findFirst({
    where: and(eq(schema.exercises.id, id), eq(schema.exercises.userId, userId)),
  });

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Exercise not found',
    });
  }

  const [updated] = await db
    .update(schema.exercises)
    .set({
      name: body.name ?? existing.name,
      day: body.day ?? existing.day,
      notes: body.notes ?? existing.notes,
      targetSets: body.targetSets ?? existing.targetSets,
      targetReps: body.targetReps ?? existing.targetReps,
      imageUrl: body.imageUrl ?? existing.imageUrl,
      muscleGroup: body.muscleGroup ?? existing.muscleGroup,
      supersetGroup: body.supersetGroup ?? existing.supersetGroup,
      orderIndex: body.orderIndex ?? existing.orderIndex,
    })
    .where(and(eq(schema.exercises.id, id), eq(schema.exercises.userId, userId)))
    .returning();

  if (!updated) {
    throw createError({
      statusCode: 500,
      message: 'Failed to update exercise',
    });
  }

  return {
    id: updated.id,
    name: updated.name,
    day: updated.day,
    notes: updated.notes || '',
    targetSets: updated.targetSets || 3,
    targetReps: updated.targetReps || '10',
    imageUrl: updated.imageUrl || undefined,
    muscleGroup: updated.muscleGroup || null,
    supersetGroup: updated.supersetGroup || null,
    orderIndex: updated.orderIndex || 0,
  };
});
