import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Send, Lock, ChevronLeft, 
  User, Mail, Search, MoreVertical, CheckCheck,
  Download, Zap, BarChart3, MessageSquare,
  Clock, CheckCircle, Archive, Trash2
} from 'lucide-react';
import { 
  getLatestMessages, 
  getMessages, 
  getAllMessages,
  addMessage,
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
  'hiring': 'Hiring / Job',
  'quote': 'Project Quote',
  'tech': 'Tech Inquiry',
  'partnership': 'Partnership',
  'faq': 'General FAQ',
};

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

const QUICK_REPLIES = [
  "Thanks for reaching out! I'll get back to you shortly.",
  "Could you tell me more about your project?",
  "I'd be happy to help with that. What's your budget range?",
  "Let's schedule a call to discuss further.",
  "Great, I'll send over more details soon!",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<ConvoItem | null>(null);
  const [messages, setMessages] = useState<{role: 'visitor' | 'bot'; content: string; created_at: string}[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabase, setIsSupabase] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [searchAllQuery, setSearchAllQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'analytics'>('messages');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSupabase(isSupabaseConfigured());
  }, []);

  // Subscribe to new conversations in real-time
  useEffect(() => {
    if (!isSupabase || !isAuthorized) return;

    const unsubscribe = subscribeToNewConversations((newConversation) => {
      setConversations(prev => [{
        conversation: newConversation,
        latestMessage: null
      }, ...prev]);
    });

    return () => unsubscribe();
  }, [isSupabase, isAuthorized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(item => {
    if (!item.latestMessage) return false;
    const name = item.conversation.visitor_name || 'Anonymous';
    const email = item.conversation.visitor_email || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const todayConversations = conversations.filter(item => {
    const date = new Date(item.conversation.created_at);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  });

  const searchResults = React.useMemo(() => {
    if (!searchAllQuery.trim()) return [];
    const query = searchAllQuery.toLowerCase();
    return allMessages.filter(m => 
      m.content.toLowerCase().includes(query)
    ).slice(0, 20);
  }, [searchAllQuery, allMessages]);

  const stats = React.useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      return d.toDateString();
    }).reverse();

    const activityByDay = last7Days.map(dateStr => {
      const count = allMessages.filter(m => new Date(m.created_at).toDateString() === dateStr).length;
      return { 
        day: new Date(dateStr).toLocaleDateString([], { weekday: 'short' }), 
        count 
      };
    });

    const todayMsgs = conversations.filter(item => {
      if (!item.latestMessage) return false;
      const date = new Date(item.latestMessage.created_at);
      return date.toDateString() === now.toDateString();
    });
    
    const totalMessages = allMessages.length;
    const visitorMessages = allMessages.filter(m => m.role === 'visitor').length;
    const botMessages = allMessages.filter(m => m.role === 'bot').length;
    
    const intentCounts = Object.keys(INTENT_LABELS).reduce((acc, key) => {
      acc[key] = conversations.filter(c => c.conversation.visitor_intent === key).length;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = conversations.reduce((acc, c) => {
      const status = c.conversation.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalConversations: conversations.length,
      todayConversations: todayMsgs.length,
      totalMessages,
      visitorMessages,
      botMessages,
      intentCounts,
      activityByDay,
      statusCounts,
      avgMessagesPerConvo: conversations.length > 0 ? (totalMessages / conversations.length).toFixed(1) : 0
    };
  }, [conversations, allMessages]);

  const handleLogin = async () => {
    setIsLoading(true);
    
    if (isSupabase) {
      const settings = await getAdminSettings();
      if (settings && settings.admin_password === password) {
        setIsAuthorized(true);
        loadConversations();
        loadAllMessages();
      } else {
        alert('Incorrect password');
      }
    } else {
      setIsAuthorized(true);
      setConversations([
        {
          conversation: {
            id: 'demo-1',
            visitor_name: 'John Smith',
            visitor_email: 'john@example.com',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          latestMessage: {
            content: 'Hi, I want to hire you for a project!',
            created_at: new Date().toISOString()
          }
        },
        {
          conversation: {
            id: 'demo-2',
            visitor_name: 'Sarah Johnson',
            visitor_email: 'sarah@company.com',
            status: 'active',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString()
          },
          latestMessage: {
            content: 'Can you check out my startup idea?',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        },
        {
          conversation: {
            id: 'demo-3',
            visitor_name: 'Mike Chen',
            visitor_email: 'mike@tech.io',
            status: 'active',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString()
          },
          latestMessage: {
            content: 'Thanks for the quick response!',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        }
      ]);
      
      setAllMessages([
        { content: 'Hi, I want to hire you for a project!', role: 'visitor', created_at: new Date().toISOString(), conversationId: 'demo-1' },
        { content: 'Thank you for your interest! Can you tell me more about the project?', role: 'bot', created_at: new Date().toISOString(), conversationId: 'demo-1' },
        { content: 'Can you check out my startup idea?', role: 'visitor', created_at: new Date(Date.now() - 86400000).toISOString(), conversationId: 'demo-2' },
        { content: 'Thanks for the quick response!', role: 'visitor', created_at: new Date(Date.now() - 172800000).toISOString(), conversationId: 'demo-3' },
      ]);
    }
    
    setIsLoading(false);
  };

  const loadConversations = async () => {
    setIsLoading(true);
    const convos = await getLatestMessages();
    setConversations(convos);
    setIsLoading(false);
  };

  const loadAllMessages = async () => {
    if (isSupabase) {
      const msgs = await getAllMessages();
      setAllMessages(msgs);
    }
  };

  const loadMessages = async (convo: ConvoItem) => {
    setSelectedConvo(convo);
    setMobileView('chat');
    if (isSupabase) {
      const msgs = await getMessages(convo.conversation.id);
      setMessages(msgs.map(m => ({ role: m.role as 'visitor' | 'bot', content: m.content, created_at: m.created_at })));
    } else {
      setMessages([
        { role: 'visitor', content: 'Hi, I want to hire you for a project!', created_at: convo.conversation.created_at },
        { role: 'bot', content: 'Thank you for your interest! Can you tell me more about the project?', created_at: convo.conversation.created_at }
      ]);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConvo) return;

    const newMessage = replyText;
    setReplyText('');
    setMessages(prev => [...prev, { role: 'bot', content: newMessage, created_at: new Date().toISOString() }]);

    if (isSupabase) {
      await addMessage(selectedConvo.conversation.id, 'bot', newMessage);
    }
  };

  const handleQuickReply = async (reply: string) => {
    setReplyText(reply);
    if (!selectedConvo) return;
    
    setMessages(prev => [...prev, { role: 'bot', content: reply, created_at: new Date().toISOString() }]);

    if (isSupabase) {
      await addMessage(selectedConvo.conversation.id, 'bot', reply);
    }
  };

  const handleBackToList = () => {
    setSelectedConvo(null);
    setMobileView('list');
  };

  const exportToCSV = () => {
    let csv = 'Name,Email,Last Message,Date,Status\n';
    
    conversations.forEach(item => {
      const name = item.conversation.visitor_name || 'Anonymous';
      const email = item.conversation.visitor_email || '';
      const message = item.latestMessage?.content || '';
      const date = item.conversation.created_at;
      const status = item.conversation.status;
      
      csv += `"${name}","${email}","${message}","${date}","${status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openSearchConversation = (conversationId: string) => {
    const convo = conversations.find(c => c.conversation.id === conversationId);
    if (convo) {
      loadMessages(convo);
    }
  };

  if (!isAuthorized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-gray-50'} px-3 sm:px-4`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8`}
        >
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} flex items-center justify-center mb-3 sm:mb-4`}>
              <Lock size={32} className="text-blue-600 sm:size-40" />
            </div>
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm mt-1.5 sm:mt-2`}>Enter your password to continue</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100'} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center mb-3 sm:mb-4`}
            />
            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className={`w-full mt-3 sm:mt-4 py-2.5 sm:py-3 rounded-xl border ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} font-bold transition-colors text-sm sm:text-base`}
          >
            Back to Portfolio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
      {/* Sidebar - List Style */}
      <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-[30%] lg:w-[28%] max-w-[400px] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex-col`}>
        {/* Sidebar Header */}
        <div className={`p-2 sm:p-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => navigate('/')}
                className={`p-1.5 sm:p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full`}
              >
                <ChevronLeft size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <h1 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin</h1>
            </div>
            <button 
              onClick={exportToCSV}
              className={`p-1.5 sm:p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full`}
              title="Export to CSV"
            >
              <Download size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <button
              onClick={() => { setActiveTab('messages'); setMobileView('list'); }}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'messages' 
                  ? 'bg-blue-600 text-white' 
                  : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); setMobileView('analytics'); }}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              Analytics
            </button>
          </div>
          
          {activeTab === 'messages' && (
            <>
              {/* Search Bar */}
              <div className="mt-1.5 sm:mt-2 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`w-full py-1.5 pl-8 sm:pl-9 pr-2 sm:pr-3 rounded-lg text-xs sm:text-sm ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <Search size={14} className="absolute left-2.5 sm:3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Search All Messages - hidden on mobile */}
              <div className="hidden sm:block mt-1.5 sm:mt-2 relative">
                <input
                  type="text"
                  value={searchAllQuery}
                  onChange={(e) => setSearchAllQuery(e.target.value)}
                  placeholder="Search all messages..."
                  className={`w-full py-1.5 pl-9 pr-3 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100'} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </>
          )}
        </div>

        {/* Conversations List or Analytics */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'analytics' ? (
            <div className="p-3 sm:p-6 space-y-6">
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider mb-4 px-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  System Overview
                </div>
                {/* Modern Stats Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  {/* Conversations Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative overflow-hidden p-5 rounded-3xl ${isDarkMode ? 'bg-blue-600/5 border-blue-500/20' : 'bg-blue-50/50 border-blue-100'} border shadow-sm group transition-all hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-2xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-white shadow-sm'}`}>
                        <MessageCircle size={20} className="text-blue-500" />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                        {stats.todayConversations} New
                      </div>
                    </div>
                    <div>
                      <p className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalConversations}</p>
                      <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Conversations</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                  </motion.div>

                  {/* Messaging Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`relative overflow-hidden p-5 rounded-3xl ${isDarkMode ? 'bg-purple-600/5 border-purple-500/20' : 'bg-purple-50/50 border-purple-100'} border shadow-sm group transition-all hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-2xl ${isDarkMode ? 'bg-purple-500/20' : 'bg-white shadow-sm'}`}>
                        <MessageSquare size={20} className="text-purple-500" />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                        {stats.avgMessagesPerConvo} / avg
                      </div>
                    </div>
                    <div>
                      <p className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalMessages}</p>
                      <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Messages</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                  </motion.div>

                  {/* Efficiency Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`relative overflow-hidden p-5 rounded-3xl ${isDarkMode ? 'bg-amber-600/5 border-amber-500/20' : 'bg-amber-50/50 border-amber-100'} border shadow-sm group transition-all hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-2xl ${isDarkMode ? 'bg-amber-500/20' : 'bg-white shadow-sm'}`}>
                        <Zap size={20} className="text-amber-500" />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                        Automated
                      </div>
                    </div>
                    <div>
                      <p className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalMessages > 0 ? Math.round((stats.botMessages / stats.totalMessages) * 100) : 0}%
                      </p>
                      <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bot Efficiency</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                  </motion.div>

                  {/* Active Status Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`relative overflow-hidden p-5 rounded-3xl ${isDarkMode ? 'bg-green-600/5 border-green-500/20' : 'bg-green-50/50 border-green-100'} border shadow-sm group transition-all hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-2xl ${isDarkMode ? 'bg-green-500/20' : 'bg-white shadow-sm'}`}>
                        <CheckCircle size={20} className="text-green-500" />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                        {stats.statusCounts['archived'] || 0} Archived
                      </div>
                    </div>
                    <div>
                      <p className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.statusCounts['active'] || 0}</p>
                      <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Sessions</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
                  </motion.div>
                </div>
              </div>

              {/* Activity Chart */}
              <div className={`p-4 sm:p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-100'} border shadow-sm`}>
                <div className="flex items-center justify-between mb-6">
                  <div className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Weekly Activity
                  </div>
                  <BarChart3 size={16} className="text-blue-500 opacity-50" />
                </div>
                
                <div className="flex items-end justify-between h-32 gap-1 px-1">
                  {stats.activityByDay.map((item, idx) => {
                    const maxCount = Math.max(...stats.activityByDay.map(d => d.count), 1);
                    const height = (item.count / maxCount) * 100;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full flex flex-col items-center">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {item.count} messages
                          </div>
                          <div 
                            className={`w-full max-w-[24px] rounded-t-md transition-all duration-500 ${
                              idx === stats.activityByDay.length - 1 
                                ? 'bg-blue-600' 
                                : (isDarkMode ? 'bg-blue-500/40 hover:bg-blue-500/60' : 'bg-blue-500/20 hover:bg-blue-500/40')
                            }`}
                            style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                          />
                        </div>
                        <span className={`text-[10px] mt-2 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Intent Breakdown */}
              <div className={`p-4 sm:p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-100'} border shadow-sm`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Traffic by Intent
                </div>
                <div className="space-y-4">
                  {Object.entries(INTENT_LABELS).map(([key, label]) => {
                    const count = stats.intentCounts[key] || 0;
                    const percentage = stats.totalConversations > 0 ? Math.round((count / stats.totalConversations) * 100) : 0;
                    
                    const colors: Record<string, string> = {
                      hiring: 'bg-green-500',
                      quote: 'bg-blue-500',
                      tech: 'bg-purple-500',
                      partnership: 'bg-amber-500',
                      faq: 'bg-gray-500'
                    };

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{count}</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${colors[key] || 'bg-blue-500'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : searchAllQuery ? (
            <div className="p-2">
              <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Search results for "{searchAllQuery}"
              </p>
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No messages found</p>
                </div>
              ) : (
                searchResults.map((msg, idx) => (
                  <button
                    key={idx}
                    onClick={() => openSearchConversation(msg.conversationId)}
                    className={`w-full p-3 text-left rounded-lg mb-1 ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <p className={`text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {msg.content}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatRelativeTime(msg.created_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 sm:p-8 text-center text-gray-500">
              <MessageCircle size={32} className="mx-auto mb-2 sm:mb-4 opacity-30" />
              <p className="text-xs sm:text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((item) => (
              <button
                key={item.conversation.id}
                onClick={() => loadMessages(item)}
                className={`w-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3 transition-colors ${
                  selectedConvo?.conversation.id === item.conversation.id 
                    ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')
                    : (isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')
                }`}
              >
                <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0 relative`}>
                  <User size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-green-500 border-2 border-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.conversation.visitor_name || 'Anonymous'}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatRelativeTime(item.latestMessage?.created_at || item.conversation.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {item.latestMessage?.content || 'No messages'}
                    </p>
                    {item.conversation.visitor_email && (
                      <Mail size={10} className={`flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                  {item.conversation.visitor_intent && (
                    <p className={`text-xs mt-0.5 ${
                      item.conversation.visitor_intent === 'hiring' ? 'text-green-500' :
                      item.conversation.visitor_intent === 'quote' ? 'text-blue-500' :
                      item.conversation.visitor_intent === 'tech' ? 'text-purple-500' :
                      item.conversation.visitor_intent === 'partnership' ? 'text-amber-500' :
                      'text-gray-500'
                    }`}>
                      {INTENT_LABELS[item.conversation.visitor_intent] || item.conversation.visitor_intent}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${mobileView === 'list' || mobileView === 'analytics' ? 'hidden md:flex' : 'flex'} flex-1 flex-col ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
        {/* Static Chat Header */}
        <div className={`p-2 sm:p-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b flex items-center gap-2 sm:gap-3`}>
          {selectedConvo ? (
            <button 
              onClick={handleBackToList}
              className={`md:hidden p-1.5 sm:p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full`}
            >
              <ChevronLeft size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          ) : (
            <div className="w-8 sm:w-10" />
          )}
          <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} flex items-center justify-center`}>
            <User size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
          </div>
          <div className="flex-1 min-w-0">
            {selectedConvo ? (
              <>
                <h2 className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedConvo.conversation.visitor_name || 'Anonymous'}
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {selectedConvo.conversation.visitor_email && (
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {selectedConvo.conversation.visitor_email}
                    </p>
                  )}
                  {selectedConvo.conversation.visitor_intent && (
                    <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                      selectedConvo.conversation.visitor_intent === 'hiring' ? 'bg-green-500/20 text-green-500' :
                      selectedConvo.conversation.visitor_intent === 'quote' ? 'bg-blue-500/20 text-blue-500' :
                      selectedConvo.conversation.visitor_intent === 'tech' ? 'bg-purple-500/20 text-purple-500' :
                      selectedConvo.conversation.visitor_intent === 'partnership' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {INTENT_LABELS[selectedConvo.conversation.visitor_intent] || selectedConvo.conversation.visitor_intent}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <h2 className={`font-medium text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {activeTab === 'analytics' ? 'Analytics' : 'Select a conversation'}
              </h2>
            )}
          </div>
          <button className={`p-1.5 sm:p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full`}>
            <MoreVertical size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Messages or Empty State */}
        {selectedConvo ? (
          <>
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1.5 sm:space-y-2">
              {/* Quick Replies inside scroll - below header */}
              <div className={`p-1.5 sm:p-2 flex gap-1 overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg mb-1.5 sm:mb-2`}>
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(reply)}
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-white text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {reply.split(' ')[0]}...
                  </button>
                ))}
              </div>

              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[75%] p-1.5 sm:p-2 px-2 sm:px-3 rounded-lg relative ${
                    msg.role === 'bot'
                      ? (isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900') + ' rounded-tl-md'
                      : (isDarkMode ? 'bg-blue-600' : 'bg-blue-600') + ' text-white rounded-br-md'
                  }`}>
                    <p className="text-xs sm:text-sm">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <p className="text-[9px] sm:text-[10px]">
                        {formatTime(msg.created_at)}
                      </p>
                      {msg.role === 'bot' && (
                        <CheckCheck size={12} className="sm:size-14" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className={`p-2 sm:p-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type a message..."
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700' : 'bg-gray-50 border-gray-300'} border focus:outline-none focus:border-blue-500`}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="p-2 sm:p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} className="sm:size-18" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-center p-4 sm:p-8 rounded-3xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <MessageCircle size={48} className={`mx-auto mb-2 sm:mb-4 ${isDarkMode ? 'opacity-20' : 'opacity-30'}`} />
              <h2 className={`text-base sm:text-xl font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Dashboard</h2>
              <p className={`text-xs sm:text-sm mt-1 sm:mt-2 max-w-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}