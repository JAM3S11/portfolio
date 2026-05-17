import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Clock, Cpu, BarChart3, Brain,
} from 'lucide-react';
import { getConversationInteractions, type AIInteraction } from '@/lib/analytics-service';

interface AITraceViewerProps {
  conversationId: string;
  isDarkMode: boolean;
}

export default function AITraceViewer({ conversationId, isDarkMode }: AITraceViewerProps) {
  const dk = isDarkMode;
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = dk ? 'text-white' : 'text-gray-900';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';

  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInteractions();
  }, [conversationId]);

  async function loadInteractions() {
    setLoading(true);
    const data = await getConversationInteractions(conversationId);
    setInteractions(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className={`${surface} rounded-2xl p-4 border ${border} space-y-2`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-12 rounded-xl ${dk ? 'bg-gray-800' : 'bg-gray-100'} animate-pulse`}
          />
        ))}
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className={`${surface} rounded-2xl p-4 border ${border}`}>
        <p className={`text-xs text-center py-4 ${textMuted}`}>
          No AI trace data available for this conversation.
        </p>
      </div>
    );
  }

  return (
    <div className={`${surface} rounded-2xl p-4 border ${border}`}>
      <div className="flex items-center gap-2 mb-3">
        <Brain size={14} className="text-purple-500" />
        <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
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
                onClick={() =>
                  setExpandedId(isExpanded ? null : interaction.id)
                }
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors ${
                  isExpanded
                    ? dk
                      ? 'bg-purple-900/10'
                      : 'bg-purple-50'
                    : dk
                      ? 'hover:bg-gray-800/60'
                      : 'hover:bg-gray-50'
                }`}
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="flex-shrink-0 text-purple-500" />
                ) : (
                  <ChevronRight size={14} className={`flex-shrink-0 ${textMuted}`} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${textPrimary}`}>
                    Interaction #{idx + 1}
                  </p>
                  <p className={`text-[10px] ${textMuted}`}>
                    {new Date(interaction.created_at || '').toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium ${latencyColor}`}>
                    {interaction.latency_ms}ms
                  </span>
                  <span className={`text-[10px] ${textMuted}`}>
                    {interaction.total_tokens || '-'}tok
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`overflow-hidden rounded-xl border ${border} ${
                      dk ? 'bg-gray-900/50' : 'bg-gray-50/50'
                    }`}
                  >
                    <div className="p-3 space-y-3">
                      <MetadataRow
                        icon={<Clock size={12} />}
                        label="Latency"
                        value={`${interaction.latency_ms}ms`}
                        color={latencyColor}
                        dk={dk}
                      />
                      <MetadataRow
                        icon={<Cpu size={12} />}
                        label="Model"
                        value={interaction.model}
                        color="text-blue-500"
                        dk={dk}
                      />
                      <MetadataRow
                        icon={<BarChart3 size={12} />}
                        label="Tokens"
                        value={`${interaction.prompt_tokens || 0} prompt + ${interaction.completion_tokens || 0} completion = ${interaction.total_tokens || 0} total`}
                        color="text-violet-500"
                        dk={dk}
                      />
                      {interaction.confidence_score != null && (
                        <MetadataRow
                          icon={<Brain size={12} />}
                          label="Confidence"
                          value={`${(interaction.confidence_score * 100).toFixed(1)}%`}
                          color="text-emerald-500"
                          dk={dk}
                        />
                      )}

                      <div>
                        <p className={`text-[10px] font-medium mb-1 ${textMuted}`}>Prompt</p>
                        <div
                          className={`p-2 rounded-lg text-[11px] leading-relaxed max-h-24 overflow-y-auto ${
                            dk ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                          }`}
                        >
                          {interaction.prompt.length > 500
                            ? `${interaction.prompt.slice(0, 500)}\u2026`
                            : interaction.prompt}
                        </div>
                      </div>

                      <div>
                        <p className={`text-[10px] font-medium mb-1 ${textMuted}`}>Response</p>
                        <div
                          className={`p-2 rounded-lg text-[11px] leading-relaxed max-h-24 overflow-y-auto ${
                            dk ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                          }`}
                        >
                          {interaction.response}
                        </div>
                      </div>
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

function MetadataRow({
  icon,
  label,
  value,
  color,
  dk,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  dk: boolean;
}) {
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';
  return (
    <div className="flex items-center gap-2">
      <span className={color}>{icon}</span>
      <span className={`text-[10px] ${textMuted}`}>{label}</span>
      <span className={`text-[10px] font-medium ${color} ml-auto`}>{value}</span>
    </div>
  );
}
