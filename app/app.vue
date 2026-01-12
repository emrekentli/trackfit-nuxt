<template>
  <div v-if="isLoading" class="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div class="text-center space-y-4">
      <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-zinc-500 text-sm font-bold uppercase tracking-widest">Yükleniyor...</p>
    </div>
  </div>
  <NuxtLayout v-else>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { initialize, isLoading } = useAppState();

useHead({
  title: 'TrackFit - Ultimate Workout Tracker',
  meta: [
    { name: 'description', content: 'Professional grade workout tracking. No fluff, no distractions.' }
  ]
});

onMounted(() => {
  initialize();
});
</script>