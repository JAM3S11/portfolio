import { useState, useEffect, useRef, useCallback } from 'react';
import { createConversation, addMessage, isSupabaseConfigured, subscribeToMessages } from '@/lib/chat-service';
import { generateResponseWithMetrics, generateDeepDiveResponseWithMetrics } from '@/lib/faq-knowledge';
import { logAIInteraction, logAIError, logUserFeedback } from '@/lib/analytics-service';
import { evaluateInteraction } from '@/lib/alert-service';
import type { ConversationTurn, MetricResult, ResponseStyle } from '@/lib/gemini-service';

export type ChatMode = 'chat' | 'deep';
export type DeepFocus = 'frontend' | 'backend' | 'fullstack' | 'software';

export interface ChatMessage {
  id: string;
  role: 'visitor' | 'bot';
  content: string;
  /** Reveal the text progressively (fresh bot replies only) */
  animate?: boolean;
  /** Show the "talk to James" handoff card under this reply */
  handoff?: boolean;
  feedback?: 'up' | 'down';
  /** Set when James replied from the admin inbox rather than the AI */
  from?: 'james';
  /** Ids in Supabase, used for feedback logging */
  dbId?: string;
  convId?: string;
}

interface StoredChat {
  messages: ChatMessage[];
  mode: ChatMode;
  deepFocus: DeepFocus | null;
  conversationId: string | null;
  responseStyle?: ResponseStyle;
}

const STORAGE_KEY = 'jdg-chat';
const HANDOFF_INTENTS = new Set(['hiring', 'quote', 'partnership']);

export const DEEP_DIVE_WELCOME: Record<DeepFocus, string> = {
  frontend: `**Frontend deep dive**

I can walk you through the frontend architecture across James's projects, from SOLEASE's state management to Greatwall's Web3 integration layer.

**Ask me about:**
- Component architecture and patterns in each project
- State management decisions (Zustand vs Redux vs local state)
- Styling approaches (Tailwind, DaisyUI, shadcn/ui)
- Performance optimisation and bundle strategies
- Accessibility patterns and trade-offs`,
  backend: `**Backend deep dive**

Let's explore the backend systems behind James's projects, from Express APIs to database migrations and auth strategies.

**Ask me about:**
- API design patterns (REST, middleware chains, error handling)
- Database schema decisions (PostgreSQL, Prisma, MongoDB)
- Authentication and authorisation (JWT, OAuth, role-based access)
- Security (rate limiting, CSRF, XSS prevention)
- Scalability and caching strategies`,
  fullstack: `**Full-stack deep dive**

Let's trace the full data flow through James's projects, from UI components to the database and back.

**Ask me about:**
- End-to-end architecture and frontend-backend communication
- Data flow (state → API calls → persistence)
- DevOps and deployment
- Full-stack security considerations
- Scaling full-stack applications`,
  software: `**Software engineering deep dive**

Let's look at the engineering practices across James's portfolio, from system design to code quality and testing.

**Ask me about:**
- System design decisions and architectural trade-offs
- Testing strategies and code quality
- Technical debt and refactoring priorities
- Project planning and scalability
- Code organisation and design patterns`,
};

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const loadStored = (): StoredChat | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredChat) : null;
  } catch {
    return null;
  }
};

// Log the interaction and raise an alert if it breaches a rule
const trackInteraction = (
  convId: string,
  messageId: string,
  prompt: string,
  result: MetricResult,
  intent: string | null
) => {
  if (result.latency_ms <= 0) return;

  const interaction = {
    conversation_id: convId,
    message_id: messageId,
    prompt,
    response: result.text,
    model: result.model,
    prompt_tokens: result.prompt_tokens,
    completion_tokens: result.completion_tokens,
    total_tokens: result.total_tokens,
    latency_ms: result.latency_ms,
    confidence_score: result.confidence,
    intent_detected: intent,
    processing_steps: null,
  };

  logAIInteraction(interaction);

  const alert = evaluateInteraction(interaction);
  if (alert) {
    logAIError({
      conversation_id: convId,
      error_type: `alert_${alert.rule_type}`,
      error_message: alert.message,
      failure_reason: `severity:${alert.severity}`,
      resolution_attempted: null,
      resolved: alert.acknowledged,
    });
  }
};

