import { useRef, useEffect, useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronLeft, MessageCircle, Trash2, Brain, Archive, ArchiveRestore, ArrowUp, Zap, Sparkles, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { markdownComponents } from '@/components/chat/ChatMessage';
import { INTENT_LABELS, INTENT_COLORS, QUICK_REPLIES, formatTime, displayName, avatarInitial } from './constants';
import type { ConvoItem, MessageItem, MessageSender } from './types';
import AITraceViewer from '@/components/admin/AITraceViewer';

interface ChatPanelProps {
  selectedConvo: ConvoItem | null;
  messages: MessageItem[];
  replyText: string;
  onReplyTextChange: (v: string) => void;
  onSendReply: () => void;
  onArchive: (item: ConvoItem) => void;
  onDeleteConversation: (item: ConvoItem, e: React.MouseEvent) => void;
  onBack: () => void;
}

const iconButton = 'p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors';

const dayLabel = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function ChatPanel({
  selectedConvo,
  messages,
  replyText,
  onReplyTextChange,
  onSendReply,
  onArchive,
  onDeleteConversation,
  onBack,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTrace, setShowTrace] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedConvo) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
          <MessageCircle size={24} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No conversation selected</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick one from the list, or press <kbd className="rounded border border-border px-1 font-mono text-[10px]">/</kbd> to search.
        </p>
      </div>
    );
  }

  const { conversation } = selectedConvo;
  const archived = conversation.status === 'archived';

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} aria-label="Back to conversations" className={cn('md:hidden', iconButton)}>
          <ChevronLeft size={18} />
        </button>

        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-muted ring-1 ring-border">
          <span className="text-sm font-semibold text-muted-foreground">{avatarInitial(conversation)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">{displayName(conversation)}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {conversation.visitor_email && (
              <p className="text-xs truncate text-muted-foreground">{conversation.visitor_email}</p>
            )}
            {conversation.visitor_intent && INTENT_LABELS[conversation.visitor_intent] && (
              <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', INTENT_COLORS[conversation.visitor_intent] || 'bg-muted text-muted-foreground')}>
                {INTENT_LABELS[conversation.visitor_intent]}
              </span>
            )}
            {archived && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Archived</span>
            )}
          </div>
        </div>

        {/* On wide screens these live in the details panel */}
        <div className="flex items-center gap-0.5 xl:hidden">
          <button
            onClick={() => setShowTrace(!showTrace)}
            aria-pressed={showTrace}
            aria-label="Toggle AI trace"
            title="AI trace"
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showTrace ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Brain size={16} />
          </button>
          <button
            onClick={() => onArchive(selectedConvo)}
            aria-label={archived ? 'Move to inbox' : 'Archive conversation'}
            title={archived ? 'Move to inbox' : 'Archive'}
            className={iconButton}
          >
            {archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          </button>
          <button
            onClick={(e) => onDeleteConversation(selectedConvo, e)}
            aria-label="Delete conversation"
            title="Delete conversation"
            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/15 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showTrace && (
        <div className="xl:hidden flex-shrink-0 border-b border-border max-h-56 overflow-y-auto px-4 py-3">
          <AITraceViewer conversationId={conversation.id} />
        </div>
      )}

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
        <div className="mx-auto max-w-3xl">
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const newDay = !prev || new Date(prev.created_at).toDateString() !== new Date(msg.created_at).toDateString();
            const startsGroup = newDay || !prev || prev.sender !== msg.sender;
            return (
              <Fragment key={msg.id ?? `pending-${idx}`}>
                {newDay && (
                  <div className="my-5 flex items-center gap-3" role="separator">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-medium text-muted-foreground">{dayLabel(msg.created_at)}</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <MessageBubble message={msg} showLabel={startsGroup} visitorName={displayName(conversation)} />
              </Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <Composer value={replyText} onChange={onReplyTextChange} onSend={onSendReply} archived={archived} />
    </div>
  );
}

const SENDER_LABEL: Record<MessageSender, string> = { visitor: '', ai: 'AI assistant', you: 'You' };

function MessageBubble({ message, showLabel, visitorName }: { message: MessageItem; showLabel: boolean; visitorName: string }) {
  const isVisitor = message.sender === 'visitor';
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn('flex flex-col', isVisitor ? 'items-start' : 'items-end', showLabel ? 'mt-4' : 'mt-1')}
    >
      {showLabel && (
        <p className="mb-1 flex items-center gap-1 px-1 text-[11px] font-medium text-muted-foreground">
          {message.sender === 'ai' && <Sparkles size={11} className="text-brand" />}
          {isVisitor ? visitorName : SENDER_LABEL[message.sender]}
        </p>
      )}
      <div
        className={cn(
          'max-w-[85%] lg:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
          isVisitor && 'bg-muted text-foreground rounded-tl-md',
          message.sender === 'ai' && 'bg-card border border-border text-foreground rounded-tr-md',
          message.sender === 'you' && 'bg-foreground text-background rounded-tr-md',
          message.pending && 'opacity-60'
        )}
      >
        {message.sender === 'ai' ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
      <p className="mt-0.5 flex items-center gap-1 px-1 text-[10px] text-muted-foreground tabular-nums">
        {message.pending ? (
          <>
            <Loader2 size={10} className="animate-spin" /> Sending…
          </>
        ) : (
          formatTime(message.created_at)
        )}
      </p>
    </motion.div>
  );
}

