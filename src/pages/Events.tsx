import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import CustomDateRangePicker from "@/components/CustomDateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Plus, Users, Calendar, User, MessageCircle, MapPin, Clock, Tag, UserCheck, BookOpen, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  const navigate = useNavigate();

  const events = [
    {
      eventId: "1",
      title: "Morning Meditation Circle",
      description: "Start your day with peaceful meditation in our beautiful garden sanctuary. All levels welcome. This gentle practice includes breathing exercises, guided meditation, and silent contemplation in nature.",
      date: "March 16, 2024 at 7:00 AM",
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
      description: "Join us for a transformative healing circle under the full moon's energy. Experience deep healing through sound, crystal work, and collective intention setting in our sacred outdoor space.",
      date: "March 18, 2024 at 8:00 PM",
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
      description: "Gentle yoga flow followed by immersive crystal singing bowl meditation. Perfect for releasing tension and finding inner peace through movement and sound healing vibrations.",
      date: "March 14, 2024 at 10:00 AM",
      location: "Harmony Studio, Asheville NC",
      organizer: { name: "Luna Wise", avatar: elenaProfile, id: "healer-3" },
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
      tags: ["Yoga", "Sound Bath", "Meditation"]
    },
    {
      eventId: "4",
      title: "Mindful Nature Walk",
      description: "Connect with nature through mindful walking and forest meditation. Discover the healing power of trees, breathe fresh mountain air, and practice walking meditation techniques.",
      date: "March 17, 2024 at 9:00 AM",
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
      description: "Explore the divine patterns in nature and their spiritual significance. Learn how to recognize and work with sacred geometric forms in meditation, art, and daily life practices.",
      date: "March 12, 2024 at 6:00 PM",
      location: "Wisdom Circle, Mount Shasta CA",
      organizer: { name: "Dr. Amara Light", avatar: elenaProfile, id: "healer-5" },
      attendees: 22,
      category: "Workshop",
      image: soundHealingEvent,
      isPastEvent: true,
      averageRating: 4.9,
      totalReviews: 18,
      reviews: [
        { id: "1", author: { name: "Star Seeker", avatar: elenaProfile }, rating: 5, content: "Mind-blowing insights into sacred geometry! Dr. Amara's knowledge is incredible.", timeAgo: "1 week ago" },
        { id: "2", author: { name: "Cosmic Mind", avatar: elenaProfile }, rating: 5, content: "This workshop changed my perspective on everything. Highly recommended!", timeAgo: "5 days ago" },
        { id: "3", author: { name: "Sacred Soul", avatar: elenaProfile }, rating: 4, content: "Fascinating content and great presentation. Worth every minute.", timeAgo: "1 week ago" }
      ],
      tags: ["Sacred Geometry", "Workshop", "Education"]
    },
    {
      eventId: "6",
      title: "Chakra Balancing Session",
      description: "Realign your energy centers through guided visualization and healing. Experience deep chakra cleansing, energy balancing, and learn techniques for maintaining energetic harmony.",
      date: "March 19, 2024 at 7:30 PM",
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
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-full">
            {/* Left Sidebar - Filters - Doubled in size */}
            <div className="lg:col-span-4 sticky top-0 h-[calc(100vh-130px)] overflow-y-auto">
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
                        
                        {/* Custom Date Range Picker */}
                        {showCustomDatePicker && (
                          <div className="absolute top-full left-0 right-0 mt-2 z-50">
                            <CustomDateRangePicker
                              onRangeSelect={(from, to) => {
                                setCustomDateFrom(from);
                                setCustomDateTo(to);
                                if (from && to) {
                                  setSelectedDate("custom");
                                }
                              }}
                              onClose={() => setShowCustomDatePicker(false)}
                            />
                          </div>
                        )}
                        
                        {/* Display selected custom range */}
                        {selectedDate === "custom" && customDateFrom && customDateTo && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {customDateFrom.toLocaleDateString()} - {customDateTo.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* What Section - Tags */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">What</span>
                      </div>
                      
                      {/* Dance Category */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Dance</p>
                        <div className="flex flex-wrap gap-1">
                          {allTags.filter(tag => ["Movement", "Dance", "Yoga"].includes(tag)).map((tag) => (
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
                          {allTags.filter(tag => ["Exhibition", "Festival", "Garden"].includes(tag)).map((tag) => (
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
                          {allTags.filter(tag => ["Workshop", "Education", "Sacred Geometry", "Sound Bath", "Chakras", "Energy Work", "Healing"].includes(tag)).map((tag) => (
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
                          {allTags.filter(tag => ["Ceremony", "Full Moon", "Meditation", "Morning Practice", "Nature", "Walking", "Mindfulness"].includes(tag)).map((tag) => (
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

            {/* Main Content - Events Grid - Adjusted for larger filter */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                {filteredEvents.map((event, index) => (
                  <EventCard 
                    key={index} 
                    {...event} 
                    isSaved={savedEvents.includes(event.eventId)}
                    onSaveToggle={() => {
                      if (savedEvents.includes(event.eventId)) {
                        setSavedEvents(prev => prev.filter(id => id !== event.eventId));
                        toast.success("Removed from saved");
                      } else {
                        setSavedEvents(prev => [...prev, event.eventId]);
                        toast.success("Event saved!");
                      }
                    }}
                    onJoinEvent={() => {
                      setSelectedEvent(event);
                      setEnrollmentModalOpen(true);
                    }}
                  />
                ))}
              </div>
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
            
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Event Details:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Date:</strong> {selectedEvent?.date}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Location:</strong> {selectedEvent?.location}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Organizer:</strong> {selectedEvent?.organizer?.name}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Current attendees:</strong> {selectedEvent?.attendees}</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Enrollment Options:</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="anonymous" 
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Stay anonymous (your name won't be visible to other participants)
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">What to expect:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>You'll receive a confirmation email with event details</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Event reminders will be sent 24 hours and 1 hour before</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>You can cancel your enrollment up to 2 hours before the event</span>
                  </li>
                </ul>
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