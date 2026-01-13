<template>
  <div class="space-y-6">
    <!-- Top Bar: Streak & Manual Timer -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
        <i class="fa-solid fa-fire text-orange-500 text-sm"></i>
        <span class="text-[10px] font-black text-white uppercase tracking-widest">{{ streak }} GÜN SERİ</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="toggleMute"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
          :title="isMuted ? 'Sesi Aç' : 'Sesi Kapat'"
        >
          <i :class="`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-white text-xs`"></i>
        </button>

        <button
          @click="toggleTimer"
          :class="[
            'flex items-center gap-3 px-5 py-2 rounded-full shadow-lg transition-all active:scale-95 border',
            timer !== null
              ? 'bg-violet-600 border-violet-400 animate-pulse'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          ]"
        >
          <i :class="`fa-solid ${timer !== null ? 'fa-stop' : 'fa-play'} text-white text-xs`"></i>
          <span class="text-[10px] font-black text-white uppercase tracking-widest">
            {{ timer !== null ? `${timer}s` : 'DİNLENME BAŞLAT' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Horizontal Compact Day Selector -->
    <div class="flex overflow-x-auto no-scrollbar gap-2 px-1">
      <button
        v-for="day in DAYS"
        :key="day"
        @click="selectedDay = day"
        :class="[
          'flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all',
          selectedDay === day
            ? 'bg-violet-600 border-violet-500 text-white shadow-lg'
            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
        ]"
      >
        {{ DAY_LABELS[day].substring(0, 3) }}
      </button>
    </div>

    <!-- Day Info -->
    <div v-if="todaysExercises.length > 0" class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3">
      <p class="text-[9px] font-black text-violet-400 uppercase tracking-widest text-center">
        {{ todaysExercises[0]?.notes || DAY_LABELS[selectedDay] }}
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="todaysExercises.length === 0" class="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center space-y-2">
      <i class="fa-solid fa-moon text-zinc-800 text-2xl"></i>
      <p class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Aktif Dinlenme</p>
    </div>

    <!-- Grouped by Muscle Group -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-for="group in groupedByMuscle" :key="group.muscleGroup" class="space-y-0">
        <!-- Muscle Group Header -->
        <div class="bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 rounded-t-2xl px-4 py-3 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <i :class="`fa-solid ${MUSCLE_GROUP_ICONS[group.muscleGroup] || 'fa-dumbbell'} text-violet-400 text-sm`"></i>
          </div>
          <div class="flex-1">
            <p class="text-[11px] font-black text-white uppercase tracking-wider">
              {{ MUSCLE_GROUP_LABELS[group.muscleGroup] || group.muscleGroup }}
            </p>
            <p class="text-[9px] font-medium text-zinc-500">{{ group.exercises.length }} egzersiz</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black text-emerald-400">{{ getGroupCompletedCount(group.exercises) }}/{{ group.exercises.length }}</p>
          </div>
        </div>

        <!-- Exercises in Group -->
        <div class="bg-zinc-900 border border-t-0 border-zinc-800 rounded-b-2xl overflow-hidden mb-4">
          <div class="divide-y divide-zinc-800/50">
            <template v-for="(ex, index) in group.exercises" :key="ex.id">
              <!-- Superset Header -->
              <div
                v-if="ex.supersetGroup && isFirstInSupersetWithinGroup(group.exercises, index)"
                class="bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 px-4 py-2 flex items-center gap-2"
              >
                <i class="fa-solid fa-link text-fuchsia-400 text-xs"></i>
                <span class="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest">
                  Superset
                </span>
              </div>

              <div class="group relative">
                <!-- Superset indicator bar -->
                <div
                  v-if="ex.supersetGroup"
                  class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-500 to-violet-500"
                ></div>

                <div
                  :class="[
                    'grid grid-cols-[1fr_60px_70px_120px] items-center px-4 py-4 hover:bg-zinc-800/30 transition-colors',
                    ex.supersetGroup ? 'pl-5' : ''
                  ]"
                >
                  <div class="min-w-0 pr-2 overflow-x-auto no-scrollbar">
                    <div class="flex items-center gap-1.5 whitespace-nowrap">
                      <h4
                        class="text-[11px] font-black text-white uppercase italic group-hover:text-violet-400 transition-colors tracking-tighter"
                      >
                        {{ ex.name }}
                      </h4>
                      <span
                        v-if="isPR(ex.id, getTodayMaxWeight(ex.id) || 0)"
                        class="bg-emerald-500 text-[7px] font-black px-1 rounded-sm text-black animate-bounce flex-shrink-0"
                      >
                        PR
                      </span>
                    </div>
                    <p
                      v-if="getSuggestionForExercise(ex.id)"
                      class="text-[9px] font-medium text-zinc-500 leading-snug whitespace-normal"
                    >
                      {{ getSuggestionForExercise(ex.id) }}
                    </p>
                  </div>

                  <div class="text-[9px] font-black text-zinc-500 text-center">
                    {{ ex.targetSets }}x{{ ex.targetReps }}
                  </div>

                  <div class="text-[10px] font-black text-zinc-400 text-center truncate">
                    {{ getPreviousMaxWeight(ex.id) ?? '--' }}
                  </div>

                  <button
                    @click="openSetModal(ex)"
                    :class="[
                      'w-full bg-zinc-950/60 border rounded-lg py-2 px-2 text-[10px] font-black uppercase tracking-widest transition-all',
                      getTodaySets(ex.id).length > 0
                        ? 'border-emerald-500/40 text-emerald-400'
                        : 'border-zinc-800 text-zinc-400 hover:border-violet-500/60'
                    ]"
                  >
                    {{ getTodaySetSummary(ex.id) }}
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Summary -->
    <div v-if="todaysExercises.length > 0" class="grid grid-cols-3 gap-3">
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
        <p class="text-lg font-black text-white">{{ completedCount }}</p>
        <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Tamamlanan</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
        <p class="text-lg font-black text-white">{{ todaysExercises.length }}</p>
        <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Toplam</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
        <p class="text-lg font-black text-emerald-400">{{ prCount }}</p>
        <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">PR</p>
      </div>
    </div>

    <!-- Weekly Progress -->
    <div v-if="weeklyProgress.total > 0" class="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Haftalik Takip</p>
          <p class="text-sm font-black text-white uppercase tracking-wider">
            {{ weeklyProgress.completed }}/{{ weeklyProgress.total }} egzersiz
          </p>
        </div>
        <div class="text-right">
          <p class="text-[10px] font-black text-emerald-400">%{{ weeklyProgress.percent }}</p>
          <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Tamamlandi</p>
        </div>
      </div>
      <div class="mt-3 h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-emerald-500 to-violet-500"
          :style="{ width: `${weeklyProgress.percent}%` }"
        ></div>
      </div>
    </div>

    <div class="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 border-dashed">
      <p class="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] leading-relaxed text-center">
        Pro İpucu: Set aralarında dinlenme sayacını üstteki butondan manuel olarak başlatabilirsin.
      </p>
    </div>
    <!-- Set Entry Modal -->
    <Teleport to="body">
      <div
        v-if="showSetModal && activeExercise"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <div
          class="bg-zinc-900 border border-zinc-800 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl sm:max-h-none sm:overflow-visible sm:rounded-3xl"
        >
          <div class="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
            <div>
              <p class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Set Girisi</p>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">{{ activeExercise.name }}</h3>
              <p class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Hedef: {{ activeExercise.targetSets }}x{{ activeExercise.targetReps }}
              </p>
            </div>
            <button @click="closeSetModal" class="text-zinc-500 hover:text-white">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div class="p-4 space-y-4">
            <div class="flex items-center gap-2">
              <input
                v-model="bulkWeight"
                type="number"
                step="0.25"
                placeholder="Tum setler icin kg"
                class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-bold text-zinc-100"
              />
              <button
                type="button"
                @click="applyBulkWeight"
                class="px-3 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-[10px] font-black uppercase tracking-widest"
              >
                Uygula
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="set in setRows"
                :key="set.setIndex"
                class="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 items-center"
              >
                <div class="text-[10px] font-black text-zinc-500 text-center">#{{ set.setIndex }}</div>
                <input
                  v-model="set.weight"
                  type="number"
                  step="0.25"
                  placeholder="KG"
                  class="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-[11px] font-black text-zinc-100"
                />
                <input
                  v-model="set.reps"
                  type="number"
                  step="1"
                  placeholder="Rep (opsiyonel)"
                  class="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-[11px] font-black text-zinc-100"
                />
                <input
                  v-model="set.rir"
                  type="number"
                  step="1"
                  min="0"
                  max="5"
                  placeholder="RIR (opsiyonel)"
                  class="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-[11px] font-black text-zinc-100"
                />
              </div>
            </div>

            <p class="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
              Sadece kilo zorunlu, rep ve RIR opsiyonel.
            </p>

            <div class="flex gap-3">
              <button
                type="button"
                @click="closeSetModal"
                class="w-1/2 bg-zinc-800 text-zinc-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Vazgec
              </button>
              <button
                type="button"
                @click="saveSetModal"
                class="w-1/2 bg-violet-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { DayOfWeek, Exercise } from '~/types';
