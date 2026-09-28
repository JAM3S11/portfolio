import { useState, useEffect, useMemo } from 'react';
import {
  Bell, ChevronLeft, CheckCheck, Settings2, AlertTriangle, AlertOctagon, RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getAlertRules,
  updateAlertRule,
  resetAlertRules,
  subscribeToAlerts,
  type AlertEvent,
  type AlertRule,
} from '@/lib/alert-service';
import { formatRelativeTime } from '@/pages/admin/constants';

interface AlertCenterProps {
  onBack?: () => void;
  /** Hide the title when the admin shell provides a page header */
  embedded?: boolean;
  /**
   * Alerts owned by a parent that stays mounted, so alerts raised while this page is closed
   * aren't lost. Without them the component collects alerts itself while it's on screen.
   */
  alerts?: AlertEvent[];
  onAcknowledge?: (alertId: string) => void;
}

type Severity = AlertEvent['severity'];

// Severity always shows as icon + label; color is never the only cue
const SEVERITY: Record<Severity, { label: string; color: string; icon: typeof Bell }> = {
  low: { label: 'Low', color: 'var(--muted-foreground)', icon: Bell },
  medium: { label: 'Medium', color: 'var(--status-warning)', icon: AlertTriangle },
  high: { label: 'High', color: 'var(--status-serious)', icon: AlertTriangle },
  critical: { label: 'Critical', color: 'var(--status-critical)', icon: AlertOctagon },
};

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

