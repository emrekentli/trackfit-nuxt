import { H3Event } from 'h3';

const SESSION_COOKIE = 'trackfit_session';

export function setUserSession(event: H3Event, userId: string) {
  setCookie(event, SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function getUserSession(event: H3Event): string | null {
  return getCookie(event, SESSION_COOKIE) || null;
}

export function clearUserSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' });
}

export async function requireAuth(event: H3Event): Promise<string> {
  const userId = getUserSession(event);
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }
  return userId;
}