import { DAYS, DAY_LABELS, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ICONS } from '~/constants';

definePageMeta({
  middleware: 'auth',
});

useSiteSeo({
  title: 'Training Session',
  description: 'Log sets, track rest timers, and record workout performance.',
  noindex: true,
});

const { exercises, logs, updateWorkoutSets } = useAppState();

const selectedDay = ref<DayOfWeek>(
  new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()) as DayOfWeek
);

const timer = ref<number | null>(null);
const isMuted = ref(false);
const todayDate = new Date().toISOString().split('T')[0];
const showSetModal = ref(false);
const activeExercise = ref<Exercise | null>(null);
const setRows = ref<{ setIndex: number; weight: string; reps: string; rir: string }[]>([]);
const bulkWeight = ref('');

const todaysExercises = computed(() => {
  return exercises.value
    .filter((ex) => ex.day === selectedDay.value)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
});

// Group exercises by muscle group while preserving order
const groupedByMuscle = computed(() => {
  const groups: { muscleGroup: string; exercises: Exercise[] }[] = [];
  let currentGroup: { muscleGroup: string; exercises: Exercise[] } | null = null;

  for (const ex of todaysExercises.value) {
    const muscle = ex.muscleGroup || 'Other';

    if (!currentGroup || currentGroup.muscleGroup !== muscle) {
      currentGroup = { muscleGroup: muscle, exercises: [] };
      groups.push(currentGroup);
    }

    currentGroup.exercises.push(ex);
  }

  return groups;
});

