import { eq, desc } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const db = useDB();

  const metrics = await db.query.bodyMetrics.findMany({
    where: eq(schema.bodyMetrics.userId, userId),
    orderBy: desc(schema.bodyMetrics.date),
  });

  return metrics.map((m) => ({
    id: m.id,
    date: m.date,
    weight: m.weight,
    bodyFat: m.bodyFat,
    chest: m.chest,
    waist: m.waist,
    hips: m.hips,
    bicepLeft: m.bicepLeft,
    bicepRight: m.bicepRight,
    thighLeft: m.thighLeft,
    thighRight: m.thighRight,
    calfLeft: m.calfLeft,
    calfRight: m.calfRight,
    neck: m.neck,
    shoulders: m.shoulders,
    notes: m.notes,
  }));
});
