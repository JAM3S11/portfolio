export interface ConvoItem {
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
    role?: 'visitor' | 'bot';
  } | null;
}

/**
 * Who wrote a message. The database only stores 'visitor' | 'bot', so replies the admin
 * sends are remembered locally (by message id) to tell them apart from AI answers.
 */
export type MessageSender = 'visitor' | 'ai' | 'you';

export interface MessageItem {
  /** Database id; missing only for an optimistic reply that hasn't saved yet */
  id?: string;
  role: 'visitor' | 'bot';
  sender: MessageSender;
  content: string;
  created_at: string;
  /** True while an admin reply is still being saved */
  pending?: boolean;
}
