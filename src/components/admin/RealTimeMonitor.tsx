import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, MessageCircle, Zap, ChevronLeft, Gauge,
} from 'lucide-react';
import { subscribeToNewInteractions, type AIInteraction } from '@/lib/analytics-service';
import { evaluateInteraction } from '@/lib/alert-service';
import { formatRelativeTime } from '@/pages/admin/constants';
import MetricCard from './MetricCard';

interface RealTimeMonitorProps {
  isDarkMode: boolean;
  onBack?: () => void;
  initialConversationCount?: number;
}

interface LiveEvent {
  id: string;
  type: 'conversation' | 'interaction' | 'alert';
  message: string;
  detail: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export default function RealTimeMonitor({ isDarkMode, onBack, initialConversationCount = 0 }: RealTimeMonitorProps) {
  const dk = isDarkMode;
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = dk ? 'text-white' : 'text-gray-900';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';

  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [currentLatency, setCurrentLatency] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [activeConvos, setActiveConvos] = useState(initialConversationCount);
  const [errorCount, setErrorCount] = useState(0);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  useEffect(() => {
    const unsubInteractions = subscribeToNewInteractions((interaction: AIInteraction) => {
      setCurrentLatency(interaction.latency_ms);
      setTotalTokens((p) => p + (interaction.total_tokens || 0));

      addEvent({
        type: 'interaction',
        message: `AI response: ${interaction.latency_ms}ms`,
        detail: `${interaction.total_tokens || 0} tokens used`,
        timestamp: new Date().toISOString(),
      });

      const alert = evaluateInteraction(interaction);
      if (alert) {
        setErrorCount((p) => p + 1);
        addEvent({
          id: alert.id,
          type: 'alert',
          message: alert.message,
          detail: `Severity: ${alert.severity}`,
          severity: alert.severity,
          timestamp: alert.created_at,
        });
      }
    });

    return () => {
      unsubInteractions();
    };
  }, []);

  function addEvent(event: Omit<LiveEvent, 'id'>) {
    const ev: LiveEvent = {
      ...event,
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    };
    setEvents((prev) => [ev, ...prev].slice(0, 50));
  }

  const latencyColor =
    currentLatency === 0
      ? 'text-gray-400'
      : currentLatency < 2000
        ? 'text-emerald-500'
        : currentLatency < 4000
          ? 'text-amber-500'
          : 'text-red-500';

  const severityColors: Record<string, string> = {
    low: 'border-l-emerald-500',
    medium: 'border-l-amber-500',
    high: 'border-l-orange-500',
    critical: 'border-l-red-500',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    conversation: <MessageCircle size={14} className="text-blue-500" />,
    interaction: <Zap size={14} className="text-violet-500" />,
    alert: <AlertTriangle size={14} className="text-red-500" />,
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`px-4 pt-4 pb-3 ${surface} border-b ${border} flex-shrink-0 flex items-center gap-2`}
      >
        {onBack && (
          <button
            onClick={onBack}
            className={`md:hidden p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft size={18} className={textMuted} />
          </button>
        )}
        <Activity size={16} className="text-emerald-500" />
        <h2 className={`text-base font-semibold ${textPrimary}`}>Live Monitor</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Active Conversations"
            value={activeConvos}
            icon={MessageCircle}
            color="blue"
            isDarkMode={dk}
          />
          <MetricCard
            label="Total Tokens"
            value={totalTokens.toLocaleString()}
            icon={Zap}
            color="violet"
            isDarkMode={dk}
          />
        </div>

        {/* Latency gauge */}
        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge size={14} className={textMuted} />
              <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                Current Latency
              </p>
            </div>
            <span className={`text-lg font-bold ${latencyColor}`}>
              {currentLatency > 0 ? `${currentLatency}ms` : '--'}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <motion.div
              className={`h-full rounded-full transition-colors ${
                currentLatency < 2000
                  ? 'bg-emerald-500'
                  : currentLatency < 4000
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              initial={{ width: '0%' }}
              animate={{
                width: `${Math.min((currentLatency / 5000) * 100, 100)}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className={`text-[10px] ${textMuted}`}>0ms</span>
            <span className={`text-[10px] ${textMuted}`}>2.5s</span>
            <span className={`text-[10px] ${textMuted}`}>5s+</span>
          </div>
        </div>

        {/* Live event feed */}
        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              Live Feed
            </p>
            {errorCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-500">
                {errorCount} alerts
              </span>
            )}
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <p className={`text-xs py-8 text-center ${textMuted}`}>
                Waiting for activity...
              </p>
            ) : (
              <AnimatePresence>
                {events.map((ev) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2.5 py-2 px-2.5 rounded-lg border-l-2 ${
                      ev.type === 'alert'
                        ? severityColors[ev.severity || 'low']
                        : 'border-l-transparent'
                    } ${dk ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50'}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {typeIcons[ev.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${textPrimary}`}>
                        {ev.message}
                      </p>
                      <p className={`text-[10px] ${textMuted}`}>{ev.detail}</p>
                    </div>
                    <span className={`text-[10px] flex-shrink-0 ${textMuted}`}>
                      {formatRelativeTime(ev.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={eventsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
