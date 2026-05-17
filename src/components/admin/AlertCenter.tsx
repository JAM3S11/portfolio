import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, ChevronLeft, CheckCheck, Settings,
} from 'lucide-react';
import {
  getAlertRules,
  updateAlertRule,
  resetAlertRules,
  subscribeToAlerts,
  type AlertEvent,
  type AlertRule,
} from '@/lib/alert-service';

interface AlertCenterProps {
  isDarkMode: boolean;
  onBack?: () => void;
}

export default function AlertCenter({ isDarkMode, onBack }: AlertCenterProps) {
  const dk = isDarkMode;
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = dk ? 'text-white' : 'text-gray-900';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dk
    ? 'bg-gray-800 text-white placeholder-gray-500'
    : 'bg-gray-100 text-gray-900 placeholder-gray-400';

  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [rules, setRules] = useState<AlertRule[]>(getAlertRules());
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAlerts((alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 100));
    });
    return unsub;
  }, []);

  function handleToggleRule(ruleId: string) {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const updated = updateAlertRule(ruleId, { enabled: !rule.enabled });
    setRules(updated);
  }

  function handleReset() {
    const updated = resetAlertRules();
    setRules(updated);
  }

  function handleAcknowledge(alertId: string) {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      )
    );
  }

  const severityStyles: Record<string, string> = {
    low: dk ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200',
    medium: dk ? 'bg-amber-900/10 border-amber-900/20' : 'bg-amber-50 border-amber-200',
    high: dk ? 'bg-orange-900/10 border-orange-900/20' : 'bg-orange-50 border-orange-200',
    critical: dk ? 'bg-red-900/10 border-red-900/20' : 'bg-red-50 border-red-200',
  };

  const severityDots: Record<string, string> = {
    low: 'bg-gray-400',
    medium: 'bg-amber-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="flex flex-col h-full">
      <div
        className={`px-4 pt-4 pb-3 ${surface} border-b ${border} flex-shrink-0`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className={`p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft size={18} className={textMuted} />
              </button>
            )}
            <Bell size={16} className="text-amber-500" />
            <h2 className={`text-base font-semibold ${textPrimary}`}>Alerts</h2>
            {unacknowledgedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-500">
                {unacknowledgedCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            title="Alert settings"
          >
            <Settings size={16} className={textMuted} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showConfig ? (
          <div className={`${surface} rounded-2xl p-4 border ${border} space-y-3`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              Alert Rules
            </p>
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  dk ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}
              >
                <div>
                  <p className={`text-xs font-medium ${textPrimary}`}>{rule.label}</p>
                  <p className={`text-[10px] ${textMuted}`}>
                    {rule.type === 'latency'
                      ? `Threshold: >${rule.threshold}ms`
                      : rule.type === 'error_rate'
                        ? `Threshold: >${rule.threshold}%`
                        : 'Triggers on new conversation'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    rule.enabled
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : dk
                        ? 'bg-gray-700 text-gray-500'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {rule.enabled ? (
                    <Bell size={14} />
                  ) : (
                    <BellOff size={14} />
                  )}
                </button>
              </div>
            ))}
            <button
              onClick={handleReset}
              className={`w-full py-2 rounded-xl text-xs font-medium transition-colors ${
                dk
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Reset to defaults
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className={`py-16 text-center ${textMuted}`}>
            <Bell size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No alerts yet</p>
            <p className="text-xs mt-1 opacity-60">
              Alerts will appear here when thresholds are exceeded
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-3 border ${severityStyles[alert.severity]} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${severityDots[alert.severity]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium ${textPrimary} ${
                        alert.acknowledged ? 'line-through' : ''
                      }`}
                    >
                      {alert.message}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${textMuted}`}>
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors"
                      title="Acknowledge"
                    >
                      <CheckCheck size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
