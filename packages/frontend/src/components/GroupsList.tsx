import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Filter, MapPin } from "lucide-react";
import { supabase, getUserIdFromStorage, createFreshSupabaseClient } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationAutocomplete from "@/components/LocationAutocomplete";

interface Group {
  id: string;
  name: string;
  description: string | null;
  group_type: 'General' | 'Ranked';
  ranking_level: string | null;
  created_at: string;
  member_count?: number;
}

interface GroupsListProps {
  onGroupSelect: (groupId: string) => void;
  selectedGroupId: string | null;
}

const GroupsList = ({ onGroupSelect, selectedGroupId }: GroupsListProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addressFilter, setAddressFilter] = useState('');
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusFilter, setRadiusFilter] = useState('30');
  const [selectedGroupFilters, setSelectedGroupFilters] = useState<string[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Array<{ id: string; allowed_groups: string[]; latitude: number | null; longitude: number | null }>>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('groups')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Fetch all profiles with location and allowed_groups data
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, allowed_groups, latitude, longitude');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          setMemberProfiles(profiles || []);
        }

        // Load current user's saved filters
        // Get user ID synchronously from localStorage (never hangs)
        const userId = getUserIdFromStorage();
        if (userId) {
          // Use fresh client to avoid stuck state
          const client = createFreshSupabaseClient();
          const { data: profile } = await client
            .from('profiles')
            .select('filtered_groups, filtered_address, filtered_latitude, filtered_longitude, filtered_radius_km')
            .eq('id', userId)
            .single();

          if (profile) {
            if (profile.filtered_groups && profile.filtered_groups.length > 0) {
              setSelectedGroupFilters(profile.filtered_groups);
            }
            if (profile.filtered_address) {
              setAddressFilter(profile.filtered_address);
              if (profile.filtered_latitude && profile.filtered_longitude) {
                setAddressCoords({
                  lat: profile.filtered_latitude,
                  lng: profile.filtered_longitude
                });
              }
            }
            if (profile.filtered_radius_km) {
              setRadiusFilter(profile.filtered_radius_km.toString());
            }
          }
        }

        // Fetch member count for each group
        const groupsWithMemberCount = await Promise.all(
          (data || []).map(async (group: Group) => {
            let count = 0;

            if (group.group_type === 'General') {
              // For General groups, count all profiles
              const { count: totalCount, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

              if (countError) {
                console.error('Error fetching total profile count:', countError);
              } else {
                count = totalCount || 0;
              }
            } else {
              // For Ranked groups, count profiles with this group_id in allowed_groups
              const { count: rankedCount, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .contains('allowed_groups', [group.id]);

              if (countError) {
                console.error('Error fetching member count:', countError);
              } else {
                count = rankedCount || 0;
              }
            }

            return { ...group, member_count: count };
          })
        );

        // Sort groups: General first, then Ranked by ranking level
        const sortedGroups = groupsWithMemberCount.sort((a: Group, b: Group) => {
          // General groups come first
          if (a.group_type === 'General' && b.group_type !== 'General') return -1;
          if (a.group_type !== 'General' && b.group_type === 'General') return 1;

          // Both are ranked groups, sort by ranking level
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

        setGroups(sortedGroups);

        // Ensure General group is always in selected filters if profile didn't have filters set
        if (userId) {
          const { data: profile } = await client
            .from('profiles')
            .select('filtered_groups')
            .eq('id', userId)
            .single();

          const generalGroup = sortedGroups.find(g => g.group_type === 'General');
          if (generalGroup && profile && (!profile.filtered_groups || profile.filtered_groups.length === 0)) {
            // If profile has no filtered_groups set, ensure General group is included
            setSelectedGroupFilters([generalGroup.id]);
          } else if (generalGroup && profile?.filtered_groups) {
            // Ensure General group is always included in the filters
            if (!profile.filtered_groups.includes(generalGroup.id)) {
              setSelectedGroupFilters([...profile.filtered_groups, generalGroup.id]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();

    const handleProfileUpdate = () => {
      fetchGroups();
    };
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter groups based on location and group selection
  const filteredGroups = useMemo(() => {
    return groups
      .filter(group => {
        // Only show groups that are in the user's filtered_groups
        if (selectedGroupFilters.length === 0) {
          return true; // If no filters set, show all groups
        }
        return selectedGroupFilters.includes(group.id);
      })
      .map(group => {
        let filteredMemberCount = group.member_count || 0;

        // Apply filters to count members
        if (addressCoords || selectedGroupFilters.length > 0) {
          // Get members for this group
          let groupMembers = memberProfiles;

          if (group.group_type === 'General') {
            // General groups include all profiles
            groupMembers = memberProfiles;
          } else {
            // Ranked groups only include profiles with this group in allowed_groups
            groupMembers = memberProfiles.filter(profile =>
              profile.allowed_groups?.includes(group.id)
            );
          }

          // Apply location filter
          if (addressCoords) {
            const radius = parseInt(radiusFilter);
            groupMembers = groupMembers.filter(profile => {
              if (!profile.latitude || !profile.longitude) return false;
              const distance = calculateDistance(
                addressCoords.lat,
                addressCoords.lng,
                profile.latitude,
                profile.longitude
              );
              return distance <= radius;
            });
          }

          // Apply group filter (check if members are in selected groups)
          if (selectedGroupFilters.length > 0) {
            groupMembers = groupMembers.filter(profile =>
              selectedGroupFilters.some(groupId =>
                profile.allowed_groups?.includes(groupId)
              )
            );
          }

          filteredMemberCount = groupMembers.length;
        }

        return {
          ...group,
          member_count: filteredMemberCount
        };
      });
  }, [groups, addressCoords, radiusFilter, selectedGroupFilters, memberProfiles]);

  const handleClearFilters = () => {
    setAddressFilter('');
    setAddressCoords(null);
    setRadiusFilter('30');

    // Keep the General group selected when clearing filters
    const generalGroup = groups.find(g => g.group_type === 'General');
    if (generalGroup) {
      setSelectedGroupFilters([generalGroup.id]);
    } else {
      setSelectedGroupFilters([]);
    }
  };

  const handleToggleGroupFilter = (groupId: string) => {
    setSelectedGroupFilters(prev => {
      if (prev.includes(groupId)) {
        // Check if this is the General group - if so, don't allow unchecking
        const group = groups.find(g => g.id === groupId);
        if (group?.group_type === 'General') {
          return prev; // Don't allow unchecking General group
        }
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleApplyFilters = async () => {
    // Save filters to profile
    try {
      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();
      if (!userId) return;

      const updates: any = {
        filtered_groups: selectedGroupFilters,
      };

      if (addressFilter && addressCoords) {
        updates.filtered_address = addressFilter;
        updates.filtered_latitude = addressCoords.lat;
        updates.filtered_longitude = addressCoords.lng;
        updates.filtered_radius_km = parseInt(radiusFilter);
      }

      // Use fresh client to avoid stuck state
      const client = createFreshSupabaseClient();
      const { error } = await client
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error saving filters:', error);
      }

      setFilterOpen(false);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const hasActiveFilters = addressFilter || selectedGroupFilters.length > 0;

  if (loading) {
    return (
      <div className="w-[480px] p-4">
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-[480px] p-6">
      <Card className="bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Groups
            </div>
            <Popover open={filterOpen} onOpenChange={() => {}}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFilterOpen(true)}
                  className={`h-8 w-8 ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80"
                align="end"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Filters</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Location</Label>
                    </div>
                    <LocationAutocomplete
                      value={addressFilter}
                      onChange={setAddressFilter}
                      onPlaceSelected={(place) => {
                        if (place.geometry?.location) {
                          setAddressCoords({
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                          });
                        }
                      }}
                      placeholder="Enter address..."
                    />
                    <Select value={radiusFilter} onValueChange={setRadiusFilter}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="20">20 km</SelectItem>
                        <SelectItem value="30">30 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Groups</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {groups.map((group) => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-filter-${group.id}`}
                            checked={selectedGroupFilters.includes(group.id)}
                            onCheckedChange={() => handleToggleGroupFilter(group.id)}
                            disabled={group.group_type === 'General'}
                          />
                          <label
                            htmlFor={`group-filter-${group.id}`}
                            className={`text-sm flex-1 ${group.group_type === 'General' ? 'cursor-default text-muted-foreground' : 'cursor-pointer'}`}
                          >
                            {group.name}
                            {group.group_type === 'General' && <span className="ml-1 text-xs">(mandatory)</span>}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OK Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handleApplyFilters}
                      className="w-full"
                      size="sm"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => onGroupSelect(group.id)}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedGroupId === group.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {group.group_type === 'General' ? (
                    <Users className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                  <h3 className="font-semibold text-base truncate">{group.name}</h3>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {group.member_count === 1 ? '1 member' : `${group.member_count || 0} members`}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupsList;
