import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  Loader2,
  Calendar,
  MapPin,
  Users,
  Trash2,
  Plus,
  X,
  MessageCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
  Smile,
  Heart,
  Trophy
} from "lucide-react";
import { formatParticipantName } from "@/lib/matchParticipants";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import EditMatchDialog from "@/components/EditMatchDialog";
import { supabase, getUserIdFromStorage, createFreshSupabaseClient } from "@/integrations/supabase/client";
import { createThoughtReactionNotifications } from "@/lib/notifications";
import { toast } from "sonner";

interface MatchCardProps {
  match: any;
  currentUserId?: string;
  onDeleteMatch?: (matchId: string) => void;
  onAddPlayer?: (matchId: string) => void;
  onDeleteParticipant?: (participantId: string) => void;
  onCommentsClick?: (match: any) => void;
  onProfileImageClick?: (imageUrl: string | null, name: string) => void;
  onUpdateMatch?: () => void;
  thoughts?: any[];
  onSubmitThought?: (matchId: string, content: string) => Promise<void>;
  onEditThought?: (thoughtId: string, content: string) => Promise<void>;
  onDeleteThought?: (thoughtId: string) => Promise<void>;
  defaultExpandThoughts?: boolean;
}

export const MatchCard = ({
  match,
  currentUserId,
  onDeleteMatch,
  onAddPlayer,
  onDeleteParticipant,
  onCommentsClick,
  onProfileImageClick,
  onUpdateMatch,
  thoughts = [],
  onSubmitThought,
  onEditThought,
  onDeleteThought,
  defaultExpandThoughts = false,
}: MatchCardProps) => {
  const [showThoughts, setShowThoughts] = useState(defaultExpandThoughts);
  const [newThought, setNewThought] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingThoughtId, setEditingThoughtId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [editMatchDialogOpen, setEditMatchDialogOpen] = useState(false);
  const [showRestrictedPlayers, setShowRestrictedPlayers] = useState(false);
  const [restrictedPlayerNames, setRestrictedPlayerNames] = useState<string[]>([]);
  const [matchGroupNames, setMatchGroupNames] = useState<string[]>([]);

  const availableEmojis = ["👍", "❤️", "😂", "🎾", "🔥", "👏"];

  // Track reactions per thought from database
  const [thoughtReactions, setThoughtReactions] = useState<Record<string, Record<string, string[]>>>({});
  // Map user IDs to display names for reaction tooltips
  const [reactorNames, setReactorNames] = useState<Record<string, string>>({});

  // Fetch restricted player names or group names
  useEffect(() => {
    const fetchMatchTypeInfo = async () => {
      const client = createFreshSupabaseClient();

      if (match.restricted_users && match.restricted_users.length > 0) {
        const { data: profiles } = await client
          .from('profiles')
          .select('first_name, last_name')
          .in('id', match.restricted_users);

        if (profiles) {
          setRestrictedPlayerNames(
            profiles.map((p: any) => `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown')
          );
        }
      } else if (match.group_ids && match.group_ids.length > 0) {
        const { data: groups } = await client
          .from('groups')
          .select('name')
          .in('id', match.group_ids);

        if (groups) {
          setMatchGroupNames(groups.map((g: any) => g.name));
        }
      }
    };

    fetchMatchTypeInfo();
  }, [match.restricted_users, match.group_ids]);

  // Fetch reactions for all thoughts when component mounts or thoughts change
  useEffect(() => {
    if (!thoughts || thoughts.length === 0) return;

    const thoughtIds = thoughts.map(t => t.id);

    const fetchReactions = async () => {
      try {
        const client = createFreshSupabaseClient();
        const { data, error } = await client
          .from('thought_reactions')
          .select('*')
          .in('thought_id', thoughtIds);

        if (error) {
          console.error('Error fetching reactions:', error);
          return;
        }

        // Group reactions by thought_id and emoji
        const reactionsMap: Record<string, Record<string, string[]>> = {};
        const allUserIds = new Set<string>();
        data?.forEach(reaction => {
          if (!reactionsMap[reaction.thought_id]) {
            reactionsMap[reaction.thought_id] = {};
          }
          if (!reactionsMap[reaction.thought_id][reaction.emoji]) {
            reactionsMap[reaction.thought_id][reaction.emoji] = [];
          }
          reactionsMap[reaction.thought_id][reaction.emoji].push(reaction.user_id);
          allUserIds.add(reaction.user_id);
        });

        setThoughtReactions(reactionsMap);

        // Fetch display names for all reactors
        if (allUserIds.size > 0) {
          const { data: profiles } = await client
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', Array.from(allUserIds));

          if (profiles) {
            const names: Record<string, string> = {};
            profiles.forEach(p => {
              names[p.id] = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown';
            });
            setReactorNames(prev => ({ ...prev, ...names }));
          }
        }
      } catch (err) {
        console.error('Error fetching reactions:', err);
      }
    };

    fetchReactions();

    // Subscribe to real-time updates for reactions (unique channel per match)
    const subscription = supabase
      .channel(`thought-reactions-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thought_reactions'
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [thoughts, match.id]);

  const handleSubmitThought = async () => {
    if (!newThought.trim() || !onSubmitThought) return;

    setIsSubmitting(true);
    try {
      await onSubmitThought(match.id, newThought);
      setNewThought("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (thoughtId: string, emoji: string) => {
    if (!currentUserId) return;

    const thoughtReactionsMap = thoughtReactions[thoughtId] || {};
    const emojiReactions = thoughtReactionsMap[emoji] || [];
    const hasReacted = emojiReactions.includes(currentUserId);

    // Optimistic UI update
    setThoughtReactions(prev => {
      const updated = { ...prev };
      const thoughtMap = { ...(updated[thoughtId] || {}) };
      const users = [...(thoughtMap[emoji] || [])];

      if (hasReacted) {
        thoughtMap[emoji] = users.filter(id => id !== currentUserId);
        if (thoughtMap[emoji].length === 0) delete thoughtMap[emoji];
      } else {
        thoughtMap[emoji] = [...users, currentUserId];
      }

      updated[thoughtId] = thoughtMap;
      return updated;
    });

    setShowEmojiPicker(null);

    try {
      const client = createFreshSupabaseClient();

      if (hasReacted) {
        const { error } = await client
          .from('thought_reactions')
          .delete()
          .eq('thought_id', thoughtId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji);

        if (error) {
          console.error('Error removing reaction:', error);
          toast.error('Failed to remove reaction');
        }
      } else {
        const { error } = await client
          .from('thought_reactions')
          .insert({
            thought_id: thoughtId,
            user_id: currentUserId,
            emoji: emoji
          });

        if (error) {
          console.error('Error adding reaction:', error);
          toast.error('Failed to add reaction');
          return;
        }

        // Create notification for the thought author
        const userId = getUserIdFromStorage();
        if (userId) {
          const { data: profile } = await client
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', userId)
            .single();

          const reactorName = profile
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : 'Someone';

          await createThoughtReactionNotifications(
            thoughtId,
            match.id,
            reactorName,
            currentUserId,
            emoji
          );
          supabase.channel('notification-updates').send({ type: 'broadcast', event: 'notifications-changed', payload: {} });
        }
      }
    } catch (error) {
      console.error('Error in handleReaction:', error);
    }
  };

  const handleEditThought = (thought: any) => {
    setEditingThoughtId(thought.id);
    setEditContent(thought.content);
  };

  const handleSaveEdit = async (thoughtId: string) => {
    if (!editContent.trim() || !onEditThought) return;
    await onEditThought(thoughtId, editContent);
    setEditingThoughtId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingThoughtId(null);
    setEditContent("");
  };

  const handleDeleteThought = async (thoughtId: string) => {
    if (!onDeleteThought) return;
    if (window.confirm("Are you sure you want to delete this thought? This action cannot be undone.")) {
      await onDeleteThought(thoughtId);
    }
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-4 relative">
        {/* Loading state for pending matches */}
        {match.status === "pending" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded px-3 py-2 mb-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Retrieving data from playtomic...</span>
          </div>
        )}

        {/* Top right delete button (organizer only) */}
        {currentUserId && currentUserId === match.created_by && onDeleteMatch && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteMatch(match.id);
              }}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Horizontal layout: Match info on left, Players on right */}
        <div className="flex gap-6">
          {/* Left side: Match Information */}
          <div className="flex-1 space-y-2">
            {/* Date */}
            {match.match_date && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-semibold">
                  {format(new Date(match.match_date), "EEEE d MMM, HH:mm")}
                  {match.duration &&
                    (() => {
                      const startDate = new Date(match.match_date);
                      const endDate = new Date(
                        startDate.getTime() + match.duration * 60000
                      );
                      return ` - ${format(endDate, "HH:mm")}`;
                    })()}
                </span>
              </div>
            )}

            {/* Venue */}
            <div className="text-sm text-muted-foreground">
              {match.venue_name || "Padel Match"}
            </div>

            {/* Location - only show when match has a URL */}
            {match.url && (match.city || match.location) && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {match.location || match.city}
              </div>
            )}

            {/* Court */}
            {match.court_number && (
              <div className="text-sm text-muted-foreground">
                Court: {match.court_number}
              </div>
            )}

            {/* Go to Playtomic Button */}
            {match.url && (currentUserId === match.created_by ||
              match.match_participants?.some(
                (p: any) => p.added_by_profile_id === currentUserId
              )) && (
              <div className="pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.open(match.url, "_blank")}
                  className="h-7 text-xs"
                >
                  Go to playtomic
                </Button>
              </div>
            )}
          </div>

          {/* Right side: Players */}
          <div className="w-80 space-y-2">
            <div className="flex items-center text-sm font-medium mb-2">
              <Users className="h-4 w-4 mr-1" />
              Players ({match.match_participants?.length || 0}/
              {match.total_spots || 4})
            </div>


            <div className="space-y-1">
              {/* Render existing participants */}
              {match.match_participants?.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between text-sm bg-secondary/30 rounded px-2 py-1 h-8"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      className="h-6 w-6 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() =>
                        onProfileImageClick?.(
                          participant.avatar_url,
                          participant.name || "Player"
                        )
                      }
                    >
                      <AvatarImage src={participant.avatar_url} />
                      <AvatarFallback className="text-[8px] bg-primary/10">
                        {participant.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{formatParticipantName(participant.name, participant.scraped_from_playtomic)}</span>
                    {participant.profile_ranking && (
                      <span className="text-xs text-muted-foreground">({participant.profile_ranking})</span>
                    )}
                  </div>
                  {/* Delete button */}
                  {participant.added_by_profile_id === currentUserId && onDeleteParticipant && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteParticipant(participant.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {/* Render empty slots as "New player" buttons */}
              {onAddPlayer && Array.from({
                length:
                  (match.total_spots || 4) -
                  (match.match_participants?.length || 0),
              }).map((_, index) => (
                <Button
                  key={`empty-slot-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={() => onAddPlayer(match.id)}
                  className="w-full h-8 text-sm border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New player
                </Button>
              ))}
            </div>

            {/* Match type indicator + edit button on same row */}
            <div className="mt-2 flex items-center justify-between">
              {/* Left: heart or group ranking */}
              {match.restricted_users && match.restricted_users.length > 0 ? (
                <button
                  onClick={() => setShowRestrictedPlayers(!showRestrictedPlayers)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  <span>Favorites only</span>
                  {showRestrictedPlayers ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              ) : match.group_ids && match.group_ids.length > 0 ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span>{matchGroupNames.join(', ')}</span>
                </div>
              ) : <div />}

              {/* Right: edit icon */}
              {currentUserId && (currentUserId === match.created_by || match.restricted_users?.includes(currentUserId)) && onUpdateMatch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditMatchDialogOpen(true);
                  }}
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  title="Edit match"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Expanded restricted player names */}
            {showRestrictedPlayers && restrictedPlayerNames.length > 0 && (
              <div className="mt-1 ml-5 space-y-0.5">
                {restrictedPlayerNames.map((name, i) => (
                  <div key={i} className="text-xs text-muted-foreground">{name}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Match Message */}
        {match.message && (
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground text-left">{match.message}</p>
          </div>
        )}

        {/* Thoughts Section */}
        <div className="mt-4 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowThoughts(!showThoughts)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-3"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Thoughts ({thoughts.length || 0})</span>
            {showThoughts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showThoughts && (
            <div className="space-y-4">
              {/* Existing thoughts */}
              <div className="space-y-3">
                {thoughts && thoughts.length > 0 ? (
                  thoughts.map((thought) => (
                    <ThoughtItem
                      key={thought.id}
                      thought={thought}
                      currentUserId={currentUserId}
                      editingThoughtId={editingThoughtId}
                      editContent={editContent}
                      onEdit={handleEditThought}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onDelete={handleDeleteThought}
                      setEditContent={setEditContent}
                      showEmojiPicker={showEmojiPicker}
                      setShowEmojiPicker={setShowEmojiPicker}
                      availableEmojis={availableEmojis}
                      onReaction={handleReaction}
                      thoughtReactions={thoughtReactions}
                      reactorNames={reactorNames}
                    />
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <p>No thoughts yet. Be the first to share!</p>
                  </div>
                )}
              </div>

              {/* Write new thought */}
              {onSubmitThought && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newThought}
                    onChange={(e) => setNewThought(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitThought}
                      disabled={!newThought.trim() || isSubmitting}
                      size="sm"
                    >
                      {isSubmitting ? "Sharing..." : "Share Thought"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Match Dialog */}
      {onUpdateMatch && (
        <EditMatchDialog
          open={editMatchDialogOpen}
          onOpenChange={setEditMatchDialogOpen}
          match={match}
          onUpdate={onUpdateMatch}
        />
      )}
    </Card>
  );
};

// Recursive component to render a thought and its replies
interface ThoughtItemProps {
  thought: any;
  currentUserId: string | null | undefined;
  editingThoughtId: string | null;
  editContent: string;
  onEdit: (thought: any) => void;
  onSaveEdit: (thoughtId: string) => void;
  onCancelEdit: () => void;
  onDelete: (thoughtId: string) => void;
  setEditContent: (content: string) => void;
  showEmojiPicker: string | null;
  setShowEmojiPicker: (thoughtId: string | null) => void;
  availableEmojis: string[];
  onReaction: (thoughtId: string, emoji: string) => void;
  thoughtReactions: Record<string, Record<string, string[]>>;
  reactorNames: Record<string, string>;
  depth?: number;
}

const ThoughtItem = ({
  thought,
  currentUserId,
  editingThoughtId,
  editContent,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  setEditContent,
  showEmojiPicker,
  setShowEmojiPicker,
  availableEmojis,
  onReaction,
  thoughtReactions,
  reactorNames,
  depth = 0
}: ThoughtItemProps) => {
  const isOwnMessage = thought.user_id && currentUserId && thought.user_id === currentUserId;
  const reactions = thoughtReactions[thought.id] || {};

  return (
    <div className={depth > 0 ? "ml-10 mt-2" : "mt-3"}>
      <div className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={thought.author.avatar} />
          <AvatarFallback className="text-xs bg-primary/10">
            {thought.author.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        {/* Message bubble */}
        <div className={`flex-1 max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
          {/* Name and time */}
          <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs font-medium">{thought.author.name}</span>
            <span className="text-xs text-muted-foreground">{thought.timeAgo}</span>
          </div>

          {/* Edit mode */}
          {editingThoughtId === thought.id ? (
            <div className="w-full space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[50px] resize-none text-sm w-full"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelEdit}
                  className="h-7"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSaveEdit(thought.id)}
                  disabled={!editContent.trim()}
                  className="h-7"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Message bubble with content */}
              <div className={`group relative rounded-2xl px-3 py-2 ${
                isOwnMessage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <p className="text-sm leading-relaxed break-words">{thought.content}</p>

                {/* Action buttons (shown on hover) */}
                {isOwnMessage ? (
                  <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(thought)}
                      className="h-6 w-6 p-0 rounded-full shadow-md"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onDelete(thought.id)}
                      className="h-6 w-6 p-0 rounded-full shadow-md hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="absolute -top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowEmojiPicker(showEmojiPicker === thought.id ? null : thought.id)}
                      className="h-6 w-6 p-0 rounded-full shadow-md"
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Emoji picker */}
              {showEmojiPicker === thought.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(null)} />
                  <div className="relative z-50 flex gap-1 mt-1 p-2 bg-background border border-border rounded-lg shadow-lg">
                    {availableEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onReaction(thought.id, emoji)}
                        className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-muted"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Display reactions */}
              {Object.keys(reactions).length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  <TooltipProvider delayDuration={300}>
                  {Object.entries(reactions).map(([emoji, userIds]) => {
                    if (userIds.length === 0) return null;
                    const userReacted = currentUserId && userIds.includes(currentUserId);
                    const names = userIds.map(id => reactorNames[id] || 'Unknown').join(', ');
                    return (
                      <Tooltip key={emoji}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => !isOwnMessage && onReaction(thought.id, emoji)}
                            className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                              isOwnMessage
                                ? 'bg-muted border-border cursor-default'
                                : userReacted
                                  ? 'bg-primary/20 border-primary cursor-pointer'
                                  : 'bg-muted border-border hover:bg-muted/70 cursor-pointer'
                            }`}
                          >
                            {emoji} {userIds.length}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">{names}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  </TooltipProvider>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
};
