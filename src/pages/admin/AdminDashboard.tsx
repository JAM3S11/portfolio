import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Inbox, BarChart3, Activity, Bell, Download, Moon, ArrowUpRight, LogOut, Archive, CheckCheck, Keyboard,
} from 'lucide-react';
import {
  getLatestMessages,
  getMessages,
  getAllMessages,
  addMessage,
  deleteConversation,
  updateConversationStatus,
  isSupabaseConfigured,
  subscribeToNewConversations,
  subscribeToAllMessages,
  type Message,
} from '@/lib/chat-service';
import { signInAdmin, signOut } from '@/lib/auth-service';
import { subscribeToAlerts, type AlertEvent } from '@/lib/alert-service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ConvoItem, MessageItem, MessageSender } from './types';
import { displayName } from './constants';
import { loadSeen, saveSeen, loadSentIds, saveSentIds } from './inboxStorage';
import { saveAdminSession, hasAdminSession, clearAdminSession } from './adminSession';
import AdminLogin from './AdminLogin';
import ConversationsList from './ConversationsList';
import ChatPanel from './ChatPanel';
import ConversationDetails from './ConversationDetails';
import RealTimeMonitor from '@/components/admin/RealTimeMonitor';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import AlertCenter from '@/components/admin/AlertCenter';
import ConfirmModal from './ConfirmModal';
import AdminSidebar, { type AdminSection } from './AdminSidebar';
import PageHeader from './PageHeader';
import CommandPalette, { ShortcutsDialog, type PaletteCommand } from './CommandPalette';
import { isTypingTarget } from './shortcuts';
import { useTheme } from '@/content/ThemeProvider';

type SidebarTab = AdminSection;

const SIDEBAR_KEY = 'jdg-admin-sidebar-collapsed';

// Slow down password guessing: after this many misses the form locks briefly
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;

const PAGE_META: Record<SidebarTab, { title: string; description: string }> = {
  messages: { title: 'Inbox', description: 'Conversations from the portfolio AI assistant' },
  monitor: { title: 'Live monitor', description: 'Real-time AI activity and response times' },
  analytics: { title: 'Analytics', description: 'AI performance, answer quality and traffic' },
  alerts: { title: 'Alerts', description: 'Threshold breaches and alert rules' },
};

const latestTime = (item: ConvoItem) =>
  new Date(item.latestMessage?.created_at || item.conversation.created_at).getTime();

const sortByActivity = (items: ConvoItem[]) => [...items].sort((a, b) => latestTime(b) - latestTime(a));

