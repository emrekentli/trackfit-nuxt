import { eq } from 'drizzle-orm';
import { useDB, schema } from '~~/server/database';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event);
  const db = useDB();

  // Get user data
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  // Get exercises
  const exercises = await db.query.exercises.findMany({
    where: eq(schema.exercises.userId, userId),
  });

  // Get workout logs
  const logs = await db.query.workoutLogs.findMany({
    where: eq(schema.workoutLogs.userId, userId),
  });

  // Get body metrics
  const metrics = await db.query.bodyMetrics.findMany({
    where: eq(schema.bodyMetrics.userId, userId),
  });

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    user: {
      email: user?.email,
      name: user?.name,
    },
    exercises: exercises.map((e) => ({
      name: e.name,
      day: e.day,
      notes: e.notes,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      supersetGroup: e.supersetGroup,
      orderIndex: e.orderIndex,
    })),
    logs: logs.map((l) => ({
      exerciseName: exercises.find((e) => e.id === l.exerciseId)?.name,
      date: l.date,
      weight: l.weight / 1000, // Convert to kg
    })),
    bodyMetrics: metrics.map((m) => ({
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
    })),
  };

  // Set headers for download
  setResponseHeader(event, 'Content-Type', 'application/json');
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="trackfit-export-${new Date().toISOString().split('T')[0]}.json"`);

  return exportData;
});
