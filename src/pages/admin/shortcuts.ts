// Keyboard shortcut helpers shared by the admin shell, command palette and help dialog.

export const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

/** "⌘" on Apple devices, "Ctrl" elsewhere */
export const MOD_KEY = isMac ? '⌘' : 'Ctrl';

/** Shortcuts must not fire while the admin is typing in a field */
export function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el?.closest('input, textarea, select, [contenteditable="true"]');
}

export interface ShortcutGroup {
  title: string;
  items: { keys: string[]; label: string }[];
}

// Single source of truth for the "?" help dialog
export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'General',
    items: [
      { keys: [MOD_KEY, 'K'], label: 'Open command palette' },
      { keys: ['?'], label: 'Show keyboard shortcuts' },
      { keys: ['/'], label: 'Search conversations' },
      { keys: ['Esc'], label: 'Close dialog / clear search' },
    ],
  },
  {
    title: 'Go to',
    items: [
      { keys: ['G', 'I'], label: 'Inbox' },
      { keys: ['G', 'M'], label: 'Live monitor' },
      { keys: ['G', 'A'], label: 'Analytics' },
      { keys: ['G', 'L'], label: 'Alerts' },
    ],
  },
  {
    title: 'Inbox',
    items: [
      { keys: ['J'], label: 'Next conversation' },
      { keys: ['K'], label: 'Previous conversation' },
      { keys: ['R'], label: 'Reply to conversation' },
      { keys: ['E'], label: 'Archive / move to inbox' },
    ],
  },
];
