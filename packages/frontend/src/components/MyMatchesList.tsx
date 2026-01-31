import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Users, MapPin, Heart, Trophy } from "lucide-react";
import { createFreshSupabaseClient, getUserIdFromStorage } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MyMatchesListProps {
  currentUserId: string | null;
  selectedMatchId: string | null;
  onMatchClick: (matchId: string) => void;
  refreshTrigger?: number;
}

const MyMatchesList = ({ currentUserId, selectedMatchId, onMatchClick, refreshTrigger }: MyMatchesListProps) => {
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});

  // Auto-switch to past view when selectedMatchId is a past match
  useEffect(() => {
    if (!selectedMatchId || !currentUserId || showPast) return;

    const checkIfPastMatch = async () => {
      const userId = currentUserId || getUserIdFromStorage();
      if (!userId) return;

      try {
        const client = createFreshSupabaseClient();
        const { data, error } = await (client as any)
          .from('matches')
          .select('id, match_date, created_by, match_participants (id, player_profile_id, added_by_profile_id)')
          .eq('id', selectedMatchId)
          .single();

        if (error || !data) return;

        // Check if user is a participant
        const isParticipant = data.match_participants?.some(
          (p: any) => p.player_profile_id === userId || p.added_by_profile_id === userId
        );

        // If user is a participant and match is in the past, switch to past view
        if (isParticipant && data.match_date && new Date(data.match_date) < new Date()) {
          setShowPast(true);
        }
      } catch (err) {
        console.error('Error checking match date:', err);
      }
    };

    checkIfPastMatch();
  }, [selectedMatchId, currentUserId]);

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
            match_time,
            duration,
            venue_name,
            city,
            location,
            total_spots,
            created_by,
            group_ids,
            restricted_users,
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

        // Filter to only include matches where user is a participant
        const userMatches = (data || []).filter((match: any) => {
          return match.match_participants?.some(
            (p: any) => p.player_profile_id === userId || p.added_by_profile_id === userId
          );
        });

        // Limit to 10 matches
        const limited = userMatches.slice(0, 10);
        setMyMatches(limited);

        // Fetch group names for matches that have group_ids and no restricted_users
        const allGroupIds = new Set<string>();
        limited.forEach((match: any) => {
          const hasRestricted = match.restricted_users && match.restricted_users.length > 0;
          if (!hasRestricted && match.group_ids?.length > 0) {
            match.group_ids.forEach((gid: string) => allGroupIds.add(gid));
          }
        });
        if (allGroupIds.size > 0) {
          const { data: groups } = await client
            .from('groups')
            .select('id, name')
            .in('id', Array.from(allGroupIds));
          if (groups) {
            const nameMap: Record<string, string> = {};
            groups.forEach((g: any) => { nameMap[g.id] = g.name; });
            setGroupNames(nameMap);
          }
        }
      } catch (error) {
        console.error('Error in fetchMyMatches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyMatches();
  }, [currentUserId, showPast, refreshTrigger]);

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
                    {(() => {
                      const dateStr = match.match_date;
                      const timeStr = match.match_time ? match.match_time.substring(0, 5) : null;
                      const startDate = dateStr.includes("T")
                        ? new Date(dateStr)
                        : timeStr
                          ? new Date(`${dateStr}T${timeStr}:00`)
                          : new Date(dateStr);
                      const hasTime = dateStr.includes("T") || !!timeStr;
                      return hasTime
                        ? format(startDate, "EEE d MMM, HH:mm")
                        : format(startDate, "EEE d MMM");
                    })()}
                  </div>
                )}

                {/* Venue */}
                <div className="text-xs text-muted-foreground flex items-center">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {match.venue_name || match.location || match.city || "Padel Match"}
                  </span>
                </div>

                {/* Players count and match type indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {match.match_participants?.length || 0}/{match.total_spots || 4} players
                  </div>
                  {match.restricted_users && match.restricted_users.length > 0 ? (
                    <Heart className="h-3 w-3 text-red-500 fill-red-500 flex-shrink-0" />
                  ) : match.group_ids?.length > 0 ? (
                    <div className="flex items-center text-xs text-muted-foreground truncate ml-2">
                      <Trophy className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {match.group_ids.map((gid: string) => groupNames[gid]).filter(Boolean).join(', ') || ''}
                      </span>
                    </div>
                  ) : null}
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
