import { eq } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { setUserSession } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, name } = body;

  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      message: 'Email, password and name are required',
    });
  }

  const db = useDB();

  // Check if user exists
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'User already exists',
    });
  }

  // Create user (in production, hash the password!)
  const [user] = await db.insert(schema.users).values({
    email,
    password, // TODO: Hash password with bcrypt
    name,
  }).returning();

  // Set session
  setUserSession(event, user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
});
