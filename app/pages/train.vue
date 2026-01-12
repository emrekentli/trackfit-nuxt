<template>
  <div class="space-y-6">
    <!-- Top Bar: Streak & Manual Timer -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
        <i class="fa-solid fa-fire text-orange-500 text-sm"></i>
        <span class="text-[10px] font-black text-white uppercase tracking-widest">{{ streak }} GUN SERI</span>
      </div>

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
          {{ timer !== null ? `${timer}s` : 'DINLENME BASLAT' }}
        </span>
      </button>
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

    <!-- Tabular List -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
      <div class="grid grid-cols-[1fr_60px_70px_80px] border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div class="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Egzersiz</div>
        <div class="text-[8px] font-black text-zinc-500 uppercase tracking-widest text-center">Hedef</div>
        <div class="text-[8px] font-black text-zinc-500 uppercase tracking-widest text-center">Onceki</div>
        <div class="text-[8px] font-black text-zinc-500 uppercase tracking-widest text-right">Kilo</div>
      </div>

      <div v-if="todaysExercises.length === 0" class="p-12 text-center space-y-2">
        <i class="fa-solid fa-moon text-zinc-800 text-2xl"></i>
        <p class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Aktif Dinlenme</p>
      </div>

      <div v-else class="divide-y divide-zinc-800/50">
        <div v-for="ex in todaysExercises" :key="ex.id" class="group relative">
          <div class="grid grid-cols-[1fr_60px_70px_80px] items-center px-4 py-4 hover:bg-zinc-800/30 transition-colors">
            <div class="min-w-0 pr-2">
              <div class="flex items-center gap-1.5">
                <h4
                  class="text-[11px] font-black text-white uppercase italic truncate group-hover:text-violet-400 transition-colors tracking-tighter"
                >
                  {{ ex.name }}
                </h4>
                <span
                  v-if="isPR(ex.id, getTodayLog(ex.id)?.weight || 0)"
                  class="bg-emerald-500 text-[7px] font-black px-1 rounded-sm text-black animate-bounce"
                >
                  PR
                </span>
              </div>
            </div>

            <div class="text-[9px] font-black text-zinc-500 text-center">
              {{ ex.targetSets }}x{{ ex.targetReps }}
            </div>

            <div class="text-[10px] font-black text-zinc-400 text-center truncate">
              {{ getPreviousLog(ex.id)?.weight ?? '--' }}
            </div>

            <div class="relative pl-2">
              <input
                type="number"
                step="0.25"
                placeholder="0.0"
                :value="getTodayLog(ex.id)?.weight ?? ''"
                @blur="(e) => handleWeightUpdate(ex.id, (e.target as HTMLInputElement).value)"
                :class="[
                  'w-full bg-zinc-950/50 border rounded-lg py-2 px-2 text-[11px] font-black text-right outline-none transition-all',
                  getTodayLog(ex.id)
                    ? 'border-emerald-500/30 text-emerald-400'
                    : 'border-zinc-800 focus:border-violet-500 text-zinc-100'
                ]"
              />
              <div
                v-if="getTodayLog(ex.id)"
                class="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 border-dashed">
      <p class="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] leading-relaxed text-center">
        Pro Ipucu: Set aralarinda dinlenme sayacini ustteki butondan manuel olarak baslatabilirsin.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DayOfWeek } from '~/types';
import { DAYS, DAY_LABELS } from '~/constants';

const { exercises, logs, updateLog, user } = useAppState();

// Redirect if not logged in
onMounted(() => {
  if (!user.value) {
    navigateTo('/');
  }
});

const selectedDay = ref<DayOfWeek>(
  new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()) as DayOfWeek
);

const timer = ref<number | null>(null);
const todayDate = new Date().toISOString().split('T')[0];

const todaysExercises = computed(() => {
  return exercises.value.filter((ex) => ex.day === selectedDay.value);
});

// Streak Calculation
const streak = computed(() => {
  const uniqueDates = Array.from(new Set(logs.value.map((l) => l.date))).sort().reverse();
  return uniqueDates.length;
});

const isPR = (exerciseId: string, weight: number) => {
  const historicalMax = Math.max(...logs.value.filter((l) => l.exerciseId === exerciseId).map((l) => l.weight), 0);
  return weight >= historicalMax && weight > 0;
};

const getPreviousLog = (exerciseId: string) => {
  const exLogs = logs.value.filter((l) => l.exerciseId === exerciseId && l.date !== todayDate);
  if (exLogs.length === 0) return null;
  return exLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
};

const getTodayLog = (exerciseId: string) => {
  return logs.value.find((l) => l.exerciseId === exerciseId && l.date === todayDate);
};

const handleWeightUpdate = async (exerciseId: string, value: string) => {
  const weight = parseFloat(value);
  if (!isNaN(weight)) {
    await updateLog(exerciseId, weight);
  }
};

let timerInterval: ReturnType<typeof setInterval> | null = null;

const toggleTimer = () => {
  if (timer.value !== null) {
    if (timerInterval) clearInterval(timerInterval);
    timer.value = null;
  } else {
    timer.value = 60;
    timerInterval = setInterval(() => {
      if (timer.value !== null && timer.value > 0) {
        timer.value--;
      } else {
        if (timerInterval) clearInterval(timerInterval);
        timer.value = null;
      }
    }, 1000);
  }
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
