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
  const [allTags, setAllTags] = useState<string[]>([
    "Movement", "Dance", "Yoga", "Exhibition", "Festival", "Garden",
    "Workshop", "Education", "Sacred Geometry", "Sound Bath", "Chakras",
    "Energy Work", "Healing", "Ceremony", "Full Moon", "Meditation",
    "Morning Practice", "Nature", "Walking", "Mindfulness"
  ]);
  const navigate = useNavigate();

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      const dbEvents = await getAllEvents();
      
      // Format events for display
      const formattedEvents = dbEvents.map((dbEvent: any) => ({
        eventId: dbEvent.id,
        title: dbEvent.title,
        description: dbEvent.description,
        location: [dbEvent.city, dbEvent.country].filter(Boolean).join(', ') || 'Location TBD',
        dateRange: {
          start: dbEvent.start_date ? format(new Date(dbEvent.start_date), 'd MMMM yyyy') : 'TBD',
          end: dbEvent.end_date ? format(new Date(dbEvent.end_date), 'd MMMM yyyy') : undefined
        },
        time: dbEvent.time,
        tags: dbEvent.tags || [],
        attendees: 10, // Default as requested
        connectionsGoing: [],
        comments: 0, // Default as requested
        image: dbEvent.image_url || spiritualBackground,
        isPastEvent: dbEvent.start_date ? new Date(dbEvent.start_date) < new Date() : false,
        organizers: [{
          id: 'organizer-1',
          name: 'Event Creator',
          avatar: elenaProfile
        }],
        thoughts: []
      }));
      
      setEvents(formattedEvents);
    };
    
    fetchEvents();
  }, []);

  const filteredEvents = filter === "all" ? events : 
    filter === "past" ? events.filter(event => event.isPastEvent) :
    events.filter(event => !event.isPastEvent);

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
                    name: event.organizers[0]?.name || 'Event Creator',
                    avatar: event.organizers[0]?.avatar || elenaProfile,
                    role: 'Event Organizer'
                  }}
                  location={event.location}
                  attendees={event.attendees}
                  tags={event.tags}
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
          onThoughtAdded={() => {
            // Optionally refresh thoughts here
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
