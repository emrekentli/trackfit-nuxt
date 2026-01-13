export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type MuscleGroup =
  | 'Shoulders'
  | 'Chest'
  | 'Back'
  | 'Arms'
  | 'Legs'
  | 'Abs'
  | 'Triceps'
  | 'Biceps'
  | 'Calves'
  | 'Forearms'
  | 'Rear Delts'
  | 'Traps';

export interface Exercise {
  id: string;
  name: string;
  day: DayOfWeek;
  notes: string;
  targetSets: number;
  targetReps: string;
  imageUrl?: string;
  muscleGroup?: MuscleGroup | null;
  supersetGroup?: string | null;
  orderIndex?: number;
}

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
}

export interface BodyMetric {
  id: string;
  date: string; // YYYY-MM-DD
  weight?: number | null;
  bodyFat?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  bicepLeft?: number | null;
  bicepRight?: number | null;
  thighLeft?: number | null;
  thighRight?: number | null;
  calfLeft?: number | null;
  calfRight?: number | null;
  neck?: number | null;
  shoulders?: number | null;
  notes?: string | null;
}

export interface LibraryExercise {
  id: string;
  name: string;
  nameTr: string;
  muscleGroup: MuscleGroup;
  equipment: string | null;
}

export interface AppState {
  user: User | null;
  exercises: Exercise[];
  logs: WorkoutLog[];
  bodyMetrics: BodyMetric[];
  exerciseLibrary: LibraryExercise[];
}
