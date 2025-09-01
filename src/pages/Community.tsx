import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, BookOpen, Users, Sparkles } from "lucide-react";

const Community = () => {
  const posts = [
    {
      author: { name: "Elena Moonchild", avatar: "", followers: 234 },
      title: "The Power of Morning Gratitude",
      excerpt: "How starting each day with gratitude transformed my spiritual practice and opened my heart to abundance...",
      category: "Gratitude",
      readTime: "3 min read",
      likes: 42,
      comments: 8,
      timeAgo: "2 hours ago"
    },
    {
      author: { name: "David Lightwalker", avatar: "", followers: 189 },
      title: "Sacred Geometry in Daily Life",
      excerpt: "Discovering the divine patterns that surround us and how they can guide our spiritual journey...",
      category: "Sacred Geometry",
      readTime: "5 min read",
      likes: 67,
      comments: 12,
      timeAgo: "4 hours ago"
    },
    {
      author: { name: "Aria Starseed", avatar: "", followers: 156 },
      title: "Crystal Healing for Beginners",
      excerpt: "A gentle introduction to working with crystals for healing, protection, and spiritual growth...",
      category: "Crystal Healing",
      readTime: "4 min read",
      likes: 38,
      comments: 15,
      timeAgo: "6 hours ago"
    },
    {
      author: { name: "Phoenix Rising", avatar: "", followers: 298 },
      title: "Meditation Through Movement",
      excerpt: "Exploring how dance and movement can become powerful forms of moving meditation...",
      category: "Meditation",
      readTime: "6 min read",
      likes: 73,
      comments: 9,
      timeAgo: "8 hours ago"
    }
  ];

  const featuredMembers = [
    { name: "Luna Sage", role: "Meditation Teacher", followers: 1200, avatar: "" },
    { name: "River Flow", role: "Energy Healer", followers: 890, avatar: "" },
    { name: "Star Dreamer", role: "Astrologer", followers: 756, avatar: "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Spiritual Community
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share wisdom, stories, and insights with fellow souls on their spiritual journey
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {posts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="bg-primary/10">
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.author.name}</p>
                        <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Follow
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-3">
                    <Badge variant="secondary" className="bg-sage/20 text-sage-foreground">
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2 hover:text-primary transition-colors cursor-pointer">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-base mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{post.readTime}</span>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <Share2 className="h-4 w-4" />
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
  );
};

export default Community;