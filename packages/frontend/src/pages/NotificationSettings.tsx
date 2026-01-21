import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, MapPin, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { Input } from "@/components/ui/input";

interface Group {
  id: string;
  name: string;
  group_type: 'General' | 'Ranked';
  ranking_level: string | null;
}

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Location filters (always enabled)
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLatitude, setLocationLatitude] = useState<number | null>(null);
  const [locationLongitude, setLocationLongitude] = useState<number | null>(null);
  const [locationRadiusKm, setLocationRadiusKm] = useState(50);
  const [selectedPlaceData, setSelectedPlaceData] = useState<any>(null);

  // Groups
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchUserData();
    fetchNotificationFilters();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('group_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Sort ranked groups by numeric value
      const sortedGroups = (data || []).sort((a, b) => {
        // General groups come first
        if (a.group_type === 'General' && b.group_type !== 'General') return -1;
        if (a.group_type !== 'General' && b.group_type === 'General') return 1;

        // For ranked groups, sort by the first number in the ranking level
        if (a.group_type === 'Ranked' && b.group_type === 'Ranked') {
          const getFirstNum = (level: string | null) => {
            if (!level) return 0;
            const match = level.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getFirstNum(a.ranking_level) - getFirstNum(b.ranking_level);
        }

        return 0;
      });

      setAllGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    }
  };

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

        // Use group_ids if available
        if (filters.group_ids && filters.group_ids.length > 0) {
          setSelectedGroupIds(filters.group_ids);
        }
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

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
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
        group_ids: selectedGroupIds,
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
      // Navigate to community page with first group selected
      const firstGroupId = allGroups.length > 0 ? allGroups[0].id : null;
      navigate('/community', { state: { selectGroupId: firstGroupId } });
    } catch (error: any) {
      console.error("Error saving notification filters:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const generalGroups = allGroups.filter(g => g.group_type === 'General');
  const rankedGroups = allGroups.filter(g => g.group_type === 'Ranked');

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
                onClick={() => {
                  const firstGroupId = allGroups.length > 0 ? allGroups[0].id : null;
                  navigate('/community', { state: { selectGroupId: firstGroupId } });
                }}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Community</span>
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
                Configure your preferences for match notifications. You'll only receive notifications for matches that meet both location and group criteria.
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

              {/* Groups Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-4 w-4 text-primary" />
                  <Label className="text-base font-semibold">Groups</Label>
                </div>
                <div className="pl-6 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Select the groups you want to receive notifications for
                  </p>

                  {/* General Groups */}
                  {generalGroups.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">General</Label>
                      <div className="flex flex-wrap gap-2">
                        {generalGroups.map(group => (
                          <Badge
                            key={group.id}
                            variant={selectedGroupIds.includes(group.id) ? "default" : "outline"}
                            className="cursor-pointer text-sm px-3 py-1.5"
                            onClick={() => handleToggleGroup(group.id)}
                          >
                            {group.name}
                            {selectedGroupIds.includes(group.id) && (
                              <X className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ranked Groups */}
                  {rankedGroups.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Ranked</Label>
                      <div className="flex flex-wrap gap-2">
                        {rankedGroups.map(group => (
                          <Badge
                            key={group.id}
                            variant={selectedGroupIds.includes(group.id) ? "default" : "outline"}
                            className="cursor-pointer text-sm px-3 py-1.5"
                            onClick={() => handleToggleGroup(group.id)}
                          >
                            {group.name}
                            {selectedGroupIds.includes(group.id) && (
                              <X className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedGroupIds.length === 0 && (
                    <p className="text-xs text-destructive mt-2">
                      Please select at least one group
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
              onClick={() => {
                const firstGroupId = allGroups.length > 0 ? allGroups[0].id : null;
                navigate('/community', { state: { selectGroupId: firstGroupId } });
              }}
            >
              Cancel
            </Button>
            <Button
              className="min-w-32"
              onClick={handleSave}
              disabled={loading || selectedGroupIds.length === 0}
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
