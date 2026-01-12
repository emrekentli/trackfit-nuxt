import { clearUserSession } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  clearUserSession(event);
  return { success: true };
});
