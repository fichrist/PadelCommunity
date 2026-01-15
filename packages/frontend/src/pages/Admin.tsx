import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Search, User, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PlayerResult {
  name: string;
  ranking: string | null;
  club: string | null;
  userId: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLookingForRanking, setIsLookingForRanking] = useState(false);
  const [searchResults, setSearchResults] = useState<PlayerResult[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLookForTPRanking = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter both first name and last name");
      return;
    }

    setIsLookingForRanking(true);
    setSearchResults([]);
    setSelectedPlayer(null);

    try {
      const azureFunctionUrl = import.meta.env.VITE_AZURE_FUNCTION_URL || 'http://localhost:7071';
      const response = await fetch(`${azureFunctionUrl}/api/lookForTpPlayers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to look up ranking');
      }

      if (!data.data || !data.data.players) {
        throw new Error('Invalid response from server');
      }

      const players = data.data.players as PlayerResult[];

      if (players.length === 0) {
        toast.info("No players found with that name");
      } else {
        setSearchResults(players);
        toast.success(`Found ${players.length} player(s)`);
      }
    } catch (error: any) {
      console.error('Error looking for TP ranking:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Network error: Could not reach the Azure Function.");
      } else {
        toast.error(error.message || "Failed to look up ranking");
      }
    } finally {
      setIsLookingForRanking(false);
    }
  };

  const handleSelectPlayer = (player: PlayerResult) => {
    setSelectedPlayer(player);
    toast.success(`Selected ${player.name} (${player.ranking || 'No ranking'})`);
  };

  const handleSaveRanking = async () => {
    if (!selectedPlayer) {
      toast.error("Please select a player first");
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in");
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ranking: selectedPlayer.ranking,
          tp_membership_number: selectedPlayer.userId,
          tp_user_id: parseInt(selectedPlayer.userId),
        } as any)
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success(`Ranking ${selectedPlayer.ranking || 'N/A'} saved successfully!`);
      setSelectedPlayer(null);
      setSearchResults([]);
      setFirstName("");
      setLastName("");
    } catch (error: any) {
      console.error('Error saving ranking:', error);
      toast.error(error.message || "Failed to save ranking");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
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
          <h1 className="text-2xl font-bold">Admin</h1>
        </div>

        {/* Look For TP Ranking Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tennis & Padel Vlaanderen Ranking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="e.g., Filip"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLookingForRanking || isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="e.g., Christiaens"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLookingForRanking || isSaving}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Search for a player on Tennis & Padel Vlaanderen and save their ranking to your profile
            </p>

            <Button
              onClick={handleLookForTPRanking}
              disabled={isLookingForRanking || isSaving || !firstName.trim() || !lastName.trim()}
              className="w-full"
            >
              {isLookingForRanking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search for Player
                </>
              )}
            </Button>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Search Results</Label>
                <div className="border rounded-md divide-y">
                  {searchResults.map((player) => (
                    <div
                      key={player.userId}
                      className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                        selectedPlayer?.userId === player.userId
                          ? 'bg-primary/10'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectPlayer(player)}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{player.name}</p>
                          {player.club && (
                            <p className="text-sm text-muted-foreground">{player.club}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {player.ranking ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {player.ranking}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No ranking</span>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">ID: {player.userId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPlayer && (
              <Button
                onClick={handleSaveRanking}
                disabled={isSaving}
                className="w-full"
                variant="default"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save {selectedPlayer.name}'s Ranking ({selectedPlayer.ranking || 'N/A'})
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
