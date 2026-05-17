import { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft, Send, MessageCircle, CheckCheck, Trash2, Brain,
} from 'lucide-react';
import { INTENT_LABELS, INTENT_COLORS, QUICK_REPLIES, formatTime } from './constants';
import type { ConvoItem, MessageItem } from './types';
import AITraceViewer from '@/components/admin/AITraceViewer';

interface ChatPanelProps {
  selectedConvo: ConvoItem | null;
  messages: MessageItem[];
  replyText: string;
  isDarkMode: boolean;
  onReplyTextChange: (v: string) => void;
  onSendReply: () => void;
  onQuickReply: (reply: string) => void;
  onDeleteConversation: (item: ConvoItem, e: React.MouseEvent) => void;
  onBack: () => void;
}

export default function ChatPanel({
  selectedConvo,
  messages,
  replyText,
  isDarkMode,
  onReplyTextChange,
  onSendReply,
  onQuickReply,
  onDeleteConversation,
  onBack,
}: ChatPanelProps) {
  const dk = isDarkMode;
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = dk ? 'text-white' : 'text-gray-900';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dk
    ? 'bg-gray-800 text-white placeholder-gray-500'
    : 'bg-gray-100 text-gray-900 placeholder-gray-400';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTrace, setShowTrace] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div
        className={`px-4 py-3 ${surface} border-b ${border} flex items-center gap-3 flex-shrink-0`}
      >
        <button
          onClick={onBack}
          className={`md:hidden p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ChevronLeft size={18} className={textMuted} />
        </button>

        {selectedConvo ? (
          <>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <span className={`text-sm font-semibold ${dk ? 'text-gray-300' : 'text-gray-600'}`}>
                {(selectedConvo.conversation.visitor_name || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${textPrimary}`}>
                {selectedConvo.conversation.visitor_name || 'Anonymous'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedConvo.conversation.visitor_email && (
                  <p className={`text-xs truncate ${textMuted}`}>
                    {selectedConvo.conversation.visitor_email}
                  </p>
                )}
                {selectedConvo.conversation.visitor_intent && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      INTENT_COLORS[selectedConvo.conversation.visitor_intent] ||
                      'bg-gray-500/15 text-gray-400'
                    }`}
                  >
                    {INTENT_LABELS[selectedConvo.conversation.visitor_intent]}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className={`text-sm ${textMuted}`}>Select a conversation</p>
        )}

        {selectedConvo && (
          <>
            <button
              onClick={() => setShowTrace(!showTrace)}
              className={`p-1.5 rounded-lg transition-colors ${
                showTrace
                  ? 'bg-purple-500/20 text-purple-500'
                  : dk
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="AI Trace"
            >
              <Brain size={16} />
            </button>
            <button
              onClick={(e) => onDeleteConversation(selectedConvo, e)}
              className={`p-1.5 rounded-lg ${dk ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'} transition-colors`}
              title="Delete conversation"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      {/* AI Trace Panel */}
      {selectedConvo && showTrace && (
        <div className="flex-shrink-0 border-b border-gray-800 max-h-48 overflow-y-auto px-4 py-3">
          <AITraceViewer conversationId={selectedConvo.conversation.id} isDarkMode={dk} />
        </div>
      )}

      {selectedConvo ? (
        <>
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[78%] sm:max-w-[65%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'bot'
                        ? `${dk ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'} rounded-tl-sm`
                        : 'bg-blue-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 ${msg.role === 'bot' ? textMuted : 'text-blue-200'}`}
                    >
                      <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                      {msg.role === 'bot' && <CheckCheck size={11} />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div
            className={`px-4 py-2 border-t ${border} flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-none`}
          >
            {QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => onQuickReply(reply)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition-colors ${
                  dk
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {reply.length > 28 ? `${reply.slice(0, 28)}\u2026` : reply}
              </button>
            ))}
          </div>

          <div className={`px-4 py-3 border-t ${border} ${surface} flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSendReply()}
                placeholder="Type a reply\u2026"
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              <button
                onClick={onSendReply}
                disabled={!replyText.trim()}
                className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-center ${textMuted}`}>
            <MessageCircle size={44} className="mx-auto mb-3 opacity-20" />
            <p className="text-base font-light">Select a conversation</p>
            <p className="text-xs mt-1 opacity-60">to start replying</p>
          </div>
        </div>
      )}
    </div>
  );
}
