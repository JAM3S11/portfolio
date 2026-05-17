import { supabase } from './chat-service';

export interface AIInteraction {
  id?: string;
  conversation_id: string;
  message_id: string;
  prompt: string;
  response: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  confidence_score: number | null;
  intent_detected: string | null;
  processing_steps: Record<string, unknown> | null;
  created_at?: string;
}

export interface AIError {
  id?: string;
  conversation_id: string;
  error_type: string;
  error_message: string;
  failure_reason: string | null;
  resolution_attempted: string | null;
  resolved: boolean;
  created_at?: string;
}

export interface UserFeedback {
  id?: string;
  conversation_id: string;
  message_id: string;
  rating: number;
  feedback_text: string | null;
  created_at?: string;
}

export interface AggregatedMetrics {
  avg_latency_ms: number;
  p95_latency_ms: number;
  total_tokens: number;
  avg_confidence: number;
  total_interactions: number;
  error_count: number;
  error_rate: number;
}

// Log an AI interaction to the database
export async function logAIInteraction(
  data: Omit<AIInteraction, 'id' | 'created_at'>
): Promise<AIInteraction | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from('ai_interactions')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error logging AI interaction:', error);
    return null;
  }

  return result as AIInteraction;
}

// Log an AI error to the database
export async function logAIError(
  data: Omit<AIError, 'id' | 'created_at'>
): Promise<AIError | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from('ai_errors')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error logging AI error:', error);
    return null;
  }

  return result as AIError;
}

// Log user feedback to the database
export async function logUserFeedback(
  data: Omit<UserFeedback, 'id' | 'created_at'>
): Promise<UserFeedback | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from('user_feedback')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error logging user feedback:', error);
    return null;
  }

  return result as UserFeedback;
}

// Get aggregated metrics for a given time range
export async function getAggregatedMetrics(
  range: '7d' | '30d' | '90d' = '7d'
): Promise<AggregatedMetrics> {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  const defaults: AggregatedMetrics = {
    avg_latency_ms: 0,
    p95_latency_ms: 0,
    total_tokens: 0,
    avg_confidence: 0,
    total_interactions: 0,
    error_count: 0,
    error_rate: 0,
  };

  if (!supabase) return defaults;

  const { data: interactions, error: intError } = await supabase
    .from('ai_interactions')
    .select('*')
    .gte('created_at', since);

  if (intError) {
    console.error('Error fetching aggregated metrics:', intError);
    return defaults;
  }

  const { data: errors, error: errError } = await supabase
    .from('ai_errors')
    .select('*')
    .gte('created_at', since);

  if (errError) {
    console.error('Error fetching error count:', errError);
    return defaults;
  }

  const total = interactions?.length || 0;
  if (total === 0) return defaults;

  const latencies = interactions
    .map((i) => i.latency_ms)
    .filter((l): l is number => l != null)
    .sort((a, b) => a - b);

  const avgLatency =
    latencies.length > 0
      ? Math.round(
          latencies.reduce((a, b) => a + b, 0) / latencies.length
        )
      : 0;

  const p95Index = Math.ceil(latencies.length * 0.95) - 1;
  const p95Latency =
    latencies.length > 0 ? latencies[Math.max(0, p95Index)] : 0;

  const totalTokens = interactions.reduce(
    (sum, i) => sum + (i.total_tokens || 0),
    0
  );

  const confidences = interactions
    .map((i) => i.confidence_score)
    .filter((c): c is number => c != null);
  const avgConfidence =
    confidences.length > 0
      ? Math.round(
          (confidences.reduce((a, b) => a + b, 0) / confidences.length) *
            1000
        ) / 1000
      : 0;

  const errorCount = errors?.length || 0;
  const errorRate =
    total > 0 ? Math.round((errorCount / (total + errorCount)) * 100) : 0;

  return {
    avg_latency_ms: avgLatency,
    p95_latency_ms: p95Latency,
    total_tokens: totalTokens,
    avg_confidence: avgConfidence,
    total_interactions: total,
    error_count: errorCount,
    error_rate: errorRate,
  };
}

// Get interactions for a specific conversation
export async function getConversationInteractions(
  conversationId: string
): Promise<AIInteraction[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('ai_interactions')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversation interactions:', error);
    return [];
  }

  return data as AIInteraction[];
}

