import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Filter, Plus, Users, User, MessageCircle, MapPin, Tag, UserCheck, Star, Heart, Ban, Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

// Haversine formula to calculate distance between two lat/lng points in km
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const People = () => {
  const [selectedClub, setSelectedClub] = useState("");
  const [favoriteUsers, setFavoriteUsers] = useState<string[]>([]); // Store user IDs
  const [removeFavoriteDialogOpen, setRemoveFavoriteDialogOpen] = useState(false);
  const [userToRemoveFavorite, setUserToRemoveFavorite] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [people, setPeople] = useState<any[]>([]);
  const [allClubs, setAllClubs] = useState<string[]>([]);
  const [clubSearchOpen, setClubSearchOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const navigate = useNavigate();

  // Fetch current user and their favorites
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('favorite_users')
        .eq('id', user.id)
        .single();

      if (profile && profile.favorite_users) {
        setFavoriteUsers(profile.favorite_users);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch people from database
  useEffect(() => {
    const fetchPeople = async () => {
      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      if (!profiles) return;

      // Format people data
      const formattedPeople = profiles.map((profile: any) => {
        const name = profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
        const clubName = profile.club_name || 'No club';
        const ranking = profile.ranking || null;
        // Location shows only city and country
        const location = [profile.city, profile.country].filter(Boolean).join(', ') || 'Location not set';

        return {
          id: profile.id,
          name,
          role: clubName,
          ranking,
          bio: profile.bio || '',
          avatar: profile.avatar_url || '/placeholder-avatar.png',
          location,
          latitude: profile.latitude,
          longitude: profile.longitude,
          tags: [],
          isOnline: false
        };
      });

      setPeople(formattedPeople);

      // Extract unique club names for the filter dropdown
      const clubs = Array.from(new Set(formattedPeople.map(p => p.role).filter(club => club && club !== 'No club')));
      setAllClubs(clubs.sort());
    };

    fetchPeople();
  }, []);

  // Apply all filters
  let filteredPeople = people;

  // Filter by favorites only
  if (showFavoritesOnly) {
    filteredPeople = filteredPeople.filter(person => favoriteUsers.includes(person.id));
  }

  // Filter by club
  if (selectedClub) {
    filteredPeople = filteredPeople.filter(person => person.role === selectedClub);
  }

  // Filter by name search
  if (searchQuery.trim() !== "") {
    filteredPeople = filteredPeople.filter(person =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort users alphabetically by name (ascending)
  const sortedUsers = [...filteredPeople].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  // Save favorites to database
  const saveFavoritesToDB = async (newFavorites: string[]) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ favorite_users: newFavorites })
      .eq('id', currentUserId);

    if (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Add to favorites
  const addToFavorites = async (userId: string) => {
    const newFavorites = [...favoriteUsers, userId];
    setFavoriteUsers(newFavorites);
    await saveFavoritesToDB(newFavorites);
  };

  // Remove from favorites
  const removeFromFavorites = async (userId: string) => {
    const newFavorites = favoriteUsers.filter(id => id !== userId);
    setFavoriteUsers(newFavorites);
    await saveFavoritesToDB(newFavorites);
  };

  return (
    <TooltipProvider>
    <>
        {/* People Filters - Sticky */}
        <div className="bg-transparent sticky top-[57px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <h1 className="text-2xl font-bold text-foreground font-comfortaa">Players</h1>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-130px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 h-full">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-2 sticky top-0 h-[calc(100vh-130px)] overflow-y-auto">
              <div className="space-y-4">
                {/* Filter Card */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-primary" />
                        <span>Filters</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setSelectedClub("");
                          setSearchQuery("");
                          setShowFavoritesOnly(false);
                        }}
                      >
                        Clear
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Who Section - Name Search */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Who</span>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search by name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 text-sm"
                        />
                      </div>
                    </div>

                    {/* Club Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Club</span>
                      </div>
                      <Popover open={clubSearchOpen} onOpenChange={setClubSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={clubSearchOpen}
                            className="w-full justify-between text-sm"
                          >
                            {selectedClub || "Select club..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search club..." />
                            <CommandList>
                              <CommandEmpty>No club found.</CommandEmpty>
                              <CommandGroup>
                                {allClubs.map((club) => (
                                  <CommandItem
                                    key={club}
                                    value={club}
                                    onSelect={(currentValue) => {
                                      setSelectedClub(currentValue === selectedClub ? "" : currentValue);
                                      setClubSearchOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedClub === club ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {club}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Favorites Only Toggle */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <Label htmlFor="favorites-toggle" className="text-sm font-medium cursor-pointer">
                            Favorites only
                          </Label>
                        </div>
                        <Switch
                          id="favorites-toggle"
                          checked={showFavoritesOnly}
                          onCheckedChange={setShowFavoritesOnly}
                        />
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - People Grid */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedUsers.map((person) => (
                  <Card key={person.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden cursor-pointer flex flex-col h-full"
                    onClick={() => navigate(`/profile/${person.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback className="text-lg bg-primary/10">
                              {person.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {person.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                            {person.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{person.role}</p>
                          {person.ranking && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {person.ranking}
                            </Badge>
                          )}
                        </div>
                        <div className="relative flex items-center space-x-2">
                           {favoriteUsers.includes(person.id) ? (
                             <AlertDialog open={removeFavoriteDialogOpen && userToRemoveFavorite === person.id} onOpenChange={setRemoveFavoriteDialogOpen}>
                               <AlertDialogTrigger asChild>
                                 <Tooltip>
                                   <TooltipTrigger asChild>
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       className="p-2 h-auto hover:bg-yellow-50"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setUserToRemoveFavorite(person.id);
                                         setRemoveFavoriteDialogOpen(true);
                                       }}
                                     >
                                       <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                     </Button>
                                   </TooltipTrigger>
                                   <TooltipContent>
                                     <p>Remove from favorites</p>
                                   </TooltipContent>
                                 </Tooltip>
                               </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove {person.name} from favorites?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {person.name} from your favorites?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setRemoveFavoriteDialogOpen(false);
                                  }}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                     onClick={() => {
                                       removeFromFavorites(person.id);
                                       setRemoveFavoriteDialogOpen(false);
                                       setUserToRemoveFavorite(null);
                                     }}
                                    className="bg-yellow-500 hover:bg-yellow-600"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                           ) : (
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   className="p-2 h-auto hover:bg-yellow-50"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     addToFavorites(person.id);
                                   }}
                                 >
                                   <Star className="h-4 w-4 text-yellow-500" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Add to favorites</p>
                               </TooltipContent>
                             </Tooltip>
                           )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col h-full space-y-3">
                      {person.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{person.bio}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
    </>
    </TooltipProvider>
  );
};

export default People;
