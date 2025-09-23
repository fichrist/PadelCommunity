import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
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

// Import images
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

const HealerEventMode = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<any>(null);
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

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message to send");
      return;
    }

    // In healer mode, show all attendees (no anonymous filtering)
    const allAttendees = event.attendees;
    setBroadcastModalOpen(false);
    
    // Send message to each attendee individually with a delay between each
    for (let i = 0; i < allAttendees.length; i++) {
      const attendee = allAttendees[i];
      const displayName = attendee.isAnonymous ? `Anonymous User ${i + 1}` : attendee.name;
      setTimeout(() => {
        toast.success(`Message sent to ${displayName}`, {
          description: `"${broadcastMessage.substring(0, 50)}${broadcastMessage.length > 50 ? '...' : ''}"`
        });
      }, i * 500); // 500ms delay between each popup
    }
    
    setBroadcastMessage("");
    toast.success(`Broadcasting to ${allAttendees.length} attendees`);
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

const eventData = {
    "1": {
      id: "1",
      title: "Full Moon Sound Healing Ceremony",
      description: "Experience the healing power of crystal bowls, gongs, and ancient chants in our sacred moonlight ceremony. This transformative sound healing session will align your chakras and restore inner peace under the powerful energy of the full moon.",
      fullDescription: "Join us for a deeply transformative sound healing experience that combines the mystical energy of the full moon with ancient healing frequencies. This ceremony features crystal singing bowls tuned to specific chakra frequencies, Tibetan gongs, and sacred chants that have been used for centuries to promote healing and spiritual awakening. The session begins with a guided meditation to help you connect with the lunar energy, followed by 90 minutes of immersive sound healing. You'll lie comfortably on yoga mats as the healing vibrations wash over you, releasing tension, clearing energy blocks, and promoting deep relaxation. Many participants report profound spiritual insights, emotional release, and a sense of renewal after these sessions.",
      image: soundHealingEvent,
      organizers: [
        { 
          name: "Elena Moonchild", 
          avatar: elenaProfile, 
          role: "Sound Healer", 
          location: "Sedona, AZ",
          previousEvents: [
            { title: "New Moon Meditation Circle", date: "Feb 28, 2024", attendees: 18 },
            { title: "Chakra Balancing Workshop", date: "Feb 14, 2024", attendees: 24 },
            { title: "Sound Bath Experience", date: "Jan 30, 2024", attendees: 32 }
          ]
        },
        { 
          name: "David Peace", 
          avatar: davidProfile, 
          role: "Assistant Healer", 
          location: "Sedona, AZ",
          previousEvents: [
            { title: "Mindfulness Retreat", date: "Mar 1, 2024", attendees: 15 },
            { title: "Healing Touch Workshop", date: "Feb 20, 2024", attendees: 20 }
          ]
        }
      ],
      date: "March 15, 2024",
      time: "7:00 PM - 9:30 PM",
      location: "Sacred Grove Sanctuary, Sedona AZ",
      price: "$65",
      priceOptions: [
        { type: "Early Bird", price: "$55", description: "Limited time offer", soldOut: true },
        { type: "Regular", price: "$65", description: "Standard price", soldOut: false },
        { type: "VIP", price: "$95", description: "Includes crystal gift & tea ceremony", soldOut: false }
      ],
      tags: ["Sound Healing", "Full Moon", "Chakra Alignment"],
      addOns: [
        { id: "cacao", name: "Sacred Cacao Ceremony", price: "$25", description: "Ceremonial cacao drink to open the heart chakra" },
        { id: "crystals", name: "Personal Crystal Set", price: "$35", description: "Take home your own set of charged healing crystals" },
        { id: "sage", name: "Sage Cleansing Kit", price: "$15", description: "White sage bundle and palo santo for home cleansing" },
        { id: "recording", name: "Session Recording", price: "$20", description: "Audio recording of the healing session for home practice" }
      ],
      attendees: [
        { name: "Sarah Light", avatar: elenaProfile, location: "Phoenix, AZ", isAnonymous: false },
        { name: "David Peace", avatar: davidProfile, location: "Tucson, AZ", isAnonymous: false },
        { name: "Luna Sage", avatar: ariaProfile, location: "Flagstaff, AZ", isAnonymous: false },
        { name: "Emma Wilson", avatar: phoenixProfile, location: "Scottsdale, AZ", isAnonymous: true }, // Real name shown in healer mode
        { name: "River Flow", avatar: phoenixProfile, location: "Scottsdale, AZ", isAnonymous: false },
        { name: "Mark Thompson", avatar: davidProfile, location: "Mesa, AZ", isAnonymous: true }, // Real name shown in healer mode
        { name: "Star Dreamer", avatar: elenaProfile, location: "Tempe, AZ", isAnonymous: false },
        { name: "Jessica Chen", avatar: ariaProfile, location: "Phoenix, AZ", isAnonymous: true }, // Real name shown in healer mode
      ]
    },
    "2": {
      id: "2",
      title: "Crystal Healing Workshop for Beginners",
      description: "Learn to select, cleanse, and work with crystals for healing, protection, and spiritual growth in this hands-on workshop.",
      fullDescription: "Discover the ancient art of crystal healing in this comprehensive beginner's workshop. You'll learn about the metaphysical properties of different crystals, how to choose the right stones for your needs, and various cleansing and charging techniques. The workshop includes hands-on practice with crystal layouts, meditation with stones, and creating your own crystal grid for manifestation. Each participant will receive a starter crystal kit including clear quartz, amethyst, rose quartz, and black tourmaline, along with a detailed guidebook. Aria will share her decade of experience working with crystals, including personal stories of transformation and healing. The intimate class size ensures personalized attention and plenty of opportunity for questions.",
      image: crystalWorkshopEvent,
      organizers: [
        { 
          name: "Aria Starseed", 
          avatar: ariaProfile, 
          role: "Crystal Healer", 
          location: "Asheville, NC",
          previousEvents: [
            { title: "Crystal Grid Mastery", date: "Mar 5, 2024", attendees: 12 },
            { title: "Gemstone Healing Circle", date: "Feb 22, 2024", attendees: 16 },
            { title: "Advanced Crystal Workshop", date: "Feb 8, 2024", attendees: 14 }
          ]
        }
      ],
      date: "April 2-4, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Crystal Cave Studio, Asheville NC",
      price: "$225",
      priceOptions: [
        { type: "Workshop Only", price: "$195", description: "3-day workshop access", soldOut: false },
        { type: "Workshop + Kit", price: "$225", description: "Includes crystal starter kit", soldOut: false },
        { type: "Premium Package", price: "$295", description: "Workshop, kit & private session", soldOut: true }
      ],
      tags: ["Crystal Healing", "Beginner Friendly", "Hands-on Workshop"],
      addOns: [
        { id: "advanced-kit", name: "Advanced Crystal Kit", price: "$45", description: "Premium crystals including rare healing stones" },
        { id: "private-session", name: "Private Consultation", price: "$75", description: "30-minute one-on-one crystal healing session" },
        { id: "guidebook", name: "Comprehensive Guidebook", price: "$28", description: "Detailed crystal healing reference book" }
      ],
      attendees: [
        { name: "Luna Sage", avatar: elenaProfile, location: "Asheville, NC", isAnonymous: false },
        { name: "Ocean Mystic", avatar: davidProfile, location: "Charlotte, NC", isAnonymous: false },
        { name: "Alex Johnson", avatar: phoenixProfile, location: "Raleigh, NC", isAnonymous: true }, // Real name shown in healer mode
        { name: "Forest Walker", avatar: ariaProfile, location: "Boone, NC", isAnonymous: false },
        { name: "Maya Patel", avatar: elenaProfile, location: "Charlotte, NC", isAnonymous: true }, // Real name shown in healer mode
        { name: "Crystal Dawn", avatar: phoenixProfile, location: "Durham, NC", isAnonymous: false },
      ]
    }
  };

  const event = eventData[eventId as keyof typeof eventData];
  const displayEvent = editedEvent || event;

  if (!event) {
    return <div>Event not found</div>;
  }

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
              
              {/* Right: Edit Controls + Navigation */}
              <div className="flex items-center space-x-3">
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
                    Edit
                  </Button>
                )}
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
            <Button
              variant="ghost"
              onClick={() => navigate(`/event/${eventId}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
            
            {/* Badge for Healer Mode */}
            <div className="flex justify-center mb-4">
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                Healer Mode - Full Attendee Visibility
              </Badge>
            </div>
            
            {/* Full width title */}
            {isEditing ? (
              <div className="mb-8">
                <Input
                  value={displayEvent.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="text-4xl font-bold text-center border-2 border-primary/30"
                />
              </div>
            ) : (
              <h1 className="text-4xl font-bold mb-8 text-foreground text-center">
                {displayEvent.title}
              </h1>
            )}
          
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
            {displayEvent.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-sm cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Social buttons - same as original */}
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
                    {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>About This Event</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={displayEvent.description}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                      className="min-h-[100px] border-2 border-primary/30"
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {displayEvent.description}
                    </p>
                  )}
                  
                  {isEditing ? (
                    <Textarea
                      value={displayEvent.fullDescription}
                      onChange={(e) => handleEditChange('fullDescription', e.target.value)}
                      className="min-h-[200px] border-2 border-primary/30"
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {displayEvent.fullDescription}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Attendees Card - Shows ALL attendees with real names in healer mode */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>Attendees ({displayEvent.attendees.length})</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setBroadcastModalOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Message All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayEvent.attendees.map((attendee: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-muted/30">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback className="text-xs bg-primary/10">
                            {attendee.isAnonymous 
                              ? "A" 
                              : attendee.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {attendee.name}
                          </p>
                          {attendee.isAnonymous && (
                            <p className="text-xs text-muted-foreground">
                              (was anonymous)
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground truncate">
                            {attendee.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Event Info */}
            <div className="space-y-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={displayEvent.date}
                        onChange={(e) => handleEditChange('date', e.target.value)}
                        className="border-primary/30"
                      />
                    ) : (
                      <span>{displayEvent.date}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={displayEvent.time}
                        onChange={(e) => handleEditChange('time', e.target.value)}
                        className="border-primary/30"
                      />
                    ) : (
                      <span>{displayEvent.time}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={displayEvent.location}
                        onChange={(e) => handleEditChange('location', e.target.value)}
                        className="border-primary/30"
                      />
                    ) : (
                      <span>{displayEvent.location}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={displayEvent.price}
                        onChange={(e) => handleEditChange('price', e.target.value)}
                        className="border-primary/30"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary">{displayEvent.price}</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Organizers */}
              <Card>
                <CardHeader>
                  <CardTitle>Organizers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayEvent.organizers.map((organizer: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                        onClick={() => navigate(`/healer/${organizer.name.toLowerCase().replace(' ', '-')}`)}
                      >
                        <Avatar>
                          <AvatarImage src={organizer.avatar} />
                          <AvatarFallback className="bg-primary/10">
                            {organizer.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{organizer.name}</p>
                          <p className="text-sm text-muted-foreground">{organizer.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Broadcast Message Modal */}
        <Dialog open={broadcastModalOpen} onOpenChange={setBroadcastModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Send Message to All Attendees</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter your message to all attendees..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This message will be sent individually to all {displayEvent.attendees.length} attendees.
              </p>
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleBroadcastMessage} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send to All
                </Button>
                <Button variant="outline" onClick={() => setBroadcastModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HealerEventMode;