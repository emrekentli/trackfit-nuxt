import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// EGE FITNESS 2.0 – Estetik (5 Gün, Kardiyo Hariç)
const PROGRAM = [
    {
        day: 'Monday',
        name: 'Push – Shoulder Priority',
        exercises: [
            { name: 'Dumbbell Shoulder Press', sets: 3, reps: '6-8' },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '6-10' },
            { name: 'Arnold Press', sets: 3, reps: '8-12' },
            { name: 'Cable Lateral Raise', sets: 4, reps: '15-20' },
            { name: 'Skull Crushers', sets: 3, reps: '6-12' },
            { name: 'Rope Pushdown', sets: 4, reps: '15-20' },
        ],
    },
    {
        day: 'Tuesday',
        name: 'Pull – Back & Rear Delt Priority',
        exercises: [
            { name: 'Lat Pulldown', sets: 4, reps: '6-8' },
            { name: 'Chest Supported Row', sets: 3, reps: '6-10' },
            { name: 'High to Low Chest Supported Row', sets: 3, reps: '8-12' },
            { name: 'Face Pull', sets: 3, reps: '15-20' },
            { name: 'Reverse Pec Deck', sets: 3, reps: '15-20' },
            { name: 'Dumbbell Curl', sets: 3, reps: '8-12' },
        ],
    },
    {
        day: 'Wednesday',
        name: 'Legs + Abs',
        exercises: [
            { name: 'Squat / Hack Squat', sets: 4, reps: '6-10' },
            { name: 'Bulgarian Split Squat', sets: 3, reps: '8-12' },
            { name: 'Leg Press', sets: 3, reps: '10-15' },
            { name: 'Hamstring Curl', sets: 3, reps: '12-15' },
            { name: 'Standing Calf Raise', sets: 4, reps: '12-20' },
            { name: 'Hanging Knee Raises', sets: 4, reps: '15-20' },
            { name: 'Decline Bench Sit Ups', sets: 3, reps: '20' },
        ],
    },
    {
        day: 'Thursday',
        name: 'Push – Chest Priority',
        exercises: [
            { name: 'Incline Dumbbell Press', sets: 4, reps: '6-8' },
            { name: 'Flat Dumbbell Press', sets: 4, reps: '8-12' },
            { name: 'Machine Dips', sets: 3, reps: '8-12' },
            { name: 'Cable Fly', sets: 3, reps: '15-20' },
            { name: 'Dumbbell Lateral Raise', sets: 4, reps: '15-20' },
            { name: 'Overhead Rope Tricep Extension', sets: 4, reps: '10-15' },
        ],
    },
    {
        day: 'Friday',
        name: 'Pull – Arm Priority',
        exercises: [
            { name: 'Weighted Pull Up', sets: 3, reps: '6-8' },
            { name: 'Seated Cable Row', sets: 3, reps: '8-12' },
            { name: 'Straight Arm Pulldown', sets: 3, reps: '12-15' },
            { name: 'Barbell Curl', sets: 3, reps: '8-12' },
            { name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12' },
            { name: 'Hammer Curl', sets: 3, reps: '12-15' },
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
    const exercisesData = PROGRAM.flatMap((dayProgram) =>
      dayProgram.exercises.map((ex) => ({
        userId: user.id,
        name: ex.name,
        day: dayProgram.day,
        notes: dayProgram.name, // Gün adını not olarak ekle
        targetSets: ex.sets,
        targetReps: ex.reps,
      }))
    );

    await db.insert(schema.exercises).values(exercisesData);
    console.log('Created', exercisesData.length, 'exercises');
  } else {
    console.log('User already exists: emrekentlii@gmail.com');
  }

  await client.end();
  console.log('Seeding complete!');
}

seed().catch(console.error);
