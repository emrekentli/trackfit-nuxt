export default defineNuxtPlugin(async () => {
  const { initialize } = useAppState();

  // Initialize auth state on app start (client-side only)
  if (import.meta.client) {
    await initialize();
  }
});
