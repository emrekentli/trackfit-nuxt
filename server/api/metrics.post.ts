import { eq, and } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const body = await readBody(event);

  const { date, ...metricData } = body;

  if (!date) {
    throw createError({
      statusCode: 400,
      message: 'date is required',
    });
  }

  const db = useDB();

  // Check if metrics exist for this date
  const existing = await db.query.bodyMetrics.findFirst({
    where: and(
      eq(schema.bodyMetrics.userId, userId),
      eq(schema.bodyMetrics.date, date)
    ),
  });

  if (existing) {
    // Update existing metrics
    const [updated] = await db.update(schema.bodyMetrics)
      .set({
        weight: metricData.weight ?? existing.weight,
        bodyFat: metricData.bodyFat ?? existing.bodyFat,
        chest: metricData.chest ?? existing.chest,
        waist: metricData.waist ?? existing.waist,
        hips: metricData.hips ?? existing.hips,
        bicepLeft: metricData.bicepLeft ?? existing.bicepLeft,
        bicepRight: metricData.bicepRight ?? existing.bicepRight,
        thighLeft: metricData.thighLeft ?? existing.thighLeft,
        thighRight: metricData.thighRight ?? existing.thighRight,
        calfLeft: metricData.calfLeft ?? existing.calfLeft,
        calfRight: metricData.calfRight ?? existing.calfRight,
        neck: metricData.neck ?? existing.neck,
        shoulders: metricData.shoulders ?? existing.shoulders,
        notes: metricData.notes ?? existing.notes,
      })
      .where(eq(schema.bodyMetrics.id, existing.id))
      .returning();

    if (!updated) {
      throw createError({ statusCode: 500, message: 'Failed to update metrics' });
    }

    return {
      id: updated.id,
      date: updated.date,
      weight: updated.weight,
      bodyFat: updated.bodyFat,
      chest: updated.chest,
      waist: updated.waist,
      hips: updated.hips,
      bicepLeft: updated.bicepLeft,
      bicepRight: updated.bicepRight,
      thighLeft: updated.thighLeft,
      thighRight: updated.thighRight,
      calfLeft: updated.calfLeft,
      calfRight: updated.calfRight,
      neck: updated.neck,
      shoulders: updated.shoulders,
      notes: updated.notes,
    };
  }

  // Create new metrics entry
  const [metric] = await db.insert(schema.bodyMetrics).values({
    userId,
    date,
    weight: metricData.weight,
    bodyFat: metricData.bodyFat,
    chest: metricData.chest,
    waist: metricData.waist,
    hips: metricData.hips,
    bicepLeft: metricData.bicepLeft,
    bicepRight: metricData.bicepRight,
    thighLeft: metricData.thighLeft,
    thighRight: metricData.thighRight,
    calfLeft: metricData.calfLeft,
    calfRight: metricData.calfRight,
    neck: metricData.neck,
    shoulders: metricData.shoulders,
    notes: metricData.notes,
  }).returning();

  if (!metric) {
    throw createError({ statusCode: 500, message: 'Failed to create metrics' });
  }

  return {
    id: metric.id,
    date: metric.date,
    weight: metric.weight,
    bodyFat: metric.bodyFat,
    chest: metric.chest,
    waist: metric.waist,
    hips: metric.hips,
    bicepLeft: metric.bicepLeft,
    bicepRight: metric.bicepRight,
    thighLeft: metric.thighLeft,
    thighRight: metric.thighRight,
    calfLeft: metric.calfLeft,
    calfRight: metric.calfRight,
    neck: metric.neck,
    shoulders: metric.shoulders,
    notes: metric.notes,
  };
});
