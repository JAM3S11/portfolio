import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, Check, ThumbsUp, ThumbsDown, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ChatMessage as Message } from './useChat';

interface ChatMessageProps {
  message: Message;
  onRate: (id: string, value: 'up' | 'down') => void;
  onAnimationDone: (id: string) => void;
  onGrow: () => void;
  onContact: () => void;
}

const REVEAL_MS = 1200;
const TICK_MS = 24;

// Markdown styled to match the site (no typography plugin needed). Also used by the admin inbox.
export const markdownComponents = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-3 last:mb-0" {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-foreground" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="mb-3 last:mb-0 space-y-1 pl-4 list-disc marker:text-cyan-500" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="mb-3 last:mb-0 space-y-1 pl-4 list-decimal marker:text-muted-foreground" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-brand underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="mb-3 overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 text-xs [&_code]:bg-transparent [&_code]:p-0" {...props} />
  ),
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <p className="mb-2 font-semibold text-foreground" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <p className="mb-2 font-semibold text-foreground" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <p className="mb-2 font-semibold text-foreground" {...props} />,
  // GFM tables scroll sideways instead of stretching the chat on narrow screens
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="mb-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-xs [&_td]:px-2.5 [&_td]:py-1.5 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:font-semibold [&_tr]:border-b [&_tr]:border-border" {...props} />
    </div>
  ),
};

// Reveals text in small chunks so replies feel streamed
const useTypewriter = (text: string, active: boolean, onDone: () => void, onTick: () => void) => {
  const [shown, setShown] = useState(active ? 0 : text.length);
  const shownRef = useRef(shown);

  useEffect(() => {
    if (!active) return;
    const step = Math.max(2, Math.ceil(text.length / (REVEAL_MS / TICK_MS)));
    const id = setInterval(() => {
      const next = Math.min(text.length, shownRef.current + step);
      shownRef.current = next;
      setShown(next);
      onTick();
      if (next >= text.length) {
        clearInterval(id);
        onDone();
      }
    }, TICK_MS);
    return () => clearInterval(id);
    // Only run when a new reveal starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, text]);

  return active ? text.slice(0, shown) : text;
};

const ActionButton = ({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cn(
      'flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-md transition-colors active:bg-muted disabled:cursor-default',
      active ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted disabled:hover:bg-transparent'
    )}
  >
    {children}
  </button>
);

export default function ChatMessage({ message, onRate, onAnimationDone, onGrow, onContact }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const text = useTypewriter(message.content, !!message.animate, () => onAnimationDone(message.id), onGrow);

  if (message.role === 'visitor') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[88%] sm:max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-muted px-3.5 py-2.5 text-[15px] sm:text-sm text-foreground">
          {message.content}
        </div>
      </motion.div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; nothing else to do
    }
  };

  const whatsappUrl = import.meta.env.VITE_WHATSAPP_URL as string | undefined;
  const isJames = message.from === 'james';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="group flex gap-2.5 sm:gap-3">
      {isJames ? (
        <img src="/PASSPORTJDG.png" alt="" className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-border" />
      ) : (
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-brand text-white">
          <Sparkles size={12} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        {isJames && (
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            James
            <span className="rounded-full bg-green-500/15 px-1.5 py-px text-[10px] font-medium text-green-700 dark:text-green-400">
              Human
            </span>
          </p>
        )}
        <div className="text-[15px] sm:text-sm leading-relaxed text-foreground/90 break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {text}
          </ReactMarkdown>
        </div>

        {!message.animate && (
          <>
            {message.handoff && (
              <div className="mt-3 rounded-2xl sm:rounded-xl border border-border bg-background p-3">
                <p className="text-[13px] sm:text-xs text-muted-foreground mb-2.5">Prefer to talk to James directly?</p>
                {/* Full-width stacked buttons on phones, inline pills from sm up */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 sm:h-auto items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-foreground px-3 sm:py-1.5 text-sm sm:text-xs font-medium text-background hover:bg-brand hover:text-white active:scale-[0.98] transition"
                    >
                      <MessageCircle size={14} /> Continue on WhatsApp
                    </a>
                  )}
                  <a
                    href="#contact"
                    onClick={onContact}
                    className="inline-flex h-11 sm:h-auto items-center justify-center gap-1.5 rounded-xl sm:rounded-full border border-border px-3 sm:py-1.5 text-sm sm:text-xs font-medium text-foreground hover:border-brand/50 active:bg-muted transition"
                  >
                    <Mail size={13} /> Send a message
                  </a>
                </div>
              </div>
            )}

            {/* Always fully visible on touch screens (no hover to reveal them) */}
            <div className="mt-1 sm:mt-1.5 -ml-2 sm:ml-0 flex items-center gap-0.5 sm:opacity-60 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <ActionButton label={copied ? 'Copied' : 'Copy response'} onClick={copy}>
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </ActionButton>
              {/* Ratings measure the AI, so they're hidden on James's own replies */}
              {!isJames && (
                <>
                  <ActionButton
                    label="Helpful"
                    onClick={() => onRate(message.id, 'up')}
                    active={message.feedback === 'up'}
                    disabled={!!message.feedback}
                  >
                    <ThumbsUp size={14} />
                  </ActionButton>
                  <ActionButton
                    label="Not helpful"
                    onClick={() => onRate(message.id, 'down')}
                    active={message.feedback === 'down'}
                    disabled={!!message.feedback}
                  >
                    <ThumbsDown size={14} />
                  </ActionButton>
                  {message.feedback && (
                    <span className="ml-1.5 text-[11px] text-muted-foreground">Thanks for the feedback</span>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
