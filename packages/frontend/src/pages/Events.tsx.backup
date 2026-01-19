import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import CustomDateRangePicker from "@/components/CustomDateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Plus, Users, Calendar, User, MessageCircle, MapPin, Clock, Tag, UserCheck, BookOpen, X, Heart, Repeat2, Share2, ExternalLink, Copy, Check, Trophy, Edit2, Save, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ThoughtsModal from "@/components/ThoughtsModal";
import ReviewModal from "@/components/ReviewModal";
import CommunityEventCard from "@/components/CommunityEventCard";
import { getAllEvents } from "@/lib/events";
import { getThoughtsByEventId, getThoughtsByMatchId } from "@/lib/thoughts";
import spiritualBackground from "@/assets/spiritual-background.jpg";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import TPMemberSetupDialog from "@/components/TPMemberSetupDialog";

// Haversine formula to calculate distance between two lat/lng points in km
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// All ranking levels
const ALL_RANKING_LEVELS = [
  { value: 'p50-p100', min: 50, max: 100 },
  { value: 'p100-p200', min: 100, max: 200 },
  { value: 'p200-p300', min: 200, max: 300 },
  { value: 'p300-p400', min: 300, max: 400 },
  { value: 'p400-p500', min: 400, max: 500 },
  { value: 'p500-p700', min: 500, max: 700 },
  { value: 'p700-p1000', min: 700, max: 1000 },
  { value: 'p1000+', min: 1000, max: Infinity }
];

// Helper function to get available ranking levels based on user's ranking
const getAvailableRankingLevels = (userRanking: string | null): string[] => {
  if (!userRanking) return [];

  // Extract numeric value from ranking (e.g., "P450" -> 450)
  const rankingMatch = userRanking.match(/P?(\d+)/i);
  if (!rankingMatch) return [];

  const rankingValue = parseInt(rankingMatch[1]);

  // Filter levels that include the user's ranking
  return ALL_RANKING_LEVELS
    .filter(level => rankingValue >= level.min && rankingValue <= level.max)
    .map(level => level.value);
};

