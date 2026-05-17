import { motion } from 'framer-motion';
import {
  ChevronLeft, Download, Search, MessageSquare,
  Inbox, Trash2,
} from 'lucide-react';
import { INTENT_LABELS, INTENT_COLORS, formatRelativeTime } from './constants';
import type { ConvoItem } from './types';

interface ConversationsListProps {
  conversations: ConvoItem[];
  filteredConversations: ConvoItem[];
  selectedConvo: ConvoItem | null;
  searchQuery: string;
  searchAllQuery: string;
  allMessages: any[];
  searchResults: any[];
  activeSearch: 'conversation' | 'message' | null;
  isDarkMode: boolean;
  onLoadMessages: (item: ConvoItem) => void;
  onDeleteConversation: (item: ConvoItem, e: React.MouseEvent) => void;
  onExportCSV: () => void;
  onSetActiveSearch: (v: 'conversation' | 'message' | null) => void;
  onSearchQueryChange: (v: string) => void;
  onSearchAllQueryChange: (v: string) => void;
  onBack: () => void;
  onNavigateChat?: () => void;
}

export default function ConversationsList({
  conversations,
  filteredConversations,
  selectedConvo,
  searchQuery,
  searchAllQuery,
  allMessages,
  searchResults,
  activeSearch,
  isDarkMode,
  onLoadMessages,
  onDeleteConversation,
  onExportCSV,
  onSetActiveSearch,
  onSearchQueryChange,
  onSearchAllQueryChange,
  onBack,
}: ConversationsListProps) {
  const dk = isDarkMode;
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = dk ? 'text-white' : 'text-gray-900';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dk
    ? 'bg-gray-800 text-white placeholder-gray-500'
    : 'bg-gray-100 text-gray-900 placeholder-gray-400';

  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 pt-4 pb-3 ${surface} border-b ${border} flex-shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className={`p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            >
              <ChevronLeft size={18} className={textMuted} />
            </button>
            <h1 className={`text-base font-semibold ${textPrimary}`}>Messages</h1>
            {conversations.length > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${dk ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
              >
                {conversations.length}
              </span>
            )}
          </div>
          <button
            onClick={onExportCSV}
            title="Export CSV"
            className={`p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
          >
            <Download size={16} className={textMuted} />
          </button>
        </div>

        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => {
              onSetActiveSearch(activeSearch === 'conversation' ? null : 'conversation');
              onSearchAllQueryChange('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSearch === 'conversation'
                ? 'bg-blue-600 text-white'
                : dk
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Search size={12} />
            <span>Conversations</span>
          </button>
          <button
            onClick={() => {
              onSetActiveSearch(activeSearch === 'message' ? null : 'message');
              onSearchQueryChange('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSearch === 'message'
                ? 'bg-blue-600 text-white'
                : dk
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <MessageSquare size={12} />
            <span>Messages</span>
          </button>
        </div>

        {activeSearch === 'conversation' && (
          <div className="relative">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search conversations\u2026"
              autoFocus
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            />
          </div>
        )}

        {activeSearch === 'message' && (
          <div className="relative">
            <MessageSquare size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              value={searchAllQuery}
              onChange={(e) => onSearchAllQueryChange(e.target.value)}
              placeholder="Search message content\u2026"
              autoFocus
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSearch === 'message' && searchAllQuery ? (
          <div className="p-3 space-y-1">
            <p className={`text-xs px-2 py-1 ${textMuted}`}>
              Results for &ldquo;{searchAllQuery}&rdquo;
            </p>
            {searchResults.length === 0 ? (
              <div className={`py-12 text-center ${textMuted}`}>
                <Search size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : (
              searchResults.map((msg: any, idx: number) => {
                const conv = conversations.find((c) => c.conversation.id === msg.conversationId);
                return (
                  <button
                    key={idx}
                    onClick={() => conv && onLoadMessages(conv)}
                    className={`w-full p-3 text-left rounded-xl ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <p className={`text-sm truncate ${textPrimary}`}>{msg.content}</p>
                    <p className={`text-xs mt-0.5 ${textMuted}`}>{formatRelativeTime(msg.created_at)}</p>
                  </button>
                );
              })
            )}
          </div>
        ) : activeSearch === 'conversation' && searchQuery && filteredConversations.length === 0 ? (
          <div className={`py-16 text-center ${textMuted}`}>
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : !activeSearch && filteredConversations.length === 0 ? (
          <div className={`py-16 text-center ${textMuted}`}>
            <Inbox size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="py-1">
            {filteredConversations.map((item, i) => {
              const isActive = selectedConvo?.conversation.id === item.conversation.id;
              return (
                <motion.button
                  key={item.conversation.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onLoadMessages(item)}
                  className={`w-full px-4 py-3.5 flex items-start gap-3 transition-colors text-left group ${
                    isActive
                      ? dk
                        ? 'bg-blue-600/10 border-r-2 border-blue-500'
                        : 'bg-blue-50 border-r-2 border-blue-500'
                      : dk
                        ? 'hover:bg-gray-800/60'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center relative ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >
                    <span className={`text-sm font-semibold ${dk ? 'text-gray-300' : 'text-gray-600'}`}>
                      {(item.conversation.visitor_name || 'A')[0].toUpperCase()}
                    </span>
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-current"
                      style={{ borderColor: dk ? '#111827' : 'white' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${textPrimary}`}>
                        {item.conversation.visitor_name || 'Anonymous'}
                      </p>
                      <p className={`text-xs flex-shrink-0 ${textMuted}`}>
                        {formatRelativeTime(
                          item.latestMessage?.created_at || item.conversation.created_at
                        )}
                      </p>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${textMuted}`}>
                      {item.latestMessage?.content || 'No messages'}
                    </p>
                    {item.conversation.visitor_intent && (
                      <span
                        className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${
                          INTENT_COLORS[item.conversation.visitor_intent] || 'bg-gray-500/15 text-gray-400'
                        }`}
                      >
                        {INTENT_LABELS[item.conversation.visitor_intent]}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => onDeleteConversation(item, e)}
                    className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${
                      dk
                        ? 'hover:bg-red-500/20 text-red-400'
                        : 'hover:bg-red-50 text-red-500'
                    }`}
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