// Check if this is the first exercise in a superset group within a muscle group
const isFirstInSupersetWithinGroup = (groupExercises: Exercise[], index: number) => {
  const current = groupExercises[index];
  if (!current || !current.supersetGroup) return false;
  if (index === 0) return true;
  const prev = groupExercises[index - 1];
  return !prev || prev.supersetGroup !== current.supersetGroup;
};

// Get completed count for a muscle group
const getGroupCompletedCount = (groupExercises: Exercise[]) => {
  return groupExercises.filter((ex) => getTodaySets(ex.id).length > 0).length;
};

// Streak Calculation
const streak = computed(() => {
  const uniqueDates = Array.from(new Set(logs.value.map((l) => l.date))).sort().reverse();
  return uniqueDates.length;
});

// Completed count
const completedCount = computed(() => {
  return todaysExercises.value.filter((ex) => getTodaySets(ex.id).length > 0).length;
});

// PR count for today
const prCount = computed(() => {
  return todaysExercises.value.filter((ex) => {
    const todayMax = getTodayMaxWeight(ex.id);
    return todayMax !== null && isPR(ex.id, todayMax);
  }).length;
});

const getExerciseDailySummaries = (exerciseId: string) => {
  const summaries = new Map<string, { date: string; maxWeight: number; latestSetIndex: number; rir: number | null }>();

  logs.value
    .filter((log) => log.exerciseId === exerciseId)
    .forEach((log) => {
      const existing = summaries.get(log.date);
      const logRir = log.rir ?? null;
      if (!existing) {
        summaries.set(log.date, {
          date: log.date,
          maxWeight: log.weight,
          latestSetIndex: log.setIndex,
          rir: logRir,
        });
        return;
      }
      const maxWeight = Math.max(existing.maxWeight, log.weight);
      const latestSetIndex = Math.max(existing.latestSetIndex, log.setIndex);
      const rir = log.setIndex >= existing.latestSetIndex ? logRir : existing.rir;
      summaries.set(log.date, { date: log.date, maxWeight, latestSetIndex, rir });
    });

  return Array.from(summaries.values()).sort(
    (a, b) => new Date(`${b.date}T00:00:00Z`).getTime() - new Date(`${a.date}T00:00:00Z`).getTime()
  );
};

const getSetsForDate = (exerciseId: string, date: string) => {
  return logs.value
    .filter((log) => log.exerciseId === exerciseId && log.date === date)
    .sort((a, b) => a.setIndex - b.setIndex);
};

const getTodaySets = (exerciseId: string) => {
  return getSetsForDate(exerciseId, todayDate);
};

