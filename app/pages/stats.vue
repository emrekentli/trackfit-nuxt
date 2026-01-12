<template>
  <div class="space-y-6">
    <!-- Tab Navigation -->
    <div class="flex overflow-x-auto no-scrollbar gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all',
          activeTab === tab.id
            ? 'bg-violet-600 border-violet-500 text-white shadow-lg'
            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
        ]"
      >
        <i :class="`fa-solid ${tab.icon} mr-2`"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Charts Tab -->
    <template v-if="activeTab === 'charts'">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter">Gelişim Grafiği</h2>
        <p class="text-zinc-500 text-xs font-medium">Güç artışını görselleştirin.</p>
      </div>

      <!-- Exercise Selector -->
      <div class="flex overflow-x-auto no-scrollbar gap-2">
        <button
          v-for="ex in exercises"
          :key="ex.id"
          @click="selectedExercise = ex.id"
          :class="[
            'flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all',
            selectedExercise === ex.id
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
          ]"
        >
          {{ ex.name.substring(0, 15) }}{{ ex.name.length > 15 ? '...' : '' }}
        </button>
      </div>

      <div v-if="selectedExerciseLogs.length < 2" class="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
        <i class="fa-solid fa-chart-line text-zinc-800 text-3xl mb-4"></i>
        <p class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-loose">
          Grafik için<br />daha fazla veriye ihtiyacın var
        </p>
      </div>

      <div v-else class="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 shadow-2xl">
        <div class="h-64">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Exercise Stats List -->
      <div class="grid gap-3">
        <div
          v-for="ex in exercises"
          :key="ex.id"
          class="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center group overflow-hidden relative"
        >
          <div class="absolute inset-y-0 left-0 w-1 bg-violet-600 group-hover:w-2 transition-all"></div>
          <div>
            <h4 class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{{ ex.name }}</h4>
            <p class="text-sm font-black text-zinc-200 mt-1 uppercase italic tracking-tighter">
              {{ getLatestWeight(ex.id) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">PR</p>
            <p class="text-xs font-black text-emerald-400 uppercase italic">{{ getMaxWeight(ex.id) }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- History Tab -->
    <template v-if="activeTab === 'history'">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter">Antrenman Geçmişi</h2>
        <p class="text-zinc-500 text-xs font-medium">Tüm antrenmanlarını görüntüle.</p>
      </div>

      <div v-if="groupedLogs.length === 0" class="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
        <i class="fa-solid fa-clock-rotate-left text-zinc-800 text-3xl mb-4"></i>
        <p class="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Henüz antrenman kaydı yok</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(group, index) in groupedLogs"
          :key="group.date"
          class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
        >
          <div class="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                <i class="fa-solid fa-calendar-day text-violet-400 text-sm"></i>
              </div>
              <div>
                <p class="text-[10px] font-black text-white uppercase tracking-wider">{{ formatDate(group.date) }}</p>
                <p class="text-[9px] font-medium text-zinc-500">{{ group.logs.length }} egzersiz</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black text-emerald-400">{{ getTotalVolume(group.logs) }} KG</p>
              <p class="text-[8px] text-zinc-600 font-bold uppercase">Toplam hacim</p>
            </div>
          </div>
          <div class="divide-y divide-zinc-800/50">
            <div v-for="log in group.logs" :key="log.id" class="px-4 py-3 flex justify-between items-center">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {{ getExerciseName(log.exerciseId) }}
              </span>
              <span class="text-[11px] font-black text-zinc-200">{{ log.weight }} KG</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Body Metrics Tab -->
    <template v-if="activeTab === 'metrics'">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter">Vücut Ölçüleri</h2>
        <p class="text-zinc-500 text-xs font-medium">Vücut değişimini takip et.</p>
      </div>

      <!-- Add New Metric Button -->
      <button
        @click="showMetricModal = true"
        class="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        Yeni Ölçüm Ekle
      </button>

      <!-- Metrics Summary Cards -->
      <div class="grid grid-cols-2 gap-3" v-if="latestMetric">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <i class="fa-solid fa-weight-scale text-violet-400 text-lg mb-2"></i>
          <p class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Kilo</p>
          <p class="text-lg font-black text-white">{{ latestMetric.weight ?? '--' }} <span class="text-[10px] text-zinc-500">KG</span></p>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <i class="fa-solid fa-percent text-emerald-400 text-lg mb-2"></i>
          <p class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Yağ Oranı</p>
          <p class="text-lg font-black text-white">{{ latestMetric.bodyFat ?? '--' }} <span class="text-[10px] text-zinc-500">%</span></p>
        </div>
      </div>

      <!-- Body Metrics Chart -->
      <div v-if="bodyMetrics.length >= 2" class="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 shadow-2xl">
        <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Kilo Değişimi</p>
        <div class="h-48">
          <Line :data="bodyWeightChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Metrics History -->
      <div class="space-y-3">
        <div
          v-for="metric in bodyMetrics"
          :key="metric.id"
          class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
        >
          <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] font-black text-violet-400 uppercase tracking-wider">{{ formatDate(metric.date) }}</span>
            <div class="flex items-center gap-2">
              <span v-if="metric.weight" class="text-[10px] font-bold text-zinc-400">{{ metric.weight }} KG</span>
              <span v-if="metric.bodyFat" class="text-[10px] font-bold text-emerald-400">{{ metric.bodyFat }}%</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div v-if="metric.chest">
              <p class="text-[8px] font-bold text-zinc-600 uppercase">Göğüs</p>
              <p class="text-[10px] font-black text-zinc-300">{{ metric.chest }} cm</p>
            </div>
            <div v-if="metric.waist">
              <p class="text-[8px] font-bold text-zinc-600 uppercase">Bel</p>
              <p class="text-[10px] font-black text-zinc-300">{{ metric.waist }} cm</p>
            </div>
            <div v-if="metric.hips">
              <p class="text-[8px] font-bold text-zinc-600 uppercase">Kalça</p>
              <p class="text-[10px] font-black text-zinc-300">{{ metric.hips }} cm</p>
            </div>
            <div v-if="metric.bicepLeft || metric.bicepRight">
              <p class="text-[8px] font-bold text-zinc-600 uppercase">Biceps</p>
              <p class="text-[10px] font-black text-zinc-300">{{ metric.bicepLeft || metric.bicepRight }} cm</p>
            </div>
            <div v-if="metric.shoulders">
              <p class="text-[8px] font-bold text-zinc-600 uppercase">Omuz</p>
              <p class="text-[10px] font-black text-zinc-300">{{ metric.shoulders }} cm</p>
            </div>
            <div v-if="metric.thighLeft || metric.thighRight">
              <p class="text-[8px] font-bold text-zinc-600 uppercase">Bacak</p>
              <p class="text-[10px] font-black text-zinc-300">{{ metric.thighLeft || metric.thighRight }} cm</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Export/Import Tab -->
    <template v-if="activeTab === 'data'">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter">Veri Yönetimi</h2>
        <p class="text-zinc-500 text-xs font-medium">Verilerini dışa/içe aktar.</p>
      </div>

      <div class="space-y-4">
        <button
          @click="handleExport"
          class="w-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
        >
          <i class="fa-solid fa-download text-emerald-400"></i>
          <span class="text-[10px] font-black uppercase tracking-widest">Verileri Dışa Aktar (JSON)</span>
        </button>

        <label class="w-full bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer">
          <i class="fa-solid fa-upload text-violet-400"></i>
          <span class="text-[10px] font-black uppercase tracking-widest">Verileri İçe Aktar</span>
          <input type="file" accept=".json" @change="handleImport" class="hidden" />
        </label>

        <div v-if="importStatus" class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <i :class="['fa-solid', importStatus.success ? 'fa-check-circle text-emerald-400' : 'fa-exclamation-circle text-red-400', 'text-2xl mb-2']"></i>
          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{{ importStatus.message }}</p>
        </div>
      </div>

      <div class="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 border-dashed">
        <p class="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] leading-relaxed text-center">
          İpucu: Verilerini düzenli olarak yedeklemen önerilir.
        </p>
      </div>
    </template>

    <!-- Body Metric Modal -->
    <Teleport to="body">
      <div v-if="showMetricModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
          <div class="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 class="text-sm font-black text-white uppercase tracking-wider">Yeni Ölçüm</h3>
            <button @click="showMetricModal = false" class="text-zinc-500 hover:text-white">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          <form @submit.prevent="saveMetric" class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Kilo (kg)</label>
                <input
                  v-model.number="newMetric.weight"
                  type="number"
                  step="0.1"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Yağ Oranı (%)</label>
                <input
                  v-model.number="newMetric.bodyFat"
                  type="number"
                  step="0.1"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Göğüs (cm)</label>
                <input
                  v-model.number="newMetric.chest"
                  type="number"
                  step="0.5"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Bel (cm)</label>
                <input
                  v-model.number="newMetric.waist"
                  type="number"
                  step="0.5"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Kalça (cm)</label>
                <input
                  v-model.number="newMetric.hips"
                  type="number"
                  step="0.5"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Omuz (cm)</label>
                <input
                  v-model.number="newMetric.shoulders"
                  type="number"
                  step="0.5"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sol Biceps (cm)</label>
                <input
                  v-model.number="newMetric.bicepLeft"
                  type="number"
                  step="0.5"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sağ Biceps (cm)</label>
                <input
                  v-model.number="newMetric.bicepRight"
                  type="number"
                  step="0.5"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sol Bacak (cm)</label>
                <input
                  v-model.number="newMetric.thighLeft"
                  type="number"
                  step="0.5"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sağ Bacak (cm)</label>
                <input
                  v-model.number="newMetric.thighRight"
                  type="number"
                  step="0.5"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Notlar</label>
              <textarea
                v-model="newMetric.notes"
                rows="2"
                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              class="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Kaydet
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { exercises, logs, bodyMetrics, user, exportData, importData, updateBodyMetric } = useAppState();

// Redirect if not logged in
onMounted(() => {
  if (!user.value) {
    navigateTo('/');
  }
});

const tabs = [
  { id: 'charts', label: 'Grafikler', icon: 'fa-chart-line' },
  { id: 'history', label: 'Geçmiş', icon: 'fa-clock-rotate-left' },
  { id: 'metrics', label: 'Vücut', icon: 'fa-ruler' },
  { id: 'data', label: 'Veri', icon: 'fa-database' },
];

const activeTab = ref('charts');
const selectedExercise = ref<string | null>(null);
const showMetricModal = ref(false);
const importStatus = ref<{ success: boolean; message: string } | null>(null);

const newMetric = ref({
  weight: null as number | null,
  bodyFat: null as number | null,
  chest: null as number | null,
  waist: null as number | null,
  hips: null as number | null,
  shoulders: null as number | null,
  bicepLeft: null as number | null,
  bicepRight: null as number | null,
  thighLeft: null as number | null,
  thighRight: null as number | null,
  notes: '',
});

// Set default selected exercise
watchEffect(() => {
  const firstExercise = exercises.value[0];
  if (exercises.value.length > 0 && !selectedExercise.value && firstExercise) {
    selectedExercise.value = firstExercise.id;
  }
});

const selectedExerciseLogs = computed(() => {
  if (!selectedExercise.value) return [];
  return logs.value
    .filter((l) => l.exerciseId === selectedExercise.value)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { color: 'rgba(63, 63, 70, 0.3)' },
      ticks: { color: '#71717a', font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(63, 63, 70, 0.3)' },
      ticks: { color: '#71717a', font: { size: 10 } },
    },
  },
};

const chartData = computed(() => ({
  labels: selectedExerciseLogs.value.map((l) => {
    const [, month, day] = l.date.split('-');
    return `${day}/${month}`;
  }),
  datasets: [
    {
      label: 'Kilo (KG)',
      data: selectedExerciseLogs.value.map((l) => l.weight),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    },
  ],
}));

const latestMetric = computed(() => bodyMetrics.value[0] || null);

const bodyWeightChartData = computed(() => {
  const sortedMetrics = [...bodyMetrics.value]
    .filter((m): m is typeof m & { weight: number } => m.weight != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    labels: sortedMetrics.map((m) => {
      const [, month, day] = m.date.split('-');
      return `${day}/${month}`;
    }),
    datasets: [
      {
        label: 'Kilo (KG)',
        data: sortedMetrics.map((m) => m.weight) as number[],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };
});

const groupedLogs = computed(() => {
  const groups: Record<string, typeof logs.value> = {};

  logs.value.forEach((log) => {
    if (!groups[log.date]) groups[log.date] = [];
    groups[log.date]!.push(log);
  });

  return Object.entries(groups)
    .map(([date, dateLogs]) => ({ date, logs: dateLogs }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const getLatestWeight = (exerciseId: string) => {
  const exLogs = logs.value.filter((l) => l.exerciseId === exerciseId);
  if (exLogs.length === 0) return '--';
  const sorted = exLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0];
  if (!latest) return '--';
  return `${latest.weight} KG`;
};

const getMaxWeight = (exerciseId: string) => {
  const exLogs = logs.value.filter((l) => l.exerciseId === exerciseId);
  if (exLogs.length === 0) return '--';
  const max = Math.max(...exLogs.map((l) => l.weight));
  return `${max} KG`;
};

const getExerciseName = (exerciseId: string) => {
  return exercises.value.find((e) => e.id === exerciseId)?.name || 'Bilinmeyen';
};

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const monthName = month ? months[parseInt(month) - 1] ?? '' : '';
  return `${day} ${monthName} ${year}`;
};

const getTotalVolume = (dayLogs: typeof logs.value) => {
  return dayLogs.reduce((sum, log) => sum + log.weight, 0).toFixed(1);
};

const handleExport = async () => {
  await exportData();
};

const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const result = await importData(file);
    importStatus.value = {
      success: true,
      message: `${result.imported.exercises} egzersiz, ${result.imported.logs} kayıt, ${result.imported.bodyMetrics} ölçüm içe aktarıldı`,
    };
  } catch (e) {
    importStatus.value = {
      success: false,
      message: 'İçe aktarma başarısız. Dosya formatını kontrol edin.',
    };
  }

  // Clear status after 5 seconds
  setTimeout(() => {
    importStatus.value = null;
  }, 5000);
};

const saveMetric = async () => {
  const today = new Date().toISOString().split('T')[0] as string;
  await updateBodyMetric({
    date: today,
    ...newMetric.value,
  });

  // Reset form
  newMetric.value = {
    weight: null,
    bodyFat: null,
    chest: null,
    waist: null,
    hips: null,
    shoulders: null,
    bicepLeft: null,
    bicepRight: null,
    thighLeft: null,
    thighRight: null,
    notes: '',
  };

  showMetricModal.value = false;
};
</script>
