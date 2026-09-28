import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INTENT_LABELS, displayName, avatarInitial, formatRelativeTime } from './constants';
import type { ConvoItem } from './types';
import { SHORTCUT_GROUPS } from './shortcuts';

export interface PaletteCommand {
  id: string;
  label: string;
  group: 'Navigation' | 'Actions';
  icon: LucideIcon;
  /** Extra words that should match (e.g. "dark light" for the theme toggle) */
  keywords?: string;
  shortcut?: string[];
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: PaletteCommand[];
  conversations: ConvoItem[];
  onOpenConversation: (item: ConvoItem) => void;
}

type Row =
  | { kind: 'command'; key: string; group: string; command: PaletteCommand }
  | { kind: 'conversation'; key: string; group: string; item: ConvoItem };

const matches = (haystack: string, query: string) =>
  query.split(/\s+/).every((word) => haystack.includes(word));

export default function CommandPalette({ open, onClose, commands, conversations, onOpenConversation }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fresh state each time it opens
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const id = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(id);
  }, [open]);

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();

    // Empty query: 5 most recent conversations; otherwise search names, email, messages, intent
    const convoMatches = (q
      ? conversations.filter((c) =>
          matches(
            [
              displayName(c.conversation),
              c.conversation.visitor_email || '',
              c.latestMessage?.content || '',
              INTENT_LABELS[c.conversation.visitor_intent || ''] || '',
            ].join(' ').toLowerCase(),
            q
          )
        )
      : conversations
    ).slice(0, q ? 8 : 5);

    const commandMatches = commands.filter((c) => !q || matches(`${c.label} ${c.keywords ?? ''}`.toLowerCase(), q));

    return [
      ...commandMatches.filter((c) => c.group === 'Navigation').map((c): Row => ({ kind: 'command', key: c.id, group: 'Go to', command: c })),
      ...convoMatches.map((item): Row => ({
        kind: 'conversation',
        key: item.conversation.id,
        group: q ? 'Conversations' : 'Recent conversations',
        item,
      })),
      ...commandMatches.filter((c) => c.group === 'Actions').map((c): Row => ({ kind: 'command', key: c.id, group: 'Actions', command: c })),
    ];
  }, [query, commands, conversations]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row visible while arrowing through a long list
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const runRow = (row: Row | undefined) => {
    if (!row) return;
    onClose();
    if (row.kind === 'command') row.command.run();
    else onOpenConversation(row.item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (rows.length ? (i + 1) % rows.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (rows.length ? (i - 1 + rows.length) % rows.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runRow(rows[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm dark:bg-black/60"
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search size={17} className="shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations or type a command…"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={rows[active] ? `palette-${rows[active].key}` : undefined}
                className="h-12 min-w-0 flex-1 bg-transparent text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">Esc</kbd>
            </div>

            <div ref={listRef} id="palette-list" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
              {rows.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">No results for “{query}”</p>
              ) : (
                rows.map((row, index) => {
                  const showHeading = row.group !== lastGroup;
                  lastGroup = row.group;
                  return (
                    <div key={`${row.kind}-${row.key}`}>
                      {showHeading && (
                        <p className="px-3 pb-1 pt-3 text-[11px] font-medium text-muted-foreground first:pt-1">{row.group}</p>
                      )}
                      <button
                        id={`palette-${row.key}`}
                        role="option"
                        aria-selected={index === active}
                        data-index={index}
                        onMouseMove={() => setActive(index)}
                        onClick={() => runRow(row)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                          index === active ? 'bg-muted text-foreground' : 'text-foreground/90'
                        )}
                      >
                        {row.kind === 'command' ? (
                          <CommandRow command={row.command} />
                        ) : (
                          <ConversationRow item={row.item} />
                        )}
                        {index === active && <CornerDownLeft size={14} className="ml-2 shrink-0 text-muted-foreground" aria-hidden="true" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><ArrowUp size={11} /><ArrowDown size={11} /> navigate</span>
              <span className="flex items-center gap-1"><CornerDownLeft size={11} /> open</span>
              <span className="ml-auto hidden sm:inline">Press <Kbd>?</Kbd> anywhere for shortcuts</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CommandRow({ command }: { command: PaletteCommand }) {
  const Icon = command.icon;
  return (
    <>
      <Icon size={16} className="shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{command.label}</span>
      {command.shortcut && (
        <span className="flex gap-1">
          {command.shortcut.map((k) => <Kbd key={k}>{k}</Kbd>)}
        </span>
      )}
    </>
  );
}

function ConversationRow({ item }: { item: ConvoItem }) {
  const { conversation } = item;
  return (
    <>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground ring-1 ring-border">
        {avatarInitial(conversation)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">
          {displayName(conversation)}
          {conversation.visitor_intent && INTENT_LABELS[conversation.visitor_intent] && (
            <span className="text-muted-foreground"> · {INTENT_LABELS[conversation.visitor_intent]}</span>
          )}
        </span>
        {item.latestMessage && <span className="block truncate text-xs text-muted-foreground">{item.latestMessage.content}</span>}
      </span>
      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
        {formatRelativeTime(item.latestMessage?.created_at || conversation.created_at)}
      </span>
    </>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

// "?" help dialog listing every shortcut
export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/60"
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="shortcuts-title" className="text-base font-semibold text-foreground">Keyboard shortcuts</h2>
              <Kbd>Esc</Kbd>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{group.title}</p>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.label} className="flex items-center justify-between gap-3 text-sm text-foreground">
                        <span className="text-foreground/90">{item.label}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          {item.keys.map((k, i) => (
                            <span key={k + i} className="flex items-center gap-1">
                              {i > 0 && item.keys[0] === 'G' && <span className="text-[10px] text-muted-foreground">then</span>}
                              <Kbd>{k}</Kbd>
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
