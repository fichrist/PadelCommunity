import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const CreateMatch = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRanking, setUserRanking] = useState<string | null>(null);

  // Fetch user's ranking on mount
  useEffect(() => {
    const fetchUserRanking = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('ranking')
          .eq('id', user.id)
          .single();

        if (profile?.ranking) {
          setUserRanking(profile.ranking);
        }
      }
    };

    fetchUserRanking();
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

      // Get match levels based on user's ranking
      const matchLevels = getAvailableRankingLevels(userRanking) as Array<"beginner" | "intermediate" | "advanced" | "professional" | "p50-p100" | "p100-p200" | "p200-p300" | "p300-p400" | "p400-p500" | "p500-p700" | "p700-p1000" | "p1000+">;

      // Create the match first
      const { data: matchData, error: insertError } = await supabase
        .from('matches')
        .insert({
          url: url.trim(),
          match_levels: matchLevels,
          created_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Match created! Fetching details...");

      // Try to fetch match details from the URL in the background
      // This won't block the user experience if it fails
      if (matchData) {
        fetchPlaytomicMatchDetails(url.trim())
          .then(async (details) => {
            if (details && details.data) {
              const matchDetails = details.data;

              console.log('Fetched match details:', matchDetails);

              // Update the match with fetched details
              const { error: updateError } = await supabase
                .from('matches')
                .update({
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
                  status: 'confirmed'
                })
                .eq('id', matchData.id);

              if (updateError) {
                console.error('Error updating match:', updateError);
                // Even if match update fails, still try to update status
                await supabase
                  .from('matches')
                  .update({ status: 'confirmed' })
                  .eq('id', matchData.id);
              } else {
                console.log('Match details updated successfully');
              }

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
                  added_by_profile_id: user.id
                }));

                const { error: participantsError } = await supabase
                  .from('match_participants')
                  .insert(participantsToInsert);

                if (participantsError) {
                  console.error('Error inserting participants:', participantsError);
                } else {
                  console.log(`${matchDetails.participants.length} participants inserted successfully`);
                  toast.success(`Match details and ${matchDetails.participants.length} participants saved!`);
                }
              } else {
                toast.success("Match details updated successfully!");
              }
            } else {
              console.log('No match details returned from scraper, updating status anyway');
              // If scraper didn't return details, still update status to confirmed
              await supabase
                .from('matches')
                .update({ status: 'confirmed' })
                .eq('id', matchData.id);
            }
          })
          .catch(async (err) => {
            console.error('Error updating match details:', err);
            // Even if there's an error, update status to confirmed so the loading indicator disappears
            await supabase
              .from('matches')
              .update({ status: 'confirmed' })
              .eq('id', matchData.id);
          });
      }

      navigate('/events'); // Or navigate to a matches list page when available
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
