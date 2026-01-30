import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import GroupsList from "@/components/GroupsList";
import { MatchCard } from "@/components/MatchCard";

import MyMatchesList from "@/components/MyMatchesList";
import Advertisement from "@/components/Advertisement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase, createFreshSupabaseClient, getUserIdFromStorage } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks";
import { createParticipantJoinedNotifications, createParticipantLeftNotifications } from "@/lib/notifications";
import { getThoughtsByMatchId, createMatchThought, updateThought, deleteThought } from "@/lib/thoughts";
import { createThoughtAddedNotifications } from "@/lib/notifications";
import { fetchMatchesForGroup, fetchMatchById, fetchFavoritesMatches } from "@/lib/matches";
import TPMemberSetupDialog from "@/components/TPMemberSetupDialog";

const Community = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroupType, setSelectedGroupType] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchThoughts, setMatchThoughts] = useState<Record<string, any[]>>({});
  const [profileImageModal, setProfileImageModal] = useState<{
    open: boolean;
    imageUrl: string | null;
    name: string;
  }>({ open: false, imageUrl: null, name: "" });
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  const { currentUserId } = useAuth();

  // Show registration dialog when navigating from index page with incomplete profile
  useEffect(() => {
    const state = location.state as { fromIndex?: boolean } | null;
    if (!state?.fromIndex || !currentUserId) return;

    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tp_user_id')
        .eq('id', currentUserId)
        .single();

      if (!profile?.tp_user_id) {
        setShowSetupDialog(true);
      }
    };

    checkProfile();
  }, [currentUserId, location.state]);

  // Handle navigation state to auto-select a group or match
  useEffect(() => {
    const state = location.state as { selectGroupId?: string | null; selectMatchId?: string | null } | null;

    // Priority: selectMatchId over selectGroupId
    if (state?.selectMatchId) {
      console.log('[Community] Auto-selecting match from navigation state:', state.selectMatchId);
      setSelectedGroupId(null);
      setSelectedMatchId(state.selectMatchId);
      // Clear the state to prevent re-selecting on every render
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state?.selectGroupId) {
      console.log('[Community] Auto-selecting group from navigation state:', state.selectGroupId);
      setSelectedMatchId(null);
      setSelectedGroupId(state.selectGroupId);
      // Clear the state to prevent re-selecting on every render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch matches for selected group or selected match
  useEffect(() => {
    if (!selectedGroupId && !selectedMatchId) {
      setMatches([]);
      setMatchThoughts({});
      return;
    }

    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        let enrichedMatches: any[] = [];

        // If a specific match is selected, fetch only that match
        if (selectedMatchId) {
          const match = await fetchMatchById(selectedMatchId, currentUserId);
          enrichedMatches = match ? [match] : [];
        }
        // Otherwise fetch all matches for the selected group
        else if (selectedGroupId) {
          if (selectedGroupType === 'Favorites') {
            enrichedMatches = await fetchFavoritesMatches(currentUserId);
          } else {
            enrichedMatches = await fetchMatchesForGroup(selectedGroupId, currentUserId);
          }
        }

        if (enrichedMatches.length === 0 && (selectedMatchId || selectedGroupId)) {
          // Only show error if we expected matches but got none due to an error
          // (empty groups should not show error)
        }

        setMatches(enrichedMatches);

        // Fetch thoughts for all matches
        if (enrichedMatches.length > 0) {
          const thoughtsPromises = enrichedMatches.map(async (match: any) => {
            const thoughts = await getThoughtsByMatchId(match.id);
            return { matchId: match.id, thoughts };
          });

          const thoughtsResults = await Promise.all(thoughtsPromises);
          const thoughtsMap: Record<string, any[]> = {};
          thoughtsResults.forEach(({ matchId, thoughts }) => {
            thoughtsMap[matchId] = thoughts;
          });
          setMatchThoughts(thoughtsMap);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load matches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [selectedGroupId, selectedMatchId, currentUserId]);

  // Real-time subscriptions for matches and participants
  useEffect(() => {
    if (!selectedGroupId && !selectedMatchId) return;

    console.log('[Community] Setting up real-time subscriptions...');

    // Subscribe to matches table changes
    const matchesSubscription = supabase
      .channel('community-matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('[Community] Matches change detected:', payload);
          // Refetch matches when a match changes
          refetchMatches();
        }
      )
      .subscribe();

    // Subscribe to match_participants table changes
    const participantsSubscription = supabase
      .channel('community-participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants'
        },
        (payload) => {
          console.log('[Community] Match participants change detected:', payload);
          // Refetch matches when participants change
          refetchMatches();
        }
      )
      .subscribe();

    // Subscribe to thoughts table changes
    const thoughtsSubscription = supabase
      .channel('community-thoughts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thoughts'
        },
        (payload: any) => {
          console.log('[Community] Thoughts change detected:', payload);
          const matchId = payload.new?.match_id || payload.old?.match_id;
          if (matchId) {
            // Refetch thoughts for the affected match
            getThoughtsByMatchId(matchId).then((thoughts) => {
              setMatchThoughts(prev => ({ ...prev, [matchId]: thoughts }));
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount or when selectedGroupId changes
    return () => {
      console.log('[Community] Cleaning up real-time subscriptions...');
      supabase.removeChannel(matchesSubscription);
      supabase.removeChannel(participantsSubscription);
      supabase.removeChannel(thoughtsSubscription);
    };
  }, [selectedGroupId, selectedMatchId]);

  const handleDeleteMatch = async (matchId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this match?");
    if (!confirmed) return;

    try {
      const client = createFreshSupabaseClient();
      const { error } = await client
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) {
        console.error('Error deleting match:', error);
        toast.error('Failed to delete match');
        return;
      }

      toast.success('Match deleted successfully');
      setMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (err) {
      console.error('Error deleting match:', err);
      toast.error('Failed to delete match');
    }
  };

  const handleAddPlayer = async (matchId: string) => {
    const userId = currentUserId || getUserIdFromStorage();
    if (!userId) {
      toast.error("You must be logged in to add a player");
      return;
    }

    try {
      const client = createFreshSupabaseClient();

      const { data: profile } = await client
        .from("profiles")
        .select("first_name, last_name, playtomic_user_id")
        .eq("id", userId)
        .single();

      const playerName = profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Spot reserved"
        : "Spot reserved";

      const { error } = await client.from("match_participants").insert({
        match_id: matchId,
        name: playerName,
        playtomic_user_id: profile?.playtomic_user_id || null,
        player_profile_id: userId,
        added_by_profile_id: userId,
        scraped_from_playtomic: false,
      });

      if (error) {
        console.error("Error adding player:", error);
        toast.error(`Failed to add player: ${error.message}`);
        return;
      }

      await createParticipantJoinedNotifications(matchId, playerName, userId);
      toast.success("Player spot reserved!");

      // Refetch the updated match
      const { data: updatedMatch } = await client
        .from('matches')
        .select(`
          *,
          match_participants (
            id,
            playtomic_user_id,
            added_by_profile_id,
            player_profile_id,
            name,
            team_id,
            gender,
            level_value,
            level_confidence,
            price,
            payment_status,
            registration_date,
            scraped_from_playtomic,
            created_at,
            player_profile:player_profile_id (
              avatar_url,
              ranking
            )
          )
        `)
        .eq('id', matchId)
        .single();

      if (updatedMatch) {
        const enrichedMatch = {
          ...updatedMatch,
          match_participants: updatedMatch.match_participants?.map((p: any) => ({
            ...p,
            avatar_url: p.player_profile?.avatar_url || null,
            profile_ranking: p.player_profile?.ranking || null,
          })).sort((a: any, b: any) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return timeA - timeB;
          }) || []
        };
        setMatches(prev => prev.map(m => m.id === matchId ? enrichedMatch : m));
      }
    } catch (err) {
      console.error("Error adding player:", err);
      toast.error("Failed to add player");
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    const userId = currentUserId || getUserIdFromStorage();
    if (!userId) {
      toast.error("You must be logged in to delete a participant");
      return;
    }

    const match = matches.find(m =>
      m.match_participants?.some((p: any) => p.id === participantId)
    );

    if (!match) {
      toast.error("Match not found");
      return;
    }

    const participant = match.match_participants?.find((p: any) => p.id === participantId);
    const playerName = participant?.name || "A player";
    const playerProfileId = participant?.player_profile_id;

    try {
      const client = createFreshSupabaseClient();

      const { error } = await client
        .from("match_participants")
        .delete()
        .eq("id", participantId);

      if (error) {
        console.error("Error deleting participant:", error);
        toast.error(`Failed to delete participant: ${error.message}`);
        return;
      }

      if (playerProfileId) {
        await createParticipantLeftNotifications(match.id, playerName, playerProfileId);
      }

      toast.success("Participant removed!");

      // Refetch the updated match
      const { data: updatedMatch } = await client
        .from('matches')
        .select(`
          *,
          match_participants (
            id,
            playtomic_user_id,
            added_by_profile_id,
            player_profile_id,
            name,
            team_id,
            gender,
            level_value,
            level_confidence,
            price,
            payment_status,
            registration_date,
            scraped_from_playtomic,
            created_at,
            player_profile:player_profile_id (
              avatar_url,
              ranking
            )
          )
        `)
        .eq('id', match.id)
        .single();

      if (updatedMatch) {
        const enrichedMatch = {
          ...updatedMatch,
          match_participants: updatedMatch.match_participants?.map((p: any) => ({
            ...p,
            avatar_url: p.player_profile?.avatar_url || null,
            profile_ranking: p.player_profile?.ranking || null,
          })).sort((a: any, b: any) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return timeA - timeB;
          }) || []
        };
        setMatches(prev => prev.map(m => m.id === match.id ? enrichedMatch : m));
      }
    } catch (err) {
      console.error("Error deleting participant:", err);
      toast.error("Failed to delete participant");
    }
  };

  const fetchMatchThoughts = async (matchId: string) => {
    const thoughts = await getThoughtsByMatchId(matchId);
    setMatchThoughts(prev => ({
      ...prev,
      [matchId]: thoughts
    }));
  };

  const handleSubmitThought = async (matchId: string, content: string) => {
    const result = await createMatchThought(matchId, content);

    if (result.success) {
      // Create notifications for thoughts
      const userId = currentUserId || getUserIdFromStorage();
      if (userId) {
        try {
          const client = createFreshSupabaseClient();
          const { data: profile } = await client
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", userId)
            .single();

          const authorName = profile
            ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Someone"
            : "Someone";

          await createThoughtAddedNotifications(matchId, authorName, userId, content);
        } catch (err) {
          console.error("Error creating thought notifications:", err);
        }
      }

      toast.success("Thought shared successfully!");
      await fetchMatchThoughts(matchId);
    } else {
      toast.error(result.error || "Failed to share thought");
    }
  };

  const handleEditThought = async (thoughtId: string, content: string) => {
    const success = await updateThought(thoughtId, content);

    if (success) {
      toast.success("Thought updated successfully!");
      // Refetch thoughts for all matches that might contain this thought
      Object.keys(matchThoughts).forEach(matchId => {
        fetchMatchThoughts(matchId);
      });
    } else {
      toast.error("Failed to update thought");
    }
  };

  const handleDeleteThought = async (thoughtId: string) => {
    const success = await deleteThought(thoughtId);

    if (success) {
      toast.success("Thought deleted successfully!");
      // Refetch thoughts for all matches that might contain this thought
      Object.keys(matchThoughts).forEach(matchId => {
        fetchMatchThoughts(matchId);
      });
    } else {
      toast.error("Failed to delete thought");
    }
  };

  const handleShareClick = (match: any) => {
    navigator.clipboard.writeText(
      match.url || `${window.location.origin}/events?match=${match.id}`
    );
    toast.success("Link copied to clipboard!");
  };

  const refetchMatches = async () => {
    if (!selectedGroupId && !selectedMatchId) return;

    if (selectedMatchId) {
      const match = await fetchMatchById(selectedMatchId, currentUserId);
      setMatches(match ? [match] : []);
    } else if (selectedGroupId) {
      const enrichedMatches = selectedGroupType === 'Favorites'
        ? await fetchFavoritesMatches(currentUserId)
        : await fetchMatchesForGroup(selectedGroupId, currentUserId);
      setMatches(enrichedMatches);
    }
  };

  const handleMyMatchClick = (matchId: string) => {
    // Clear group selection and set the specific match
    setSelectedGroupId(null);
    setSelectedMatchId(matchId);
  };

  const handleGroupSelect = (groupId: string | null, groupType?: string) => {
    // Clear match selection and set the group
    setSelectedMatchId(null);
    setSelectedGroupId(groupId);
    setSelectedGroupType(groupType || null);
  };

  return (
    <>
      <Dialog
        open={profileImageModal.open}
        onOpenChange={(open) =>
          setProfileImageModal({ ...profileImageModal, open })
        }
      >
        <DialogContent className="sm:max-w-md flex flex-col items-center">
          <DialogHeader>
            <DialogTitle>{profileImageModal.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {profileImageModal.imageUrl ? (
              <img
                src={profileImageModal.imageUrl}
                alt={profileImageModal.name}
                className="max-w-full max-h-[60vh] rounded-lg object-contain"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-6xl font-medium text-primary">
                  {profileImageModal.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TPMemberSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        onSaveComplete={() => {
          setShowSetupDialog(false);
          // Clear the fromIndex state so it doesn't re-trigger
          navigate(location.pathname, { replace: true, state: {} });
          // Notify AppLayout to refresh the nav bar (Complete Registration -> Create button)
          window.dispatchEvent(new Event('profile-updated'));
        }}
      />

      <div className="min-h-screen flex">
        <div className="flex flex-col">
          <GroupsList
            onGroupSelect={handleGroupSelect}
            selectedGroupId={selectedGroupId}
          />
          <MyMatchesList
            currentUserId={currentUserId}
            selectedMatchId={selectedMatchId}
            onMatchClick={handleMyMatchClick}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 flex gap-6">
          {/* Matches section - 70% width */}
          <div className="flex-1 max-w-[70%]">
            {selectedGroupId || selectedMatchId ? (
              isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      currentUserId={currentUserId}
                      onDeleteMatch={handleDeleteMatch}
                      onAddPlayer={handleAddPlayer}
                      onDeleteParticipant={handleDeleteParticipant}
                      onShareClick={handleShareClick}
                      onProfileImageClick={(imageUrl, name) =>
                        setProfileImageModal({ open: true, imageUrl, name })
                      }
                      defaultExpandThoughts={!!selectedMatchId}
                      onUpdateMatch={() => {
                        // Refetch matches when a match is updated
                        refetchMatches();
                      }}
                      thoughts={matchThoughts[match.id] || []}
                      onSubmitThought={handleSubmitThought}
                      onEditThought={handleEditThought}
                      onDeleteThought={handleDeleteThought}
                    />
                  ))}
                </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
                  <p className="text-muted-foreground">This group doesn't have any matches yet</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Group</h3>
                <p className="text-muted-foreground">Choose a group from the list to view its matches</p>
              </div>
            </div>
          )}
        </div>

        {/* Advertisement section - 30% width */}
        <div className="w-[30%] min-w-[300px]">
          <Advertisement />
        </div>
      </div>
    </div>
    </>
  );
};

export default Community;
