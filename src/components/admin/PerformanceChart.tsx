import { useState, type ReactNode } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { cn } from '@/lib/utils';

export type ChartType = 'line' | 'area' | 'bar' | 'stacked-bar' | 'hbar';

export interface ChartSeries {
  key: string;
  name: string;
  /** A CSS color, normally a --viz-* token, e.g. 'var(--viz-1)' */
  color: string;
}

interface PerformanceChartProps {
  title: string;
  description?: string;
  data: Record<string, any>[];
  series: ChartSeries[];
  type?: ChartType;
  xKey?: string;
  /** Plot height; the card grows around it so axis labels are never clipped */
  height?: number;
  loading?: boolean;
  /** Formats values in ticks, tooltip, labels and the table view */
  format?: (value: number) => string;
  /** Per-bar colors for ordinal bars (single-series bar/hbar only) */
  cellColors?: string[];
  /** Value at each bar tip (bar/hbar only) - use for short lists */
  valueLabels?: boolean;
  emptyMessage?: string;
  /** Extra content under the title row (e.g. a summary figure) */
  children?: ReactNode;
}

const GRID = 'var(--viz-grid)';
const AXIS = 'var(--viz-axis)';
const TICK = { fontSize: 11, fill: 'var(--muted-foreground)' };

const compact = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
const defaultFormat = (v: number) => compact.format(v);

export default function PerformanceChart({
  title,
  description,
  data,
  series,
  type = 'line',
  xKey = 'date',
  height = 220,
  loading = false,
  format = defaultFormat,
  cellColors,
  valueLabels = false,
  emptyMessage = 'No data for this period yet.',
  children,
}: PerformanceChartProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const hasData = data.length > 0 && data.some((row) => series.some((s) => Number(row[s.key]) > 0));
  const isBar = type === 'bar' || type === 'stacked-bar' || type === 'hbar';

  const tooltip = (
    <Tooltip
      cursor={isBar ? { fill: 'var(--muted)', opacity: 0.5 } : { stroke: AXIS, strokeWidth: 1 }}
      content={({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
          <div className="min-w-32 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
            <p className="mb-1.5 font-medium text-foreground">{label}</p>
            {payload.map((entry: any) => (
              <p key={entry.dataKey} className="flex items-center justify-between gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                  {entry.name}
                </span>
                <span className="font-medium tabular-nums text-foreground">{format(Number(entry.value))}</span>
              </p>
            ))}
          </div>
        );
      }}
    />
  );

  const xAxis = <XAxis dataKey={xKey} tick={TICK} axisLine={{ stroke: AXIS }} tickLine={false} minTickGap={16} />;
  const yAxis = <YAxis tick={TICK} axisLine={false} tickLine={false} width={40} tickFormatter={format} allowDecimals={false} />;
  const grid = <CartesianGrid stroke={GRID} vertical={false} />;

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            {grid}{xAxis}{yAxis}{tooltip}
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.1}
                strokeWidth={2}
                activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        );
      case 'bar':
      case 'stacked-bar':
        return (
          <BarChart data={data} margin={{ top: valueLabels ? 18 : 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
            {grid}{xAxis}{yAxis}{tooltip}
            {series.map((s, i) => {
              const isTop = type !== 'stacked-bar' || i === series.length - 1;
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  fill={s.color}
                  maxBarSize={24}
                  stackId={type === 'stacked-bar' ? 'stack' : undefined}
                  radius={isTop ? [4, 4, 0, 0] : 0}
                  // 2px surface-colored gap between stacked segments and touching bars
                  stroke="var(--card)"
                  strokeWidth={type === 'stacked-bar' ? 2 : 0}
                >
                  {cellColors && series.length === 1 && data.map((_, idx) => <Cell key={idx} fill={cellColors[idx % cellColors.length]} />)}
                  {valueLabels && series.length === 1 && (
                    <LabelList dataKey={s.key} position="top" formatter={(v: any) => (Number(v) > 0 ? format(Number(v)) : '')} style={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  )}
                </Bar>
              );
            })}
          </BarChart>
        );
      case 'hbar':
        return (
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: valueLabels ? 36 : 8, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} tickFormatter={format} allowDecimals={false} />
            <YAxis type="category" dataKey={xKey} tick={TICK} axisLine={{ stroke: AXIS }} tickLine={false} width={120} />
            {tooltip}
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} maxBarSize={20} radius={[0, 4, 4, 0]}>
                {cellColors && series.length === 1 && data.map((_, idx) => <Cell key={idx} fill={cellColors[idx % cellColors.length]} />)}
                {valueLabels && (
                  <LabelList dataKey={s.key} position="right" formatter={(v: any) => format(Number(v))} style={{ fontSize: 11, fill: 'var(--foreground)' }} />
                )}
              </Bar>
            ))}
          </BarChart>
        );
      default:
        return (
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            {grid}{xAxis}{yAxis}{tooltip}
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  const firstLoad = loading && data.length === 0;

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        <div role="group" aria-label={`${title} view`} className="flex shrink-0 rounded-lg bg-muted p-0.5 text-[11px] font-medium">
          {(['chart', 'table'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn(
                'rounded-md px-2 py-0.5 capitalize transition-colors',
                view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {children}

      {/* Legend for two or more series; a single series is named by the title */}
      {series.length > 1 && view === 'chart' && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className={cn('rounded-full', type === 'line' ? 'h-0.5 w-3' : 'h-2 w-2')} style={{ background: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      {firstLoad ? (
        <div className="animate-pulse rounded-lg bg-muted" style={{ height }} />
      ) : !hasData ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground" style={{ height }}>
          {emptyMessage}
        </div>
      ) : view === 'table' ? (
        <div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: height + 24 }}>
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium capitalize">{xKey}</th>
                {series.map((s) => (
                  <th key={s.key} className="px-3 py-2 text-right font-medium">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-1.5 text-foreground">{row[xKey]}</td>
                  {series.map((s) => (
                    <td key={s.key} className="px-3 py-1.5 text-right tabular-nums text-foreground">{format(Number(row[s.key] ?? 0))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // On refetch the previous render stays, dimmed, instead of flashing a skeleton
        <div className={cn('transition-opacity', loading && 'opacity-50')} style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
