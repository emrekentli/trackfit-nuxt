<template>
  <div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center overflow-hidden relative">
    <!-- Background Glows -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>

    <div class="relative z-10 space-y-8 max-w-lg">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 text-[10px] font-black uppercase tracking-widest">
        <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        Antrenmanların Geleceği
      </div>

      <h1 class="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
        Takip Et <span class="text-violet-500">Kazan.</span><br />Basit Tut.
      </h1>

      <p class="text-zinc-500 text-sm md:text-base font-medium leading-relaxed">
        Profesyonel seviye antrenman takibi. Gereksiz detay yok, dikkat dağıtıcı yok. Sadece saf performans metrikleri.
      </p>

      <div class="pt-8 flex flex-col gap-4">
        <NuxtLink
          to="/login"
          class="w-full py-5 bg-violet-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-violet-500/30 hover:bg-violet-700 transition-all active:scale-95 text-center"
        >
          ANTRENMANA BAŞLA
        </NuxtLink>
        <div class="flex items-center justify-center gap-6 text-zinc-600">
          <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            <i class="fa-solid fa-check text-emerald-500"></i> Reklamsız
          </div>
          <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            <i class="fa-solid fa-check text-emerald-500"></i> Yerel Veri
          </div>
          <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            <i class="fa-solid fa-check text-emerald-500"></i> Kolay Kullanım
          </div>
        </div>
      </div>
    </div>

    <div class="mt-20 w-full max-w-4xl opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
      <div class="h-64 bg-zinc-900 rounded-t-[3rem] border-t border-x border-zinc-800 p-8">
        <div class="flex gap-4 items-center mb-8">
          <div class="w-12 h-3 bg-zinc-800 rounded-full"></div>
          <div class="w-24 h-3 bg-zinc-800 rounded-full"></div>
        </div>
        <div class="space-y-4">
          <div class="h-12 w-full bg-zinc-800/50 rounded-xl"></div>
          <div class="h-12 w-full bg-zinc-800/50 rounded-xl"></div>
          <div class="h-12 w-full bg-zinc-800/50 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const { user } = useAppState();

// Redirect to train if already logged in
onMounted(() => {
  if (user.value) {
    navigateTo('/train');
  }
});
</script>
