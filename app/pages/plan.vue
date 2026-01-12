<template>
  <div class="space-y-6 pb-20">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-zinc-100 tracking-tight uppercase italic">Program</h2>
      <button
        @click="isAdding = !isAdding"
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
          isAdding ? 'bg-zinc-800 text-zinc-400' : 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
        ]"
      >
        <i :class="`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`"></i>
      </button>
    </div>

    <form
      v-if="isAdding"
      @submit.prevent="handleSubmit"
      class="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 space-y-4 animate-in slide-in-from-top-4"
    >
      <div
        @click="fileInput?.click()"
        class="w-full h-32 bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:border-violet-500/50 cursor-pointer overflow-hidden transition-all"
      >
        <img v-if="newEx.imageUrl" :src="newEx.imageUrl" class="w-full h-full object-cover" />
        <template v-else>
          <i class="fa-solid fa-camera-retro text-xl mb-1"></i>
          <span class="text-[10px] font-black uppercase">Görsel Ekle</span>
        </template>
        <input ref="fileInput" type="file" @change="handleImageChange" class="hidden" accept="image/*" />
      </div>

      <div class="space-y-3">
        <input
          v-model="newEx.name"
          type="text"
          required
          placeholder="Egzersiz Adı"
          class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-100"
        />
        <div class="grid grid-cols-2 gap-3">
          <select
            v-model="newEx.day"
            class="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 appearance-none"
          >
            <option v-for="d in DAYS" :key="d" :value="d">{{ DAY_LABELS[d] }}</option>
          </select>
          <div class="flex gap-2">
            <input
              v-model.number="newEx.targetSets"
              type="number"
              placeholder="Sets"
              class="w-1/2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-center text-xs font-bold text-zinc-100"
            />
            <input
              v-model="newEx.targetReps"
              type="text"
              placeholder="Reps"
              class="w-1/2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-center text-xs font-bold text-zinc-100"
            />
          </div>
        </div>
        <textarea
          v-model="newEx.notes"
          placeholder="Notlar..."
          class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-medium text-zinc-400 h-20 resize-none"
        />
      </div>
      <button
        type="submit"
        class="w-full py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-violet-600/20"
      >
        Egzersiz Oluştur
      </button>
    </form>

    <div class="space-y-8">
      <template v-for="day in DAYS" :key="day">
        <div v-if="getExercisesForDay(day).length > 0" class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="h-px bg-zinc-800 flex-1"></div>
            <h3 class="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{{ DAY_LABELS[day] }}</h3>
            <div class="h-px bg-zinc-800 flex-1"></div>
          </div>
          <div class="grid gap-3">
            <div
              v-for="ex in getExercisesForDay(day)"
              :key="ex.id"
              class="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-violet-500 overflow-hidden border border-zinc-700/50"
                >
                  <img v-if="ex.imageUrl" :src="ex.imageUrl" class="w-full h-full object-cover" />
                  <i v-else class="fa-solid fa-dumbbell text-sm"></i>
                </div>
                <div>
                  <h4 class="text-xs font-black text-zinc-200 uppercase tracking-tighter italic">{{ ex.name }}</h4>
                  <p class="text-[9px] font-bold text-zinc-500">{{ ex.targetSets }} Sets - {{ ex.targetReps }} Reps</p>
                </div>
              </div>
              <button @click="handleRemoveExercise(ex.id)" class="text-zinc-700 hover:text-red-500 p-2">
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Exercise, DayOfWeek } from '~/types';
import { DAYS, DAY_LABELS } from '~/constants';

const { exercises, addExercise, removeExercise, user } = useAppState();

// Redirect if not logged in
onMounted(() => {
  if (!user.value) {
    navigateTo('/');
  }
});

const isAdding = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const newEx = ref<Partial<Exercise>>({
  name: '',
  day: 'Monday',
  notes: '',
  targetSets: 3,
  targetReps: '10',
  imageUrl: ''
});

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      newEx.value.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  if (newEx.value.name) {
    await addExercise({
      name: newEx.value.name,
      day: newEx.value.day || 'Monday',
      notes: newEx.value.notes || '',
      targetSets: newEx.value.targetSets || 3,
      targetReps: newEx.value.targetReps || '10',
      imageUrl: newEx.value.imageUrl || undefined
    });
    isAdding.value = false;
    newEx.value = {
      name: '',
      day: 'Monday',
      notes: '',
      targetSets: 3,
      targetReps: '10',
      imageUrl: ''
    };
  }
};

const getExercisesForDay = (day: DayOfWeek) => {
  return exercises.value.filter((e) => e.day === day);
};

const handleRemoveExercise = async (id: string) => {
  await removeExercise(id);
};
</script>
