// Remembers that the admin passed the password check, so a refresh doesn't ask again.
//
// This is a convenience, not a security boundary: the password itself is checked in the
// browser (see auth-service.ts), so anyone with DevTools could set this flag - just as they
// could bypass the check today. Real protection needs Supabase Auth or a server-side check.

const KEY = 'jdg-admin-session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // this tab only: 12 hours
const REMEMBER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // "keep me signed in": 7 days

interface StoredSession {
  expiresAt: number;
}

const stores = (): Storage[] => {
  try {
    return [sessionStorage, localStorage];
  } catch {
    return [];
  }
};

export function saveAdminSession(remember: boolean) {
  clearAdminSession();
  const session: StoredSession = { expiresAt: Date.now() + (remember ? REMEMBER_TTL_MS : SESSION_TTL_MS) };
  try {
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable: the admin just signs in again after a refresh */
  }
}

export function hasAdminSession(): boolean {
  for (const store of stores()) {
    try {
      const raw = store.getItem(KEY);
      if (!raw) continue;
      const { expiresAt } = JSON.parse(raw) as StoredSession;
      if (expiresAt > Date.now()) return true;
      store.removeItem(KEY);
    } catch {
      /* unreadable entry: treat as signed out */
    }
  }
  return false;
}

export function clearAdminSession() {
  for (const store of stores()) {
    try {
      store.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}
