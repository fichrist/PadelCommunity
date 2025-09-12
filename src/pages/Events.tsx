import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Plus, Users, Calendar, User, MessageCircle, MapPin, Clock, Tag, UserCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";

const Events = () => {
  const [filter, setFilter] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRadius, setSelectedRadius] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState("");
  const navigate = useNavigate();

  const events = [
    {
      eventId: "1",
      title: "Morning Meditation Circle",
      description: "Start your day with peaceful meditation in our beautiful garden sanctuary. All levels welcome.",
      date: "Tomorrow, 7:00 AM",
      location: "Zen Garden Center, Sedona AZ",
      organizer: { name: "Sarah Chen", avatar: elenaProfile, id: "healer-1" },
      attendees: 12,
      category: "Meditation",
      image: soundHealingEvent,
      isPastEvent: false,
      tags: ["Meditation", "Morning Practice", "Garden"]
    },
    {
      eventId: "2",
      title: "Full Moon Healing Ceremony",
      description: "Join us for a transformative healing circle under the full moon's energy.",
      date: "This Friday, 8:00 PM",
      location: "Sacred Grove, Boulder CO",
      organizer: { name: "Marcus Rivera", avatar: elenaProfile, id: "healer-2" },
      attendees: 28,
      category: "Ceremony",
      image: crystalWorkshopEvent,
      isPastEvent: false,
      tags: ["Full Moon", "Healing", "Ceremony"]
    },
    {
      eventId: "3",
      title: "Yoga & Sound Bath",
      description: "Gentle yoga flow followed by immersive crystal singing bowl meditation.",
      date: "Saturday, 10:00 AM",
      location: "Harmony Studio, Asheville NC",
      organizer: { name: "Luna Wise", avatar: elenaProfile, id: "healer-3" },
      attendees: 15,
      category: "Yoga",
      image: soundHealingEvent,
      isPastEvent: true,
      tags: ["Yoga", "Sound Bath", "Meditation"]
    },
    {
      eventId: "4",
      title: "Mindful Nature Walk",
      description: "Connect with nature through mindful walking and forest meditation.",
      date: "Sunday, 9:00 AM",
      location: "Mountain Trail, Big Sur CA",
      organizer: { name: "River Stone", avatar: elenaProfile, id: "healer-4" },
      attendees: 8,
      category: "Nature",
      image: crystalWorkshopEvent,
      isPastEvent: false,
      tags: ["Nature", "Walking", "Mindfulness"]
    },
    {
      eventId: "5",
      title: "Sacred Geometry Workshop",
      description: "Explore the divine patterns in nature and their spiritual significance.",
      date: "Next Tuesday, 6:00 PM",
      location: "Wisdom Circle, Mount Shasta CA",
      organizer: { name: "Dr. Amara Light", avatar: elenaProfile, id: "healer-5" },
      attendees: 22,
      category: "Workshop",
      image: soundHealingEvent,
      isPastEvent: true,
      tags: ["Sacred Geometry", "Workshop", "Education"]
    },
    {
      eventId: "6",
      title: "Chakra Balancing Session",
      description: "Realign your energy centers through guided visualization and healing.",
      date: "Next Wednesday, 7:30 PM",
      location: "Crystal Temple, Tulum Mexico",
      organizer: { name: "Sage Moon", avatar: elenaProfile, id: "healer-6" },
      attendees: 18,
      category: "Healing",
      image: crystalWorkshopEvent,
      isPastEvent: false,
      tags: ["Chakras", "Healing", "Energy Work"]
    }
  ];

  const filteredEvents = filter === "all" ? events : 
    filter === "past" ? events.filter(event => event.isPastEvent) :
    events.filter(event => !event.isPastEvent);

  const allTags = [...new Set(events.flatMap(event => event.tags))];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
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
                  <Button variant="ghost" size="lg" className="p-4 rounded-xl hover:bg-muted/70 relative transition-all hover:scale-110">
                    <Calendar className="h-9 w-9 text-primary" />
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/people')}
                  >
                    <User className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
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
                    placeholder="Search events..." 
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

        {/* Events Filters - Sticky */}
        <div className="bg-transparent sticky top-[73px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">Events</h1>
              
              {/* Centered Filters */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
                <Button
                  variant={filter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filter === "past" ? "default" : "ghost"}
                  size="sm"  
                  onClick={() => setFilter("past")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Past
                </Button>
                <Button
                  variant={filter === "future" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("future")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Future
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
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-primary" />
                      <span>Filters</span>
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

                    {/* When Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">When</span>
                      </div>
                      <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow</SelectItem>
                          <SelectItem value="this-week">This Week</SelectItem>
                          <SelectItem value="next-week">Next Week</SelectItem>
                          <SelectItem value="this-month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* What Section - Tags */}
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

                    {/* Who Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Who</span>
                      </div>
                      <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Organizer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Organizers</SelectItem>
                          <SelectItem value="following">Following Only</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - Events Grid */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <EventCard key={index} {...event} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;