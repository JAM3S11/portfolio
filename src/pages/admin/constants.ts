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

export const INTENT_COLORS: Record<string, string> = {
  hiring: 'bg-emerald-500/15 text-emerald-500',
  quote: 'bg-blue-500/15 text-blue-500',
  tech: 'bg-violet-500/15 text-violet-500',
  partnership: 'bg-amber-500/15 text-amber-500',
  faq: 'bg-gray-500/15 text-gray-400',
  deep_frontend: 'bg-purple-500/15 text-purple-400',
  deep_backend: 'bg-cyan-500/15 text-cyan-400',
  deep_fullstack: 'bg-pink-500/15 text-pink-400',
  deep_software: 'bg-orange-500/15 text-orange-400',
};

export const QUICK_REPLIES = [
  "Thanks for reaching out! I'll get back to you shortly.",
  "Could you tell me more about your project?",
  "I'd be happy to help. What's your budget range?",
  "Let's schedule a call to discuss further.",
  "Great, I'll send over more details soon!",
];

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
