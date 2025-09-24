import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Share2, BookOpen, Users, Sparkles, MapPin, Calendar, Plus, User, Heart, Repeat2, Filter, Home, Search, Star, ExternalLink, Link, Copy, Check, X, ChevronDown, Edit3 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "@/components/ChatSidebar";
import CreateDropdown from "@/components/CreateDropdown";
import CreateShareModal from "@/components/CreateShareModal";
import EditShareModal from "@/components/EditShareModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ThoughtsModal from "@/components/ThoughtsModal";
import ReviewModal from "@/components/ReviewModal";
import ImageModal from "@/components/ImageModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import SignupCard from "@/components/SignupCard";

// Import images
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";
import spiritualBackground from "@/assets/spiritual-background.jpg";

const Community = () => {
  const [filter, setFilter] = useState("all");
  const [createShareModalOpen, setCreateShareModalOpen] = useState(false);
  const [editShareModalOpen, setEditShareModalOpen] = useState(false);
  const [editingShare, setEditingShare] = useState<any>(null);
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);
  const [followedHealers, setFollowedHealers] = useState<string[]>(['Luna Sage', 'River Flow']);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [resharedPosts, setResharedPosts] = useState<number[]>([]);
  const [sharePopoverOpen, setSharePopoverOpen] = useState<number | null>(null);
  const [connectionPopoverOpen, setConnectionPopoverOpen] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([
    {
      type: "event",
      author: { name: "Elena Moonchild", avatar: elenaProfile, followers: 234, role: "Sound Healer" },
      title: "Full Moon Sound Healing Ceremony",
      thought: "Join us under the powerful energy of the full moon for a transformative sound healing experience that will align your chakras and restore inner peace.",
      description: "Experience the healing power of crystal bowls, gongs, and ancient chants in our sacred moonlight ceremony.",
      location: "Sacred Grove Sanctuary, Sedona AZ",
      tags: ["Sound Healing", "Full Moon", "Chakra Alignment"],
      attendees: 24,
      connectionsGoing: ["Sarah Light", "David Peace"],
      timeAgo: "2 hours ago",
      comments: 8,
      likes: 42,
      shares: 5,
      image: soundHealingEvent,
      dateRange: { start: "Mar 15", end: null },
      eventId: "1",
      isPastEvent: false,
      thoughts: [
        { id: "1", author: { name: "Sarah Light", avatar: elenaProfile }, content: "Can't wait for this healing session! The full moon energy is perfect timing.", likes: 5, timeAgo: "1 hour ago" },
        { id: "2", author: { name: "David Peace", avatar: davidProfile }, content: "Elena's sound healing sessions are transformative. Highly recommend!", likes: 8, timeAgo: "45 min ago" }
      ]
    },
    {
      type: "share",
      author: { name: "David Lightwalker", avatar: davidProfile, followers: 189, role: "Sacred Geometry Teacher" },
      title: "Sacred Geometry in Daily Life",
      thought: "I've been contemplating how the golden ratio appears everywhere in nature and how we can use this wisdom in our daily spiritual practice.",
      description: "Discovering the divine patterns that surround us and how they can guide our spiritual journey through conscious observation and application.",
      tags: ["Sacred Geometry", "Mindfulness", "Nature Wisdom"],
      timeAgo: "4 hours ago",
      comments: 12,
      likes: 67,
      shares: 8,
      youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      type: "event",
      author: { name: "Aria Starseed", avatar: ariaProfile, followers: 156, role: "Crystal Healer" },
      title: "Crystal Healing Workshop for Beginners",
      thought: "Crystals have been my guides for over a decade. I'm excited to share this gentle introduction to help you start your own healing journey.",
      description: "Learn to select, cleanse, and work with crystals for healing, protection, and spiritual growth in this hands-on workshop.",
      location: "Crystal Cave Studio, Asheville NC",
      tags: ["Crystal Healing", "Beginner Friendly", "Hands-on Workshop"],
      attendees: 12,
      connectionsGoing: ["Luna Sage"],
      timeAgo: "6 hours ago",
      comments: 15,
      likes: 23,
      shares: 3,
      image: crystalWorkshopEvent,
      dateRange: { start: "Apr 2", end: "Apr 4" },
      eventId: "2",
      isPastEvent: true,
      averageRating: 4.8,
      totalReviews: 12,
      reviews: [
        { id: "1", author: { name: "Luna Sage", avatar: elenaProfile }, rating: 5, content: "Amazing workshop! Aria's knowledge is incredible and I learned so much about crystal healing.", timeAgo: "2 days ago" },
        { id: "2", author: { name: "River Flow", avatar: davidProfile }, rating: 5, content: "Transformative experience. The hands-on approach made all the difference.", timeAgo: "1 day ago" },
        { id: "3", author: { name: "Star Dreamer", avatar: ariaProfile }, rating: 4, content: "Great introduction to crystals. Perfect for beginners!", timeAgo: "3 days ago" }
      ],
      thoughts: [
        { id: "1", author: { name: "Luna Sage", avatar: elenaProfile }, content: "This workshop exceeded my expectations. Aria's energy is so pure and healing.", likes: 12, timeAgo: "2 days ago" }
      ]
    },
    {
      type: "share",
      author: { name: "Phoenix Rising", avatar: phoenixProfile, followers: 298, role: "Movement Therapist" },
      title: "Meditation Through Movement",
      thought: "Today's ecstatic dance session reminded me how our bodies hold infinite wisdom. Movement is prayer, dance is meditation.",
      description: "Exploring how dance and movement can become powerful forms of moving meditation that connect us to our inner truth and divine expression.",
      tags: ["Movement Meditation", "Ecstatic Dance", "Body Wisdom"],
      timeAgo: "8 hours ago",
      comments: 9,
      likes: 34,
      shares: 6,
      youtubeUrl: "https://www.youtube.com/embed/abc123xyz"
    }
  ]);

  const handleEditShare = (post: any, index: number) => {
    setEditingShare({ ...post, index });
    setEditShareModalOpen(true);
  };

  const handleUpdateShare = (updatedShare: any) => {
    if (editingShare) {
      const updatedPosts = [...posts];
      updatedPosts[editingShare.index] = {
        ...updatedPosts[editingShare.index],
        title: updatedShare.title,
        thought: updatedShare.thought,
        description: updatedShare.description,
        tags: updatedShare.tags,
        ...(updatedShare.url && { youtubeUrl: updatedShare.url })
      };
      setPosts(updatedPosts);
      setEditingShare(null);
    }
  };

  const handleDeleteShare = () => {
    if (editingShare) {
      const updatedPosts = posts.filter((_, index) => index !== editingShare.index);
      setPosts(updatedPosts);
      setEditingShare(null);
    }
  };

  const filteredPosts = filter === "all" ? posts : posts.filter(post => post.type === filter);

  const featuredMembers = [
    { name: "Luna Sage", role: "Meditation Teacher", followers: 1200, avatar: elenaProfile, location: "Sedona, AZ" },
    { name: "River Flow", role: "Energy Healer", followers: 890, avatar: davidProfile, location: "Asheville, NC" },
    { name: "Star Dreamer", role: "Astrologer", followers: 756, avatar: ariaProfile, location: "Boulder, CO" },
    { name: "Ocean Mystic", role: "Reiki Master", followers: 534, avatar: phoenixProfile, location: "Big Sur, CA" },
    { name: "Forest Walker", role: "Shaman", followers: 423, avatar: elenaProfile, location: "Tulum, Mexico" },
    { name: "Crystal Dawn", role: "Crystal Therapist", followers: 398, avatar: davidProfile, location: "Mount Shasta, CA" },
    { name: "Peaceful Mind", role: "Mindfulness Coach", followers: 367, avatar: ariaProfile, location: "Byron Bay, AU" },
    { name: "Sacred Rose", role: "Breathwork Facilitator", followers: 892, avatar: phoenixProfile, location: "Costa Rica" },
    { name: "Divine Light", role: "Chakra Healer", followers: 678, avatar: elenaProfile, location: "Glastonbury, UK" },
    { name: "Mystic Moon", role: "Tarot Reader", followers: 543, avatar: davidProfile, location: "New Orleans, LA" },
    { name: "Earth Angel", role: "Herbalist", followers: 467, avatar: ariaProfile, location: "Oregon Coast" },
    { name: "Soul Fire", role: "Kundalini Teacher", followers: 834, avatar: phoenixProfile, location: "Rishikesh, India" },
    { name: "Rainbow Spirit", role: "Art Therapist", followers: 389, avatar: elenaProfile, location: "Santa Fe, NM" },
    { name: "Golden Dawn", role: "Life Coach", followers: 612, avatar: davidProfile, location: "Maui, HI" },
    { name: "Cosmic Heart", role: "Sound Healer", followers: 445, avatar: ariaProfile, location: "Ibiza, Spain" },
    { name: "Wild Moon", role: "Nature Guide", followers: 567, avatar: phoenixProfile, location: "Banff, Canada" },
    { name: "Healing Waters", role: "Hydrotherapist", followers: 378, avatar: elenaProfile, location: "Blue Mountains, AU" },
    { name: "Ancient Wisdom", role: "Vedic Teacher", followers: 723, avatar: davidProfile, location: "Vrindavan, India" },
  ];

  // Get share titles from followed people for search dropdown
  const sharesByFollowedPeople = posts.filter(post => 
    post.type === 'share' && followedHealers.includes(post.author.name)
  );

  const filteredShareTitles = sharesByFollowedPeople
    .filter(share => share.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5); // Limit to 5 results

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-background/90 backdrop-blur-sm pt-0">
        {/* Facebook-style Header */}
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
                  <Button variant="ghost" size="lg" className="p-4 rounded-xl hover:bg-muted/70 relative transition-all hover:scale-110">
                    <Users className="h-9 w-9 text-primary" />
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/events')}
                  >
                    <Calendar className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
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
                {/* Search Bar with Dropdown */}
                <div className="hidden md:block relative">
                  <Popover open={searchDropdownOpen} onOpenChange={setSearchDropdownOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex items-center bg-muted rounded-full px-3 py-2 w-64 cursor-pointer">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <input 
                          type="text" 
                          placeholder="search shares..." 
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSearchDropdownOpen(true);
                          }}
                          className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-muted-foreground"
                        />
                        <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 mt-1" align="start">
                      <div className="space-y-1">
                        {filteredShareTitles.length > 0 ? (
                          filteredShareTitles.map((share, index) => (
                            <div 
                              key={index}
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => {
                                setSearchQuery(share.title);
                                setSearchDropdownOpen(false);
                              }}
                            >
                               <Avatar 
                                 className="h-6 w-6 cursor-pointer"
                                 onClick={() => navigate(`/healer/${share.author.name.toLowerCase().replace(/\s+/g, '-')}`)}
                               >
                                <AvatarImage src={share.author.avatar} />
                                <AvatarFallback className="text-xs">
                                  {share.author.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{share.title}</p>
                                <p className="text-xs text-muted-foreground">by {share.author.name}</p>
                              </div>
                            </div>
                          ))
                        ) : searchQuery ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No shares found
                          </div>
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Start typing to search shares...
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <CreateDropdown onCreateShare={() => setCreateShareModalOpen(true)} />
                <NotificationDropdown />
                <ProfileDropdown userImage={elenaProfile} userName="Elena Moonchild" />
              </div>
            </div>
          </div>
        </div>

        {/* Community Filters - Sticky */}
        <div className="bg-transparent sticky top-[73px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">We grow together</h1>
              
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
                  variant={filter === "event" ? "default" : "ghost"}
                  size="sm"  
                  onClick={() => setFilter("event")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Events
                </Button>
                <Button
                  variant={filter === "share" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("share")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Shares
                </Button>
              </div>
              
              {/* Empty div for balance */}
              <div></div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-130px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-16 h-full">
            {/* Left Sidebar - Fixed */}
            <div className="lg:col-span-2 sticky top-0 h-[calc(100vh-130px)]">
              <div className="space-y-4">
                {/* People to Follow */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>People to Follow</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    {/* Healers Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Healers
                      </h4>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto">
                        {featuredMembers.slice(0, 4).map((member, index) => (
                          <div key={index} className="flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                               <Avatar 
                                 className="h-8 w-8 cursor-pointer"
                                 onClick={() => navigate(`/healer/${member.name.toLowerCase().replace(/\s+/g, '-')}`)}
                               >
                                 <AvatarImage src={member.avatar} />
                                 <AvatarFallback className="bg-primary/10 text-xs">
                                   {member.name.split(' ').map(n => n[0]).join('')}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <p 
                                   className="font-medium text-sm leading-tight cursor-pointer hover:text-primary transition-colors"
                                   onClick={() => navigate(`/healer/${member.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                 >
                                   {member.name}
                                 </p>
                                 <p className="text-xs text-muted-foreground">{member.role}</p>
                                 <p className="text-xs text-muted-foreground flex items-center">
                                   <MapPin className="h-3 w-3 mr-1" />
                                   {member.location}
                                 </p>
                               </div>
                             </div>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="p-2 h-auto hover:bg-red-50"
                               onClick={() => {
                                 if (followedHealers.includes(member.name)) {
                                   setFollowedHealers(prev => prev.filter(name => name !== member.name));
                                   toast.success(`Unfollowed ${member.name}`);
                                 } else {
                                   setFollowedHealers(prev => [...prev, member.name]);
                                   toast.success(`Following ${member.name}`);
                                 }
                               }}
                             >
                               <Heart className={`h-4 w-4 ${followedHealers.includes(member.name) ? 'text-red-500 fill-red-500' : 'text-red-500'}`} />
                             </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participants Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Participants
                      </h4>
                      <div className="space-y-3 max-h-[150px] overflow-y-auto">
                        {featuredMembers.slice(4, 8).map((member, index) => (
                          <div key={index} className="flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                               <Avatar 
                                 className="h-8 w-8 cursor-pointer"
                                 onClick={() => navigate(`/healer/${member.name.toLowerCase().replace(/\s+/g, '-')}`)}
                               >
                                 <AvatarImage src={member.avatar} />
                                 <AvatarFallback className="bg-primary/10 text-xs">
                                   {member.name.split(' ').map(n => n[0]).join('')}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <p 
                                   className="font-medium text-sm leading-tight cursor-pointer hover:text-primary transition-colors"
                                   onClick={() => navigate(`/healer/${member.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                 >
                                   {member.name}
                                 </p>
                                 <p className="text-xs text-muted-foreground flex items-center">
                                   <MapPin className="h-3 w-3 mr-1" />
                                   {member.location}
                                 </p>
                               </div>
                             </div>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="p-2 h-auto hover:bg-red-50"
                               onClick={() => {
                                 if (followedHealers.includes(member.name)) {
                                   setFollowedHealers(prev => prev.filter(name => name !== member.name));
                                   toast.success(`Unfollowed ${member.name}`);
                                 } else {
                                   setFollowedHealers(prev => [...prev, member.name]);
                                   toast.success(`Following ${member.name}`);
                                 }
                               }}
                             >
                               <Heart className={`h-4 w-4 ${followedHealers.includes(member.name) ? 'text-red-500 fill-red-500' : 'text-red-500'}`} />
                             </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate('/people')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Look for More
                    </Button>
                  </CardContent>
                </Card>

                {/* Talk Sidebar - Clickable */}
                <Card 
                  className="bg-card/90 backdrop-blur-sm border border-border cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => navigate('/chat')}
                >
                  <CardHeader className="pb-1">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span>Talk</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-[400px] overflow-hidden">
                    <div className="space-y-2">
                      {[
                        {
                          name: "Elena Moonchild",
                          lastMessage: "Looking forward to the sound healing session tonight! 🌙",
                          timestamp: "2 min ago",
                          avatar: elenaProfile,
                          isGroup: false
                        },
                        {
                          name: "Sacred Circle",
                          lastMessage: "David: The energy work was incredible today",
                          timestamp: "5 min ago",
                          avatar: davidProfile,
                          isGroup: true
                        },
                        {
                          name: "Aria Starseed",
                          lastMessage: "Thank you for joining the crystal workshop! ✨",
                          timestamp: "1 hour ago",
                          avatar: ariaProfile,
                          isGroup: false
                        },
                        {
                          name: "Phoenix Rising",
                          lastMessage: "Movement meditation tomorrow at sunrise?",
                          timestamp: "2 hours ago",
                          avatar: phoenixProfile,
                          isGroup: false
                        },
                        {
                          name: "Healing Hearts",
                          lastMessage: "Luna: Beautiful sharing today everyone 💚",
                          timestamp: "3 hours ago",
                          avatar: elenaProfile,
                          isGroup: true
                        }
                      ].map((chat, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={chat.avatar} />
                              <AvatarFallback className="bg-primary/10 text-xs">
                                {chat.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {chat.isGroup && (
                              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                                <Users className="h-2 w-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight truncate">
                              {chat.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {chat.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                     </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => navigate('/chat')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      More Talks
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4 space-y-4">
              {/* Signup Card for new users */}
              <SignupCard />
              
              {filteredPosts.map((post, index) => (
                <Card key={index} className="bg-card/90 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-200 relative">
                  
                  <CardContent className="p-0">
                    {/* Event Image Header for Events */}
                    {post.type === 'event' && post.image && (
                      <div className="p-4">
                         <div className="flex space-x-3">
                           {/* Event Image - 4:3 Aspect Ratio - Clickable */}
                           <div 
                             className="w-48 h-36 flex-shrink-0 cursor-pointer"
                             onClick={() => navigate(`/event/${post.eventId}`)}
                           >
                             <img 
                               src={post.image} 
                               alt={post.title}
                               className="w-full h-full object-cover rounded-lg"
                             />
                           </div>
                           
                           {/* Event Details */}
                           <div className="flex-1 min-w-0">
                             <h2 
                               className="text-lg font-bold text-foreground mb-2 leading-tight cursor-pointer hover:text-primary transition-colors"
                               onClick={() => navigate(`/event/${post.eventId}`)}
                             >
                               {post.title}
                             </h2>
                             
                             <div className="space-y-1 text-sm">
                               <div className="mb-2">
                                 <span className="text-2xl font-bold text-primary">
                                   {post.dateRange?.end ? 
                                     `${post.dateRange.start} - ${post.dateRange.end}` : 
                                     post.dateRange?.start
                                   }
                                 </span>
                               </div>
                               
                               <div className="flex items-center space-x-2">
                                  <Avatar 
                                    className="h-6 w-6 cursor-pointer"
                                    onClick={() => navigate(`/healer/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                  >
                                   <AvatarImage src={post.author.avatar} />
                                   <AvatarFallback className="bg-primary/10 text-xs">
                                     {post.author.name.split(' ').map(n => n[0]).join('')}
                                   </AvatarFallback>
                                 </Avatar>
                                 <div>
                                   <div className="flex items-center space-x-2">
                                      <span 
                                        className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => navigate(`/healer/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                      >
                                        {post.author.name}
                                      </span>
                                     <span className="text-xs text-muted-foreground">•</span>
                                     <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent">
                                       Follow
                                     </Button>
                                   </div>
                                   <p className="text-xs text-muted-foreground">
                                     {post.author.role}
                                   </p>
                                 </div>
                               </div>
                               
                               <div className="flex items-center space-x-2 text-muted-foreground">
                                 <MapPin className="h-4 w-4" />
                                 <span>{post.location}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>
                    )}

                    {/* Share Title Header for Shares */}
                    {post.type === 'share' && (
                      <div className="p-3 pb-2 relative">
                        <h2 className="text-lg font-bold text-foreground mb-1 leading-tight pr-8">
                          {post.title}
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditShare(post, index)}
                          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-muted/70"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Content */}
                    <div className="px-3">
                      {/* Tags first for events */}
                      {post.type === 'event' && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Share content: description above tags */}
                      {post.type === 'share' && (
                        <div className="mb-3">
                          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                            {post.thought}
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                            {post.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Event content */}
                      {post.type === 'event' && (
                        <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                          {post.thought}
                        </p>
                      )}

                      {/* Event Details */}
                      {post.type === 'event' && (
                        <div className="mb-3">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{post.attendees} attending</span>
                            </div>
                            {post.connectionsGoing && post.connectionsGoing.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {post.connectionsGoing.length <= 2 ? (
                                  <span className="text-primary font-medium">
                                    {post.connectionsGoing.join(", ")} going
                                  </span>
                                ) : (
                                  <Popover open={connectionPopoverOpen === index} onOpenChange={(open) => setConnectionPopoverOpen(open ? index : null)}>
                                    <PopoverTrigger asChild>
                                      <button className="text-primary font-medium hover:underline cursor-pointer">
                                        {post.connectionsGoing.length} connections going
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-3">
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">Connections Attending</h4>
                                        {post.connectionsGoing.map((connection: string, idx: number) => (
                                          <div key={idx} className="flex items-center space-x-2 p-1 rounded hover:bg-muted cursor-pointer">
                                             <Avatar 
                                               className="h-6 w-6 cursor-pointer"
                                               onClick={() => navigate(`/healer/${connection.toLowerCase().replace(/\s+/g, '-')}`)}
                                             >
                                              <AvatarImage src={idx % 2 === 0 ? elenaProfile : davidProfile} />
                                              <AvatarFallback className="text-xs">
                                                {connection.split(' ').map((n: string) => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{connection}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Reviews for past events */}
                          {post.isPastEvent && post.averageRating && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.round(post.averageRating) 
                                        ? "text-yellow-400 fill-current" 
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{post.averageRating.toFixed(1)}</span>
                              <button
                                onClick={() => {
                                  setSelectedPost(post);
                                  setReviewModalOpen(true);
                                }}
                                className="text-sm text-primary hover:underline"
                              >
                                ({post.totalReviews} reviews)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* YouTube Video for Shares */}
                      {post.type === 'share' && post.youtubeUrl && (
                        <div className="mb-3">
                          <div className="relative h-64 rounded-lg overflow-hidden bg-muted">
                            <iframe
                              src={post.youtubeUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}

                      {/* Author Info for Shares - Below video */}
                      {post.type === 'share' && (
                        <div className="py-2 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                               <Avatar 
                                 className="h-6 w-6 cursor-pointer"
                                 onClick={() => navigate(`/healer/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`)}
                               >
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback className="bg-primary/10 text-xs">
                                  {post.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                   <span 
                                     className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                     onClick={() => navigate(`/healer/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                   >
                                     {post.author.name}
                                   </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent">
                                    Follow
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {post.author.role}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar - Updated labels */}
                    <div className="px-3 py-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => {
                            setSelectedPost(post);
                            setThoughtsModalOpen(true);
                          }}
                          className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments} Thoughts</span>
                        </button>
                        <button 
                          className={`flex items-center space-x-2 text-sm transition-colors ${
                            resharedPosts.includes(index) 
                              ? 'text-primary font-bold' 
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                          onClick={() => {
                            if (resharedPosts.includes(index)) {
                              setResharedPosts(prev => prev.filter(id => id !== index));
                              toast.success("Reshare removed");
                            } else {
                              setResharedPosts(prev => [...prev, index]);
                              toast.success("Post reshared!");
                            }
                          }}
                        >
                          <Repeat2 className="h-4 w-4" />
                          <span>{resharedPosts.includes(index) ? 'Reshared' : 'Reshare'}</span>
                        </button>
                        
                        <button 
                          className={`flex items-center space-x-2 text-sm transition-colors ${
                            savedPosts.includes(index) 
                              ? 'text-primary font-bold' 
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                          onClick={() => {
                            if (savedPosts.includes(index)) {
                              setSavedPosts(prev => prev.filter(id => id !== index));
                              toast.success("Removed from saved");
                            } else {
                              setSavedPosts(prev => [...prev, index]);
                              toast.success("Saved to your private page!");
                            }
                          }}
                        >
                          <BookOpen className={`h-4 w-4 ${savedPosts.includes(index) ? 'fill-current' : ''}`} />
                          <span>Save</span>
                        </button>
                        
                        <Popover open={sharePopoverOpen === index} onOpenChange={(open) => setSharePopoverOpen(open ? index : null)}>
                          <PopoverTrigger asChild>
                            <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2">
                            <div className="space-y-2">
                              <button 
                                className="flex items-center space-x-2 w-full p-2 text-sm rounded-md hover:bg-muted transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/post/${index + 1}`);
                                  setLinkCopied(true);
                                  toast.success("Link copied to clipboard!");
                                  setTimeout(() => setLinkCopied(false), 2000);
                                  setSharePopoverOpen(null);
                                }}
                              >
                                {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                <span>Copy Link</span>
                              </button>
                              <button className="flex items-center space-x-2 w-full p-2 text-sm rounded-md hover:bg-muted transition-colors">
                                <ExternalLink className="h-4 w-4" />
                                <span>Share on Twitter</span>
                              </button>
                              <button className="flex items-center space-x-2 w-full p-2 text-sm rounded-md hover:bg-muted transition-colors">
                                <ExternalLink className="h-4 w-4" />
                                <span>Share on Facebook</span>
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Sidebar - Fixed */}
            <div className="lg:col-span-2 sticky top-0 h-[calc(100vh-130px)] overflow-hidden">
              <div className="space-y-4">
                {/* Featured Events - Expanded */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                      <Star className="h-5 w-5 text-primary" />
                      <span>Featured Events</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0 h-[calc(100%-80px)] overflow-y-auto">
                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/event/1')}
                    >
                      <img 
                        src={soundHealingEvent} 
                        alt="Full Moon Sound Healing"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/elena-moonchild`)}
                             >
                              <AvatarImage src={elenaProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">EM</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Elena Moonchild</p>
                              <p className="text-white/80 text-xs">Sound Healer</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Full Moon Sound Healing Ceremony
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">March 15</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Sedona, AZ</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Experience healing power of crystal bowls and gongs under the full moon energy
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/2')}
                    >
                      <img 
                        src={crystalWorkshopEvent} 
                        alt="Crystal Healing Workshop"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/aria-starseed`)}
                             >
                              <AvatarImage src={ariaProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">AS</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Aria Starseed</p>
                              <p className="text-white/80 text-xs">Crystal Healer</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Crystal Healing Workshop
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Apr 2-4</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Asheville, NC</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Learn to select, cleanse, and work with crystals for healing and spiritual growth
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/3')}
                    >
                      <img 
                        src={spiritualBackground} 
                        alt="Meditation Circle"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/phoenix-rising`)}
                             >
                              <AvatarImage src={phoenixProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">PR</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Phoenix Rising</p>
                              <p className="text-white/80 text-xs">Movement Therapist</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Sacred Movement Circle
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Mar 20</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Santa Fe, NM</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Express your soul through sacred movement and ecstatic dance
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/4')}
                    >
                      <img 
                        src={soundHealingEvent} 
                        alt="Breathwork Journey"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/david-lightwalker`)}
                             >
                              <AvatarImage src={davidProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">DL</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">David Lightwalker</p>
                              <p className="text-white/80 text-xs">Breathwork Facilitator</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Transformational Breathwork Journey
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Mar 25</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Boulder, CO</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Release deep trauma and connect with your higher self through breath
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/5')}
                    >
                      <img 
                        src={crystalWorkshopEvent} 
                        alt="Cacao Ceremony"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/aria-starseed`)}
                             >
                              <AvatarImage src={ariaProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">SR</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Sacred Rose</p>
                              <p className="text-white/80 text-xs">Cacao Ceremonialist</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Heart Opening Cacao Ceremony
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Apr 1</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Tulum, Mexico</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Open your heart with sacred cacao and ancestral wisdom
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/6')}
                    >
                      <img 
                        src={spiritualBackground} 
                        alt="Yoga Retreat"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/phoenix-rising`)}
                             >
                              <AvatarImage src={phoenixProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">DL</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Divine Light</p>
                              <p className="text-white/80 text-xs">Yoga Teacher</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Sacred Yoga & Meditation Retreat
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Apr 8-10</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Big Sur, CA</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Deepen your practice with daily yoga, meditation and nature connection
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/7')}
                    >
                      <img 
                        src={soundHealingEvent} 
                        alt="Shamanic Journey"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/elena-moonchild`)}
                             >
                              <AvatarImage src={elenaProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">FW</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Forest Walker</p>
                              <p className="text-white/80 text-xs">Shaman</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Shamanic Healing Journey
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Apr 15</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Mount Shasta, CA</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Connect with spirit guides and receive healing through ancient shamanic practices
                          </p>
                        </div>
                      </div>
                    </div>
                    
                     <Button 
                       variant="outline" 
                       size="lg" 
                       className="w-full"
                       onClick={() => navigate('/events')}
                     >
                       <Calendar className="h-4 w-4 mr-2" />
                       More Events
                     </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Share Modal */}
      <CreateShareModal 
        open={createShareModalOpen} 
        onOpenChange={setCreateShareModalOpen} 
      />

      {/* Edit Share Modal */}
      <EditShareModal 
        open={editShareModalOpen} 
        onOpenChange={setEditShareModalOpen}
        share={editingShare}
        onUpdate={handleUpdateShare}
        onDelete={handleDeleteShare}
      />

      {/* Thoughts Modal */}
      {selectedPost && (
        <ThoughtsModal
          open={thoughtsModalOpen}
          onOpenChange={setThoughtsModalOpen}
          postTitle={selectedPost.title}
          thoughts={selectedPost.thoughts || []}
        />
      )}

      {/* Review Modal */}
      {selectedPost && selectedPost.isPastEvent && (
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          eventTitle={selectedPost.title}
          reviews={selectedPost.reviews || []}
          averageRating={selectedPost.averageRating || 0}
          totalReviews={selectedPost.totalReviews || 0}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          imageSrc={selectedImage.src}
          imageAlt={selectedImage.alt}
          title={selectedImage.title}
        />
      )}
    </div>
  );
};

export default Community;