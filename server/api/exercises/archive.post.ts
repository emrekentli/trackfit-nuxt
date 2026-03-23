import { and, eq, inArray } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const body = await readBody(event);

  const archived = body?.archived;
  const ids: string[] = [];
  if (Array.isArray(body?.ids)) {
    for (const id of body.ids) {
      if (typeof id === 'string' && id.length > 0 && !ids.includes(id)) {
        ids.push(id);
      }
    }
  }

  if (typeof archived !== 'boolean' || ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'ids and archived are required',
    });
  }

  const db = useDB();

  await db
    .update(schema.exercises)
    .set({ archived })
    .where(and(eq(schema.exercises.userId, userId), inArray(schema.exercises.id, ids)));

  return {
    success: true,
    updatedCount: ids.length,
    archived,
  };
});
