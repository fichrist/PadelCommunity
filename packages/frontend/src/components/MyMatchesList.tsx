import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Users, MapPin } from "lucide-react";
import { supabase, createFreshSupabaseClient, getUserIdFromStorage } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MyMatchesListProps {
  currentUserId: string | null;
  selectedMatchId: string | null;
  onMatchClick: (matchId: string) => void;
}

const MyMatchesList = ({ currentUserId, selectedMatchId, onMatchClick }: MyMatchesListProps) => {
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const fetchMyMatches = async () => {
      // Use currentUserId from auth hook, fall back to localStorage
      const userId = currentUserId || getUserIdFromStorage();
      if (!userId) {
        setMyMatches([]);
        return;
      }

      setIsLoading(true);
      try {
        // Use fresh client to avoid stuck state after inactivity
        const client = createFreshSupabaseClient();
        let query = (client as any)
          .from('matches')
          .select(`
            id,
            match_date,
            duration,
            venue_name,
            city,
            location,
            total_spots,
            created_by,
            group_ids,
            match_participants (
              id,
              player_profile_id,
              added_by_profile_id
            )
          `);

        // Filter by date based on toggle
        if (showPast) {
          query = query.lt('match_date', new Date().toISOString());
          query = query.order('match_date', { ascending: false }); // Most recent past matches first
        } else {
          query = query.gte('match_date', new Date().toISOString());
          query = query.order('match_date', { ascending: true }); // Earliest upcoming matches first
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching my matches:', error);
          return;
        }

        // Filter to only include matches where user is involved as organizer or participant
        const userMatches = (data || []).filter((match: any) => {
          const isOrganizer = match.created_by === userId;
          const isParticipant = match.match_participants?.some(
            (p: any) => p.player_profile_id === userId || p.added_by_profile_id === userId
          );
          return isOrganizer || isParticipant;
        });

        // Limit to 10 matches
        setMyMatches(userMatches.slice(0, 10));
      } catch (error) {
        console.error('Error in fetchMyMatches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyMatches();

    // Set up real-time subscription
    const subscription = supabase
      .channel('my-matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          fetchMyMatches();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants'
        },
        () => {
          fetchMyMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUserId, showPast]);

  if (!currentUserId) {
    return null;
  }

  return (
    <div className="w-[480px] p-4">
      <Card className="bg-card/90 backdrop-blur-sm border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Matches</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-past" className="text-xs text-muted-foreground cursor-pointer">
                Past
              </Label>
              <Switch
                id="show-past"
                checked={showPast}
                onCheckedChange={setShowPast}
                className="scale-75"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Loading...
            </div>
          ) : myMatches.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {showPast ? 'No past matches' : 'No upcoming matches'}
            </div>
          ) : (
            myMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => onMatchClick(match.id)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                  selectedMatchId === match.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                {/* Time */}
                {match.match_date && (
                  <div className="flex items-center text-sm font-medium">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(match.match_date), "EEE d MMM, HH:mm")}
                  </div>
                )}

                {/* Venue */}
                <div className="text-xs text-muted-foreground flex items-center">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {match.venue_name || match.location || match.city || "Padel Match"}
                  </span>
                </div>

                {/* Players count */}
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {match.match_participants?.length || 0}/{match.total_spots || 4} players
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyMatchesList;
