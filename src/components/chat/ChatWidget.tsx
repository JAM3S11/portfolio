import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, X, ArrowUp, RotateCcw, Maximize2, Minimize2,
  Briefcase, Layers, Code2, Handshake, Server, Boxes,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useViewport, useBodyScrollLock } from '@/hooks';
import ChatMessage from './ChatMessage';
import { useChat, type DeepFocus } from './useChat';

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
}

const SUGGESTED_PROMPTS = [
  { icon: Briefcase, text: 'Is James open to new roles?', intent: 'hiring' },
  { icon: Layers, text: 'What has he built recently?', intent: 'faq' },
  { icon: Code2, text: "What's his tech stack?", intent: 'tech' },
  { icon: Handshake, text: 'Can he quote a project for me?', intent: 'quote' },
];

const DEEP_DIVE_OPTIONS: { focus: DeepFocus; label: string; desc: string; icon: typeof Code2 }[] = [
  { focus: 'frontend', label: 'Frontend', desc: 'Components, state, styling', icon: Code2 },
  { focus: 'backend', label: 'Backend', desc: 'APIs, databases, auth', icon: Server },
  { focus: 'fullstack', label: 'Full-stack', desc: 'Data flow end to end', icon: Layers },
  { focus: 'software', label: 'Software engineering', desc: 'Design, testing, trade-offs', icon: Boxes },
];

const FOLLOW_UPS = ['Tell me about SOLEASE', "What's his experience?", 'How can I contact him?', 'What is he working on now?'];

const TEASER_KEY = 'jdg-chat-teaser-seen';
const TEASER_DELAY_MS = 8000;
const MAX_INPUT = 1000;

const readFlag = (key: string) => {
  try { return sessionStorage.getItem(key) === '1'; } catch { return false; }
};
const setFlag = (key: string) => {
  try { sessionStorage.setItem(key, '1'); } catch { /* storage unavailable */ }
};

const TypingIndicator = () => (
  <div className="flex items-center gap-3" aria-label="Assistant is typing">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-brand text-white">
      <Sparkles size={12} />
    </span>
    <div className="flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">Thinking…</span>
    </div>
  </div>
);

