import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase, getUserIdFromStorage, createFreshSupabaseClient, setFilteredGroupsCache } from "@/integrations/supabase/client";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { updateProfile } from "@/lib/profiles";

interface TPMemberSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveComplete: () => void;
}

const TPMemberSetupDialog = ({ open, onOpenChange, onSaveComplete }: TPMemberSetupDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lookingForTPMember, setLookingForTPMember] = useState(false);
  const [tpPlayers, setTpPlayers] = useState<Array<{ name: string; ranking: string | null; club: string | null; userId: string }>>([]);
  const [selectedTPPlayer, setSelectedTPPlayer] = useState<string>("");
  const [selectedPlayerData, setSelectedPlayerData] = useState<{ ranking: string | null; userId: string; club: string | null } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLookForTPMember = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter both first name and last name");
      return;
    }

    setLookingForTPMember(true);
    setTpPlayers([]);
    setSelectedTPPlayer("");
    setSelectedPlayerData(null);

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
        throw new Error(data.error || 'Failed to look up TP members');
      }

      if (data.data.players && data.data.players.length > 0) {
        setTpPlayers(data.data.players);
        toast.success(`Found ${data.data.players.length} player(s)`);

        // Auto-select if only one player found
        if (data.data.players.length === 1) {
          const player = data.data.players[0];
          setSelectedTPPlayer(player.userId);
          setSelectedPlayerData({
            ranking: player.ranking,
            userId: player.userId,
            club: player.club
          });
        }
      } else {
        toast.info('No players found with that name');
      }
    } catch (error: any) {
      console.error('Error looking for TP members:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Network error: Could not reach the Azure Function.");
      } else {
        toast.error(error.message || "Failed to look up TP members");
      }
    } finally {
      setLookingForTPMember(false);
    }
  };

  const handlePlayerSelection = (value: string) => {
    setSelectedTPPlayer(value);
    const selectedPlayer = tpPlayers.find(p => p.userId === value);

    if (selectedPlayer) {
      setSelectedPlayerData({
        ranking: selectedPlayer.ranking,
        userId: selectedPlayer.userId,
        club: selectedPlayer.club
      });
    } else {
      setSelectedPlayerData(null);
    }
  };

  const handleSave = async () => {
    if (!selectedPlayerData) {
      toast.error("Please select a player from the results");
      return;
    }

    if (!address.trim() || !addressCoords) {
      toast.error("Please enter your address to filter matches in your neighbourhood");
      return;
    }

    setSaving(true);

    try {
      // Check if this TP user ID is already linked to another profile
      const tpUserId = parseInt(selectedPlayerData.userId);
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('tp_user_id', tpUserId)
        .single();

      // Get user ID synchronously from localStorage (never hangs)
      const currentUserId = getUserIdFromStorage();
      if (existingProfile && existingProfile.id !== currentUserId) {
        toast.error("This Tennis & Padel Vlaanderen account is already linked to another profile.");
        setSaving(false);
        return;
      }

      const updates: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        ranking: selectedPlayerData.ranking,
        tp_membership_number: selectedPlayerData.userId,
        tp_user_id: parseInt(selectedPlayerData.userId),
        club_name: selectedPlayerData.club,
        formatted_address: address.trim(),
        latitude: addressCoords.lat,
        longitude: addressCoords.lng,
        filtered_address: address.trim(),
        filtered_latitude: addressCoords.lat,
        filtered_longitude: addressCoords.lng,
      };

      if (phoneNumber.trim()) {
        updates.phone_number = phoneNumber.trim();
      }

      const success = await updateProfile(updates);

      if (!success) {
        throw new Error("Failed to update profile");
      }

      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();

      if (!userId) {
        throw new Error("You must be logged in");
      }

      // Fetch all groups
      const { data: allGroups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, group_type, ranking_level');

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
      }

      // Get applicable ranking levels based on user's ranking
      const { getAvailableRankingLevels: getRankingLevels } = await import('@/hooks');
      const rankingLevels = getRankingLevels(selectedPlayerData.ranking);

      // Build list of group IDs to include in notifications:
      // 1. All General groups
      // 2. Ranked groups that match the user's applicable ranking levels
      const groupIds: string[] = [];

      if (allGroups) {
        for (const group of allGroups) {
          if (group.group_type === 'General') {
            // Include all general groups
            groupIds.push(group.id);
          } else if (group.group_type === 'Ranked' && group.ranking_level) {
            // Include ranked groups that match user's applicable levels
            if (rankingLevels.includes(group.ranking_level)) {
              groupIds.push(group.id);
            }
          }
        }
      }

      // Save filtered_groups on the profile to match allowed groups
      await updateProfile({ filtered_groups: groupIds });

      // Update the cache for faster loading on community page
      setFilteredGroupsCache({
        filtered_groups: groupIds,
        filtered_address: address.trim(),
        filtered_latitude: addressCoords.lat,
        filtered_longitude: addressCoords.lng,
        filtered_radius_km: 30,
      });

      // Create or update notification match filter with address and 30km radius
      const notifClient = createFreshSupabaseClient();
      const { error: filterError } = await (notifClient as any)
        .from('notification_match_filters')
        .upsert({
          user_id: userId,
          location_address: address.trim(),
          location_latitude: addressCoords.lat,
          location_longitude: addressCoords.lng,
          location_radius_km: 30,
          group_ids: groupIds,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (filterError) {
        console.error('Error saving notification filter:', filterError);
        // Don't fail the whole operation if filter save fails
      }

      toast.success("Profile setup complete!");
      onSaveComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const canLookup = firstName.trim() && lastName.trim();
  const canSave = selectedPlayerData !== null && address.trim() && addressCoords !== null;

  // Handle interact outside - prevent closing when clicking on Google Places dropdown
  const handleInteractOutside = (event: Event) => {
    const target = event.target as HTMLElement;
    // Check if the click is on the Google Places autocomplete dropdown
    if (target.closest('.pac-container') || target.classList.contains('pac-item')) {
      event.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={handleInteractOutside}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Link your Tennis & Padel Vlaanderen account to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-firstName">First Name *</Label>
              <Input
                id="dialog-firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={lookingForTPMember || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-lastName">Last Name *</Label>
              <Input
                id="dialog-lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={lookingForTPMember || saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-address">Address *</Label>
            <LocationAutocomplete
              value={address}
              onChange={setAddress}
              onPlaceSelected={(place) => {
                if (place.geometry?.location) {
                  setAddressCoords({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                  });
                }
              }}
              placeholder="Enter your address"
            />
            <p className="text-xs text-muted-foreground">
              Your address will be used to filter matches within 30km of your location. You can adapt the filter afterwards.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-phone">Phone Number (optional)</Label>
            <Input
              id="dialog-phone"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={lookingForTPMember || saving}
            />
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLookForTPMember}
              disabled={!canLookup || lookingForTPMember || saving}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {lookingForTPMember ? "Searching..." : "Look for account on Tennis Padel Vlaanderen"}
            </Button>
          </div>

          {tpPlayers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="dialog-tpPlayerSelect">Select Your Account</Label>
              <Select value={selectedTPPlayer} onValueChange={handlePlayerSelection} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your account from the results" />
                </SelectTrigger>
                <SelectContent>
                  {tpPlayers.map((player) => {
                    const displayText = `${player.name}${player.club ? ` - ${player.club}` : ''} (${player.ranking || 'No ranking'})`;
                    return (
                      <SelectItem
                        key={player.userId}
                        value={player.userId}
                      >
                        {displayText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TPMemberSetupDialog;
