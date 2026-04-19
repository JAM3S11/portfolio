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
VALUES ('your-secure-password-here', true, 'jdndirangu2020@gmail.com');

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat (read/write for authenticated, read-only for anon)
CREATE POLICY "Allow public read conversations" ON conversations
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert conversations" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert messages" ON messages
  FOR INSERT WITH CHECK (true);

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
3. Enter: `jdndirangu2020@gmail.com`
4. Assign role: `Developer`

---

## Support

- Supabase Docs: supabase.com/docs
- Issues: Create ticket in project

---

Once you've set this up, let me know and I'll continue with the chatbot code!