export default function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const chat = useChat();
  const { messages, mode, deepFocus, isLoading, isSupabase } = chat;

  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [showTeaser, setShowTeaser] = useState(false);

  const isDesktop = useViewport(640);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const isRight = position === 'bottom-right';
  const isAnimating = messages.some((m) => m.animate);
  const lastMessage = messages[messages.length - 1];
  const askedPrompts = new Set(messages.filter((m) => m.role === 'visitor').map((m) => m.content));
  const followUps = FOLLOW_UPS.filter((f) => !askedPrompts.has(f)).slice(0, 3);
  const activeFocus = DEEP_DIVE_OPTIONS.find((o) => o.focus === deepFocus);

  // Full-screen sheet on phones, so stop the page scrolling behind it
  useBodyScrollLock(isOpen && !isDesktop);

  const open = useCallback(() => {
    setIsOpen(true);
    setShowTeaser(false);
    setFlag(TEASER_KEY);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    launcherRef.current?.focus();
  }, []);

  // One-time teaser for visitors who haven't opened the assistant
  useEffect(() => {
    if (readFlag(TEASER_KEY)) return;
    const id = setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  // ⌘K / Ctrl+K toggles, Escape closes
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) close();
        else open();
      } else if (e.key === 'Escape' && isOpen) {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, open, close]);

  // Focus the composer when the panel opens
  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(id);
  }, [isOpen]);

  const scrollToBottom = useCallback((force = false) => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (force || nearBottom) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, isLoading, isOpen, scrollToBottom]);

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const submit = (text: string, intent: string | null = null) => {
    if (!text.trim() || isLoading) return;
    chat.send(text, intent);
    setInput('');
    requestAnimationFrame(resizeInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  };

  const side = isRight ? 'right-4 sm:right-6' : 'left-4 sm:left-6';

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="James's AI assistant"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed z-[70] flex flex-col overflow-hidden bg-card text-foreground shadow-2xl shadow-black/20',
              'inset-0 sm:inset-auto sm:rounded-2xl sm:border sm:border-border',
              isRight ? 'sm:right-6 origin-bottom-right' : 'sm:left-6 origin-bottom-left',
              expanded
                ? 'sm:top-4 sm:bottom-4 sm:w-[560px]'
                : 'sm:bottom-24 sm:h-[640px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px]'
            )}
          >
            {/* Header */}
            <div className="border-b border-border">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-brand text-white shadow-[0_0_16px_rgba(56,189,248,0.35)]">
                    <Sparkles size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">James's AI assistant</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn('h-1.5 w-1.5 rounded-full', isSupabase ? 'bg-green-500' : 'bg-amber-500')} />
                      {mode === 'deep' && activeFocus
                        ? `Deep dive · ${activeFocus.label}`
                        : isSupabase ? 'Online' : 'Demo mode'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={chat.reset}
                    disabled={messages.length === 0 || isLoading}
                    aria-label="Start a new chat"
                    title="New chat"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
                    title={expanded ? 'Collapse' : 'Expand'}
                    className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close assistant"
                    title="Close (Esc)"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="px-4 pb-3">
                <div role="tablist" aria-label="Assistant mode" className="isolate grid grid-cols-2 gap-1 rounded-lg bg-muted/60 p-1">
                  {(['chat', 'deep'] as const).map((m) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => chat.switchMode(m)}
                      className={cn(
                        'relative rounded-md py-1.5 text-xs font-medium transition-colors',
                        mode === m ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {mode === m && (
                        <motion.span
                          layoutId="chat-mode-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 -z-10 rounded-md bg-background shadow-sm ring-1 ring-border"
                        />
                      )}
                      {m === 'chat' ? 'Chat' : 'Deep dive'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
              {messages.length === 0 ? (
                mode === 'chat' ? (
                  <div className="flex h-full flex-col justify-end gap-5">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">Hi, I'm James's assistant 👋</p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        Ask about his projects, stack, experience or availability. I answer from his portfolio.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {SUGGESTED_PROMPTS.map(({ icon: Icon, text, intent }) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() => submit(text, intent)}
                          className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-3 text-left text-sm hover:border-brand/40 hover:bg-muted/40 transition-colors"
                        >
                          <Icon size={16} className="text-muted-foreground group-hover:text-brand transition-colors" />
                          <span className="leading-snug">{text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-end gap-5">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">Go deeper into the engineering</p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        Pick an area and ask about architecture, trade-offs and implementation details across James's projects.
                      </p>
                    </div>
                    <DeepDivePicker onPick={chat.startDeepDive} />
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  {messages.map((m) => (
                    <ChatMessage
                      key={m.id}
                      message={m}
                      onRate={chat.rate}
                      onAnimationDone={chat.finishAnimation}
                      onGrow={() => scrollToBottom()}
                      onContact={close}
                    />
                  ))}

                  {isLoading && <TypingIndicator />}

                  {/* Next steps under the latest answer */}
                  {!isLoading && !isAnimating && lastMessage?.role === 'bot' && (
                    mode === 'deep' && !deepFocus ? (
                      <DeepDivePicker onPick={chat.startDeepDive} compact />
                    ) : mode === 'chat' && followUps.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pl-9">
                        {followUps.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => submit(f)}
                            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/10 transition">
                <label htmlFor="chat-input" className="sr-only">Message</label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={MAX_INPUT}
                  onChange={(e) => { setInput(e.target.value); resizeInput(); }}
                  onKeyDown={handleKeyDown}
                  placeholder={mode === 'deep' && activeFocus ? `Ask about ${activeFocus.label.toLowerCase()} internals…` : 'Ask anything…'}
                  className="max-h-[140px] flex-1 resize-none bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => submit(input)}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-brand hover:text-white disabled:bg-muted disabled:text-muted-foreground"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
              <p className="mt-2 px-1 text-[11px] text-muted-foreground">
                AI can make mistakes. For anything important,{' '}
                <a href="#contact" onClick={close} className="text-foreground underline underline-offset-2 hover:text-brand">
                  talk to James
                </a>
                .
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher + teaser */}
      <div className={cn('fixed bottom-4 sm:bottom-6 z-[60] flex flex-col gap-3', side, isRight ? 'items-end' : 'items-start', isOpen && 'hidden sm:flex')}>
        <AnimatePresence>
          {showTeaser && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="relative flex max-w-[240px] items-start gap-2 rounded-xl border border-border bg-card p-3 pr-8 text-sm shadow-lg"
            >
              <button type="button" onClick={open} className="text-left">
                <span className="font-medium text-foreground">Questions about my work?</span>
                <span className="block text-xs text-muted-foreground mt-0.5">Ask my AI assistant anything.</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowTeaser(false); setFlag(TEASER_KEY); }}
                aria-label="Dismiss"
                className="absolute top-2 right-2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={launcherRef}
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => (isOpen ? close() : open())}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
          className="group flex h-12 items-center gap-2 rounded-full border border-border bg-foreground pl-4 pr-3 text-sm font-medium text-background shadow-lg shadow-black/20 hover:bg-brand hover:text-white transition-colors"
        >
          {isOpen ? <X size={16} /> : <Sparkles size={16} />}
          <span>{isOpen ? 'Close' : 'Ask AI'}</span>
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-background/20 px-1.5 py-0.5 font-mono text-[10px] opacity-70 group-hover:border-white/30">
            ⌘K
          </kbd>
        </motion.button>
      </div>
    </>
  );
}

const DeepDivePicker = ({
  onPick,
  compact = false,
}: {
  onPick: (focus: DeepFocus, label: string) => void;
  compact?: boolean;
}) => (
  <div className={cn('grid gap-2', compact ? 'grid-cols-2 pl-9' : 'grid-cols-1 sm:grid-cols-2')}>
    {DEEP_DIVE_OPTIONS.map(({ focus, label, desc, icon: Icon }) => (
      <button
        key={focus}
        type="button"
        onClick={() => onPick(focus, `${label} deep dive`)}
        className="group flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-left hover:border-cyan-500/40 hover:bg-muted/40 transition-colors"
      >
        <Icon size={16} className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
        <span>
          <span className="block text-sm font-medium leading-snug">{label}</span>
          {!compact && <span className="block text-xs text-muted-foreground">{desc}</span>}
        </span>
      </button>
    ))}
  </div>
);
