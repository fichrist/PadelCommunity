import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing chat conversations
 * Platform-agnostic - works for both React Web and React Native
 */

export interface ConversationParticipant {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
}

export interface Conversation {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  lastMessage: any;
  updated_at: string;
  participants: ConversationParticipant[];
  unreadCount: number;
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  createDirectConversation: (userId: string) => Promise<string | null>;
  createGroupConversation: (name: string, userIds: string[]) => Promise<string | null>;
  addParticipants: (conversationId: string, userIds: string[]) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing conversations list and operations
 */
export const useConversations = (currentUserId: string | null): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get conversations where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', currentUserId);

      if (participantError) throw participantError;

      if (!participantData || participantData.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      // Get conversation details
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, name, type, updated_at')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Get all participants for these conversations
      const { data: allParticipants, error: allParticipantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          profiles:user_id (
            id,
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .in('conversation_id', conversationIds);

      if (allParticipantsError) throw allParticipantsError;

      // Get last messages for all conversations
      const { data: lastMessages, error: lastMessagesError } = await supabase
        .from('messages')
        .select('id, content, created_at, conversation_id, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (lastMessagesError) throw lastMessagesError;

      // Get unread counts
      const { data: unreadMessages, error: unreadError } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .gt('created_at', participantData.map(p => p.last_read_at || '1970-01-01').join(','));

      if (unreadError) throw unreadError;

      // Organize data
      const formatted: Conversation[] = (conversationsData || []).map(conv => {
        const participants = (allParticipants || [])
          .filter(p => p.conversation_id === conv.id)
          .map(p => ({
            id: p.profiles.id,
            display_name: p.profiles.display_name,
            first_name: p.profiles.first_name,
            last_name: p.profiles.last_name,
            avatar_url: p.profiles.avatar_url,
          }));

        const lastMessage = (lastMessages || []).find(m => m.conversation_id === conv.id);
        const unreadCount = (unreadMessages || []).filter(m => m.conversation_id === conv.id).length;

        return {
          id: conv.id,
          name: conv.name,
          type: conv.type,
          updated_at: conv.updated_at,
          lastMessage,
          participants,
          unreadCount,
        };
      });

      setConversations(formatted);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createDirectConversation = useCallback(async (userId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (existing) {
        for (const conv of existing) {
          const { data: otherParticipants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id);

          if (
            otherParticipants &&
            otherParticipants.length === 2 &&
            otherParticipants.some(p => p.user_id === userId)
          ) {
            return conv.conversation_id;
          }
        }
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ type: 'direct' })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, user_id: currentUserId },
          { conversation_id: newConv.id, user_id: userId },
        ]);

      if (participantsError) throw participantsError;

      await fetchConversations();
      return newConv.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  }, [currentUserId, fetchConversations]);

  const createGroupConversation = useCallback(
    async (name: string, userIds: string[]): Promise<string | null> => {
      if (!currentUserId) return null;

      try {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({ type: 'group', name })
          .select()
          .single();

        if (convError) throw convError;

        const participants = [currentUserId, ...userIds].map(userId => ({
          conversation_id: newConv.id,
          user_id: userId,
        }));

        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(participants);

        if (participantsError) throw participantsError;

        await fetchConversations();
        return newConv.id;
      } catch (err) {
        console.error('Error creating group conversation:', err);
        return null;
      }
    },
    [currentUserId, fetchConversations]
  );

  const addParticipants = useCallback(
    async (conversationId: string, userIds: string[]): Promise<boolean> => {
      try {
        const participants = userIds.map(userId => ({
          conversation_id: conversationId,
          user_id: userId,
        }));

        const { error } = await supabase
          .from('conversation_participants')
          .insert(participants);

        if (error) throw error;

        await fetchConversations();
        return true;
      } catch (err) {
        console.error('Error adding participants:', err);
        return false;
      }
    },
    [fetchConversations]
  );

  return {
    conversations,
    isLoading,
    error,
    selectedConversationId,
    setSelectedConversationId,
    createDirectConversation,
    createGroupConversation,
    addParticipants,
    refetch: fetchConversations,
  };
};
