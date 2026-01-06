import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import CustomDateRangePicker from "@/components/CustomDateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Plus, Users, Calendar, User, MessageCircle, MapPin, Clock, Tag, UserCheck, BookOpen, X, Heart, Repeat2, Share2, ExternalLink, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ThoughtsModal from "@/components/ThoughtsModal";
import ReviewModal from "@/components/ReviewModal";
import CommunityEventCard from "@/components/CommunityEventCard";
import { getAllEvents } from "@/lib/events";
import { getThoughtsByEventId } from "@/lib/thoughts";
import { elenaProfile, davidProfile } from "@/data/healers";
import spiritualBackground from "@/assets/spiritual-background.jpg";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

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

const Events = () => {
  const [filter, setFilter] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [selectedRadius, setSelectedRadius] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [resharedEvents, setResharedEvents] = useState<string[]>([]);
  const [sharePopoverOpen, setSharePopoverOpen] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [connectionPopoverOpen, setConnectionPopoverOpen] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allIntentions, setAllIntentions] = useState<string[]>([]);
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch user's location and coordinates on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('city, latitude, longitude')
          .eq('id', user.id)
          .single();
        
        if (profile?.city) {
          setSelectedLocation(profile.city);
          if (profile.latitude && profile.longitude) {
            setSelectedLocationCoords({ lat: profile.latitude, lng: profile.longitude });
          }
        }
      }
    };
    
    fetchUserLocation();
  }, []);

  // Geocode location when it changes (using Nominatim - free API)
  useEffect(() => {
    const geocodeLocation = async () => {
      if (!selectedLocation) {
        setSelectedLocationCoords(null);
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(selectedLocation)}&format=json&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          setSelectedLocationCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    geocodeLocation();
  }, [selectedLocation]);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      const dbEvents = await getAllEvents();
      
      // Extract unique tags and intentions from all events
      const tagsSet = new Set<string>();
      const intentionsSet = new Set<string>();
      
      dbEvents.forEach((dbEvent: any) => {
        (dbEvent.tags || []).forEach((tag: string) => tagsSet.add(tag));
        (dbEvent.intentions || []).forEach((intention: string) => intentionsSet.add(intention));
      });
      
      setAllTags(Array.from(tagsSet).sort());
      setAllIntentions(Array.from(intentionsSet).sort());
      
      // Get unique user IDs
      const userIds = [...new Set(dbEvents.map((e: any) => e.user_id).filter(Boolean))] as string[];
      
      // Fetch profiles for all event creators
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, avatar_url, is_healer')
        .in('id', userIds);
      
      // Create a map of user_id to profile
      const profileMap = new Map();
      (profiles || []).forEach((profile: any) => {
        profileMap.set(profile.id, profile);
      });
      
      // Fetch thought counts for all events
      const eventIds = dbEvents.map((e: any) => e.id);
      const { data: thoughtCounts } = await supabase
        .from('thoughts')
        .select('event_id')
        .in('event_id', eventIds)
        .not('event_id', 'is', null);
      
      // Create a map of event_id to thought count
      const thoughtCountMap = new Map();
      (thoughtCounts || []).forEach((thought: any) => {
        const currentCount = thoughtCountMap.get(thought.event_id) || 0;
        thoughtCountMap.set(thought.event_id, currentCount + 1);
      });
      
      // Fetch enrollment counts for all events
      const { data: enrollmentCounts } = await supabase
        .from('enrollments')
        .select('event_id')
        .in('event_id', eventIds)
        .eq('status', 'confirmed');
      
      // Create a map of event_id to enrollment count
      const enrollmentCountMap = new Map();
      (enrollmentCounts || []).forEach((enrollment: any) => {
        const currentCount = enrollmentCountMap.get(enrollment.event_id) || 0;
        enrollmentCountMap.set(enrollment.event_id, currentCount + 1);
      });
      
      // Format events for display
      const formattedEvents = dbEvents.map((dbEvent: any) => {
        const profile = profileMap.get(dbEvent.user_id);
        const organizerName = profile?.display_name || 
                             `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                             'Event Creator';
        
        return {
          eventId: dbEvent.id,
          title: dbEvent.title,
          description: dbEvent.description,
          location: [dbEvent.city, dbEvent.country].filter(Boolean).join(', ') || 'Location TBD',
          latitude: dbEvent.latitude,
          longitude: dbEvent.longitude,
          dateRange: {
            start: dbEvent.start_date ? format(new Date(dbEvent.start_date), 'd MMMM yyyy') : 'TBD',
            end: dbEvent.end_date ? format(new Date(dbEvent.end_date), 'd MMMM yyyy') : undefined
          },
          startDate: dbEvent.start_date ? new Date(dbEvent.start_date) : null,
          endDate: dbEvent.end_date ? new Date(dbEvent.end_date) : dbEvent.start_date ? new Date(dbEvent.start_date) : null,
          time: dbEvent.time,
          tags: dbEvent.tags || [],
          intentions: dbEvent.intentions || [],
          attendees: enrollmentCountMap.get(dbEvent.id) || 0,
          connectionsGoing: [],
          comments: thoughtCountMap.get(dbEvent.id) || 0,
          image: dbEvent.image_url || spiritualBackground,
          isPastEvent: dbEvent.start_date ? new Date(dbEvent.start_date) < new Date() : false,
          organizers: [{
            id: dbEvent.user_id,
            name: organizerName,
            avatar: profile?.avatar_url || elenaProfile,
            isHealer: profile?.is_healer || false
          }],
          thoughts: []
        };
      });
      
      setEvents(formattedEvents);
    };
    
    fetchEvents();
  }, []);

  // Filter events by time filter, tags, intentions, and date range
  const filteredEvents = events.filter(event => {
    // Time filter
    if (filter === "past" && !event.isPastEvent) return false;
    if (filter === "future" && event.isPastEvent) return false;
    
    // Date range filter - check if event overlaps with selected date range
    if (selectedDate) {
      // If a date filter is selected but event has no start date, hide it
      if (!event.startDate) {
        console.log("Hiding event (no start date):", event.title);
        return false;
      }
      
      console.log("Checking event:", { 
        title: event.title, 
        startDate: event.startDate, 
        endDate: event.endDate,
        selectedDate 
      });
      let filterStartDate: Date | null = null;
      let filterEndDate: Date | null = null;
      
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      if (selectedDate === "today") {
        filterStartDate = new Date(now);
        filterEndDate = new Date(now);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "tomorrow") {
        filterStartDate = new Date(now);
        filterStartDate.setDate(filterStartDate.getDate() + 1);
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "this-week") {
        filterStartDate = new Date(now);
        filterEndDate = new Date(now);
        filterEndDate.setDate(filterEndDate.getDate() + (6 - now.getDay())); // End of this week (Saturday)
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "next-week") {
        filterStartDate = new Date(now);
        filterStartDate.setDate(filterStartDate.getDate() + (7 - now.getDay())); // Start of next week (Sunday)
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setDate(filterEndDate.getDate() + 6); // End of next week (Saturday)
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "this-month") {
        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (selectedDate === "custom" && customDateFrom && customDateTo) {
        filterStartDate = new Date(customDateFrom);
        filterStartDate.setHours(0, 0, 0, 0);
        filterEndDate = new Date(customDateTo);
        filterEndDate.setHours(23, 59, 59, 999);
      }
      
      // Check if event dates overlap with filter dates
      if (filterStartDate && filterEndDate) {
        const eventStart = new Date(event.startDate);
        const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
        eventEnd.setHours(23, 59, 59, 999);
        
        // Events overlap if: event starts before filter ends AND event ends after filter starts
        const overlaps = eventStart <= filterEndDate && eventEnd >= filterStartDate;
        if (!overlaps) return false;
      }
    }
    
    // Tags filter - event must have at least one of the selected tags
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some(selectedTag => 
        event.tags.includes(selectedTag)
      );
      if (!hasMatchingTag) return false;
    }
    
    // Intentions filter - event must have at least one of the selected intentions
    if (selectedIntentions.length > 0) {
      const hasMatchingIntention = selectedIntentions.some(selectedIntention => 
        event.intentions.includes(selectedIntention)
      );
      if (!hasMatchingIntention) return false;
    }
    
    // Radius filter - event must be within selected radius
    if (selectedRadius && selectedLocationCoords) {
      // If event has no coordinates, hide it when radius is selected
      if (!event.latitude || !event.longitude) {
        return false;
      }
      
      // Calculate distance between selected location and event
      const distance = calculateDistance(
        selectedLocationCoords.lat,
        selectedLocationCoords.lng,
        event.latitude,
        event.longitude
      );
      
      const radiusKm = parseFloat(selectedRadius);
      if (distance > radiusKm) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <>
        {/* Events Filters - Sticky */}
        <div className="bg-transparent sticky top-[57px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">All events</h1>
              
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
                          setSelectedIntentions([]);
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
                            setSelectedDate(value);
                            if (value === "custom") {
                              setShowCustomDatePicker(true);
                            } else {
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

                    {/* What Section - All Tags from Database */}
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

                    {/* Why Section - Intentions from Database */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Why</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {allIntentions.map((intention) => (
                          <Badge 
                            key={intention}
                            variant={selectedIntentions.includes(intention) ? "default" : "secondary"}
                            className="text-xs cursor-pointer bg-purple-500 hover:bg-purple-600 transition-colors"
                            onClick={() => {
                              setSelectedIntentions(prev => 
                                prev.includes(intention) 
                                  ? prev.filter(i => i !== intention)
                                  : [...prev, intention]
                              );
                            }}
                          >
                            {intention}
                          </Badge>
                        ))}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - Events */}
            <div className="lg:col-span-6 space-y-4">
              {filteredEvents.map((event, index) => (
                <CommunityEventCard
                  key={event.eventId}
                  eventId={event.eventId}
                  title={event.title}
                  thought={event.description}
                  image={event.image}
                  dateRange={event.dateRange}
                  author={{
                    id: event.organizers[0]?.id || 'organizer-1',
                    name: event.organizers[0]?.name || 'Event Creator',
                    avatar: event.organizers[0]?.avatar || elenaProfile,
                    role: 'Event Organizer'
                  }}
                  location={event.location}
                  attendees={event.attendees}
                  tags={event.tags}
                  intentions={event.intentions}
                  connectionsGoing={event.connectionsGoing}
                  isPastEvent={event.isPastEvent}
                  averageRating={event.averageRating}
                  totalReviews={event.totalReviews}
                  comments={event.comments}
                  index={index}
                  onOpenThoughts={async (evt) => {
                    setSelectedEvent(event);
                    // Load thoughts from database
                    const thoughts = await getThoughtsByEventId(event.eventId);
                    setSelectedEvent({ ...event, thoughts });
                    setThoughtsModalOpen(true);
                  }}
                  isReshared={resharedEvents.includes(event.eventId)}
                  onToggleReshare={() => {
                    if (resharedEvents.includes(event.eventId)) {
                      setResharedEvents(prev => prev.filter(id => id !== event.eventId));
                      toast.success("Reshare removed");
                    } else {
                      setResharedEvents(prev => [...prev, event.eventId]);
                      toast.success("Event reshared!");
                    }
                  }}
                  isSaved={savedEvents.includes(event.eventId)}
                  onToggleSave={() => {
                    if (savedEvents.includes(event.eventId)) {
                      setSavedEvents(prev => prev.filter(id => id !== event.eventId));
                      toast.success("Removed from saved");
                    } else {
                      setSavedEvents(prev => [...prev, event.eventId]);
                      toast.success("Event saved!");
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Thoughts Modal */}
        <ThoughtsModal
          open={thoughtsModalOpen}
          onOpenChange={setThoughtsModalOpen}
          postId={selectedEvent?.eventId || selectedEvent?.id || ''}
          postTitle={selectedEvent?.title || ""}
          thoughts={selectedEvent?.thoughts || []}
          isEvent={true}
          onThoughtAdded={async () => {
            // Refresh thoughts after adding
            if (selectedEvent?.eventId) {
              const updatedThoughts = await getThoughtsByEventId(selectedEvent.eventId);
              setSelectedEvent({ ...selectedEvent, thoughts: updatedThoughts });
              
              // Update the comment count in events list
              setEvents(prevEvents => prevEvents.map(e => 
                e.eventId === selectedEvent.eventId 
                  ? { ...e, comments: updatedThoughts.length }
                  : e
              ));
              
              toast.success("Thought added!");
            }
          }}
        />

        {/* Review Modal */}
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          eventTitle={selectedEvent?.title || ""}
          reviews={selectedEvent?.reviews || []}
          averageRating={selectedEvent?.averageRating || 0}
          totalReviews={selectedEvent?.totalReviews || 0}
        />

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
                    <span><strong>Organizers:</strong> {selectedEvent?.organizers?.map((org: any) => org.name).join(', ')}</span>
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
    </>
  );
};

export default Events;
