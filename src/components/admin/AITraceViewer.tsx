import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Clock, Cpu, BarChart3, Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConversationInteractions, type AIInteraction } from '@/lib/analytics-service';

interface AITraceViewerProps {
  conversationId: string;
}

const card = 'bg-card rounded-2xl p-4 border border-border';

export default function AITraceViewer({ conversationId }: AITraceViewerProps) {
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getConversationInteractions(conversationId).then((data) => {
      if (cancelled) return;
      setInteractions(data);
      setLoading(false);
    });
    // Ignore a slow response if the admin has already switched conversations
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  if (loading) {
    return (
      <div className={cn(card, 'space-y-2')}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className={card}>
        <p className="text-xs text-center py-4 text-muted-foreground">
          No AI trace data available for this conversation.
        </p>
      </div>
    );
  }

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-3">
        <Brain size={14} className="text-purple-500" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI Trace ({interactions.length})
        </p>
      </div>
      <div className="space-y-2">
        {interactions.map((interaction, idx) => {
          const isExpanded = expandedId === interaction.id;
          const latencyColor =
            interaction.latency_ms < 2000
              ? 'text-emerald-500'
              : interaction.latency_ms < 4000
                ? 'text-amber-500'
                : 'text-red-500';

          return (
            <div key={interaction.id} className="space-y-1">
              <button
                onClick={() => setExpandedId(isExpanded ? null : interaction.id ?? null)}
                aria-expanded={isExpanded}
                className={cn(
                  'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors',
                  isExpanded ? 'bg-purple-500/10' : 'hover:bg-muted/60'
                )}
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="flex-shrink-0 text-purple-500" />
                ) : (
                  <ChevronRight size={14} className="flex-shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-foreground">Interaction #{idx + 1}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(interaction.created_at || '').toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-medium', latencyColor)}>{interaction.latency_ms}ms</span>
                  <span className="text-[10px] text-muted-foreground">{interaction.total_tokens || '-'}tok</span>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden rounded-xl border border-border bg-muted/30"
                  >
                    <div className="p-3 space-y-3">
                      <MetadataRow icon={<Clock size={12} />} label="Latency" value={`${interaction.latency_ms}ms`} color={latencyColor} />
                      <MetadataRow icon={<Cpu size={12} />} label="Model" value={interaction.model} color="text-blue-500" />
                      <MetadataRow
                        icon={<BarChart3 size={12} />}
                        label="Tokens"
                        value={`${interaction.prompt_tokens || 0} prompt + ${interaction.completion_tokens || 0} completion = ${interaction.total_tokens || 0} total`}
                        color="text-violet-500"
                      />
                      {interaction.confidence_score != null && (
                        <MetadataRow
                          icon={<Brain size={12} />}
                          label="Confidence"
                          value={`${(interaction.confidence_score * 100).toFixed(1)}%`}
                          color="text-emerald-500"
                        />
                      )}

                      <TraceBlock label="Prompt">
                        {interaction.prompt.length > 500 ? `${interaction.prompt.slice(0, 500)}…` : interaction.prompt}
                      </TraceBlock>
                      <TraceBlock label="Response">{interaction.response}</TraceBlock>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TraceBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium mb-1 text-muted-foreground">{label}</p>
      <div className="p-2 rounded-lg text-[11px] leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap bg-background border border-border text-foreground/80">
        {children}
      </div>
    </div>
  );
}

function MetadataRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={color}>{icon}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn('text-[10px] font-medium ml-auto', color)}>{value}</span>
    </div>
  );
}
