<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-950 px-6 relative">
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 blur-[100px] pointer-events-none"
    ></div>

    <div class="w-full max-w-sm space-y-8 relative z-10">
      <div class="text-center space-y-2">
        <div
          class="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/20 rotate-3"
        >
          <i class="fa-solid fa-bolt text-white text-xl"></i>
        </div>
        <h2 class="text-3xl font-black text-white tracking-tighter uppercase italic">
          {{ isLogin ? 'Tekrar Hoşgeldin' : 'Aramıza Katıl' }}
        </h2>
        <p class="text-zinc-500 text-sm font-medium">
          {{ isLogin ? 'Devam etmek için giriş yap.' : 'Takibe başlamak için hesap oluştur.' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!isLogin" class="space-y-1.5">
          <label class="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Ad Soyad</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-xl px-4 py-4 text-sm font-bold text-white transition-all outline-none"
            placeholder="Emre Kentli"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">E-posta Adresi</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-xl px-4 py-4 text-sm font-bold text-white transition-all outline-none"
            placeholder="isim@email.com"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Şifre</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-xl px-4 py-4 text-sm font-bold text-white transition-all outline-none"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="text-red-500 text-xs font-bold text-center">{{ error }}</p>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-5 bg-violet-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-violet-500/20 hover:bg-violet-700 transition-all active:scale-[0.98] mt-4 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur') }}
        </button>
      </form>

      <div class="text-center">
        <button
          @click="isLogin = !isLogin"
          class="text-zinc-500 text-xs font-bold hover:text-violet-400 transition-colors uppercase tracking-widest"
        >
          {{ isLogin ? "Hesabın yok mu? Kayıt Ol" : 'Zaten üye misin? Giriş Yap' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const { login, register, user } = useAppState();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const name = ref('');
const error = ref('');
const isSubmitting = ref(false);

// Redirect if already logged in
watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/train');
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (!email.value || !password.value) return;
  if (!isLogin.value && !name.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    if (isLogin.value) {
      await login(email.value, password.value);
    } else {
      await register(email.value, password.value, name.value);
    }
    navigateTo('/train');
  } catch (e: any) {
    error.value = e.data?.message || 'Bir hata oluştu';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
