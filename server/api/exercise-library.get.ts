import { asc } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';

export default defineEventHandler(async () => {
  const db = useDB();

  const library = await db
    .select()
    .from(schema.exerciseLibrary)
    .orderBy(asc(schema.exerciseLibrary.muscleGroup), asc(schema.exerciseLibrary.nameTr));

  return library;
});
