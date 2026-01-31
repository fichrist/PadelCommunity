import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Ban, UserPlus, X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getUserIdFromStorage, createFreshSupabaseClient } from "@/integrations/supabase/client";
import { fetchPlaytomicMatchDetails } from "@/lib/playtomic";
import { createNotificationsForNewRestrictedUsers } from "@/lib/notifications";
import { format, parse } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: any;
  onUpdate: () => void;
}

interface Group {
  id: string;
  name: string;
  group_type: 'General' | 'Ranked' | 'Favorites';
  ranking_level: string | null;
}

interface FavoriteUser {
  id: string;
  name: string;
  avatar_url: string | null;
  club_name: string | null;
}

const EditMatchDialog = ({ open, onOpenChange, match, onUpdate }: EditMatchDialogProps) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // URL (for matches without URL)
  const [url, setUrl] = useState("");

  // Date/time (for matches without URL)
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("12:00");

  // Favorites
  const [publishToFavoritesOnly, setPublishToFavoritesOnly] = useState(false);
  const [favoriteUsers, setFavoriteUsers] = useState<FavoriteUser[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [restrictedOnlyUsers, setRestrictedOnlyUsers] = useState<FavoriteUser[]>([]);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<FavoriteUser[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Player search
  const [playerSearch, setPlayerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FavoriteUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newFavoriteIds, setNewFavoriteIds] = useState<string[]>([]);

  const hasUrl = !!match?.url;

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      const userId = getUserIdFromStorage();
      if (!userId) return;

      const client = createFreshSupabaseClient();

      // Fetch user profile
      const { data: profile } = await client
        .from('profiles')
        .select('favorite_users, blocked_users, allowed_groups')
        .eq('id', userId)
        .single();

      // Fetch allowed groups
      if (profile?.allowed_groups && profile.allowed_groups.length > 0) {
        const { data: groupsData } = await (client as any)
          .from('groups')
          .select('id, name, group_type, ranking_level')
          .in('id', profile.allowed_groups);

        if (groupsData) {
          const filtered = groupsData
            .filter((g: any) => g.group_type !== 'Favorites')
            .sort((a: any, b: any) => {
              if (a.group_type === 'General' && b.group_type !== 'General') return -1;
              if (a.group_type !== 'General' && b.group_type === 'General') return 1;
              if (a.group_type === 'Ranked' && b.group_type === 'Ranked') {
                const getNum = (level: string | null) => {
                  if (!level) return 0;
                  const m = level.match(/\d+/);
                  return m ? parseInt(m[0]) : 0;
                };
                return getNum(a.ranking_level) - getNum(b.ranking_level);
              }
              return 0;
            });
          setGroups(filtered);
        }
      }

      // Fetch favorite users
      if (profile?.favorite_users && profile.favorite_users.length > 0) {
        const { data: favorites } = await client
          .from('profiles')
          .select('id, first_name, last_name, display_name, avatar_url, club_name')
          .in('id', profile.favorite_users);

        if (favorites) {
          const formatted = favorites.map(fav => ({
            id: fav.id,
            name: fav.display_name || `${fav.first_name || ''} ${fav.last_name || ''}`.trim() || 'User',
            avatar_url: fav.avatar_url,
            club_name: fav.club_name
          }));
          setFavoriteUsers(formatted);
        }
      }

      // Fetch restricted users who are NOT in favorites (so they still show in the list)
      const isFavoritesMatch = match.restricted_users && match.restricted_users.length > 0;
      if (isFavoritesMatch) {
        const currentUserId = getUserIdFromStorage();
        const favoriteIdSet = new Set(profile?.favorite_users || []);
        const nonFavRestrictedIds = (match.restricted_users || [])
          .filter((id: string) => id !== currentUserId && !favoriteIdSet.has(id));

        if (nonFavRestrictedIds.length > 0) {
          const { data: restrictedProfiles } = await client
            .from('profiles')
            .select('id, first_name, last_name, display_name, avatar_url, club_name')
            .in('id', nonFavRestrictedIds);

          if (restrictedProfiles) {
            setRestrictedOnlyUsers(restrictedProfiles.map(p => ({
              id: p.id,
              name: p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User',
              avatar_url: p.avatar_url,
              club_name: p.club_name
            })));
          }
        } else {
          setRestrictedOnlyUsers([]);
        }
      } else {
        setRestrictedOnlyUsers([]);
      }

      // Fetch blocked users
      if (profile?.blocked_users && profile.blocked_users.length > 0) {
        setBlockedUserIds(profile.blocked_users);
        const { data: blocked } = await client
          .from('profiles')
          .select('id, first_name, last_name, display_name, avatar_url, club_name')
          .in('id', profile.blocked_users);

        if (blocked) {
          setBlockedUsers(blocked.map(b => ({
            id: b.id,
            name: b.display_name || `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'User',
            avatar_url: b.avatar_url,
            club_name: b.club_name
          })));
        }
      }
    };

    fetchData();

    // Initialize state from match
    setMessage(match.message || "");
    setSelectedGroups(match.group_ids || []);
    setUrl(match.url || "");
    setMatchDate(match.match_date ? match.match_date.split('T')[0] : "");
    setMatchTime(match.match_time ? match.match_time.substring(0, 5) : "12:00");
    setNewFavoriteIds([]);
    setPlayerSearch("");
    setSearchResults([]);

    // Determine favorites-only mode
    const isFavoritesOnly = match.restricted_users && match.restricted_users.length > 0;
    setPublishToFavoritesOnly(isFavoritesOnly);

    if (isFavoritesOnly) {
      const userId = getUserIdFromStorage();
      // Selected favorites = restricted_users minus current user
      const favIds = (match.restricted_users || []).filter((id: string) => id !== userId);
      setSelectedFavorites(favIds);
    } else {
      setSelectedFavorites([]);
    }
  }, [open, match]);

  // Player search effect
  useEffect(() => {
    const searchPlayers = async () => {
      if (playerSearch.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const userId = getUserIdFromStorage();
        if (!userId) return;

        const client = createFreshSupabaseClient();
        const { data: profiles } = await client
          .from('profiles')
          .select('id, first_name, last_name, display_name, avatar_url, club_name')
          .or(`first_name.ilike.%${playerSearch.trim()}%,last_name.ilike.%${playerSearch.trim()}%,display_name.ilike.%${playerSearch.trim()}%`)
          .neq('id', userId)
          .limit(10);

        if (profiles) {
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

  const handleUnblockUser = async (userIdToUnblock: string) => {
    const newBlockedIds = blockedUserIds.filter(id => id !== userIdToUnblock);
    setBlockedUserIds(newBlockedIds);
    setBlockedUsers(prev => prev.filter(u => u.id !== userIdToUnblock));

    const userId = getUserIdFromStorage();
    if (userId) {
      const client = createFreshSupabaseClient();
      await client
        .from('profiles')
        .update({ blocked_users: newBlockedIds })
        .eq('id', userId);
    }
    toast.success("User unblocked");
  };

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        if (prev.length === 1) {
          toast.error("Match must belong to at least one group");
          return prev;
        }
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSave = async () => {
    if (!publishToFavoritesOnly && selectedGroups.length === 0) {
      toast.error("Match must belong to at least one group");
      return;
    }

    if (publishToFavoritesOnly && selectedFavorites.length === 0) {
      toast.error("Please select at least one favorite to publish to");
      return;
    }

    setSaving(true);

    try {
      const userId = getUserIdFromStorage();
      if (!userId) {
        toast.error("You must be logged in");
        return;
      }

      const client = createFreshSupabaseClient();

      // Save new favorites to profile if any were added
      if (newFavoriteIds.length > 0) {
        const { data: currentProfile } = await client
          .from('profiles')
          .select('favorite_users')
          .eq('id', userId)
          .single();

        const existingFavorites = currentProfile?.favorite_users || [];
        const updatedFavorites = [...new Set([...existingFavorites, ...newFavoriteIds])];

        await (client as any)
          .from('profiles')
          .update({ favorite_users: updatedFavorites })
          .eq('id', userId);
      }

      const groupIds = publishToFavoritesOnly ? [] : [...selectedGroups];

      let restrictedUsers: string[] | null = null;
      if (publishToFavoritesOnly && selectedFavorites.length > 0) {
        restrictedUsers = [...selectedFavorites, userId];
      }

      // Build update object
      const updateData: any = {
        group_ids: groupIds,
        message: message.trim() || null,
        restricted_users: restrictedUsers,
      };

      // Handle URL/timing for matches without URL
      if (!hasUrl) {
        if (url.trim()) {
          // User entered a URL — scrape and update
          try {
            new URL(url);
          } catch {
            toast.error("Please enter a valid URL");
            setSaving(false);
            return;
          }

          toast.info("Fetching match details from Playtomic...");
          const details = await fetchPlaytomicMatchDetails(url.trim());

          if (details && details.success && details.data) {
            const d = details.data;
            updateData.url = url.trim();
            updateData.match_date = d.match_date;
            updateData.match_time = d.match_time;
            updateData.venue_name = d.venue_name;
            updateData.location = d.location;
            updateData.city = d.city;
            updateData.latitude = d.latitude;
            updateData.longitude = d.longitude;
            updateData.duration = d.duration;
            updateData.court_number = d.court_number;
            updateData.price_per_person = d.price_per_person;
            updateData.total_price = d.total_price;
            updateData.match_type = d.match_type;
            updateData.surface_type = d.surface_type;
            updateData.total_spots = d.total_spots;
            updateData.organizer_name = d.organizer_name;
          } else {
            toast.error("Failed to fetch match details from Playtomic. Please check the URL.");
            setSaving(false);
            return;
          }
        } else {
          // No URL — update date/time
          updateData.match_date = matchDate;
          updateData.match_time = matchTime;
        }
      }

      const { error } = await (client as any)
        .from('matches')
        .update(updateData)
        .eq('id', match.id);

      if (error) throw error;

      // Notify newly added restricted users (fire-and-forget)
      if (restrictedUsers && restrictedUsers.length > 0) {
        createNotificationsForNewRestrictedUsers(
          {
            id: match.id,
            venue_name: match.venue_name,
            match_date: updateData.match_date || match.match_date,
          },
          match.restricted_users,
          restrictedUsers,
          userId
        );
      }

      toast.success("Match updated successfully!");
      onUpdate();
      onOpenChange(false);
      navigate('/community', {
        state: {
          refetchData: true,
          selectMatchId: match.id,
        }
      });
    } catch (error: any) {
      console.error('Error updating match:', error);
      toast.error(error.message || "Failed to update match");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
          <DialogDescription>
            Update match details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* URL or Timing display */}
          {hasUrl ? (
            // Match has URL — show date/time read-only
            <div className="space-y-2">
              <Label className="text-sm font-medium">Match Info</Label>
              <div className="rounded-lg border p-3 bg-muted/30 space-y-1">
                {match.match_date && (
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {format(new Date(match.match_date), "EEEE d MMMM yyyy")}
                    {match.match_time && (
                      <span className="ml-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        {match.match_time}
                      </span>
                    )}
                  </div>
                )}
                {(match.venue_name || match.location) && (
                  <p className="text-sm text-muted-foreground">
                    {match.venue_name}{match.location ? ` — ${match.location}` : ''}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Match has no URL — show URL input + date/time pickers
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-url">Match URL (optional)</Label>
                <Input
                  id="edit-url"
                  type="url"
                  placeholder="https://app.playtomic.io/t/1Axkqx4B"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={saving}
                />
                <p className="text-sm text-muted-foreground">
                  Enter a Playtomic URL to import match details automatically.
                </p>
              </div>

              {!url.trim() && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={saving}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {matchDate
                            ? format(parse(matchDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={matchDate ? parse(matchDate, "yyyy-MM-dd", new Date()) : undefined}
                          onSelect={(date) => {
                            if (date) setMatchDate(format(date, "yyyy-MM-dd"));
                          }}
                          locale={nl}
                          weekStartsOn={1}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-time">Start Time</Label>
                    <Select value={matchTime} onValueChange={setMatchTime} disabled={saving}>
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
            </>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="edit-message">Message {!hasUrl ? '*' : '(optional)'}</Label>
            <Textarea
              id="edit-message"
              placeholder="Add a message for this match..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={saving}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Publish to Favorites Only — hidden when ranked groups are selected */}
          {!selectedGroups.some(gId => groups.find(g => g.id === gId)?.group_type === 'Ranked') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="edit-favorites-toggle">Publish to favorites only</Label>
                <p className="text-sm text-muted-foreground">
                  Only selected favorites will be able to see this match
                </p>
              </div>
              <Switch
                id="edit-favorites-toggle"
                checked={publishToFavoritesOnly}
                onCheckedChange={(checked) => {
                  setPublishToFavoritesOnly(checked);
                  if (!checked) {
                    setSelectedGroups(groups.map(g => g.id));
                  }
                }}
                disabled={saving}
              />
            </div>

            {publishToFavoritesOnly && (
              <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                {/* Section A: Current restricted users (non-removable) */}
                {selectedFavorites.length > 0 && (
                  <>
                    <Label className="text-sm font-medium">Players in this match:</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {/* Show favorites that are selected */}
                      {favoriteUsers.filter(f => selectedFavorites.includes(f.id)).map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-2 rounded-md bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            {user.club_name && (
                              <p className="text-xs text-muted-foreground truncate">{user.club_name}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Show restricted-only users (not in favorites) */}
                      {restrictedOnlyUsers.filter(u => selectedFavorites.includes(u.id)).map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-2 rounded-md bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            {user.club_name && (
                              <p className="text-xs text-muted-foreground truncate">{user.club_name}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Section B: Add from favorites (not yet in the list) */}
                {favoriteUsers.filter(f => !selectedFavorites.includes(f.id)).length > 0 && (
                  <div className="border-t pt-3 mt-1 space-y-2">
                    <Label className="text-sm font-medium">Add from favorites:</Label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {favoriteUsers.filter(f => !selectedFavorites.includes(f.id)).map((favorite) => (
                        <div key={favorite.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={favorite.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/10">
                                {favorite.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{favorite.name}</p>
                              {favorite.club_name && (
                                <p className="text-xs text-muted-foreground truncate">{favorite.club_name}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFavorites(prev => [...prev, favorite.id])}
                            className="h-7 text-xs"
                            disabled={saving}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section C: Search for players by name */}
                <div className="border-t pt-3 mt-1 space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search for a player to add
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      className="pl-8 text-sm"
                      disabled={saving}
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
                            disabled={saving}
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
          )}

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
                      disabled={saving}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Selection — hidden when publishing to favorites only */}
          {!publishToFavoritesOnly && groups.length > 0 && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <Label className="text-sm font-medium">Publish to groups:</Label>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <Badge
                    key={group.id}
                    variant={selectedGroups.includes(group.id) ? "default" : "outline"}
                    className="cursor-pointer text-sm px-3 py-1.5"
                    onClick={() => !saving && handleToggleGroup(group.id)}
                  >
                    {group.name}
                    {selectedGroups.includes(group.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              {selectedGroups.length === 0 && (
                <p className="text-sm text-destructive">Match must belong to at least one group</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMatchDialog;
