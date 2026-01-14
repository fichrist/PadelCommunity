import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Loader2, Search, User } from "lucide-react";
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
  const [userId, setUserId] = useState("");
  const [isScrapingRanking, setIsScrapingRanking] = useState(false);
  const [isScrapingAllMembers, setIsScrapingAllMembers] = useState(false);
  const [firstName, setFirstName] = useState("Filip");
  const [lastName, setLastName] = useState("Christiaens");
  const [isLookingForRanking, setIsLookingForRanking] = useState(false);
  const [searchResults, setSearchResults] = useState<PlayerResult[]>([]);

  const handleScrapeRanking = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a Tennis & Padel Vlaanderen user ID");
      return;
    }

    setIsScrapingRanking(true);

    try {
      // Call the backend function to scrape the ranking
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/scrape-tennis-padel-ranking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to scrape ranking');
      }

      const data = await response.json();

      // Update the current user's profile with the ranking
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in");
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ranking: data.ranking,
          tp_membership_number: userId.trim()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success(`Ranking ${data.ranking} and membership number saved successfully!`);
      setUserId("");
    } catch (error: any) {
      console.error('Error scraping ranking:', error);
      toast.error(error.message || "Failed to scrape ranking");
    } finally {
      setIsScrapingRanking(false);
    }
  };

  const handleScrapeAllMembers = async () => {
    setIsScrapingAllMembers(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/scrape-all-tp-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scrape members');
      }

      const data = await response.json();

      if (data.success) {
        toast.success(`Successfully scraped ${data.data.membersFound} members! ${data.data.errorsCount} errors encountered.`);
      } else {
        throw new Error('Scraping failed');
      }
    } catch (error: any) {
      console.error('Error scraping all members:', error);
      toast.error(error.message || "Failed to scrape all members");
    } finally {
      setIsScrapingAllMembers(false);
    }
  };

  const handleLookForTPRanking = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter both first name and last name");
      return;
    }

    setIsLookingForRanking(true);
    setSearchResults([]);

    try {
      const azureFunctionUrl = import.meta.env.VITE_AZURE_FUNCTION_URL || 'http://localhost:7071';
      const response = await fetch(`${azureFunctionUrl}/api/lookForTpRanking`, {
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

      const players = data.data.players as PlayerResult[];

      if (players.length === 0) {
        toast.info("No players found with that name");
      } else {
        setSearchResults(players);
        toast.success(`Found ${players.length} player(s)`);
      }
    } catch (error: any) {
      console.error('Error looking for TP ranking:', error);
      toast.error(error.message || "Failed to look up ranking");
    } finally {
      setIsLookingForRanking(false);
    }
  };

  const handleSelectPlayer = (player: PlayerResult) => {
    setUserId(player.userId);
    toast.success(`Selected ${player.name} (${player.ranking || 'No ranking'})`);
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

        {/* Ranking Scraper Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tennis & Padel Vlaanderen Ranking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Membership Number</Label>
              <Input
                id="userId"
                type="text"
                placeholder="e.g., 295478"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isScrapingRanking}
              />
              <p className="text-sm text-muted-foreground">
                Enter your Tennis & Padel Vlaanderen membership number to fetch and save your ranking
              </p>
            </div>

            <Button
              onClick={handleScrapeRanking}
              disabled={isScrapingRanking || !userId.trim()}
              className="w-full"
            >
              {isScrapingRanking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Ranking...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Fetch & Save Ranking
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Scrape All TP Members Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Scrape All TP Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scrape member data for Tennis & Padel Vlaanderen user ID 8000 and store in the database
            </p>

            <Button
              onClick={handleScrapeAllMembers}
              disabled={isScrapingAllMembers}
              className="w-full"
              variant="secondary"
            >
              {isScrapingAllMembers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping Members...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Scrape All TP Members
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Look For TP Ranking Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Look For TP Ranking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="e.g., Filip"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLookingForRanking}
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
                disabled={isLookingForRanking}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Search for a player on Tennis & Padel Vlaanderen and save their ranking to your profile
            </p>

            <Button
              onClick={handleLookForTPRanking}
              disabled={isLookingForRanking || !firstName.trim() || !lastName.trim()}
              className="w-full"
              variant="secondary"
            >
              {isLookingForRanking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking For Ranking...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Look For TP Ranking
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
                      className="p-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
