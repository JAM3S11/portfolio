import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Download, Search, Inbox, Trash2, MoreHorizontal, Archive, ArchiveRestore, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INTENT_LABELS, INTENT_COLORS, formatRelativeTime, displayName, avatarInitial } from './constants';
import type { ConvoItem } from './types';

type SearchMode = 'people' | 'messages';
type Filter = 'all' | 'unread' | 'hiring' | 'quote' | 'deep' | 'archived';

interface ConversationsListProps {
  conversations: ConvoItem[];
  allMessages: any[];
  selectedId: string | null;
  unreadIds: Set<string>;
  onSelect: (item: ConvoItem) => void;
  onArchive: (item: ConvoItem) => void;
  onDelete: (item: ConvoItem, e: React.MouseEvent) => void;
  onExportCSV: () => void;
  onBack: () => void;
  /** Inside the admin shell the page header already shows the title and export action */
  embedded?: boolean;
  /** Reports the ids currently shown (after search and filters), for j/k navigation */
  onVisibleChange?: (ids: string[]) => void;
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'hiring', label: 'Hiring' },
  { id: 'quote', label: 'Quotes' },
  { id: 'deep', label: 'Deep dives' },
  { id: 'archived', label: 'Archived' },
];

const isArchived = (item: ConvoItem) => item.conversation.status === 'archived';

const matchesFilter = (item: ConvoItem, filter: Filter, unreadIds: Set<string>) => {
  if (filter === 'archived') return isArchived(item);
  if (isArchived(item)) return false;
  const intent = item.conversation.visitor_intent || '';
  switch (filter) {
    case 'unread': return unreadIds.has(item.conversation.id);
    case 'hiring': return intent === 'hiring';
    case 'quote': return intent === 'quote';
    case 'deep': return intent.startsWith('deep_');
    default: return true;
  }
};

