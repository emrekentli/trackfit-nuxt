export default defineNuxtRouteMiddleware(async () => {
  const { user, isInitialized, initialize } = useAppState();

  // Wait for initialization (plugin may still be running)
  if (!isInitialized.value) {
    await initialize();
  }

  // Redirect to home if not authenticated
  if (!user.value) {
    return navigateTo('/', { replace: true });
  }
});
