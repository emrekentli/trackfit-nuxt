import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const EXERCISE_LIBRARY = [
  // === CHEST (Göğüs) ===
  { name: 'Barbell Bench Press', nameTr: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Dumbbell Bench Press', nameTr: 'Dumbbell Bench Press', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { name: 'Incline Barbell Press', nameTr: 'Incline Barbell Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Incline Dumbbell Press', nameTr: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { name: 'Decline Bench Press', nameTr: 'Decline Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Cable Fly', nameTr: 'Cable Fly', muscleGroup: 'Chest', equipment: 'Cable' },
  { name: 'Dumbbell Fly', nameTr: 'Dumbbell Fly', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { name: 'Incline Cable Fly', nameTr: 'Incline Cable Fly', muscleGroup: 'Chest', equipment: 'Cable' },
  { name: 'Pec Deck Machine', nameTr: 'Pec Deck', muscleGroup: 'Chest', equipment: 'Machine' },
  { name: 'Chest Press Machine', nameTr: 'Chest Press Machine', muscleGroup: 'Chest', equipment: 'Machine' },
  { name: 'Push-Up', nameTr: 'Şınav', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { name: 'Dips (Chest)', nameTr: 'Dips (Göğüs)', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { name: 'Landmine Press', nameTr: 'Landmine Press', muscleGroup: 'Chest', equipment: 'Barbell' },

  // === BACK (Sırt) ===
  { name: 'Lat Pulldown', nameTr: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
  { name: 'Wide Grip Lat Pulldown', nameTr: 'Wide Grip Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
  { name: 'Close Grip Lat Pulldown', nameTr: 'Close Grip Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
  { name: 'Pull-Up', nameTr: 'Barfiks', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { name: 'Chin-Up', nameTr: 'Chin-Up', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { name: 'Barbell Row', nameTr: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Dumbbell Row', nameTr: 'Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell' },
  { name: 'T-Bar Row', nameTr: 'T-Bar Row', muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Seated Cable Row', nameTr: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cable' },
  { name: 'Cable Row (Close Grip)', nameTr: 'Cable Row (Close Grip)', muscleGroup: 'Back', equipment: 'Cable' },
  { name: 'Machine Row', nameTr: 'Machine Row', muscleGroup: 'Back', equipment: 'Machine' },
  { name: 'Deadlift', nameTr: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Romanian Deadlift', nameTr: 'Romanian Deadlift', muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Rack Pull', nameTr: 'Rack Pull', muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Straight Arm Pulldown', nameTr: 'Straight Arm Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
  { name: 'Hyperextension', nameTr: 'Hyperextension', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { name: 'Single Arm Cable Row', nameTr: 'Single Arm Cable Row', muscleGroup: 'Back', equipment: 'Cable' },

  // === SHOULDERS (Omuz) ===
  { name: 'Overhead Press', nameTr: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Dumbbell Shoulder Press', nameTr: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Arnold Press', nameTr: 'Arnold Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Machine Shoulder Press', nameTr: 'Machine Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Machine' },
  { name: 'Lateral Raise', nameTr: 'Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Cable Lateral Raise', nameTr: 'Cable Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Cable' },
  { name: 'Machine Lateral Raise', nameTr: 'Machine Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Machine' },
  { name: 'Front Raise', nameTr: 'Front Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Face Pull', nameTr: 'Face Pull', muscleGroup: 'Shoulders', equipment: 'Cable' },
  { name: 'Rear Delt Fly', nameTr: 'Rear Delt Fly', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Reverse Pec Deck', nameTr: 'Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'Machine' },
  { name: 'Upright Row', nameTr: 'Upright Row', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Shrugs', nameTr: 'Shrugs', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Barbell Shrugs', nameTr: 'Barbell Shrugs', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Lu Raise', nameTr: 'Lu Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },

  // === BICEPS ===
  { name: 'Barbell Curl', nameTr: 'Barbell Curl', muscleGroup: 'Biceps', equipment: 'Barbell' },
  { name: 'EZ Bar Curl', nameTr: 'EZ Bar Curl', muscleGroup: 'Biceps', equipment: 'Barbell' },
  { name: 'Dumbbell Curl', nameTr: 'Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Hammer Curl', nameTr: 'Hammer Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Incline Dumbbell Curl', nameTr: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Preacher Curl', nameTr: 'Preacher Curl', muscleGroup: 'Biceps', equipment: 'Barbell' },
  { name: 'Cable Curl', nameTr: 'Cable Curl', muscleGroup: 'Biceps', equipment: 'Cable' },
  { name: 'Concentration Curl', nameTr: 'Concentration Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Spider Curl', nameTr: 'Spider Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Machine Curl', nameTr: 'Machine Curl', muscleGroup: 'Biceps', equipment: 'Machine' },
  { name: 'Reverse Curl', nameTr: 'Reverse Curl', muscleGroup: 'Biceps', equipment: 'Barbell' },
  { name: 'Cable Hammer Curl', nameTr: 'Cable Hammer Curl', muscleGroup: 'Biceps', equipment: 'Cable' },

  // === TRICEPS ===
  { name: 'Tricep Pushdown', nameTr: 'Tricep Pushdown', muscleGroup: 'Triceps', equipment: 'Cable' },
  { name: 'Rope Pushdown', nameTr: 'Rope Pushdown', muscleGroup: 'Triceps', equipment: 'Cable' },
  { name: 'Overhead Tricep Extension', nameTr: 'Overhead Tricep Extension', muscleGroup: 'Triceps', equipment: 'Cable' },
  { name: 'Skull Crusher', nameTr: 'Skull Crusher', muscleGroup: 'Triceps', equipment: 'Barbell' },
  { name: 'Close Grip Bench Press', nameTr: 'Close Grip Bench Press', muscleGroup: 'Triceps', equipment: 'Barbell' },
  { name: 'Dumbbell Tricep Extension', nameTr: 'Dumbbell Tricep Extension', muscleGroup: 'Triceps', equipment: 'Dumbbell' },
  { name: 'Dumbbell Kickback', nameTr: 'Dumbbell Kickback', muscleGroup: 'Triceps', equipment: 'Dumbbell' },
  { name: 'Dips (Triceps)', nameTr: 'Dips (Triceps)', muscleGroup: 'Triceps', equipment: 'Bodyweight' },
  { name: 'Diamond Push-Up', nameTr: 'Diamond Push-Up', muscleGroup: 'Triceps', equipment: 'Bodyweight' },
  { name: 'Tricep Machine', nameTr: 'Tricep Machine', muscleGroup: 'Triceps', equipment: 'Machine' },
  { name: 'Single Arm Pushdown', nameTr: 'Single Arm Pushdown', muscleGroup: 'Triceps', equipment: 'Cable' },

  // === LEGS (Bacak) ===
  { name: 'Barbell Squat', nameTr: 'Barbell Squat', muscleGroup: 'Legs', equipment: 'Barbell' },
  { name: 'Front Squat', nameTr: 'Front Squat', muscleGroup: 'Legs', equipment: 'Barbell' },
  { name: 'Goblet Squat', nameTr: 'Goblet Squat', muscleGroup: 'Legs', equipment: 'Dumbbell' },
  { name: 'Hack Squat', nameTr: 'Hack Squat', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Leg Press', nameTr: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Smith Machine Squat', nameTr: 'Smith Machine Squat', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Bulgarian Split Squat', nameTr: 'Bulgarian Split Squat', muscleGroup: 'Legs', equipment: 'Dumbbell' },
  { name: 'Lunges', nameTr: 'Lunges', muscleGroup: 'Legs', equipment: 'Dumbbell' },
  { name: 'Walking Lunges', nameTr: 'Walking Lunges', muscleGroup: 'Legs', equipment: 'Dumbbell' },
  { name: 'Leg Extension', nameTr: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Leg Curl (Lying)', nameTr: 'Leg Curl (Lying)', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Leg Curl (Seated)', nameTr: 'Leg Curl (Seated)', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Stiff Leg Deadlift', nameTr: 'Stiff Leg Deadlift', muscleGroup: 'Legs', equipment: 'Barbell' },
  { name: 'Good Morning', nameTr: 'Good Morning', muscleGroup: 'Legs', equipment: 'Barbell' },
  { name: 'Hip Thrust', nameTr: 'Hip Thrust', muscleGroup: 'Legs', equipment: 'Barbell' },
  { name: 'Glute Bridge', nameTr: 'Glute Bridge', muscleGroup: 'Legs', equipment: 'Bodyweight' },
  { name: 'Adductor Machine', nameTr: 'Adductor Machine', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Abductor Machine', nameTr: 'Abductor Machine', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Step-Up', nameTr: 'Step-Up', muscleGroup: 'Legs', equipment: 'Dumbbell' },

  // === CALVES (Baldır) ===
  { name: 'Standing Calf Raise', nameTr: 'Standing Calf Raise', muscleGroup: 'Calves', equipment: 'Machine' },
  { name: 'Seated Calf Raise', nameTr: 'Seated Calf Raise', muscleGroup: 'Calves', equipment: 'Machine' },
  { name: 'Leg Press Calf Raise', nameTr: 'Leg Press Calf Raise', muscleGroup: 'Calves', equipment: 'Machine' },
  { name: 'Smith Machine Calf Raise', nameTr: 'Smith Machine Calf Raise', muscleGroup: 'Calves', equipment: 'Machine' },
  { name: 'Donkey Calf Raise', nameTr: 'Donkey Calf Raise', muscleGroup: 'Calves', equipment: 'Machine' },

  // === ABS (Karın) ===
  { name: 'Crunch', nameTr: 'Crunch', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Cable Crunch', nameTr: 'Cable Crunch', muscleGroup: 'Abs', equipment: 'Cable' },
  { name: 'Machine Crunch', nameTr: 'Machine Crunch', muscleGroup: 'Abs', equipment: 'Machine' },
  { name: 'Leg Raise (Hanging)', nameTr: 'Hanging Leg Raise', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Leg Raise (Lying)', nameTr: 'Lying Leg Raise', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Knee Raise', nameTr: 'Knee Raise', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Plank', nameTr: 'Plank', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Side Plank', nameTr: 'Side Plank', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Ab Wheel Rollout', nameTr: 'Ab Wheel Rollout', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Russian Twist', nameTr: 'Russian Twist', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Bicycle Crunch', nameTr: 'Bicycle Crunch', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Mountain Climber', nameTr: 'Mountain Climber', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Dead Bug', nameTr: 'Dead Bug', muscleGroup: 'Abs', equipment: 'Bodyweight' },
  { name: 'Woodchopper', nameTr: 'Woodchopper', muscleGroup: 'Abs', equipment: 'Cable' },
  { name: 'Pallof Press', nameTr: 'Pallof Press', muscleGroup: 'Abs', equipment: 'Cable' },
  { name: 'Decline Sit-Up', nameTr: 'Decline Sit-Up', muscleGroup: 'Abs', equipment: 'Bodyweight' },

  // === FOREARMS (Ön Kol) ===
  { name: 'Wrist Curl', nameTr: 'Wrist Curl', muscleGroup: 'Forearms', equipment: 'Barbell' },
  { name: 'Reverse Wrist Curl', nameTr: 'Reverse Wrist Curl', muscleGroup: 'Forearms', equipment: 'Barbell' },
  { name: 'Farmer Walk', nameTr: 'Farmer Walk', muscleGroup: 'Forearms', equipment: 'Dumbbell' },
  { name: 'Dead Hang', nameTr: 'Dead Hang', muscleGroup: 'Forearms', equipment: 'Bodyweight' },
];

async function seedLibrary() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('Seeding exercise library...');

  // Clear existing library entries
  await db.delete(schema.exerciseLibrary);

  // Insert all exercises
  await db.insert(schema.exerciseLibrary).values(EXERCISE_LIBRARY);

  console.log(`Inserted ${EXERCISE_LIBRARY.length} exercises into library`);

  await client.end();
  console.log('Done!');
}

seedLibrary().catch(console.error);
