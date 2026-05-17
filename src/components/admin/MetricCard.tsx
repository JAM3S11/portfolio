import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color: 'blue' | 'violet' | 'amber' | 'emerald' | 'red' | 'cyan';
  trend?: { value: number; positive: boolean };
  isDarkMode: boolean;
  delay?: number;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-400',
  violet: 'bg-violet-500/10 text-violet-400',
  amber: 'bg-amber-500/10 text-amber-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  red: 'bg-red-500/10 text-red-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
};

const colorMapLight: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};

export default function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
  isDarkMode,
  delay = 0,
}: MetricCardProps) {
  const surface = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const border = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const iconColor = isDarkMode ? colorMap[color] : colorMapLight[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`${surface} rounded-2xl p-4 border ${border}`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${iconColor}`}
      >
        <Icon size={16} />
      </div>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold tracking-tight ${textPrimary}`}>{value}</p>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {trend.positive ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
      <p className={`text-xs font-medium mt-0.5 ${textMuted}`}>{label}</p>
      {sub && (
        <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}
