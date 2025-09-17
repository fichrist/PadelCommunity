import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import CustomDateRangePicker from "@/components/CustomDateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Plus, Users, Calendar, User, MessageCircle, MapPin, Clock, Tag, UserCheck, BookOpen, X, Heart, Repeat2, Share2, Link, Copy, Check, ChevronDown, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [resharedPosts, setResharedPosts] = useState<number[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [sharePopoverOpen, setSharePopoverOpen] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const navigate = useNavigate();

  const events = [
    {
      type: "event",
      eventId: "1",
      title: "Morning Meditation Circle",
      thought: "Start your day with peaceful meditation in our beautiful garden sanctuary. All levels welcome.",
      description: "This gentle practice includes breathing exercises, guided meditation, and silent contemplation in nature.",
      date: "March 16, 2024 at 7:00 AM",
      location: "Zen Garden Center, Sedona AZ",
      author: { name: "Sarah Chen", avatar: elenaProfile, followers: 234, role: "Meditation Teacher" },
      organizers: [
        { name: "Sarah Chen", avatar: elenaProfile, id: "healer-1" },
        { name: "Michael Zen", avatar: elenaProfile, id: "healer-7" }
      ],
      attendees: 12,
      category: "Meditation",
      image: soundHealingEvent,
      isPastEvent: false,
      tags: ["Meditation", "Morning Practice", "Garden"],
      timeAgo: "2 hours ago",
      comments: 5,
      likes: 23,
      shares: 3,
      dateRange: { start: "Mar 16", end: null },
      connectionsGoing: ["Michael Zen"]
    },
    {
      type: "event",
      eventId: "2",
      title: "Full Moon Healing Ceremony",
      thought: "Join us for a transformative healing circle under the full moon's energy.",
      description: "Experience deep healing through sound, crystal work, and collective intention setting in our sacred outdoor space.",
      date: "March 18, 2024 at 8:00 PM",
      location: "Sacred Grove, Boulder CO",
      author: { name: "Marcus Rivera", avatar: elenaProfile, followers: 189, role: "Healing Facilitator" },
      organizers: [
        { name: "Marcus Rivera", avatar: elenaProfile, id: "healer-2" }
      ],
      attendees: 28,
      category: "Ceremony",
      image: crystalWorkshopEvent,
      isPastEvent: false,
      tags: ["Full Moon", "Healing", "Ceremony"],
      timeAgo: "4 hours ago",
      comments: 12,
      likes: 45,
      shares: 8,
      dateRange: { start: "Mar 18", end: null },
      connectionsGoing: ["Luna Wise", "Echo Sound"]
    },
    {
      type: "event",
      eventId: "3",
      title: "Yoga & Sound Bath",
      thought: "Gentle yoga flow followed by immersive crystal singing bowl meditation.",
      description: "Perfect for releasing tension and finding inner peace through movement and sound healing vibrations.",
      date: "March 14, 2024 at 10:00 AM",
      location: "Harmony Studio, Asheville NC",
      author: { name: "Luna Wise", avatar: elenaProfile, followers: 298, role: "Yoga & Sound Healer" },
      organizers: [
        { name: "Luna Wise", avatar: elenaProfile, id: "healer-3" },
        { name: "Echo Sound", avatar: elenaProfile, id: "healer-8" },
        { name: "River Flow", avatar: elenaProfile, id: "healer-9" }
      ],
      attendees: 15,
      category: "Yoga",
      image: soundHealingEvent,
      isPastEvent: true,
      averageRating: 4.8,
      totalReviews: 12,
      reviews: [
        { id: "1", author: { name: "Sarah Light", avatar: elenaProfile }, rating: 5, content: "Amazing session! The sound bath was deeply relaxing and transformative.", timeAgo: "2 days ago" },
        { id: "2", author: { name: "David Peace", avatar: elenaProfile }, rating: 4, content: "Perfect combination of yoga and sound healing. Luna is very skilled.", timeAgo: "1 day ago" },
        { id: "3", author: { name: "River Flow", avatar: elenaProfile }, rating: 5, content: "Best sound bath I've experienced. The space was beautiful too.", timeAgo: "3 days ago" }
      ],
      tags: ["Yoga", "Sound Bath", "Meditation"],
      timeAgo: "2 days ago",
      comments: 18,
      likes: 67,
      shares: 12,
      dateRange: { start: "Mar 14", end: null },
      connectionsGoing: ["Echo Sound", "River Flow"],
      thoughts: [
        { id: "1", author: { name: "Sarah Light", avatar: elenaProfile }, content: "This workshop exceeded my expectations. Luna's energy is so pure and healing.", likes: 12, timeAgo: "2 days ago" }
      ]
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
                    placeholder="search events..." 
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
            <div className="lg:col-span-2 sticky top-0 h-[calc(200vh-130px)] overflow-y-auto">
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
                          setSelectedDate("");
                          setSelectedTags([]);
                          setShowCustomDatePicker(false);
                          setCustomDateFrom(undefined);
                          setCustomDateTo(undefined);
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

                    {/* When Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">When</span>
                      </div>
                      <div className="relative">
                        <Select 
                          value={selectedDate} 
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setShowCustomDatePicker(true);
                            } else {
                              setSelectedDate(value);
                              setShowCustomDatePicker(false);
                              setCustomDateFrom(undefined);
                              setCustomDateTo(undefined);
                            }
                          }}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Time period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="this-week">This Week</SelectItem>
                            <SelectItem value="next-week">Next Week</SelectItem>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {showCustomDatePicker && (
                          <div className="mt-2">
                            <CustomDateRangePicker
                              dateFrom={customDateFrom}
                              dateTo={customDateTo}
                              onDateFromChange={setCustomDateFrom}
                              onDateToChange={setCustomDateTo}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Tags</span>
                      </div>
                      
                      {/* Show selected tags */}
                      {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedTags.map((tag) => (
                            <Badge 
                              key={tag}
                              variant="default"
                              className="text-xs cursor-pointer hover:bg-primary/80 transition-colors flex items-center space-x-1"
                              onClick={() => {
                                setSelectedTags(prev => prev.filter(t => t !== tag));
                              }}
                            >
                              <span>{tag}</span>
                              <X className="h-3 w-3" />
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Categorized tag groups */}
                      <div className="space-y-3">
                        {/* Meditation Category */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Meditation</p>
                          <div className="flex flex-wrap gap-1">
                            {allTags.filter(tag => ["Meditation", "Mindfulness", "Morning Practice"].includes(tag)).map((tag) => (
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

                        {/* Healing Category */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Healing</p>
                          <div className="flex flex-wrap gap-1">
                            {allTags.filter(tag => ["Healing", "Sound Bath", "Full Moon", "Ceremony"].includes(tag)).map((tag) => (
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

                        {/* Yoga Category */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Yoga</p>
                          <div className="flex flex-wrap gap-1">
                            {allTags.filter(tag => ["Yoga"].includes(tag)).map((tag) => (
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

                        {/* Nature Category */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Nature</p>
                          <div className="flex flex-wrap gap-1">
                            {allTags.filter(tag => ["Garden", "Nature"].includes(tag)).map((tag) => (
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6 space-y-4">
              {filteredEvents.map((event, index) => (
                <Card key={index} className="bg-card/90 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-200 relative">
                  <CardContent className="p-0">
                    {/* Event Image Header */}
                    {event.image && (
                      <div className="p-4">
                         <div className="flex space-x-3">
                           {/* Event Image - 4:3 Aspect Ratio - Clickable */}
                           <div 
                             className="w-48 h-36 flex-shrink-0 cursor-pointer"
                             onClick={() => navigate(`/event/${event.eventId}`)}
                           >
                             <img 
                               src={event.image} 
                               alt={event.title}
                               className="w-full h-full object-cover rounded-lg"
                             />
                           </div>
                           
                           {/* Event Details */}
                           <div className="flex-1 min-w-0">
                             <h2 
                               className="text-lg font-bold text-foreground mb-2 leading-tight cursor-pointer hover:text-primary transition-colors"
                               onClick={() => navigate(`/event/${event.eventId}`)}
                             >
                               {event.title}
                             </h2>
                             
                             <div className="space-y-1 text-sm">
                               <div className="mb-2">
                                 <span className="text-2xl font-bold text-primary">
                                   {event.dateRange?.end ? 
                                     `${event.dateRange.start} - ${event.dateRange.end}` : 
                                     event.dateRange?.start
                                   }
                                 </span>
                               </div>
                               
                               <div className="flex items-center space-x-2">
                                 <Avatar className="h-6 w-6">
                                   <AvatarImage src={event.author.avatar} />
                                   <AvatarFallback className="bg-primary/10 text-xs">
                                     {event.author.name.split(' ').map(n => n[0]).join('')}
                                   </AvatarFallback>
                                 </Avatar>
                                 <div>
                                   <div className="flex items-center space-x-2">
                                      <span 
                                        className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => navigate(`/healer/${event.author.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                      >
                                        {event.author.name}
                                      </span>
                                     <span className="text-xs text-muted-foreground">•</span>
                                     <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent">
                                       Follow
                                     </Button>
                                   </div>
                                   <p className="text-xs text-muted-foreground">
                                     {event.author.role}
                                   </p>
                                 </div>
                               </div>
                               
                               <div className="flex items-center space-x-2 text-muted-foreground">
                                 <MapPin className="h-4 w-4" />
                                 <span>{event.location}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="px-3">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {event.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Event thought */}
                      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                        {event.thought}
                      </p>

                      {/* Event Details */}
                      <div className="mb-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{event.attendees} attending</span>
                          </div>
                          {event.connectionsGoing && event.connectionsGoing.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <UserCheck className="h-4 w-4 text-primary" />
                              <span className="text-primary text-xs font-medium">
                                {event.connectionsGoing.join(', ')} {event.connectionsGoing.length === 1 ? 'is' : 'are'} going
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Past Event Reviews */}
                      {event.isPastEvent && event.averageRating && (
                        <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.round(event.averageRating || 0) 
                                        ? "text-yellow-400 fill-current" 
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{event.averageRating?.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">({event.totalReviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Social Actions */}
                    <div className="px-3 py-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-auto p-2 transition-colors ${
                              likedPosts.includes(index) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                            }`}
                            onClick={() => {
                              if (likedPosts.includes(index)) {
                                setLikedPosts(prev => prev.filter(id => id !== index));
                              } else {
                                setLikedPosts(prev => [...prev, index]);
                              }
                            }}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${likedPosts.includes(index) ? 'fill-current' : ''}`} />
                            <span className="text-xs">{event.likes + (likedPosts.includes(index) ? 1 : 0)}</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">{event.comments}</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-auto p-2 transition-colors ${
                              resharedPosts.includes(index) ? 'text-green-500' : 'text-muted-foreground hover:text-green-500'
                            }`}
                            onClick={() => {
                              if (resharedPosts.includes(index)) {
                                setResharedPosts(prev => prev.filter(id => id !== index));
                                toast.success("Unshared event");
                              } else {
                                setResharedPosts(prev => [...prev, index]);
                                toast.success("Event reshared");
                              }
                            }}
                          >
                            <Repeat2 className="h-4 w-4 mr-1" />
                            <span className="text-xs">{event.shares + (resharedPosts.includes(index) ? 1 : 0)}</span>
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-auto p-2 transition-colors ${
                              savedPosts.includes(index) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                            }`}
                            onClick={() => {
                              if (savedPosts.includes(index)) {
                                setSavedPosts(prev => prev.filter(id => id !== index));
                                toast.success("Event unsaved");
                              } else {
                                setSavedPosts(prev => [...prev, index]);
                                toast.success("Event saved");
                              }
                            }}
                          >
                            <BookOpen className={`h-4 w-4 ${savedPosts.includes(index) ? 'fill-current' : ''}`} />
                          </Button>
                          
                          <Popover 
                            open={sharePopoverOpen === index} 
                            onOpenChange={(open) => setSharePopoverOpen(open ? index : null)}
                          >
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-auto p-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2" align="end">
                              <div className="space-y-1">
                                <Button 
                                  variant="ghost" 
                                  className="w-full justify-start text-sm h-8"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/event/${event.eventId}`);
                                    setLinkCopied(true);
                                    setTimeout(() => setLinkCopied(false), 2000);
                                    toast.success("Event link copied!");
                                    setSharePopoverOpen(null);
                                  }}
                                >
                                  {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                                  Copy Link
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Enrollment Modal */}
        <Dialog open={enrollmentModalOpen} onOpenChange={setEnrollmentModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enroll in Event</DialogTitle>
              <DialogDescription>
                Join "{selectedEvent?.title}" - Complete your enrollment below
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-sm">•</span>
                  <div>
                    <p className="text-sm font-medium">Event Details</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent?.date}</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent?.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="text-sm">•</span>
                  <div>
                    <p className="text-sm font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent?.author?.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <Checkbox 
                  id="anonymous" 
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                />
                <div>
                  <label htmlFor="anonymous" className="text-sm font-medium">
                    Stay anonymous
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Your name won't be visible to other attendees
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEnrollmentModalOpen(false);
                  setIsAnonymous(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success(`Successfully enrolled in "${selectedEvent?.title}"!`);
                  setEnrollmentModalOpen(false);
                  setIsAnonymous(false);
                }}
              >
                Confirm Enrollment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Events;