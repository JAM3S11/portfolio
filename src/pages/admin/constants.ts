export const INTENT_LABELS: Record<string, string> = {
  hiring: 'Hiring / Job',
  quote: 'Project Quote',
  tech: 'Tech Inquiry',
  partnership: 'Partnership',
  faq: 'General FAQ',
  deep_frontend: 'Frontend Deep Dive',
  deep_backend: 'Backend Deep Dive',
  deep_fullstack: 'Fullstack Deep Dive',
  deep_software: 'Software Deep Dive',
};

// Readable in both themes: darker text in light mode, lighter in dark mode
export const INTENT_COLORS: Record<string, string> = {
  hiring: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  quote: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  tech: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  partnership: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  faq: 'bg-muted text-muted-foreground',
  deep_frontend: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  deep_backend: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400',
  deep_fullstack: 'bg-pink-500/15 text-pink-700 dark:text-pink-400',
  deep_software: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
};

export const QUICK_REPLIES = [
  "Thanks for reaching out! I'll get back to you shortly.",
  "Could you tell me more about your project?",
  "I'd be happy to help. What's your budget range?",
  "Let's schedule a call to discuss further.",
  "Great, I'll send over more details soon!",
];

// Response-time bands used across the admin (label always shown with the color)
export function latencyStatus(ms: number): { level: 'good' | 'warning' | 'critical'; label: string } {
  if (ms < 2000) return { level: 'good', label: 'Fast' };
  if (ms < 4000) return { level: 'warning', label: 'Slow' };
  return { level: 'critical', label: 'Very slow' };
}

export function formatMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 0 : 1)}s` : `${Math.round(ms)}ms`;
}

// The chat widget doesn't collect names, so fall back to a stable, readable id
export function displayName(conversation: { id: string; visitor_name: string | null }) {
  return conversation.visitor_name?.trim() || `Visitor #${conversation.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

export function avatarInitial(conversation: { id: string; visitor_name: string | null }) {
  return conversation.visitor_name?.trim()?.[0]?.toUpperCase() || '#';
}

export function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