// Subscribe to new AI interactions (for real-time monitoring)
export function subscribeToNewInteractions(
  callback: (interaction: AIInteraction) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`new-interactions-${crypto.randomUUID?.() || Math.random()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ai_interactions',
      },
      (payload) => {
        callback(payload.new as AIInteraction);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Get latency timeseries data for charting
export async function getLatencyTimeseries(
  range: '7d' | '30d' | '90d' = '7d',
  bucket: 'hour' | 'day' = 'day'
): Promise<{ date: string; avg: number; p95: number }[]> {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  if (!supabase || bucket !== 'day') return [];

  const result: { date: string; avg: number; p95: number }[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('ai_interactions')
      .select('latency_ms')
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString());

    if (data && data.length > 0) {
      const latencies = data
        .map((r) => r.latency_ms)
        .filter((l): l is number => l != null)
        .sort((a, b) => a - b);
      const avg = Math.round(
        latencies.reduce((a, b) => a + b, 0) / latencies.length
      );
      const p95Index = Math.ceil(latencies.length * 0.95) - 1;
      const p95 = latencies[Math.max(0, p95Index)];
      result.unshift({
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        avg,
        p95,
      });
    } else {
      result.unshift({
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        avg: 0,
        p95: 0,
      });
    }
  }

  return result;
}

// Get aggregated conversation analytics
export async function getConversationAnalytics(
  range: '7d' | '30d' | '90d' = '7d'
): Promise<{
  dailyCounts: { date: string; count: number }[];
  intentDistribution: { intent: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
}> {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const defaults = {
    dailyCounts: [],
    intentDistribution: [],
    statusDistribution: [],
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
  };
  if (!supabase) return defaults;

  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .gte('created_at', since);
  if (convError) { console.error('Error fetching conversations:', convError); return defaults; }

  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .gte('created_at', since);
  if (msgError) { console.error('Error fetching messages:', msgError); return defaults; }

  const convs = conversations || [];
  const msgs = messages || [];

  const dailyCounts: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
    const count = convs.filter(c => {
      const t = new Date(c.created_at).getTime();
      return t >= dayStart.getTime() && t <= dayEnd.getTime();
    }).length;
    dailyCounts.push({
      date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      count,
    });
  }

  const intentMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};
  for (const c of convs) {
    const intent = c.visitor_intent || 'unknown';
    intentMap[intent] = (intentMap[intent] || 0) + 1;
    const status = c.status || 'active';
    statusMap[status] = (statusMap[status] || 0) + 1;
  }

  return {
    dailyCounts,
    intentDistribution: Object.entries(intentMap).map(([intent, count]) => ({ intent, count })),
    statusDistribution: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
    totalConversations: convs.length,
    totalMessages: msgs.length,
    avgMessagesPerConversation: convs.length > 0 ? Math.round((msgs.length / convs.length) * 10) / 10 : 0,
  };
}

// Get feedback metrics
export async function getFeedbackMetrics(
  range: '7d' | '30d' | '90d' = '7d'
): Promise<{
  averageRating: number;
  totalFeedback: number;
  ratingDistribution: { rating: number; count: number }[];
}> {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const defaults = { averageRating: 0, totalFeedback: 0, ratingDistribution: [] };
  if (!supabase) return defaults;

  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .gte('created_at', since);
  if (error) { console.error('Error fetching feedback:', error); return defaults; }

  const feedback = data || [];
  const ratingMap: Record<number, number> = {};
  for (const f of feedback) {
    ratingMap[f.rating] = (ratingMap[f.rating] || 0) + 1;
  }
  const sum = feedback.reduce((s, f) => s + f.rating, 0);

  return {
    averageRating: feedback.length > 0 ? Math.round((sum / feedback.length) * 10) / 10 : 0,
    totalFeedback: feedback.length,
    ratingDistribution: Object.entries(ratingMap).map(([rating, count]) => ({ rating: Number(rating), count })),
  };
}

// Get recent interactions for live feed
export async function getRecentInteractions(limit = 20): Promise<AIInteraction[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ai_interactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('Error fetching recent interactions:', error); return []; }
  return data as AIInteraction[];
}

// Get token usage timeseries data for charting
export async function getTokenTimeseries(
  range: '7d' | '30d' | '90d' = '7d'
): Promise<{ date: string; prompt: number; completion: number; total: number }[]> {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const result: {
    date: string;
    prompt: number;
    completion: number;
    total: number;
  }[] = [];

  if (!supabase) return result;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('ai_interactions')
      .select('prompt_tokens, completion_tokens, total_tokens')
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString());

    const totals = (data || []).reduce(
      (acc, r) => ({
        prompt: acc.prompt + (r.prompt_tokens || 0),
        completion: acc.completion + (r.completion_tokens || 0),
        total: acc.total + (r.total_tokens || 0),
      }),
      { prompt: 0, completion: 0, total: 0 }
    );

    result.push({
      date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      ...totals,
    });
  }

  return result;
}
