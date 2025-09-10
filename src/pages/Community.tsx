import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Share2, BookOpen, Users, Sparkles, MapPin, Calendar, Plus, User, Heart, Repeat2, Filter, Home, Search } from "lucide-react";
import { useState } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import CreatePostModal from "@/components/CreatePostModal";

// Import images
import natureBackground from "@/assets/nature-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";

const Community = () => {
  const [filter, setFilter] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
      image: soundHealingEvent
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
      image: crystalWorkshopEvent
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
    { name: "Luna Sage", role: "Meditation Teacher", followers: 1200, avatar: elenaProfile },
    { name: "River Flow", role: "Energy Healer", followers: 890, avatar: davidProfile },
    { name: "Star Dreamer", role: "Astrologer", followers: 756, avatar: ariaProfile },
    { name: "Ocean Mystic", role: "Reiki Master", followers: 534, avatar: phoenixProfile },
    { name: "Forest Walker", role: "Shaman", followers: 423, avatar: elenaProfile },
    { name: "Crystal Dawn", role: "Crystal Therapist", followers: 398, avatar: davidProfile },
    { name: "Peaceful Mind", role: "Mindfulness Coach", followers: 367, avatar: ariaProfile },
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${natureBackground})` }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
        {/* Facebook-style Header */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Logo + App Name + Search */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <img src={spiritualLogo} alt="Spirit" className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold text-primary font-comfortaa">Spirit</span>
                </div>
                
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-muted rounded-full px-3 py-2 w-64">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              
              {/* Center: Navigation Icons Only */}
              <div className="flex items-center justify-center flex-1">
                <div className="flex items-center space-x-8">
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="p-3 rounded-lg hover:bg-muted relative">
                      <Users className="h-7 w-7 text-primary" />
                      <div className="absolute -bottom-3 left-0 right-0 h-1 bg-primary rounded-full"></div>
                    </Button>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="p-3 rounded-lg hover:bg-muted">
                      <Calendar className="h-7 w-7 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="p-3 rounded-lg hover:bg-muted">
                      <User className="h-7 w-7 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="p-3 rounded-lg hover:bg-muted">
                      <MessageCircle className="h-7 w-7 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Right: Create Button + Profile */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setCreateModalOpen(true)}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground font-comfortaa">Community</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* Talk Sidebar */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border min-h-[400px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span>Talk</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Placeholder talk content */}
                      <div className="text-sm text-muted-foreground">
                        Connect with spiritual souls
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Souls to Follow */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border min-h-[500px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Souls to Follow</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {featuredMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary/10 text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm leading-tight">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
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

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Compact Filters - moved to bottom */}
              <div className="flex justify-center items-center space-x-2 mb-2">
                <Button
                  variant={filter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="px-3 py-1 rounded-full h-6 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filter === "share" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("share")}
                  className="px-3 py-1 rounded-full h-6 text-xs"
                >
                  Shares
                </Button>
                <Button
                  variant={filter === "event" ? "default" : "ghost"}
                  size="sm"  
                  onClick={() => setFilter("event")}
                  className="px-3 py-1 rounded-full h-6 text-xs"
                >
                  Events
                </Button>
              </div>
              
              {filteredPosts.map((post, index) => (
                <Card key={index} className="bg-card/90 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-0">
                    {/* Event Image Header for Events with date overlay */}
                    {post.type === 'event' && post.image && (
                      <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                          <div className="text-white text-center">
                            <div className="text-sm font-bold">Mar</div>
                            <div className="text-lg font-bold">15</div>
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h2 className="text-lg font-bold text-white mb-1 leading-tight">
                            {post.title}
                          </h2>
                          <div className="flex items-center space-x-2 text-white/90 text-xs">
                            <MapPin className="h-3 w-3" />
                            <span>{post.location}</span>
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

                    {/* Author Info - Less Prominent */}
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
                              <span className="text-xs font-medium text-muted-foreground">
                                {post.author.name}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent">
                                Follow
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {post.author.role} • {post.timeAgo}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-3">
                      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                        {post.thought}
                      </p>

                      {/* Tags - Without hashtags and different color */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs bg-accent/60 text-accent-foreground hover:bg-accent/80 cursor-pointer border border-accent/40">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Event Details */}
                      {post.type === 'event' && (
                        <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-foreground/80 mb-2">
                            {post.description}
                          </p>
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
                        <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments} Thoughts</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Repeat2 className="h-4 w-4" />
                          <span>{post.shares} Reshare</span>
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

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-4">
                {/* Trending Topics */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>Trending</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {['meditation', 'healing', 'crystals', 'yoga', 'chakras'].map((topic, index) => (
                        <div key={topic} className="py-1">
                          <p className="text-sm font-medium text-primary cursor-pointer hover:underline">
                            {topic}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 50) + 10} posts today
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </div>
  );
};

export default Community;