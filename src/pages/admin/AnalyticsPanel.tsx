import { motion } from 'framer-motion';
import {
  BarChart3, MessageCircle, MessageSquare, Zap, CheckCircle, ChevronLeft,
} from 'lucide-react';
import { INTENT_LABELS, formatRelativeTime } from './constants';
import type { ConvoItem } from './types';

interface AnalyticsStats {
  totalConversations: number;
  todayCount: number;
  totalMessages: number;
  botMessages: number;
  visitorMessages: number;
  intentCounts: Record<string, number>;
  activityByDay: { day: string; count: number }[];
  statusCounts: Record<string, number>;
  avgMsgs: string;
}

interface AnalyticsPanelProps {
  stats: AnalyticsStats;
  conversations: ConvoItem[];
  isDarkMode: boolean;
  onBack?: () => void;
}

export default function AnalyticsPanel({
  stats,
  conversations,
  isDarkMode,
  onBack,
}: AnalyticsPanelProps) {
  const dk = isDarkMode;
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = dk ? 'text-white' : 'text-gray-900';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="flex flex-col h-full">
      <div
        className={`px-4 pt-4 pb-3 ${surface} border-b ${border} flex-shrink-0 flex items-center gap-2`}
      >
        {onBack && (
          <button
            onClick={onBack}
            className={`md:hidden p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft size={18} className={textMuted} />
          </button>
        )}
        <h2 className={`text-base font-semibold ${textPrimary}`}>Analytics</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'Conversations',
              value: stats.totalConversations,
              sub: `${stats.todayCount} today`,
              icon: MessageCircle,
              color: 'blue',
            },
            {
              label: 'Messages',
              value: stats.totalMessages,
              sub: `${stats.avgMsgs} avg`,
              icon: MessageSquare,
              color: 'violet',
            },
            {
              label: 'Bot Efficiency',
              value: `${
                stats.totalMessages > 0
                  ? Math.round((stats.botMessages / stats.totalMessages) * 100)
                  : 0
              }%`,
              sub: 'Automated',
              icon: Zap,
              color: 'amber',
            },
            {
              label: 'Active',
              value: stats.statusCounts['active'] || 0,
              sub: `${stats.statusCounts['archived'] || 0} archived`,
              icon: CheckCircle,
              color: 'emerald',
            },
          ].map((s, i) => {
            const colorMap: Record<string, string> = {
              blue: dk
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-blue-50 text-blue-600',
              violet: dk
                ? 'bg-violet-500/10 text-violet-400'
                : 'bg-violet-50 text-violet-600',
              amber: dk
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-amber-50 text-amber-600',
              emerald: dk
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-emerald-50 text-emerald-600',
            };
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`${surface} rounded-2xl p-4 border ${border}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${colorMap[s.color]}`}
                >
                  <s.icon size={16} />
                </div>
                <p className={`text-2xl font-bold tracking-tight ${textPrimary}`}>{s.value}</p>
                <p className={`text-xs font-medium mt-0.5 ${textMuted}`}>{s.label}</p>
                <p className={`text-[11px] mt-1 ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{s.sub}</p>
              </motion.div>
            );
          })}
        </div>

        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              7-Day Activity
            </p>
            <BarChart3 size={14} className="text-blue-500 opacity-50" />
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {stats.activityByDay.map((item, idx) => {
              const maxCount = Math.max(...stats.activityByDay.map((d) => d.count), 1);
              const pct = (item.count / maxCount) * 100;
              const isToday = idx === stats.activityByDay.length - 1;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative">
                  {item.count > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] bg-gray-900 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {item.count}
                    </div>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                    className={`w-full rounded-t-md ${
                      isToday
                        ? 'bg-blue-500'
                        : dk
                          ? 'bg-gray-700 group-hover:bg-gray-600'
                          : 'bg-gray-200 group-hover:bg-gray-300'
                    } transition-colors`}
                    style={{ minHeight: item.count > 0 ? 3 : 0 }}
                  />
                  <span
                    className={`text-[10px] mt-1.5 font-medium ${dk ? 'text-gray-600' : 'text-gray-400'} ${isToday ? '!text-blue-500' : ''}`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>
            Traffic by Intent
          </p>
          <div className="space-y-3.5">
            {Object.entries(INTENT_LABELS).map(([key, label]) => {
              const count = stats.intentCounts[key] || 0;
              const pct =
                stats.totalConversations > 0
                  ? Math.round((count / stats.totalConversations) * 100)
                  : 0;
              const barColors: Record<string, string> = {
                hiring: 'bg-emerald-500',
                quote: 'bg-blue-500',
                tech: 'bg-violet-500',
                partnership: 'bg-amber-500',
                faq: 'bg-gray-400',
                deep_frontend: 'bg-purple-500',
                deep_backend: 'bg-cyan-500',
                deep_fullstack: 'bg-pink-500',
                deep_software: 'bg-orange-500',
              };
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs font-medium ${textPrimary}`}>{label}</span>
                    <span className={`text-xs ${textMuted}`}>{count}</span>
                  </div>
                  <div
                    className={`h-1.5 rounded-full overflow-hidden ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${barColors[key]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              AI Assistant Updates
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                emoji: '\uD83D\uDD2C',
                title: 'Deep Dive Insights Mode',
                badge: 'New',
                badgeColor: 'emerald',
                color: 'purple',
                text: 'Visitors can explore James\u2019s projects with deep technical analysis \u2014 like ChatGPT for his codebase.\n4 focus areas: Frontend, Backend, Fullstack, Software Engineering\n7 projects with architecture, design decisions, and trade-offs\nFree-form Q&A with AI-generated deep technical insights',
              },
              {
                emoji: '\uD83D\uDCDA',
                title: 'Enriched Project Knowledge',
                badge: 'New',
                badgeColor: 'emerald',
                color: 'blue',
                text: 'All 7 projects now have deep technical data including architecture, design decisions, challenges, and role-specific interview focus areas extracted from the actual GitHub repos.',
              },
              {
                emoji: '\uD83D\uDCAC',
                title: 'Smarter FAQ Responses',
                badge: 'Updated',
                badgeColor: 'blue',
                color: 'amber',
                text: 'FAQ knowledge base expanded to cover all 7 projects. New entries for deep dive intent detection. Welcome message updated with deep dive mode option.',
              },
              {
                emoji: '\uD83E\uDD16',
                title: 'Gemini Prompt Engineering',
                badge: 'Updated',
                badgeColor: 'blue',
                color: 'emerald',
                text: 'New specialized prompts for deep dive technical analysis. Includes focus-area-specific context, project architecture details, and trade-off evaluation.',
              },
            ].map((update) => {
              const colorClasses: Record<string, string> = {
                purple: dk
                  ? 'bg-purple-900/10 border border-purple-900/20'
                  : 'bg-purple-50 border border-purple-100',
                blue: dk
                  ? 'bg-blue-900/10 border border-blue-900/20'
                  : 'bg-blue-50 border border-blue-100',
                amber: dk
                  ? 'bg-amber-900/10 border border-amber-900/20'
                  : 'bg-amber-50 border border-amber-100',
                emerald: dk
                  ? 'bg-emerald-900/10 border border-emerald-900/20'
                  : 'bg-emerald-50 border border-emerald-100',
              };
              const badgeColors: Record<string, string> = {
                emerald: 'bg-emerald-500/15 text-emerald-500',
                blue: 'bg-blue-500/15 text-blue-500',
              };
              return (
                <div key={update.title} className={`p-3 rounded-xl ${colorClasses[update.color]}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">{update.emoji}</span>
                    <p className={`text-sm font-semibold ${textPrimary}`}>{update.title}</p>
                    <span
                      className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeColors[update.badgeColor]}`}
                    >
                      {update.badge}
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} leading-relaxed`}>{update.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { AnalyticsStats };
