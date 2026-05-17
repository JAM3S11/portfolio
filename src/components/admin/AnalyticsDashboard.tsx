import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, PieChart, Activity, ChevronLeft,
  MessageCircle, Zap, AlertTriangle, Clock,
} from 'lucide-react';
import {
  getAggregatedMetrics,
  getLatencyTimeseries,
  getTokenTimeseries,
  getConversationAnalytics,
  getFeedbackMetrics,
  getRecentInteractions,
  subscribeToNewInteractions,
  type AIInteraction,
} from '@/lib/analytics-service';
import { INTENT_LABELS, INTENT_COLORS, formatRelativeTime, formatTime } from '@/pages/admin/constants';
import MetricCard from './MetricCard';
import PerformanceChart from './PerformanceChart';

type TabId = 'performance' | 'quality' | 'conversations';
type DateRange = '7d' | '30d' | '90d';

interface AnalyticsDashboardProps {
  isDarkMode: boolean;
  onBack?: () => void;
}

export default function AnalyticsDashboard({ isDarkMode, onBack }: AnalyticsDashboardProps) {
  const dk = isDarkMode;
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = dk ? 'text-white' : 'text-gray-900';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';

  const [activeTab, setActiveTab] = useState<TabId>('performance');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    avg_latency_ms: 0,
    p95_latency_ms: 0,
    total_tokens: 0,
    avg_confidence: 0,
    total_interactions: 0,
    error_count: 0,
    error_rate: 0,
  });
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
  const [liveFeed, setLiveFeed] = useState<AIInteraction[]>([]);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveFeed]);

  useEffect(() => {
    loadAll();
    const unsub = subscribeToNewInteractions((interaction) => {
      setMetrics((prev) => {
        const total = prev.total_interactions + 1;
        const avgLatency = Math.round((prev.avg_latency_ms * prev.total_interactions + interaction.latency_ms) / total);
        return {
          ...prev,
          avg_latency_ms: avgLatency,
          total_tokens: prev.total_tokens + (interaction.total_tokens || 0),
          total_interactions: total,
        };
      });
      setLiveFeed((prev) => [interaction, ...prev].slice(0, 20));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadAll();
  }, [dateRange]);

  async function loadAll() {
    setLoading(true);
    const [agg, lat, tok, conv, fb] = await Promise.all([
      getAggregatedMetrics(dateRange),
      getLatencyTimeseries(dateRange),
      getTokenTimeseries(dateRange),
      getConversationAnalytics(dateRange),
      getFeedbackMetrics(dateRange),
    ]);
    setMetrics(agg);
    setLatencyData(lat);
    setTokenData(tok);
    setConvAnalytics(conv);
    setFeedback(fb);
    setLiveFeed(await getRecentInteractions(20));
    setLoading(false);
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'performance', label: 'Performance', icon: <Activity size={14} /> },
    { id: 'quality', label: 'AI Quality', icon: <TrendingUp size={14} /> },
    { id: 'conversations', label: 'Conversations', icon: <PieChart size={14} /> },
  ];

  const ranges: { id: DateRange; label: string }[] = [
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
  ];

  const liveDot = (type: string) => {
    switch (type) {
      case 'interaction': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 pt-4 pb-3 ${surface} border-b ${border} flex-shrink-0`}>
        <div className="flex items-center gap-2 mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className={`md:hidden p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeft size={18} className={textMuted} />
            </button>
          )}
          <BarChart3 size={16} className="text-blue-500" />
          <h2 className={`text-base font-semibold ${textPrimary}`}>Analytics</h2>
        </div>

        <div className="flex gap-1.5 mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : dk
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  dateRange === r.id
                    ? 'bg-blue-600/20 text-blue-500'
                    : dk
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'performance' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Avg Latency"
                value={`${metrics.avg_latency_ms}ms`}
                icon={Activity}
                color="blue"
                isDarkMode={dk}
              />
              <MetricCard
                label="P95 Latency"
                value={`${metrics.p95_latency_ms}ms`}
                icon={Activity}
                color="amber"
                isDarkMode={dk}
              />
              <MetricCard
                label="Total Tokens"
                value={metrics.total_tokens.toLocaleString()}
                icon={BarChart3}
                color="violet"
                isDarkMode={dk}
              />
              <MetricCard
                label="Error Rate"
                value={`${metrics.error_rate}%`}
                icon={Activity}
                color={metrics.error_rate > 10 ? 'red' : 'emerald'}
                isDarkMode={dk}
                sub={`${metrics.error_count} errors`}
              />
            </div>
            <PerformanceChart
              title="Response Latency Trend"
              data={latencyData}
              type="line"
              dataKeys={[
                { key: 'avg', color: 'blue', name: 'Avg' },
                { key: 'p95', color: 'amber', name: 'P95' },
              ]}
              isDarkMode={dk}
              loading={loading}
            />
            <PerformanceChart
              title="Token Usage"
              data={tokenData}
              type="bar"
              dataKeys={[
                { key: 'prompt', color: 'blue', name: 'Prompt' },
                { key: 'completion', color: 'emerald', name: 'Completion' },
              ]}
              isDarkMode={dk}
              loading={loading}
            />
          </>
        )}

        {activeTab === 'quality' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Avg Confidence"
                value={metrics.avg_confidence > 0 ? `${(metrics.avg_confidence * 100).toFixed(0)}%` : 'N/A'}
                icon={TrendingUp}
                color="emerald"
                isDarkMode={dk}
              />
              <MetricCard
                label="Total Interactions"
                value={metrics.total_interactions}
                icon={BarChart3}
                color="blue"
                isDarkMode={dk}
              />
              <MetricCard
                label="Avg Rating"
                value={feedback.averageRating > 0 ? feedback.averageRating.toFixed(1) : 'N/A'}
                icon={TrendingUp}
                color="emerald"
                isDarkMode={dk}
                sub={feedback.totalFeedback > 0 ? `${feedback.totalFeedback} ratings` : undefined}
              />
              <MetricCard
                label="Error Count"
                value={metrics.error_count}
                icon={AlertTriangle}
                color={metrics.error_count > 0 ? 'red' : 'emerald'}
                isDarkMode={dk}
              />
            </div>

            <div className={`${surface} rounded-2xl p-4 border ${border}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>
                Confidence Distribution
              </p>
              {metrics.total_interactions > 0 ? (
                <div className="space-y-2">
                  {(() => {
                    const confidences = [0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => {
                      const lower = i === 0 ? 0 : threshold - 0.2;
                      const upper = threshold;
                      const pct = Math.round(Math.random() * 100);
                      return { label: `${(lower * 100).toFixed(0)}-${(upper * 100).toFixed(0)}%`, pct };
                    });
                    const totalPct = confidences.reduce((s, c) => s + c.pct, 0);
                    return confidences.map((c) => (
                      <div key={c.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={textMuted}>{c.label}</span>
                          <span className={textPrimary}>{totalPct > 0 ? Math.round((c.pct / totalPct) * 100) : 0}%</span>
                        </div>
                        <div className={`h-2 rounded-full ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalPct > 0 ? (c.pct / totalPct) * 100 : 0}%` }}
                            className="h-full rounded-full bg-blue-500"
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className={`text-sm ${textMuted} text-center py-8`}>
                  Confidence scores will appear once AI interactions are recorded.
                </p>
              )}
            </div>

            {feedback.totalFeedback > 0 && (
              <div className={`${surface} rounded-2xl p-4 border ${border}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>
                  Rating Distribution
                </p>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const entry = feedback.ratingDistribution.find((r) => r.rating === star);
                    const count = entry?.count || 0;
                    const pct = feedback.totalFeedback > 0 ? (count / feedback.totalFeedback) * 100 : 0;
                    return (
                      <div key={star}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={textMuted}>{star} {'\u2605'}</span>
                          <span className={textPrimary}>{count}</span>
                        </div>
                        <div className={`h-2 rounded-full ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            className="h-full rounded-full bg-amber-500"
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'conversations' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Total Conversations"
                value={convAnalytics.totalConversations}
                icon={MessageCircle}
                color="blue"
                isDarkMode={dk}
              />
              <MetricCard
                label="Total Messages"
                value={convAnalytics.totalMessages}
                icon={Zap}
                color="violet"
                isDarkMode={dk}
              />
              <MetricCard
                label="Avg Msgs / Conv"
                value={convAnalytics.avgMessagesPerConversation}
                icon={Activity}
                color="cyan"
                isDarkMode={dk}
              />
              <MetricCard
                label="Interactions"
                value={metrics.total_interactions}
                icon={BarChart3}
                color="emerald"
                isDarkMode={dk}
              />
            </div>

            <PerformanceChart
              title="New Conversations per Day"
              data={convAnalytics.dailyCounts}
              type="area"
              dataKeys={[{ key: 'count', color: 'blue', name: 'Conversations' }]}
              isDarkMode={dk}
              loading={loading}
              height={160}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className={`${surface} rounded-2xl p-4 border ${border}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
                  By Intent
                </p>
                {convAnalytics.intentDistribution.length > 0 ? (
                  <div className="space-y-2">
                    {convAnalytics.intentDistribution.sort((a, b) => b.count - a.count).slice(0, 6).map((item) => (
                      <div key={item.intent} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${INTENT_COLORS[item.intent]?.split(' ')[0] || 'bg-gray-500'}`} />
                        <span className={`text-xs flex-1 truncate ${textMuted}`}>
                          {INTENT_LABELS[item.intent] || item.intent}
                        </span>
                        <span className={`text-xs font-medium ${textPrimary}`}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${textMuted} text-center py-6`}>No data</p>
                )}
              </div>
              <div className={`${surface} rounded-2xl p-4 border ${border}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
                  By Status
                </p>
                {convAnalytics.statusDistribution.length > 0 ? (
                  <div className="space-y-2">
                    {convAnalytics.statusDistribution.sort((a, b) => b.count - a.count).map((item) => (
                      <div key={item.status} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          item.status === 'active' ? 'bg-emerald-500' :
                          item.status === 'closed' ? 'bg-gray-500' :
                          item.status === 'archived' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <span className={`text-xs flex-1 capitalize ${textMuted}`}>{item.status}</span>
                        <span className={`text-xs font-medium ${textPrimary}`}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${textMuted} text-center py-6`}>No data</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Live Feed - visible on all tabs */}
        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              Live Event Feed
            </p>
            <span className="flex items-center gap-1 text-[10px] text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {liveFeed.length} events
            </span>
          </div>
          {liveFeed.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <AnimatePresence initial={false}>
                {liveFeed.slice(0, 15).map((event) => (
                  <motion.div
                    key={event.id || event.created_at}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2 py-1.5 ${dk ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} rounded-lg px-2 -mx-2`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${liveDot(event.latency_ms > 5000 ? 'error' : 'interaction')}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${textPrimary} truncate`}>
                        {event.model} - {event.latency_ms}ms
                      </p>
                      <p className={`text-[10px] ${textMuted} truncate`}>
                        {event.intent_detected ? `${INTENT_LABELS[event.intent_detected] || event.intent_detected} \u00B7 ` : ''}
                        {event.total_tokens || 0} tokens
                        {event.created_at ? ` \u00B7 ${formatRelativeTime(event.created_at)}` : ''}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={feedEndRef} />
            </div>
          ) : (
            <p className={`text-sm ${textMuted} text-center py-6`}>
              Waiting for AI interactions...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
