import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft, MessageCircle, Sparkles, Timer, ThumbsUp, ThumbsDown, CheckCircle2, AlertTriangle, AlertOctagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getAggregatedMetrics,
  getLatencyTimeseries,
  getTokenTimeseries,
  getConversationAnalytics,
  getFeedbackMetrics,
  getRecentInteractions,
  subscribeToNewInteractions,
  type AIInteraction,
  type AggregatedMetrics,
} from '@/lib/analytics-service';
import { INTENT_LABELS, formatRelativeTime, formatMs, latencyStatus } from '@/pages/admin/constants';
import MetricCard from './MetricCard';
import PerformanceChart from './PerformanceChart';

type DateRange = '7d' | '30d' | '90d';

interface AnalyticsDashboardProps {
  onBack?: () => void;
  /** Hide the title row when the admin shell provides a page header */
  embedded?: boolean;
}

const RANGES: { id: DateRange; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
];

const EMPTY_METRICS: AggregatedMetrics = {
  avg_latency_ms: 0, p95_latency_ms: 0, total_tokens: 0, avg_confidence: 0,
  total_interactions: 0, error_count: 0, error_rate: 0,
};

const ORDINAL = ['var(--viz-ord-1)', 'var(--viz-ord-2)', 'var(--viz-ord-3)', 'var(--viz-ord-4)', 'var(--viz-ord-5)'];

const STATUS_ICON = { good: CheckCircle2, warning: AlertTriangle, critical: AlertOctagon } as const;
const STATUS_COLOR = { good: 'var(--status-good)', warning: 'var(--status-warning)', critical: 'var(--status-critical)' } as const;

