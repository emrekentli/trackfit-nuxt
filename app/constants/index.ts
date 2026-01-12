import type { DayOfWeek, MuscleGroup } from '~/types';

export const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  'Monday': 'Pazartesi',
  'Tuesday': 'Salı',
  'Wednesday': 'Çarşamba',
  'Thursday': 'Perşembe',
  'Friday': 'Cuma',
  'Saturday': 'Cumartesi',
  'Sunday': 'Pazar'
};

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  'Shoulders': 'Omuz',
  'Chest': 'Göğüs',
  'Back': 'Sırt',
  'Arms': 'Kol',
  'Triceps': 'Triceps',
  'Biceps': 'Biceps',
  'Legs': 'Bacak',
  'Abs': 'Karın',
  'Calves': 'Baldır',
  'Rear Delts': 'Arka Omuz',
  'Traps': 'Trapez',
};

export const MUSCLE_GROUP_ICONS: Record<string, string> = {
  'Shoulders': 'fa-person-rays',
  'Chest': 'fa-heart-pulse',
  'Back': 'fa-arrows-up-down',
  'Arms': 'fa-hand-fist',
  'Triceps': 'fa-hand-back-fist',
  'Biceps': 'fa-hand-fist',
  'Legs': 'fa-person-walking',
  'Abs': 'fa-fire',
  'Calves': 'fa-shoe-prints',
  'Rear Delts': 'fa-circle-dot',
  'Traps': 'fa-up-down',
};