export default function ConversationsList({
  conversations,
  allMessages,
  selectedId,
  unreadIds,
  onSelect,
  onArchive,
  onDelete,
  onExportCSV,
  onBack,
  embedded = false,
  onVisibleChange,
}: ConversationsListProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('people');
  const [filter, setFilter] = useState<Filter>('all');
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search from anywhere in the admin (unless already typing)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key !== '/' || target.closest('input, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close an open row menu on outside click or Escape
  useEffect(() => {
    if (!menuFor) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e instanceof MouseEvent && (e.target as HTMLElement).closest('[data-row-menu]')) return;
      setMenuFor(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [menuFor]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.id, conversations.filter((c) => matchesFilter(c, f.id, unreadIds)).length])),
    [conversations, unreadIds]
  );

  const q = query.trim().toLowerCase();

  const visible = useMemo(() => {
    const byFilter = conversations.filter((c) => matchesFilter(c, filter, unreadIds));
    if (!q || mode !== 'people') return byFilter;
    return byFilter.filter((item) =>
      [
        displayName(item.conversation),
        item.conversation.visitor_email || '',
        item.latestMessage?.content || '',
        INTENT_LABELS[item.conversation.visitor_intent || ''] || '',
      ].some((field) => field.toLowerCase().includes(q))
    );
  }, [conversations, filter, unreadIds, q, mode]);

  useEffect(() => {
    onVisibleChange?.(visible.map((c) => c.conversation.id));
  }, [visible, onVisibleChange]);

  // Keep the selected row in view when it changes via keyboard (j/k)
  useEffect(() => {
    if (!selectedId) return;
    document.querySelector(`[data-conversation-id="${selectedId}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  const messageResults = useMemo(() => {
    if (!q || mode !== 'messages') return [];
    return allMessages.filter((m) => m.content?.toLowerCase().includes(q)).slice(0, 30);
  }, [allMessages, q, mode]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 bg-card border-b border-border flex-shrink-0 space-y-2.5">
        {!embedded && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                aria-label="Back to portfolio"
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <h1 className="text-base font-semibold text-foreground">Inbox</h1>
            </div>
            <button
              onClick={onExportCSV}
              aria-label="Export conversations as CSV"
              title="Export CSV"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Download size={16} />
            </button>
          </div>
        )}

        {/* One search box; the scope toggle decides what it searches */}
        <div className="flex items-center gap-1.5 rounded-xl bg-muted px-3 focus-within:ring-2 focus-within:ring-brand transition">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && (setQuery(''), searchRef.current?.blur())}
            placeholder={mode === 'people' ? 'Search conversations' : 'Search message text'}
            aria-label={mode === 'people' ? 'Search conversations' : 'Search message text'}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query ? (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          ) : (
            <kbd className="hidden md:inline rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground">/</kbd>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div role="group" aria-label="Search in" className="flex rounded-lg bg-muted p-0.5 text-[11px] font-medium">
            {(['people', 'messages'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn(
                  'rounded-md px-2 py-0.5 transition-colors',
                  mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m === 'people' ? 'Conversations' : 'Message text'}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {mode === 'messages' && q ? `${messageResults.length} matches` : `${visible.length} shown`}
          </span>
        </div>

        {/* Filter chips */}
        <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                filter === id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              )}
            >
              {label}
              <span className={cn('tabular-nums', filter === id ? 'text-background/70' : 'text-muted-foreground/70')}>
                {counts[id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {mode === 'messages' && q ? (
          <div className="p-2 space-y-0.5">
            {messageResults.length === 0 ? (
              <EmptyState icon={Search} title="No messages match" hint="Try a different word or search conversations instead." />
            ) : (
              messageResults.map((msg: any, idx: number) => {
                const conv = conversations.find((c) => c.conversation.id === msg.conversationId);
                return (
                  <button
                    key={msg.id ?? idx}
                    onClick={() => conv && onSelect(conv)}
                    className="w-full rounded-xl p-3 text-left hover:bg-muted/60 transition-colors"
                  >
                    <p className="text-xs font-medium text-foreground">
                      {conv ? displayName(conv.conversation) : 'Deleted conversation'}
                      <span className="font-normal text-muted-foreground"> · {msg.role === 'visitor' ? 'visitor' : 'reply'} · {formatRelativeTime(msg.created_at)}</span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      <Highlight text={msg.content} query={q} />
                    </p>
                  </button>
                );
              })
            )}
          </div>
        ) : visible.length === 0 ? (
          q ? (
            <EmptyState icon={Search} title="No conversations found" hint="Try another name, email or keyword." />
          ) : filter === 'all' ? (
            <EmptyState icon={Inbox} title="No conversations yet" hint="Chats from the portfolio assistant will appear here." />
          ) : (
            <EmptyState icon={Inbox} title="Nothing here" hint="No conversations match this filter." />
          )
        ) : (
          <div className="py-1">
            {visible.map((item, i) => {
              const id = item.conversation.id;
              const isActive = selectedId === id;
              const isUnread = unreadIds.has(id);
              return (
                // Row is a container so select and menu buttons are siblings (no nested buttons)
                <motion.div
                  key={id}
                  data-conversation-id={id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 10) * 0.02 }}
                  className={cn('group relative flex items-start transition-colors', isActive ? 'bg-muted' : 'hover:bg-muted/60')}
                >
                  {isActive && <span className="absolute left-0 inset-y-0 w-0.5 bg-brand" aria-hidden="true" />}

                  <button
                    onClick={() => onSelect(item)}
                    aria-current={isActive ? 'true' : undefined}
                    className="flex-1 min-w-0 flex items-start gap-3 pl-4 pr-1 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                  >
                    <div className="relative w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-muted ring-1 ring-border">
                      <span className="text-sm font-semibold text-muted-foreground">{avatarInitial(item.conversation)}</span>
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-card" aria-label="Unread" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={cn('text-sm truncate text-foreground', isUnread ? 'font-semibold' : 'font-medium')}>
                          {displayName(item.conversation)}
                        </p>
                        <p className={cn('text-[11px] flex-shrink-0 tabular-nums', isUnread ? 'text-brand font-medium' : 'text-muted-foreground')}>
                          {formatRelativeTime(item.latestMessage?.created_at || item.conversation.created_at)}
                        </p>
                      </div>
                      <p className={cn('text-xs truncate mt-0.5', isUnread ? 'text-foreground/80' : 'text-muted-foreground')}>
                        {item.latestMessage?.role === 'bot' && <span className="text-muted-foreground">↳ </span>}
                        {item.latestMessage?.content || 'No messages yet'}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {item.conversation.visitor_intent && INTENT_LABELS[item.conversation.visitor_intent] && (
                          <span
                            className={cn(
                              'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                              INTENT_COLORS[item.conversation.visitor_intent] || 'bg-muted text-muted-foreground'
                            )}
                          >
                            {INTENT_LABELS[item.conversation.visitor_intent]}
                          </span>
                        )}
                        {isArchived(item) && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Archived</span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Row actions */}
                  <div className="relative mt-2.5 mr-2" data-row-menu>
                    <button
                      onClick={() => setMenuFor(menuFor === id ? null : id)}
                      aria-label={`Actions for ${displayName(item.conversation)}`}
                      aria-haspopup="menu"
                      aria-expanded={menuFor === id}
                      className={cn(
                        'p-1.5 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground transition-opacity',
                        menuFor === id ? 'opacity-100 bg-background' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
                      )}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    {menuFor === id && (
                      <div
                        role="menu"
                        className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl"
                      >
                        <button
                          role="menuitem"
                          onClick={() => { setMenuFor(null); onArchive(item); }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-muted"
                        >
                          {isArchived(item) ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                          {isArchived(item) ? 'Move to inbox' : 'Archive'}
                        </button>
                        <button
                          role="menuitem"
                          onClick={(e) => { setMenuFor(null); onDelete(item, e); }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }: { icon: typeof Inbox; title: string; hint: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <Icon size={28} className="mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

// Highlights the matched part of a search result
function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query);
  if (index === -1) return <>{text}</>;
  const start = Math.max(0, index - 40);
  return (
    <>
      {start > 0 && '…'}
      {text.slice(start, index)}
      <mark className="rounded bg-brand/20 px-0.5 text-foreground">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}
