<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <!-- Header -->
        <div class="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center rounded-t-3xl">
          <h3 class="text-sm font-black text-white uppercase tracking-wider">Egzersiz Kütüphanesi</h3>
          <button @click="$emit('close')" class="text-zinc-500 hover:text-white transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Search -->
        <div class="p-4 border-b border-zinc-800">
          <div class="relative">
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Egzersiz ara..."
              class="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 outline-none transition-colors"
            />
          </div>
        </div>

        <!-- Muscle Group Filters -->
        <div class="p-3 border-b border-zinc-800 overflow-x-auto no-scrollbar">
          <div class="flex gap-2">
            <button
              @click="selectedMuscleGroup = null"
              :class="[
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all',
                selectedMuscleGroup === null
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              ]"
            >
              Tümü
            </button>
            <button
              v-for="group in muscleGroups"
              :key="group.key"
              @click="selectedMuscleGroup = group.key"
              :class="[
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all',
                selectedMuscleGroup === group.key
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              ]"
            >
              {{ group.label }}
            </button>
          </div>
        </div>

        <!-- Exercise List -->
        <div class="flex-1 overflow-y-auto p-3">
          <div v-if="filteredExercises.length === 0" class="text-center py-8">
            <i class="fa-solid fa-dumbbell text-zinc-800 text-3xl mb-3"></i>
            <p class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Egzersiz bulunamadı</p>
          </div>

          <div v-else class="grid gap-2">
            <button
              v-for="exercise in filteredExercises"
              :key="exercise.id"
              @click="selectExercise(exercise)"
              class="bg-zinc-950 border border-zinc-800 hover:border-violet-500/50 rounded-xl p-3 text-left transition-all group"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                    {{ exercise.nameTr }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[8px] font-bold text-violet-400 uppercase tracking-wider">
                      {{ getMuscleGroupLabel(exercise.muscleGroup) }}
                    </span>
                    <span v-if="exercise.equipment" class="text-[8px] font-medium text-zinc-600">
                      {{ getEquipmentLabel(exercise.equipment) }}
                    </span>
                  </div>
                </div>
                <i class="fa-solid fa-plus text-zinc-700 group-hover:text-violet-400 transition-colors"></i>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-zinc-800 bg-zinc-950/50 rounded-b-3xl">
          <button
            @click="$emit('manual')"
            class="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <i class="fa-solid fa-pen mr-2"></i>
            Manuel Egzersiz Ekle
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { LibraryExercise } from '~/types';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', exercise: LibraryExercise): void;
  (e: 'manual'): void;
}>();

const { exerciseLibrary, fetchExerciseLibrary } = useAppState();

const searchQuery = ref('');
const selectedMuscleGroup = ref<string | null>(null);

const muscleGroups = [
  { key: 'Chest', label: 'Göğüs' },
  { key: 'Back', label: 'Sırt' },
  { key: 'Shoulders', label: 'Omuz' },
  { key: 'Biceps', label: 'Biceps' },
  { key: 'Triceps', label: 'Triceps' },
  { key: 'Legs', label: 'Bacak' },
  { key: 'Calves', label: 'Baldır' },
  { key: 'Abs', label: 'Karın' },
  { key: 'Forearms', label: 'Ön Kol' },
];

const equipmentLabels: Record<string, string> = {
  'Barbell': 'Barbell',
  'Dumbbell': 'Dumbbell',
  'Cable': 'Kablo',
  'Machine': 'Makine',
  'Bodyweight': 'Vücut Ağırlığı',
};

const getMuscleGroupLabel = (key: string) => {
  return muscleGroups.find((g) => g.key === key)?.label || key;
};

const getEquipmentLabel = (equipment: string) => {
  return equipmentLabels[equipment] || equipment;
};

const filteredExercises = computed(() => {
  let result = exerciseLibrary.value;

  if (selectedMuscleGroup.value) {
    result = result.filter((ex) => ex.muscleGroup === selectedMuscleGroup.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.nameTr.toLowerCase().includes(query)
    );
  }

  return result;
});

const selectExercise = (exercise: LibraryExercise) => {
  emit('select', exercise);
  emit('close');
};

// Fetch library when modal opens
watch(
  () => props.show,
  (newVal) => {
    if (newVal && exerciseLibrary.value.length === 0) {
      fetchExerciseLibrary();
    }
  },
  { immediate: true }
);

// Reset filters when modal closes
watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      searchQuery.value = '';
      selectedMuscleGroup.value = null;
    }
  }
);
</script>
