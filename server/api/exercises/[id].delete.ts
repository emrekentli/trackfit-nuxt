import { eq, and } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Exercise ID is required',
    });
  }

  const db = useDB();

  // Delete exercise (cascade will delete related logs)
  const result = await db.delete(schema.exercises)
    .where(and(
      eq(schema.exercises.id, id),
      eq(schema.exercises.userId, userId)
    ))
    .returning();

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Exercise not found',
    });
  }

  return { success: true };
});
