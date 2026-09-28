import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertOctagon, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusLevel = 'good' | 'warning' | 'critical';

interface MetricCardProps {
  label: string;
  value: string | number;
  /** Secondary line under the value (context, not a delta) */
  sub?: string;
  icon?: LucideIcon;
  /** Optional state; always rendered as icon + label, never color alone */
  status?: { level: StatusLevel; label: string };
  delay?: number;
}

const STATUS: Record<StatusLevel, { icon: LucideIcon; color: string }> = {
  good: { icon: CheckCircle2, color: 'var(--status-good)' },
  warning: { icon: AlertTriangle, color: 'var(--status-warning)' },
  critical: { icon: AlertOctagon, color: 'var(--status-critical)' },
};

const compact = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });

// Stat tile: label, value (auto-compacted numbers), optional context line and status
export default function MetricCard({ label, value, sub, icon: Icon, status, delay = 0 }: MetricCardProps) {
  const display = typeof value === 'number' ? (Math.abs(value) >= 10000 ? compact.format(value) : value.toLocaleString()) : value;
  const StatusIcon = status ? STATUS[status.level].icon : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="rounded-2xl border border-border bg-card p-4 md:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon size={15} className="text-muted-foreground/70" aria-hidden="true" />}
      </div>
      <p className="mt-2 text-2xl md:text-[28px] font-semibold leading-none tracking-tight text-foreground">{display}</p>
      {(sub || status) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {status && StatusIcon && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <StatusIcon size={13} style={{ color: STATUS[status.level].color }} aria-hidden="true" />
              {status.label}
            </span>
          )}
          {sub && <span>{sub}</span>}
        </div>
      )}
    </motion.div>
  );
}
