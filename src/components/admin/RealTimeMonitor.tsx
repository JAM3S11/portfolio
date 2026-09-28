import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Sparkles, Timer, Bell, ChevronLeft, AlertTriangle, AlertOctagon, CheckCircle2, Zap,
} from 'lucide-react';
import { subscribeToNewInteractions, type AIInteraction } from '@/lib/analytics-service';
import { evaluateInteraction } from '@/lib/alert-service';
import { INTENT_LABELS, formatRelativeTime, formatMs, latencyStatus } from '@/pages/admin/constants';
import MetricCard from './MetricCard';
import PerformanceChart from './PerformanceChart';

interface RealTimeMonitorProps {
  onBack?: () => void;
  initialConversationCount?: number;
  /** Hide the title bar when the admin shell provides a page header */
  embedded?: boolean;
}

interface LiveEvent {
  id: string;
  type: 'interaction' | 'alert';
  message: string;
  detail: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  latencyMs?: number;
  timestamp: string;
}

const SEVERITY: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  low: { label: 'Low', color: 'var(--muted-foreground)', icon: Bell },
  medium: { label: 'Medium', color: 'var(--status-warning)', icon: AlertTriangle },
  high: { label: 'High', color: 'var(--status-serious)', icon: AlertTriangle },
  critical: { label: 'Critical', color: 'var(--status-critical)', icon: AlertOctagon },
};

const STATUS_ICON = { good: CheckCircle2, warning: AlertTriangle, critical: AlertOctagon } as const;
const STATUS_COLOR = { good: 'var(--status-good)', warning: 'var(--status-warning)', critical: 'var(--status-critical)' } as const;

const MAX_POINTS = 30;

export default function RealTimeMonitor({ onBack, initialConversationCount = 0, embedded = false }: RealTimeMonitorProps) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [latencies, setLatencies] = useState<{ time: string; latency: number }[]>([]);
  const [answers, setAnswers] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [startedAt] = useState(() => new Date());

  useEffect(() => {
    const addEvent = (event: Omit<LiveEvent, 'id'> & { id?: string }) => {
      const ev: LiveEvent = { ...event, id: event.id ?? (crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`) };
      setEvents((prev) => [ev, ...prev].slice(0, 50));
    };

    return subscribeToNewInteractions((interaction: AIInteraction) => {
      const time = new Date(interaction.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLatencies((prev) => [...prev, { time, latency: interaction.latency_ms }].slice(-MAX_POINTS));
      setAnswers((n) => n + 1);
      setTotalTokens((n) => n + (interaction.total_tokens || 0));

      addEvent({
        type: 'interaction',
        message: interaction.intent_detected ? INTENT_LABELS[interaction.intent_detected] || interaction.intent_detected : 'AI answer',
        detail: `${interaction.model} · ${(interaction.total_tokens || 0).toLocaleString()} tokens`,
        latencyMs: interaction.latency_ms,
        timestamp: interaction.created_at || new Date().toISOString(),
      });

      const alert = evaluateInteraction(interaction);
      if (alert) {
        setAlertCount((n) => n + 1);
        addEvent({
          id: alert.id,
          type: 'alert',
          message: alert.message,
          detail: 'Alert raised',
          severity: alert.severity,
          timestamp: alert.created_at,
        });
      }
    });
  }, []);

  const latest = latencies[latencies.length - 1]?.latency;
  const avg = latencies.length ? Math.round(latencies.reduce((s, p) => s + p.latency, 0) / latencies.length) : 0;

  return (
    <div className="flex h-full flex-col">
      {!embedded && (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-border bg-card px-4 pt-4 pb-3">
          {onBack && (
            <button onClick={onBack} aria-label="Back" className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
              <ChevronLeft size={18} />
            </button>
          )}
          <h2 className="text-base font-semibold text-foreground">Live monitor</h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Listening since {startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>Figures below cover this session only</span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Conversations" value={initialConversationCount} icon={MessageCircle} sub="In the inbox" />
            <MetricCard label="AI answers" value={answers} icon={Sparkles} sub={`${totalTokens.toLocaleString()} tokens`} delay={0.04} />
            <MetricCard
              label="Latest response"
              value={latest !== undefined ? formatMs(latest) : '—'}
              icon={Timer}
              status={latest !== undefined ? latencyStatus(latest) : undefined}
              sub={latencies.length ? `avg ${formatMs(avg)}` : 'Waiting for an answer'}
              delay={0.08}
            />
            <MetricCard
              label="Alerts raised"
              value={alertCount}
              icon={Bell}
              status={alertCount > 0 ? { level: 'warning', label: 'Check Alerts' } : { level: 'good', label: 'All clear' }}
              delay={0.12}
            />
          </div>

          <PerformanceChart
            title="Response time"
            description={`Last ${MAX_POINTS} AI answers, live`}
            type="line"
            xKey="time"
            data={latencies}
            series={[{ key: 'latency', name: 'Response time', color: 'var(--viz-1)' }]}
            format={formatMs}
            height={200}
            emptyMessage="The chart fills in as visitors chat with the assistant."
          />

          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Activity</h3>
                <p className="text-xs text-muted-foreground">AI answers and alerts as they happen, newest first</p>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{events.length} events</span>
            </div>
            {events.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Zap size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">Waiting for activity</p>
                <p className="mt-1 text-xs text-muted-foreground">Keep this page open; events appear here in real time.</p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="sticky top-0 bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium md:px-5">When</th>
                      <th className="px-4 py-2 font-medium">Event</th>
                      <th className="px-4 py-2 font-medium">Detail</th>
                      <th className="px-4 py-2 font-medium md:px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <AnimatePresence initial={false}>
                      {events.map((ev) => {
                        const sev = ev.severity ? SEVERITY[ev.severity] : null;
                        const lat = ev.latencyMs !== undefined ? latencyStatus(ev.latencyMs) : null;
                        const StatusIcon = sev ? sev.icon : lat ? STATUS_ICON[lat.level] : null;
                        return (
                          <motion.tr
                            key={ev.id}
                            initial={{ opacity: 0, backgroundColor: 'var(--muted)' }}
                            animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                            transition={{ duration: 0.8 }}
                          >
                            <td className="whitespace-nowrap px-4 py-2 text-muted-foreground md:px-5">{formatRelativeTime(ev.timestamp)}</td>
                            <td className="px-4 py-2 font-medium text-foreground">
                              <span className="flex items-center gap-1.5">
                                {ev.type === 'alert' ? <Bell size={12} className="text-muted-foreground" /> : <Sparkles size={12} className="text-muted-foreground" />}
                                {ev.message}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">{ev.detail}</td>
                            <td className="whitespace-nowrap px-4 py-2 md:px-5">
                              {StatusIcon && (
                                <span className="flex items-center gap-1.5 text-foreground">
                                  <StatusIcon size={12} style={{ color: sev ? sev.color : STATUS_COLOR[lat!.level] }} aria-hidden="true" />
                                  {sev ? sev.label : `${formatMs(ev.latencyMs!)} · ${lat!.label}`}
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
