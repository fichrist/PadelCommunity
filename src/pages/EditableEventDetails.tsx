import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Calendar, Users, Clock, DollarSign, Star, MessageCircle, UserPlus, Play, User, Plus, Search, Heart, Repeat2, BookOpen, Share2, Link, Copy, Check, Flag, Send, Edit, Save, X, Upload, Camera } from "lucide-react";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import EventCard from "@/components/EventCard";

// Import centralized events data
import { getEventById, formatEventForDetail, elenaProfile, ariaProfile } from "@/data/events";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";

const EditableEventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
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
  const [selectedImage, setSelectedImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm();

  // Get event from centralized data
  const rawEvent = getEventById(eventId || "");
  const event = rawEvent ? formatEventForDetail(rawEvent, false) : null;

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    // Populate form with current event data
    setValue("title", event.title);
    setValue("description", event.description);
    setValue("fullDescription", event.fullDescription);
    setValue("date", event.date);
    setValue("time", event.time);
    setValue("location", event.location);
    setValue("price", event.price);
    setSelectedImage(event.image);
  };

  const handleSave = handleSubmit((data) => {
    toast.success("Event updated successfully!");
    setIsEditMode(false);
    // Here you would typically save to backend
  });

  const handleCancel = () => {
    setIsEditMode(false);
    setSelectedImage("");
    reset();
  };

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message to send");
      return;
    }

    const nonAnonymousAttendees = event.attendees.filter(a => !a.isAnonymous);
    setBroadcastModalOpen(false);
    
    for (let i = 0; i < nonAnonymousAttendees.length; i++) {
      const attendee = nonAnonymousAttendees[i];
      setTimeout(() => {
        toast.success(`Message sent to ${attendee.name}`, {
          description: `"${broadcastMessage.substring(0, 50)}${broadcastMessage.length > 50 ? '...' : ''}"`
        });
      }, i * 500);
    }
    
    setBroadcastMessage("");
    toast.success(`Broadcasting to ${nonAnonymousAttendees.length} attendees`);
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
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <img src={spiritualLogo} alt="Spirit" className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-primary font-comfortaa">Spirit</span>
              </div>
              
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
              
              <div className="flex items-center space-x-3">
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
                <ProfileDropdown userImage={elenaProfile} userName="Elena Moonchild" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
          <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              {/* Edit/Save/Cancel buttons */}
              {!isEditMode ? (
                <Button onClick={handleEdit} className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Event</span>
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button onClick={handleSave} className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2">
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Event Title */}
            {isEditMode ? (
              <div className="mb-8">
                <Label htmlFor="title" className="text-sm font-medium mb-2 block">Event Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  className="text-4xl font-bold text-center h-auto py-4 border-2 border-primary/20 focus:border-primary"
                />
              </div>
            ) : (
              <h1 className="text-4xl font-bold mb-8 text-foreground text-center">
                {event.title}
              </h1>
            )}
          
            {/* Event Image */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src={selectedImage || event.image}
                  alt={event.title}
                  className="w-[900px] h-[580px] object-cover rounded-lg shadow-lg"
                />
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {event.tags.map((tag, index) => (
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
              >
                <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground">Comment</span>
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
                      {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {linkCopied ? "Copied!" : "Copy Link"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Information */}
              <Card className="bg-card/90 backdrop-blur-sm border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                      {isEditMode ? (
                        <Input {...register("date")} className="mt-1" />
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.date}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                      {isEditMode ? (
                        <Input {...register("time")} className="mt-1" />
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    {isEditMode ? (
                      <Input {...register("location")} className="mt-1" />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                    {isEditMode ? (
                      <Input {...register("price")} className="mt-1" />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.price}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="bg-card/90 backdrop-blur-sm border border-border">
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditMode ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Short Description</Label>
                        <Textarea
                          id="description"
                          {...register("description")}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullDescription">Full Description</Label>
                        <Textarea
                          id="fullDescription"
                          {...register("fullDescription")}
                          className="mt-1"
                          rows={6}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {event.fullDescription}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Organizers */}
              <Card className="bg-card/90 backdrop-blur-sm border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Organizers</span>
                    <Button
                      onClick={() => setBroadcastModalOpen(true)}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send Message to All</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.organizers.map((organizer, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={organizer.avatar} />
                          <AvatarFallback>{organizer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{organizer.name}</h3>
                          <p className="text-sm text-muted-foreground">{organizer.role}</p>
                          <p className="text-sm text-muted-foreground">{organizer.location}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/healer/${index + 1}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Event Community */}
              <Card className="bg-card/90 backdrop-blur-sm border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Event Community</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => navigate(`/chat?group=${event.title}&date=${event.date}`)}
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Start Group Chat</span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees.length} attendees</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {event.attendees.slice(0, 8).map((attendee, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={attendee.avatar} />
                            <AvatarFallback className="text-xs">
                              {attendee.isAnonymous ? "?" : attendee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attendee.isAnonymous ? "Anonymous" : attendee.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {attendee.isAnonymous ? "" : attendee.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {event.attendees.length > 8 && (
                      <p className="text-sm text-muted-foreground">
                        +{event.attendees.length - 8} more attendees
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Pricing Options */}
              <Card className="bg-card/90 backdrop-blur-sm border border-border sticky top-8">
                <CardHeader>
                  <CardTitle>Reserve Your Spot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.priceOptions.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="price"
                          value={option.type}
                          disabled={option.soldOut}
                          className="w-4 h-4 text-primary"
                          onChange={() => setSelectedPrice(option.type)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${option.soldOut ? 'text-muted-foreground' : ''}`}>
                              {option.type}
                            </span>
                            <span className={`font-semibold ${option.soldOut ? 'text-muted-foreground' : ''}`}>
                              {option.price}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                          {option.soldOut && <p className="text-sm text-red-500">Sold Out</p>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add-ons */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Add-ons</h4>
                    <div className="space-y-3">
                      {event.addOns.map((addon) => (
                        <div key={addon.id} className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={addon.id}
                              checked={selectedAddOns.includes(addon.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAddOns([...selectedAddOns, addon.id]);
                                } else {
                                  setSelectedAddOns(selectedAddOns.filter(id => id !== addon.id));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <label htmlFor={addon.id} className="text-sm font-medium cursor-pointer">
                                  {addon.name}
                                </label>
                                <span className="text-sm font-semibold">{addon.price}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{addon.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setEnrollmentModalOpen(true)}
                  >
                    Join Event
                  </Button>
                </CardContent>
              </Card>

              {/* Related Events */}
              <Card className="bg-card/90 backdrop-blur-sm border border-border">
                <CardHeader>
                  <CardTitle>More from this Organizer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <EventCard
                    eventId="2"
                    title="Crystal Healing Workshop for Beginners"
                    description="Learn to select, cleanse, and work with crystals for healing, protection, and spiritual growth."
                    date="April 2-4, 2024"
                    location="Crystal Cave Studio, Asheville NC"
                    organizers={[{ name: "Aria Starseed", avatar: ariaProfile, id: "healer-1" }]}
                    attendees={12}
                    category="Workshop"
                    image={crystalWorkshopEvent}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Enrollment Modal */}
        <Dialog open={enrollmentModalOpen} onOpenChange={setEnrollmentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Join {event.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-visible"
                  checked={allowVisible}
                  onCheckedChange={(checked) => setAllowVisible(checked as boolean)}
                />
                <Label htmlFor="allow-visible" className="text-sm">
                  Allow other members to see that you're attending
                </Label>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEnrollmentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setEnrollmentModalOpen(false);
                    toast.success("Successfully joined the event!");
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mass Message Modal */}
        <Dialog open={broadcastModalOpen} onOpenChange={setBroadcastModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Message to All Attendees</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={4}
              />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setBroadcastModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleBroadcastMessage}
                >
                  Send to All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditableEventDetails;