import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Lock, ChevronLeft,
  User, Mail, Search, CheckCheck,
  Download, Zap, BarChart3, MessageSquare,
  CheckCircle, Inbox, Trash2
} from 'lucide-react';
import {
  getLatestMessages,
  getMessages,
  getAllMessages,
  addMessage,
  deleteConversation,
  getAdminSettings,
  isSupabaseConfigured,
  subscribeToNewConversations
} from '@/lib/chat-service';
import { useTheme } from '@/content/ThemeProvider';

interface ConvoItem {
  conversation: {
    id: string;
    visitor_name: string | null;
    visitor_email: string | null;
    visitor_intent: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
  latestMessage: {
    content: string;
    created_at: string;
  } | null;
}

const INTENT_LABELS: Record<string, string> = {
  hiring: 'Hiring / Job',
  quote: 'Project Quote',
  tech: 'Tech Inquiry',
  partnership: 'Partnership',
  faq: 'General FAQ',
  deep_frontend: '🎯 Frontend Deep Dive',
  deep_backend: '⚙️ Backend Deep Dive',
  deep_fullstack: '🔧 Fullstack Deep Dive',
  deep_software: '🏗️ Software Deep Dive',
};

const INTENT_COLORS: Record<string, string> = {
  hiring: 'bg-emerald-500/15 text-emerald-500',
  quote: 'bg-blue-500/15 text-blue-500',
  tech: 'bg-violet-500/15 text-violet-500',
  partnership: 'bg-amber-500/15 text-amber-500',
  faq: 'bg-gray-500/15 text-gray-400',
  deep_frontend: 'bg-purple-500/15 text-purple-400',
  deep_backend: 'bg-cyan-500/15 text-cyan-400',
  deep_fullstack: 'bg-pink-500/15 text-pink-400',
  deep_software: 'bg-orange-500/15 text-orange-400',
};

const QUICK_REPLIES = [
  "Thanks for reaching out! I'll get back to you shortly.",
  "Could you tell me more about your project?",
  "I'd be happy to help. What's your budget range?",
  "Let's schedule a call to discuss further.",
  "Great, I'll send over more details soon!",
];

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<ConvoItem | null>(null);
  const [messages, setMessages] = useState<{ role: 'visitor' | 'bot'; content: string; created_at: string }[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabase, setIsSupabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [searchAllQuery, setSearchAllQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState<'conversation' | 'message' | null>(null);
  // Mobile: 'list' | 'chat' | 'analytics'
  const [mobileTab, setMobileTab] = useState<'list' | 'chat' | 'analytics'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dk = isDarkMode;

  useEffect(() => { setIsSupabase(isSupabaseConfigured()); }, []);

  useEffect(() => {
    if (!isSupabase || !isAuthorized) return;
    const unsubscribe = subscribeToNewConversations((newConversation) => {
      setConversations(prev => [{ conversation: newConversation, latestMessage: null }, ...prev]);
    });
    return () => unsubscribe();
  }, [isSupabase, isAuthorized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(item => {
      if (!item.latestMessage) return false;
      return (
        (item.conversation.visitor_name || 'anonymous').toLowerCase().includes(q) ||
        (item.conversation.visitor_email || '').toLowerCase().includes(q)
      );
    });
  }, [searchQuery, conversations]);

  const searchResults = React.useMemo(() => {
    if (!searchAllQuery.trim()) return [];
    const q = searchAllQuery.toLowerCase();
    return allMessages.filter(m => m.content.toLowerCase().includes(q)).slice(0, 20);
  }, [searchAllQuery, allMessages]);

  const stats = React.useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(now.getDate() - i); return d.toDateString();
    }).reverse();

    const activityByDay = last7Days.map(dateStr => ({
      day: new Date(dateStr).toLocaleDateString([], { weekday: 'short' }),
      count: allMessages.filter(m => new Date(m.created_at).toDateString() === dateStr).length,
    }));

    const todayCount = conversations.filter(item =>
      item.latestMessage && new Date(item.latestMessage.created_at).toDateString() === now.toDateString()
    ).length;

    const totalMessages = allMessages.length;
    const botMessages = allMessages.filter(m => m.role === 'bot').length;

