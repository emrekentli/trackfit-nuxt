import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// EGE FITNESS 3.0 – 5 Day Split with Supersets
const PROGRAM = [
  {
    day: 'Monday',
    name: 'Push – Shoulder Priority + Triceps',
    exercises: [
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '6-8', supersetGroup: null },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '6-10', supersetGroup: null },
      { name: 'Arnold Press', sets: 3, reps: '8-12', supersetGroup: null },
      { name: 'Cable Lateral Raise', sets: 4, reps: '15-20', supersetGroup: 'A' },
      { name: 'Skull Crushers', sets: 3, reps: '6-12', supersetGroup: 'A' },
      { name: 'Rope Pushdown', sets: 4, reps: '15-20', supersetGroup: null },
      // Heavy Abs
      { name: 'Hanging Weighted Leg Raises', sets: 4, reps: '8-12', supersetGroup: null },
      { name: 'Decline Bench Weighted Sit Ups', sets: 4, reps: '8-12', supersetGroup: null },
      { name: 'Cable Crunch', sets: 3, reps: '20', supersetGroup: null },
      { name: 'Plank', sets: 3, reps: 'Failure', supersetGroup: null },
    ],
  },
  {
    day: 'Tuesday',
    name: 'Pull – Back Priority + Biceps',
    exercises: [
      { name: 'Lat Pulldown', sets: 4, reps: '6-8', supersetGroup: null },
      { name: 'Seated Cable Row', sets: 3, reps: '8-12', supersetGroup: null },
      { name: 'Pull Ups / Inverted Row', sets: 3, reps: 'Failure', supersetGroup: null },
      { name: 'Strict Dumbbell Curl', sets: 3, reps: '6-12', supersetGroup: null },
      { name: 'Face Pull', sets: 3, reps: '15-20', supersetGroup: 'A' },
      { name: 'Hammer Dumbbell Curl', sets: 4, reps: '8-12', supersetGroup: 'A' },
    ],
  },
  {
    day: 'Wednesday',
    name: 'Legs + Abs',
    exercises: [
      { name: 'Squat / Hack Squat', sets: 4, reps: '6-12', supersetGroup: null },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '8-12', supersetGroup: null },
      { name: 'Leg Press', sets: 3, reps: '10-15', supersetGroup: null },
      { name: 'Hamstring Curl', sets: 3, reps: '12-15', supersetGroup: 'A' },
      { name: 'Leg Extension', sets: 3, reps: '15', supersetGroup: 'A' },
      { name: 'Standing Calf Raise', sets: 4, reps: '12-20', supersetGroup: null },
      // Abs
      { name: 'Hanging Knee Raises', sets: 4, reps: '15-20', supersetGroup: null },
      { name: 'Decline Bench Knee Raises', sets: 4, reps: '15-20', supersetGroup: null },
      { name: 'Decline Bench Sit Ups', sets: 3, reps: '20', supersetGroup: null },
      { name: 'Bicycle Crunch', sets: 3, reps: '20', supersetGroup: null },
      { name: 'Plank', sets: 3, reps: 'Failure', supersetGroup: null },
    ],
  },
  {
    day: 'Thursday',
    name: 'Push – Chest Priority + Shoulder Control',
    exercises: [
      { name: 'Incline Dumbbell Press', sets: 4, reps: '6-8', supersetGroup: null },
      { name: 'Dumbbell Press', sets: 4, reps: '8-12', supersetGroup: null },
      { name: 'Machine Dips', sets: 3, reps: '8-12', supersetGroup: null },
      { name: 'Cable Fly', sets: 3, reps: '15-20', supersetGroup: null },
      { name: 'Dumbbell Lateral Raise', sets: 4, reps: '15-20', supersetGroup: 'A' },
      { name: 'Cable Bar Pushdown', sets: 4, reps: '8-12', supersetGroup: 'A' },
      { name: 'Overhead Rope Tricep Extension', sets: 4, reps: '10-15', supersetGroup: null },
    ],
  },
  {
    day: 'Friday',
    name: 'Pull – Rear Delt + Weak Points',
    exercises: [
      { name: 'Chest Supported Row', sets: 3, reps: '6-10', supersetGroup: null },
      { name: 'High to Low Chest Supported Row', sets: 3, reps: '8-12', supersetGroup: null },
      { name: 'Rope Pullover', sets: 3, reps: '15-20', supersetGroup: null },
      { name: 'Face Pull', sets: 3, reps: '8-12', supersetGroup: null },
      { name: 'Reverse Pec Deck', sets: 3, reps: '15-20', supersetGroup: 'A' },
      { name: 'Barbell Curl', sets: 3, reps: '8-12', supersetGroup: 'A' },
      { name: 'Reverse Barbell Curl', sets: 3, reps: '10-12', supersetGroup: null },
      { name: 'Dumbbell Shrugs', sets: 3, reps: '10-15', supersetGroup: null },
      // Heavy Abs
      { name: 'Hanging Weighted Leg Raises', sets: 4, reps: '8-12', supersetGroup: null },
      { name: 'Decline Bench Weighted Sit Ups', sets: 4, reps: '8-12', supersetGroup: null },
      { name: 'Cable Crunch', sets: 3, reps: '20', supersetGroup: null },
      { name: 'Plank', sets: 3, reps: 'Failure', supersetGroup: null },
    ],
  },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
  }

  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  console.log('Seeding database...');

  // Create user
  const [user] = await db
    .insert(schema.users)
    .values({
      email: 'emrekentlii@gmail.com',
      password: '123456',
      name: 'Emre Kentli',
    })
    .onConflictDoNothing()
    .returning();

  if (user) {
    console.log('Created user:', user.email);

    // Create exercises from program
    let orderIndex = 0;
    const exercisesData = PROGRAM.flatMap((dayProgram) =>
      dayProgram.exercises.map((ex) => ({
        userId: user.id,
        name: ex.name,
        day: dayProgram.day,
        notes: dayProgram.name,
        targetSets: ex.sets,
        targetReps: ex.reps,
        supersetGroup: ex.supersetGroup,
        orderIndex: orderIndex++,
      }))
    );

    await db.insert(schema.exercises).values(exercisesData);
    console.log('Created', exercisesData.length, 'exercises');

    // Count supersets
    const supersetCount = exercisesData.filter((e) => e.supersetGroup).length;
    console.log('Including', supersetCount, 'superset exercises');
  } else {
    console.log('User already exists: emrekentlii@gmail.com');
  }

  await client.end();
  console.log('Seeding complete!');
}

seed().catch(console.error);
