import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Heart, MessageCircle, Settings, Edit } from "lucide-react";

const Profile = () => {
  const userStats = {
    followers: 234,
    following: 187,
    eventsAttended: 45,
    postsShared: 23
  };

  const recentActivity = [
    {
      type: "event",
      title: "Joined Morning Meditation Circle",
      time: "2 hours ago"
    },
    {
      type: "post",
      title: "Shared 'Sacred Geometry in Daily Life'",
      time: "1 day ago"
    },
    {
      type: "follow",
      title: "Started following Luna Sage",
      time: "2 days ago"
    },
    {
      type: "event",
      title: "Created Full Moon Ceremony",
      time: "3 days ago"
    }
  ];

  const upcomingEvents = [
    {
      title: "Morning Meditation Circle",
      date: "Tomorrow",
      time: "7:00 AM",
      location: "Zen Garden Center"
    },
    {
      title: "Full Moon Healing Ceremony",
      date: "Friday",
      time: "8:00 PM",
      location: "Sacred Grove"
    },
    {
      title: "Yoga & Sound Bath",
      date: "Saturday",
      time: "10:00 AM",
      location: "Harmony Studio"
    }
  ];

  const interests = [
    "Meditation", "Crystal Healing", "Astrology", "Chakras", 
    "Sacred Geometry", "Yoga", "Mindfulness", "Energy Healing"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-2xl">AS</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold mb-2">Aurora Starlight</h1>
            <p className="text-lg text-muted-foreground mb-4">Spiritual Guide & Energy Healer</p>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Walking the path of light and love, sharing wisdom from ancient traditions and modern spiritual practices. 
              Here to support your journey of awakening and transformation. 🙏✨
            </p>
            
            <div className="flex justify-center space-x-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userStats.followers}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userStats.following}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userStats.eventsAttended}</div>
                <div className="text-sm text-muted-foreground">Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userStats.postsShared}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Activity */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest interactions in the community</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'event' ? 'bg-sage/20' :
                          activity.type === 'post' ? 'bg-celestial/20' :
                          'bg-lotus/20'
                        }`}>
                          {activity.type === 'event' ? <Calendar className="h-4 w-4" /> :
                           activity.type === 'post' ? <MessageCircle className="h-4 w-4" /> :
                           <Heart className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Events you're attending or organizing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {event.date} at {event.time}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Spiritual Interests */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Spiritual Interests</CardTitle>
                    <CardDescription>Topics that resonate with your soul</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <Badge 
                          key={interest} 
                          variant="secondary" 
                          className="bg-sage/20 text-sage-foreground hover:bg-sage/30 transition-colors cursor-pointer"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Community Impact */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Community Impact</CardTitle>
                    <CardDescription>Your positive influence</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Events Organized</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Lives Touched</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Wisdom Shared</span>
                      <span className="font-medium">89 posts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Hearts Opened</span>
                      <span className="font-medium">234 likes</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Spiritual Journey */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Spiritual Journey</CardTitle>
                    <CardDescription>Member since March 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4">
                      <div className="text-3xl mb-2">🌟</div>
                      <p className="text-sm text-muted-foreground">
                        "Every soul is a story waiting to unfold in the light of divine love."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>My Events</CardTitle>
                <CardDescription>Events you've organized or attended</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Events content will be loaded here...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>My Posts</CardTitle>
                <CardDescription>Wisdom and insights you've shared</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Posts content will be loaded here...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Spiritual Connections</CardTitle>
                <CardDescription>Your community of like-minded souls</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Connections content will be loaded here...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;