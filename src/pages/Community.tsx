import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Share2, BookOpen, Users, Sparkles, MapPin, Calendar, Plus, User, Heart, Repeat2, Filter, Home, Search, Star, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "@/components/ChatSidebar";
import CreateDropdown from "@/components/CreateDropdown";
import CreateShareModal from "@/components/CreateShareModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ThoughtsModal from "@/components/ThoughtsModal";
import ReviewModal from "@/components/ReviewModal";
import ImageModal from "@/components/ImageModal";

// Import images
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";

const Community = () => {
  const [filter, setFilter] = useState("all");
  const [createShareModalOpen, setCreateShareModalOpen] = useState(false);
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);
  const navigate = useNavigate();

  const posts = [
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
  ];

  const filteredPosts = filter === "all" ? posts : posts.filter(post => post.type === filter);

  const featuredMembers = [
    { name: "Luna Sage", role: "Meditation Teacher", followers: 1200, avatar: elenaProfile, location: "Sedona, AZ" },
    { name: "River Flow", role: "Energy Healer", followers: 890, avatar: davidProfile, location: "Asheville, NC" },
    { name: "Star Dreamer", role: "Astrologer", followers: 756, avatar: ariaProfile, location: "Boulder, CO" },
    { name: "Ocean Mystic", role: "Reiki Master", followers: 534, avatar: phoenixProfile, location: "Big Sur, CA" },
    { name: "Forest Walker", role: "Shaman", followers: 423, avatar: elenaProfile, location: "Tulum, Mexico" },
    { name: "Crystal Dawn", role: "Crystal Therapist", followers: 398, avatar: davidProfile, location: "Mount Shasta, CA" },
    { name: "Peaceful Mind", role: "Mindfulness Coach", followers: 367, avatar: ariaProfile, location: "Byron Bay, AU" },
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
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
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-muted rounded-full px-3 py-4 w-64">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-muted-foreground"
                  />
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
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">Community</h1>
              
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
                {/* Talk Sidebar - Clickable */}
                <Card 
                  className="bg-card/90 backdrop-blur-sm border border-border min-h-[750px] cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => navigate('/chat')}
                >
                  <CardHeader className="pb-1">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span>Talk</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-[675px] overflow-hidden">
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
                          name: "Sacred Geometry Group",
                          lastMessage: "David: Just shared some sacred geometry insights",
                          timestamp: "5 min ago",
                          avatar: davidProfile,
                          isGroup: true
                        },
                        {
                          name: "Aria Starseed",
                          lastMessage: "Crystal workshop was amazing! Thank you all ✨",
                          timestamp: "10 min ago",
                          avatar: ariaProfile,
                          isGroup: false
                        },
                        {
                          name: "Meditation Circle",
                          lastMessage: "Phoenix: Movement meditation session starts now",
                          timestamp: "15 min ago",
                          avatar: phoenixProfile,
                          isGroup: true
                        },
                        {
                          name: "Luna Sage",
                          lastMessage: "Sending healing light to everyone today 💫",
                          timestamp: "30 min ago",
                          avatar: elenaProfile,
                          isGroup: false
                        },
                        {
                          name: "Astrology & Moon Cycles",
                          lastMessage: "River: Full moon energy is intense tonight",
                          timestamp: "45 min ago",
                          avatar: davidProfile,
                          isGroup: true
                        }
                      ].map((conversation, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback className="bg-primary/10 text-xs">
                              {conversation.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground truncate">
                                {conversation.name} {conversation.isGroup && '👥'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {conversation.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4 space-y-4">
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
                                 <Avatar className="h-6 w-6">
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
                      <div className="p-3 pb-2">
                        <h2 className="text-lg font-bold text-foreground mb-1 leading-tight">
                          {post.title}
                        </h2>
                      </div>
                    )}

                    {/* Author Info for Shares only */}
                    {post.type === 'share' && (
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
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

                      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                        {post.thought}
                      </p>

                      {/* Tags for shares - Without hashtags and different color */}
                      {post.type === 'share' && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                              {tag}
                            </Badge>
                          ))}
                        </div>
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
                                <span className="text-primary font-medium">
                                  {post.connectionsGoing.join(", ")} going
                                </span>
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

                      {/* Share description */}
                      {post.type === 'share' && (
                        <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
                          {post.description}
                        </p>
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
                        <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Repeat2 className="h-4 w-4" />
                          <span>Reshare</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Sidebar - Fixed */}
            <div className="lg:col-span-2 sticky top-0 h-[calc(100vh-130px)] overflow-hidden">
              <div className="space-y-4">
                {/* Healers to Follow */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border min-h-[750px]">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Healers to Follow</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 max-h-[600px] overflow-y-hidden">
                    {featuredMembers.map((member, index) => (
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
                        <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                          Follow
                        </Button>
                      </div>
                    ))}
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