export default function AnalyticsDashboard({ onBack, embedded = false }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AggregatedMetrics>(EMPTY_METRICS);
  const [latencyData, setLatencyData] = useState<{ date: string; avg: number; p95: number }[]>([]);
  const [tokenData, setTokenData] = useState<{ date: string; prompt: number; completion: number; total: number }[]>([]);
  const [convAnalytics, setConvAnalytics] = useState({
    dailyCounts: [] as { date: string; count: number }[],
    intentDistribution: [] as { intent: string; count: number }[],
    statusDistribution: [] as { status: string; count: number }[],
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
  });
  const [feedback, setFeedback] = useState({
    averageRating: 0,
    totalFeedback: 0,
    ratingDistribution: [] as { rating: number; count: number }[],
  });
  const [recent, setRecent] = useState<AIInteraction[]>([]);

  const loadAll = useCallback(async (range: DateRange) => {
    setLoading(true);
    const [agg, lat, tok, conv, fb, rec] = await Promise.all([
      getAggregatedMetrics(range),
      getLatencyTimeseries(range),
      getTokenTimeseries(range),
      getConversationAnalytics(range),
      getFeedbackMetrics(range),
      getRecentInteractions(25),
    ]);
    setMetrics(agg);
    setLatencyData(lat);
    setTokenData(tok);
    setConvAnalytics(conv);
    setFeedback(fb);
    setRecent(rec);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll(dateRange);
  }, [dateRange, loadAll]);

  // New AI answers stream into the headline numbers and the interactions table
  useEffect(() => {
    return subscribeToNewInteractions((interaction) => {
      setMetrics((prev) => {
        const total = prev.total_interactions + 1;
        return {
          ...prev,
          avg_latency_ms: Math.round((prev.avg_latency_ms * prev.total_interactions + interaction.latency_ms) / total),
          total_tokens: prev.total_tokens + (interaction.total_tokens || 0),
          total_interactions: total,
        };
      });
      setRecent((prev) => [interaction, ...prev].slice(0, 25));
    });
  }, []);

  // The widget stores 👍 as 5 and 👎 as 1
  const satisfaction = useMemo(() => {
    const up = feedback.ratingDistribution.filter((r) => r.rating >= 4).reduce((s, r) => s + r.count, 0);
    const down = feedback.ratingDistribution.filter((r) => r.rating <= 2).reduce((s, r) => s + r.count, 0);
    return { up, down, pct: up + down > 0 ? Math.round((up / (up + down)) * 100) : null };
  }, [feedback]);

  const intentData = useMemo(
    () =>
      [...convAnalytics.intentDistribution]
        .sort((a, b) => b.count - a.count)
        .map((d) => ({ intent: INTENT_LABELS[d.intent] || d.intent, count: d.count })),
    [convAnalytics.intentDistribution]
  );

  // Confidence buckets from the recent interactions (ordinal: low -> high)
  const confidenceData = useMemo(() => {
    const scores = recent.map((i) => i.confidence_score).filter((s): s is number => typeof s === 'number');
    return [0, 1, 2, 3, 4].map((i) => ({
      bucket: `${i * 20}–${(i + 1) * 20}%`,
      count: scores.filter((s) => Math.min(4, Math.floor(s * 5)) === i).length,
    }));
  }, [recent]);

  const archived = convAnalytics.statusDistribution.find((s) => s.status === 'archived')?.count ?? 0;
  const latency = latencyStatus(metrics.avg_latency_ms);
  const rangeLabel = RANGES.find((r) => r.id === dateRange)!.label.toLowerCase();

  return (
    <div className="flex h-full flex-col">
      {!embedded && (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-border bg-card px-4 pt-4 pb-3">
          {onBack && (
            <button onClick={onBack} aria-label="Back" className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
              <ChevronLeft size={18} />
            </button>
          )}
          <h2 className="text-base font-semibold text-foreground">Analytics</h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-4 md:p-6">
          {/* One filter row scoping everything below */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Date range" className="flex rounded-lg border border-border bg-card p-0.5 text-xs font-medium">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setDateRange(r.id)}
                  aria-pressed={dateRange === r.id}
                  className={cn(
                    'rounded-md px-3 py-1.5 transition-colors',
                    dateRange === r.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Live · updates as visitors chat
            </span>
          </div>

          {/* Headline numbers */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Conversations"
              value={convAnalytics.totalConversations}
              icon={MessageCircle}
              sub={`${convAnalytics.avgMessagesPerConversation} msgs avg${archived ? ` · ${archived} archived` : ''}`}
            />
            <MetricCard
              label="AI answers"
              value={metrics.total_interactions}
              icon={Sparkles}
              sub={`${metrics.total_tokens.toLocaleString()} tokens`}
              delay={0.04}
            />
            <MetricCard
              label="Avg response time"
              value={metrics.total_interactions ? formatMs(metrics.avg_latency_ms) : '—'}
              icon={Timer}
              status={metrics.total_interactions ? latency : undefined}
              sub={metrics.total_interactions ? `p95 ${formatMs(metrics.p95_latency_ms)}` : `No answers ${rangeLabel}`}
              delay={0.08}
            />
            <MetricCard
              label="Helpful answers"
              value={satisfaction.pct === null ? '—' : `${satisfaction.pct}%`}
              icon={ThumbsUp}
              sub={satisfaction.pct === null ? 'No ratings yet' : `${satisfaction.up} 👍 · ${satisfaction.down} 👎`}
              delay={0.12}
            />
          </div>

          {/* Traffic */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PerformanceChart
              title="New conversations"
              description={`Per day, ${rangeLabel}`}
              type="area"
              data={convAnalytics.dailyCounts}
              series={[{ key: 'count', name: 'Conversations', color: 'var(--viz-1)' }]}
              loading={loading}
            />
            <PerformanceChart
              title="Traffic by intent"
              description="What visitors came to ask about"
              type="hbar"
              xKey="intent"
              data={intentData}
              series={[{ key: 'count', name: 'Conversations', color: 'var(--viz-1)' }]}
              valueLabels
              loading={loading}
              height={Math.max(160, intentData.length * 32)}
            />
          </div>

          {/* AI performance */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PerformanceChart
              title="Response time"
              description="Average and 95th percentile per day"
              type="line"
              data={latencyData}
              series={[
                { key: 'avg', name: 'Average', color: 'var(--viz-1)' },
                { key: 'p95', name: 'p95', color: 'var(--viz-2)' },
              ]}
              format={formatMs}
              loading={loading}
            />
            <PerformanceChart
              title="Token usage"
              description="Prompt and completion tokens per day"
              type="stacked-bar"
              data={tokenData}
              series={[
                { key: 'prompt', name: 'Prompt', color: 'var(--viz-1)' },
                { key: 'completion', name: 'Completion', color: 'var(--viz-2)' },
              ]}
              loading={loading}
            />
          </div>

          {/* Answer quality */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PerformanceChart
              title="Answer confidence"
              description={`Last ${recent.length} AI answers, grouped by model confidence`}
              type="bar"
              xKey="bucket"
              data={confidenceData}
              series={[{ key: 'count', name: 'Answers', color: 'var(--viz-ord-3)' }]}
              cellColors={ORDINAL}
              valueLabels
              loading={loading}
              height={180}
              emptyMessage="Confidence appears once AI answers are recorded."
            />
            <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
              <h3 className="text-sm font-semibold text-foreground">Answer feedback</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">👍 / 👎 from visitors in the chat, {rangeLabel}</p>
              {satisfaction.pct === null ? (
                <div className="mt-3 flex h-[180px] items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  No ratings yet.
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <p className="text-5xl font-semibold tracking-tight text-foreground">
                    {satisfaction.pct}%<span className="ml-2 text-sm font-normal text-muted-foreground">rated helpful</span>
                  </p>
                  {/* Part-to-whole meter: helpful vs not, 2px surface gap between the two */}
                  <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${satisfaction.up} helpful, ${satisfaction.down} not helpful`}>
                    {satisfaction.up > 0 && <div className="rounded-l-full" style={{ flex: satisfaction.up, background: 'var(--status-good)' }} />}
                    {satisfaction.down > 0 && <div className="rounded-r-full" style={{ flex: satisfaction.down, background: 'var(--status-critical)' }} />}
                  </div>
                  <ul className="flex gap-5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <ThumbsUp size={12} style={{ color: 'var(--status-good)' }} aria-hidden="true" />
                      Helpful <span className="font-medium tabular-nums text-foreground">{satisfaction.up}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <ThumbsDown size={12} style={{ color: 'var(--status-critical)' }} aria-hidden="true" />
                      Not helpful <span className="font-medium tabular-nums text-foreground">{satisfaction.down}</span>
                    </li>
                  </ul>
                </div>
              )}
            </section>
          </div>

          {/* Recent interactions */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Recent AI answers</h3>
                <p className="text-xs text-muted-foreground">The latest {recent.length} interactions, newest first</p>
              </div>
            </div>
            {recent.length === 0 ? (
              <p className="px-5 py-10 text-center text-xs text-muted-foreground">Waiting for AI interactions…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium md:px-5">When</th>
                      <th className="px-4 py-2 font-medium">Intent</th>
                      <th className="px-4 py-2 font-medium">Model</th>
                      <th className="px-4 py-2 font-medium">Response time</th>
                      <th className="px-4 py-2 text-right font-medium">Tokens</th>
                      <th className="px-4 py-2 text-right font-medium md:px-5">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recent.map((row, idx) => {
                      const s = latencyStatus(row.latency_ms);
                      const Icon = STATUS_ICON[s.level];
                      return (
                        <tr key={row.id ?? `${row.created_at}-${idx}`} className="hover:bg-muted/40">
                          <td className="whitespace-nowrap px-4 py-2 text-muted-foreground md:px-5">
                            {row.created_at ? formatRelativeTime(row.created_at) : '—'}
                          </td>
                          <td className="px-4 py-2 text-foreground">{row.intent_detected ? INTENT_LABELS[row.intent_detected] || row.intent_detected : '—'}</td>
                          <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">{row.model}</td>
                          <td className="whitespace-nowrap px-4 py-2">
                            <span className="flex items-center gap-1.5 tabular-nums text-foreground">
                              <Icon size={12} style={{ color: STATUS_COLOR[s.level] }} aria-hidden="true" />
                              {formatMs(row.latency_ms)}
                              <span className="text-muted-foreground">{s.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-foreground">{(row.total_tokens || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right tabular-nums text-foreground md:px-5">
                            {row.confidence_score != null ? `${Math.round(row.confidence_score * 100)}%` : '—'}
                          </td>
                        </tr>
                      );
                    })}
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
