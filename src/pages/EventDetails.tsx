import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Clock, DollarSign, Star, MessageCircle, UserPlus, Play, User, Plus, Search, Heart, Repeat2, BookOpen, Share2, Link, Copy, Check, Flag } from "lucide-react";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import EventCard from "@/components/EventCard";

// Import images
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

const EventDetails = () => {
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
        { name: "Anonymous", avatar: "", location: "", isAnonymous: true },
        { name: "River Flow", avatar: phoenixProfile, location: "Scottsdale, AZ", isAnonymous: false },
        { name: "Anonymous", avatar: "", location: "", isAnonymous: true },
        { name: "Star Dreamer", avatar: elenaProfile, location: "Tempe, AZ", isAnonymous: false },
        { name: "Anonymous", avatar: "", location: "", isAnonymous: true },
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
        { name: "Anonymous", avatar: "", location: "", isAnonymous: true },
        { name: "Forest Walker", avatar: ariaProfile, location: "Boone, NC", isAnonymous: false },
        { name: "Anonymous", avatar: "", location: "", isAnonymous: true },
        { name: "Crystal Dawn", avatar: phoenixProfile, location: "Durham, NC", isAnonymous: false },
      ]
    }
  };

  const event = eventData[eventId as keyof typeof eventData];

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
              onClick={() => window.history.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {/* Full width title */}
            <h1 className="text-4xl font-bold mb-8 text-foreground text-center">
              {event.title}
            </h1>
          
          {/* Large Event Image */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-[900px] h-[580px] object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Tags under image */}
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
                <p className="text-foreground/90 leading-relaxed mb-6">
                  {event.fullDescription}
                </p>
                
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
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Organizers ({event.organizers.length})</h3>
                    <div className="space-y-3">
                      {event.organizers.map((organizer, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar 
                              className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
                              onClick={() => navigate(`/healer/${organizer.name.toLowerCase().replace(' ', '-')}`)}
                            >
                              <AvatarImage src={organizer.avatar} />
                              <AvatarFallback className="bg-primary/10">
                                {organizer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div 
                                className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/healer/${organizer.name.toLowerCase().replace(' ', '-')}`)}
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
                      ))}
                    </div>
                  </div>

                  {/* Attendees */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Attendees ({event.attendees.filter(a => !a.isAnonymous).length + event.attendees.filter(a => a.isAnonymous).length})
                    </h3>
                    <div className="space-y-3">
                      {event.attendees.map((attendee, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              {attendee.isAnonymous ? (
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
                              <div className="text-sm font-medium">
                                {attendee.isAnonymous ? "Anonymous" : attendee.name}
                              </div>
                              {!attendee.isAnonymous && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {attendee.location}
                                </div>
                              )}
                            </div>
                          </div>
                          {!attendee.isAnonymous && (
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
                      ))}
                    </div>
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

        {/* Previous Events by Organizers - Bottom Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Previous Events by Organizers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.organizers.flatMap(organizer => 
                organizer.previousEvents?.map((prevEvent, eventIndex) => (
                  <EventCard
                    key={`${organizer.name}-${eventIndex}`}
                    eventId={`prev-${organizer.name}-${eventIndex}`}
                    title={prevEvent.title}
                    description="A past event by our experienced organizer"
                    date={prevEvent.date}
                    location={organizer.location}
                    organizers={[{
                      name: organizer.name,
                      avatar: organizer.avatar,
                      id: organizer.name.toLowerCase().replace(' ', '-')
                    }]}
                    attendees={prevEvent.attendees}
                    category="Past Event"
                    image={event.image}
                    isPastEvent={true}
                    averageRating={4.5}
                    totalReviews={Math.floor(prevEvent.attendees * 0.6)}
                    reviews={[]}
                  />
                )) || []
              )}
            </div>
          </CardContent>
        </Card>
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
                    {/* Pay at Entry Option */}
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="radio"
                        name="priceOption"
                        value="Pay at Entry"
                        checked={selectedPrice === "Pay at Entry"}
                        onChange={(e) => setSelectedPrice(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Pay at Entry</span>
                          <span className="font-bold text-primary">{event.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Pay when you arrive at the event location</p>
                      </div>
                    </label>
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
                    onClick={() => {
                      const paymentMethod = selectedPrice === "Pay at Entry" ? "Pay at Entry" : "Online Payment";
                      const addOnNames = selectedAddOns.map(id => event.addOns?.find(addon => addon.id === id)?.name).filter(Boolean).join(', ');
                      const message = addOnNames 
                        ? `Successfully enrolled in ${event.title} with add-ons: ${addOnNames}! Payment method: ${paymentMethod}. Check your email for confirmation.`
                        : `Successfully enrolled in ${event.title}! Payment method: ${paymentMethod}. Check your email for confirmation.`;
                      toast.success(message);
                      setEnrollmentModalOpen(false);
                      setSelectedAddOns([]);
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
        </div>
      </div>
    );
  };
  
  export default EventDetails;