export function useChat() {
  const [stored] = useState(loadStored);
  const [messages, setMessages] = useState<ChatMessage[]>(
    // Restored messages shouldn't replay the typing effect
    () => stored?.messages.map((m) => ({ ...m, animate: false })) ?? []
  );
  const [mode, setMode] = useState<ChatMode>(stored?.mode ?? 'chat');
  const [deepFocus, setDeepFocus] = useState<DeepFocus | null>(stored?.deepFocus ?? null);
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(stored?.responseStyle ?? 'balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabase] = useState(isSupabaseConfigured);

  const conversationIdRef = useRef<string | null>(stored?.conversationId ?? null);
  // State mirror of the ref so the realtime subscription re-binds when a conversation starts
  const [conversationId, setConversationId] = useState<string | null>(stored?.conversationId ?? null);
  const intentRef = useRef<string | null>(null);
  // Bot messages this widget saved itself, so their realtime echoes are ignored.
  // Anything else arriving with role 'bot' was sent by James from the admin inbox.
  const ownBotMessagesRef = useRef<Map<string, number>>(new Map());

  // Deliver admin replies to the visitor live
  useEffect(() => {
    if (!isSupabase || !conversationId) return;
    return subscribeToMessages(conversationId, (msg) => {
      if (msg.role !== 'bot') return;
      const own = ownBotMessagesRef.current;
      const pending = own.get(msg.content);
      if (pending) {
        if (pending === 1) own.delete(msg.content);
        else own.set(msg.content, pending - 1);
        return;
      }
      setMessages((prev) =>
        prev.some((m) => m.dbId === msg.id)
          ? prev
          : [...prev, { id: newId(), role: 'bot', content: msg.content, from: 'james', dbId: msg.id, convId: msg.conversation_id }]
      );
    });
  }, [isSupabase, conversationId]);

  // Keep the conversation across reloads within the tab
  useEffect(() => {
    try {
      const data: StoredChat = { messages, mode, deepFocus, conversationId: conversationIdRef.current, responseStyle };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable (private mode); chat still works in memory
    }
  }, [messages, mode, deepFocus, responseStyle]);

  const persistMessage = useCallback(
    async (role: 'visitor' | 'bot', content: string): Promise<{ convId: string; msgId: string } | null> => {
      if (!isSupabase) return null;
      let convId = conversationIdRef.current;
      if (!convId) {
        const conv = await createConversation(undefined, undefined, intentRef.current || 'faq');
        if (!conv) return null;
        convId = conv.id;
        conversationIdRef.current = conv.id;
        setConversationId(conv.id);
      }
      // Register before inserting so the realtime echo is recognised even if it arrives first
      if (role === 'bot') {
        const own = ownBotMessagesRef.current;
        own.set(content, (own.get(content) ?? 0) + 1);
      }
      const msg = await addMessage(convId, role, content);
      return msg ? { convId, msgId: msg.id } : null;
    },
    [isSupabase]
  );

  const send = useCallback(
    async (text: string, intent: string | null = null) => {
      const prompt = text.trim();
      if (!prompt || isLoading) return;

      if (intent) intentRef.current = intent;
      setMessages((prev) => [...prev, { id: newId(), role: 'visitor', content: prompt }]);
      setIsLoading(true);
      const history: ConversationTurn[] = messages.slice(-8).map(({ role, content }) => ({ role, content }));

      // Save the visitor message while the answer is generated
      const visitorSaved = persistMessage('visitor', prompt);

      let result: MetricResult;
      try {
        result = deepFocus && mode === 'deep'
          ? await generateDeepDiveResponseWithMetrics(prompt, deepFocus, history, responseStyle)
          : await generateResponseWithMetrics(prompt, undefined, history, responseStyle);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: 'bot',
            content: "Sorry, I couldn't answer that just now. Please try again, or reach James directly below.",
            handoff: true,
          },
        ]);
        setIsLoading(false);
        return;
      }

      const botId = newId();
      setMessages((prev) => [
        ...prev,
        { id: botId, role: 'bot', content: result.text, animate: true, handoff: intent ? HANDOFF_INTENTS.has(intent) : false },
      ]);
      setIsLoading(false);

      // Visitor message must exist first so both land in the same conversation
      const visitorPersist = await visitorSaved;
      const botPersist = await persistMessage('bot', result.text);

      if (botPersist) {
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, dbId: botPersist.msgId, convId: botPersist.convId } : m))
        );
      }
      if (visitorPersist && botPersist) {
        trackInteraction(visitorPersist.convId, botPersist.msgId, prompt, result, intent);
      }
    },
    [deepFocus, isLoading, messages, mode, persistMessage, responseStyle]
  );

  const startDeepDive = useCallback(
    async (focus: DeepFocus, label: string) => {
      intentRef.current = `deep_${focus}`;
      setMode('deep');
      setDeepFocus(focus);

      const visitorText = `I want to explore: ${label}`;
      const welcome = DEEP_DIVE_WELCOME[focus];
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'visitor', content: visitorText },
        { id: newId(), role: 'bot', content: welcome, animate: true },
      ]);

      await persistMessage('visitor', visitorText);
      await persistMessage('bot', welcome);
    },
    [persistMessage]
  );

  const switchMode = useCallback((next: ChatMode) => {
    setMode(next);
    if (next === 'chat') setDeepFocus(null);
  }, []);

  const rate = useCallback(
    (messageId: string, value: 'up' | 'down') => {
      const target = messages.find((m) => m.id === messageId);
      if (!target || target.feedback) return;

      // Stored on the admin dashboard's 1–5 scale
      if (target.dbId && target.convId) {
        logUserFeedback({
          conversation_id: target.convId,
          message_id: target.dbId,
          rating: value === 'up' ? 5 : 1,
          feedback_text: null,
        });
      }
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback: value } : m)));
    },
    [messages]
  );

  const finishAnimation = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, animate: false } : m)));
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setMode('chat');
    setDeepFocus(null);
    conversationIdRef.current = null;
    setConversationId(null);
    intentRef.current = null;
    ownBotMessagesRef.current.clear();
  }, []);

  return {
    messages,
    mode,
    deepFocus,
    responseStyle,
    isLoading,
    isSupabase,
    send,
    startDeepDive,
    switchMode,
    setResponseStyle,
    rate,
    finishAnimation,
    reset,
  };
}
