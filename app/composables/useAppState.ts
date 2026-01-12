import type { Exercise, WorkoutLog, User, BodyMetric } from '~/types';

interface ApiUser {
  id: string;
  email: string;
  name: string;
}

interface ApiExercise {
  id: string;
  name: string;
  day: string;
  notes: string;
  targetSets: number;
  targetReps: string;
  imageUrl?: string;
  supersetGroup?: string | null;
  orderIndex?: number;
}

interface ApiLog {
  id: string;
  exerciseId: string;
  date: string;
  weight: number;
}

interface ApiBodyMetric {
  id: string;
  date: string;
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

// Global state
const user = ref<User | null>(null);
const exercises = ref<Exercise[]>([]);
const logs = ref<WorkoutLog[]>([]);
const bodyMetrics = ref<BodyMetric[]>([]);
const isLoading = ref(false);
const isInitialized = ref(false);

export function useAppState() {
  // Fetch current user
  const fetchUser = async () => {
    try {
      const data = await $fetch<ApiUser | null>('/api/auth/me');
      if (data) {
        user.value = {
          id: data.id,
          email: data.email,
          name: data.name,
        };
        return true;
      }
      user.value = null;
      return false;
    } catch {
      user.value = null;
      return false;
    }
  };

  // Fetch exercises
  const fetchExercises = async () => {
    if (!user.value) return;
    try {
      const data = await $fetch<ApiExercise[]>('/api/exercises');
      exercises.value = data.map((ex) => ({
        id: ex.id,
        name: ex.name,
        day: ex.day as Exercise['day'],
        notes: ex.notes,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        imageUrl: ex.imageUrl,
        supersetGroup: ex.supersetGroup,
        orderIndex: ex.orderIndex,
      }));
    } catch (e) {
      console.error('Failed to fetch exercises:', e);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    if (!user.value) return;
    try {
      const data = await $fetch<ApiLog[]>('/api/logs');
      logs.value = data.map((log) => ({
        id: log.id,
        exerciseId: log.exerciseId,
        date: log.date,
        weight: log.weight,
      }));
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
  };

  // Fetch body metrics
  const fetchBodyMetrics = async () => {
    if (!user.value) return;
    try {
      const data = await $fetch<ApiBodyMetric[]>('/api/metrics');
      bodyMetrics.value = data;
    } catch (e) {
      console.error('Failed to fetch body metrics:', e);
    }
  };

  // Initialize - fetch user and data
  const initialize = async () => {
    if (isInitialized.value) return;
    isLoading.value = true;
    try {
      const loggedIn = await fetchUser();
      if (loggedIn) {
        await Promise.all([fetchExercises(), fetchLogs(), fetchBodyMetrics()]);
      }
    } finally {
      isLoading.value = false;
      isInitialized.value = true;
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    const data = await $fetch<ApiUser>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    user.value = {
      id: data.id,
      email: data.email,
      name: data.name,
    };

    await Promise.all([fetchExercises(), fetchLogs(), fetchBodyMetrics()]);
  };

  // Register
  const register = async (email: string, password: string, name: string) => {
    const data = await $fetch<ApiUser>('/api/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });

    user.value = {
      id: data.id,
      email: data.email,
      name: data.name,
    };

    // New user starts with empty data
    exercises.value = [];
    logs.value = [];
    bodyMetrics.value = [];
  };

  // Logout
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
    exercises.value = [];
    logs.value = [];
    bodyMetrics.value = [];
    isInitialized.value = false;
  };

  // Add exercise
  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    const data = await $fetch<ApiExercise>('/api/exercises', {
      method: 'POST',
      body: exercise,
    });

    exercises.value.push({
      id: data.id,
      name: data.name,
      day: data.day as Exercise['day'],
      notes: data.notes,
      targetSets: data.targetSets,
      targetReps: data.targetReps,
      imageUrl: data.imageUrl,
      supersetGroup: data.supersetGroup,
      orderIndex: data.orderIndex,
    });
  };

  // Remove exercise
  const removeExercise = async (id: string) => {
    await $fetch(`/api/exercises/${id}`, { method: 'DELETE' });
    exercises.value = exercises.value.filter((ex) => ex.id !== id);
    logs.value = logs.value.filter((log) => log.exerciseId !== id);
  };

  // Update log
  const updateLog = async (exerciseId: string, weight: number) => {
    if (isNaN(weight)) return;

    const today = new Date().toISOString().split('T')[0];

    const data = await $fetch<ApiLog>('/api/logs', {
      method: 'POST',
      body: { exerciseId, date: today, weight },
    });

    const existingIndex = logs.value.findIndex(
      (l) => l.exerciseId === exerciseId && l.date === today
    );

    const newLog: WorkoutLog = {
      id: data.id,
      exerciseId: data.exerciseId,
      date: data.date,
      weight: data.weight,
    };

    if (existingIndex > -1) {
      logs.value[existingIndex] = newLog;
    } else {
      logs.value.push(newLog);
    }
  };

  // Update body metric
  const updateBodyMetric = async (metricData: Partial<BodyMetric> & { date: string }) => {
    const data = await $fetch<ApiBodyMetric>('/api/metrics', {
      method: 'POST',
      body: metricData,
    });

    const existingIndex = bodyMetrics.value.findIndex((m) => m.date === data.date);

    if (existingIndex > -1) {
      bodyMetrics.value[existingIndex] = data;
    } else {
      bodyMetrics.value.unshift(data);
    }

    return data;
  };

  // Export data
  const exportData = async () => {
    const data = await $fetch('/api/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackfit-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);

    const result = await $fetch('/api/import', {
      method: 'POST',
      body: data,
    });

    // Refresh data after import
    await Promise.all([fetchExercises(), fetchLogs(), fetchBodyMetrics()]);

    return result;
  };

  return {
    // State
    user: computed(() => user.value),
    exercises: computed(() => exercises.value),
    logs: computed(() => logs.value),
    bodyMetrics: computed(() => bodyMetrics.value),
    isLoading: computed(() => isLoading.value),
    isInitialized: computed(() => isInitialized.value),

    // Actions
    initialize,
    login,
    register,
    logout,
    addExercise,
    removeExercise,
    updateLog,
    updateBodyMetric,
    exportData,
    importData,
    fetchExercises,
    fetchLogs,
    fetchBodyMetrics,
  };
}
