import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createConversation, 
  addMessage, 
  subscribeToMessages,
  isSupabaseConfigured 
} from '@/lib/chat-service';
import { generateResponseWithMetrics, generateDeepDiveResponseWithMetrics, welcomeMessage } from '@/lib/faq-knowledge';
import { logAIInteraction, logAIError } from '@/lib/analytics-service';
import { evaluateInteraction, createNewConversationAlert } from '@/lib/alert-service';

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
}

const VISITOR_INTENTS = [
  { label: '💼 Hiring / Job', value: 'hiring', keywords: ['hire', 'job', 'employment', 'freelance'] },
  { label: '🛠️ Project Quote', value: 'quote', keywords: ['quote', 'project', 'cost', 'budget'] },
  { label: '💻 Tech Inquiry', value: 'tech', keywords: ['tech', 'skills', 'how', 'what'] },
  { label: '🤝 Partnership', value: 'partnership', keywords: ['partner', 'collab', 'team'] },
  { label: '❓ General FAQ', value: 'faq', keywords: ['faq', 'question', 'info'] },
];

const DEEP_DIVE_INTENTS = [
  { label: '🎯 Frontend Deep Dive', value: 'deep_frontend', focus: 'frontend' },
  { label: '⚙️ Backend Deep Dive', value: 'deep_backend', focus: 'backend' },
  { label: '🔧 Fullstack Deep Dive', value: 'deep_fullstack', focus: 'fullstack' },
  { label: '🏗️ Software Deep Dive', value: 'deep_software', focus: 'software' },
];

