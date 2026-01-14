import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, Search, MoreVertical, Circle, MessageCircle, Plus, Home, User, Users, Calendar, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ConversationData {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  lastMessage: any;
  updated_at: string;
  participants: any[];
  unreadCount: number;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
  hasReacted: boolean; // if current user reacted
}

interface MessageData {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  reactions?: Reaction[];
}

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Chat = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [message, setMessage] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserMode, setAddUserMode] = useState<'existing' | 'new'>('existing'); // 'existing' or 'new'
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Common emojis for quick reactions
  const quickEmojis = ['👍', '❤️', '😊', '😂', '🎉', '🙏'];

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to access chat");
        navigate("/login");
        return;
      }
      setCurrentUser(user);
    };
    fetchCurrentUser();
  }, [navigate]);

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      try {
        // Get conversations where user is a participant
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, last_read_at')
          .eq('user_id', currentUser.id);

        if (participantError) throw participantError;

        if (!participantData || participantData.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const conversationIds = participantData.map(p => p.conversation_id);

        // Get conversation details
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .in('id', conversationIds)
          .order('updated_at', { ascending: false });

        if (conversationsError) throw conversationsError;

        // For each conversation, get participants and last message
        const conversationsWithDetails = await Promise.all(
          (conversationsData || []).map(async (conv) => {
            // Get all participants
            const { data: participantsData } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conv.id);

            // Get profiles for all participants
            const participantIds = participantsData?.map(p => p.user_id) || [];
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .in('id', participantIds);

            // Combine participants with their profiles
            const participants = participantsData?.map(p => ({
              user_id: p.user_id,
              profiles: profiles?.find(prof => prof.id === p.user_id) || null
            })) || [];

            // Get last message
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Get unread count
            const userParticipant = participantData.find(p => p.conversation_id === conv.id);
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .gt('created_at', userParticipant?.last_read_at || new Date(0).toISOString())
              .neq('sender_id', currentUser.id);

            // Determine conversation name for direct messages
            let conversationName = conv.name;
            if (conv.type === 'direct' && !conversationName) {
              const otherParticipant = participants?.find((p: any) => p.user_id !== currentUser.id);
              conversationName = otherParticipant?.profiles?.display_name || 'Unknown User';
            }

            return {
              ...conv,
              name: conversationName,
              participants,
              lastMessage,
              unreadCount: unreadCount || 0
            };
          })
        );

        setConversations(conversationsWithDetails);

        // Auto-select first conversation if none selected
        if (!selectedConversationId && conversationsWithDetails.length > 0) {
          setSelectedConversationId(conversationsWithDetails[0].id);
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser, selectedConversationId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId || !currentUser) {
      setMessages([]);
      return;
    }

    // Reset sending state when switching conversations
    setIsSending(false);

    const fetchMessages = async () => {
      try {
        console.log('Fetching messages for conversation:', selectedConversationId);

        // Clear messages first to show loading state
        setMessages([]);

        // Fetch messages first
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        console.log('Fetched messages:', messagesData?.length || 0);

        // If no messages, set empty array and return
        if (!messagesData || messagesData.length === 0) {
          setMessages([]);
          return;
        }

        // Get unique sender IDs
        const senderIds = [...new Set(messagesData.map(m => m.sender_id))];

        // Fetch all sender profiles in one query
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', senderIds);

        if (profilesError) throw profilesError;

        // Create a map of profiles
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Combine messages with sender data
        const messagesWithSenders = messagesData.map(msg => ({
          ...msg,
          sender: profileMap.get(msg.sender_id) || { id: msg.sender_id, display_name: null, avatar_url: null }
        }));

        // Fetch reactions for all messages
        const messageIds = messagesWithSenders.map(m => m.id);
        const reactionsByMessage = await fetchReactions(messageIds);

        // Add reactions to messages
        const messagesWithReactions = messagesWithSenders.map(msg => ({
          ...msg,
          reactions: reactionsByMessage[msg.id] || []
        }));

        setMessages(messagesWithReactions);

        // Mark messages as read
        await supabase
          .from('conversation_participants')
          .update({ last_read_at: new Date().toISOString() })
          .eq('conversation_id', selectedConversationId)
          .eq('user_id', currentUser.id);

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };

    fetchMessages();
  }, [selectedConversationId, currentUser]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    if (!selectedConversationId) return;

    console.log('Setting up real-time subscription for conversation:', selectedConversationId);

    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`
        },
        async (payload) => {
          console.log('Real-time message received:', payload.new);

          // Fetch the sender profile for the new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage = {
            ...payload.new,
            sender: senderData
          } as MessageData;

          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some(m => m.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping:', newMessage.id);
              return prev;
            }
            console.log('Adding new message to state:', newMessage.id);
            return [...prev, newMessage];
          });

          // Update conversation list with new last message
          setConversations(prev => prev.map(conv => {
            if (conv.id === selectedConversationId) {
              return {
                ...conv,
                lastMessage: {
                  content: newMessage.content,
                  created_at: newMessage.created_at,
                  sender_id: newMessage.sender_id
                },
                updated_at: newMessage.created_at
              };
            }
            return conv;
          }));

          // Scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription for conversation:', selectedConversationId);
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId]);

  // Subscribe to reactions in real-time
  useEffect(() => {
    if (!selectedConversationId) return;

    console.log('Setting up real-time subscription for reactions');

    const channel = supabase
      .channel(`reactions:${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions'
        },
        async (payload) => {
          console.log('Real-time reaction event:', payload.eventType);

          // Get all message IDs currently displayed
          const currentMessageIds = messages.map(m => m.id);

          // Refetch reactions for all messages
          const reactionsByMessage = await fetchReactions(currentMessageIds);

          // Update messages with new reactions
          setMessages(prev => prev.map(msg => ({
            ...msg,
            reactions: reactionsByMessage[msg.id] || []
          })));
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription for reactions');
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, messages]);

  // Fetch all users for new chat modal and add user modal
  useEffect(() => {
    if ((!isNewChatOpen && !isAddUserOpen) || !currentUser) return;

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, first_name, last_name')
          .neq('id', currentUser.id);

        if (error) throw error;

        // Map users and use first_name/last_name as fallback for display_name
        let mappedUsers = (data || []).map(user => ({
          id: user.id,
          display_name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || null,
          avatar_url: user.avatar_url
        }));

        // If adding to existing conversation, filter out users already in the conversation
        if (isAddUserOpen && selectedConversationId) {
          const { data: participantsData } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', selectedConversationId);

          const existingUserIds = new Set(participantsData?.map(p => p.user_id) || []);
          mappedUsers = mappedUsers.filter(user => !existingUserIds.has(user.id));
        }

        setAllUsers(mappedUsers);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    };

    fetchUsers();
  }, [isNewChatOpen, isAddUserOpen, currentUser, selectedConversationId]);

  const filteredPeople = allUsers.filter(person => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = person.display_name || '';
    const userId = person.id || '';

    return displayName.toLowerCase().includes(searchLower) ||
           userId.toLowerCase().includes(searchLower);
  });

  // Fetch reactions for messages
  const fetchReactions = async (messageIds: string[]) => {
    if (messageIds.length === 0 || !currentUser) return {};

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('message_id, user_id, emoji')
        .in('message_id', messageIds);

      if (error) throw error;

      // Group reactions by message and emoji
      const reactionsByMessage: Record<string, Reaction[]> = {};

      (data || []).forEach(reaction => {
        if (!reactionsByMessage[reaction.message_id]) {
          reactionsByMessage[reaction.message_id] = [];
        }

        const existingReaction = reactionsByMessage[reaction.message_id].find(
          r => r.emoji === reaction.emoji
        );

        if (existingReaction) {
          existingReaction.count++;
          existingReaction.users.push(reaction.user_id);
          if (reaction.user_id === currentUser.id) {
            existingReaction.hasReacted = true;
          }
        } else {
          reactionsByMessage[reaction.message_id].push({
            emoji: reaction.emoji,
            count: 1,
            users: [reaction.user_id],
            hasReacted: reaction.user_id === currentUser.id
          });
        }
      });

      return reactionsByMessage;
    } catch (error) {
      console.error('Error fetching reactions:', error);
      return {};
    }
  };

  // Toggle reaction on a message
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    try {
      // Check if user has any existing reaction on this message
      const { data: existingReactions } = await supabase
        .from('message_reactions')
        .select('id, emoji')
        .eq('message_id', messageId)
        .eq('user_id', currentUser.id);

      if (existingReactions && existingReactions.length > 0) {
        const sameEmojiReaction = existingReactions.find(r => r.emoji === emoji);

        if (sameEmojiReaction) {
          // Remove the reaction if clicking the same emoji
          await supabase
            .from('message_reactions')
            .delete()
            .eq('id', sameEmojiReaction.id);
        } else {
          // Replace existing reaction with new emoji
          // First delete the old reaction
          await supabase
            .from('message_reactions')
            .delete()
            .eq('id', existingReactions[0].id);

          // Then add the new reaction
          await supabase
            .from('message_reactions')
            .insert([{
              message_id: messageId,
              user_id: currentUser.id,
              emoji
            }]);
        }
      } else {
        // Add new reaction (first reaction on this message)
        await supabase
          .from('message_reactions')
          .insert([{
            message_id: messageId,
            user_id: currentUser.id,
            emoji
          }]);
      }

      // Update local state
      const reactionsByMessage = await fetchReactions([messageId]);
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: reactionsByMessage[messageId] || []
          };
        }
        return msg;
      }));

      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversationId || !currentUser || isSending) {
      console.log('Send message blocked:', {
        hasMessage: !!message.trim(),
        hasConversation: !!selectedConversationId,
        hasUser: !!currentUser,
        isSending
      });
      return;
    }

    const messageContent = message.trim();

    try {
      setIsSending(true);
      console.log('Sending message:', {
        content: messageContent,
        conversationId: selectedConversationId,
        senderId: currentUser.id
      });

      // Clear input immediately for better UX
      setMessage("");

      // Insert the message
      console.log('Attempting database insert...');
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: selectedConversationId,
          sender_id: currentUser.id,
          content: messageContent
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting message:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (!newMessage) {
        console.error('No message returned from insert');
        throw new Error('Failed to insert message - no data returned');
      }

      console.log('Message inserted successfully:', newMessage.id);

      // Fetch the current user's profile for the message
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', currentUser.id)
        .single();

      // Add message to local state immediately (don't wait for real-time)
      const messageWithSender: MessageData = {
        ...newMessage,
        sender: currentUserProfile || { id: currentUser.id, display_name: null, avatar_url: null }
      };

      setMessages(prev => {
        // Check if message already exists (in case real-time already added it)
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) {
          console.log('Message already in state, skipping duplicate');
          return prev;
        }
        console.log('Adding message to local state');
        return [...prev, messageWithSender];
      });

      // Update the conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversationId);

      // Update the conversation in the local state with the new last message
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            lastMessage: {
              content: messageContent,
              created_at: newMessage.created_at,
              sender_id: currentUser.id
            },
            updated_at: newMessage.created_at
          };
        }
        return conv;
      }));

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      setIsSending(false);
    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Full error object:', error);
      toast.error('Failed to send message');
      // Restore the message content if there was an error
      setMessage(messageContent);
      setIsSending(false);
    }
  };

  const handleStartChat = async (person: UserProfile) => {
    if (!currentUser) return;

    try {
      // Check if conversation already exists
      const { data: existingConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id, conversations(type)')
        .in('user_id', [currentUser.id, person.id]);

      if (existingConversations && existingConversations.length > 0) {
        const conversationCounts = existingConversations.reduce((acc: any, item: any) => {
          if (item.conversations?.type === 'direct') {
            acc[item.conversation_id] = (acc[item.conversation_id] || 0) + 1;
          }
          return acc;
        }, {});

        const existingConvId = Object.entries(conversationCounts)
          .find(([_, count]) => count === 2)?.[0];

        if (existingConvId) {
          setSelectedConversationId(existingConvId);
          setIsNewChatOpen(false);
          setSearchQuery("");
          return;
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert([{ type: 'direct', name: null }])
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: currentUser.id },
          { conversation_id: conversation.id, user_id: person.id }
        ]);

      if (participantError) throw participantError;

      // Fetch the complete profile data for the current user
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', currentUser.id)
        .single();

      // Create the conversation object with proper participant structure
      const newConversation: ConversationData = {
        id: conversation.id,
        type: 'direct',
        name: person.display_name || 'Unknown User',
        updated_at: conversation.updated_at,
        participants: [
          {
            user_id: currentUser.id,
            profiles: currentUserProfile || { id: currentUser.id, display_name: null, avatar_url: null }
          },
          {
            user_id: person.id,
            profiles: { id: person.id, display_name: person.display_name, avatar_url: person.avatar_url }
          }
        ],
        lastMessage: null,
        unreadCount: 0
      };

      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversationId(conversation.id);
      setIsNewChatOpen(false);
      setSearchQuery("");

      toast.success(`Started conversation with ${person.display_name || 'user'}`);
    } catch (error: any) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleAddUserToConversation = async (person: UserProfile) => {
    if (!currentUser || !selectedConversationId) return;

    try {
      if (addUserMode === 'existing') {
        // Add user to existing conversation
        const { error: participantError } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: selectedConversationId, user_id: person.id }
          ]);

        if (participantError) throw participantError;

        // Update conversation type to group if it was direct
        const selectedConv = conversations.find(c => c.id === selectedConversationId);
        if (selectedConv?.type === 'direct') {
          await supabase
            .from('conversations')
            .update({ type: 'group' })
            .eq('id', selectedConversationId);
        }

        // Refresh conversations to show updated participant list
        const { data: participantsData } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', selectedConversationId);

        const participantIds = participantsData?.map(p => p.user_id) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', participantIds);

        const participants = participantsData?.map(p => ({
          user_id: p.user_id,
          profiles: profiles?.find(prof => prof.id === p.user_id) || null
        })) || [];

        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversationId) {
            return {
              ...conv,
              type: selectedConv?.type === 'direct' ? 'group' : conv.type,
              participants
            };
          }
          return conv;
        }));

        toast.success(`Added ${person.display_name || 'user'} to the conversation`);
      } else {
        // Create new conversation with selected user
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert([{ type: 'direct', name: null }])
          .select()
          .single();

        if (convError) throw convError;

        // Add participants (current user and selected user)
        const { error: participantError } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: conversation.id, user_id: currentUser.id },
            { conversation_id: conversation.id, user_id: person.id }
          ]);

        if (participantError) throw participantError;

        // Fetch the complete profile data for the current user
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', currentUser.id)
          .single();

        // Create the conversation object with proper participant structure
        const newConversation: ConversationData = {
          id: conversation.id,
          type: 'direct',
          name: person.display_name || 'Unknown User',
          updated_at: conversation.updated_at,
          participants: [
            {
              user_id: currentUser.id,
              profiles: currentUserProfile || { id: currentUser.id, display_name: null, avatar_url: null }
            },
            {
              user_id: person.id,
              profiles: { id: person.id, display_name: person.display_name, avatar_url: person.avatar_url }
            }
          ],
          lastMessage: null,
          unreadCount: 0
        };

        // Add to conversations list
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversationId(conversation.id);

        toast.success(`Started new conversation with ${person.display_name || 'user'}`);
      }

      setIsAddUserOpen(false);
      setSearchQuery("");
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  return (
    <>
        {/* Chat Section Title - Sticky */}
        <div className="bg-transparent sticky top-[57px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <h1 className="text-2xl font-bold text-foreground font-comfortaa">Talk</h1>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-130px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full bg-card/90 backdrop-blur-sm border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                    <Button
                      size="sm"
                      className="rounded-full h-8 w-8 p-0"
                      onClick={() => setIsNewChatOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No conversations yet</p>
                      <p className="text-sm mt-1">Start a new chat to connect with others</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map((conv) => {
                        const otherParticipant = conv.participants?.find((p: any) => p.user_id !== currentUser?.id);
                        const avatarUrl = conv.type === 'direct'
                          ? otherParticipant?.profiles?.avatar_url
                          : null;

                        // Display name - use conv.name which already has the proper participant name
                        const displayName = conv.name || 'Unknown User';

                        return (
                          <div
                            key={conv.id}
                            onClick={() => setSelectedConversationId(conv.id)}
                            className={`p-4 cursor-pointer border-b border-border/30 hover:bg-muted/50 transition-colors ${
                              selectedConversationId === conv.id ? 'bg-muted/70' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={avatarUrl || ''} />
                                  <AvatarFallback className="bg-primary/10">
                                    {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm truncate">{displayName}</p>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {conv.lastMessage
                                        ? formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })
                                        : ''}
                                    </span>
                                    {conv.unreadCount > 0 && (
                                      <Badge variant="default" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                                        {conv.unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {conv.lastMessage?.content || 'No messages yet'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-full bg-card/90 backdrop-blur-sm border border-border flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="border-b border-border/30 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={
                              selectedConversation.type === 'direct'
                                ? selectedConversation.participants?.find((p: any) => p.user_id !== currentUser?.id)?.profiles?.avatar_url
                                : ''
                            } />
                            <AvatarFallback className="bg-primary/10">
                              {(selectedConversation.name || 'Unknown User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{selectedConversation.name || 'Unknown User'}</h3>
                            {selectedConversation.type === 'group' && (
                              <p className="text-sm text-muted-foreground">
                                Group • {selectedConversation.participants?.length || 0} members
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setAddUserMode('existing');
                              setIsAddUserOpen(true);
                            }}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add user to this conversation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setAddUserMode('new');
                              setIsAddUserOpen(true);
                            }}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add user in a new conversation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isOwn = msg.sender_id === currentUser?.id;
                          const senderName = msg.sender?.display_name || 'Unknown';
                          const senderAvatar = msg.sender?.avatar_url || '';

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                            >
                              <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                {!isOwn && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={senderAvatar} />
                                    <AvatarFallback className="bg-primary/10 text-xs">
                                      {senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className="relative group">
                                  <div className={`rounded-lg p-3 ${
                                    isOwn
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}>
                                    {!isOwn && (
                                      <p className="text-xs font-medium mb-1 text-primary">{senderName}</p>
                                    )}
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${
                                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}>
                                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>

                                  {/* Reaction button (appears on hover) - only for other users' messages */}
                                  {!isOwn && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute -bottom-3 right-0 h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border"
                                        onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                      >
                                        <span className="text-sm">😊</span>
                                      </Button>

                                      {/* Emoji picker */}
                                      {showEmojiPicker === msg.id && (
                                        <div className="absolute bottom-full mb-2 right-0 bg-background border border-border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                                          {quickEmojis.map(emoji => (
                                            <button
                                              key={emoji}
                                              onClick={() => handleToggleReaction(msg.id, emoji)}
                                              className="hover:bg-muted rounded p-1 text-lg transition-colors"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Reactions display */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {msg.reactions.map((reaction) => (
                                    <button
                                      key={reaction.emoji}
                                      onClick={() => {
                                        // Only allow removing own reaction
                                        if (reaction.hasReacted && !isOwn) {
                                          handleToggleReaction(msg.id, reaction.emoji);
                                        }
                                      }}
                                      disabled={!reaction.hasReacted || isOwn}
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                                        reaction.hasReacted
                                          ? 'bg-primary/20 border-primary/40 cursor-pointer hover:bg-primary/30'
                                          : 'bg-muted border-border cursor-default'
                                      } ${isOwn ? 'cursor-not-allowed' : ''}`}
                                    >
                                      <span>{reaction.emoji}</span>
                                      <span className="text-xs">{reaction.count}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Message Input */}
                    <div className="border-t border-border/30 p-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start chatting</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>

        {/* New Chat Modal */}
        <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
          <DialogContent className="sm:max-w-md bg-card border border-border">
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
              <DialogDescription>
                Search and select a user to start a new conversation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handleStartChat(person)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={person.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10">
                            {(person.display_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {person.display_name || 'User'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {allUsers.length === 0 ? (
                      <>
                        <p>No other users found in the system.</p>
                        <p className="text-xs mt-2">Check the console for details.</p>
                      </>
                    ) : (
                      <p>No users found matching "{searchQuery}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add User Modal */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent className="sm:max-w-md bg-card border border-border">
            <DialogHeader>
              <DialogTitle>
                {addUserMode === 'existing' ? 'Add User to Conversation' : 'Start New Conversation'}
              </DialogTitle>
              <DialogDescription>
                {addUserMode === 'existing'
                  ? 'Select a user to add to this conversation. They will see all previous messages.'
                  : 'Select a user to start a new conversation with.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handleAddUserToConversation(person)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={person.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10">
                            {(person.display_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {person.display_name || 'User'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {allUsers.length === 0 ? (
                      <>
                        <p>No users available to add.</p>
                        {addUserMode === 'existing' && (
                          <p className="text-xs mt-2">All users are already in this conversation.</p>
                        )}
                      </>
                    ) : (
                      <p>No users found matching "{searchQuery}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
};

export default Chat;
