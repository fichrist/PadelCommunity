/**
 * Events Page - REFACTORED VERSION
 *
 * This is a clean, maintainable version using custom hooks
 * Business logic separated from UI rendering
 * Ready for React Native migration
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThoughtsModal from "@/components/ThoughtsModal";
import CommunityEventCard from "@/components/CommunityEventCard";
import TPMemberSetupDialog from "@/components/TPMemberSetupDialog";
import { EventFilters } from "@/components/EventFilters";
import { ManageRestrictedUsersDialog } from "@/components/ManageRestrictedUsersDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAuth,
  useGeolocation,
  useDateFiltering,
  useArraySelection,
  useEvents,
  useEventEnrollment,
  useMatchManagement,
  useThoughts,
  getAvailableRankingLevels,
  calculateDistance,
} from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import spiritualBackground from "@/assets/spiritual-background.jpg";
import elenaProfile from "@/assets/elena-profile.jpg";
import {
  Loader2,
  Calendar,
  MapPin,
  Users,
  Trash2,
  Plus,
  X,
  MessageCircle,
  Share2,
  Lock
} from "lucide-react";
import { formatParticipantName } from "@/lib/matchParticipants";
import { createParticipantJoinedNotifications, createParticipantLeftNotifications } from "@/lib/notifications";

const Events = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ========================================
  // HOOKS - Business Logic
  // ========================================

  // Authentication
  const { currentUserId, currentUser, isLoading: authLoading } = useAuth();

  // Geolocation filtering
  const geolocation = useGeolocation();

  // Date filtering
  const dateFilter = useDateFiltering("");

  // Match level selection
  const levelSelection = useArraySelection<string>([]);

  // Events data
  const { events: dbEvents, matches: dbMatches, isLoading: eventsLoading, refetch, updateMatch } = useEvents();

  // Event enrollment
  const enrollment = useEventEnrollment();

  // Match management
  const matchManagement = useMatchManagement(refetch);

  // ========================================
  // LOCAL STATE (UI-specific)
  // ========================================

  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [userRanking, setUserRanking] = useState<string | null>(null);
  const [hideFullyBooked, setHideFullyBooked] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [selectedMatchForThoughts, setSelectedMatchForThoughts] = useState<any>(null);
  const [matchThoughtsModalOpen, setMatchThoughtsModalOpen] = useState(false);
  const [profileImageModal, setProfileImageModal] = useState<{
    open: boolean;
    imageUrl: string | null;
    name: string;
  }>({ open: false, imageUrl: null, name: "" });
  const [restrictedUsersDialog, setRestrictedUsersDialog] = useState<{
    open: boolean;
    matchId: string | null;
    restrictedUsers: string[] | null;
  }>({ open: false, matchId: null, restrictedUsers: null });

  // Thoughts for events
  const eventThoughts = useThoughts("event", selectedEvent?.eventId || null);

  // Thoughts for matches
  const matchThoughts = useThoughts("match", selectedMatchForThoughts?.id || null);

  // ========================================
  // EFFECTS
  // ========================================

  // Initialize user profile and set defaults
  useEffect(() => {
    const initializeUser = async () => {
      if (!currentUser) return;

      // Check if tp_user_id is set
      if (!currentUser.tp_user_id) {
        setShowSetupDialog(true);
      }

      // Set user ranking
      setUserRanking(currentUser.ranking);

      // Set default match levels
      const availableLevels = getAvailableRankingLevels(currentUser.ranking);
      levelSelection.set(availableLevels);

      // Set default location from profile
      if (currentUser.formatted_address) {
        geolocation.setSelectedLocation(currentUser.formatted_address);
        if (currentUser.latitude && currentUser.longitude) {
          geolocation.setSelectedLocationCoords({
            lat: currentUser.latitude,
            lng: currentUser.longitude,
          });
        }
      }
    };

    initializeUser();
  }, [currentUser]);

  // Refetch data when navigating from CreateMatch with refetchData flag
  useEffect(() => {
    const state = location.state as { refetchData?: boolean } | null;
    if (state?.refetchData) {
      console.log('Refetching data after match creation...');
      refetch();
      // Clear the state to prevent refetching on every render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, refetch, navigate, location.pathname]);

  // Handle match query parameter from notifications
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const matchId = searchParams.get('match');

    if (matchId && dbMatches) {
      // Find the match in the loaded data
      const match = dbMatches.find((m: any) => m.id === matchId);
      if (match) {
        // Open the thoughts modal for this match
        setSelectedMatchForThoughts(match);
        setMatchThoughtsModalOpen(true);

        // Force refresh thoughts when opening from notification
        // Use setTimeout to ensure the state update has completed
        setTimeout(() => {
          matchThoughts.fetchThoughts();
        }, 0);

        // Clear the query parameter
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.search, dbMatches, navigate, location.pathname, matchThoughts]);

  // ========================================
  // DATA TRANSFORMATION
  // ========================================

  // Transform and format events for display
  const formattedEvents = useMemo(() => {
    return (dbEvents || []).map((dbEvent: any) => {
      const organizerName =
        dbEvent.profiles?.display_name ||
        `${dbEvent.profiles?.first_name || ""} ${dbEvent.profiles?.last_name || ""}`.trim() ||
        "Event Creator";

      return {
        eventId: dbEvent.id,
        title: dbEvent.title,
        description: dbEvent.description,
        location:
          [dbEvent.city, dbEvent.country].filter(Boolean).join(", ") ||
          "Location TBD",
        latitude: dbEvent.latitude,
        longitude: dbEvent.longitude,
        dateRange: {
          start: dbEvent.start_date
            ? format(new Date(dbEvent.start_date), "d MMMM yyyy")
            : "TBD",
          end: dbEvent.end_date
            ? format(new Date(dbEvent.end_date), "d MMMM yyyy")
            : undefined,
        },
        startDate: dbEvent.start_date ? new Date(dbEvent.start_date) : null,
        endDate: dbEvent.end_date
          ? new Date(dbEvent.end_date)
          : dbEvent.start_date
          ? new Date(dbEvent.start_date)
          : null,
        time: dbEvent.time,
        tags: dbEvent.tags || [],
        intentions: dbEvent.intentions || [],
        attendees: dbEvent.enrollments?.length || 0,
        maxAttendees: dbEvent.max_participants,
        connectionsGoing: [],
        comments: 0, // Will be populated if needed
        image: dbEvent.image_url || spiritualBackground,
        isPastEvent: dbEvent.start_date
          ? new Date(dbEvent.start_date) < new Date()
          : false,
        organizers: [
          {
            id: dbEvent.user_id,
            name: organizerName,
            avatar: dbEvent.profiles?.avatar_url || elenaProfile,
          },
        ],
      };
    });
  }, [dbEvents]);

  // ========================================
  // FILTERING LOGIC
  // ========================================

  const filteredEvents = useMemo(() => {
    return formattedEvents.filter((event) => {
      // Location filtering
      if (!geolocation.isWithinRadius(event.latitude, event.longitude)) {
        return false;
      }

      // Date filtering
      if (event.startDate && !dateFilter.isDateInRange(event.startDate)) {
        return false;
      }

      // Hide fully booked
      if (hideFullyBooked && event.attendees >= event.maxAttendees) {
        return false;
      }

      return true;
    });
  }, [formattedEvents, geolocation, dateFilter, hideFullyBooked]);

  const filteredMatches = useMemo(() => {
    return (dbMatches || []).filter((match) => {
      // Location filtering
      if (!geolocation.isWithinRadius(match.latitude, match.longitude)) {
        return false;
      }

      // Date filtering
      if (match.match_date && !dateFilter.isDateInRange(new Date(match.match_date))) {
        return false;
      }

      // Level filtering - check if any of the match's levels are in the selected levels
      if (levelSelection.count > 0 && match.match_levels) {
        const hasMatchingLevel = match.match_levels.some((level: string) =>
          levelSelection.isSelected(level)
        );
        if (!hasMatchingLevel) {
          return false;
        }
      }

      // Hide fully booked matches
      if (hideFullyBooked) {
        const currentParticipants = match.match_participants?.length || 0;
        const totalSpots = match.total_spots || 4;
        if (currentParticipants >= totalSpots) {
          return false;
        }
      }

      return true;
    });
  }, [dbMatches, geolocation, dateFilter, levelSelection, hideFullyBooked]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handlePlaceSelected = (place: any) => {
    if (place.geometry?.location) {
      const lat =
        typeof place.geometry.location.lat === "function"
          ? place.geometry.location.lat()
          : place.geometry.location.lat;
      const lng =
        typeof place.geometry.location.lng === "function"
          ? place.geometry.location.lng()
          : place.geometry.location.lng;

      geolocation.setSelectedLocationCoords({ lat, lng });
    }
  };

  const handleSetupComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tp_user_id")
        .eq("id", user.id)
        .single();

      if (profile?.tp_user_id) {
        setShowSetupDialog(false);
      }
    }
  };

  const handleEventClick = (event: any) => {
    navigate(`/event/${event.eventId}`);
  };

  const handleCommentsClick = (event: any) => {
    // Clear previous thoughts to avoid showing stale data
    eventThoughts.clearThoughts();
    setSelectedEvent(event);
    setThoughtsModalOpen(true);
  };

  const handleMatchCommentsClick = (match: any) => {
    // Clear previous thoughts to avoid showing stale data
    matchThoughts.clearThoughts();
    setSelectedMatchForThoughts(match);
    setMatchThoughtsModalOpen(true);
  };

  const handleMatchThoughtAdded = async () => {
    // Fetch the thoughts to update the modal
    await matchThoughts.fetchThoughts();

    // Also increment the thoughts_count for this match in the local state
    if (selectedMatchForThoughts) {
      const match = dbMatches?.find(m => m.id === selectedMatchForThoughts.id);
      if (match) {
        const updatedMatch = {
          ...match,
          thoughts_count: (match.thoughts_count || 0) + 1
        };
        updateMatch(selectedMatchForThoughts.id, updatedMatch as any);
      }
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this match?"
    );
    if (!confirmed) return;

    const success = await matchManagement.deleteMatch(matchId);
    if (success) {
      toast.success("Match deleted successfully");
    } else {
      toast.error("Failed to delete match");
    }
  };

  // Helper function to flatten profile data from joined query
  const flattenParticipantProfiles = (match: any) => {
    return {
      ...match,
      match_participants: match.match_participants?.map((p: any) => ({
        ...p,
        avatar_url: p.player_profile?.avatar_url || null,
        profile_ranking: p.player_profile?.ranking || null,
      })).sort((a: any, b: any) => {
        // Sort participants by created_at timestamp
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return timeA - timeB;
      }) || []
    };
  };

  const handleAddPlayer = async (matchId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to add a player");
      return;
    }

    // Get the current user's profile to use their name and playtomic_user_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, playtomic_user_id")
      .eq("id", currentUserId)
      .single();

    const playerName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Spot reserved"
      : "Spot reserved";

    const { error } = await supabase.from("match_participants").insert({
      match_id: matchId,
      name: playerName,
      playtomic_user_id: profile?.playtomic_user_id || null,
      player_profile_id: currentUserId,
      added_by_profile_id: currentUserId,
      scraped_from_playtomic: false,
    });

    if (error) {
      console.error("Error adding player:", error);
      toast.error(`Failed to add player: ${error.message}`);
      return;
    }

    // Create notifications for all other participants
    await createParticipantJoinedNotifications(
      matchId,
      playerName,
      currentUserId
    );

    toast.success("Player spot reserved!");

    // Refetch only the updated match data with profile join
    const { data: updatedMatch } = await supabase
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

    // Flatten profile data and update only this match in the local state
    if (updatedMatch) {
      const enrichedMatch = flattenParticipantProfiles(updatedMatch);
      updateMatch(matchId, enrichedMatch as any);
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to delete a participant");
      return;
    }

    // Find which match this participant belongs to
    const match = dbMatches?.find(m =>
      m.match_participants?.some((p: any) => p.id === participantId)
    );

    if (!match) {
      toast.error("Match not found");
      return;
    }

    // Get participant data before deletion to use for notification
    const participant = match.match_participants?.find((p: any) => p.id === participantId);
    const playerName = participant?.name || "A player";
    const playerProfileId = participant?.player_profile_id;

    const { error } = await supabase
      .from("match_participants")
      .delete()
      .eq("id", participantId);

    if (error) {
      console.error("Error deleting participant:", error);
      toast.error(`Failed to delete participant: ${error.message}`);
      return;
    }

    // Create notifications for all other participants (only if the participant had a profile)
    if (playerProfileId) {
      await createParticipantLeftNotifications(
        match.id,
        playerName,
        playerProfileId
      );
    }

    toast.success("Participant removed!");

    // Refetch only the updated match data with profile join
    const { data: updatedMatch } = await supabase
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

    // Flatten profile data and update only this match in the local state
    if (updatedMatch) {
      const enrichedMatch = flattenParticipantProfiles(updatedMatch);
      updateMatch(match.id, enrichedMatch as any);
    }
  };

  const handleRemoveLevelFromMatch = async (
    matchId: string,
    levelToRemove: string
  ) => {
    const match = dbMatches?.find((m) => m.id === matchId);
    if (!match) return;

    const updatedLevels = (match.match_levels || []).filter(
      (level: string) => level !== levelToRemove
    );

    if (updatedLevels.length === 0) {
      toast.error("Match must have at least one level");
      return;
    }

    const { error } = await supabase
      .from("matches")
      .update({ match_levels: updatedLevels })
      .eq("id", matchId);

    if (error) {
      console.error("Error updating match levels:", error);
      toast.error("Failed to remove level");
      return;
    }

    toast.success("Level removed successfully");

    // Update only this match in local state without refetching everything
    const updatedMatch = {
      ...match,
      match_levels: updatedLevels
    };
    updateMatch(matchId, updatedMatch as any);
  };

  const handleAddLevelToMatch = async (
    matchId: string,
    levelToAdd: string
  ) => {
    const match = dbMatches?.find((m) => m.id === matchId);
    if (!match) return;

    const currentLevels = match.match_levels || [];
    const updatedLevels = [...currentLevels, levelToAdd];

    const { error } = await supabase
      .from("matches")
      .update({ match_levels: updatedLevels })
      .eq("id", matchId);

    if (error) {
      console.error("Error updating match levels:", error);
      toast.error("Failed to add ranking");
      return;
    }

    toast.success("Ranking added!");

    // Update only this match in local state without refetching everything
    const updatedMatch = {
      ...match,
      match_levels: updatedLevels
    };
    updateMatch(matchId, updatedMatch as any);
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (authLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      {/* TP Member Setup Dialog */}
      <TPMemberSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        onSaveComplete={handleSetupComplete}
      />

      {/* Thoughts Modals */}
      <ThoughtsModal
        open={thoughtsModalOpen}
        onOpenChange={setThoughtsModalOpen}
        postId={selectedEvent?.eventId || ""}
        postTitle={selectedEvent?.title || ""}
        thoughts={eventThoughts.thoughts}
        isEvent={true}
        onThoughtAdded={eventThoughts.fetchThoughts}
      />

      <ThoughtsModal
        open={matchThoughtsModalOpen}
        onOpenChange={setMatchThoughtsModalOpen}
        postId={selectedMatchForThoughts?.id || ""}
        postTitle={`Match at ${selectedMatchForThoughts?.venue_name || selectedMatchForThoughts?.club_name || "Padel Match"}`}
        thoughts={matchThoughts.thoughts}
        isMatch={true}
        onThoughtAdded={handleMatchThoughtAdded}
      />

      {/* Main Content */}
      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-2">
            <EventFilters
              geolocation={geolocation}
              dateFilter={dateFilter}
              levelSelection={levelSelection}
              hideFullyBooked={hideFullyBooked}
              setHideFullyBooked={setHideFullyBooked}
              userRanking={userRanking}
              currentUserId={currentUserId}
              onPlaceSelected={handlePlaceSelected}
            />
          </div>

          {/* Main Content - Events & Matches */}
          <div className="lg:col-span-6 space-y-6">
            {/* Events Section */}
            {filteredEvents.length > 0 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEvents.map((event) => (
                    <CommunityEventCard
                      key={event.eventId}
                      {...event}
                      onClick={() => handleEventClick(event)}
                      onCommentsClick={() => handleCommentsClick(event)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Matches Section */}
            {filteredMatches.length > 0 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMatches.map((match) => (
                    <Card
                      key={match.id}
                      className="bg-card/90 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="p-4 space-y-3 relative">
                        {/* Loading state for pending matches */}
                        {match.status === "pending" && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded px-3 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Retrieving data from playtomic...</span>
                          </div>
                        )}

                        {/* Date and Venue */}
                        <div className="space-y-1 relative">
                          {/* Organizer actions - aligned with date */}
                          {currentUserId === match.created_by && (
                            <div className="absolute top-0 right-0 flex gap-1">
                              {/* Manage visibility button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setRestrictedUsersDialog({
                                    open: true,
                                    matchId: match.id,
                                    restrictedUsers: match.restricted_users || null,
                                  });
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title={match.restricted_users && match.restricted_users.length > 0
                                  ? "Match is restricted - click to manage"
                                  : "Match is public - click to restrict"}
                              >
                                <Lock className={`h-4 w-4 ${match.restricted_users && match.restricted_users.length > 0 ? 'text-yellow-500' : ''}`} />
                              </Button>
                              {/* Delete button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteMatch(match.id);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {match.match_date && (
                            <h3 className="font-semibold text-lg flex items-center">
                              <Calendar className="h-5 w-5 mr-2" />
                              {format(new Date(match.match_date), "EEEE d MMM, HH:mm")}
                              {match.duration &&
                                (() => {
                                  const startDate = new Date(match.match_date);
                                  const endDate = new Date(
                                    startDate.getTime() + match.duration * 60000
                                  );
                                  return ` - ${format(endDate, "HH:mm")}`;
                                })()}
                            </h3>
                          )}
                          <div className="text-base text-muted-foreground">
                            {match.venue_name || "Padel Match"}
                          </div>
                        </div>

                        {/* Location */}
                        {(match.city || match.location) && (
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

                        {/* Participants */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm font-medium">
                              <Users className="h-4 w-4 mr-1" />
                              Players ({match.match_participants?.length || 0}/
                              {match.total_spots || 4})
                            </div>
                            {/* Go to Playtomic Button */}
                            {(currentUserId === match.created_by ||
                              match.match_participants?.some(
                                (p: any) => p.added_by_profile_id === currentUserId
                              )) && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => window.open(match.url, "_blank")}
                                className="h-6 text-xs"
                              >
                                Go to playtomic
                              </Button>
                            )}
                          </div>
                          <div className="space-y-1">
                            {/* Render existing participants */}
                            {match.match_participants?.map((participant: any) => (
                                <div
                                  key={participant.id}
                                  className="flex items-center justify-between text-sm bg-secondary/30 rounded px-2 py-1 h-7"
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar
                                    className="h-5 w-5 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                    onClick={() =>
                                      setProfileImageModal({
                                        open: true,
                                        imageUrl: participant.avatar_url,
                                        name: participant.name || "Player",
                                      })
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
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Show profile ranking if available */}
                                  {participant.profile_ranking ? (
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {participant.profile_ranking}
                                    </span>
                                  ) : participant.level_value ? (
                                    <span className="text-xs text-muted-foreground">
                                      Level {participant.level_value.toFixed(1)}
                                    </span>
                                  ) : null}
                                  {/* Delete button */}
                                  {participant.added_by_profile_id === currentUserId && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteParticipant(participant.id)
                                      }
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {/* Render empty slots as "New player" buttons */}
                            {Array.from({
                              length:
                                (match.total_spots || 4) -
                                (match.match_participants?.length || 0),
                            }).map((_, index) => (
                              <Button
                                key={`empty-slot-${index}`}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddPlayer(match.id)}
                                className="w-full h-7 text-sm border-dashed"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                New player
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Match Levels Badges */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Rankings:</span>

                          {match.match_levels && match.match_levels.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center justify-between">
                              <div className="flex flex-wrap gap-1 items-center">
                                {[...match.match_levels]
                                  .sort((a: string, b: string) => {
                                    const getFirstNum = (level: string) => {
                                      const match = level.match(/\d+/);
                                      return match ? parseInt(match[0]) : 0;
                                    };
                                    return getFirstNum(a) - getFirstNum(b);
                                  })
                                  .map((level: string) => (
                                    <Badge
                                      key={level}
                                      variant="secondary"
                                      className="capitalize text-xs flex items-center gap-1"
                                    >
                                      {level}
                                      {currentUserId === match.created_by &&
                                        match.match_levels.length > 1 && (
                                          <X
                                            className="h-3 w-3 cursor-pointer hover:text-destructive ml-1"
                                            onClick={() =>
                                              handleRemoveLevelFromMatch(match.id, level)
                                            }
                                          />
                                        )}
                                    </Badge>
                                  ))}

                                {/* Add Level Button */}
                                {currentUserId === match.created_by &&
                                  (() => {
                                    const availableLevels = getAvailableRankingLevels(
                                      userRanking
                                    ).filter(
                                      (level) => !match.match_levels?.includes(level)
                                    );
                                    return (
                                      availableLevels.length > 0 && (
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-6 w-6 border-dashed"
                                          onClick={() => handleAddLevelToMatch(match.id, availableLevels[0])}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      )
                                    );
                                  })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      {/* Action Bar */}
                      <div className="px-4 py-2 border-t border-border">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMatchCommentsClick(match)}
                            className="flex-1 flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{match.thoughts_count || 0} Thoughts</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                match.url ||
                                  `${window.location.origin}/events?match=${match.id}`
                              );
                              toast.success("Link copied to clipboard!");
                            }}
                            className="flex-1 flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Image Modal */}
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

      {/* Manage Restricted Users Dialog */}
      {restrictedUsersDialog.matchId && currentUserId && (
        <ManageRestrictedUsersDialog
          open={restrictedUsersDialog.open}
          onOpenChange={(open) => setRestrictedUsersDialog({ ...restrictedUsersDialog, open })}
          matchId={restrictedUsersDialog.matchId}
          currentRestrictedUsers={restrictedUsersDialog.restrictedUsers}
          organizerId={currentUserId}
          onUpdate={refetch}
        />
      )}
    </>
  );
};

export default Events;