const getTodayMaxWeight = (exerciseId: string) => {
  const sets = getTodaySets(exerciseId);
  if (sets.length === 0) return null;
  return Math.max(...sets.map((set) => set.weight));
};

const getPreviousMaxWeight = (exerciseId: string) => {
  const summaries = getExerciseDailySummaries(exerciseId).filter((summary) => summary.date !== todayDate);
  if (summaries.length === 0) return null;
  return summaries[0]?.maxWeight ?? null;
};

const getTodaySetSummary = (exerciseId: string) => {
  const sets = getTodaySets(exerciseId);
  if (sets.length === 0) return 'Set Gir';
  const maxWeight = Math.max(...sets.map((set) => set.weight));
  return `${sets.length} set / ${formatWeight(maxWeight)} kg`;
};

const isPR = (exerciseId: string, weight: number) => {
  const historicalMax = Math.max(...logs.value.filter((l) => l.exerciseId === exerciseId).map((l) => l.weight), 0);
  return weight >= historicalMax && weight > 0;
};

const DEFAULT_WEIGHT_STEP = 2.5;
const LIGHT_WEIGHT_STEP = 1.25;
const HEAVY_WEIGHT_STEP = 5;
const PROGRESSION_LOOKBACK = 3;

const formatWeight = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return `${rounded}`;
  return rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
};

const getWeightStep = (muscleGroup: Exercise['muscleGroup']) => {
  if (!muscleGroup) return DEFAULT_WEIGHT_STEP;
  if (muscleGroup === 'Legs' || muscleGroup === 'Back') return HEAVY_WEIGHT_STEP;
  if (
    muscleGroup === 'Rear Delts' ||
    muscleGroup === 'Forearms' ||
    muscleGroup === 'Calves' ||
    muscleGroup === 'Abs'
  ) {
    return LIGHT_WEIGHT_STEP;
  }
  return DEFAULT_WEIGHT_STEP;
};

const getTargetRepHint = (targetReps: string) => {
  const match = targetReps.match(/\d+/);
  if (!match) return null;
  const repValue = Number.parseInt(match[0], 10);
  if (Number.isNaN(repValue)) return null;
  return repValue;
};

const getISOWeekKey = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNr = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNr + 3);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
  const year = target.getUTCFullYear();
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const getSessionStats = (
  exerciseId: string,
  date: string,
  targetSets: number,
  targetRep: number | null
) => {
  const sets = getSetsForDate(exerciseId, date);
  if (sets.length === 0) {
    return {
      maxWeight: 0,
      lastRir: null as number | null,
      completionRate: null as number | null,
      setCount: 0,
    };
  }

  const maxWeight = Math.max(...sets.map((set) => set.weight));
  const lastRir =
    [...sets]
      .sort((a, b) => a.setIndex - b.setIndex)
      .reverse()
      .find((set) => set.rir !== null && set.rir !== undefined)?.rir ?? null;

  let completionRate: number | null = null;
  if (targetRep !== null && targetSets > 0) {
    const scoredSets = sets.filter((set) => set.reps !== null && set.reps !== undefined);
    if (scoredSets.length > 0) {
      const completed = scoredSets.filter((set) => (set.reps ?? 0) >= targetRep).length;
      completionRate = completed / targetSets;
    }
  }

  return {
    maxWeight,
    lastRir,
    completionRate,
    setCount: sets.length,
  };
};

const getSessionE1RM = (exerciseId: string, date: string, targetRep: number | null) => {
  const sets = getSetsForDate(exerciseId, date);
  if (sets.length === 0) return null;

  const estimates = sets
    .map((set) => {
      const reps = set.reps ?? targetRep;
      if (reps === null || reps === undefined) return null;
      const rir = set.rir ?? 0;
      const effectiveReps = reps + rir;
      return set.weight * (1 + effectiveReps / 30);
    })
    .filter((value): value is number => value !== null && !Number.isNaN(value));

  if (estimates.length === 0) return null;
  return Math.max(...estimates);
};