const RULE_DESCRIPTION: Record<AlertRule['type'], (r: AlertRule) => string> = {
  latency: (r) => `An AI answer takes longer than ${(r.threshold / 1000).toFixed(1)}s`,
  error_rate: (r) => `Errors exceed ${r.threshold}% of AI answers`,
  token_anomaly: (r) => `Token usage exceeds ${r.threshold.toLocaleString()} in one answer`,
  new_conversation: () => 'A visitor starts a new conversation',
  cost_threshold: (r) => `Estimated spend passes ${r.threshold}`,
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY[severity];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <s.icon size={13} style={{ color: s.color }} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export default function AlertCenter({
  onBack,
  embedded = false,
  alerts: controlledAlerts,
  onAcknowledge,
}: AlertCenterProps) {
  const isControlled = controlledAlerts !== undefined;
  const [localAlerts, setLocalAlerts] = useState<AlertEvent[]>([]);
  const alerts = isControlled ? controlledAlerts : localAlerts;
  const [rules, setRules] = useState<AlertRule[]>(getAlertRules());
  const [showRules, setShowRules] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'open' | 'acknowledged' | 'all'>('open');

  useEffect(() => {
    if (isControlled) return;
    return subscribeToAlerts((alert) => setLocalAlerts((prev) => [alert, ...prev].slice(0, 100)));
  }, [isControlled]);

  const acknowledge = (alertId: string) => {
    if (onAcknowledge) onAcknowledge(alertId);
    else setLocalAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  };

  const openAlerts = alerts.filter((a) => !a.acknowledged);

  const visible = useMemo(
    () =>
      alerts.filter(
        (a) =>
          (severityFilter === 'all' || a.severity === severityFilter) &&
          (statusFilter === 'all' || (statusFilter === 'open' ? !a.acknowledged : a.acknowledged))
      ),
    [alerts, severityFilter, statusFilter]
  );

  const severityCount = (s: Severity) => openAlerts.filter((a) => a.severity === s).length;

  const chip = (active: boolean) =>
    cn(
      'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      active ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground'
    );

  return (
    <div className="flex h-full flex-col">
      {!embedded && (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-border bg-card px-4 pt-4 pb-3">
          {onBack && (
            <button onClick={onBack} aria-label="Back" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
              <ChevronLeft size={18} />
            </button>
          )}
          <h2 className="text-base font-semibold text-foreground">Alerts</h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-4 md:p-6">
          {/* Summary by severity (open alerts) */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {SEVERITY_ORDER.map((s) => {
              const meta = SEVERITY[s];
              return (
                <button
                  key={s}
                  onClick={() => { setSeverityFilter(severityFilter === s ? 'all' : s); setStatusFilter('open'); }}
                  aria-pressed={severityFilter === s}
                  className={cn(
                    'rounded-2xl border bg-card p-4 text-left transition-colors',
                    severityFilter === s ? 'border-foreground/40' : 'border-border hover:border-foreground/20'
                  )}
                >
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <meta.icon size={13} style={{ color: meta.color }} aria-hidden="true" />
                    {meta.label}
                  </span>
                  <p className="mt-2 text-2xl font-semibold leading-none text-foreground">{severityCount(s)}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">open</p>
                </button>
              );
            })}
          </div>

          {/* One filter row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['open', 'acknowledged', 'all'] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} aria-pressed={statusFilter === s} className={chip(statusFilter === s)}>
                  {s === 'open' ? `Open ${openAlerts.length}` : s === 'acknowledged' ? 'Acknowledged' : 'All'}
                </button>
              ))}
              {severityFilter !== 'all' && (
                <button onClick={() => setSeverityFilter('all')} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
                  Clear “{SEVERITY[severityFilter].label}”
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAlerts.forEach((a) => acknowledge(a.id))}
                disabled={openAlerts.length === 0}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <CheckCheck size={14} />
                Acknowledge all
              </button>
              <button
                onClick={() => setShowRules((v) => !v)}
                aria-expanded={showRules}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
                  showRules ? 'border-foreground bg-foreground text-background' : 'border-border text-foreground hover:bg-muted'
                )}
              >
                <Settings2 size={14} />
                Rules
              </button>
            </div>
          </div>

          {showRules && (
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Alert rules</h3>
                  <p className="text-xs text-muted-foreground">Rules apply to this browser session</p>
                </div>
                <button
                  onClick={() => setRules(resetAlertRules())}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw size={12} />
                  Reset to defaults
                </button>
              </div>
              <ul className="divide-y divide-border">
                {rules.map((rule) => (
                  <li key={rule.id} className="flex items-center justify-between gap-4 px-4 py-3 md:px-5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{rule.label}</p>
                      <p className="text-xs text-muted-foreground">{RULE_DESCRIPTION[rule.type]?.(rule) ?? ''}</p>
                    </div>
                    {/* Switch */}
                    <button
                      role="switch"
                      aria-checked={rule.enabled}
                      aria-label={`${rule.label} alerts`}
                      onClick={() => setRules(updateAlertRule(rule.id, { enabled: !rule.enabled }))}
                      className={cn(
                        'relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                        rule.enabled ? 'bg-foreground' : 'bg-muted-foreground/30'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform',
                          rule.enabled ? 'translate-x-4' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Alerts */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            {visible.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <Bell size={26} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">
                  {alerts.length === 0 ? 'No alerts yet' : 'Nothing matches these filters'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {alerts.length === 0
                    ? 'Alerts appear here when an enabled rule is triggered.'
                    : 'Try showing all statuses or clearing the severity filter.'}
                </p>
              </div>
            ) : (
              <>
                {/* Table on larger screens */}
                <table className="hidden w-full text-left text-xs md:table">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-5 py-2 font-medium">Severity</th>
                      <th className="px-4 py-2 font-medium">Alert</th>
                      <th className="px-4 py-2 font-medium">When</th>
                      <th className="px-5 py-2 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visible.map((alert) => (
                      <tr key={alert.id} className={cn('hover:bg-muted/40', alert.acknowledged && 'text-muted-foreground')}>
                        <td className="whitespace-nowrap px-5 py-2.5"><SeverityBadge severity={alert.severity} /></td>
                        <td className={cn('px-4 py-2.5', alert.acknowledged ? 'text-muted-foreground' : 'text-foreground')}>{alert.message}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground" title={new Date(alert.created_at).toLocaleString()}>
                          {formatRelativeTime(alert.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-2.5 text-right">
                          {alert.acknowledged ? (
                            <span className="inline-flex items-center gap-1 text-muted-foreground"><CheckCheck size={12} /> Acknowledged</span>
                          ) : (
                            <button
                              onClick={() => acknowledge(alert.id)}
                              className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                            >
                              Acknowledge
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Cards on phones */}
                <ul className="divide-y divide-border md:hidden">
                  {visible.map((alert) => (
                    <li key={alert.id} className="space-y-1.5 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <SeverityBadge severity={alert.severity} />
                        <span className="text-[11px] text-muted-foreground">{formatRelativeTime(alert.created_at)}</span>
                      </div>
                      <p className={cn('text-sm', alert.acknowledged ? 'text-muted-foreground' : 'text-foreground')}>{alert.message}</p>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledge(alert.id)}
                          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground active:bg-muted"
                        >
                          Acknowledge
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