const Events = () => {
  const [filter, setFilter] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [selectedRadius, setSelectedRadius] = useState("");
  const [selectedDate, setSelectedDate] = useState("next-3-weeks");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMatchLevels, setSelectedMatchLevels] = useState<string[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [resharedEvents, setResharedEvents] = useState<string[]>([]);
  const [sharePopoverOpen, setSharePopoverOpen] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [connectionPopoverOpen, setConnectionPopoverOpen] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allIntentions, setAllIntentions] = useState<string[]>([]);
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [newLevelForMatch, setNewLevelForMatch] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hideFullyBooked, setHideFullyBooked] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [userRanking, setUserRanking] = useState<string | null>(null);
  const [matchThoughtsModalOpen, setMatchThoughtsModalOpen] = useState(false);
  const [selectedMatchForThoughts, setSelectedMatchForThoughts] = useState<any>(null);
  const [matchThoughts, setMatchThoughts] = useState<any[]>([]);
  const [profileImageModal, setProfileImageModal] = useState<{ open: boolean; imageUrl: string | null; name: string }>({ open: false, imageUrl: null, name: '' });
  const [userProfileLoaded, setUserProfileLoaded] = useState(false);
  const navigate = useNavigate();

  // Fetch current user ID, ranking, location, and check tp_user_id
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        // Fetch all profile data in one query
        const { data: profile } = await supabase
          .from('profiles')
          .select('tp_user_id, ranking, city, latitude, longitude')
          .eq('id', user.id)
          .single();

        if (profile) {
          // Check tp_user_id
          if (!profile.tp_user_id) {
            setShowSetupDialog(true);
          }

          // Set ranking
          setUserRanking(profile.ranking);

          // Set default selected levels to all available levels
          const availableLevels = getAvailableRankingLevels(profile.ranking);
          setSelectedMatchLevels(availableLevels);

          // Set location
          if (profile.city) {
            setSelectedLocation(profile.city);
            if (profile.latitude && profile.longitude) {
              setSelectedLocationCoords({ lat: profile.latitude, lng: profile.longitude });
            }
          }

          // Signal that profile is loaded so matches can be fetched
          setUserProfileLoaded(true);
        }
      }
    };
    fetchCurrentUser();
  }, []);

  // Geocode location when it changes (using Nominatim - free API)
  useEffect(() => {
    const geocodeLocation = async () => {
      if (!selectedLocation) {
        setSelectedLocationCoords(null);
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(selectedLocation)}&format=json&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          setSelectedLocationCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    geocodeLocation();
  }, [selectedLocation]);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      const dbEvents = await getAllEvents();
      
      // Extract unique tags and intentions from all events
      const tagsSet = new Set<string>();
      const intentionsSet = new Set<string>();
      
      dbEvents.forEach((dbEvent: any) => {
        (dbEvent.tags || []).forEach((tag: string) => tagsSet.add(tag));
        (dbEvent.intentions || []).forEach((intention: string) => intentionsSet.add(intention));
      });
      
      setAllTags(Array.from(tagsSet).sort());
      setAllIntentions(Array.from(intentionsSet).sort());
      
      // Get unique user IDs
      const userIds = [...new Set(dbEvents.map((e: any) => e.user_id).filter(Boolean))] as string[];
      
      // Fetch profiles for all event creators
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, avatar_url')
        .in('id', userIds);
      
      // Create a map of user_id to profile
      const profileMap = new Map();
      (profiles || []).forEach((profile: any) => {
        profileMap.set(profile.id, profile);
      });
      
      // Fetch thought counts for all events
      const eventIds = dbEvents.map((e: any) => e.id);
      const { data: thoughtCounts } = await supabase
        .from('thoughts')
        .select('event_id')
        .in('event_id', eventIds)
        .not('event_id', 'is', null);
      
      // Create a map of event_id to thought count
      const thoughtCountMap = new Map();
      (thoughtCounts || []).forEach((thought: any) => {
        const currentCount = thoughtCountMap.get(thought.event_id) || 0;
        thoughtCountMap.set(thought.event_id, currentCount + 1);
      });
      
      // Fetch enrollment counts for all events
      const { data: enrollmentCounts } = await supabase
        .from('enrollments')
        .select('event_id')
        .in('event_id', eventIds)
        .eq('status', 'confirmed');
      
      // Create a map of event_id to enrollment count
      const enrollmentCountMap = new Map();
      (enrollmentCounts || []).forEach((enrollment: any) => {
        const currentCount = enrollmentCountMap.get(enrollment.event_id) || 0;
        enrollmentCountMap.set(enrollment.event_id, currentCount + 1);
      });
      
      // Format events for display
      const formattedEvents = dbEvents.map((dbEvent: any) => {
        const profile = profileMap.get(dbEvent.user_id);
        const organizerName = profile?.display_name || 
                             `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                             'Event Creator';
        
        return {
          eventId: dbEvent.id,
          title: dbEvent.title,
          description: dbEvent.description,
          location: [dbEvent.city, dbEvent.country].filter(Boolean).join(', ') || 'Location TBD',
          latitude: dbEvent.latitude,
          longitude: dbEvent.longitude,
          dateRange: {
            start: dbEvent.start_date ? format(new Date(dbEvent.start_date), 'd MMMM yyyy') : 'TBD',
            end: dbEvent.end_date ? format(new Date(dbEvent.end_date), 'd MMMM yyyy') : undefined
          },
          startDate: dbEvent.start_date ? new Date(dbEvent.start_date) : null,
          endDate: dbEvent.end_date ? new Date(dbEvent.end_date) : dbEvent.start_date ? new Date(dbEvent.start_date) : null,
          time: dbEvent.time,
          tags: dbEvent.tags || [],
          intentions: dbEvent.intentions || [],
          attendees: enrollmentCountMap.get(dbEvent.id) || 0,
          connectionsGoing: [],
          comments: thoughtCountMap.get(dbEvent.id) || 0,
          image: dbEvent.image_url || spiritualBackground,
          isPastEvent: dbEvent.start_date ? new Date(dbEvent.start_date) < new Date() : false,
          organizers: [{
            id: dbEvent.user_id,
            name: organizerName,
            avatar: profile?.avatar_url || elenaProfile
          }],
          thoughts: []
        };
      });
      
      setEvents(formattedEvents);
    };
    
    fetchEvents();
  }, []);

  // Fetch matches from database - defined outside useEffect so it can be called from anywhere
  const fetchMatches = async () => {
    const { data: matchesData, error } = await supabase
      .from('matches')
      .select(`
        *,
        match_participants (
          id,
          playtomic_user_id,
          added_by_profile_id,
          name,
          team_id,
          gender,
          level_value,
          level_confidence,
          price,
          payment_status,
          registration_date
        )
      `)
      .order('match_date', { ascending: true });

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    // Get all unique playtomic_user_ids from participants
    const playtomicUserIds = new Set<string>();
    matchesData?.forEach(match => {
      match.match_participants?.forEach((p: any) => {
        if (p.playtomic_user_id) {
          playtomicUserIds.add(p.playtomic_user_id);
        }
      });
    });

    // Fetch profiles for these playtomic_user_ids (including avatar_url)
    let profilesMap = new Map<string, any>();
    if (playtomicUserIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('playtomic_user_id, ranking, avatar_url')
        .in('playtomic_user_id', Array.from(playtomicUserIds));

      profiles?.forEach(profile => {
        if (profile.playtomic_user_id) {
          profilesMap.set(profile.playtomic_user_id, profile);
        }
      });
    }

    // Fetch thought counts for all matches
    const matchIds = matchesData?.map(m => m.id) || [];
    let thoughtCountMap = new Map<string, number>();
    if (matchIds.length > 0) {
      const { data: thoughtCounts } = await supabase
        .from('thoughts')
        .select('match_id')
        .in('match_id', matchIds)
        .not('match_id', 'is', null);

      (thoughtCounts || []).forEach((thought: any) => {
        const currentCount = thoughtCountMap.get(thought.match_id) || 0;
        thoughtCountMap.set(thought.match_id, currentCount + 1);
      });
    }

    // Attach profile rankings and avatar_url to participants and thought counts
    const enrichedMatches = matchesData?.map(match => ({
      ...match,
      thoughts_count: thoughtCountMap.get(match.id) || 0,
      match_participants: match.match_participants?.map((p: any) => {
        const profile = p.playtomic_user_id ? profilesMap.get(p.playtomic_user_id) : null;
        return {
          ...p,
          profile_ranking: profile?.ranking || null,
          avatar_url: profile?.avatar_url || null
        };
      })
    }));

    setMatches(enrichedMatches || []);
  };

  // Fetch matches when user profile is loaded
  useEffect(() => {
    if (userProfileLoaded) {
      fetchMatches();
    }
  }, [userProfileLoaded]);

  // Set up real-time subscription for matches
  useEffect(() => {
    // Set up real-time subscription for match updates
    const matchesChannel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('🔄 Match updated via real-time:', payload);
          // Refetch matches when any match is updated
          fetchMatches();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants'
        },
        (payload) => {
          console.log('🔄 Match participants updated via real-time:', payload);
          // Refetch matches when participants are updated
          fetchMatches();
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    // Listen for auth state changes and refetch data when token is refreshed
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed, refetching matches...');
        fetchMatches();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up real-time subscription');
      supabase.removeChannel(matchesChannel);
      authSubscription.unsubscribe();
    };
  }, []);

  // Function to add a level to a match
  const handleAddLevelToMatch = async (matchId: string) => {
    if (!newLevelForMatch) {
      toast.error("Please select a level to add");
      return;
    }

    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const currentLevels = match.match_levels || [];
    if (currentLevels.includes(newLevelForMatch)) {
      toast.error("This level is already added");
      return;
    }

    const updatedLevels = [...currentLevels, newLevelForMatch];

    const { error } = await supabase
      .from('matches')
      .update({ match_levels: updatedLevels })
      .eq('id', matchId);

    if (error) {
      console.error('Error updating match levels:', error);
      toast.error("Failed to add level");
      return;
    }

    // Update local state
    setMatches(matches.map(m =>
      m.id === matchId ? { ...m, match_levels: updatedLevels } : m
    ));
    setNewLevelForMatch("");
    toast.success("Level added successfully");
  };

  // Function to remove a level from a match
  const handleRemoveLevelFromMatch = async (matchId: string, levelToRemove: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const updatedLevels = (match.match_levels || []).filter((level: string) => level !== levelToRemove);

    if (updatedLevels.length === 0) {
      toast.error("Match must have at least one level");
      return;
    }

    const { error } = await supabase
      .from('matches')
      .update({ match_levels: updatedLevels })
      .eq('id', matchId);

    if (error) {
      console.error('Error updating match levels:', error);
      toast.error("Failed to remove level");
      return;
    }

    // Update local state
    setMatches(matches.map(m =>
      m.id === matchId ? { ...m, match_levels: updatedLevels } : m
    ));
    toast.success("Level removed successfully");
  };

  // Function to delete a match
  const handleDeleteMatch = async (matchId: string) => {
    // Use window.confirm for confirmation
    const confirmed = window.confirm("Are you sure you want to delete this match?");

    if (!confirmed) {
      return;
    }

    try {
      console.log('Deleting match:', matchId);

      // First delete all participants
      const { error: participantsError } = await supabase
        .from('match_participants')
        .delete()
        .eq('match_id', matchId);

      if (participantsError) {
        console.error('Error deleting participants:', participantsError);
        toast.error("Failed to delete match participants");
        return;
      }

      console.log('Participants deleted, now deleting match');

      // Then delete the match
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (matchError) {
        console.error('Error deleting match:', matchError);
        toast.error("Failed to delete match");
        return;
      }

      console.log('Match deleted successfully');

      // Update local state
      setMatches(matches.filter(m => m.id !== matchId));
      toast.success("Match deleted successfully");
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error("Failed to delete match");
    }
  };

  const handleAddPlayer = async (matchId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to add a player");
      return;
    }

    console.log('Adding player with:', { matchId, currentUserId });

    // Insert a generic spot reservation with added_by_profile_id set to current user
    const { data, error } = await supabase
      .from('match_participants')
      .insert({
        match_id: matchId,
        name: 'Spot reserved',
        added_by_profile_id: currentUserId,
        // playtomic_user_id is null
      })
      .select();

    console.log('Insert result:', { data, error });

    if (error) {
      console.error('Error adding player:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(`Failed to add player: ${error.message}`);
      return;
    }

    toast.success("Player spot reserved!");
    fetchMatches();
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to delete a participant");
      return;
    }

    console.log('Deleting participant:', participantId);

    const { error } = await supabase
      .from('match_participants')
      .delete()
      .eq('id', participantId);

    console.log('Delete result:', { error });

    if (error) {
      console.error('Error deleting participant:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(`Failed to delete participant: ${error.message}`);
      return;
    }

    toast.success("Participant removed!");
    fetchMatches();
  };

  // Handle opening thoughts modal for a match
  const handleOpenMatchThoughts = async (match: any) => {
    setSelectedMatchForThoughts(match);
    const thoughts = await getThoughtsByMatchId(match.id);
    setMatchThoughts(thoughts);
    setMatchThoughtsModalOpen(true);
  };

  // Refresh match thoughts and update thought count in matches list
  const refreshMatchThoughts = async () => {
    if (selectedMatchForThoughts) {
      const thoughts = await getThoughtsByMatchId(selectedMatchForThoughts.id);
      setMatchThoughts(thoughts);
    }
    // Also refresh matches to update the thought count
    fetchMatches();
  };

  // Filter events by time filter, tags, intentions, and date range
  const filteredEvents = events.filter(event => {
    // Time filter
    if (filter === "past" && !event.isPastEvent) return false;
    if (filter === "future" && event.isPastEvent) return false;
    
    // Date range filter - check if event overlaps with selected date range
    if (selectedDate) {
      // If a date filter is selected but event has no start date, hide it
      if (!event.startDate) {
        console.log("Hiding event (no start date):", event.title);
        return false;
      }
      
      console.log("Checking event:", { 
        title: event.title, 
        startDate: event.startDate, 
        endDate: event.endDate,
        selectedDate 
      });
      let filterStartDate: Date | null = null;
      let filterEndDate: Date | null = null;
      
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      if (selectedDate === "today") {
        filterStartDate = new Date(now);
        filterEndDate = new Date(now);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "tomorrow") {
        filterStartDate = new Date(now);
        filterStartDate.setDate(filterStartDate.getDate() + 1);
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "this-week") {
        filterStartDate = new Date(now);
        filterEndDate = new Date(now);
        filterEndDate.setDate(filterEndDate.getDate() + (6 - now.getDay())); // End of this week (Saturday)
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "next-week") {
        filterStartDate = new Date(now);
        filterStartDate.setDate(filterStartDate.getDate() + (7 - now.getDay())); // Start of next week (Sunday)
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setDate(filterEndDate.getDate() + 6); // End of next week (Saturday)
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "next-3-weeks") {
        filterStartDate = new Date(now);
        filterEndDate = new Date(now);
        filterEndDate.setDate(filterEndDate.getDate() + 21); // 3 weeks = 21 days
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "custom" && customDateFrom && customDateTo) {
        filterStartDate = new Date(customDateFrom);
        filterStartDate.setHours(0, 0, 0, 0);
        filterEndDate = new Date(customDateTo);
        filterEndDate.setHours(23, 59, 59, 999);
      }
      
      // Check if event dates overlap with filter dates
      if (filterStartDate && filterEndDate) {
        const eventStart = new Date(event.startDate);
        const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
        eventEnd.setHours(23, 59, 59, 999);
        
        // Events overlap if: event starts before filter ends AND event ends after filter starts
        const overlaps = eventStart <= filterEndDate && eventEnd >= filterStartDate;
        if (!overlaps) return false;
      }
    }
    
    // Tags filter - event must have at least one of the selected tags
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some(selectedTag => 
        event.tags.includes(selectedTag)
      );
      if (!hasMatchingTag) return false;
    }
    
    // Intentions filter - event must have at least one of the selected intentions
    if (selectedIntentions.length > 0) {
      const hasMatchingIntention = selectedIntentions.some(selectedIntention => 
        event.intentions.includes(selectedIntention)
      );
      if (!hasMatchingIntention) return false;
    }
    
    // Radius filter - event must be within selected radius
    if (selectedRadius && selectedLocationCoords) {
      // If event has no coordinates, hide it when radius is selected
      if (!event.latitude || !event.longitude) {
        return false;
      }
      
      // Calculate distance between selected location and event
      const distance = calculateDistance(
        selectedLocationCoords.lat,
        selectedLocationCoords.lng,
        event.latitude,
        event.longitude
      );
      
      const radiusKm = parseFloat(selectedRadius);
      if (distance > radiusKm) {
        return false;
      }
    }
    
    return true;
  });

  // Filter matches by match level, date range, and location
  const filteredMatches = matches.filter(match => {
    // Hide fully booked matches filter
    const participantCount = match.match_participants?.length || 0;
    if (hideFullyBooked && participantCount >= match.total_spots) {
      return false;
    }

    // Match level filter - check if any of the match's levels are in the selected levels array
    if (selectedMatchLevels.length > 0 && match.match_levels) {
      const hasMatchingLevel = match.match_levels.some((level: string) =>
        selectedMatchLevels.includes(level)
      );
      if (!hasMatchingLevel) {
        return false;
      }
    }

    // Date range filter
    if (selectedDate && match.match_date) {
      const matchDate = new Date(match.match_date);
      let filterStartDate: Date | null = null;
      let filterEndDate: Date | null = null;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (selectedDate === "today") {
        filterStartDate = new Date(now);
        filterEndDate = new Date(now);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "tomorrow") {
        filterStartDate = new Date(now);
        filterStartDate.setDate(filterStartDate.getDate() + 1);
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "this-week") {
        filterStartDate = new Date(now);
        filterEndDate = new Date(now);
        filterEndDate.setDate(filterEndDate.getDate() + (6 - now.getDay()));
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "next-week") {
        filterStartDate = new Date(now);
        filterStartDate.setDate(filterStartDate.getDate() + (7 - now.getDay()));
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setDate(filterEndDate.getDate() + 6);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "next-3-weeks") {
        filterStartDate = new Date(now);
        filterEndDate = new Date(now);
        filterEndDate.setDate(filterEndDate.getDate() + 21); // 3 weeks = 21 days
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "custom" && customDateFrom && customDateTo) {
        filterStartDate = new Date(customDateFrom);
        filterStartDate.setHours(0, 0, 0, 0);
        filterEndDate = new Date(customDateTo);
        filterEndDate.setHours(23, 59, 59, 999);
      }

      if (filterStartDate && filterEndDate) {
        if (matchDate < filterStartDate || matchDate > filterEndDate) {
          return false;
        }
      }
    }

    // Radius filter
    if (selectedRadius && selectedLocationCoords) {
      if (!match.latitude || !match.longitude) {
        return false;
      }

      const distance = calculateDistance(
        selectedLocationCoords.lat,
        selectedLocationCoords.lng,
        match.latitude,
        match.longitude
      );

      const radiusKm = parseFloat(selectedRadius);
      if (distance > radiusKm) {
        return false;
      }
    }

    return true;
  });

  // Refetch user data after setup dialog
  const handleSetupComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tp_user_id')
        .eq('id', user.id)
        .single();

      if (profile?.tp_user_id) {
        setShowSetupDialog(false);
      }
    }
  };

  return (
    <>
        {/* TP Member Setup Dialog */}
        <TPMemberSetupDialog
          open={showSetupDialog}
          onOpenChange={setShowSetupDialog}
          onSaveComplete={handleSetupComplete}
        />

        {/* Events Filters - Sticky */}
        <div className="bg-transparent sticky top-[57px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-130px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 h-full">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-2 sticky top-0 h-[calc(200vh-130px)] overflow-y-auto">
              <div className="space-y-4">
                {/* Filter Card */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-primary" />
                        <span>Filters</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setSelectedLocation("");
                          setSelectedRadius("");
                          setSelectedDate("");
                          setSelectedMatchLevels(getAvailableRankingLevels(userRanking));
                          setHideFullyBooked(false);
                          setShowCustomDatePicker(false);
                          setCustomDateFrom(undefined);
                          setCustomDateTo(undefined);
                        }}
                      >
                        Clear
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Where Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Where</span>
                      </div>
                      <LocationAutocomplete
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        placeholder="Enter a city..."
                        className="text-sm"
                      />
                      <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Radius" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 km</SelectItem>
                          <SelectItem value="10">10 km</SelectItem>
                          <SelectItem value="25">25 km</SelectItem>
                          <SelectItem value="50">50 km</SelectItem>
                          <SelectItem value="100">100 km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* When Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">When</span>
                      </div>
                      <div className="relative">
                        <Select 
                          value={selectedDate} 
                          onValueChange={(value) => {
                            setSelectedDate(value);
                            if (value === "custom") {
                              setShowCustomDatePicker(true);
                            } else {
                              setShowCustomDatePicker(false);
                              setCustomDateFrom(undefined);
                              setCustomDateTo(undefined);
                            }
                          }}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Time period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="this-week">This Week</SelectItem>
                            <SelectItem value="next-week">Next Week</SelectItem>
                            <SelectItem value="next-3-weeks">Next 3 Weeks</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Custom Date Range Picker */}
                        {showCustomDatePicker && (
                          <div className="absolute top-full left-0 right-0 mt-2 z-50">
                            <CustomDateRangePicker
                              onRangeSelect={(from, to) => {
                                setCustomDateFrom(from);
                                setCustomDateTo(to);
                                if (from && to) {
                                  setSelectedDate("custom");
                                }
                              }}
                              onClose={() => setShowCustomDatePicker(false)}
                            />
                          </div>
                        )}
                        
                        {/* Display selected custom range */}
                        {selectedDate === "custom" && customDateFrom && customDateTo && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {customDateFrom.toLocaleDateString()} - {customDateTo.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Match Level Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Ranking {currentUserId && '*'}</span>
                      </div>
                      <div className="space-y-2">
                        {getAvailableRankingLevels(userRanking).map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={`level-${level}`}
                              checked={selectedMatchLevels.includes(level)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMatchLevels([...selectedMatchLevels, level]);
                                } else {
                                  // Prevent unchecking if it's the last one
                                  if (selectedMatchLevels.length > 1) {
                                    setSelectedMatchLevels(selectedMatchLevels.filter(l => l !== level));
                                  }
                                }
                              }}
                            />
                            <label
                              htmlFor={`level-${level}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {level.replace('p', 'P').replace('-', ' - ').toUpperCase()}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hide Fully Booked Toggle */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hide-fully-booked"
                          checked={hideFullyBooked}
                          onCheckedChange={(checked) => setHideFullyBooked(checked === true)}
                        />
                        <label
                          htmlFor="hide-fully-booked"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Hide fully booked matches
                        </label>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - Events and Matches */}
            <div className="lg:col-span-6 space-y-6">
              {/* Matches Section */}
              {filteredMatches.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMatches.map((match) => (
                      <Card key={match.id} className="bg-card/90 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
                        <CardContent className="p-4 space-y-3 relative">
                          {/* Delete button - top right corner */}
                          {currentUserId === match.created_by && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteMatch(match.id);
                              }}
                              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Loading state for pending matches */}
                          {match.status === 'pending' && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded px-3 py-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Retrieving data from playtomic...</span>
                            </div>
                          )}

                          {/* Date and Venue */}
                          <div className="space-y-1">
                            {match.match_date && (
                              <h3 className="font-semibold text-lg flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                {format(new Date(match.match_date), 'EEEE d MMM, HH:mm')}
                                {match.duration && (() => {
                                  const startDate = new Date(match.match_date);
                                  const endDate = new Date(startDate.getTime() + match.duration * 60000);
                                  return ` - ${format(endDate, 'HH:mm')}`;
                                })()}
                              </h3>
                            )}
                            <div className="text-base text-muted-foreground">{match.venue_name || 'Padel Match'}</div>
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

                          {/* Participants - always show 4 slots for consistent card height */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm font-medium">
                                <Users className="h-4 w-4 mr-1" />
                                Players ({match.match_participants?.length || 0}/{match.total_spots || 4})
                              </div>
                              {/* Go to Playtomic Button - only visible if user created match or added a participant */}
                              {(currentUserId === match.created_by ||
                                match.match_participants?.some((p: any) => p.added_by_profile_id === currentUserId)) && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => window.open(match.url, '_blank')}
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
                                      onClick={() => setProfileImageModal({
                                        open: true,
                                        imageUrl: participant.avatar_url,
                                        name: participant.name || 'Player'
                                      })}
                                    >
                                      <AvatarImage src={participant.avatar_url} />
                                      <AvatarFallback className="text-[8px] bg-primary/10">
                                        {participant.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{participant.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* Show profile ranking if available, otherwise show level_value */}
                                    {participant.profile_ranking ? (
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {participant.profile_ranking}
                                      </span>
                                    ) : participant.level_value ? (
                                      <span className="text-xs text-muted-foreground">
                                        Level {participant.level_value.toFixed(1)}
                                      </span>
                                    ) : null}
                                    {/* Delete button - only show if current user added this participant */}
                                    {participant.added_by_profile_id === currentUserId && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteParticipant(participant.id)}
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {/* Render empty slots as "New player" buttons */}
                              {Array.from({ length: (match.total_spots || 4) - (match.match_participants?.length || 0) }).map((_, index) => (
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

                          {/* Match Levels Badges and Go to Playtomic Button */}
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Rankings:</span>

                            {match.match_levels && match.match_levels.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center justify-between">
                                <div className="flex flex-wrap gap-1 items-center">
                                  {[...match.match_levels].sort((a: string, b: string) => {
                                    // Extract first number from level string (e.g., "p50-p100" -> 50)
                                    const getFirstNum = (level: string) => {
                                      const match = level.match(/\d+/);
                                      return match ? parseInt(match[0]) : 0;
                                    };
                                    return getFirstNum(a) - getFirstNum(b);
                                  }).map((level: string) => (
                                    <Badge
                                      key={level}
                                      variant="secondary"
                                      className="capitalize text-xs flex items-center gap-1"
                                    >
                                      {level}
                                      {currentUserId === match.created_by && match.match_levels.length > 1 && (
                                        <X
                                          className="h-3 w-3 cursor-pointer hover:text-destructive ml-1"
                                          onClick={() => handleRemoveLevelFromMatch(match.id, level)}
                                        />
                                      )}
                                    </Badge>
                                  ))}

                                  {/* Add Level Button - only show if there are levels available to add */}
                                  {currentUserId === match.created_by &&
                                   (() => {
                                     const availableLevels = getAvailableRankingLevels(userRanking).filter(level => !match.match_levels?.includes(level));
                                     return availableLevels.length > 0 && (
                                       <Button
                                         variant="outline"
                                         size="icon"
                                         className="h-6 w-6 border-dashed"
                                         onClick={async () => {
                                           const levelToAdd = availableLevels[0];

                                           // Add the level directly
                                           const currentLevels = match.match_levels || [];
                                           const updatedLevels = [...currentLevels, levelToAdd];

                                           const { error } = await supabase
                                             .from('matches')
                                             .update({ match_levels: updatedLevels })
                                             .eq('id', match.id);

                                           if (error) {
                                             console.error('Error updating match levels:', error);
                                             toast.error("Failed to add ranking");
                                             return;
                                           }

                                           toast.success("Ranking added!");
                                           fetchMatches();
                                         }}
                                       >
                                         <Plus className="h-3 w-3" />
                                       </Button>
                                     );
                                   })()}
                                </div>

                                </div>
                            )}
                          </div>
                        </CardContent>

                        {/* Action Bar - same style as event cards */}
                        <div className="px-4 py-2 border-t border-border">
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenMatchThoughts(match)}
                              className="flex-1 flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>{match.thoughts_count || 0} Thoughts</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(match.url || `${window.location.origin}/events?match=${match.id}`);
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

              {/* Events Section */}
              {filteredEvents.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground font-comfortaa">Community Events</h2>
                {filteredEvents.map((event, index) => (
                <CommunityEventCard
                  key={event.eventId}
                  eventId={event.eventId}
                  title={event.title}
                  thought={event.description}
                  image={event.image}
                  dateRange={event.dateRange}
                  author={{
                    id: event.organizers[0]?.id || 'organizer-1',
                    name: event.organizers[0]?.name || 'Event Creator',
                    avatar: event.organizers[0]?.avatar || elenaProfile,
                    role: 'Event Organizer'
                  }}
                  location={event.location}
                  attendees={event.attendees}
                  tags={event.tags}
                  intentions={event.intentions}
                  connectionsGoing={event.connectionsGoing}
                  isPastEvent={event.isPastEvent}
                  averageRating={event.averageRating}
                  totalReviews={event.totalReviews}
                  comments={event.comments}
                  index={index}
                  onOpenThoughts={async (evt) => {
                    setSelectedEvent(event);
                    // Load thoughts from database
                    const thoughts = await getThoughtsByEventId(event.eventId);
                    setSelectedEvent({ ...event, thoughts });
                    setThoughtsModalOpen(true);
                  }}
                  isReshared={resharedEvents.includes(event.eventId)}
                  onToggleReshare={() => {
                    if (resharedEvents.includes(event.eventId)) {
                      setResharedEvents(prev => prev.filter(id => id !== event.eventId));
                      toast.success("Reshare removed");
                    } else {
                      setResharedEvents(prev => [...prev, event.eventId]);
                      toast.success("Event reshared!");
                    }
                  }}
                  isSaved={savedEvents.includes(event.eventId)}
                  onToggleSave={() => {
                    if (savedEvents.includes(event.eventId)) {
                      setSavedEvents(prev => prev.filter(id => id !== event.eventId));
                      toast.success("Removed from saved");
                    } else {
                      setSavedEvents(prev => [...prev, event.eventId]);
                      toast.success("Event saved!");
                    }
                  }}
                />
              ))}
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Thoughts Modal */}
        <ThoughtsModal
          open={thoughtsModalOpen}
          onOpenChange={setThoughtsModalOpen}
          postId={selectedEvent?.eventId || selectedEvent?.id || ''}
          postTitle={selectedEvent?.title || ""}
          thoughts={selectedEvent?.thoughts || []}
          isEvent={true}
          onThoughtAdded={async () => {
            // Refresh thoughts after adding
            if (selectedEvent?.eventId) {
              const updatedThoughts = await getThoughtsByEventId(selectedEvent.eventId);
              setSelectedEvent({ ...selectedEvent, thoughts: updatedThoughts });
              
              // Update the comment count in events list
              setEvents(prevEvents => prevEvents.map(e => 
                e.eventId === selectedEvent.eventId 
                  ? { ...e, comments: updatedThoughts.length }
                  : e
              ));
              
              toast.success("Thought added!");
            }
          }}
        />

        {/* Match Thoughts Modal */}
        <ThoughtsModal
          open={matchThoughtsModalOpen}
          onOpenChange={setMatchThoughtsModalOpen}
          postId={selectedMatchForThoughts?.id || ''}
          postTitle={selectedMatchForThoughts?.venue_name || selectedMatchForThoughts?.match_date ?
            `${selectedMatchForThoughts?.venue_name || 'Match'} - ${selectedMatchForThoughts?.match_date ? format(new Date(selectedMatchForThoughts.match_date), 'd MMM HH:mm') : ''}` :
            'Match'}
          thoughts={matchThoughts}
          isMatch={true}
          onThoughtAdded={refreshMatchThoughts}
        />

        {/* Profile Image Modal */}
        <Dialog open={profileImageModal.open} onOpenChange={(open) => setProfileImageModal({ ...profileImageModal, open })}>
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
                    {profileImageModal.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Modal */}
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          eventTitle={selectedEvent?.title || ""}
          reviews={selectedEvent?.reviews || []}
          averageRating={selectedEvent?.averageRating || 0}
          totalReviews={selectedEvent?.totalReviews || 0}
        />

        {/* Enrollment Modal */}
        <Dialog open={enrollmentModalOpen} onOpenChange={setEnrollmentModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enroll in Event</DialogTitle>
              <DialogDescription>
                Join "{selectedEvent?.title}" - Complete your enrollment below
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Event Details:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Date:</strong> {selectedEvent?.date}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Location:</strong> {selectedEvent?.location}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Organizers:</strong> {selectedEvent?.organizers?.map((org: any) => org.name).join(', ')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Current attendees:</strong> {selectedEvent?.attendees}</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Enrollment Options:</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="anonymous" 
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Stay anonymous (your name won't be visible to other participants)
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">What to expect:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>You'll receive a confirmation email with event details</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Event reminders will be sent 24 hours and 1 hour before</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>You can cancel your enrollment up to 2 hours before the event</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEnrollmentModalOpen(false);
                  setIsAnonymous(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success(`Successfully enrolled in "${selectedEvent?.title}"!`);
                  setEnrollmentModalOpen(false);
                  setIsAnonymous(false);
                }}
              >
                Confirm Enrollment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
};

export default Events;
