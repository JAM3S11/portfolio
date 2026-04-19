import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Send, Lock, ChevronLeft, 
  User, Mail, Clock, MoreVertical, Trash2 
} from 'lucide-react';
import { 
  getLatestMessages, 
  getMessages, 
  addMessage,
  getAdminSettings,
  isSupabaseConfigured 
} from '@/lib/chat-service';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<ConvoItem | null>(null);
  const [messages, setMessages] = useState<{role: 'visitor' | 'bot'; content: string; created_at: string}[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabase, setIsSupabase] = useState(false);

  useEffect(() => {
    setIsSupabase(isSupabaseConfigured());
  }, []);

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
      // Demo mode - accept any password
      setIsAuthorized(true);
      setConversations([
        {
          conversation: {
            id: 'demo-1',
            visitor_name: 'Demo Visitor',
            visitor_email: 'demo@example.com',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          latestMessage: {
            content: 'Hi, I want to hire you for a project!',
            created_at: new Date().toISOString()
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
    if (isSupabase) {
      const msgs = await getMessages(convo.conversation.id);
      setMessages(msgs.map(m => ({ role: m.role as 'visitor' | 'bot', content: m.content, created_at: m.created_at })));
    } else {
      // Demo messages
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-[#161b22] rounded-2xl shadow-xl p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Lock size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Enter your password to access the dashboard</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center mb-4"
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
            className="w-full mt-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Portfolio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0d1117]">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">Conversations</h1>
          </div>
          {!isSupabase && (
            <p className="text-xs text-amber-500 mt-2">Demo Mode</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((item, idx) => (
              <button
                key={idx}
                onClick={() => loadMessages(item)}
                className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedConvo?.conversation.id === item.conversation.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {item.conversation.visitor_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {item.latestMessage?.content || 'No messages'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.conversation.created_at).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConvo ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    {selectedConvo.conversation.visitor_name || 'Anonymous'}
                  </h2>
                  {selectedConvo.conversation.visitor_email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail size={12} /> {selectedConvo.conversation.visitor_email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[70%] p-3 rounded-2xl ${
                    msg.role === 'bot'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                      : 'bg-blue-600 text-white rounded-br-md'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}