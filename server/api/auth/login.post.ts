import { eq } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { setUserSession } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    });
  }

  const db = useDB();

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!user || user.password !== password) {
    // TODO: Use bcrypt.compare in production
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    });
  }

  // Set session
  setUserSession(event, user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
});
