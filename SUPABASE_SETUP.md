# Supabase Setup for Chatbot

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in details:
   - **Name**: `portfolio-chatbot`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Select closest to you (e.g., `eu-west-1` for Europe)

4. Wait for project to create (~2 minutes)

---

## Step 2: Get Connection Details

1. Go to **Project Settings** → **API**
2. Copy and save these values:
   - **Project URL**: `https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Step 3: Run SQL Schema

Go to **SQL Editor** in supabase and run this SQL:

```sql
-- Create tables for chatbot

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_ip TEXT,
  visitor_intent TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('visitor', 'bot')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_password TEXT NOT NULL,
  email_notifications_enabled BOOLEAN DEFAULT true,
  notification_email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin password (CHANGE THIS!)
INSERT INTO admin_settings (admin_password, email_notifications_enabled, notification_email)
VALUES ('your-secure-password-here', true, 'example@gmail.com');

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Allow public read conversations" ON conversations
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert conversations" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated delete conversations" ON conversations
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- RLS Policies for messages
CREATE POLICY "Allow public read messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated delete messages" ON messages
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin full access" ON admin_settings
  FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

**⚠️ IMPORTANT:** Change `'your-secure-password-here'` to your actual admin password!

---

## Step 4: Add Environment Variables

Create `.env.local` in your project:

```env
VITE_SUPABASE_URL=https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from Step 2.

---

## Step 5: Invite James to Supabase

1. Go to **Project Settings** → **Members**
2. Click "Invite Member"
3. Enter: `example@gmail.com`
4. Assign role: `Developer`

---

## Deep Dive Insights Mode

The AI Assistant has a **Deep Dive** mode where visitors explore projects with deep technical analysis. It uses the same `conversations` and `messages` tables — no extra schema needed.

### Visitor intents

Each deep dive focus area saves a distinct `visitor_intent` so admins can identify conversation types at a glance:

| `visitor_intent`     | Badge in Admin Dashboard      | Color  |
|----------------------|-------------------------------|--------|
| `deep_frontend`      | 🎯 Frontend Deep Dive         | Purple |
| `deep_backend`       | ⚙️ Backend Deep Dive          | Cyan   |
| `deep_fullstack`     | 🔧 Fullstack Deep Dive        | Pink   |
| `deep_software`      | 🏗️ Software Deep Dive         | Orange |

### How conversations flow

1. Visitor picks a deep dive focus from the chat menu (e.g., "🎯 Frontend Deep Dive")
2. A new conversation is created with `visitor_intent = 'deep_frontend'`
3. Each visitor message and AI response is saved as a row in `messages` linked by `conversation_id`
4. The entire Q&A thread appears in the Admin Dashboard with the correct intent badge

### Admin view

- Conversations show the deep dive badge color matching the focus area
- Clicking a conversation reveals the full technical Q&A thread
- The analytics panel breaks down deep dive traffic by focus area

### Code references

- `src/components/chat/ChatWidget.tsx` — `DEEP_DIVE_INTENTS`, `handleDeepDiveSelect()`, `handleSendMessage()` routes to `generateDeepDiveResponse()`
- `src/lib/gemini-service.ts` — `generateDeepDiveResponse()` with project technical context
- `src/lib/faq-knowledge.ts` — `buildDeepDiveProjectContext()`, `generateDeepDiveResponse()`
- `src/pages/AdminDashboard.tsx` — `deep_*` intent labels, colors, and analytics bars

---

## Delete Functionality (Admin)

Admins can delete conversations from the Admin Dashboard. Both the conversation and all its messages are permanently removed from the database.

### How it works

1. Click the **trash icon** (appears on hover over a conversation in the sidebar list)
2. A confirmation modal appears; click **Delete** to confirm
3. The app calls `deleteConversation(id)` in `chat-service.ts`
4. This executes a Supabase RPC function (`delete_conversation`) that bypasses RLS via `SECURITY DEFINER`
5. The conversation and all its messages are permanently removed

### Supabase RPC function

Create this function in **Supabase Dashboard → SQL Editor**:

```sql
CREATE OR REPLACE FUNCTION public.delete_conversation(conversation_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.messages WHERE messages.conversation_id = $1;
  DELETE FROM public.conversations WHERE conversations.id = $1;
  RETURN FOUND;
END;
$$;
```

The `SECURITY DEFINER` clause makes the function run with the privileges of its owner (the table owner), bypassing Row Level Security. This allows the anon key to delete conversations without needing an authenticated Supabase session.

### Code references

- `src/lib/chat-service.ts` — `deleteConversation()` function (calls `supabase.rpc('delete_conversation', ...)`)
- `src/pages/admin/AdminDashboard.tsx` — `handleDeleteConversation()` / `confirmDelete()` handlers
- `src/pages/admin/ConfirmModal.tsx` — confirmation modal component

---

## Support

- Supabase Docs: supabase.com/docs
- Issues: Create ticket in project

---

---

## AI Operations Monitoring Tables (v2)

Run this SQL to add monitoring capabilities:

```sql
-- AI performance metrics per interaction
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT DEFAULT 'gemini-2.0-flash',
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  latency_ms INT NOT NULL,
  confidence_score DECIMAL(4,3),
  intent_detected TEXT,
  processing_steps JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error tracking (used for alert events too)
CREATE TABLE IF NOT EXISTS ai_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT,
  failure_reason TEXT,
  resolution_attempted TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback (thumbs up/down)
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created ON ai_interactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_conversation ON ai_interactions (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_latency ON ai_interactions (latency_ms);
CREATE INDEX IF NOT EXISTS idx_ai_errors_created ON ai_errors (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_errors_type ON ai_errors (error_type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_conversation ON user_feedback (conversation_id);

-- RLS policies (public can insert, authenticated can read all)
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert ai_interactions" ON ai_interactions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read ai_interactions" ON ai_interactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public insert ai_errors" ON ai_errors
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read ai_errors" ON ai_errors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public insert user_feedback" ON user_feedback
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read user_feedback" ON user_feedback
  FOR SELECT USING (auth.role() = 'authenticated');

-- Enable realtime for monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE ai_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_errors;
```

## Anonymous Auth Setup (v2)

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Anonymous** sign-in (under "Auth Providers")
3. No email/password configuration needed — visitors remain anonymous
4. The admin login flow:
   - User enters password on `/admin`
   - `signInAdmin(password)` calls `supabase.auth.signInAnonymously()`
   - Password is validated against `admin_settings.admin_password`
   - On success: session persists via Supabase Auth (survives page refresh)
   - On failure: anonymous session is signed out

### Code references (v2 monitoring)

- `src/lib/analytics-service.ts` — `logAIInteraction()`, `logAIError()`, `logUserFeedback()`
- `src/lib/auth-service.ts` — `signInAdmin()`, `signOut()`, `getSession()`
- `src/lib/alert-service.ts` — Alert rules evaluation, threshold-based alerts
- `src/lib/gemini-service.ts` — `generateGeminiResponseWithMetrics()`, `generateDeepDiveResponseWithMetrics()`
- `src/components/admin/RealTimeMonitor.tsx` — Live metrics dashboard
- `src/components/admin/AnalyticsDashboard.tsx` — Charts and trends
- `src/components/admin/AITraceViewer.tsx` — Per-message AI metadata panel
- `src/components/admin/AlertCenter.tsx` — Alert history and rule config
- `src/components/admin/MetricCard.tsx` — Reusable stat card
- `src/components/admin/PerformanceChart.tsx` — Recharts chart components