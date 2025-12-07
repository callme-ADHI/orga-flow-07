import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

interface Conversation {
  id: string;
  type: "direct" | "group";
  group_id: string | null;
  org_id: string;
  created_at: string;
  updated_at: string;
  group_name?: string;
  participant_name?: string;
  participant_role?: string;
  last_message?: string;
  unread_count?: number;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  custom_id: string | null;
}

export function useChat() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch all conversations for current user
  const fetchConversations = useCallback(async () => {
    if (!profile?.id || !profile?.org_id) return;

    setLoading(true);

    try {
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("org_id", profile.org_id)
        .order("updated_at", { ascending: false });

      if (convError) {
        console.error("Error fetching conversations:", convError);
        return;
      }

      const conversationsWithDetails: Conversation[] = [];

      for (const conv of convData || []) {
        let groupName = "";
        let participantName = "";
        let participantRole = "";

        if (conv.type === "group" && conv.group_id) {
          const { data: group } = await supabase
            .from("groups")
            .select("group_name")
            .eq("id", conv.group_id)
            .single();
          groupName = group?.group_name || "Unknown Group";
        } else if (conv.type === "direct") {
          // Get the other participant
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("profile_id")
            .eq("conversation_id", conv.id);

          const otherParticipant = participants?.find(p => p.profile_id !== profile.id);
          if (otherParticipant) {
            const { data: otherProfile } = await supabase
              .from("profiles")
              .select("name, role")
              .eq("id", otherParticipant.profile_id)
              .single();
            participantName = otherProfile?.name || "Unknown";
            participantRole = otherProfile?.role || "";
          }
        }

        // Get last message
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        conversationsWithDetails.push({
          ...conv,
          type: conv.type as "direct" | "group",
          group_name: groupName,
          participant_name: participantName,
          participant_role: participantRole,
          last_message: lastMsg?.content || "",
        });
      }

      setConversations(conversationsWithDetails);
    } catch (err) {
      console.error("Error in fetchConversations:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.org_id]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!profile?.id) return;

    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return;
    }

    // Get sender details
    const messagesWithSenders: Message[] = [];
    for (const msg of messagesData || []) {
      const { data: sender } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", msg.sender_id)
        .single();

      messagesWithSenders.push({
        ...msg,
        sender_name: sender?.name || "Unknown",
        sender_role: sender?.role || "",
      });
    }

    setMessages(messagesWithSenders);
  }, [profile?.id]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!profile?.id || !activeConversation) return false;

    setSendingMessage(true);

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: profile.id,
          content,
        });

      if (error) {
        console.error("Error sending message:", error);
        return false;
      }

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversation.id);

      return true;
    } catch (err) {
      console.error("Error in sendMessage:", err);
      return false;
    } finally {
      setSendingMessage(false);
    }
  }, [profile?.id, activeConversation]);

  // Create a direct conversation
  const createDirectConversation = useCallback(async (participantId: string) => {
    if (!profile?.id || !profile?.org_id) return null;

    // Check if conversation already exists
    const { data: existingConvs } = await supabase
      .from("conversations")
      .select("id")
      .eq("type", "direct")
      .eq("org_id", profile.org_id);

    for (const conv of existingConvs || []) {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("profile_id")
        .eq("conversation_id", conv.id);

      const participantIds = participants?.map(p => p.profile_id) || [];
      if (participantIds.includes(profile.id) && participantIds.includes(participantId)) {
        return conv.id;
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({
        type: "direct",
        org_id: profile.org_id,
      })
      .select()
      .single();

    if (convError) {
      console.error("Error creating conversation:", convError);
      return null;
    }

    // Add participants
    await supabase.from("conversation_participants").insert([
      { conversation_id: newConv.id, profile_id: profile.id },
      { conversation_id: newConv.id, profile_id: participantId },
    ]);

    await fetchConversations();
    return newConv.id;
  }, [profile?.id, profile?.org_id, fetchConversations]);

  // Create or get group conversation
  const getOrCreateGroupConversation = useCallback(async (groupId: string) => {
    if (!profile?.id || !profile?.org_id) return null;

    // Check if group conversation exists
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("type", "group")
      .eq("group_id", groupId)
      .single();

    if (existingConv) {
      return existingConv.id;
    }

    // Create new group conversation
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({
        type: "group",
        group_id: groupId,
        org_id: profile.org_id,
      })
      .select()
      .single();

    if (convError) {
      console.error("Error creating group conversation:", convError);
      return null;
    }

    await fetchConversations();
    return newConv.id;
  }, [profile?.id, profile?.org_id, fetchConversations]);

  // Check if user can send message in current conversation
  const canSendMessage = useCallback(() => {
    if (!profile || !activeConversation) return false;

    // CEO and Manager can always send
    if (profile.role === "CEO" || profile.role === "Manager") return true;

    // Employee can send to groups
    if (activeConversation.type === "group") return true;

    // Employee cannot send to CEO in direct messages
    if (activeConversation.type === "direct" && activeConversation.participant_role === "CEO") {
      return false;
    }

    return true;
  }, [profile, activeConversation]);

  // Get available contacts based on role
  const getAvailableContacts = useCallback(async (): Promise<Participant[]> => {
    if (!profile?.id || !profile?.org_id) return [];

    let query = supabase
      .from("profiles")
      .select("id, name, role, custom_id")
      .eq("org_id", profile.org_id)
      .eq("approved", true)
      .neq("id", profile.id);

    // Employees can only see managers for direct messages
    if (profile.role === "Employee") {
      query = query.eq("role", "Manager");
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }

    return data || [];
  }, [profile?.id, profile?.org_id, profile?.role]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`messages-${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          const { data: sender } = await supabase
            .from("profiles")
            .select("name, role")
            .eq("id", newMessage.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...newMessage,
              sender_name: sender?.name || "Unknown",
              sender_role: sender?.role || "",
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation, fetchMessages]);

  return {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loading,
    sendingMessage,
    sendMessage,
    createDirectConversation,
    getOrCreateGroupConversation,
    canSendMessage,
    getAvailableContacts,
    refreshConversations: fetchConversations,
  };
}

export function useBannedUsers() {
  const { profile } = useAuth();
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBannedUsers = useCallback(async () => {
    if (!profile?.org_id || profile?.role !== "CEO") return;

    setLoading(true);
    const { data, error } = await supabase
      .from("banned_users")
      .select("*")
      .eq("org_id", profile.org_id);

    if (error) {
      console.error("Error fetching banned users:", error);
    } else {
      // Get user details
      const bannedWithDetails = [];
      for (const banned of data || []) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("name, email, custom_id")
          .eq("user_id", banned.user_id)
          .single();

        bannedWithDetails.push({
          ...banned,
          user_name: userProfile?.name || "Unknown",
          user_email: userProfile?.email || "",
          user_custom_id: userProfile?.custom_id || "",
        });
      }
      setBannedUsers(bannedWithDetails);
    }
    setLoading(false);
  }, [profile?.org_id, profile?.role]);

  const banUser = useCallback(async (userId: string, reason: string) => {
    if (!profile?.id || !profile?.org_id || profile?.role !== "CEO") return false;

    const { error } = await supabase.from("banned_users").insert({
      user_id: userId,
      org_id: profile.org_id,
      banned_by: profile.id,
      reason,
    });

    if (error) {
      console.error("Error banning user:", error);
      return false;
    }

    // Remove user from organization
    await supabase
      .from("profiles")
      .update({ org_id: null, approved: false })
      .eq("user_id", userId);

    await fetchBannedUsers();
    return true;
  }, [profile?.id, profile?.org_id, profile?.role, fetchBannedUsers]);

  const unbanUser = useCallback(async (bannedId: string) => {
    if (!profile?.org_id || profile?.role !== "CEO") return false;

    const { error } = await supabase
      .from("banned_users")
      .delete()
      .eq("id", bannedId);

    if (error) {
      console.error("Error unbanning user:", error);
      return false;
    }

    await fetchBannedUsers();
    return true;
  }, [profile?.org_id, profile?.role, fetchBannedUsers]);

  useEffect(() => {
    fetchBannedUsers();
  }, [fetchBannedUsers]);

  return {
    bannedUsers,
    loading,
    banUser,
    unbanUser,
    refreshBannedUsers: fetchBannedUsers,
  };
}
