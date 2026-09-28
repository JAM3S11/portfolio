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

// Tracks the visible viewport so the full-screen phone panel shrinks above the on-screen keyboard
// (iOS keeps `position: fixed; inset: 0` full height and hides the composer behind the keyboard).
const useVisualViewport = (enabled: boolean) => {
  const [viewport, setViewport] = useState<{ height: number; top: number } | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) return;
    const update = () => setViewport({ height: vv.height, top: vv.offsetTop });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return enabled ? viewport : null;
};

// True while a form field outside the chat has focus (e.g. the contact form), so the
// launcher can step aside instead of floating over the keyboard
const useOtherFieldFocused = () => {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const isOutsideField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches('input, textarea, select') && !el.closest('[data-chat-panel]');
    const onFocusIn = (e: FocusEvent) => setFocused(isOutsideField(e.target));
    const onFocusOut = () => setFocused(false);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return focused;
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
  const viewport = useVisualViewport(isOpen && !isDesktop);
  const otherFieldFocused = useOtherFieldFocused();

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

  // Focus the composer when the panel opens. Desktop only: on phones this would pop the
  // keyboard up over the suggested prompts before the visitor has seen them.
  useEffect(() => {
    if (!isOpen || !isDesktop) return;
    const id = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(id);
  }, [isOpen, isDesktop]);

  const scrollToBottom = useCallback((force = false) => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (force || nearBottom) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, isLoading, isOpen, scrollToBottom]);

  // Keep the latest message in view when the phone keyboard opens or closes
  useEffect(() => {
    if (viewport) scrollToBottom(true);
  }, [viewport?.height, scrollToBottom]); // eslint-disable-line react-hooks/exhaustive-deps

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
            aria-modal={!isDesktop || undefined}
            aria-label="James's AI assistant"
            data-chat-panel
            // Phones: slides up like a native sheet. Larger screens: a small pop from the launcher.
            initial={isDesktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: '100%' }}
            animate={isDesktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: '100%' }}
            transition={isDesktop ? { duration: 0.2, ease: 'easeOut' } : { type: 'spring', stiffness: 380, damping: 40 }}
            style={viewport ? { top: viewport.top, height: viewport.height, bottom: 'auto' } : undefined}
            className={cn(
              'fixed z-[70] flex flex-col overflow-hidden bg-card text-foreground shadow-2xl shadow-black/20',
              'inset-0 sm:inset-auto sm:rounded-2xl sm:border sm:border-border',
              isRight ? 'sm:right-6 origin-bottom-right' : 'sm:left-6 origin-bottom-left',
              expanded
                ? 'sm:top-4 sm:bottom-4 sm:w-[560px]'
                : 'sm:bottom-24 sm:h-[640px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px]'
            )}
          >
            {/* Header (clears the notch / status bar on phones) */}
            <div className="shrink-0 border-b border-border pt-[env(safe-area-inset-top)] sm:pt-0">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
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
                    className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
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
                    className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted transition-colors"
                  >
                    <X size={20} className="sm:size-[17px]" />
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
                        'relative rounded-md py-2 sm:py-1.5 text-[13px] sm:text-xs font-medium transition-colors',
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
            <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
              {messages.length === 0 ? (
                mode === 'chat' ? (
                  <div className="flex min-h-full flex-col justify-end gap-5">
                    <div>
                      <p className="text-xl sm:text-lg font-semibold tracking-tight">Hi, I'm James's assistant 👋</p>
                      <p className="mt-1 text-[15px] sm:text-sm text-muted-foreground leading-relaxed">
                        Ask about his projects, stack, experience or availability. I answer from his portfolio.
                      </p>
                    </div>
                    {/* Two columns even on phones, so all four prompts fit above the composer */}
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTED_PROMPTS.map(({ icon: Icon, text, intent }) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() => submit(text, intent)}
                          className="group flex min-h-[88px] flex-col items-start gap-2 rounded-xl border border-border bg-background p-3 text-left text-[13px] sm:text-sm hover:border-brand/40 hover:bg-muted/40 active:scale-[0.98] active:bg-muted/60 transition"
                        >
                          <Icon size={16} className="text-muted-foreground group-hover:text-brand transition-colors" />
                          <span className="leading-snug">{text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col justify-end gap-5">
                    <div>
                      <p className="text-xl sm:text-lg font-semibold tracking-tight">Go deeper into the engineering</p>
                      <p className="mt-1 text-[15px] sm:text-sm text-muted-foreground leading-relaxed">
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
                      <div className="flex flex-wrap gap-2 sm:pl-9">
                        {followUps.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => submit(f)}
                            className="rounded-full border border-border px-3.5 sm:px-3 py-2 sm:py-1 text-[13px] sm:text-xs text-muted-foreground hover:text-foreground hover:border-brand/40 active:bg-muted transition-colors"
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
            {/* Bottom padding clears the iPhone home indicator */}
            <div className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
              <div className="flex items-end gap-2 rounded-2xl sm:rounded-xl border border-border bg-background pl-3.5 pr-1.5 sm:px-3 py-1.5 sm:py-2 focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/10 transition">
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
                  enterKeyHint="send"
                  // 16px on phones prevents iOS Safari zooming the page on focus
                  className="max-h-[140px] flex-1 resize-none bg-transparent py-1.5 sm:py-1 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => submit(input)}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="flex h-10 w-10 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition hover:bg-brand hover:text-white active:scale-95 disabled:bg-muted disabled:text-muted-foreground"
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
      {/* Launcher + teaser. On phones it hides while the panel is open or another form field
          (e.g. the contact form) has the keyboard up. */}
      <div
        className={cn(
          'fixed bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 z-[60] flex flex-col gap-3',
          side,
          isRight ? 'items-end' : 'items-start',
          (isOpen || otherFieldFocused) && 'max-sm:hidden'
        )}
      >
        <AnimatePresence>
          {showTeaser && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="relative flex max-w-[calc(100vw-2rem)] sm:max-w-[240px] items-start gap-2 rounded-2xl sm:rounded-xl border border-border bg-card p-3.5 sm:p-3 pr-11 sm:pr-8 text-sm shadow-lg"
            >
              <button type="button" onClick={open} className="text-left">
                <span className="font-medium text-foreground">Questions about my work?</span>
                <span className="block text-xs text-muted-foreground mt-0.5">Ask my AI assistant anything.</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowTeaser(false); setFlag(TEASER_KEY); }}
                aria-label="Dismiss"
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center rounded-full sm:rounded sm:p-0.5 text-muted-foreground hover:text-foreground active:bg-muted"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round icon button on phones, labelled pill from sm up */}
        <motion.button
          ref={launcherRef}
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => (isOpen ? close() : open())}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close AI assistant' : 'Ask AI assistant'}
          className="group flex h-14 w-14 sm:h-12 sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-foreground sm:pl-4 sm:pr-3 text-sm font-medium text-background shadow-lg shadow-black/25 hover:bg-brand hover:text-white transition-colors"
        >
          {isOpen ? <X size={16} /> : <Sparkles size={20} className="sm:size-4" />}
          <span className="hidden sm:inline">{isOpen ? 'Close' : 'Ask AI'}</span>
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
  <div className={cn('grid grid-cols-2 gap-2', compact && 'sm:pl-9')}>
    {DEEP_DIVE_OPTIONS.map(({ focus, label, desc, icon: Icon }) => (
      <button
        key={focus}
        type="button"
        onClick={() => onPick(focus, `${label} deep dive`)}
        className={cn(
          'group flex gap-2.5 sm:gap-3 rounded-xl border border-border bg-background p-3 text-left hover:border-cyan-500/40 hover:bg-muted/40 active:scale-[0.98] active:bg-muted/60 transition',
          compact ? 'items-center' : 'min-h-[88px] flex-col sm:flex-row items-start'
        )}
      >
        <Icon size={16} className="sm:mt-0.5 shrink-0 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
        <span>
          <span className="block text-[13px] sm:text-sm font-medium leading-snug">{label}</span>
          {!compact && <span className="block text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-0">{desc}</span>}
        </span>
      </button>
    ))}
  </div>
);
