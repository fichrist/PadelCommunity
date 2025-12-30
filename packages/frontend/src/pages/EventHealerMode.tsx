import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Clock, DollarSign, Star, MessageCircle, UserPlus, Play, User, Plus, Search, Heart, Repeat2, BookOpen, Share2, Link, Copy, Check, Flag, Send, Edit, Save, X, Trash2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Import centralized events data
import { getEventById, formatEventForDetail, elenaProfile, davidProfile, ariaProfile, phoenixProfile } from "@/data/events";

const EventHealerMode = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
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
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [attendeesStates, setAttendeesStates] = useState<Record<number, string>>({});
  const [userSearchModalOpen, setUserSearchModalOpen] = useState(false);
  const [isHealerMode, setIsHealerMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<'organizer' | 'attendee'>('organizer');
  const [cancelEventModalOpen, setCancelEventModalOpen] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  const mockUsers = [
    { name: "Sarah Light", avatar: elenaProfile, location: "Phoenix, AZ", role: "Crystal Healer" },
    { name: "Michael Earth", avatar: davidProfile, location: "Sedona, AZ", role: "Energy Worker" },
    { name: "Luna Wisdom", avatar: ariaProfile, location: "Tucson, AZ", role: "Sound Healer" },
    { name: "River Stone", avatar: phoenixProfile, location: "Flagstaff, AZ", role: "Reiki Master" },
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get event from centralized data
  const rawEvent = getEventById(eventId || "");
  const event = rawEvent ? formatEventForDetail(rawEvent, true) : null;
  const [organizers, setOrganizers] = useState(event?.organizers || []);

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message to send");
      return;
    }

    setBroadcastModalOpen(false);
    const attendeesArray = Array.isArray(event?.attendees) ? event.attendees : [];
    
    for (let i = 0; i < attendeesArray.length; i++) {
      const attendee = attendeesArray[i];
      setTimeout(() => {
        toast.success(`Message sent to ${attendee.name}`, {
          description: `"${broadcastMessage.substring(0, 50)}${broadcastMessage.length > 50 ? '...' : ''}"`
        });
      }, i * 500);
    }
    
    setBroadcastMessage("");
    toast.success(`Broadcasting to ${attendeesArray.length} attendees`);
  };

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleRemoveOrganizer = (index: number) => {
    if (organizers.length > 1) {
      setOrganizers(prev => prev.filter((_, i) => i !== index));
      toast.success("Organizer removed");
    } else {
      toast.error("At least one organizer is required");
    }
  };

  const handleAddOrganizer = () => {
    setSearchMode('organizer');
    setUserSearchModalOpen(true);
  };

  const handleAddAttendee = () => {
    setSearchMode('attendee');
    setUserSearchModalOpen(true);
  };

  const handleSelectUser = (user: typeof mockUsers[0]) => {
    if (searchMode === 'organizer') {
      const newOrganizer = {
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        location: user.location,
        previousEvents: []
      };
      setOrganizers(prev => [...prev, newOrganizer]);
      toast.success(`${user.name} added as organizer`);
    } else {
      // Add as attendee to the event data (in real app, this would update the backend)
      toast.success(`${user.name} added as attendee`);
    }
    
    setUserSearchModalOpen(false);
    setSearchQuery("");
  };

  const handleAttendeeStateChange = (attendeeIndex: number, newState: string) => {
    setAttendeesStates(prev => ({
      ...prev,
      [attendeeIndex]: newState
    }));
  };

  const handleEditEvent = () => {
    // Navigate to dedicated edit event page
    navigate(`/editevent/${eventId}`);
  };

  const handleCancelEvent = async () => {
    if (!cancelMessage.trim()) {
      toast.error("Please enter a cancellation message");
      return;
    }

    setCancelEventModalOpen(false);
    
    // Send cancellation message to each attendee individually with a delay between each
    for (let i = 0; i < event.attendees.length; i++) {
      const attendee = event.attendees[i];
      setTimeout(() => {
        toast.success(`Cancellation notice sent to ${attendee.name}`, {
          description: `"${cancelMessage.substring(0, 50)}${cancelMessage.length > 50 ? '...' : ''}"`
        });
      }, i * 500); // 500ms delay between each popup
    }
    
    setCancelMessage("");
    toast.success(`Event cancelled and notifications sent to ${event.attendees.length} attendees`);
    
    // Navigate back to events page
    setTimeout(() => {
      navigate('/events');
    }, 2000);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
        {/* Top Navigation Bar */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8 py-2">
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
                    <Calendar className="h-9 w-9 text-primary" />
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
                <CreateDropdown onCreateShare={() => {}} />
                <NotificationDropdown />
                <ProfileDropdown userImage={elenaProfile} />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
          <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {/* Mode Toggle */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={!isHealerMode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(`/event/${eventId}`)}
                  className={`px-4 py-2 rounded-md transition-colors ${!isHealerMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Reader
                </Button>
                <Button
                  variant={isHealerMode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsHealerMode(true)}
                  className={`px-4 py-2 rounded-md transition-colors ${isHealerMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Healer
                </Button>
              </div>
            </div>

            {/* Healer Mode Badge */}
            {isHealerMode && (
              <div className="flex justify-center mb-4">
                <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                  Healer Mode - Full Attendee Visibility
                </Badge>
              </div>
            )}
            
            {/* Title with Edit and Cancel Buttons */}
            <div className="flex items-center justify-center mb-8 relative">
              <h1 className="text-4xl font-bold text-foreground text-center">
                {event.title}
              </h1>
              <div className="ml-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditEvent}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelEventModalOpen(true)}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Event
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Image */}
              <Card className="overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
                <CardContent className="p-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {event.fullDescription}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Event Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{event.date}</p>
                        <p className="text-sm text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{event.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{event.attendees.length} Attendees</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organizers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Organizers</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddOrganizer}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Organizer
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {organizers.map((organizer, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={organizer.avatar} />
                          <AvatarFallback>{organizer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{organizer.name}</h3>
                          <p className="text-sm text-muted-foreground">{organizer.role}</p>
                          <p className="text-sm text-muted-foreground">{organizer.location}</p>
                        </div>
                        {organizers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOrganizer(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Attendees List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Attendees ({event.attendees.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBroadcastModalOpen(true)}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Broadcast
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Attendees ({event.attendees.length})</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddAttendee}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attendee
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {event.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {attendee.name}
                          </p>
                          {attendee.location && (
                            <p className="text-xs text-muted-foreground truncate">
                              {attendee.location}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <Select
                            value={attendeesStates[index] || "Waiting for payment"}
                            onValueChange={(value) => handleAttendeeStateChange(index, value)}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Payment at entry">Payment at entry</SelectItem>
                              <SelectItem value="Waiting for payment">Waiting for payment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Attendee
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Group Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Cancel Event Modal */}
        <Dialog open={cancelEventModalOpen} onOpenChange={setCancelEventModalOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-md border border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">Cancel Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel this event? This action cannot be undone.
              </p>
              <div>
                <Label htmlFor="cancel-message">Cancellation Message *</Label>
                <Textarea
                  id="cancel-message"
                  placeholder="Enter a message to send to all attendees explaining the cancellation..."
                  value={cancelMessage}
                  onChange={(e) => setCancelMessage(e.target.value)}
                  className="min-h-[100px] bg-background/50 mt-2"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCancelEventModalOpen(false);
                    setCancelMessage("");
                  }}
                >
                  Keep Event
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelEvent}
                  disabled={!cancelMessage.trim()}
                >
                  Cancel Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Search Modal */}
        <Dialog open={userSearchModalOpen} onOpenChange={setUserSearchModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {searchMode === 'organizer' ? 'Add Organizer' : 'Add Attendee'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-search">Search Users</Label>
                <Input
                  id="user-search"
                  placeholder="Search by name, location, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredUsers.map((user, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg cursor-pointer"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                      <p className="text-xs text-muted-foreground">{user.location}</p>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No users found</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setUserSearchModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Broadcast Modal */}
        <Dialog open={broadcastModalOpen} onOpenChange={setBroadcastModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Broadcast Message to Attendees</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="broadcast-message">Message</Label>
                <Textarea
                  id="broadcast-message"
                  placeholder="Enter your message to all attendees..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setBroadcastModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBroadcastMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {event.attendees.length} attendees
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EventHealerMode;
