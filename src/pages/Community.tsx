import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Share2, BookOpen, Users, Sparkles, MapPin, Calendar, Bookmark, Filter, Clock, UserCheck } from "lucide-react";
import { useState } from "react";

const Community = () => {
  const [filter, setFilter] = useState("all");

  const posts = [
    {
      type: "event",
      author: { name: "Elena Moonchild", avatar: "", followers: 234, role: "Sound Healer" },
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
      author: { name: "David Lightwalker", avatar: "", followers: 189, role: "Sacred Geometry Teacher" },
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
      author: { name: "Aria Starseed", avatar: "", followers: 156, role: "Crystal Healer" },
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
      author: { name: "Phoenix Rising", avatar: "", followers: 298, role: "Movement Therapist" },
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
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url('/src/assets/spiritual-background.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-primary/30" />
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Spiritual Community
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover events and wisdom from the souls you follow
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>All</span>
            </Button>
            <Button
              variant={filter === "event" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("event")}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </Button>
            <Button
              variant={filter === "share" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("share")}
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Shares</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {filteredPosts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 cursor-pointer hover:scale-105 transition-transform">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="bg-primary/10">
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium cursor-pointer hover:text-primary transition-colors">{post.author.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{post.author.role}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Follow
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
                    {post.title}
                  </CardTitle>
                  
                  <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary/20">
                    <p className="text-sm italic text-foreground/80">"{post.thought}"</p>
                  </div>
                  
                  {post.type === 'event' && post.image && (
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {post.type === 'share' && post.youtubeUrl && (
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <iframe
                        src={post.youtubeUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  <CardDescription className="text-sm">
                    {post.description}
                  </CardDescription>
                  
                  {post.type === 'event' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{post.location}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{post.attendees} going</span>
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
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <Share2 className="h-4 w-4" />
                        <span>Reshare</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Members */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Featured Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary/10">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.followers} followers</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Popular Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Meditation', 'Healing', 'Astrology', 'Crystals', 'Yoga', 'Chakras', 'Mindfulness', 'Sacred Geometry'].map((topic) => (
                    <Badge key={topic} variant="secondary" className="bg-celestial/20 text-celestial-foreground cursor-pointer hover:bg-celestial/30 transition-colors">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Community</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Active Members</span>
                  <span className="font-medium">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Posts This Week</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Events Created</span>
                  <span className="font-medium">43</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Community;