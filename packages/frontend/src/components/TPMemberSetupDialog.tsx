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
import { supabase } from "@/integrations/supabase/client";
import LocationAutocomplete from "@/components/LocationAutocomplete";

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
  const [tpPlayers, setTpPlayers] = useState<Array<{ info: string; ranking: string; userId: string | null }>>([]);
  const [selectedTPPlayer, setSelectedTPPlayer] = useState<string>("");
  const [selectedPlayerData, setSelectedPlayerData] = useState<{ ranking: string; userId: string } | null>(null);
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
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("You must be logged in");
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('Fetching from:', `${apiUrl}/api/look-for-tp-ranking`);
      console.log('Token length:', session.access_token?.length);

      const response = await fetch(`${apiUrl}/api/look-for-tp-ranking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('API response:', data);

      if (!response.ok || !data.success) {
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to look up TP members');
      }

      if (data.data.players && data.data.players.length > 0) {
        setTpPlayers(data.data.players);
        toast.success(`Found ${data.data.players.length} player(s)`);
      } else {
        toast.error('No players found with padel ranking');
      }
    } catch (error: any) {
      console.error('Error looking for TP members:', error);
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Network error: Could not reach the API server. Make sure the backend is running.");
      } else {
        toast.error(error.message || "Failed to look up TP members");
      }
    } finally {
      setLookingForTPMember(false);
    }
  };

  const handlePlayerSelection = (value: string) => {
    setSelectedTPPlayer(value);
    const selectedPlayer = tpPlayers.find(p => {
      const displayValue = p.userId
        ? `${p.info} - ID: ${p.userId}`
        : p.info;
      return displayValue === value;
    });

    if (selectedPlayer && selectedPlayer.userId) {
      setSelectedPlayerData({
        ranking: selectedPlayer.ranking,
        userId: selectedPlayer.userId
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

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in");
      }

      const updates: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        ranking: selectedPlayerData.ranking,
        tp_membership_number: selectedPlayerData.userId,
        tp_user_id: parseInt(selectedPlayerData.userId),
      };

      if (address.trim()) {
        updates.formatted_address = address.trim();
        if (addressCoords) {
          updates.latitude = addressCoords.lat;
          updates.longitude = addressCoords.lng;
        }
      }

      if (phoneNumber.trim()) {
        updates.phone_number = phoneNumber.trim();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

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
  const canSave = selectedPlayerData !== null;

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
            <Label htmlFor="dialog-address">Address (optional)</Label>
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
                  {tpPlayers.map((player, index) => {
                    const displayValue = player.userId
                      ? `${player.info} - ID: ${player.userId}`
                      : player.info;
                    return (
                      <SelectItem
                        key={index}
                        value={displayValue}
                      >
                        {displayValue}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selecting a profile will link your account
              </p>
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