export default function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: 'visitor' | 'bot'; content: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSupabase, setIsSupabase] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const selectedIntentRef = useRef<string | null>(null);

  const [deepDiveFocus, setDeepDiveFocus] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(false);

  // Keep refs in sync with state so async callbacks always read latest value
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);
  useEffect(() => { selectedIntentRef.current = selectedIntent; }, [selectedIntent]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsSupabase(isSupabaseConfigured());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!conversationId || !isSupabase) return;
    const unsubscribe = subscribeToMessages(conversationId, () => {});
    return () => unsubscribe();
  }, [conversationId, isSupabase]);

  const addBotMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { role: 'bot', content }]);
  }, []);

  const addVisitorMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { role: 'visitor', content }]);
  }, []);

  const persistMessage = useCallback(async (role: 'visitor' | 'bot', content: string): Promise<{ convId: string; msgId: string } | null> => {
    if (!isSupabase) return null;
    let convId = conversationIdRef.current;
    if (!convId) {
      const intent = selectedIntentRef.current || 'deep_frontend';
      const conv = await createConversation(undefined, undefined, intent);
      if (conv) {
        convId = conv.id;
        conversationIdRef.current = conv.id;
        setConversationId(conv.id);
      }
    }
    if (convId) {
      const msg = await addMessage(convId, role, content);
      if (msg) {
        return { convId, msgId: msg.id };
      }
    }
    return null;
  }, [isSupabase]);

  const resetDeepDive = useCallback(() => {
    setDeepDiveFocus(null);
    setSubLoading(false);
  }, []);

  const startConversation = async () => {
    setIsLoading(true);
    setSelectedIntent(null);
    resetDeepDive();
    setMessages([{ role: 'bot', content: welcomeMessage }]);
    setIsLoading(false);
  };

  const handleSelectIntent = async (intent: typeof VISITOR_INTENTS[0]) => {
    setSelectedIntent(intent.value);
    const userMessage = `I'm interested in: ${intent.label}`;
    addVisitorMessage(userMessage);
    setIsLoading(true);
    const metricResult = await generateResponseWithMetrics(userMessage);
    addBotMessage(metricResult.text);
    const visitorPersist = await persistMessage('visitor', userMessage);
    const botPersist = await persistMessage('bot', metricResult.text);
    if (visitorPersist && botPersist && metricResult.latency_ms > 0) {
      logAIInteraction({
        conversation_id: visitorPersist.convId,
        message_id: botPersist.msgId,
        prompt: userMessage,
        response: metricResult.text,
        model: metricResult.model,
        prompt_tokens: metricResult.prompt_tokens,
        completion_tokens: metricResult.completion_tokens,
        total_tokens: metricResult.total_tokens,
        latency_ms: metricResult.latency_ms,
        confidence_score: metricResult.confidence,
        intent_detected: intent.value,
        processing_steps: null,
      });
      const alert = evaluateInteraction({
        conversation_id: visitorPersist.convId,
        message_id: botPersist.msgId,
        prompt: userMessage,
        response: metricResult.text,
        model: metricResult.model,
        prompt_tokens: metricResult.prompt_tokens,
        completion_tokens: metricResult.completion_tokens,
        total_tokens: metricResult.total_tokens,
        latency_ms: metricResult.latency_ms,
        confidence_score: metricResult.confidence,
        intent_detected: intent.value,
        processing_steps: null,
      } as any);
      if (alert) {
        logAIError({
          conversation_id: visitorPersist.convId,
          error_type: `alert_${alert.rule_type}`,
          error_message: alert.message,
          failure_reason: `severity:${alert.severity}`,
          resolution_attempted: null,
          resolved: alert.acknowledged,
        });
      }
    }
    setIsLoading(false);
  };

  const handleDeepDiveSelect = async (intent: typeof DEEP_DIVE_INTENTS[0]) => {
    setSelectedIntent(intent.value);
    setDeepDiveFocus(intent.focus);
    setSubLoading(true);

    const msg = `I want to explore: ${intent.label}`;
    addVisitorMessage(msg);
    await persistMessage('visitor', msg);

    const welcomeMap: Record<string, string> = {
      frontend: `🎯 **Frontend Deep Dive** activated!

I can walk you through the frontend architecture across all of James's projects — from SOLEASE's Zustand state management to Greatwall's Web3 integration layer.

**Ask me about:**
• Component architecture and patterns used in each project
• State management decisions (Zustand vs Redux vs local state)
• Styling approaches (Tailwind, DaisyUI, shadcn/ui)
• Performance optimization and bundle strategies
• Accessibility patterns and trade-offs

What frontend topic would you like to explore?`,
      backend: `⚙️ **Backend Deep Dive** activated!

Let's explore the backend systems powering James's projects — from Express 5 APIs to database migrations and auth strategies.

**Ask me about:**
• API design patterns (REST, middleware chains, error handling)
• Database schema decisions (PostgreSQL, Prisma ORM, MongoDB migrations)
• Authentication & authorization (JWT, OAuth, role-based access)
• Security considerations (rate limiting, CSRF, XSS prevention)
• Scalability approaches and caching strategies

What backend topic interests you?`,
      fullstack: `🔧 **Fullstack Deep Dive** activated!

Let's trace the full data flow through James's projects — from UI components all the way to the database and back.

**Ask me about:**
• End-to-end architecture (monorepo structure, frontend-backend communication)
• Data flow patterns (state management → API calls → persistence)
• DevOps and deployment strategies
• Full-stack security considerations
• Scaling full-stack applications

What fullstack aspect would you like to dive into?`,
      software: `🏗️ **Software Engineering Deep Dive** activated!

Let's analyze the engineering practices across James's portfolio — from system design to code quality and testing strategies.

**Ask me about:**
• System design decisions and architectural trade-offs
• Testing strategies and code quality patterns
• Technical debt identification and refactoring priorities
• Project planning and scalability considerations
• Code organization and design patterns

What software engineering topic would you like to discuss?`,
    };

    const welcomeMsg = welcomeMap[intent.focus] || `Deep Dive mode activated for ${intent.label}! Ask me anything about the technical details.`;
    addBotMessage(welcomeMsg);
    await persistMessage('bot', welcomeMsg);
    setSubLoading(false);
  };

  const handleBackToNormal = () => {
    resetDeepDive();
    setSelectedIntent(null);
    setMessages([{ role: 'bot', content: welcomeMessage }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addVisitorMessage(userMessage);
    const visitorPersist = await persistMessage('visitor', userMessage);
    setIsLoading(true);

    let metricResult;
    if (deepDiveFocus) {
      metricResult = await generateDeepDiveResponseWithMetrics(userMessage, deepDiveFocus);
    } else {
      metricResult = await generateResponseWithMetrics(userMessage);
    }

    addBotMessage(metricResult.text);
    const botPersist = await persistMessage('bot', metricResult.text);

    if (visitorPersist && botPersist && metricResult.latency_ms > 0) {
      logAIInteraction({
        conversation_id: visitorPersist.convId,
        message_id: botPersist.msgId,
        prompt: userMessage,
        response: metricResult.text,
        model: metricResult.model,
        prompt_tokens: metricResult.prompt_tokens,
        completion_tokens: metricResult.completion_tokens,
        total_tokens: metricResult.total_tokens,
        latency_ms: metricResult.latency_ms,
        confidence_score: metricResult.confidence,
        intent_detected: null,
        processing_steps: null,
      });
      const alert = evaluateInteraction({
        conversation_id: visitorPersist.convId,
        message_id: botPersist.msgId,
        prompt: userMessage,
        response: metricResult.text,
        model: metricResult.model,
        prompt_tokens: metricResult.prompt_tokens,
        completion_tokens: metricResult.completion_tokens,
        total_tokens: metricResult.total_tokens,
        latency_ms: metricResult.latency_ms,
        confidence_score: metricResult.confidence,
        intent_detected: null,
        processing_steps: null,
      } as any);
      if (alert) {
        logAIError({
          conversation_id: visitorPersist.convId,
          error_type: `alert_${alert.rule_type}`,
          error_message: alert.message,
          failure_reason: `severity:${alert.severity}`,
          resolution_attempted: null,
          resolved: alert.acknowledged,
        });
      }
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? isScrolled ? 'bottom-24 right-6' : 'bottom-6 right-6'
    : isScrolled ? 'bottom-24 left-6' : 'bottom-6 left-6';

  const isInterviewLoading = subLoading;

  return (
    <div className={`fixed ${positionClasses} right-4 sm:right-6 z-[60] transition-all duration-300`}>
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
                  <h3 className="font-bold">
                    {deepDiveFocus
                      ? `🔬 ${deepDiveFocus.charAt(0).toUpperCase() + deepDiveFocus.slice(1)} Deep Dive`
                      : 'AI Assistant'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {deepDiveFocus
                      ? 'Deep Dive Mode'
                      : 'Ask me anything!'}
                  </p>
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
              {selectedIntent === null && !deepDiveFocus ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Bot size={32} className="text-blue-600" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      How can I help you today?
                    </p>
                  </div>
                  
                  {/* Standard Intents */}
                  <div className="grid grid-cols-1 gap-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium px-1 uppercase tracking-wider">Quick Actions</p>
                    {VISITOR_INTENTS.map((intent) => (
                      <button
                        key={intent.value}
                        onClick={() => handleSelectIntent(intent)}
                        disabled={isLoading}
                        className="p-3 text-left rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        {intent.label}
                      </button>
                    ))}
                  </div>

                  {/* Deep Dive Intents */}
                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-purple-500 dark:text-purple-400 font-medium px-1 uppercase tracking-wider">🔬 Deep Dive Insights</p>
                    {DEEP_DIVE_INTENTS.map((intent) => (
                      <button
                        key={intent.value}
                        onClick={() => handleDeepDiveSelect(intent)}
                        disabled={isLoading}
                        className="p-3 text-left rounded-lg bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors text-sm border border-purple-200 dark:border-purple-800"
                      >
                        {intent.label}
                      </button>
                    ))}
                  </div>
                  
                  {!isSupabase && (
                    <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full text-center">
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
              
              {(isLoading || isInterviewLoading) && (
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
                  placeholder={deepDiveFocus ? 'Ask about project internals...' : 'Type a message...'}
                  disabled={isLoading || isInterviewLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-40"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || isInterviewLoading}
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
