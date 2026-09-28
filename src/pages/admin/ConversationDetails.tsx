import { useEffect, useState } from 'react';
import {
  Archive, ArchiveRestore, Trash2, Copy, Check, ThumbsUp, ThumbsDown, ChevronDown, Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConversationFeedback } from '@/lib/analytics-service';
import AITraceViewer from '@/components/admin/AITraceViewer';
import { INTENT_LABELS, INTENT_COLORS, formatRelativeTime, displayName, avatarInitial } from './constants';
import type { ConvoItem, MessageItem } from './types';

interface ConversationDetailsProps {
  item: ConvoItem;
  messages: MessageItem[];
  isLive: boolean;
  onArchive: (item: ConvoItem) => void;
  onDelete: (item: ConvoItem, e: React.MouseEvent) => void;
}

// Right-hand panel in the inbox: facts and actions for the open conversation
export default function ConversationDetails({ item, messages, isLive, onArchive, onDelete }: ConversationDetailsProps) {
  const { conversation } = item;
  const archived = conversation.status === 'archived';
  const [feedback, setFeedback] = useState<{ up: number; down: number } | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!isLive) return;
    let cancelled = false;
    getConversationFeedback(conversation.id).then((result) => {
      if (!cancelled) setFeedback(result);
    });
    return () => {
      cancelled = true;
      setFeedback(null);
    };
  }, [conversation.id, isLive]);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const count = (sender: MessageItem['sender']) => messages.filter((m) => m.sender === sender).length;
  const lastActivity = messages[messages.length - 1]?.created_at || item.latestMessage?.created_at || conversation.created_at;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Identity */}
        <div className="flex flex-col items-center border-b border-border px-5 py-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted ring-1 ring-border">
            <span className="text-lg font-semibold text-muted-foreground">{avatarInitial(conversation)}</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{displayName(conversation)}</p>
          {conversation.visitor_email ? (
            <button
              onClick={() => copy(conversation.visitor_email!, 'email')}
              className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {conversation.visitor_email}
              {copied === 'email' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            </button>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">No email shared</p>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {conversation.visitor_intent && INTENT_LABELS[conversation.visitor_intent] && (
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', INTENT_COLORS[conversation.visitor_intent])}>
                {INTENT_LABELS[conversation.visitor_intent]}
              </span>
            )}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                archived ? 'bg-muted text-muted-foreground' : 'bg-green-500/15 text-green-700 dark:text-green-400'
              )}
            >
              {archived ? 'Archived' : 'Open'}
            </span>
          </div>
        </div>

        {/* Facts */}
        <dl className="space-y-3 border-b border-border px-5 py-4 text-xs">
          <Fact label="Started">
            {new Date(conversation.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </Fact>
          <Fact label="Last activity">{formatRelativeTime(lastActivity)}</Fact>
          <Fact label="Messages">
            <span className="tabular-nums">
              {count('visitor')} visitor · {count('ai')} AI{count('you') > 0 ? ` · ${count('you')} you` : ''}
            </span>
          </Fact>
          <Fact label="Answer feedback">
            {!isLive ? (
              <span className="text-muted-foreground">Demo mode</span>
            ) : feedback === null ? (
              <span className="text-muted-foreground">Loading…</span>
            ) : feedback.up + feedback.down === 0 ? (
              <span className="text-muted-foreground">No ratings yet</span>
            ) : (
              <span className="flex items-center gap-2.5 tabular-nums">
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><ThumbsUp size={12} /> {feedback.up}</span>
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><ThumbsDown size={12} /> {feedback.down}</span>
              </span>
            )}
          </Fact>
          <Fact label="Conversation ID">
            <button
              onClick={() => copy(conversation.id, 'id')}
              title="Copy conversation ID"
              className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              {conversation.id.slice(0, 8)}…
              {copied === 'id' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            </button>
          </Fact>
        </dl>

        {/* AI trace (collapsible) */}
        <div className="border-b border-border">
          <button
            onClick={() => setShowTrace((v) => !v)}
            aria-expanded={showTrace}
            className="flex w-full items-center justify-between px-5 py-3 text-xs font-medium text-foreground hover:bg-muted/40"
          >
            <span className="flex items-center gap-2">
              <Brain size={14} className="text-purple-500" />
              AI trace
            </span>
            <ChevronDown size={14} className={cn('text-muted-foreground transition-transform', showTrace && 'rotate-180')} />
          </button>
          {showTrace && (
            <div className="px-3 pb-3">
              <AITraceViewer conversationId={conversation.id} />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-1.5 border-t border-border p-3">
        <button
          onClick={() => onArchive(item)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          {archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          {archived ? 'Move to inbox' : 'Archive conversation'}
        </button>
        <button
          onClick={(e) => onDelete(item, e)}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={14} />
          Delete conversation
        </button>
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-foreground">{children}</dd>
    </div>
  );
}
