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
  } | null;
}

export interface MessageItem {
  role: 'visitor' | 'bot';
  content: string;
  created_at: string;
}
