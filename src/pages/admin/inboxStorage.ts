// Browser-local inbox state the database doesn't track: read receipts and which bot-role
// messages were written by the admin. Every access is guarded because storage can be
// unavailable (private mode, blocked site data).

const SEEN_KEY = 'jdg-admin-seen';
const SENT_KEY = 'jdg-admin-sent-ids';
const MAX_SENT_IDS = 1000;

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: state just won't persist */
  }
};

/** conversation id -> ISO time it was last viewed. null when the inbox has never been opened here. */
export const loadSeen = (): Record<string, string> | null => read<Record<string, string> | null>(SEEN_KEY, null);

export const saveSeen = (seen: Record<string, string>) => write(SEEN_KEY, seen);

export const loadSentIds = (): Set<string> => new Set(read<string[]>(SENT_KEY, []));

export const saveSentIds = (ids: Set<string>) => write(SENT_KEY, [...ids].slice(-MAX_SENT_IDS));
