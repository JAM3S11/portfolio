import { supabase } from './chat-service';
import type { AIInteraction } from './analytics-service';

export interface AlertRule {
  id: string;
  type: 'latency' | 'error_rate' | 'token_anomaly' | 'new_conversation' | 'cost_threshold';
  label: string;
  threshold: number;
  enabled: boolean;
}

export interface AlertEvent {
  id: string;
  rule_id: string;
  rule_type: AlertRule['type'];
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  created_at: string;
}

const DEFAULT_RULES: AlertRule[] = [
  { id: 'latency', type: 'latency', label: 'Slow Response', threshold: 5000, enabled: true },
  { id: 'error_rate', type: 'error_rate', label: 'High Error Rate', threshold: 10, enabled: true },
  { id: 'new_conversation', type: 'new_conversation', label: 'New Conversation', threshold: 0, enabled: true },
];

let rules: AlertRule[] = [...DEFAULT_RULES];
let alertCallbacks: ((alert: AlertEvent) => void)[] = [];

// Evaluate a new AI interaction against alert rules
export function evaluateInteraction(interaction: AIInteraction): AlertEvent | null {
  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (rule.type === 'latency' && interaction.latency_ms > rule.threshold) {
      return createAlert(
        rule,
        `Slow AI response: ${interaction.latency_ms}ms (threshold: ${rule.threshold}ms)`,
        interaction.latency_ms > rule.threshold * 2 ? 'critical' : 'high'
      );
    }
  }
  return null;
}

// Evaluate an error rate against alert rules
export function evaluateErrorRate(errorRate: number): AlertEvent | null {
  const rule = rules.find((r) => r.type === 'error_rate');
  if (!rule || !rule.enabled) return null;
  if (errorRate > rule.threshold) {
    return createAlert(
      rule,
      `High error rate: ${errorRate}% (threshold: ${rule.threshold}%)`,
      errorRate > rule.threshold * 2 ? 'critical' : 'high'
    );
  }
  return null;
}

// Create a new conversation alert
export function createNewConversationAlert(
  visitorName: string
): AlertEvent {
  const rule = rules.find((r) => r.type === 'new_conversation')!;
  return createAlert(
    rule,
    `New conversation started by ${visitorName || 'Anonymous'}`,
    'low'
  );
}

function createAlert(
  rule: AlertRule,
  message: string,
  severity: AlertEvent['severity']
): AlertEvent {
  const alert: AlertEvent = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    rule_id: rule.id,
    rule_type: rule.type,
    message,
    severity,
    acknowledged: false,
    created_at: new Date().toISOString(),
  };

  // Persist to Supabase if available
  persistAlert(alert);

  // Notify listeners
  alertCallbacks.forEach((cb) => cb(alert));

  return alert;
}

async function persistAlert(alert: AlertEvent) {
  if (!supabase) return;
  try {
    await supabase.from('ai_errors').insert({
      error_type: `alert_${alert.rule_type}`,
      error_message: alert.message,
      failure_reason: `severity:${alert.severity}`,
      resolved: alert.acknowledged,
    });
  } catch (e) {
    console.error('Failed to persist alert:', e);
  }
}

// Subscribe to alerts
export function subscribeToAlerts(callback: (alert: AlertEvent) => void) {
  alertCallbacks.push(callback);
  return () => {
    alertCallbacks = alertCallbacks.filter((cb) => cb !== callback);
  };
}

// Get current rules
export function getAlertRules(): AlertRule[] {
  return [...rules];
}

// Update a rule
export function updateAlertRule(
  ruleId: string,
  updates: Partial<AlertRule>
): AlertRule[] {
  rules = rules.map((r) =>
    r.id === ruleId ? { ...r, ...updates } : r
  );
  return [...rules];
}

// Reset rules to defaults
export function resetAlertRules(): AlertRule[] {
  rules = [...DEFAULT_RULES];
  return [...rules];
}
