import type { Exercise, WorkoutLog, User, BodyMetric, LibraryExercise, MuscleGroup } from '~/types';

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
  muscleGroup?: string | null;
  supersetGroup?: string | null;
  orderIndex?: number;
}

interface ApiLog {
  id: string;
  exerciseId: string;
  date: string;
  weight: number;
  rir?: number | null;
  setIndex: number;
  reps?: number | null;
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

let clientInitPromise: Promise<void> | null = null;

export function useAppState() {
  // SSR-safe global state using useState
  const user = useState<User | null>('app-user', () => null);
  const exercises = useState<Exercise[]>('app-exercises', () => []);
  const logs = useState<WorkoutLog[]>('app-logs', () => []);
  const bodyMetrics = useState<BodyMetric[]>('app-body-metrics', () => []);
  const exerciseLibrary = useState<LibraryExercise[]>('app-exercise-library', () => []);
  const isLoading = useState<boolean>('app-is-loading', () => false);
  const isInitialized = useState<boolean>('app-is-initialized', () => false);

  const requestHeaders =
    import.meta.server && tryUseNuxtApp()?.ssrContext ? useRequestHeaders(['cookie']) : {};

  const getRequestHeaders = () => requestHeaders;

  // Fetch current user
  const fetchUser = async () => {
    try {
      const data = await $fetch<ApiUser | null>('/api/auth/me', {
        headers: getRequestHeaders(),
      });
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
      const data = await $fetch<ApiExercise[]>('/api/exercises', {
        headers: getRequestHeaders(),
      });
      exercises.value = data.map((ex) => ({
        id: ex.id,
        name: ex.name,
        day: ex.day as Exercise['day'],
        notes: ex.notes,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        imageUrl: ex.imageUrl,
        muscleGroup: ex.muscleGroup as MuscleGroup | null | undefined,
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
      const data = await $fetch<ApiLog[]>('/api/logs', {
        headers: getRequestHeaders(),
      });
      logs.value = data.map((log) => ({
        id: log.id,
        exerciseId: log.exerciseId,
        date: log.date,
        weight: log.weight,
        rir: log.rir ?? null,
        setIndex: log.setIndex,
        reps: log.reps ?? null,
      }));
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
  };

  // Fetch body metrics
  const fetchBodyMetrics = async () => {
    if (!user.value) return;
    try {
      const data = await $fetch<ApiBodyMetric[]>('/api/metrics', {
        headers: getRequestHeaders(),
      });
      bodyMetrics.value = data;
    } catch (e) {
      console.error('Failed to fetch body metrics:', e);
    }
  };

  // Fetch exercise library (public, no auth required)
  const fetchExerciseLibrary = async () => {
    try {
      const data = await $fetch<LibraryExercise[]>('/api/exercise-library');
      exerciseLibrary.value = data;
    } catch (e) {
      console.error('Failed to fetch exercise library:', e);
    }
  };

  // Initialize - fetch user and data (singleton pattern to prevent race conditions)
  const initialize = async () => {
    // Already initialized (check both flag and actual data for hydration)
    if (isInitialized.value) return;

    // On client: if we already have user data from SSR hydration, just mark as initialized
    if (import.meta.client && user.value) {
      isInitialized.value = true;
      return;
    }

    // On client: if initialization is in progress, wait for it
    if (import.meta.client && clientInitPromise) {
      await clientInitPromise;
      return;
    }

    // Start initialization
    const doInit = async () => {
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

    // On client: store promise to prevent race conditions
    if (import.meta.client) {
      clientInitPromise = doInit();
      await clientInitPromise;
    } else {
      // On server: just run directly (each request is isolated)
      await doInit();
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
    clientInitPromise = null; // Reset so reinitialization works after login
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
      muscleGroup: data.muscleGroup as MuscleGroup | null | undefined,
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

  // Update exercise
  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    const data = await $fetch<ApiExercise>(`/api/exercises/${id}`, {
      method: 'PUT',
      body: updates,
    });

    const index = exercises.value.findIndex((ex) => ex.id === id);
    if (index > -1) {
      exercises.value[index] = {
        id: data.id,
        name: data.name,
        day: data.day as Exercise['day'],
        notes: data.notes,
        targetSets: data.targetSets,
        targetReps: data.targetReps,
        imageUrl: data.imageUrl,
        muscleGroup: data.muscleGroup as MuscleGroup | null | undefined,
        supersetGroup: data.supersetGroup,
        orderIndex: data.orderIndex,
      };
    }
  };

  // Update log
  const updateWorkoutSets = async (
    exerciseId: string,
    date: string,
    sets: { setIndex: number; weight: number; reps?: number | null; rir?: number | null }[]
  ) => {
    const payload = sets.filter((set) => !Number.isNaN(set.weight));
    const data = await $fetch<ApiLog[]>('/api/logs', {
      method: 'POST',
      body: { exerciseId, date, sets: payload },
    });

    logs.value = logs.value.filter((log) => !(log.exerciseId === exerciseId && log.date === date));
    logs.value.push(
      ...data.map((log) => ({
        id: log.id,
        exerciseId: log.exerciseId,
        date: log.date,
        weight: log.weight,
        rir: log.rir ?? null,
        setIndex: log.setIndex,
        reps: log.reps ?? null,
      }))
    );
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
    // State (useState is already reactive, no need for computed)
    user,
    exercises,
    logs,
    bodyMetrics,
    exerciseLibrary,
    isLoading,
    isInitialized,

    // Actions
    initialize,
    login,
    register,
    logout,
    addExercise,
    updateExercise,
    removeExercise,
    updateWorkoutSets,
    updateBodyMetric,
    exportData,
    importData,
    fetchExercises,
    fetchLogs,
    fetchBodyMetrics,
    fetchExerciseLibrary,
  };
}
