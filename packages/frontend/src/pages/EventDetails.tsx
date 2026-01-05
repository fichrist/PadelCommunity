import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Clock, DollarSign, Star, MessageCircle, UserPlus, Play, User, Plus, Search, Heart, Repeat2, BookOpen, Share2, Link, Copy, Check, Flag, Send, Edit, Save, X } from "lucide-react";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import EventCard from "@/components/EventCard";
import CommunityEventCard from "@/components/CommunityEventCard";
import { getEventById, deleteEvent } from "@/lib/events";
import { elenaProfile } from "@/data/healers";
import spiritualBackground from "@/assets/spiritual-background.jpg";
import { supabase } from "@/integrations/supabase/client";
import ThoughtsModal from "@/components/ThoughtsModal";
import { getThoughtsByEventId } from "@/lib/thoughts";
import { format } from "date-fns";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [allowVisible, setAllowVisible] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReshared, setIsReshared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isHealerMode, setIsHealerMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [organizer, setOrganizer] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [loadedThoughts, setLoadedThoughts] = useState<any[]>([]);
  const [thoughtsCount, setThoughtsCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message to send");
      return;
    }

    // In healer mode, show all attendees; in reader mode, filter out anonymous
    const targetAttendees = isHealerMode ? event.attendees : event.attendees.filter(a => !a.isAnonymous);
    setBroadcastModalOpen(false);
    
    // Send message to each attendee individually with a delay between each
    for (let i = 0; i < targetAttendees.length; i++) {
      const attendee = targetAttendees[i];
      const displayName = attendee.isAnonymous && isHealerMode ? attendee.name : attendee.isAnonymous ? `Anonymous User ${i + 1}` : attendee.name;
      setTimeout(() => {
        toast.success(`Message sent to ${displayName}`, {
          description: `"${broadcastMessage.substring(0, 50)}${broadcastMessage.length > 50 ? '...' : ''}"`
        });
      }, i * 500); // 500ms delay between each popup
    }
    
    setBroadcastMessage("");
    toast.success(`Broadcasting to ${targetAttendees.length} attendees`);
  };

  const handleSave = () => {
    // Here you would normally save to a backend
    toast.success("Event updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEvent(null);
    setIsEditing(false);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditedEvent((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch event from database
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      setLoading(true);
      const dbEvent = await getEventById(eventId);
      
      if (dbEvent) {
        // Format prices from database
        const priceOptions = (dbEvent.prices || []).map((price: any) => ({
          type: price.text || 'Standard',
          price: `€${price.amount}`,
          description: price.description || '',
          soldOut: false
        }));
        
        // Format additional options from database
        const addOns = (dbEvent.additional_options || []).map((option: any, index: number) => ({
          id: `addon-${index}`,
          name: option.name || '',
          price: `€${option.price}`,
          description: option.description || ''
        }));
        
        // Format event for display with database data
        const formattedEvent = {
          id: dbEvent.id,
          user_id: dbEvent.user_id,
          title: dbEvent.title,
          description: dbEvent.description,
          fullDescription: dbEvent.full_description || dbEvent.description,
          street: dbEvent.street,
          city: dbEvent.city,
          postal_code: dbEvent.postal_code,
          country: dbEvent.country,
          location: [dbEvent.street, dbEvent.city, dbEvent.country].filter(Boolean).join(', ') || 'Location TBD',
          date: dbEvent.end_date 
            ? `${format(new Date(dbEvent.start_date), 'd MMMM yyyy')} - ${format(new Date(dbEvent.end_date), 'd MMMM yyyy')}` 
            : format(new Date(dbEvent.start_date), 'd MMMM yyyy'),
          time: dbEvent.time || 'TBD',
          tags: dbEvent.tags || [],
          image: dbEvent.image_url || spiritualBackground,
          price: priceOptions.length > 0 ? priceOptions[0].price : '€25',
          organizers: [{
            name: 'Event Creator',
            avatar: elenaProfile,
            location: [dbEvent.city, dbEvent.country].filter(Boolean).join(', ') || 'Location TBD',
            previousEvents: []
          }],
          attendees: [{
            name: 'Anonymous',
            avatar: elenaProfile,
            location: '',
            isAnonymous: true
          }],
          priceOptions: priceOptions.length > 0 ? priceOptions : [{
            type: 'Standard',
            price: '€25',
            description: 'Regular admission',
            soldOut: false
          }],
          addOns: addOns
        };
        
        setEvent(formattedEvent);
      }
      setLoading(false);
    };
    
    fetchEvent();
  }, [eventId]);

  // Fetch organizer and attendees
  useEffect(() => {
    const fetchCommunity = async () => {
      if (!event || !event.user_id) return;

      // Fetch organizer profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', event.user_id)
        .single();

      if (profile) {
        const fullName = profile.display_name || 
                        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
                        'Event Organizer';
        const location = [profile.city, profile.country].filter(Boolean).join(', ') || 'Location TBD';
        
        setOrganizer({
          id: profile.id,
          name: fullName,
          avatar: profile.avatar_url || elenaProfile,
          location: location
        });
      }

      // Fetch enrollments
      const { data: enrollments } = await (supabase as any)
        .from('enrollments')
        .select('*')
        .eq('event_id', event.id)
        .eq('status', 'confirmed');

      if (enrollments && enrollments.length > 0) {
        // Get user IDs from enrollments
        const userIds = enrollments.map((e: any) => e.user_id);
        
        // Fetch profiles for these users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, first_name, last_name, avatar_url, city, country, is_healer')
          .in('id', userIds);
        
        // Create a map of user_id to profile
        const profileMap = new Map();
        (profiles || []).forEach((profile: any) => {
          profileMap.set(profile.id, profile);
        });
        
        const isOrganizer = currentUserId && event.user_id === currentUserId;
        
        const formattedAttendees = enrollments
          .map((enrollment: any) => {
            // Organizers can always see full information
            if (!enrollment.allow_visible && !isOrganizer) {
              // Show as anonymous if user didn't allow visibility and viewer is not organizer
              return {
                id: enrollment.user_id,
                name: 'Anonymous',
                avatar: null,
                location: '',
                isAnonymous: true
              };
            }
            
            const profile = profileMap.get(enrollment.user_id);
            const fullName = profile?.display_name || 
                            `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                            'Anonymous User';
            const location = [profile?.city, profile?.country].filter(Boolean).join(', ') || '';
            
            return {
              id: enrollment.user_id,
              name: fullName,
              avatar: profile?.avatar_url || elenaProfile,
              location: location,
              isAnonymous: false,
              isHealer: profile?.is_healer || false
            };
          });

        setAttendees(formattedAttendees);
      }
    };

    fetchCommunity();
  }, [event, currentUserId]);

  // Fetch other events from the same healer
  useEffect(() => {
    const fetchHealerEvents = async () => {
      if (!organizer || !organizer.id) return;

      try {
        // Fetch all events from this healer
        const { data: healerEvents, error } = await (supabase as any)
          .from('events')
          .select('*')
          .eq('user_id', organizer.id)
          .neq('id', eventId) // Exclude current event
          .order('start_date', { ascending: true });

        if (error) {
          console.error("Error fetching healer events:", error);
          return;
        }

        if (!healerEvents || healerEvents.length === 0) return;

        // Get event IDs for fetching counts
        const eventIds = healerEvents.map((e: any) => e.id);

        // Fetch enrollment counts
        const enrollmentCountsMap = new Map();
        if (eventIds.length > 0) {
          const { data: enrollmentCounts } = await (supabase as any)
            .from('enrollments')
            .select('event_id')
            .in('event_id', eventIds)
            .eq('status', 'confirmed');
          
          (enrollmentCounts || []).forEach((enrollment: any) => {
            const currentCount = enrollmentCountsMap.get(enrollment.event_id) || 0;
            enrollmentCountsMap.set(enrollment.event_id, currentCount + 1);
          });
        }

        // Fetch thought counts
        const thoughtCountsMap = new Map();
        if (eventIds.length > 0) {
          const { data: thoughtCounts } = await (supabase as any)
            .from('thoughts')
            .select('event_id')
            .in('event_id', eventIds)
            .not('event_id', 'is', null);
          
          (thoughtCounts || []).forEach((thought: any) => {
            const currentCount = thoughtCountsMap.get(thought.event_id) || 0;
            thoughtCountsMap.set(thought.event_id, currentCount + 1);
          });
        }

        // Separate into upcoming and past
        const now = new Date();
        const upcoming: any[] = [];
        const past: any[] = [];

        healerEvents.forEach((evt: any) => {
          const eventDate = new Date(evt.start_date);
          const eventData = {
            eventId: evt.id,
            title: evt.title,
            image: evt.image_url || spiritualBackground,
            dateRange: { 
              start: format(eventDate, 'd MMMM yyyy'),
              end: evt.end_date ? format(new Date(evt.end_date), 'd MMMM yyyy') : undefined
            },
            author: { 
              id: organizer.id,
              name: organizer.name,
              avatar: organizer.avatar,
              role: 'Healer',
              isHealer: true
            },
            location: `${evt.city || ''}${evt.city && evt.country ? ', ' : ''}${evt.country || ''}`.trim() || 'Location TBD',
            attendees: enrollmentCountsMap.get(evt.id) || 0,
            tags: evt.tags || [],
            thought: evt.description || "",
            comments: thoughtCountsMap.get(evt.id) || 0,
            isPastEvent: eventDate < now
          };

          if (eventDate >= now) {
            upcoming.push(eventData);
          } else {
            past.push(eventData);
          }
        });

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error("Error fetching healer events:", error);
      }
    };

    fetchHealerEvents();
  }, [organizer, eventId]);

  const displayEvent = editedEvent || event;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading event...</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center h-screen">Event not found</div>;
  }

  return (
    <>
        {/* Header */}
        <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
          <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/events')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              {/* Edit and Delete buttons - only visible for event creator */}
              {currentUserId && event.user_id === currentUserId && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/editevent/${event.id}`)}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete Event
                  </Button>
                </div>
              )}
            </div>
            
            {/* Title with Edit Controls */}
            <div className="flex items-center justify-center mb-8 relative">
              {isEditing && isHealerMode ? (
                <Input
                  value={displayEvent.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="text-4xl font-bold text-center border-2 border-primary/30 max-w-4xl"
                />
              ) : (
                <h1 className="text-4xl font-bold text-foreground text-center">
                  {displayEvent.title}
                </h1>
              )}
              
              {/* Edit Controls positioned to the right of title */}
              {isHealerMode && (
                <div className="absolute right-0 flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedEvent({ ...event });
                        setIsEditing(true);
                      }}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </Button>
                  )}
                </div>
              )}
            </div>
          
          {/* Large Event Image */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src={displayEvent.image}
                alt={displayEvent.title}
                className="w-[900px] h-[580px] object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Tags under image */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {displayEvent.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-sm cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Social buttons */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex flex-col items-center space-y-1 p-3 h-auto"
              onClick={async () => {
                if (eventId) {
                  const thoughts = await getThoughtsByEventId(eventId);
                  setLoadedThoughts(thoughts);
                  setThoughtsCount(thoughts.length);
                }
                setThoughtsModalOpen(true);
              }}
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              <span className="text-xs text-muted-foreground">Thoughts</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex flex-col items-center space-y-1 p-3 h-auto transition-colors ${isReshared ? 'text-green-500' : 'text-muted-foreground hover:text-green-500'}`}
              onClick={() => setIsReshared(!isReshared)}
            >
              <Repeat2 className="h-5 w-5" />
              <span className="text-xs">Reshare</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex flex-col items-center space-y-1 p-3 h-auto transition-colors ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              onClick={() => setIsSaved(!isSaved)}
            >
              <BookOpen className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              <span className="text-xs">Save</span>
            </Button>
            <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex flex-col items-center space-y-1 p-3 h-auto text-muted-foreground hover:text-primary transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-xs">Share</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                      toast.success("Link copied to clipboard!");
                      setSharePopoverOpen(false);
                    }}
                  >
                    {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                    Copy Link
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Event description */}
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-4xl mx-auto">
            {event.description}
          </p>
        </div>
      </div>

      <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content - About Event and Event Community Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* About Event */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About this Event</CardTitle>
              </CardHeader>
               <CardContent>
                 {isEditing && isHealerMode ? (
                   <Textarea
                     value={displayEvent.fullDescription}
                     onChange={(e) => handleEditChange('fullDescription', e.target.value)}
                     className="min-h-[200px] border-2 border-primary/30"
                   />
                 ) : (
                   <p className="text-foreground/90 leading-relaxed mb-6">
                     {displayEvent.fullDescription}
                   </p>
                 )}
                
                 {/* Event Video */}
                <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4 inline-block">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Event Preview Video</p>
                    <p className="text-sm text-muted-foreground mt-1">Click to watch introduction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar with Event Community, Pricing, and Event Details */}
          <div className="space-y-6">
            {/* Event Community */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Event Community</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Organizers */}
                  <div>
                     <h3 className="text-sm font-medium text-muted-foreground mb-3">Organizer ({organizer ? 1 : 0})</h3>
                     <div className="space-y-3">
                       {organizer && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar 
                              className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
                              onClick={() => navigate(`/healer/${organizer.id}`)}
                            >
                              <AvatarImage src={organizer.avatar} />
                              <AvatarFallback className="bg-primary/10">
                                {organizer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div 
                                className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/healer/${organizer.id}`)}
                              >
                                {organizer.name}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {organizer.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
                              onClick={() => {
                                navigate('/chat');
                                toast.success(`Opening chat with ${organizer.name}`);
                              }}
                            >
                              <MessageCircle className="h-4 w-4 text-primary" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
                              onClick={() => {
                                toast.success(`Connection request sent to ${organizer.name}`);
                              }}
                            >
                              <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendees */}
                  <div>
                     <h3 className="text-sm font-medium text-muted-foreground mb-3">
                       Attendees ({attendees.length})
                     </h3>
                     <div className="space-y-3">
                       {attendees.length > 0 ? (
                         attendees.map((attendee, index) => (
                         <div key={index} className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                             <Avatar 
                               className={`h-8 w-8 ${!attendee.isAnonymous ? 'cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all' : ''}`}
                               onClick={() => {
                                 if (!attendee.isAnonymous && attendee.id) {
                                   const targetRoute = attendee.isHealer ? `/healer/${attendee.id}` : `/profile/${attendee.id}`;
                                   navigate(targetRoute);
                                 }
                               }}
                             >
                               {attendee.isAnonymous && !isHealerMode ? (
                                 <AvatarFallback className="bg-muted">
                                   <User className="h-4 w-4 text-muted-foreground" />
                                 </AvatarFallback>
                               ) : (
                                 <>
                                   <AvatarImage src={attendee.avatar} />
                                   <AvatarFallback className="bg-primary/10">
                                     {attendee.name.split(' ').map(n => n[0]).join('')}
                                   </AvatarFallback>
                                 </>
                               )}
                             </Avatar>
                             <div className="flex-1">
                               <div 
                                 className={`text-sm font-medium ${!attendee.isAnonymous ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                                 onClick={() => {
                                   if (!attendee.isAnonymous && attendee.id) {
                                     const targetRoute = attendee.isHealer ? `/healer/${attendee.id}` : `/profile/${attendee.id}`;
                                     navigate(targetRoute);
                                   }
                                 }}
                               >
                                 {attendee.name}
                               </div>
                               {attendee.isAnonymous && isHealerMode && (
                                 <div className="text-xs text-muted-foreground">
                                   (was anonymous)
                                 </div>
                               )}
                               {attendee.location && (
                                 <div className="flex items-center text-xs text-muted-foreground">
                                   <MapPin className="h-3 w-3 mr-1" />
                                   {attendee.location}
                                 </div>
                               )}
                             </div>
                           </div>
                           {(attendee.name !== "Anonymous" || isHealerMode) && (
                             <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
                                onClick={() => {
                                  navigate('/chat');
                                  toast.success(`Opening chat with ${attendee.name}`);
                                }}
                              >
                                <MessageCircle className="h-3 w-3 text-primary" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 rounded-full hover:bg-red-50"
                                onClick={() => {
                                  toast.success(`Connection request sent to ${attendee.name}`);
                                }}
                              >
                                <Heart className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                       ) : (
                         <p className="text-sm text-muted-foreground text-center py-4">
                           No attendees yet. Be the first to join!
                         </p>
                       )}
                     </div>
                  </div>

                  {/* Group Chat Section */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        navigate('/chat');
                        toast.success(`Started group chat: "${event.title} - ${event.date}"`);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Group Chat
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => setBroadcastModalOpen(true)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message to All
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Chat with organizers and attendees
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.priceOptions.map((option, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${option.soldOut ? 'opacity-50 bg-muted/30' : ''}`}>
                      <div>
                        <span className={`font-medium ${option.soldOut ? 'line-through' : ''}`}>{option.type}</span>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        {option.soldOut && (
                          <p className="text-xs text-destructive font-medium">Sold Out</p>
                        )}
                      </div>
                      <span className={`font-bold text-lg ${option.soldOut ? 'text-muted-foreground line-through' : 'text-primary'}`}>{option.price}</span>
                    </div>
                  ))}
                </div>

                {/* Add-ons Preview */}
                {event.addOns && event.addOns.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Optional Add-ons</h3>
                    <div className="space-y-2">
                      {event.addOns.slice(0, 2).map((addon) => (
                        <div key={addon.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{addon.name}</span>
                          <span className="font-medium text-primary">{addon.price}</span>
                        </div>
                      ))}
                      {event.addOns.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{event.addOns.length - 2} more options available during registration
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Date</span>
                      <p className="font-medium">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Time</span>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Location</span>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons in Event Details */}
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => setEnrollmentModalOpen(true)}
                  >
                    Join Event
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => toast.success("Event reported. Thank you for helping keep our community safe.")}
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      Report Event
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Events from this Healer */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events from this Healer</h2>
            <div className="relative">
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {upcomingEvents.map((evt, index) => (
                  <CommunityEventCard
                    key={evt.eventId}
                    {...evt}
                    index={index}
                    isHorizontal={true}
                    onOpenThoughts={async (eventData) => {
                      const thoughts = await getThoughtsByEventId(eventData.eventId);
                      setLoadedThoughts(thoughts);
                      setThoughtsModalOpen(true);
                    }}
                    isReshared={false}
                    onToggleReshare={() => {
                      toast.success("Event reshared!");
                    }}
                    isSaved={false}
                    onToggleSave={() => {
                      toast.success("Saved to your private page!");
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Past Events from this Healer */}
        {pastEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Past Events from this Healer</h2>
            <div className="relative">
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {pastEvents.map((evt, index) => (
                  <CommunityEventCard
                    key={evt.eventId}
                    {...evt}
                    index={index}
                    isHorizontal={true}
                    isPastEvent={true}
                    onOpenThoughts={async (eventData) => {
                      const thoughts = await getThoughtsByEventId(eventData.eventId);
                      setLoadedThoughts(thoughts);
                      setThoughtsModalOpen(true);
                    }}
                    isReshared={false}
                    onToggleReshare={() => {
                      toast.success("Event reshared!");
                    }}
                    isSaved={false}
                    onToggleSave={() => {
                      toast.success("Saved to your private page!");
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
        
        {/* Enrollment Modal */}
        <Dialog open={enrollmentModalOpen} onOpenChange={(open) => {
          setEnrollmentModalOpen(open);
          if (open) {
            // Auto-select pricing option if only one available
            const availableOptions = event.priceOptions.filter(option => !option.soldOut);
            if (availableOptions.length === 1) {
              setSelectedPrice(availableOptions[0].type);
            } else if (availableOptions.length === 0) {
              // Also check if "Pay at Entry" is the only option
              setSelectedPrice("Pay at Entry");
            }
          }
        }}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Join {event.title}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Pricing Options */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pricing Options</h3>
                  <div className="space-y-3">
                    {event.priceOptions.map((option, index) => (
                      <label 
                        key={index} 
                        className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
                          option.soldOut 
                            ? 'cursor-not-allowed opacity-60 bg-muted/30' 
                            : 'cursor-pointer hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priceOption"
                          value={option.type}
                          checked={selectedPrice === option.type}
                          onChange={(e) => setSelectedPrice(e.target.value)}
                          disabled={option.soldOut}
                          className="text-primary focus:ring-primary disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${option.soldOut ? 'text-muted-foreground' : ''}`}>
                                {option.type}
                              </span>
                              {option.soldOut && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                  SOLD OUT
                                </span>
                              )}
                            </div>
                            <span className={`font-bold ${option.soldOut ? 'text-muted-foreground' : 'text-primary'}`}>
                              {option.price}
                            </span>
                          </div>
                          <p className={`text-sm ${option.soldOut ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox 
                      id="allow-visible" 
                      checked={allowVisible}
                      onCheckedChange={(checked) => setAllowVisible(checked === true)}
                    />
                    <div>
                      <Label htmlFor="allow-visible" className="text-sm font-medium">
                        Allow others to see me attending
                      </Label>
                      <p className="text-xs text-muted-foreground">Others will see you're attending this event</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-sm font-medium">
                      Remarks (Optional)
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="Any special requests, dietary restrictions, or notes for the organizer..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      This information will be shared with the event organizer
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What to Expect</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Confirmation email with event details</li>
                    <li>• Location and parking information</li>
                    <li>• What to bring and how to prepare</li>
                    <li>• Organizer contact information</li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Add-ons */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Optional Add-ons</h3>
                  {event.addOns && event.addOns.length > 0 ? (
                    <div className="space-y-3">
                      {event.addOns.map((addon, index) => (
                        <label key={addon.id} className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <Checkbox
                            checked={selectedAddOns.includes(addon.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAddOns([...selectedAddOns, addon.id]);
                              } else {
                                setSelectedAddOns(selectedAddOns.filter(id => id !== addon.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{addon.name}</span>
                              <span className="font-bold text-primary text-sm">{addon.price}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{addon.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 border rounded-lg bg-muted/30">
                      <p>No add-ons available for this event</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-8">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEnrollmentModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!selectedPrice}
                    onClick={async () => {
                      if (!currentUserId) {
                        toast.error("Please log in to enroll in events");
                        return;
                      }

                      try {
                        // Check if user is already enrolled
                        const { data: existingEnrollment } = await (supabase as any)
                          .from('enrollments')
                          .select('id')
                          .eq('event_id', event.id)
                          .eq('user_id', currentUserId)
                          .single();

                        if (existingEnrollment) {
                          toast.error("You are already enrolled in this event");
                          return;
                        }

                        // Create enrollment record
                        const { error: enrollmentError } = await (supabase as any)
                          .from('enrollments')
                          .insert({
                            event_id: event.id,
                            user_id: currentUserId,
                            selected_price_option: selectedPrice,
                            selected_add_ons: selectedAddOns,
                            allow_visible: allowVisible,
                            remarks: remarks.trim() || null,
                            status: 'confirmed'
                          });

                        if (enrollmentError) {
                          console.error('Enrollment error:', enrollmentError);
                          toast.error("Failed to enroll. Please try again.");
                          return;
                        }

                        const addOnNames = selectedAddOns.map(id => event.addOns?.find(addon => addon.id === id)?.name).filter(Boolean).join(', ');
                        const message = addOnNames 
                          ? `Successfully enrolled in ${event.title} with add-ons: ${addOnNames}! Check your email for confirmation.`
                          : `Successfully enrolled in ${event.title}! Check your email for confirmation.`;
                        
                        toast.success(message);
                        setEnrollmentModalOpen(false);
                        setSelectedAddOns([]);
                        setSelectedPrice("");
                        setRemarks("");
                        
                        // Refresh attendees list
                        const { data: updatedEnrollments } = await (supabase as any)
                          .from('enrollments')
                          .select('*')
                          .eq('event_id', event.id)
                          .eq('status', 'confirmed');

                        if (updatedEnrollments && updatedEnrollments.length > 0) {
                          // Get user IDs from enrollments
                          const userIds = updatedEnrollments.map((e: any) => e.user_id);
                          
                          // Fetch profiles for these users
                          const { data: profiles } = await supabase
                            .from('profiles')
                            .select('id, display_name, first_name, last_name, avatar_url, city, country')
                            .in('id', userIds);
                          
                          // Create a map of user_id to profile
                          const profileMap = new Map();
                          (profiles || []).forEach((profile: any) => {
                            profileMap.set(profile.id, profile);
                          });
                          
                          const isOrganizer = currentUserId && event.user_id === currentUserId;
                          
                          const formattedAttendees = updatedEnrollments
                            .map((enrollment: any) => {
                              // Organizers can always see full information
                              if (!enrollment.allow_visible && !isOrganizer) {
                                // Show as anonymous if user didn't allow visibility and viewer is not organizer
                                return {
                                  id: enrollment.user_id,
                                  name: 'Anonymous',
                                  avatar: null,
                                  location: '',
                                  isAnonymous: true
                                };
                              }
                              
                              const profile = profileMap.get(enrollment.user_id);
                              const fullName = profile?.display_name || 
                                              `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                                              'Anonymous User';
                              const location = [profile?.city, profile?.country].filter(Boolean).join(', ') || '';
                              
                              return {
                                id: enrollment.user_id,
                                name: fullName,
                                avatar: profile?.avatar_url || elenaProfile,
                                location: location,
                                isAnonymous: false
                              };
                            });

                          setAttendees(formattedAttendees);
                        }
                      } catch (error) {
                        console.error('Error enrolling:', error);
                        toast.error("An error occurred. Please try again.");
                      }
                    }}
                  >
                    Confirm Enrollment
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Reviews Modal */}
        <Dialog open={reviewsModalOpen} onOpenChange={setReviewsModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reviews for {event.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Add Review Section */}
              <div className="border-b pb-4">
                <h3 className="font-medium mb-3">Add Your Review</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="rating" className="text-sm">Rating</Label>
                    <div className="flex space-x-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-5 w-5 cursor-pointer transition-colors ${
                            star <= newRating 
                              ? 'fill-current text-yellow-400' 
                              : 'text-muted-foreground hover:text-yellow-300'
                          }`}
                          onClick={() => setNewRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="review" className="text-sm">Your Review</Label>
                    <textarea 
                      id="review"
                      placeholder="Share your experience..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md text-sm min-h-20 resize-none"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!newReview.trim()}
                    onClick={() => {
                      toast.success("Review submitted successfully!");
                      setNewReview("");
                      setNewRating(5);
                    }}
                  >
                    Submit Review
                  </Button>
                </div>
              </div>
              
              {/* All Reviews */}
              <div className="space-y-4 max-h-80 overflow-y-auto">
                <h3 className="font-medium">All Reviews (24)</h3>
                <div className="space-y-4">
                  <div className="border-l-2 border-primary/20 pl-3 pb-3 border-b border-muted">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Sarah M. - March 10, 2024</span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      "Absolutely transformative experience. Elena's sound healing brought me to tears of joy. The crystal bowls created such beautiful harmonics that I felt my entire being vibrating in perfect resonance."
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-primary/20 pl-3 pb-3 border-b border-muted">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Michael R. - March 8, 2024</span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      "The energy in the room was incredible. I felt completely renewed after the session. David's assistance made everyone feel welcome and supported throughout the journey."
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-primary/20 pl-3 pb-3 border-b border-muted">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Luna K. - March 5, 2024</span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      "Elena creates such a sacred space. The crystal bowls transported me to another dimension. I've been to many sound baths, but this was exceptional."
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-primary/20 pl-3 pb-3 border-b border-muted">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">David T. - February 28, 2024</span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      "Perfect for beginners. Very welcoming environment and amazing healing energy. I was nervous at first but felt so supported throughout."
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-primary/20 pl-3 pb-3 border-b border-muted">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">River S. - February 25, 2024</span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      "The full moon energy combined with sound healing was extraordinary. Highly recommend! This is exactly what my soul needed."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Broadcast Message Modal */}
        <Dialog open={broadcastModalOpen} onOpenChange={setBroadcastModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Message to All Attendees</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="broadcast-message" className="text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="broadcast-message"
                  placeholder="Type your message here..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This message will be sent individually to all {displayEvent.attendees.length} attendees.
              </p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setBroadcastModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleBroadcastMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Send to All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete "{event.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={async () => {
                    if (!eventId) return;
                    
                    const result = await deleteEvent(eventId);
                    
                    if (result) {
                      toast.success("Event deleted successfully");
                      setDeleteConfirmOpen(false);
                      navigate('/events');
                    } else {
                      toast.error("Failed to delete event. Please try again.");
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Thoughts Modal */}
        <ThoughtsModal
          open={thoughtsModalOpen}
          onOpenChange={setThoughtsModalOpen}
          postId={eventId || ''}
          postTitle={event.title}
          thoughts={loadedThoughts}
          isEvent={true}
          onThoughtAdded={async () => {
            if (eventId) {
              const thoughts = await getThoughtsByEventId(eventId);
              setLoadedThoughts(thoughts);
              setThoughtsCount(thoughts.length);
            }
            toast.success("Thought added!");
          }}
        />
    </>
    );
  };
  
  export default EventDetails;
