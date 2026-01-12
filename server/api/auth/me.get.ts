import { eq } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { getUserSession } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = getUserSession(event);

  if (!userId) {
    return null;
  }

  const db = useDB();

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
});
