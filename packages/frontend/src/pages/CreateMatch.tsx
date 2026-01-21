import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { processMatchParticipants } from "@/lib/matchParticipants";
import { createMatchNotifications } from "@/lib/notifications";

// Helper function to get available ranking levels based on user's ranking
const getAvailableRankingLevels = (userRanking: string | null): string[] => {
  if (!userRanking) return [];

  // Extract numeric value from ranking (e.g., "P450" -> 450)
  const rankingMatch = userRanking.match(/P?(\d+)/i);
  if (!rankingMatch) return [];

  const rankingValue = parseInt(rankingMatch[1]);

  const allLevels = [
    { value: 'p50-p100', min: 50, max: 100 },
    { value: 'p100-p200', min: 100, max: 200 },
    { value: 'p200-p300', min: 200, max: 300 },
    { value: 'p300-p400', min: 300, max: 400 },
    { value: 'p400-p500', min: 400, max: 500 },
    { value: 'p500-p700', min: 500, max: 700 },
    { value: 'p700-p1000', min: 700, max: 1000 },
    { value: 'p1000+', min: 1000, max: Infinity }
  ];

  // Filter levels that include the user's ranking
  return allLevels
    .filter(level => rankingValue >= level.min && rankingValue <= level.max)
    .map(level => level.value);
};

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
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRanking, setUserRanking] = useState<string | null>(null);
  const [publishToFavoritesOnly, setPublishToFavoritesOnly] = useState(false);
  const [favoriteUsers, setFavoriteUsers] = useState<FavoriteUser[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);

  // Fetch user's ranking and favorites on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch ranking
        const { data: profile } = await supabase
          .from('profiles')
          .select('ranking, favorite_users')
          .eq('id', user.id)
          .single();

        if (profile?.ranking) {
          setUserRanking(profile.ranking);
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
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a match URL");
      return;
    }

    if (!userRanking) {
      toast.error("Unable to determine your ranking. Please update your profile.");
      return;
    }

    if (publishToFavoritesOnly && selectedFavorites.length === 0) {
      toast.error("Please select at least one favorite to publish to");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to create a match");
        navigate('/');
        return;
      }

      // Determine group_ids based on user ranking
      const groupIds: string[] = [];

      // Always add the General group
      const { data: generalGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('group_type', 'General')
        .single();

      if (generalGroup) {
        groupIds.push(generalGroup.id);
      }

      // Add ranked groups based on match_levels
      if (userRanking) {
        const rankingMatch = userRanking.match(/P?(\d+)/i);
        if (rankingMatch) {
          const rankingValue = parseInt(rankingMatch[1]);

          const allLevels = [
            { value: 'p50-p100', min: 50, max: 100 },
            { value: 'p100-p200', min: 100, max: 200 },
            { value: 'p200-p300', min: 200, max: 300 },
            { value: 'p300-p400', min: 300, max: 400 },
            { value: 'p400-p500', min: 400, max: 500 },
            { value: 'p500-p700', min: 500, max: 700 },
            { value: 'p700-p1000', min: 700, max: 1000 },
            { value: 'p1000+', min: 1000, max: Infinity }
          ];

          // Get all ranking levels that match the user's ranking
          const matchingLevels = allLevels
            .filter(level => rankingValue >= level.min && rankingValue <= level.max)
            .map(level => level.value);

          // Fetch all groups that match these ranking levels
          if (matchingLevels.length > 0) {
            const { data: rankedGroups } = await supabase
              .from('groups')
              .select('id')
              .in('ranking_level', matchingLevels);

            if (rankedGroups && rankedGroups.length > 0) {
              rankedGroups.forEach(group => groupIds.push(group.id));
            }
          }
        }
      }

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

      // Get match levels based on user's ranking
      const matchLevels = getAvailableRankingLevels(userRanking) as Array<"beginner" | "intermediate" | "advanced" | "professional" | "p50-p100" | "p100-p200" | "p200-p300" | "p300-p400" | "p400-p500" | "p500-p700" | "p700-p1000" | "p1000+">;

      // Prepare restricted_users array if publish to favorites only
      let restrictedUsers: string[] | null = null;
      if (publishToFavoritesOnly && selectedFavorites.length > 0) {
        // Include selected favorites and the organizer
        restrictedUsers = [...selectedFavorites, user.id];
      }

      // Now create the match with all the scraped data
      const { data: matchData, error: insertError } = await supabase
        .from('matches')
        .insert({
          url: url.trim(),
          match_levels: matchLevels,
          group_ids: groupIds,
          created_by: user.id,
          status: 'confirmed',
          restricted_users: restrictedUsers,
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
          match_levels: matchLevels,
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

      // Navigate to events page and trigger a refetch
      navigate('/events', { state: { refetchData: true } });
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
              {/* Match URL */}
              <div className="space-y-2">
                <Label htmlFor="url">Match URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://app.playtomic.io/t/1Axkqx4B"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter the Playtomic match URL. Details and match rankings will be set automatically based on your profile.
                </p>
              </div>

              {/* Publish to Favorites Only */}
              {favoriteUsers.length > 0 && (
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
                      </div>
                      {selectedFavorites.length === 0 && (
                        <p className="text-sm text-destructive">Please select at least one favorite</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
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
