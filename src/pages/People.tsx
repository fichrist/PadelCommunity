import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Filter, Plus, Users, Calendar, User, MessageCircle, MapPin, Clock, Tag, UserCheck, Star, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

const People = () => {
  const [filter, setFilter] = useState("healers");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRadius, setSelectedRadius] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [followedUsers, setFollowedUsers] = useState<number[]>([0, 2]); // Example: following first and third healers
  const [unfollowDialogOpen, setUnfollowDialogOpen] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState<number | null>(null);
  const navigate = useNavigate();

  const healers = [
    {
      name: "Elena Moonchild",
      avatar: elenaProfile,
      role: "Sound Healer & Reiki Master",
      location: "Sedona, AZ",
      followers: 1234,
      rating: 4.9,
      reviews: 89,
      specialties: ["Sound Healing", "Reiki", "Chakra Balancing"],
      bio: "Certified sound healer with 10+ years of experience in crystal bowl therapy and energy work.",
      isOnline: true,
      price: "$120/session",
      tags: ["Sound Healing", "Energy Work", "Crystal Therapy"],
      verified: true,
      isHealer: true
    },
    {
      name: "David Lightwalker",
      avatar: davidProfile,
      role: "Sacred Geometry Teacher & Shaman",
      location: "Boulder, CO",
      followers: 892,
      rating: 4.8,
      reviews: 67,
      specialties: ["Sacred Geometry", "Shamanic Healing", "Plant Medicine"],
      bio: "Traditional shamanic practitioner combining ancient wisdom with sacred geometric principles.",
      isOnline: false,
      price: "$150/session",
      tags: ["Sacred Geometry", "Shamanic Healing", "Ancient Wisdom"],
      verified: true,
      isHealer: true
    },
    {
      name: "Aria Starseed",
      avatar: ariaProfile,
      role: "Crystal Healer & Astrologer",
      location: "Asheville, NC",
      followers: 756,
      rating: 4.7,
      reviews: 124,
      specialties: ["Crystal Healing", "Astrology", "Tarot Reading"],
      bio: "Intuitive crystal healer and astrologer helping souls find their path through celestial guidance.",
      isOnline: true,
      price: "$90/session",
      tags: ["Crystal Healing", "Astrology", "Intuitive Reading"],
      verified: true,
      isHealer: true
    },
    {
      name: "Phoenix Rising",
      avatar: phoenixProfile,
      role: "Movement Therapist & Life Coach",
      location: "Big Sur, CA",
      followers: 1089,
      rating: 5.0,
      reviews: 45,
      specialties: ["Movement Therapy", "Life Coaching", "Breathwork"],
      bio: "Holistic life coach specializing in transformational movement and conscious breathing practices.",
      isOnline: true,
      price: "$100/session",
      tags: ["Movement Therapy", "Life Coaching", "Breathwork"],
      verified: true,
      isHealer: true
    },
    {
      name: "Luna Sage",
      avatar: elenaProfile,
      role: "Meditation Teacher & Mindfulness Coach",
      location: "Mount Shasta, CA",
      followers: 2156,
      rating: 4.9,
      reviews: 203,
      specialties: ["Meditation", "Mindfulness", "Spiritual Guidance"],
      bio: "Senior meditation teacher with 15+ years helping others find inner peace and clarity.",
      isOnline: false,
      price: "$80/session",
      tags: ["Meditation", "Mindfulness", "Inner Peace"],
      verified: true,
      isHealer: true
    },
    {
      name: "River Flow",
      avatar: davidProfile,
      role: "Energy Healer & Theta Practitioner",
      location: "Tulum, Mexico",
      followers: 634,
      rating: 4.6,
      reviews: 78,
      specialties: ["Energy Healing", "Theta Healing", "Emotional Release"],
      bio: "Certified energy healer specializing in deep emotional healing and theta brainwave therapy.",
      isOnline: true,
      price: "$110/session",
      tags: ["Energy Healing", "Theta Healing", "Emotional Healing"],
      verified: false,
      isHealer: true
    },
    // Non-healer users
    {
      name: "Maya Spirit",
      avatar: ariaProfile,
      role: "Spiritual Seeker & Artist",
      location: "Portland, OR",
      followers: 234,
      rating: 0,
      reviews: 0,
      specialties: [],
      bio: "Artist and spiritual seeker exploring consciousness through creative expression and meditation.",
      isOnline: true,
      price: "",
      tags: ["Art", "Spirituality", "Meditation"],
      verified: false,
      isHealer: false
    },
    {
      name: "Ocean Dreams",
      avatar: phoenixProfile,
      role: "Student of Life",
      location: "San Diego, CA",
      followers: 156,
      rating: 0,
      reviews: 0,
      specialties: [],
      bio: "On a journey of self-discovery, learning from the ocean's wisdom and connecting with like-minded souls.",
      isOnline: false,
      price: "",
      tags: ["Nature", "Self-Discovery", "Ocean"],
      verified: false,
      isHealer: false
    },
    {
      name: "Forest Walker",
      avatar: elenaProfile,
      role: "Nature Enthusiast",
      location: "Vancouver, BC",
      followers: 89,
      rating: 0,
      reviews: 0,
      specialties: [],
      bio: "Finding peace and wisdom in the forest, sharing my journey of connection with Mother Earth.",
      isOnline: true,
      price: "",
      tags: ["Nature", "Forest", "Earth Connection"],
      verified: false,
      isHealer: false
    },
    {
      name: "Star Dancer",
      avatar: davidProfile,
      role: "Cosmic Explorer",
      location: "Santa Fe, NM",
      followers: 312,
      rating: 0,
      reviews: 0,
      specialties: [],
      bio: "Dancing with the stars and exploring the mysteries of the universe through meditation and stargazing.",
      isOnline: true,
      price: "",
      tags: ["Astronomy", "Meditation", "Cosmic"],
      verified: false,
      isHealer: false
    }
  ];

  const filteredHealers = filter === "healers" ? healers.filter(person => person.isHealer) : 
    filter === "following" ? healers.filter((_, index) => followedUsers.includes(index)) :
    filter === "followers" ? healers.filter(healer => healer.followers > 1000) :
    healers;

  const allTags = [...new Set(healers.flatMap(healer => healer.tags))];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-background/90 backdrop-blur-sm pt-0">
        {/* Top Navigation Bar - Same as Community */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Logo + App Name */}
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <img src={spiritualLogo} alt="Spirit" className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-primary font-comfortaa">Spirit</span>
              </div>
              
              {/* Center: Navigation Icons */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/')}
                  >
                    <Users className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/events')}
                  >
                    <Calendar className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
                <div className="relative">
                  <Button variant="ghost" size="lg" className="p-4 rounded-xl hover:bg-muted/70 relative transition-all hover:scale-110">
                    <User className="h-9 w-9 text-primary" />
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/chat')}
                  >
                    <MessageCircle className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
              </div>
              
              {/* Right: Search Bar + Create Button + Profile */}
              <div className="flex items-center space-x-3">
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-muted rounded-full px-3 py-2 w-64">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input 
                    type="text" 
                    placeholder="search souls..." 
                    className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  size="sm"
                  className="rounded-full h-10 w-10 p-0"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={elenaProfile} />
                  <AvatarFallback className="text-sm">ME</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        {/* People Filters - Sticky */}
        <div className="bg-transparent sticky top-[73px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">Beautiful souls</h1>
              
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
                          setSelectedType("");
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
                      <Input 
                        placeholder="Location..." 
                        className="text-sm"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
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

                    {/* When Section - Availability */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">When</span>
                      </div>
                      <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="now">Available Now</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="this-week">This Week</SelectItem>
                          <SelectItem value="next-week">Next Week</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* What Section - Specialties */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">What</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {allTags.map((tag) => (
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

                    {/* Who Section - Type */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Who</span>
                      </div>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Healers</SelectItem>
                          <SelectItem value="certified">Certified Only</SelectItem>
                          <SelectItem value="teachers">Teachers</SelectItem>
                          <SelectItem value="practitioners">Practitioners</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - People Grid */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHealers.map((healer, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden cursor-pointer flex flex-col h-full"
                    onClick={() => navigate(`/healer/${index + 1}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={healer.avatar} />
                            <AvatarFallback className="text-lg bg-primary/10">
                              {healer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {healer.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                            {healer.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{healer.role}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate">{healer.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          {followedUsers.includes(index) ? (
                            <AlertDialog open={unfollowDialogOpen && userToUnfollow === index} onOpenChange={setUnfollowDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-2 h-auto hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUserToUnfollow(index);
                                    setUnfollowDialogOpen(true);
                                  }}
                                >
                                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Unfollow {healer.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to unfollow {healer.name}? You will no longer see their updates in your feed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setUnfollowDialogOpen(false)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => {
                                      setFollowedUsers(prev => prev.filter(id => id !== index));
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 h-auto hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFollowedUsers(prev => [...prev, index]);
                              }}
                            >
                              <Heart className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col h-full space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{healer.bio}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {healer.specialties.slice(0, 3).map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-sage/20 text-sage-foreground">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Bottom section with reviews and followers */}
                      <div className="mt-auto space-y-2">
                        {/* Reviews */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{healer.rating}</span>
                              <span className="text-xs text-muted-foreground">({healer.reviews} reviews)</span>
                            </div>
                          </div>
                          <span className="text-xs text-primary hover:underline cursor-pointer">See reviews</span>
                        </div>
                        
                        {/* Followers */}
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{healer.followers} followers</span>
                        </div>
                      </div>
                      
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default People;