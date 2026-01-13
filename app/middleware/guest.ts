export default defineNuxtRouteMiddleware(async () => {
  const { user, isInitialized, initialize } = useAppState();

  // Wait for initialization (plugin may still be running)
  if (!isInitialized.value) {
    await initialize();
  }

  // Redirect to train page if already authenticated
  if (user.value) {
    return navigateTo('/train');
  }
});
