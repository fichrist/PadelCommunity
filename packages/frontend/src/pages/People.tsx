import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Filter, Plus, Users, User, MessageCircle, MapPin, Tag, UserCheck, Star, Heart, Ban, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { elenaProfile } from "@/data/healers";

const People = () => {
  const [filter, setFilter] = useState("healers");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRadius, setSelectedRadius] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]); // Store user IDs
  const [unfollowDialogOpen, setUnfollowDialogOpen] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [sortBy, setSortBy] = useState("alphabetical");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedIcons, setSelectedIcons] = useState<Record<string, { calendar: boolean; info: boolean; block: boolean; notification: boolean }>>({});
  const [people, setPeople] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const navigate = useNavigate();

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

      // Get IDs of healers
      const healerIds = profiles.filter(p => p.is_healer).map(p => p.id);

      // Fetch healer profiles for healers
      const { data: healerProfiles } = await supabase
        .from('healer_profiles')
        .select('*')
        .in('user_id', healerIds);

      // Create a map of user_id to healer profile
      const healerProfileMap = new Map();
      (healerProfiles || []).forEach((hp: any) => {
        healerProfileMap.set(hp.user_id, hp);
      });

      // Extract all tags
      const tagsSet = new Set<string>();
      (healerProfiles || []).forEach((hp: any) => {
        (hp.tags || []).forEach((tag: string) => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet).sort());

      // Format people data
      const formattedPeople = profiles.map((profile: any) => {
        const healerProfile = healerProfileMap.get(profile.id);
        const name = profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
        const location = [profile.city, profile.country].filter(Boolean).join(', ') || 'Location not set';

        return {
          id: profile.id,
          name,
          role: healerProfile?.specialization || 'Member',
          bio: healerProfile?.bio || profile.bio || '',
          avatar: profile.avatar_url || elenaProfile,
          location,
          isHealer: profile.is_healer || false,
          tags: healerProfile?.tags || [],
          followers: 0, // Set to 0 as requested
          isOnline: false // Could be enhanced later
        };
      });

      setPeople(formattedPeople);
    };

    fetchPeople();
  }, []);

  // Mock contact list - users in your contact list (you can enhance this later)
  const contactUserIds: string[] = [];

  // Filter people
  const filteredPeople = people.filter(person => {
    if (filter === "healers") return person.isHealer;
    if (filter === "following") return followedUsers.includes(person.id);
    if (filter === "followers") return false; // Could be enhanced
    if (filter === "contacts") return contactUserIds.includes(person.id);
    return true;
  });

  // Apply tag filtering
  const tagFilteredPeople = selectedTags.length > 0
    ? filteredPeople.filter(person => 
        selectedTags.some(tag => person.tags.includes(tag))
      )
    : filteredPeople;

  // Sort users based on selected sort option
  const sortedUsers = [...tagFilteredPeople].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "alphabetical") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "followers") {
      comparison = a.followers - b.followers;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <TooltipProvider>
    <>
        {/* People Filters - Sticky */}
        <div className="bg-transparent sticky top-[57px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">Beautiful souls</h1>
              
              {/* Sort Options - Completely Right Aligned */}
              <div className="ml-auto flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36 h-9">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphabetical">Name</SelectItem>
                      <SelectItem value="followers">Followers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Order:</span>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Centered Filters */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
                <Button
                  variant={filter === "healers" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("healers")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Healers
                </Button>
                <Button
                  variant={filter === "contacts" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setFilter("contacts");
                    // Clear other filters when contacts is selected
                    setSelectedLocation("");
                    setSelectedRadius("");
                    setSelectedSpecialty("");
                    setSelectedTags([]);
                  }}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Contacts
                </Button>
                <Button
                  variant={filter === "following" ? "default" : "ghost"}
                  size="sm"  
                  onClick={() => setFilter("following")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Following
                </Button>
                <Button
                  variant={filter === "followers" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("followers")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Followers
                </Button>
              </div>
              
              {/* Empty div for balance */}
              <div></div>
            </div>
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
                          setSelectedLocation("");
                          setSelectedRadius("");
                          setSelectedSpecialty("");
                          setSelectedTags([]);
                        }}
                      >
                        Clear
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Where Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Where</span>
                      </div>
                      <LocationAutocomplete
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        placeholder="Enter a city..."
                        className="text-sm"
                      />
                      <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Radius" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 km</SelectItem>
                          <SelectItem value="10">10 km</SelectItem>
                          <SelectItem value="25">25 km</SelectItem>
                          <SelectItem value="50">50 km</SelectItem>
                          <SelectItem value="100">100 km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>


                    {/* What Section - Specialties */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">What</span>
                      </div>
                      
                      {/* Dance Category */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Dance</p>
                        <div className="flex flex-wrap gap-1">
                          {allTags.filter(tag => ["Movement Therapy", "Ecstatic Dance", "Dance Therapy", "Movement Meditation", "Sacred Dance"].includes(tag)).map((tag) => (
                            <Badge 
                              key={tag}
                              variant={selectedTags.includes(tag) ? "default" : "secondary"}
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => {
                                setSelectedTags(prev => 
                                  prev.includes(tag) 
                                    ? prev.filter(t => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Exhibition/Festival Category */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Exhibition/Festival</p>
                        <div className="flex flex-wrap gap-1">
                          {allTags.filter(tag => ["Art", "Exhibition", "Festival", "Spirituality", "Cosmic"].includes(tag)).map((tag) => (
                            <Badge 
                              key={tag}
                              variant={selectedTags.includes(tag) ? "default" : "secondary"}
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => {
                                setSelectedTags(prev => 
                                  prev.includes(tag) 
                                    ? prev.filter(t => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Workshop Category */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Workshop</p>
                        <div className="flex flex-wrap gap-1">
                          {allTags.filter(tag => ["Sound Healing", "Crystal Healing", "Energy Healing", "Reiki", "Chakra Balancing", "Astrology", "Sacred Geometry", "Theta Healing", "Life Coaching", "Breathwork"].includes(tag)).map((tag) => (
                            <Badge 
                              key={tag}
                              variant={selectedTags.includes(tag) ? "default" : "secondary"}
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => {
                                setSelectedTags(prev => 
                                  prev.includes(tag) 
                                    ? prev.filter(t => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Ceremony Category */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Ceremony</p>
                        <div className="flex flex-wrap gap-1">
                          {allTags.filter(tag => ["Meditation", "Mindfulness", "Shamanic Healing", "Ancient Wisdom", "Emotional Healing", "Inner Peace", "Nature", "Forest", "Earth Connection", "Ocean", "Self-Discovery", "Astronomy"].includes(tag)).map((tag) => (
                            <Badge 
                              key={tag}
                              variant={selectedTags.includes(tag) ? "default" : "secondary"}
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => {
                                setSelectedTags(prev => 
                                  prev.includes(tag) 
                                    ? prev.filter(t => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
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
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate">{person.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative flex items-center space-x-2">
                           {followedUsers.includes(person.id) ? (
                             <AlertDialog open={unfollowDialogOpen && userToUnfollow === person.id} onOpenChange={setUnfollowDialogOpen}>
                               <AlertDialogTrigger asChild>
                                 <Tooltip>
                                   <TooltipTrigger asChild>
                                     <Button 
                                       variant="ghost" 
                                       size="sm" 
                                       className="p-2 h-auto hover:bg-red-50"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setUserToUnfollow(person.id);
                                         setUnfollowDialogOpen(true);
                                       }}
                                     >
                                       <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                                     </Button>
                                   </TooltipTrigger>
                                   <TooltipContent>
                                     <p>Unfollow</p>
                                   </TooltipContent>
                                 </Tooltip>
                               </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Unfollow {person.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to unfollow {person.name}? You will no longer see their updates in your feed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setUnfollowDialogOpen(false);
                                  }}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                     onClick={() => {
                                       setFollowedUsers(prev => prev.filter(id => id !== person.id));
                                        setSelectedIcons(prev => ({
                                          ...prev,
                                          [person.id]: { calendar: false, info: false, block: false, notification: false }
                                        }));
                                       setUnfollowDialogOpen(false);
                                       setUserToUnfollow(null);
                                     }}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Unfollow
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
                                   className="p-2 h-auto hover:bg-red-50"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setFollowedUsers(prev => [...prev, person.id]);
                                   }}
                                 >
                                   <Heart className="h-4 w-4 text-red-500" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Follow</p>
                               </TooltipContent>
                             </Tooltip>
                           )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 h-auto hover:bg-muted/50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIcons(prev => ({
                                    ...prev,
                                    [person.id]: {
                                      ...prev[person.id],
                                      notification: !prev[person.id]?.notification
                                    }
                                  }));
                                }}
                              >
                                <Bell className={`h-4 w-4 transition-colors ${
                                  selectedIcons[person.id]?.notification 
                                    ? 'text-blue-500 fill-blue-500' 
                                    : 'text-muted-foreground hover:text-primary'
                                }`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Notifications</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col h-full space-y-3">
                      {/* Only show bio and tags for healers */}
                      {person.isHealer && (
                        <>
                          <p className="text-sm text-muted-foreground line-clamp-2">{person.bio}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {person.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* Bottom section - Followers only */}
                      <div className="mt-auto space-y-2">
                        {/* Followers */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{person.followers} followers</span>
                          </div>
                          
                          {/* Bottom right block icon */}
                          <div className="flex justify-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-auto hover:bg-muted/50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIcons(prev => ({
                                      ...prev,
                                      [person.id]: {
                                        ...prev[person.id],
                                        block: !prev[person.id]?.block
                                      }
                                    }));
                                  }}
                                >
                                  <Ban className={`h-4 w-4 transition-colors ${
                                    selectedIcons[person.id]?.block 
                                      ? 'text-red-500 fill-red-500' 
                                      : 'text-muted-foreground hover:text-primary'
                                  }`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{selectedIcons[person.id]?.block ? 'Unblock' : 'Block'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                      
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
