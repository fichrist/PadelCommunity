import { useState, useEffect } from "react";
import { useSessionRefresh } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Search, Ban, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { processMatchParticipants } from "@/lib/matchParticipants";
import { createMatchNotifications } from "@/lib/notifications";

// Function to fetch match details from Playtomic URL
const fetchPlaytomicMatchDetails = async (url: string) => {
  try {
    const azureFunctionUrl = import.meta.env.VITE_AZURE_FUNCTION_URL || 'http://localhost:7071';
    console.log('Calling Azure Function at:', `${azureFunctionUrl}/api/y`);
    console.log('Scraping URL:', url);

    const response = await fetch(`${azureFunctionUrl}/api/scrapePlaytomic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('Azure Function response status:', response.status, response.statusText);
    const data = await response.json();
    console.log('Azure Function response data:', data);

    if (!response.ok || !data.success) {
      console.warn('Could not fetch match details from URL:', data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
};

interface FavoriteUser {
  id: string;
  name: string;
  avatar_url: string | null;
  club_name: string | null;
}

const CreateMatch = () => {
  const navigate = useNavigate();
  const refreshKey = useSessionRefresh();
  const [url, setUrl] = useState("");
  const [withoutUrl, setWithoutUrl] = useState(false);
  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  })();
  const [matchDate, setMatchDate] = useState(defaultDate);
  const [matchTime, setMatchTime] = useState("12:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishToFavoritesOnly, setPublishToFavoritesOnly] = useState(false);
  const [favoriteUsers, setFavoriteUsers] = useState<FavoriteUser[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<FavoriteUser[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Allowed groups for group selection
  const [allowedGroups, setAllowedGroups] = useState<Array<{ id: string; name: string; group_type: string; ranking_level: string | null }>>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // User address and name (for matches without URL)
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userPlaytomicId, setUserPlaytomicId] = useState<string | null>(null);

  // Player search for adding new favorites
  const [playerSearch, setPlayerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FavoriteUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newFavoriteIds, setNewFavoriteIds] = useState<string[]>([]);

  // Fetch user's favorites, blocked users and profile data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch favorites, blocked users, address, name and allowed groups
        const { data: profile } = await supabase
          .from('profiles')
          .select('favorite_users, blocked_users, formatted_address, latitude, longitude, first_name, last_name, display_name, playtomic_user_id, allowed_groups')
          .eq('id', user.id)
          .single();

        if (profile?.formatted_address) {
          setUserAddress(profile.formatted_address);
          setUserLatitude(profile.latitude);
          setUserLongitude(profile.longitude);
        }

        const name = profile?.display_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User';
        setUserName(name);
        setUserPlaytomicId(profile?.playtomic_user_id || null);

        // Fetch allowed group details
        if (profile?.allowed_groups && profile.allowed_groups.length > 0) {
          const { data: groups } = await (supabase as any)
            .from('groups')
            .select('id, name, group_type, ranking_level')
            .in('id', profile.allowed_groups);

          if (groups) {
            setAllowedGroups(groups);
            // All selected by default
            setSelectedGroups(groups.map((g: any) => g.id));
          }
        }

        // Fetch favorite users details
        if (profile?.favorite_users && profile.favorite_users.length > 0) {
          const { data: favorites } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, display_name, avatar_url, club_name')
            .in('id', profile.favorite_users);

          if (favorites) {
            const formattedFavorites = favorites.map(fav => ({
              id: fav.id,
              name: fav.display_name || `${fav.first_name || ''} ${fav.last_name || ''}`.trim() || 'User',
              avatar_url: fav.avatar_url,
              club_name: fav.club_name
            }));
            setFavoriteUsers(formattedFavorites);
            // Initially select all favorites
            setSelectedFavorites(formattedFavorites.map(f => f.id));
          }
        }

        // Fetch blocked users details
        if (profile?.blocked_users && profile.blocked_users.length > 0) {
          setBlockedUserIds(profile.blocked_users);
          const { data: blocked } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, display_name, avatar_url, club_name')
            .in('id', profile.blocked_users);

          if (blocked) {
            const formattedBlocked = blocked.map(b => ({
              id: b.id,
              name: b.display_name || `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'User',
              avatar_url: b.avatar_url,
              club_name: b.club_name
            }));
            setBlockedUsers(formattedBlocked);
          }
        }
      }
    };

    fetchUserData();
  }, [refreshKey]);

  // Search players when search query changes
  useEffect(() => {
    const searchPlayers = async () => {
      if (playerSearch.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, display_name, avatar_url, club_name')
          .or(`first_name.ilike.%${playerSearch.trim()}%,last_name.ilike.%${playerSearch.trim()}%,display_name.ilike.%${playerSearch.trim()}%`)
          .neq('id', user.id)
          .limit(10);

        if (profiles) {
          // Filter out users already in favorites
          const existingFavoriteIds = favoriteUsers.map(f => f.id);
          const filtered = profiles
            .filter(p => !existingFavoriteIds.includes(p.id))
            .map(p => ({
              id: p.id,
              name: p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User',
              avatar_url: p.avatar_url,
              club_name: p.club_name
            }));
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error('Error searching players:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchPlayers, 300);
    return () => clearTimeout(debounce);
  }, [playerSearch, favoriteUsers]);

  const handleAddPlayerAsFavorite = (player: FavoriteUser) => {
    setFavoriteUsers(prev => [...prev, player]);
    setSelectedFavorites(prev => [...prev, player.id]);
    setNewFavoriteIds(prev => [...prev, player.id]);
    setPlayerSearch("");
    setSearchResults([]);
    toast.success(`${player.name} added to favorites`);
  };

  const handleUnblockUser = async (userId: string) => {
    const newBlockedIds = blockedUserIds.filter(id => id !== userId);
    setBlockedUserIds(newBlockedIds);
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ blocked_users: newBlockedIds })
        .eq('id', user.id);
    }
    toast.success("User unblocked");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!withoutUrl && !url.trim()) {
      toast.error("Please enter a match URL");
      return;
    }

    if (withoutUrl && (!matchDate || !matchTime)) {
      toast.error("Please enter both a date and start time");
      return;
    }

    if (withoutUrl && !message.trim()) {
      toast.error("Please enter a message for this match");
      return;
    }

    if (selectedGroups.length === 0) {
      toast.error("Please select at least one group");
      return;
    }

    if (publishToFavoritesOnly && selectedFavorites.length === 0) {
      toast.error("Please select at least one favorite to publish to");
      return;
    }

    if (!withoutUrl) {
      // Basic URL validation
      try {
        new URL(url);
      } catch {
        toast.error("Please enter a valid URL");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to create a match");
        navigate('/');
        return;
      }

      // Save new favorites to profile if any were added
      if (newFavoriteIds.length > 0) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('favorite_users')
          .eq('id', user.id)
          .single();

        const existingFavorites = currentProfile?.favorite_users || [];
        const updatedFavorites = [...new Set([...existingFavorites, ...newFavoriteIds])];

        await supabase
          .from('profiles')
          .update({ favorite_users: updatedFavorites })
          .eq('id', user.id);
      }

      // Use user-selected groups
      const groupIds = [...selectedGroups];

      // Prepare restricted_users array if publish to favorites only
      let restrictedUsers: string[] | null = null;
      if (publishToFavoritesOnly && selectedFavorites.length > 0) {
        // Include selected favorites and the organizer
        restrictedUsers = [...selectedFavorites, user.id];
      }

      if (withoutUrl) {
        // Create match without URL - no scraping
        const { data: matchData, error: insertError } = await supabase
          .from('matches')
          .insert({
            url: null,
            group_ids: groupIds,
            created_by: user.id,
            status: 'confirmed',
            restricted_users: restrictedUsers,
            message: message.trim() || null,
            match_date: matchDate,
            match_time: matchTime,
            total_spots: 4,
            match_type: 'friendly',
            location: userAddress,
            latitude: userLatitude,
            longitude: userLongitude,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Add the creator as the first participant in team 0
        await supabase.from('match_participants').insert({
          match_id: matchData.id,
          name: userName,
          playtomic_user_id: userPlaytomicId,
          player_profile_id: user.id,
          added_by_profile_id: user.id,
          team_id: 0,
          scraped_from_playtomic: false,
        });

        toast.success("Match created successfully!");

        // Create notifications
        await createMatchNotifications(
          {
            id: matchData.id,
            venue_name: null,
            match_date: matchDate,
            latitude: userLatitude,
            longitude: userLongitude,
            group_ids: groupIds,
            restricted_users: restrictedUsers,
          },
          user.id
        );

        navigate('/community', {
          state: {
            refetchData: true,
            selectGroupId: groupIds.length > 0 ? groupIds[0] : null
          }
        });
      } else {
        // Create match with URL - existing scraping flow
        // Check if a match with this URL already exists
        const { data: existingMatches, error: checkError } = await supabase
          .from('matches')
          .select('id, url')
          .eq('url', url.trim());

        if (checkError) {
          console.error('Error checking for existing match:', checkError);
          throw checkError;
        }

        if (existingMatches && existingMatches.length > 0) {
          toast.error("A match with this URL already exists");
          setIsSubmitting(false);
          return;
        }

        // Fetch match details from Playtomic FIRST before creating the match
        toast.info("Fetching match details from Playtomic...");
        const details = await fetchPlaytomicMatchDetails(url.trim());

        // Validate that we got valid match data
        if (!details || !details.success || !details.data) {
          toast.error("Failed to fetch match details from Playtomic. Please check the URL and try again.");
          setIsSubmitting(false);
          return;
        }

        const matchDetails = details.data;

        // Validate essential fields
        if (!matchDetails.venue_name || !matchDetails.match_date) {
          toast.error("Could not extract essential match information from Playtomic. The URL may be invalid or the match may not be accessible.");
          setIsSubmitting(false);
          return;
        }

        console.log('Fetched match details:', matchDetails);

        // Now create the match with all the scraped data
        const { data: matchData, error: insertError } = await supabase
          .from('matches')
          .insert({
            url: url.trim(),
            group_ids: groupIds,
            created_by: user.id,
            status: 'confirmed',
            restricted_users: restrictedUsers,
            message: message.trim() || null,
            // Include scraped data directly
            match_date: matchDetails.match_date,
            match_time: matchDetails.match_time,
            venue_name: matchDetails.venue_name,
            location: matchDetails.location,
            city: matchDetails.city,
            latitude: matchDetails.latitude,
            longitude: matchDetails.longitude,
            duration: matchDetails.duration,
            court_number: matchDetails.court_number,
            price_per_person: matchDetails.price_per_person,
            total_price: matchDetails.total_price,
            match_type: matchDetails.match_type,
            surface_type: matchDetails.surface_type,
            players_registered: matchDetails.players_registered,
            total_spots: matchDetails.total_spots,
            organizer_name: matchDetails.organizer_name,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        toast.success("Match created successfully!");

        // Create notifications for users based on their filters
        await createMatchNotifications(
          {
            id: matchData.id,
            venue_name: matchDetails.venue_name,
            match_date: matchDetails.match_date,
            latitude: matchDetails.latitude,
            longitude: matchDetails.longitude,
            group_ids: groupIds,
            restricted_users: restrictedUsers,
          },
          user.id
        );

        // Insert participants if available
        if (matchDetails.participants && matchDetails.participants.length > 0) {
          const participantsToInsert = matchDetails.participants.map((p: any) => ({
            match_id: matchData.id,
            playtomic_user_id: p.playtomic_user_id,
            name: p.name,
            team_id: p.team_id,
            gender: p.gender,
            level_value: p.level_value,
            level_confidence: p.level_confidence,
            price: p.price,
            payment_status: p.payment_status,
            registration_date: p.registration_date,
            added_by_profile_id: user.id,
            scraped_from_playtomic: true
          }));

          const { data: insertedParticipants, error: participantsError } = await supabase
            .from('match_participants')
            .insert(participantsToInsert)
            .select();

          if (participantsError) {
            console.error('Error inserting participants:', participantsError);
          } else {
            console.log(`${matchDetails.participants.length} participants inserted successfully`);

            // Process participants: set playtomic_user_id on profiles and link to participants
            if (insertedParticipants && insertedParticipants.length > 0) {
              await processMatchParticipants(insertedParticipants, user.id);
            }

            toast.success(`Match created with ${matchDetails.participants.length} participants!`);
          }
        }

        // Navigate to community page and trigger a refetch, with the first group ID to auto-select
        navigate('/community', {
          state: {
            refetchData: true,
            selectGroupId: groupIds.length > 0 ? groupIds[0] : null
          }
        });
      }
    } catch (error: any) {
      console.error('Error creating match:', error);
      toast.error(error.message || "Failed to create match");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create Match</h1>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Without URL Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="without-url-toggle">Create without Playtomic URL</Label>
                  <p className="text-sm text-muted-foreground">
                    I want to play but haven't booked a field yet
                  </p>
                </div>
                <Switch
                  id="without-url-toggle"
                  checked={withoutUrl}
                  onCheckedChange={setWithoutUrl}
                />
              </div>

              {/* Match URL - only when not without URL */}
              {!withoutUrl && (
                <div className="space-y-2">
                  <Label htmlFor="url">Match URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://app.playtomic.io/t/1Axkqx4B"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required={!withoutUrl}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the Playtomic match URL. Details will be fetched automatically.
                  </p>
                </div>
              )}

              {/* Date and Time - only when without URL */}
              {withoutUrl && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="match-date">Date *</Label>
                    <Input
                      id="match-date"
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      required={withoutUrl}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="match-time">Start Time *</Label>
                    <Select value={matchTime} onValueChange={setMatchTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, h) => [
                          `${String(h).padStart(2, '0')}:00`,
                          `${String(h).padStart(2, '0')}:30`,
                        ]).flat().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Match Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message {withoutUrl ? '*' : '(optional)'}</Label>
                <Textarea
                  id="message"
                  placeholder="Add a message or description for this match..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                  required={withoutUrl}
                />
                <p className="text-sm text-muted-foreground">
                  This message will be shown on the match card.
                </p>
              </div>

              {/* Group Selection */}
              {allowedGroups.length > 0 && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <Label className="text-sm font-medium">Publish to groups:</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allowedGroups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGroups(prev => [...prev, group.id]);
                            } else {
                              setSelectedGroups(prev => prev.filter(id => id !== group.id));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`group-${group.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {group.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedGroups.length === 0 && (
                    <p className="text-sm text-destructive">Please select at least one group</p>
                  )}
                </div>
              )}

              {/* Publish to Favorites Only */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="favorites-toggle">Publish to favorites only</Label>
                    <p className="text-sm text-muted-foreground">
                      Only selected favorites will be able to see this match
                    </p>
                  </div>
                  <Switch
                    id="favorites-toggle"
                    checked={publishToFavoritesOnly}
                    onCheckedChange={setPublishToFavoritesOnly}
                  />
                </div>

                {/* Favorites Selection List */}
                {publishToFavoritesOnly && (
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <Label className="text-sm font-medium">Select favorites who can see this match:</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {favoriteUsers.map((favorite) => (
                        <div key={favorite.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                          <Checkbox
                            id={`favorite-${favorite.id}`}
                            checked={selectedFavorites.includes(favorite.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFavorites([...selectedFavorites, favorite.id]);
                              } else {
                                setSelectedFavorites(selectedFavorites.filter(id => id !== favorite.id));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`favorite-${favorite.id}`}
                            className="flex items-center space-x-3 flex-1 cursor-pointer"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={favorite.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/10">
                                {favorite.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{favorite.name}</p>
                              {favorite.club_name && (
                                <p className="text-xs text-muted-foreground truncate">{favorite.club_name}</p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                      {favoriteUsers.length === 0 && (
                        <p className="text-sm text-muted-foreground">No favorites yet. Use the search below to add players.</p>
                      )}
                    </div>
                    {selectedFavorites.length === 0 && favoriteUsers.length > 0 && (
                      <p className="text-sm text-destructive">Please select at least one favorite</p>
                    )}

                    {/* Add player search */}
                    <div className="border-t pt-3 mt-3 space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add a player to favorites
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name..."
                          value={playerSearch}
                          onChange={(e) => setPlayerSearch(e.target.value)}
                          className="pl-8 text-sm"
                        />
                      </div>
                      {isSearching && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Searching...
                        </div>
                      )}
                      {searchResults.length > 0 && (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {searchResults.map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={player.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs bg-primary/10">
                                    {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{player.name}</p>
                                  {player.club_name && (
                                    <p className="text-xs text-muted-foreground">{player.club_name}</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddPlayerAsFavorite(player)}
                                className="h-7 text-xs"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {playerSearch.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                        <p className="text-sm text-muted-foreground">No players found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Blocked Users */}
              {blockedUsers.length > 0 && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Ban className="h-4 w-4 text-destructive" />
                    Blocked Users ({blockedUsers.length})
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    These users won't see your matches. You can unblock them here.
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {blockedUsers.map((blockedUser) => (
                      <div key={blockedUser.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={blockedUser.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10">
                              {blockedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{blockedUser.name}</p>
                            {blockedUser.club_name && (
                              <p className="text-xs text-muted-foreground">{blockedUser.club_name}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblockUser(blockedUser.id)}
                          className="h-7 text-xs"
                        >
                          Unblock
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/community')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Match"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateMatch;