    const intentCounts = Object.keys(INTENT_LABELS).reduce((acc, key) => {
      acc[key] = conversations.filter(c => c.conversation.visitor_intent === key).length;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = conversations.reduce((acc, c) => {
      const s = c.conversation.status || 'active';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConversations: conversations.length,
      todayCount,
      totalMessages,
      botMessages,
      visitorMessages: allMessages.filter(m => m.role === 'visitor').length,
      intentCounts,
      activityByDay,
      statusCounts,
      avgMsgs: conversations.length > 0 ? (totalMessages / conversations.length).toFixed(1) : '0',
    };
  }, [conversations, allMessages]);

  const handleLogin = async () => {
    setIsLoading(true);
    const defaultAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (isSupabase) {
      const settings = await getAdminSettings();
      const validPassword = settings?.admin_password || defaultAdminPassword;
      
      if (password === validPassword) {
        setIsAuthorized(true);
        loadConversations();
        loadAllMessages();
      } else {
        alert('Incorrect password');
      }
    } else {
      setIsAuthorized(true);
      const now = Date.now();
      setConversations([
        { conversation: { id: 'demo-1', visitor_name: 'John Smith', visitor_email: 'john@example.com', visitor_intent: 'hiring', status: 'active', created_at: new Date(now).toISOString(), updated_at: new Date(now).toISOString() }, latestMessage: { content: 'Hi, I want to hire you for a project!', created_at: new Date(now).toISOString() } },
        { conversation: { id: 'demo-2', visitor_name: 'Sarah Johnson', visitor_email: 'sarah@company.com', visitor_intent: 'quote', status: 'active', created_at: new Date(now - 86400000).toISOString(), updated_at: new Date(now - 86400000).toISOString() }, latestMessage: { content: 'Can you check out my startup idea?', created_at: new Date(now - 86400000).toISOString() } },
        { conversation: { id: 'demo-3', visitor_name: 'Mike Chen', visitor_email: 'mike@tech.io', visitor_intent: 'tech', status: 'active', created_at: new Date(now - 172800000).toISOString(), updated_at: new Date(now - 172800000).toISOString() }, latestMessage: { content: 'Thanks for the quick response!', created_at: new Date(now - 172800000).toISOString() } },
        { conversation: { id: 'demo-4', visitor_name: 'Alice Kim', visitor_email: 'alice@dev.co', visitor_intent: 'deep_frontend', status: 'active', created_at: new Date(now - 3600000).toISOString(), updated_at: new Date(now - 3600000).toISOString() }, latestMessage: { content: 'How does the Zustand store in SOLEASE handle cross-store communication?', created_at: new Date(now - 3600000).toISOString() } },
        { conversation: { id: 'demo-5', visitor_name: 'David Ochieng', visitor_email: 'david@startup.ke', visitor_intent: 'deep_backend', status: 'active', created_at: new Date(now - 7200000).toISOString(), updated_at: new Date(now - 7200000).toISOString() }, latestMessage: { content: 'What drove the MongoDB to PostgreSQL migration in SOLEASE?', created_at: new Date(now - 7200000).toISOString() } },
      ]);
      setAllMessages([
        { content: 'Hi, I want to hire you!', role: 'visitor', created_at: new Date(now).toISOString(), conversationId: 'demo-1' },
        { content: 'Tell me more about the project.', role: 'bot', created_at: new Date(now).toISOString(), conversationId: 'demo-1' },
        { content: 'Check out my startup idea?', role: 'visitor', created_at: new Date(now - 86400000).toISOString(), conversationId: 'demo-2' },
        { content: 'Thanks for the quick response!', role: 'visitor', created_at: new Date(now - 172800000).toISOString(), conversationId: 'demo-3' },
        { content: 'I want to explore: 🎯 Frontend Deep Dive', role: 'visitor', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: '🎯 Frontend Deep Dive activated! I can walk you through the frontend architecture...', role: 'bot', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'How does the Zustand store in SOLEASE handle cross-store communication?', role: 'visitor', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'Great question! SOLEASE uses 6 Zustand stores (auth, ticket, notification, ui, analytics, admin). Cross-store communication creates implicit dependencies — for example, authStore.updateProfile calls notificationStore.addNotification directly via zustand\'s vanilla API. This works but couples the stores. A cleaner approach would be using zustand\'s subscribe mechanism or a lightweight event bus.', role: 'bot', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'What about the Web3.js integration in Greatwall — how does the frontend interact with the smart contracts?', role: 'visitor', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'I want to explore: ⚙️ Backend Deep Dive', role: 'visitor', created_at: new Date(now - 7200000).toISOString(), conversationId: 'demo-5' },
        { content: '⚙️ Backend Deep Dive activated! Let\'s explore the backend systems...', role: 'bot', created_at: new Date(now - 7200000).toISOString(), conversationId: 'demo-5' },
        { content: 'What drove the MongoDB to PostgreSQL migration in SOLEASE?', role: 'visitor', created_at: new Date(now - 7200000).toISOString(), conversationId: 'demo-5' },
      ]);
    }
    setIsLoading(false);
  };

  const loadConversations = async () => {
    setIsLoading(true);
    setConversations(await getLatestMessages());
    setIsLoading(false);
  };

  const loadAllMessages = async () => {
    if (isSupabase) setAllMessages(await getAllMessages());
  };

  const loadMessages = async (convo: ConvoItem) => {
    setSelectedConvo(convo);
    setMobileTab('chat');
    if (isSupabase) {
      const msgs = await getMessages(convo.conversation.id);
      setMessages(msgs.map(m => ({ role: m.role as 'visitor' | 'bot', content: m.content, created_at: m.created_at })));
    } else {
      const thread = allMessages
        .filter(m => m.conversationId === convo.conversation.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(m => ({ role: m.role as 'visitor' | 'bot', content: m.content, created_at: m.created_at }));
      if (thread.length === 0) {
        setMessages([
          { role: 'visitor', content: convo.latestMessage?.content || 'Hello!', created_at: convo.conversation.created_at },
        ]);
      } else {
        setMessages(thread);
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConvo) return;
    const msg = replyText;
    setReplyText('');
    setMessages(prev => [...prev, { role: 'bot', content: msg, created_at: new Date().toISOString() }]);
    if (isSupabase) await addMessage(selectedConvo.conversation.id, 'bot', msg);
  };

  const handleQuickReply = async (reply: string) => {
    if (!selectedConvo) return;
    setMessages(prev => [...prev, { role: 'bot', content: reply, created_at: new Date().toISOString() }]);
    if (isSupabase) await addMessage(selectedConvo.conversation.id, 'bot', reply);
  };

  const handleDeleteConversation = async (item: ConvoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete conversation with ${item.conversation.visitor_name || 'Anonymous'}? All messages will be permanently removed.`)) return;

    if (isSupabase) {
      await deleteConversation(item.conversation.id);
    }

    setConversations(prev => prev.filter(c => c.conversation.id !== item.conversation.id));
    setAllMessages(prev => prev.filter(m => m.conversationId !== item.conversation.id));
    if (selectedConvo?.conversation.id === item.conversation.id) {
      setSelectedConvo(null);
      setMessages([]);
      setMobileTab('list');
    }
  };

  const exportToCSV = () => {
    let csv = 'Name,Email,Last Message,Date,Status\n';
    conversations.forEach(item => {
      csv += `"${item.conversation.visitor_name || 'Anonymous'}","${item.conversation.visitor_email || ''}","${item.latestMessage?.content || ''}","${item.conversation.created_at}","${item.conversation.status}"\n`;
    });
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Colors ───────────────────────────────────────────────
  const bg = dk ? 'bg-gray-950' : 'bg-gray-50';
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = dk ? 'text-white' : 'text-gray-900';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dk ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400';

  // ─── Login Screen ─────────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg} px-4`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`w-full max-w-sm ${surface} rounded-3xl shadow-2xl overflow-hidden`}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-600" />
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className={`w-16 h-16 rounded-2xl ${dk ? 'bg-blue-500/10' : 'bg-blue-50'} flex items-center justify-center mb-4 ring-1 ${dk ? 'ring-blue-500/20' : 'ring-blue-200'}`}>
                <Lock size={26} className="text-blue-500" />
              </div>
              <h1 className={`text-2xl font-bold tracking-tight ${textPrimary}`}>Admin</h1>
              <p className={`text-sm mt-1 ${textMuted}`}>Secure access required</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (default: admin123)"
                autoFocus
                className={`w-full px-4 py-3 rounded-xl ${inputBg} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              <button
                type="submit"
                disabled={!password.trim() || isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isLoading ? 'Verifying…' : 'Continue'}
              </button>
            </form>

            <button
              onClick={() => navigate('/')}
              className={`w-full mt-3 py-3 rounded-xl text-sm font-medium ${dk ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50'} transition-colors`}
            >
              ← Back to Portfolio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Conversations List Panel ─────────────────────────────
  const ConversationsList = () => (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className={`px-4 pt-4 pb-3 ${surface} border-b ${border} flex-shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className={`p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>
              <ChevronLeft size={18} className={textMuted} />
            </button>
            <h1 className={`text-base font-semibold ${textPrimary}`}>Messages</h1>
            {conversations.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dk ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                {conversations.length}
              </span>
            )}
          </div>
          <button onClick={exportToCSV} title="Export CSV" className={`p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>
            <Download size={16} className={textMuted} />
          </button>
        </div>

        {/* Search Toggle Buttons */}
        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => { setActiveSearch(activeSearch === 'conversation' ? null : 'conversation'); setSearchAllQuery(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSearch === 'conversation'
                ? 'bg-blue-600 text-white'
                : dk ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Search size={12} />
            <span>Conversations</span>
          </button>
          <button
            onClick={() => { setActiveSearch(activeSearch === 'message' ? null : 'message'); setSearchQuery(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSearch === 'message'
                ? 'bg-blue-600 text-white'
                : dk ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
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
              onChange={(e) => setSearchAllQuery(e.target.value)}
              placeholder="Search message content…"
              autoFocus
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            />
          </div>
        )}
      </div>

      {/* List body */}
      <div className="flex-1 overflow-y-auto">
        {activeSearch === 'message' && searchAllQuery ? (
          <div className="p-3 space-y-1">
            <p className={`text-xs px-2 py-1 ${textMuted}`}>Results for "{searchAllQuery}"</p>
            {searchResults.length === 0 ? (
              <div className={`py-12 text-center ${textMuted}`}>
                <Search size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : searchResults.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => { const c = conversations.find(c => c.conversation.id === msg.conversationId); if (c) loadMessages(c); }}
                className={`w-full p-3 text-left rounded-xl ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
              >
                <p className={`text-sm truncate ${textPrimary}`}>{msg.content}</p>
                <p className={`text-xs mt-0.5 ${textMuted}`}>{formatRelativeTime(msg.created_at)}</p>
              </button>
            ))}
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
                  onClick={() => loadMessages(item)}
                  className={`w-full px-4 py-3.5 flex items-start gap-3 transition-colors text-left group ${
                    isActive
                      ? (dk ? 'bg-blue-600/10 border-r-2 border-blue-500' : 'bg-blue-50 border-r-2 border-blue-500')
                      : (dk ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50')
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center relative ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <span className={`text-sm font-semibold ${dk ? 'text-gray-300' : 'text-gray-600'}`}>
                      {(item.conversation.visitor_name || 'A')[0].toUpperCase()}
                    </span>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-current" style={{ borderColor: dk ? '#111827' : 'white' }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${textPrimary}`}>
                        {item.conversation.visitor_name || 'Anonymous'}
                      </p>
                      <p className={`text-xs flex-shrink-0 ${textMuted}`}>
                        {formatRelativeTime(item.latestMessage?.created_at || item.conversation.created_at)}
                      </p>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${textMuted}`}>
                      {item.latestMessage?.content || 'No messages'}
                    </p>
                    {item.conversation.visitor_intent && (
                      <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${INTENT_COLORS[item.conversation.visitor_intent] || 'bg-gray-500/15 text-gray-400'}`}>
                        {INTENT_LABELS[item.conversation.visitor_intent]}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(item, e)}
                    className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${
                      dk ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
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

  // ─── Analytics Panel ──────────────────────────────────────
  const AnalyticsPanel = () => (
    <div className="flex flex-col h-full">
      <div className={`px-4 pt-4 pb-3 ${surface} border-b ${border} flex-shrink-0 flex items-center gap-2`}>
        {/* Back button on mobile */}
        <button onClick={() => setMobileTab('list')} className={`md:hidden p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
          <ChevronLeft size={18} className={textMuted} />
        </button>
        <h2 className={`text-base font-semibold ${textPrimary}`}>Analytics</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Conversations', value: stats.totalConversations, sub: `${stats.todayCount} today`, icon: MessageCircle, color: 'blue', },
            { label: 'Messages', value: stats.totalMessages, sub: `${stats.avgMsgs} avg`, icon: MessageSquare, color: 'violet', },
            { label: 'Bot Efficiency', value: `${stats.totalMessages > 0 ? Math.round((stats.botMessages / stats.totalMessages) * 100) : 0}%`, sub: 'Automated', icon: Zap, color: 'amber', },
            { label: 'Active', value: stats.statusCounts['active'] || 0, sub: `${stats.statusCounts['archived'] || 0} archived`, icon: CheckCircle, color: 'emerald', },
          ].map((s, i) => {
            const colorMap: Record<string, string> = {
              blue: dk ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600',
              violet: dk ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600',
              amber: dk ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
              emerald: dk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
            };
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`${surface} rounded-2xl p-4 border ${border}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${colorMap[s.color]}`}>
                  <s.icon size={16} />
                </div>
                <p className={`text-2xl font-bold tracking-tight ${textPrimary}`}>{s.value}</p>
                <p className={`text-xs font-medium mt-0.5 ${textMuted}`}>{s.label}</p>
                <p className={`text-[11px] mt-1 ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{s.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Activity Chart */}
        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>7-Day Activity</p>
            <BarChart3 size={14} className="text-blue-500 opacity-50" />
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {stats.activityByDay.map((item, idx) => {
              const maxCount = Math.max(...stats.activityByDay.map(d => d.count), 1);
              const pct = (item.count / maxCount) * 100;
              const isToday = idx === stats.activityByDay.length - 1;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative">
                  {item.count > 0 && (
                    <div className={`absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] bg-gray-900 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                      {item.count}
                    </div>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                    className={`w-full rounded-t-md ${isToday ? 'bg-blue-500' : dk ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-200 group-hover:bg-gray-300'} transition-colors`}
                    style={{ minHeight: item.count > 0 ? 3 : 0 }}
                  />
                  <span className={`text-[10px] mt-1.5 font-medium ${dk ? 'text-gray-600' : 'text-gray-400'} ${isToday ? '!text-blue-500' : ''}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intent breakdown */}
        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>Traffic by Intent</p>
          <div className="space-y-3.5">
            {Object.entries(INTENT_LABELS).map(([key, label]) => {
              const count = stats.intentCounts[key] || 0;
              const pct = stats.totalConversations > 0 ? Math.round((count / stats.totalConversations) * 100) : 0;
              const barColors: Record<string, string> = { hiring: 'bg-emerald-500', quote: 'bg-blue-500', tech: 'bg-violet-500', partnership: 'bg-amber-500', faq: 'bg-gray-400', deep_frontend: 'bg-purple-500', deep_backend: 'bg-cyan-500', deep_fullstack: 'bg-pink-500', deep_software: 'bg-orange-500' };
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs font-medium ${textPrimary}`}>{label}</span>
                    <span className={`text-xs ${textMuted}`}>{count}</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}>
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

        {/* AI Assistant Enhancements — What's New */}
        <div className={`${surface} rounded-2xl p-4 border ${border}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>AI Assistant Updates</p>
          </div>
          <div className="space-y-3">
            <div className={`p-3 rounded-xl ${dk ? 'bg-purple-900/10 border border-purple-900/20' : 'bg-purple-50 border border-purple-100'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">🔬</span>
                <p className={`text-sm font-semibold ${textPrimary}`}>Deep Dive Insights Mode</p>
                <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">New</span>
              </div>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                Visitors can explore James's projects with deep technical analysis — like ChatGPT for his codebase.
                <br /><span className="font-medium">4 focus areas:</span> Frontend, Backend, Fullstack, Software Engineering
                <br /><span className="font-medium">7 projects</span> with architecture, design decisions, and trade-offs
                <br />Free-form Q&A with AI-generated deep technical insights
              </p>
            </div>

            <div className={`p-3 rounded-xl ${dk ? 'bg-blue-900/10 border border-blue-900/20' : 'bg-blue-50 border border-blue-100'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">📚</span>
                <p className={`text-sm font-semibold ${textPrimary}`}>Enriched Project Knowledge</p>
                <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">New</span>
              </div>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                All 7 projects now have deep technical data including architecture, design decisions, challenges, and role-specific interview focus areas extracted from the actual GitHub repos.
              </p>
            </div>

            <div className={`p-3 rounded-xl ${dk ? 'bg-amber-900/10 border border-amber-900/20' : 'bg-amber-50 border border-amber-100'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">💬</span>
                <p className={`text-sm font-semibold ${textPrimary}`}>Smarter FAQ Responses</p>
                <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">Updated</span>
              </div>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                FAQ knowledge base expanded to cover all 7 projects. New entries for deep dive intent detection. Welcome message updated with deep dive mode option.
              </p>
            </div>

            <div className={`p-3 rounded-xl ${dk ? 'bg-emerald-900/10 border border-emerald-900/20' : 'bg-emerald-50 border border-emerald-100'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">🤖</span>
                <p className={`text-sm font-semibold ${textPrimary}`}>Gemini Prompt Engineering</p>
                <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">Updated</span>
              </div>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                New specialized prompts for deep dive technical analysis. Includes focus-area-specific context, project architecture details, and trade-off evaluation. Fallback responses serve as backup when API is unavailable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Chat Panel ───────────────────────────────────────────
  const ChatPanel = () => (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className={`px-4 py-3 ${surface} border-b ${border} flex items-center gap-3 flex-shrink-0`}>
        <button
          onClick={() => { setSelectedConvo(null); setMobileTab('list'); }}
          className={`md:hidden p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ChevronLeft size={18} className={textMuted} />
        </button>

        {selectedConvo ? (
          <>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}>
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
                  <p className={`text-xs truncate ${textMuted}`}>{selectedConvo.conversation.visitor_email}</p>
                )}
                {selectedConvo.conversation.visitor_intent && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${INTENT_COLORS[selectedConvo.conversation.visitor_intent] || 'bg-gray-500/15 text-gray-400'}`}>
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
          <button
            onClick={(e) => handleDeleteConversation(selectedConvo, e)}
            className={`p-1.5 rounded-lg ${dk ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'} transition-colors`}
            title="Delete conversation"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

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
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.role === 'bot' ? textMuted : 'text-blue-200'}`}>
                      <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                      {msg.role === 'bot' && <CheckCheck size={11} />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies - pinned above input */}
          <div className={`px-4 py-2 border-t ${border} flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-none`}>
            {QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition-colors ${
                  dk
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {reply.length > 28 ? reply.slice(0, 28) + '…' : reply}
              </button>
            ))}
          </div>

          {/* Reply input */}
          <div className={`px-4 py-3 border-t ${border} ${surface} flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                placeholder="Type a reply…"
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              <button
                onClick={handleSendReply}
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

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className={`h-screen flex flex-col ${bg} overflow-hidden`}>
      {/* 
        DESKTOP: 3-column layout (sidebar | chat | optional detail)
        MOBILE: tab-switched single panel + bottom nav
      */}

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Left sidebar: conversations */}
        <div className={`w-72 lg:w-80 flex-shrink-0 flex flex-col ${surface} border-r ${border}`}>
          <ConversationsList />
        </div>

        {/* Center: chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ChatPanel />
        </div>

        {/* Right: analytics (collapsible, visible on lg+) */}
        <div className={`hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col ${surface} border-l ${border}`}>
          <AnalyticsPanel />
        </div>
      </div>

      {/* Mobile: tab-switched panels */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === 'list' && <ConversationsList />}
          {mobileTab === 'chat' && <ChatPanel />}
          {mobileTab === 'analytics' && <AnalyticsPanel />}
        </div>

        {/* Bottom tab bar */}
        {mobileTab !== 'chat' && (
          <div className={`flex-shrink-0 ${surface} border-t ${border} flex safe-area-pb`}>
            {[
              { id: 'list', icon: Inbox, label: 'Messages' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                  mobileTab === tab.id
                    ? 'text-blue-500'
                    : textMuted
                }`}
              >
                <tab.icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}