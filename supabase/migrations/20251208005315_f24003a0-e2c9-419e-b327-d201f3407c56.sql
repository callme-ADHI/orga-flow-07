-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "CEO and Manager can create conversations" ON conversations;
DROP POLICY IF EXISTS "Employees can create group conversations" ON conversations;

-- Create permissive policies for conversations
CREATE POLICY "Users can view their conversations"
ON conversations
FOR SELECT
USING (
  (org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid()))
  AND (
    (type = 'direct' AND id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    ))
    OR 
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

CREATE POLICY "CEO and Manager can create conversations"
ON conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND org_id = conversations.org_id 
    AND role IN ('CEO', 'Manager')
  )
);

CREATE POLICY "Employees can create group conversations"
ON conversations
FOR INSERT
WITH CHECK (
  type = 'group' 
  AND group_id IN (
    SELECT group_id FROM group_members 
    WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- Fix conversation_participants policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "CEO and Manager can add participants" ON conversation_participants;

CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "CEO and Manager can add participants"
ON conversation_participants
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

-- Fix messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "CEO and Manager can send messages" ON messages;
DROP POLICY IF EXISTS "Employees can send messages to groups and managers" ON messages;

CREATE POLICY "Users can view messages in their conversations"
ON messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT c.id FROM conversations c
    WHERE c.org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid())
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

CREATE POLICY "CEO and Manager can send messages"
ON messages
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

CREATE POLICY "Employees can send messages to groups and managers"
ON messages
FOR INSERT
WITH CHECK (
  sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND (
    conversation_id IN (
      SELECT c.id FROM conversations c
      WHERE c.type = 'group' 
      AND c.group_id IN (
        SELECT group_id FROM group_members 
        WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    )
    OR conversation_id IN (
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