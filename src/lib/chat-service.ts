import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Conversation {
  id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_ip: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'visitor' | 'bot';
  content: string;
  created_at: string;
}

// Create a new conversation
export async function createConversation(visitorName?: string, visitorEmail?: string): Promise<Conversation | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      visitor_name: visitorName || 'Visitor',
      visitor_email: visitorEmail || null,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data as Conversation;
}

// Add a message to a conversation
export async function addMessage(
  conversationId: string, 
  role: 'visitor' | 'bot', 
  content: string
): Promise<Message | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    return null;
  }

  return data as Message;
}

// Get all conversations (for admin)
export async function getConversations(): Promise<Conversation[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data as Conversation[];
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<Message[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data as Message[];
}

// Get latest message for each conversation (for admin list)
export async function getLatestMessages(): Promise<{conversation: Conversation, latestMessage: Message | null}[]> {
  if (!supabase) return [];

  const conversations = await getConversations();
  const results = [];

  for (const conv of conversations) {
    const messages = await getMessages(conv.id);
    results.push({
      conversation: conv,
      latestMessage: messages[messages.length - 1] || null
    });
  }

  return results;
}

// Update conversation status
export async function updateConversationStatus(conversationId: string, status: string): Promise<void> {
  if (!supabase) return;

  await supabase
    .from('conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}

// Subscribe to new messages (for real-time updates)
export function subscribeToMessages(
  conversationId: string, 
  callback: (message: Message) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to new conversations (for admin notifications)
export function subscribeToNewConversations(callback: (conversation: Conversation) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('new-conversations')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      },
      (payload) => {
        callback(payload.new as Conversation);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Get admin settings
export async function getAdminSettings(): Promise<{admin_password: string, email_notifications_enabled: boolean, notification_email: string} | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching admin settings:', error);
    return null;
  }

  return data;
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}