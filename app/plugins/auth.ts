export default defineNuxtPlugin(async () => {
  const { initialize } = useAppState();

  await initialize();
});
