-- Create conversations table for both direct and group chats
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation participants for direct chats
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, profile_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_by UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Create banned users table
CREATE TABLE public.banned_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- RLS for conversations: users can see conversations they are part of or group conversations they belong to
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())
  AND (
    -- Direct conversations where user is participant
    (type = 'direct' AND id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    ))
    OR
    -- Group conversations where user is member OR user is CEO/Manager
    (type = 'group' AND (
      group_id IN (
        SELECT group_id FROM group_members 
        WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND org_id = conversations.org_id 
        AND role IN ('CEO', 'Manager')
      )
    ))
  )
);

-- CEO and Manager can create conversations
CREATE POLICY "CEO and Manager can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND org_id = conversations.org_id 
    AND role IN ('CEO', 'Manager')
  )
);

-- Employees can create group conversations for their groups
CREATE POLICY "Employees can create group conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  type = 'group' AND
  group_id IN (
    SELECT group_id FROM group_members 
    WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- RLS for conversation participants
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE
    org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())
  )
);

CREATE POLICY "CEO and Manager can add participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN conversations c ON c.org_id = p.org_id
    WHERE p.user_id = auth.uid() 
    AND c.id = conversation_participants.conversation_id
    AND p.role IN ('CEO', 'Manager')
  )
);

-- RLS for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT c.id FROM conversations c
    WHERE c.org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())
    AND (
      (c.type = 'direct' AND c.id IN (
        SELECT conversation_id FROM conversation_participants 
        WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      ))
      OR
      (c.type = 'group' AND (
        c.group_id IN (
          SELECT group_id FROM group_members 
          WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE user_id = auth.uid() 
          AND org_id = c.org_id 
          AND role IN ('CEO', 'Manager')
        )
      ))
    )
  )
);

-- CEO and Manager can send messages to anyone
CREATE POLICY "CEO and Manager can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN conversations c ON c.org_id = p.org_id
    WHERE p.user_id = auth.uid() 
    AND c.id = messages.conversation_id
    AND p.role IN ('CEO', 'Manager')
  )
);

-- Employees can send messages to group chats and to managers (not CEO)
CREATE POLICY "Employees can send messages to groups and managers"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND (
    -- Group conversations they belong to
    conversation_id IN (
      SELECT c.id FROM conversations c
      WHERE c.type = 'group' 
      AND c.group_id IN (
        SELECT group_id FROM group_members 
        WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    )
    OR
    -- Direct conversations with managers only (not CEO)
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      JOIN profiles p ON p.id = cp.profile_id
      WHERE c.type = 'direct'
      AND p.role = 'Manager'
      AND c.id IN (
        SELECT conversation_id FROM conversation_participants 
        WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    )
  )
);

-- RLS for banned users
CREATE POLICY "CEO can view banned users"
ON public.banned_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND org_id = banned_users.org_id 
    AND role = 'CEO'
  )
);

CREATE POLICY "CEO can ban users"
ON public.banned_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND org_id = banned_users.org_id 
    AND role = 'CEO'
  )
);

CREATE POLICY "CEO can unban users"
ON public.banned_users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND org_id = banned_users.org_id 
    AND role = 'CEO'
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;