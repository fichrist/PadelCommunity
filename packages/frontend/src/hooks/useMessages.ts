import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing chat messages
 * Platform-agnostic - works for both React Web and React Native
 */

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
  sender: {
    id: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  reactions?: MessageReaction[];
}

export interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  addReaction: (messageId: string, emoji: string) => Promise<boolean>;
  removeReaction: (messageId: string, emoji: string) => Promise<boolean>;
  markAsRead: () => Promise<void>;
}

/**
 * Hook for managing messages in a conversation
 */
export const useMessages = (
  conversationId: string | null,
  currentUserId: string | null
): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          conversation_id,
          profiles:sender_id (
            id,
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Fetch reactions for all messages
      const messageIds = (data || []).map(m => m.id);
      const { data: reactions, error: reactionsError } = await supabase
        .from('message_reactions')
        .select('message_id, emoji, user_id')
        .in('message_id', messageIds);

      if (reactionsError) throw reactionsError;

      // Organize reactions by message
      const reactionsMap = new Map<string, MessageReaction[]>();
      (reactions || []).forEach(r => {
        if (!reactionsMap.has(r.message_id)) {
          reactionsMap.set(r.message_id, []);
        }

        const existing = reactionsMap.get(r.message_id)!.find(mr => mr.emoji === r.emoji);
        if (existing) {
          existing.count++;
          existing.users.push(r.user_id);
          if (r.user_id === currentUserId) {
            existing.hasReacted = true;
          }
        } else {
          reactionsMap.get(r.message_id)!.push({
            emoji: r.emoji,
            count: 1,
            users: [r.user_id],
            hasReacted: r.user_id === currentUserId,
          });
        }
      });

      // Format messages with reactions
      const formatted: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        conversation_id: msg.conversation_id,
        sender: {
          id: msg.profiles.id,
          display_name: msg.profiles.display_name,
          first_name: msg.profiles.first_name,
          last_name: msg.profiles.last_name,
          avatar_url: msg.profiles.avatar_url,
        },
        reactions: reactionsMap.get(msg.id) || [],
      }));

      setMessages(formatted);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch full message with sender details
          const { data } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              sender_id,
              conversation_id,
              profiles:sender_id (
                id,
                display_name,
                first_name,
                last_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const newMessage: Message = {
              id: data.id,
              content: data.content,
              created_at: data.created_at,
              sender_id: data.sender_id,
              conversation_id: data.conversation_id,
              sender: {
                id: data.profiles.id,
                display_name: data.profiles.display_name,
                first_name: data.profiles.first_name,
                last_name: data.profiles.last_name,
                avatar_url: data.profiles.avatar_url,
              },
              reactions: [],
            };

            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!conversationId || !currentUserId || !content.trim()) {
        return false;
      }

      setIsSending(true);
      setError(null);

      try {
        const { error: sendError } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: content.trim(),
        });

        if (sendError) throw sendError;

        // Update conversation updated_at
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        return true;
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, currentUserId]
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string): Promise<boolean> => {
      if (!currentUserId) return false;

      try {
        const { error } = await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji,
        });

        if (error) throw error;

        await fetchMessages(); // Refresh to get updated reactions
        return true;
      } catch (err) {
        console.error('Error adding reaction:', err);
        return false;
      }
    },
    [currentUserId, fetchMessages]
  );

  const removeReaction = useCallback(
    async (messageId: string, emoji: string): Promise<boolean> => {
      if (!currentUserId) return false;

      try {
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji);

        if (error) throw error;

        await fetchMessages(); // Refresh to get updated reactions
        return true;
      } catch (err) {
        console.error('Error removing reaction:', err);
        return false;
      }
    },
    [currentUserId, fetchMessages]
  );

  const markAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId) return;

    try {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUserId);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [conversationId, currentUserId]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    addReaction,
    removeReaction,
    markAsRead,
  };
};
