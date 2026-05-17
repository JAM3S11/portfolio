import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';

type ChartType = 'line' | 'bar' | 'area';

interface PerformanceChartProps {
  title: string;
  data: Record<string, unknown>[];
  type?: ChartType;
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey?: string;
  isDarkMode: boolean;
  height?: number;
  loading?: boolean;
}

const CHART_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  emerald: '#10b981',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  red: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899',
};

export default function PerformanceChart({
  title,
  data,
  type = 'line',
  dataKeys,
  xAxisKey = 'date',
  isDarkMode,
  height = 200,
  loading = false,
}: PerformanceChartProps) {
  const surface = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const border = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const axisColor = isDarkMode ? '#374151' : '#e5e7eb';
  const textColor = isDarkMode ? '#9ca3af' : '#6b7280';

  const tooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className={`${surface} border ${border} rounded-xl px-3 py-2 shadow-lg text-xs`}
      >
        <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${surface} rounded-2xl p-4 border ${border}`}>
        <div
          className={`h-4 w-28 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} animate-pulse mb-4`}
        />
        <div
          className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} animate-pulse`}
          style={{ height }}
        />
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisColor} vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={tooltipContent} />
            {dataKeys.map((dk) => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                name={dk.name}
                fill={CHART_COLORS[dk.color] || dk.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisColor} vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={tooltipContent} />
            {dataKeys.map((dk) => (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name}
                stroke={CHART_COLORS[dk.color] || dk.color}
                fill={`${CHART_COLORS[dk.color] || dk.color}20`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisColor} vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={tooltipContent} />
            {dataKeys.map((dk) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name}
                stroke={CHART_COLORS[dk.color] || dk.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className={`${surface} rounded-2xl p-4 border ${border}`}>
      <p
        className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textMuted}`}
      >
        {title}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
