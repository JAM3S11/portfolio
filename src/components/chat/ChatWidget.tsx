import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createConversation, 
  addMessage, 
  getMessages, 
  subscribeToMessages,
  isSupabaseConfigured 
} from '@/lib/chat-service';
import { generateResponse, welcomeMessage, Conversation, Message } from '@/lib/faq-knowledge';

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
}

export default function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: 'visitor' | 'bot'; content: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSupabase, setIsSupabase] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSupabase(isSupabaseConfigured());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to new messages from other sessions only
  useEffect(() => {
    if (!conversationId || !isSupabase) return;

    const unsubscribe = subscribeToMessages(conversationId, (newMessage: Message) => {
      // Skip adding - we're already handling messages locally
      // This subscription is just for real-time sync if needed
    });

    return () => unsubscribe();
  }, [conversationId, isSupabase]);

  const startConversation = async () => {
    setIsLoading(true);
    
    if (isSupabase) {
      const conv = await createConversation();
      if (conv) {
        setConversationId(conv.id);
        await addMessage(conv.id, 'bot', welcomeMessage);
        setMessages([{ role: 'bot', content: welcomeMessage }]);
      }
    } else {
      // Fallback: local-only mode
      setMessages([{ role: 'bot', content: welcomeMessage }]);
    }
    
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'visitor', content: userMessage }]);

    // Generate bot response
    const botResponse = generateResponse(userMessage);
    
    // Add delay to simulate thinking
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    setIsLoading(false);

    // Save to Supabase if configured
    if (isSupabase && conversationId) {
      await addMessage(conversationId, 'visitor', userMessage);
      await addMessage(conversationId, 'bot', botResponse);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6';

  return (
    <div className={`fixed ${positionClasses} right-4 left-4 sm:right-6 sm:left-auto z-50`}>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-12rem)] sm:w-[360px] sm:h-[500px] bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs text-white/80">Ask me anything!</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Bot size={32} className="text-blue-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Start a conversation with our AI assistant
                  </p>
                  {!isSupabase && (
                    <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                      Demo Mode (offline)
                    </p>
                  )}
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'visitor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${msg.role === 'visitor' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'visitor' 
                          ? 'bg-blue-600' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {msg.role === 'visitor' ? (
                          <User size={14} className="text-white" />
                        ) : (
                          <Bot size={14} className="text-gray-600 dark:text-gray-300" />
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl ${
                        msg.role === 'visitor'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot size={14} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 rounded-bl-md">
                      <Loader2 size={16} className="animate-spin text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!isOpen && messages.length === 0) {
            startConversation();
          }
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}