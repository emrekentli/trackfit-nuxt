<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-500/30">
    <!-- Dynamic Header -->
    <header class="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
      <div class="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/train" class="flex items-center gap-2.5 cursor-pointer">
          <div class="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <i class="fa-solid fa-dumbbell text-white text-sm"></i>
          </div>
          <div class="flex flex-col -space-y-1">
            <span class="font-black text-lg tracking-tighter uppercase italic leading-none">TRACKFIT</span>
            <span class="text-[8px] font-bold text-violet-400 uppercase tracking-widest pl-0.5">Performance</span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            :class="[
              route.path === item.path
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            ]"
          >
            <i :class="`fa-solid ${item.icon} mr-2`"></i>
            {{ item.label }}
          </NuxtLink>
        </nav>

        <button
          @click="handleLogout"
          class="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 hover:border-red-500/50 transition-all"
        >
          <span class="text-[10px] font-black text-zinc-500 group-hover:text-red-400 uppercase tracking-widest transition-colors">Çıkış</span>
          <i class="fa-solid fa-arrow-right-from-bracket text-xs text-zinc-500 group-hover:text-red-400 transition-colors"></i>
        </button>
      </div>
    </header>

    <main class="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-5 pt-6 pb-32 md:pb-12">
      <slot />
    </main>

    <!-- Mobile Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent md:hidden">
      <nav class="max-w-sm mx-auto h-16 glass rounded-2xl flex items-center justify-around px-2 shadow-2xl">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="relative flex flex-col items-center justify-center w-16 h-12 transition-all duration-300"
          :class="[
            route.path === item.path
              ? 'text-violet-400'
              : 'text-zinc-500 hover:text-zinc-300'
          ]"
        >
          <div
            v-if="route.path === item.path"
            class="absolute -top-1 w-8 h-1 bg-violet-500 rounded-full blur-[2px]"
          ></div>
          <i :class="`fa-solid ${item.icon} text-lg`"></i>
          <span class="text-[9px] font-bold uppercase mt-1 tracking-wider">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
const { logout } = useAppState();
const route = useRoute();

const navItems = [
  { label: 'Antrenman', icon: 'fa-bolt-lightning', path: '/train' },
  { label: 'Program', icon: 'fa-calendar-day', path: '/plan' },
  { label: 'İlerleme', icon: 'fa-chart-line', path: '/stats' },
];

const handleLogout = async () => {
  await logout();
  navigateTo('/');
};
</script>