const weeklySuggestions = computed(() => {
  return todaysExercises.value
    .map((exercise) => {
      const hasTodaySets = getTodaySets(exercise.id).length > 0;
      const targetRep = getTargetRepHint(exercise.targetReps);
      const dailySummaries = getExerciseDailySummaries(exercise.id);
      if (dailySummaries.length === 0) {
        return {
          exerciseId: exercise.id,
          name: exercise.name,
          sets: `${exercise.targetSets}x${exercise.targetReps}`,
          message:
            'Bugun ilk kayit. Hedef set/reps ile basla, ilk kilonu gir. Sonraki antrenmanda otomatik oneri alirsin.',
        };
      }

      const recentLogs = dailySummaries.slice(0, PROGRESSION_LOOKBACK);
      const last = recentLogs[0];
      if (!last) return null;

      const prev = recentLogs[1];
      const prev2 = recentLogs[2];

      const step = getWeightStep(exercise.muscleGroup || null);
      const lastStats = getSessionStats(exercise.id, last.date, exercise.targetSets, targetRep);
      const prevStats = prev ? getSessionStats(exercise.id, prev.date, exercise.targetSets, targetRep) : null;
      const lastRir = lastStats.lastRir;
      const prevRir = prevStats?.lastRir ?? null;

      const e1rmValues = recentLogs
        .map((entry) => getSessionE1RM(exercise.id, entry.date, targetRep))
        .filter((value): value is number => value !== null);
      const currentE1rm = e1rmValues[0] ?? null;
      const previousE1rm = e1rmValues[1] ?? null;

      const completionRate = lastStats.completionRate;
      const successRate =
        completionRate !== null
          ? completionRate
          : (() => {
              const rirSamples = recentLogs.filter((l) => l.rir !== null && l.rir !== undefined);
              if (rirSamples.length === 0) return null;
              return rirSamples.filter((l) => (l.rir ?? 0) >= 1).length / rirSamples.length;
            })();

      let trend: 'up' | 'down' | 'flat' = 'flat';
      if (prev && prev2) {
        if (last.maxWeight < prev.maxWeight && prev.maxWeight <= prev2.maxWeight) trend = 'down';
        if (last.maxWeight > prev.maxWeight && prev.maxWeight >= prev2.maxWeight) trend = 'up';
      } else if (prev) {
        if (last.maxWeight < prev.maxWeight) trend = 'down';
        if (last.maxWeight > prev.maxWeight) trend = 'up';
      }

      let suggestedWeight = last.maxWeight;
      let action = 'hold';

      if (completionRate !== null && completionRate < 0.5) {
        suggestedWeight = Math.max(0, last.maxWeight - step);
        action = 'down';
      } else if (completionRate !== null && completionRate >= 1 && lastRir !== null && lastRir >= 2) {
        suggestedWeight = last.maxWeight + step;
        action = 'up';
      } else if (trend === 'down') {
        suggestedWeight = Math.max(0, last.maxWeight - step);
        action = 'down';
      } else if (successRate !== null && successRate >= 0.8) {
        suggestedWeight = last.maxWeight + step;
        action = 'up';
      } else if (lastRir !== null && prevRir !== null && lastRir >= 2 && prevRir >= 2) {
        suggestedWeight = last.maxWeight + step;
        action = 'up';
      }

      const repsNote =
        action === 'hold' && targetRep !== null
          ? `Bu kiloda her sette +1 tekrar hedefle. RIR >=2 olursa artir.`
          : null;

      const successNote =
        successRate !== null
          ? `Basari orani: %${Math.round(successRate * 100)}.`
          : targetRep !== null
            ? 'Rep verisi girilmedi, RIR/trend ile degerlendirildi.'
            : 'Hedef tekrar bulunamadi, trend ile degerlendirildi.';

      const e1rmNote =
        currentE1rm !== null
          ? previousE1rm !== null
            ? `e1RM ${formatWeight(currentE1rm)} kg (${currentE1rm >= previousE1rm ? 'yukari' : 'asagi'}).`
            : `e1RM ${formatWeight(currentE1rm)} kg.`
          : null;

      const todayNote = hasTodaySets ? null : 'Bugun icin oneri:';

      let actionNote = '';
      if (action === 'up') {
        actionNote = `Sonraki antrenmanda ${formatWeight(suggestedWeight)} kg dene (adim ${formatWeight(step)}).`;
      } else if (action === 'down') {
        actionNote = `Bu kiloda zorlandin, ${formatWeight(suggestedWeight)} kg ile tekrar dene.`;
      } else {
        actionNote = `Agirlik sabit, formu koru ve tekrar artir.`;
      }

      const messageParts = [
        todayNote,
        `Son ${recentLogs.length} antrenmanda en iyi ${formatWeight(last.maxWeight)} kg.`,
        successNote,
        e1rmNote,
        actionNote,
        repsNote,
      ].filter(Boolean);

      return {
        exerciseId: exercise.id,
        name: exercise.name,
        sets: `${exercise.targetSets}x${exercise.targetReps}`,
        message: messageParts.join(' '),
      };
    })
    .filter((item): item is { exerciseId: string; name: string; sets: string; message: string } => item !== null);
});

