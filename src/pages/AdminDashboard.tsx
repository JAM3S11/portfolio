import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Send, Lock, ChevronLeft, 
  User, Mail, Search, MoreVertical, CheckCheck
} from 'lucide-react';
import { 
  getLatestMessages, 
  getMessages, 
  addMessage,
  getAdminSettings,
  isSupabaseConfigured 
} from '@/lib/chat-service';
import { useTheme } from '@/content/ThemeProvider';

interface ConvoItem {
  conversation: {
    id: string;
    visitor_name: string | null;
    visitor_email: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
  latestMessage: {
    content: string;
    created_at: string;
  } | null;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

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
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSupabase(isSupabaseConfigured());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(item => {
    const name = item.conversation.visitor_name || 'Anonymous';
    const email = item.conversation.visitor_email || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const handleLogin = async () => {
    setIsLoading(true);
    
    if (isSupabase) {
      const settings = await getAdminSettings();
      if (settings && settings.admin_password === password) {
        setIsAuthorized(true);
        loadConversations();
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
    }
    
    setIsLoading(false);
  };

  const loadConversations = async () => {
    setIsLoading(true);
    const convos = await getLatestMessages();
    setConversations(convos);
    setIsLoading(false);
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

  const handleBackToList = () => {
    setSelectedConvo(null);
    setMobileView('list');
  };

  if (!isAuthorized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-gray-50'} px-4`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl shadow-2xl p-8`}
        >
          <div className="flex flex-col items-center mb-8">
            <div className={`w-20 h-20 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} flex items-center justify-center mb-4`}>
              <Lock size={40} className="text-blue-600" />
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>Enter your password to continue</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              className={`w-full px-4 py-3 rounded-xl ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100'} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center mb-4`}
            />
            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className={`w-full mt-4 py-3 rounded-xl border ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} font-bold transition-colors`}
          >
            Back to Portfolio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
      {/* Sidebar - List Style */}
      <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-[30%] lg:w-[28%] max-w-[400px] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex-col`}>
        {/* Sidebar Header */}
        <div className={`p-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full`}
              >
                <ChevronLeft size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h1>
            </div>
            <button className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full`}>
              <MoreVertical size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mt-3 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className={`w-full py-1.5 pl-9 pr-3 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100'} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((item) => (
              <button
                key={item.conversation.id}
                onClick={() => loadMessages(item)}
                className={`w-full p-3 flex items-center gap-3 transition-colors ${
                  selectedConvo?.conversation.id === item.conversation.id 
                    ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')
                    : (isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0`}>
                  <User size={22} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.conversation.visitor_name || 'Anonymous'}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatTime(item.latestMessage?.created_at || item.conversation.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {item.latestMessage?.content || 'No messages'}
                    </p>
                    {item.conversation.visitor_email && (
                      <Mail size={12} className={`flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
        {/* Static Chat Header */}
        <div className={`p-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b flex items-center gap-3`}>
          {selectedConvo ? (
            <button 
              onClick={handleBackToList}
              className={`md:hidden p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full`}
            >
              <ChevronLeft size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} flex items-center justify-center`}>
            <User size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
          </div>
          <div className="flex-1 min-w-0">
            {selectedConvo ? (
              <>
                <h2 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedConvo.conversation.visitor_name || 'Anonymous'}
                </h2>
                {selectedConvo.conversation.visitor_email && (
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {selectedConvo.conversation.visitor_email}
                  </p>
                )}
              </>
            ) : (
              <h2 className={`font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Chat Area
              </h2>
            )}
          </div>
          <button className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full`}>
            <MoreVertical size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Messages or Empty State */}
        {selectedConvo ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[75%] p-2 px-3 rounded-lg relative ${
                    msg.role === 'bot'
                      ? (isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900') + ' rounded-tl-md'
                      : (isDarkMode ? 'bg-blue-600' : 'bg-blue-600') + ' text-white rounded-br-md'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <p className="text-[10px]">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {msg.role === 'bot' && (
                        <CheckCheck size={14} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className={`p-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700' : 'bg-white border-gray-300'} border focus:outline-none focus:border-blue-500`}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-center p-8 rounded-3xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <MessageCircle size={80} className={`mx-auto mb-4 ${isDarkMode ? 'opacity-20' : 'opacity-30'}`} />
              <h2 className={`text-xl font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Dashboard</h2>
              <p className={`text-sm mt-2 max-w-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}