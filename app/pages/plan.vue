<template>
  <div class="space-y-6 pb-20">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-zinc-100 tracking-tight uppercase italic">Program</h2>
      <div class="flex items-center gap-2">
        <button
          @click="showLibraryModal = true"
          class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
          title="Kütüphaneden Seç"
        >
          <i class="fa-solid fa-book"></i>
        </button>
        <button
          @click="showForm ? resetForm() : (isAdding = true)"
          :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
            showForm ? 'bg-zinc-800 text-zinc-400' : 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
          ]"
          title="Manuel Ekle"
        >
          <i :class="`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'}`"></i>
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-[9px] font-black uppercase tracking-widest text-zinc-500">
        {{ activeExercises.length }} Aktif
      </div>
      <div class="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-[9px] font-black uppercase tracking-widest text-zinc-500">
        {{ archivedExercises.length }} Arsiv
      </div>
      <button
        v-if="activeExercises.length > 0"
        @click="handleArchiveActivePlan"
        class="px-4 py-2 rounded-xl bg-amber-600/15 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-600/20 transition-all"
      >
        Aktif Plani Arsivle
      </button>
      <button
        v-if="archivedExercises.length > 0"
        @click="showArchived = !showArchived"
        class="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:border-zinc-700 transition-all"
      >
        {{ showArchived ? 'Arsivi Gizle' : 'Arsivi Goster' }}
      </button>
    </div>

    <div
      v-if="activeExercises.length === 0"
      class="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center space-y-2"
    >
      <i class="fa-solid fa-layer-group text-zinc-800 text-2xl"></i>
      <p class="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Aktif plan bos</p>
      <p class="text-zinc-600 text-[10px] font-medium">Yeni plan ekleyebilir veya arsivden geri alabilirsin.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <template v-for="day in DAYS" :key="day">
        <div v-if="getActiveExercisesForDay(day).length > 0" class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="h-px bg-zinc-800 flex-1"></div>
            <h3 class="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{{ DAY_LABELS[day] }}</h3>
            <div class="h-px bg-zinc-800 flex-1"></div>
          </div>
          <div class="grid gap-3">
            <div
              v-for="ex in getActiveExercisesForDay(day)"
              :key="ex.id"
              :class="[
                'bg-zinc-900/50 p-3 rounded-2xl border flex items-center justify-between',
                ex.supersetGroup ? 'border-amber-500/30' : 'border-zinc-800/50'
              ]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-violet-500 overflow-hidden border border-zinc-700/50"
                >
                  <img v-if="ex.imageUrl" :src="ex.imageUrl" class="w-full h-full object-cover" />
                  <i v-else class="fa-solid fa-dumbbell text-sm"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-black text-zinc-200 uppercase tracking-tighter italic">{{ ex.name }}</h4>
                    <span
                      v-if="ex.supersetGroup"
                      class="text-[8px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded"
                    >
                      SS-{{ ex.supersetGroup }}
                    </span>
                  </div>
                  <p class="text-[9px] font-bold text-zinc-500">{{ ex.targetSets }} Sets - {{ ex.targetReps }} Reps</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button @click="handleEditExercise(ex)" class="text-zinc-700 hover:text-amber-500 p-2">
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button @click="handleArchiveExercise(ex.id)" class="text-zinc-700 hover:text-amber-400 p-2">
                  <i class="fa-solid fa-box-archive text-xs"></i>
                </button>
                <button @click="handleRemoveExercise(ex.id)" class="text-zinc-700 hover:text-red-500 p-2">
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="showArchived && archivedExercises.length > 0" class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="h-px bg-zinc-800 flex-1"></div>
        <h3 class="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Arsiv</h3>
        <div class="h-px bg-zinc-800 flex-1"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <template v-for="day in DAYS" :key="`archived-${day}`">
          <div v-if="getArchivedExercisesForDay(day).length > 0" class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="h-px bg-zinc-800 flex-1"></div>
              <h3 class="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{{ DAY_LABELS[day] }}</h3>
              <div class="h-px bg-zinc-800 flex-1"></div>
            </div>
            <div class="grid gap-3">
              <div
                v-for="ex in getArchivedExercisesForDay(day)"
                :key="ex.id"
                class="bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600 overflow-hidden border border-zinc-800">
                    <img v-if="ex.imageUrl" :src="ex.imageUrl" class="w-full h-full object-cover opacity-70" />
                    <i v-else class="fa-solid fa-box-archive text-sm"></i>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="text-xs font-black text-zinc-400 uppercase tracking-tighter italic">{{ ex.name }}</h4>
                      <span class="text-[8px] font-black text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Arsiv</span>
                    </div>
                    <p class="text-[9px] font-bold text-zinc-600">{{ ex.targetSets }} Sets - {{ ex.targetReps }} Reps</p>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <button @click="handleRestoreExercise(ex.id)" class="text-zinc-700 hover:text-emerald-400 p-2">
                    <i class="fa-solid fa-box-open text-xs"></i>
                  </button>
                  <button @click="handleRemoveExercise(ex.id)" class="text-zinc-700 hover:text-red-500 p-2">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>



    <!-- Exercise Form Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <form
          @submit.prevent="handleSubmit"
          class="bg-zinc-900 border border-zinc-800 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl sm:max-h-none sm:overflow-visible sm:rounded-3xl p-5 space-y-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Program</p>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">
                {{ isEditing ? 'Egzersiz Duzenle' : 'Yeni Egzersiz' }}
              </h3>
            </div>
            <button type="button" @click="resetForm" class="text-zinc-500 hover:text-white">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div
            @click="fileInput?.click()"
            class="w-full h-32 bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:border-violet-500/50 cursor-pointer overflow-hidden transition-all"
          >
            <img v-if="newEx.imageUrl" :src="newEx.imageUrl" class="w-full h-full object-cover" />
            <template v-else>
              <i class="fa-solid fa-camera-retro text-xl mb-1"></i>
              <span class="text-[10px] font-black uppercase">Gorsel Ekle</span>
            </template>
            <input ref="fileInput" type="file" @change="handleImageChange" class="hidden" accept="image/*" />
          </div>

          <div class="space-y-3">
            <input
              v-model="newEx.name"
              type="text"
              required
              placeholder="Egzersiz Adi"
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
            <div class="flex gap-3">
              <div class="flex-1">
                <label class="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1 block">Superset Grubu</label>
                <select
                  v-model="newEx.supersetGroup"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 appearance-none"
                >
                  <option :value="null">Yok</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>
            <textarea
              v-model="newEx.notes"
              placeholder="Notlar..."
              class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-medium text-zinc-400 h-20 resize-none"
            />
          </div>
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="resetForm"
              class="w-1/2 bg-zinc-800 text-zinc-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Vazgec
            </button>
            <button
              type="submit"
              :class="[
                'w-1/2 py-3 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl',
                isEditing ? 'bg-amber-600 shadow-amber-600/20' : 'bg-violet-600 shadow-violet-600/20'
              ]"
            >
              {{ isEditing ? 'Guncelle' : 'Egzersiz Olustur' }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>

    <!-- Exercise Library Modal -->
    <ExerciseLibraryModal
      :show="showLibraryModal"
      @close="showLibraryModal = false"
      @select="handleLibrarySelect"
      @manual="handleManualAdd"
    />
  </div>
</template>

<script setup lang="ts">
import type { Exercise, DayOfWeek, LibraryExercise } from '~/types';
import { DAYS, DAY_LABELS } from '~/constants';

definePageMeta({
  middleware: 'auth',
});

useSiteSeo({
  title: 'Workout Plan',
  description: 'Build and manage your weekly training plan and exercise library.',
  noindex: true,
});

const { exercises, addExercise, updateExercise, removeExercise, setExercisesArchived } = useAppState();

const isAdding = ref(false);
const editingId = ref<string | null>(null);
const showLibraryModal = ref(false);
const showArchived = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const isEditing = computed(() => editingId.value !== null);
const showForm = computed(() => isAdding.value || isEditing.value);
const activeExercises = computed(() => exercises.value.filter((exercise) => !exercise.archived));
const archivedExercises = computed(() => exercises.value.filter((exercise) => exercise.archived));

const newEx = ref<Partial<Exercise>>({
  name: '',
  day: 'Monday',
  notes: '',
  targetSets: 3,
  targetReps: '10',
  archived: false,
  imageUrl: '',
  muscleGroup: null,
  supersetGroup: null,
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

const resetForm = () => {
  newEx.value = {
    name: '',
    day: 'Monday',
    notes: '',
    targetSets: 3,
    targetReps: '10',
    archived: false,
    imageUrl: '',
    muscleGroup: null,
    supersetGroup: null,
  };
  isAdding.value = false;
  editingId.value = null;
};

const handleSubmit = async () => {
  if (newEx.value.name) {
    if (editingId.value) {
      // Update existing exercise
      await updateExercise(editingId.value, {
        name: newEx.value.name,
        day: newEx.value.day || 'Monday',
        notes: newEx.value.notes || '',
        targetSets: newEx.value.targetSets || 3,
        targetReps: newEx.value.targetReps || '10',
        archived: newEx.value.archived ?? false,
        imageUrl: newEx.value.imageUrl || undefined,
        muscleGroup: newEx.value.muscleGroup || undefined,
        supersetGroup: newEx.value.supersetGroup || undefined,
      });
    } else {
      // Add new exercise
      await addExercise({
        name: newEx.value.name,
        day: newEx.value.day || 'Monday',
        notes: newEx.value.notes || '',
        targetSets: newEx.value.targetSets || 3,
        targetReps: newEx.value.targetReps || '10',
        archived: newEx.value.archived ?? false,
        imageUrl: newEx.value.imageUrl || undefined,
        muscleGroup: newEx.value.muscleGroup || undefined,
        supersetGroup: newEx.value.supersetGroup || undefined,
      });
    }
    resetForm();
  }
};

const handleEditExercise = (ex: Exercise) => {
  editingId.value = ex.id;
  isAdding.value = false;
  newEx.value = {
    name: ex.name,
    day: ex.day,
    notes: ex.notes,
    targetSets: ex.targetSets,
    targetReps: ex.targetReps,
    archived: ex.archived,
    imageUrl: ex.imageUrl || '',
    muscleGroup: ex.muscleGroup || null,
    supersetGroup: ex.supersetGroup || null,
  };
};

const getExercisesForDay = (source: Exercise[], day: DayOfWeek) => {
  return source
    .filter((exercise) => exercise.day === day)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};

const getActiveExercisesForDay = (day: DayOfWeek) => {
  return getExercisesForDay(activeExercises.value, day);
};

const getArchivedExercisesForDay = (day: DayOfWeek) => {
  return getExercisesForDay(archivedExercises.value, day);
};

const handleRemoveExercise = async (id: string) => {
  await removeExercise(id);
};

const handleArchiveExercise = async (id: string) => {
  await setExercisesArchived([id], true);
  if (editingId.value === id) {
    resetForm();
  }
};

const handleRestoreExercise = async (id: string) => {
  await setExercisesArchived([id], false);
};

const handleArchiveActivePlan = async () => {
  if (!import.meta.client || activeExercises.value.length === 0) return;

  const confirmed = window.confirm('Aktif plandaki tum egzersizler arsive tasinsin mi?');
  if (!confirmed) return;

  await setExercisesArchived(activeExercises.value.map((exercise) => exercise.id), true);
  showArchived.value = true;
  resetForm();
};

const handleLibrarySelect = (exercise: LibraryExercise) => {
  // Pre-fill form with selected exercise
  newEx.value = {
    name: exercise.nameTr,
    day: 'Monday',
    notes: '',
    targetSets: 3,
    targetReps: '10',
    archived: false,
    imageUrl: '',
    muscleGroup: exercise.muscleGroup,
  };
  isAdding.value = true;
};

const handleManualAdd = () => {
  showLibraryModal.value = false;
  isAdding.value = true;
};
</script>
