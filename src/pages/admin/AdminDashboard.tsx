import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Inbox, BarChart3, Activity, Bell,
} from 'lucide-react';
import {
  getLatestMessages,
  getMessages,
  getAllMessages,
  addMessage,
  deleteConversation,
  isSupabaseConfigured,
  subscribeToNewConversations,
} from '@/lib/chat-service';
import { signInAdmin } from '@/lib/auth-service';
import { toast } from 'sonner';
import { useTheme } from '@/content/ThemeProvider';
import type { ConvoItem, MessageItem } from './types';
import { INTENT_LABELS } from './constants';
import AdminLogin from './AdminLogin';
import ConversationsList from './ConversationsList';
import ChatPanel from './ChatPanel';
import AnalyticsPanel from './AnalyticsPanel';
import RealTimeMonitor from '@/components/admin/RealTimeMonitor';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import AlertCenter from '@/components/admin/AlertCenter';
import ConfirmModal from './ConfirmModal';

type SidebarTab = 'messages' | 'monitor' | 'analytics' | 'alerts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<ConvoItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabase, setIsSupabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [searchAllQuery, setSearchAllQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState<'conversation' | 'message' | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'chat' | 'monitor' | 'analytics' | 'alerts'>('list');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('messages');
  const [deleteTarget, setDeleteTarget] = useState<ConvoItem | null>(null);

  const dk = isDarkMode;

  useEffect(() => {
    setIsSupabase(isSupabaseConfigured());
  }, []);

  useEffect(() => {
    if (!isSupabase || !isAuthorized) return;
    const unsubscribe = subscribeToNewConversations((newConversation) => {
      setConversations((prev) => [
        { conversation: newConversation, latestMessage: null },
        ...prev,
      ]);
    });
    return () => unsubscribe();
  }, [isSupabase, isAuthorized]);

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((item) => {
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
    return allMessages.filter((m) => m.content.toLowerCase().includes(q)).slice(0, 20);
  }, [searchAllQuery, allMessages]);

  const stats = React.useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      return d.toDateString();
    }).reverse();

    const activityByDay = last7Days.map((dateStr) => ({
      day: new Date(dateStr).toLocaleDateString([], { weekday: 'short' }),
      count: allMessages.filter(
        (m) => new Date(m.created_at).toDateString() === dateStr
      ).length,
    }));

    const todayCount = conversations.filter(
      (item) =>
        item.latestMessage &&
        new Date(item.latestMessage.created_at).toDateString() === now.toDateString()
    ).length;

    const totalMessages = allMessages.length;
    const botMessages = allMessages.filter((m) => m.role === 'bot').length;

    const intentCounts = Object.keys(INTENT_LABELS).reduce(
      (acc, key) => {
        acc[key] = conversations.filter(
          (c) => c.conversation.visitor_intent === key
        ).length;
        return acc;
      },
      {} as Record<string, number>
    );

    const statusCounts = conversations.reduce(
      (acc, c) => {
        const s = c.conversation.status || 'active';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalConversations: conversations.length,
      todayCount,
      totalMessages,
      botMessages,
      visitorMessages: allMessages.filter((m) => m.role === 'visitor').length,
      intentCounts,
      activityByDay,
      statusCounts,
      avgMsgs:
        conversations.length > 0
          ? (totalMessages / conversations.length).toFixed(1)
          : '0',
    };
  }, [conversations, allMessages]);

  const handleLogin = async () => {
    setIsLoading(true);

    if (isSupabase) {
      const result = await signInAdmin(password);
      if (result.success) {
        setIsAuthorized(true);
        loadConversations();
        loadAllMessages();
      } else {
        toast.error(result.error || 'Login failed');
      }
    } else {
      setIsAuthorized(true);
      const now = Date.now();
      setConversations([
        {
          conversation: {
            id: 'demo-1',
            visitor_name: 'John Smith',
            visitor_email: 'john@example.com',
            visitor_intent: 'hiring',
            status: 'active',
            created_at: new Date(now).toISOString(),
            updated_at: new Date(now).toISOString(),
          },
          latestMessage: { content: 'Hi, I want to hire you for a project!', created_at: new Date(now).toISOString() },
        },
        {
          conversation: {
            id: 'demo-2',
            visitor_name: 'Sarah Johnson',
            visitor_email: 'sarah@company.com',
            visitor_intent: 'quote',
            status: 'active',
            created_at: new Date(now - 86400000).toISOString(),
            updated_at: new Date(now - 86400000).toISOString(),
          },
          latestMessage: { content: 'Can you check out my startup idea?', created_at: new Date(now - 86400000).toISOString() },
        },
        {
          conversation: {
            id: 'demo-3',
            visitor_name: 'Mike Chen',
            visitor_email: 'mike@tech.io',
            visitor_intent: 'tech',
            status: 'active',
            created_at: new Date(now - 172800000).toISOString(),
            updated_at: new Date(now - 172800000).toISOString(),
          },
          latestMessage: { content: 'Thanks for the quick response!', created_at: new Date(now - 172800000).toISOString() },
        },
        {
          conversation: {
            id: 'demo-4',
            visitor_name: 'Alice Kim',
            visitor_email: 'alice@dev.co',
            visitor_intent: 'deep_frontend',
            status: 'active',
            created_at: new Date(now - 3600000).toISOString(),
            updated_at: new Date(now - 3600000).toISOString(),
          },
          latestMessage: { content: 'How does the Zustand store in SOLEASE handle cross-store communication?', created_at: new Date(now - 3600000).toISOString() },
        },
        {
          conversation: {
            id: 'demo-5',
            visitor_name: 'David Ochieng',
            visitor_email: 'david@startup.ke',
            visitor_intent: 'deep_backend',
            status: 'active',
            created_at: new Date(now - 7200000).toISOString(),
            updated_at: new Date(now - 7200000).toISOString(),
          },
          latestMessage: { content: 'What drove the MongoDB to PostgreSQL migration in SOLEASE?', created_at: new Date(now - 7200000).toISOString() },
        },
      ]);
      setAllMessages([
        { content: 'Hi, I want to hire you!', role: 'visitor', created_at: new Date(now).toISOString(), conversationId: 'demo-1' },
        { content: 'Tell me more about the project.', role: 'bot', created_at: new Date(now).toISOString(), conversationId: 'demo-1' },
        { content: 'Check out my startup idea?', role: 'visitor', created_at: new Date(now - 86400000).toISOString(), conversationId: 'demo-2' },
        { content: 'Thanks for the quick response!', role: 'visitor', created_at: new Date(now - 172800000).toISOString(), conversationId: 'demo-3' },
        { content: 'I want to explore: Frontend Deep Dive', role: 'visitor', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'Frontend Deep Dive activated!', role: 'bot', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'How does the Zustand store in SOLEASE handle cross-store communication?', role: 'visitor', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'Great question! SOLEASE uses 6 Zustand stores...', role: 'bot', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'What about the Web3.js integration in Greatwall?', role: 'visitor', created_at: new Date(now - 3600000).toISOString(), conversationId: 'demo-4' },
        { content: 'I want to explore: Backend Deep Dive', role: 'visitor', created_at: new Date(now - 7200000).toISOString(), conversationId: 'demo-5' },
        { content: "Backend Deep Dive activated!", role: 'bot', created_at: new Date(now - 7200000).toISOString(), conversationId: 'demo-5' },
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
    setSidebarTab('messages');
    if (isSupabase) {
      const msgs = await getMessages(convo.conversation.id);
      setMessages(
        msgs.map((m) => ({
          role: m.role as 'visitor' | 'bot',
          content: m.content,
          created_at: m.created_at,
        }))
      );
    } else {
      const thread = allMessages
        .filter((m) => m.conversationId === convo.conversation.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m) => ({ role: m.role as 'visitor' | 'bot', content: m.content, created_at: m.created_at }));
      setMessages(thread.length > 0 ? thread : [
        { role: 'visitor', content: convo.latestMessage?.content || 'Hello!', created_at: convo.conversation.created_at },
      ]);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConvo) return;
    const msg = replyText;
    setReplyText('');
    setMessages((prev) => [
      ...prev,
      { role: 'bot', content: msg, created_at: new Date().toISOString() },
    ]);
    if (isSupabase)
      await addMessage(selectedConvo.conversation.id, 'bot', msg);
  };

  const handleQuickReply = async (reply: string) => {
    if (!selectedConvo) return;
    setMessages((prev) => [
      ...prev,
      { role: 'bot', content: reply, created_at: new Date().toISOString() },
    ]);
    if (isSupabase)
      await addMessage(selectedConvo.conversation.id, 'bot', reply);
  };

  const handleDeleteConversation = async (item: ConvoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const item = deleteTarget;
    setDeleteTarget(null);

    if (isSupabase) {
      const ok = await deleteConversation(item.conversation.id);
      if (!ok) {
        toast.error('Failed to delete conversation');
        return;
      }
    }

    setConversations((prev) => prev.filter((c) => c.conversation.id !== item.conversation.id));
    setAllMessages((prev) => prev.filter((m) => m.conversationId !== item.conversation.id));
    if (selectedConvo?.conversation.id === item.conversation.id) {
      setSelectedConvo(null);
      setMessages([]);
      setMobileTab('list');
    }
  };

  const exportToCSV = () => {
    let csv = 'Name,Email,Last Message,Date,Status\n';
    conversations.forEach((item) => {
      csv += `"${item.conversation.visitor_name || 'Anonymous'}","${item.conversation.visitor_email || ''}","${item.latestMessage?.content || ''}","${item.conversation.created_at}","${item.conversation.status}"\n`;
    });
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bg = dk ? 'bg-gray-950' : 'bg-gray-50';
  const surface = dk ? 'bg-gray-900' : 'bg-white';
  const border = dk ? 'border-gray-800' : 'border-gray-200';
  const textMuted = dk ? 'text-gray-400' : 'text-gray-500';

  if (!isAuthorized) {
    return (
      <AdminLogin
        password={password}
        onPasswordChange={setPassword}
        isLoading={isLoading}
        onLogin={handleLogin}
        onBack={() => navigate('/')}
        isDarkMode={dk}
      />
    );
  }

  const sidebarTabs: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'messages', label: 'Messages', icon: <Inbox size={16} /> },
    { id: 'monitor', label: 'Monitor', icon: <Activity size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell size={16} /> },
  ];

  const renderCenterContent = () => {
    switch (sidebarTab) {
      case 'monitor':
        return <RealTimeMonitor isDarkMode={dk} initialConversationCount={conversations.length} />;
      case 'analytics':
        return <AnalyticsDashboard isDarkMode={dk} />;
      case 'alerts':
        return <AlertCenter isDarkMode={dk} />;
      default:
        return (
          <ChatPanel
            selectedConvo={selectedConvo}
            messages={messages}
            replyText={replyText}
            isDarkMode={dk}
            onReplyTextChange={setReplyText}
            onSendReply={handleSendReply}
            onQuickReply={handleQuickReply}
            onDeleteConversation={handleDeleteConversation}
            onBack={() => setSelectedConvo(null)}
          />
        );
    }
  };

  const renderMobileContent = () => {
    switch (mobileTab) {
      case 'chat':
        return (
          <ChatPanel
            selectedConvo={selectedConvo}
            messages={messages}
            replyText={replyText}
            isDarkMode={dk}
            onReplyTextChange={setReplyText}
            onSendReply={handleSendReply}
            onQuickReply={handleQuickReply}
            onDeleteConversation={handleDeleteConversation}
            onBack={() => { setSelectedConvo(null); setMobileTab('list'); }}
          />
        );
      case 'monitor':
        return <RealTimeMonitor isDarkMode={dk} onBack={() => setMobileTab('list')} initialConversationCount={conversations.length} />;
      case 'analytics':
        return <AnalyticsDashboard isDarkMode={dk} onBack={() => setMobileTab('list')} />;
      case 'alerts':
        return <AlertCenter isDarkMode={dk} onBack={() => setMobileTab('list')} />;
      default:
        return (
          <ConversationsList
            conversations={conversations}
            filteredConversations={filteredConversations}
            selectedConvo={selectedConvo}
            searchQuery={searchQuery}
            searchAllQuery={searchAllQuery}
            allMessages={allMessages}
            searchResults={searchResults}
            activeSearch={activeSearch}
            isDarkMode={dk}
            onLoadMessages={loadMessages}
            onDeleteConversation={handleDeleteConversation}
            onExportCSV={exportToCSV}
            onSetActiveSearch={setActiveSearch}
            onSearchQueryChange={setSearchQuery}
            onSearchAllQueryChange={setSearchAllQuery}
            onBack={() => navigate('/')}
          />
        );
    }
  };

  return (
    <div className={`h-screen flex flex-col ${bg} overflow-hidden`}>
      {/* Desktop: sidebar + center + optional right panel */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Sidebar: tab bar + messages list */}
        <div className={`w-72 lg:w-80 flex-shrink-0 flex flex-col ${surface} border-r ${border}`}>
          <div className={`flex border-b ${border} px-2 py-1.5 gap-1`}>
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  sidebarTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : dk
                      ? 'text-gray-400 hover:bg-gray-800'
                      : 'text-gray-500 hover:bg-gray-100'
                }`}
                title={tab.label}
              >
                {tab.icon}
                <span className="mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ConversationsList
              conversations={conversations}
              filteredConversations={filteredConversations}
              selectedConvo={selectedConvo}
              searchQuery={searchQuery}
              searchAllQuery={searchAllQuery}
              allMessages={allMessages}
              searchResults={searchResults}
              activeSearch={activeSearch}
              isDarkMode={dk}
              onLoadMessages={loadMessages}
              onDeleteConversation={handleDeleteConversation}
              onExportCSV={exportToCSV}
              onSetActiveSearch={setActiveSearch}
              onSearchQueryChange={setSearchQuery}
              onSearchAllQueryChange={setSearchAllQuery}
              onBack={() => navigate('/')}
            />
          </div>
        </div>

        {/* Center: content switches based on active tab */}
        <div className="flex-1 min-w-0 flex flex-col">
          {renderCenterContent()}
        </div>

        {/* Right: basic analytics (only when viewing messages with a conversation) */}
        {sidebarTab === 'messages' && selectedConvo && (
          <div className={`hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col ${surface} border-l ${border}`}>
            <AnalyticsPanel stats={stats} conversations={conversations} isDarkMode={dk} />
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Conversation"
        message={`Delete conversation with ${deleteTarget?.conversation.visitor_name || 'Anonymous'}? This cannot be undone.`}
        isDarkMode={dk}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Mobile layout */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          {renderMobileContent()}
        </div>

        {mobileTab !== 'chat' && (
          <div className={`flex-shrink-0 ${surface} border-t ${border} flex safe-area-pb`}>
            {[
              { id: 'list', icon: Inbox, label: 'Messages' },
              { id: 'monitor', icon: Activity, label: 'Monitor' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'alerts', icon: Bell, label: 'Alerts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                  mobileTab === tab.id ? 'text-blue-500' : textMuted
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
