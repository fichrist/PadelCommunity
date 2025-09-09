import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Share2, BookOpen, Users, Sparkles, MapPin, Calendar, Bookmark, Filter, Clock, UserCheck, Plus, User, MessageSquare, Heart, Send } from "lucide-react";
import { useState } from "react";
import peacefulBackground from "@/assets/peaceful-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

const Community = () => {
  const [filter, setFilter] = useState("all");

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
      image: "/placeholder.svg"
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
      image: "/placeholder.svg"
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
      youtubeUrl: "https://www.youtube.com/embed/abc123xyz"
    }
  ];

  const filteredPosts = filter === "all" ? posts : posts.filter(post => post.type === filter);

  const featuredMembers = [
    { name: "Luna Sage", role: "Meditation Teacher", followers: 1200, avatar: "" },
    { name: "River Flow", role: "Energy Healer", followers: 890, avatar: "" },
    { name: "Star Dreamer", role: "Astrologer", followers: 756, avatar: "" },
  ];

  return (
      <div className="min-h-screen bg-background relative" style={{ backgroundImage: `url(${peacefulBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
        {/* Header with Logo and Actions */}
        <div className="bg-card/95 backdrop-blur-sm border-b border-border relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={spiritualLogo} alt="Spiritual Calendar" className="h-10 w-10" />
                <div className="text-left">
                  <h1 className="text-xl font-semibold text-foreground">
                    Your Spiritual Community
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Connect, share wisdom, and discover events
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button size="sm" className="rounded-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center mt-4 space-x-1">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className="px-4 py-2 rounded-full"
              >
                All
              </Button>
              <Button
                variant={filter === "event" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("event")}
                className="px-4 py-2 rounded-full"
              >
                Events
              </Button>
              <Button
                variant={filter === "share" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("share")}
                className="px-4 py-2 rounded-full"
              >
                Shares
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-card/95 backdrop-blur-sm border border-border sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Messages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 max-h-96 overflow-y-auto">
                  {["Luna Sage", "River Flow", "Star Dreamer"].map((name, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">Last message...</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {filteredPosts.map((post, index) => (
                <Card key={index} className="bg-card/95 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-0">
                    {/* Event Image Header for Events */}
                    {post.type === 'event' && (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h2 className="text-xl font-bold mb-1">{post.title}</h2>
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>{post.location}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Share Title for Shares */}
                    {post.type === 'share' && (
                      <div className="p-4 pb-2">
                        <h2 className="text-xl font-bold text-foreground mb-2">
                          {post.title}
                        </h2>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="px-4 pb-2">
                      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                        {post.thought}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">
                            #{tag.toLowerCase().replace(/\s+/g, '')}
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
                                <UserCheck className="h-4 w-4 text-primary" />
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

                      {/* Share description for non-events */}
                      {post.type === 'share' && (
                        <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
                          {post.description}
                        </p>
                      )}
                    </div>

                    {/* Author Info - Less Prominent */}
                    <div className="px-4 py-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback className="bg-primary/10 text-xs">
                              {post.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-xs font-medium cursor-pointer hover:text-primary transition-colors">
                              {post.author.name}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {post.author.role} • {post.timeAgo}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent">
                          Follow
                        </Button>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="px-4 py-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors flex-1 justify-center">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors flex-1 justify-center">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors flex-1 justify-center">
                          <Bookmark className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Suggested Connections */}
              <Card className="bg-card/95 backdrop-blur-sm border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>People you may know</span>
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

              {/* Trending Topics */}
              <Card className="bg-card/95 backdrop-blur-sm border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Trending</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {['#meditation', '#healing', '#crystals', '#yoga', '#chakras'].map((topic, index) => (
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
  );
};

export default Community;