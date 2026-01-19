import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, MapPin, Trophy, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { getAvailableRankingLevels } from "@/hooks";
import { Input } from "@/components/ui/input";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userRanking, setUserRanking] = useState<string | null>(null);

  // Location filters (always enabled)
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLatitude, setLocationLatitude] = useState<number | null>(null);
  const [locationLongitude, setLocationLongitude] = useState<number | null>(null);
  const [locationRadiusKm, setLocationRadiusKm] = useState(50);
  const [selectedPlaceData, setSelectedPlaceData] = useState<any>(null);

  // Ranking filters (always enabled)
  const [rankingLevels, setRankingLevels] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);

  useEffect(() => {
    fetchUserData();
    fetchNotificationFilters();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('ranking, formatted_address, latitude, longitude')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserRanking(profile.ranking);
          const levels = getAvailableRankingLevels(profile.ranking);
          setAvailableLevels(levels);

          // Set default location from profile if not already set
          if (!locationAddress && profile.formatted_address) {
            setLocationAddress(profile.formatted_address);
            setLocationLatitude(profile.latitude);
            setLocationLongitude(profile.longitude);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    }
  };

  const fetchNotificationFilters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: filters } = await supabase
        .from('notification_match_filters')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (filters) {
        setLocationAddress(filters.location_address || "");
        setLocationLatitude(filters.location_latitude);
        setLocationLongitude(filters.location_longitude);
        setLocationRadiusKm(filters.location_radius_km || 50);

        setRankingLevels(filters.ranking_levels || []);
      } else {
        // Set defaults based on user profile
        const levels = getAvailableRankingLevels(userRanking);
        setRankingLevels(levels);
      }
    } catch (error) {
      console.error("Error fetching notification filters:", error);
      toast.error("Failed to load notification settings");
    }
  };

  const handlePlaceSelected = (place: any) => {
    setSelectedPlaceData(place);

    // Extract coordinates immediately
    if (place.geometry?.location) {
      const lat = typeof place.geometry.location.lat === 'function'
        ? place.geometry.location.lat()
        : place.geometry.location.lat;
      const lng = typeof place.geometry.location.lng === 'function'
        ? place.geometry.location.lng()
        : place.geometry.location.lng;

      setLocationLatitude(lat);
      setLocationLongitude(lng);
    }
  };

  const handleToggleRankingLevel = (level: string) => {
    setRankingLevels(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      // Prepare filter data (filters are always enabled)
      const filterData = {
        user_id: user.id,
        location_enabled: true,
        location_address: selectedPlaceData?.formatted_address || locationAddress,
        location_latitude: locationLatitude,
        location_longitude: locationLongitude,
        location_radius_km: locationRadiusKm,
        ranking_enabled: true,
        ranking_levels: rankingLevels,
        updated_at: new Date().toISOString(),
      };

      // Upsert (insert or update)
      const { error } = await supabase
        .from('notification_match_filters')
        .upsert(filterData, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Notification settings saved!");
      navigate('/events');
    } catch (error: any) {
      console.error("Error saving notification filters:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-[57px] z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/events')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Events</span>
              </Button>
            </div>
            <h1 className="text-xl font-bold text-foreground font-comfortaa">Notification Settings</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Match Notifications */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Match Notifications</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Configure your preferences for match notifications. You'll only receive notifications for matches that meet both location and ranking criteria.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <Label className="text-base font-semibold">Location</Label>
                </div>
                <div className="pl-6 space-y-4">
                  <div>
                    <Label htmlFor="location">Address</Label>
                    <LocationAutocomplete
                      value={locationAddress}
                      onChange={setLocationAddress}
                      onPlaceSelected={handlePlaceSelected}
                      placeholder="Enter your location..."
                      className="bg-background/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="radius">Radius (km)</Label>
                    <Input
                      id="radius"
                      type="number"
                      min="1"
                      max="500"
                      value={locationRadiusKm}
                      onChange={(e) => setLocationRadiusKm(parseInt(e.target.value) || 50)}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Ranking Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Trophy className="h-4 w-4 text-primary" />
                  <Label className="text-base font-semibold">Ranking Levels</Label>
                </div>
                <div className="pl-6">
                  <p className="text-xs text-muted-foreground mb-3">
                    Select the ranking levels you want to receive notifications for
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableLevels.map(level => (
                      <Badge
                        key={level}
                        variant={rankingLevels.includes(level) ? "default" : "outline"}
                        className="capitalize cursor-pointer text-sm px-3 py-1.5"
                        onClick={() => handleToggleRankingLevel(level)}
                      >
                        {level}
                        {rankingLevels.includes(level) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {rankingLevels.length === 0 && (
                    <p className="text-xs text-destructive mt-2">
                      Please select at least one ranking level
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
            <Button
              className="min-w-32"
              onClick={handleSave}
              disabled={loading || rankingLevels.length === 0}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationSettings;