const suggestionByExercise = computed(() => {
  const map = new Map<string, string>();
  weeklySuggestions.value.forEach((item) => {
    map.set(item.exerciseId, item.message);
  });
  return map;
});

const getSuggestionForExercise = (exerciseId: string) => {
  return suggestionByExercise.value.get(exerciseId) || '';
};

const weeklyProgress = computed(() => {
  const currentWeekKey = getISOWeekKey(todayDate);
  const total = exercises.value.length;
  const completed = exercises.value.filter((exercise) =>
    getExerciseDailySummaries(exercise.id).some((summary) => getISOWeekKey(summary.date) === currentWeekKey)
  ).length;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
});

const openSetModal = (exercise: Exercise) => {
  activeExercise.value = exercise;
  showSetModal.value = true;
  bulkWeight.value = '';

  const existingSets = getTodaySets(exercise.id);
  const setCount = Math.max(exercise.targetSets || 1, existingSets.length || 0);

  setRows.value = Array.from({ length: setCount }, (_, index) => {
    const setIndex = index + 1;
    const existing = existingSets.find((set) => set.setIndex === setIndex);
    return {
      setIndex,
      weight: existing ? String(existing.weight) : '',
      reps: existing?.reps != null ? String(existing.reps) : '',
      rir: existing?.rir != null ? String(existing.rir) : '',
    };
  });
};

const closeSetModal = () => {
  showSetModal.value = false;
  activeExercise.value = null;
  bulkWeight.value = '';
  setRows.value = [];
};

const applyBulkWeight = () => {
  if (!bulkWeight.value) return;
  setRows.value = setRows.value.map((set) => ({ ...set, weight: bulkWeight.value }));
};

const saveSetModal = async () => {
  if (!activeExercise.value) return;

  const setsPayload = setRows.value
    .filter((set) => String(set.weight ?? '').trim() !== '')
    .map((set) => {
      const weightValue = String(set.weight ?? '').trim();
      const repsValue = String(set.reps ?? '').trim();
      const rirValue = String(set.rir ?? '').trim();

      return {
        setIndex: set.setIndex,
        weight: Number.parseFloat(weightValue),
        reps: repsValue === '' ? null : Number.parseInt(repsValue, 10),
        rir: rirValue === '' ? null : Number.parseInt(rirValue, 10),
      };
    })
    .map((set) => ({
      ...set,
      reps: set.reps === null || Number.isNaN(set.reps) ? null : set.reps,
      rir: set.rir === null || Number.isNaN(set.rir) ? null : set.rir,
    }))
    .filter((set) => !Number.isNaN(set.weight));

  await updateWorkoutSets(activeExercise.value.id, todayDate, setsPayload);
  closeSetModal();
};

let timerWorker: Worker | null = null;
let audioContext: AudioContext | null = null;

const ensureWorker = () => {
  if (!import.meta.client || timerWorker) return;

  timerWorker = new Worker(new URL('../workers/restTimer.worker.ts', import.meta.url), {
    type: 'module',
  });

  timerWorker.onmessage = (event: MessageEvent<{ type: string; remaining?: number }>) => {
    if (event.data.type === 'tick') {
      const remaining = event.data.remaining ?? 0;
      timer.value = remaining > 0 ? remaining : null;
      return;
    }

    if (event.data.type === 'done') {
      timer.value = null;
      void playBeep();
    }
  };
};

const ensureAudioContext = async () => {
  if (!import.meta.client || audioContext) return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  audioContext = new AudioCtx();
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
};

const playBeep = async () => {
  if (isMuted.value) return;
  await ensureAudioContext();
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.45);
};

const toggleTimer = () => {
  if (timer.value !== null) {
    timerWorker?.postMessage({ type: 'stop' });
    timer.value = null;
  } else {
    ensureWorker();
    void ensureAudioContext();
    timer.value = 60;
    timerWorker?.postMessage({ type: 'start', duration: 60 });
  }
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (!isMuted.value) {
    void ensureAudioContext();
  }
};

onUnmounted(() => {
  timerWorker?.postMessage({ type: 'stop' });
  timerWorker?.terminate();
  timerWorker = null;

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
});
</script>