export default function AdminDashboard() {
  const navigate = useNavigate();
  // Restored from a saved session so a refresh doesn't ask for the password again
  const [isAuthorized, setIsAuthorized] = useState(hasAdminSession);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [clock, setClock] = useState(() => Date.now());
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<ConvoItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabase] = useState(isSupabaseConfigured);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [mobileTab, setMobileTab] = useState<'list' | 'chat' | 'monitor' | 'analytics' | 'alerts'>('list');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('messages');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // Ids in the order the inbox list currently shows them (after search/filters), for j/k
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const { toggleDarkMode } = useTheme();
  // Render only the layout for this screen size (avoids a hidden duplicate thread/composer)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  // Latest keyboard handler; the listener below is registered once and calls through this ref
  const shortcutHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  const pendingGRef = useRef(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => shortcutHandlerRef.current(e);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const [deleteTarget, setDeleteTarget] = useState<ConvoItem | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { return false; }
  });
  // Alerts live here (not in AlertCenter) so none are lost while another page is open
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  // conversation id -> last time it was opened here (drives unread state)
  const [seen, setSeen] = useState<Record<string, string>>(() => loadSeen() ?? {});

  // Ids of bot-role messages the admin wrote, so they show as "You" rather than "AI"
  const sentIdsRef = useRef<Set<string>>(loadSentIds());
  // Reply texts saved but not yet confirmed, so their realtime echo isn't added twice
  const pendingRepliesRef = useRef<Map<string, number>>(new Map());
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedConvo?.conversation.id ?? null;

  useEffect(() => {
    if (isAuthorized) loadDashboardData();
    // Mount only: a restored session loads its data once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    const id = setInterval(() => {
      const now = Date.now();
      setClock(now);
      if (now >= lockedUntil) {
        clearInterval(id);
        setLoginError(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const senderOf = useCallback(
    (role: 'visitor' | 'bot', id?: string): MessageSender =>
      role === 'visitor' ? 'visitor' : id && sentIdsRef.current.has(id) ? 'you' : 'ai',
    []
  );

  const markSeen = useCallback((conversationId: string) => {
    setSeen((prev) => {
      const next = { ...prev, [conversationId]: new Date().toISOString() };
      saveSeen(next);
      return next;
    });
  }, []);

  // Unread = activity after the last time the conversation was opened here
  const unreadIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const item of conversations) {
      const lastSeen = seen[item.conversation.id];
      if (item.latestMessage && (!lastSeen || new Date(item.latestMessage.created_at) > new Date(lastSeen))) {
        ids.add(item.conversation.id);
      }
    }
    return ids;
  }, [conversations, seen]);

  useEffect(() => {
    if (!isSupabase || !isAuthorized) return;
    const unsubscribe = subscribeToNewConversations((newConversation) => {
      setConversations((prev) =>
        prev.some((c) => c.conversation.id === newConversation.id)
          ? prev
          : [{ conversation: newConversation, latestMessage: null }, ...prev]
      );
      toast(`New conversation from ${displayName(newConversation)}`);
    });
    return () => unsubscribe();
  }, [isSupabase, isAuthorized]);

  // Live messages: update list previews and ordering, search index, and the open thread
  useEffect(() => {
    if (!isSupabase || !isAuthorized) return;
    return subscribeToAllMessages((msg: Message) => {
      setConversations((prev) =>
        sortByActivity(
          prev.map((c) =>
            c.conversation.id === msg.conversation_id
              ? { ...c, latestMessage: { content: msg.content, created_at: msg.created_at, role: msg.role } }
              : c
          )
        )
      );
      setAllMessages((prev) => [{ ...msg, conversationId: msg.conversation_id }, ...prev]);

      if (msg.conversation_id !== selectedIdRef.current) return;

      // Our own reply echoing back: its optimistic copy gets the id when the save resolves
      if (msg.role === 'bot') {
        const pending = pendingRepliesRef.current.get(msg.content);
        if (pending) {
          if (pending === 1) pendingRepliesRef.current.delete(msg.content);
          else pendingRepliesRef.current.set(msg.content, pending - 1);
          return;
        }
      }
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id)
          ? prev
          : [...prev, { id: msg.id, role: msg.role, sender: senderOf(msg.role, msg.id), content: msg.content, created_at: msg.created_at }]
      );
      markSeen(msg.conversation_id);
    });
  }, [isSupabase, isAuthorized, senderOf, markSeen]);

  useEffect(() => {
    if (!isAuthorized) return;
    return subscribeToAlerts((alert) => setAlerts((prev) => [alert, ...prev].slice(0, 100)));
  }, [isAuthorized]);

  const navigateSection = (section: SidebarTab) => setSidebarTab(section);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      try { localStorage.setItem(SIDEBAR_KEY, prev ? '0' : '1'); } catch { /* storage unavailable */ }
      return !prev;
    });
  };

  const acknowledgeAlert = (alertId: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

  // Restore the original tab title when leaving the admin
  useEffect(() => {
    const original = document.title;
    return () => {
      document.title = original;
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    clearAdminSession();
    setIsAuthorized(false);
    setPassword('');
    setSelectedConvo(null);
    setMessages([]);
    setConversations([]);
    setAllMessages([]);
    setAlerts([]);
    setSidebarTab('messages');
  };

  const stats = React.useMemo(() => {
    const now = new Date();
    const todayCount = conversations.filter(
      (item) => item.latestMessage && new Date(item.latestMessage.created_at).toDateString() === now.toDateString()
    ).length;
    return { todayCount };
  }, [conversations]);

  // First time the inbox is opened in this browser, treat existing conversations as read
  const initialiseSeen = (items: ConvoItem[]) => {
    if (loadSeen() !== null) return;
    const now = new Date().toISOString();
    const initial = Object.fromEntries(items.map((c) => [c.conversation.id, now]));
    saveSeen(initial);
    setSeen(initial);
  };

  // Sample data for demo mode (no Supabase configured)
  const loadDemoData = () => {
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
    setAllMessages(
      [
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
      ].map((m, i) => ({ ...m, id: `demo-msg-${i}` }))
    );
  };

  const loadDashboardData = () => {
    if (isSupabase) {
      loadConversations();
      loadAllMessages();
    } else {
      loadDemoData();
    }
  };

  const lockedSeconds = Math.max(0, Math.ceil((lockedUntil - clock) / 1000));

  const handleLogin = async () => {
    if (lockedSeconds > 0 || !password.trim()) return;
    setIsLoading(true);
    setLoginError(null);
    const result = await signInAdmin(password);
    setIsLoading(false);

    if (!result.success) {
      const attempts = failedAttempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCK_MS);
        setClock(Date.now());
        setFailedAttempts(0);
      } else {
        setFailedAttempts(attempts);
      }
      setLoginError(result.error || 'Incorrect password');
      return;
    }

    saveAdminSession(remember);
    setFailedAttempts(0);
    setPassword('');
    setIsAuthorized(true);
    loadDashboardData();
  };

  const loadConversations = async () => {
    setIsLoading(true);
    const items = sortByActivity(await getLatestMessages());
    initialiseSeen(items);
    setConversations(items);
    setIsLoading(false);
  };

  const loadAllMessages = async () => {
    if (isSupabase) setAllMessages(await getAllMessages());
  };

  const loadMessages = async (convo: ConvoItem) => {
    setSelectedConvo(convo);
    setReplyText('');
    setMobileTab('chat');
    setSidebarTab('messages');
    markSeen(convo.conversation.id);
    if (isSupabase) {
      const msgs = await getMessages(convo.conversation.id);
      // Ignore the result if another conversation was opened while this one loaded
      if (selectedIdRef.current !== convo.conversation.id) return;
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role,
          sender: senderOf(m.role, m.id),
          content: m.content,
          created_at: m.created_at,
        }))
      );
    } else {
      const thread = allMessages
        .filter((m) => m.conversationId === convo.conversation.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m) => ({ id: m.id, role: m.role as 'visitor' | 'bot', sender: senderOf(m.role, m.id), content: m.content, created_at: m.created_at }));
      setMessages(thread.length > 0 ? thread : [
        { role: 'visitor', sender: 'visitor', content: convo.latestMessage?.content || 'Hello!', created_at: convo.conversation.created_at },
      ]);
    }
  };

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !selectedConvo) return;
    const conversationId = selectedConvo.conversation.id;
    const createdAt = new Date().toISOString();
    setReplyText('');

    // Optimistic bubble, confirmed (or marked failed) once the save resolves
    const tempKey = `pending-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempKey, role: 'bot', sender: 'you', content: text, created_at: createdAt, pending: isSupabase },
    ]);

    if (!isSupabase) {
      const demoId = `demo-reply-${Date.now()}`;
      sentIdsRef.current.add(demoId);
      setMessages((prev) => prev.map((m) => (m.id === tempKey ? { ...m, id: demoId } : m)));
      return;
    }

    const pending = pendingRepliesRef.current;
    pending.set(text, (pending.get(text) ?? 0) + 1);
    const saved = await addMessage(conversationId, 'bot', text);

    if (!saved) {
      const count = pending.get(text) ?? 0;
      if (count <= 1) pending.delete(text);
      else pending.set(text, count - 1);
      setMessages((prev) => prev.filter((m) => m.id !== tempKey));
      setReplyText(text);
      toast.error('Reply failed to send. Your text is back in the box.');
      return;
    }

    sentIdsRef.current.add(saved.id);
    saveSentIds(sentIdsRef.current);
    setMessages((prev) =>
      prev.map((m) => (m.id === tempKey ? { ...m, id: saved.id, created_at: saved.created_at, pending: false } : m))
    );
    markSeen(conversationId);
  };

  const handleArchive = async (item: ConvoItem) => {
    const next = item.conversation.status === 'archived' ? 'active' : 'archived';
    if (isSupabase) {
      const ok = await updateConversationStatus(item.conversation.id, next);
      if (!ok) {
        toast.error('Could not update the conversation');
        return;
      }
    }
    const update = (c: ConvoItem): ConvoItem =>
      c.conversation.id === item.conversation.id ? { ...c, conversation: { ...c.conversation, status: next } } : c;
    setConversations((prev) => prev.map(update));
    setSelectedConvo((prev) => (prev ? update(prev) : prev));
    toast.success(next === 'archived' ? `Archived ${displayName(item.conversation)}` : 'Moved back to inbox');
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

  // Quote every cell, double embedded quotes, and neutralise a leading = + - @ so
  // spreadsheet apps don't run visitor-written text as a formula
  const csvCell = (value: string) => {
    const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const exportToCSV = () => {
    let csv = 'Name,Email,Last Message,Date,Status\n';
    conversations.forEach((item) => {
      csv += [
        displayName(item.conversation),
        item.conversation.visitor_email || '',
        item.latestMessage?.content || '',
        item.conversation.created_at,
        item.conversation.status,
      ].map(csvCell).join(',') + '\n';
    });
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Unread count in the browser tab title, so new chats show up from other tabs
  useEffect(() => {
    if (!isAuthorized) return;
    document.title = unreadIds.size > 0 ? `(${unreadIds.size}) Inbox · JDG Admin` : `${PAGE_META[sidebarTab].title} · JDG Admin`;
  }, [isAuthorized, unreadIds.size, sidebarTab]);

  // Move through the visible conversations with j / k
  const stepConversation = (direction: 1 | -1) => {
    if (visibleIds.length === 0) return;
    const current = selectedConvo ? visibleIds.indexOf(selectedConvo.conversation.id) : -1;
    const nextIndex = current === -1 ? 0 : Math.min(visibleIds.length - 1, Math.max(0, current + direction));
    const next = conversations.find((c) => c.conversation.id === visibleIds[nextIndex]);
    if (next && next.conversation.id !== selectedConvo?.conversation.id) loadMessages(next);
  };

  const goTo = (section: SidebarTab) => {
    navigateSection(section);
    setMobileTab(section === 'messages' ? 'list' : section);
  };

  shortcutHandlerRef.current = (e: KeyboardEvent) => {
    if (!isAuthorized) return;
    const key = e.key.toLowerCase();

    // Cmd/Ctrl+K works everywhere, even while typing
    if ((e.metaKey || e.ctrlKey) && key === 'k') {
      e.preventDefault();
      setShortcutsOpen(false);
      setPaletteOpen((open) => !open);
      return;
    }
    if (paletteOpen || shortcutsOpen || deleteTarget || e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTypingTarget(e.target)) return;

    // "g" then a letter jumps between sections (within 1.2s)
    if (Date.now() - pendingGRef.current < 1200) {
      pendingGRef.current = 0;
      const target = ({ i: 'messages', m: 'monitor', a: 'analytics', l: 'alerts' } as Record<string, SidebarTab>)[key];
      if (target) {
        e.preventDefault();
        goTo(target);
        return;
      }
    }

    if (e.key === '?') {
      e.preventDefault();
      setShortcutsOpen(true);
      return;
    }
    if (key === 'g') {
      pendingGRef.current = Date.now();
      return;
    }

    if (sidebarTab !== 'messages') return;
    switch (key) {
      case 'j':
        e.preventDefault();
        stepConversation(1);
        break;
      case 'k':
        e.preventDefault();
        stepConversation(-1);
        break;
      case 'r':
        if (selectedConvo) {
          e.preventDefault();
          document.getElementById('admin-reply')?.focus();
        }
        break;
      case 'e':
        if (selectedConvo) {
          e.preventDefault();
          handleArchive(selectedConvo);
        }
        break;
    }
  };

  const paletteCommands: PaletteCommand[] = [
    { id: 'go-inbox', group: 'Navigation', label: 'Inbox', icon: Inbox, shortcut: ['G', 'I'], keywords: 'messages conversations', run: () => goTo('messages') },
    { id: 'go-monitor', group: 'Navigation', label: 'Live monitor', icon: Activity, shortcut: ['G', 'M'], keywords: 'realtime activity', run: () => goTo('monitor') },
    { id: 'go-analytics', group: 'Navigation', label: 'Analytics', icon: BarChart3, shortcut: ['G', 'A'], keywords: 'charts stats metrics', run: () => goTo('analytics') },
    { id: 'go-alerts', group: 'Navigation', label: 'Alerts', icon: Bell, shortcut: ['G', 'L'], keywords: 'notifications rules', run: () => goTo('alerts') },
    ...(selectedConvo
      ? [{
          id: 'archive-current',
          group: 'Actions' as const,
          label: selectedConvo.conversation.status === 'archived'
            ? `Move ${displayName(selectedConvo.conversation)} to inbox`
            : `Archive ${displayName(selectedConvo.conversation)}`,
          icon: Archive,
          shortcut: ['E'],
          run: () => handleArchive(selectedConvo),
        }]
      : []),
    ...(unacknowledgedAlerts > 0
      ? [{
          id: 'ack-all',
          group: 'Actions' as const,
          label: `Acknowledge ${unacknowledgedAlerts} alert${unacknowledgedAlerts === 1 ? '' : 's'}`,
          icon: CheckCheck,
          keywords: 'alerts clear',
          run: () => setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true }))),
        }]
      : []),
    { id: 'export', group: 'Actions', label: 'Export conversations as CSV', icon: Download, keywords: 'download spreadsheet', run: exportToCSV },
    { id: 'theme', group: 'Actions', label: 'Toggle dark / light theme', icon: Moon, keywords: 'appearance mode', run: toggleDarkMode },
    { id: 'shortcuts', group: 'Actions', label: 'Keyboard shortcuts', icon: Keyboard, shortcut: ['?'], keywords: 'help keys', run: () => setShortcutsOpen(true) },
    { id: 'site', group: 'Actions', label: 'View portfolio site', icon: ArrowUpRight, keywords: 'home website', run: () => navigate('/') },
    { id: 'sign-out', group: 'Actions', label: 'Sign out', icon: LogOut, keywords: 'logout log out', run: handleSignOut },
  ];

  if (!isAuthorized) {
    return (
      <AdminLogin
        password={password}
        onPasswordChange={(v) => { setPassword(v); if (loginError && lockedSeconds === 0) setLoginError(null); }}
        remember={remember}
        onRememberChange={setRemember}
        isLoading={isLoading}
        error={loginError}
        lockedSeconds={lockedSeconds}
        isDemo={!isSupabase}
        onLogin={handleLogin}
        onBack={() => navigate('/')}
      />
    );
  }

  const listProps = {
    conversations,
    allMessages,
    selectedId: selectedConvo?.conversation.id ?? null,
    unreadIds,
    onSelect: loadMessages,
    onArchive: handleArchive,
    onDelete: handleDeleteConversation,
    onExportCSV: exportToCSV,
    onBack: () => navigate('/'),
  };

  const chatProps = {
    selectedConvo,
    messages,
    replyText,
    onReplyTextChange: setReplyText,
    onSendReply: handleSendReply,
    onArchive: handleArchive,
    onDeleteConversation: handleDeleteConversation,
  };

  // Monitor / Analytics / Alerts pages (the inbox has its own multi-panel layout)
  const renderSectionContent = () => {
    switch (sidebarTab) {
      case 'monitor':
        return <RealTimeMonitor embedded initialConversationCount={conversations.length} />;
      case 'analytics':
        return <AnalyticsDashboard embedded />;
      case 'alerts':
        return <AlertCenter embedded alerts={alerts} onAcknowledge={acknowledgeAlert} />;
      default:
        return null;
    }
  };

  const renderMobileContent = () => {
    switch (mobileTab) {
      case 'chat':
        return <ChatPanel {...chatProps} onBack={() => { setSelectedConvo(null); setMobileTab('list'); }} />;
      case 'monitor':
        return <RealTimeMonitor onBack={() => setMobileTab('list')} initialConversationCount={conversations.length} />;
      case 'analytics':
        return <AnalyticsDashboard onBack={() => setMobileTab('list')} />;
      case 'alerts':
        return <AlertCenter onBack={() => setMobileTab('list')} alerts={alerts} onAcknowledge={acknowledgeAlert} />;
      default:
        return <ConversationsList {...listProps} />;
    }
  };

  const pageMeta = PAGE_META[sidebarTab];
  const pageDescription =
    sidebarTab === 'messages'
      ? `${conversations.length} conversation${conversations.length === 1 ? '' : 's'} · ${unreadIds.size} unread · ${stats.todayCount} active today`
      : pageMeta.description;

  const pageActions =
    sidebarTab === 'messages' ? (
      <button
        onClick={exportToCSV}
        disabled={conversations.length === 0}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <Download size={14} />
        Export CSV
      </button>
    ) : null;

  return (
    <div className="h-dvh flex flex-col bg-background text-foreground overflow-hidden">
      {/* Desktop: app shell = navigation sidebar + page (header + content) */}
      {isDesktop ? (
      <div className="flex flex-1 min-h-0">
        <AdminSidebar
          active={sidebarTab}
          onNavigate={navigateSection}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebar}
          unreadConversations={unreadIds.size}
          totalConversations={conversations.length}
          unacknowledgedAlerts={unacknowledgedAlerts}
          isLive={isSupabase}
          onViewSite={() => navigate('/')}
          onSignOut={handleSignOut}
          onOpenPalette={() => setPaletteOpen(true)}
          onShowShortcuts={() => setShortcutsOpen(true)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <PageHeader title={pageMeta.title} description={pageDescription} actions={pageActions} />

          <main className="flex-1 min-h-0 flex">
            {sidebarTab === 'messages' ? (
              <>
                {/* Inbox: conversation list | thread | details */}
                <div className="w-80 flex-shrink-0 flex flex-col bg-card border-r border-border">
                  <ConversationsList embedded {...listProps} onVisibleChange={setVisibleIds} />
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <ChatPanel {...chatProps} onBack={() => setSelectedConvo(null)} />
                </div>

                {selectedConvo && (
                  <aside aria-label="Conversation details" className="hidden xl:flex w-72 2xl:w-80 flex-shrink-0 flex-col bg-card border-l border-border">
                    <ConversationDetails
                      item={selectedConvo}
                      messages={messages}
                      isLive={isSupabase}
                      onArchive={handleArchive}
                      onDelete={handleDeleteConversation}
                    />
                  </aside>
                )}
              </>
            ) : (
              // Other sections get the full width, capped so cards don't stretch on wide screens
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="mx-auto flex h-full w-full max-w-5xl flex-col">{renderSectionContent()}</div>
              </div>
            )}
          </main>
        </div>
      </div>
      ) : (
      // Mobile layout
      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          {renderMobileContent()}
        </div>

        {mobileTab !== 'chat' && (
          <div className="flex-shrink-0 bg-card border-t border-border flex pb-[env(safe-area-inset-bottom)]">
            {[
              { id: 'list', icon: Inbox, label: 'Messages' },
              { id: 'monitor', icon: Activity, label: 'Monitor' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'alerts', icon: Bell, label: 'Alerts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id as any)}
                className={cn(
                  'flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors',
                  mobileTab === tab.id ? 'text-brand' : 'text-muted-foreground'
                )}
              >
                <tab.icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Conversation"
        message={`Delete conversation with ${deleteTarget ? displayName(deleteTarget.conversation) : 'this visitor'}? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={paletteCommands}
        conversations={conversations}
        onOpenConversation={(item) => { goTo('messages'); loadMessages(item); }}
      />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