// Reply box: grows with content, Enter sends, "/" opens saved replies
function Composer({
  value,
  onChange,
  onSend,
  archived,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  archived: boolean;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [snippetsOpen, setSnippetsOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const slashQuery = value.startsWith('/') ? value.slice(1).toLowerCase() : null;
  const menuOpen = snippetsOpen || slashQuery !== null;
  const snippets = QUICK_REPLIES.filter((r) => !slashQuery || r.toLowerCase().includes(slashQuery));

  // Resize to fit content (up to ~6 lines)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const choose = (snippet: string) => {
    onChange(snippet);
    setSnippetsOpen(false);
    setHighlight(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (menuOpen && snippets.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % snippets.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h - 1 + snippets.length) % snippets.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); choose(snippets[Math.min(highlight, snippets.length - 1)]); return; }
    }
    if (e.key === 'Escape' && menuOpen) {
      setSnippetsOpen(false);
      if (slashQuery !== null) onChange('');
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSend();
    }
  };

  return (
    <div className="relative flex-shrink-0 border-t border-border bg-card px-4 py-3 md:px-6">
      <div className="mx-auto max-w-3xl">
        {menuOpen && (
          <div role="listbox" aria-label="Saved replies" className="absolute bottom-full left-4 right-4 md:left-6 md:right-6 mb-2 mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <p className="border-b border-border px-3 py-2 text-[11px] font-medium text-muted-foreground">Saved replies</p>
            {snippets.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">No saved reply matches “{slashQuery}”.</p>
            ) : (
              snippets.map((snippet, i) => (
                <button
                  key={snippet}
                  role="option"
                  aria-selected={i === highlight}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => { e.preventDefault(); choose(snippet); }}
                  className={cn('block w-full truncate px-3 py-2 text-left text-sm', i === highlight ? 'bg-muted text-foreground' : 'text-muted-foreground')}
                >
                  {snippet}
                </button>
              ))
            )}
          </div>
        )}

        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-2 py-1.5 focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/10 transition">
          <button
            type="button"
            onClick={() => { setSnippetsOpen((o) => !o); inputRef.current?.focus(); }}
            aria-label="Saved replies"
            aria-expanded={menuOpen}
            title="Saved replies"
            className={cn('mb-0.5 p-1.5 rounded-lg transition-colors', menuOpen ? 'text-brand bg-brand/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}
          >
            <Zap size={15} />
          </button>
          <label htmlFor="admin-reply" className="sr-only">Reply</label>
          <textarea
            id="admin-reply"
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => { onChange(e.target.value); setHighlight(0); }}
            onKeyDown={handleKeyDown}
            placeholder={archived ? 'Reply (this will stay archived)…' : 'Write a reply…'}
            className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={onSend}
            disabled={!value.trim()}
            aria-label="Send reply"
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background hover:bg-brand hover:text-white disabled:bg-muted disabled:text-muted-foreground transition-colors active:scale-95"
          >
            <ArrowUp size={15} />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
          <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> new line · <kbd className="font-mono">/</kbd> saved replies
        </p>
      </div>
    </div>
  );
}
