import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Heart, MessageCircle, Settings, Edit, User, Plus, Search, ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import CommunityEventCard from "@/components/CommunityEventCard";
import CommunityShareCard from "@/components/CommunityShareCard";
import ThoughtsModal from "@/components/ThoughtsModal";
import PersonalCalendar from "@/components/PersonalCalendar";

const Profile = () => {
  const navigate = useNavigate();
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [resharedPosts, setResharedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [resharedShares, setResharedShares] = useState<string[]>([]);
  const [savedShares, setSavedShares] = useState<string[]>([]);

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

  const upcomingEventsData = [
    {
      eventId: "morning-meditation-1",
      title: "Morning Meditation Circle",
      image: "/src/assets/peaceful-background.jpg",
      dateRange: { start: "Tomorrow • 7:00 AM" },
      author: { name: "Aurora Starlight", avatar: elenaProfile, role: "Spiritual Guide" },
      location: "Zen Garden Center",
      attendees: 12,
      tags: ["Meditation", "Morning Practice"],
      thought: "Join us for a peaceful start to your day with guided meditation.",
      comments: 5
    },
    {
      eventId: "full-moon-ceremony-1",
      title: "Full Moon Healing Ceremony",
      image: "/src/assets/spiritual-background.jpg",
      dateRange: { start: "Friday • 8:00 PM" },
      author: { name: "Aurora Starlight", avatar: elenaProfile, role: "Spiritual Guide" },
      location: "Sacred Grove",
      attendees: 24,
      tags: ["Full Moon", "Healing", "Ceremony"],
      thought: "Harness the powerful energy of the full moon for deep healing and transformation.",
      comments: 11
    }
  ];

  const pastEventsData = [
    {
      eventId: "sound-healing-1",
      title: "Sound Healing Workshop",
      image: "/src/assets/sound-healing-event.jpg",
      dateRange: { start: "Last Week" },
      author: { name: "Aurora Starlight", avatar: elenaProfile, role: "Spiritual Guide" },
      location: "Harmony Studio",
      attendees: 18,
      tags: ["Sound Healing", "Workshop"],
      thought: "An amazing journey through healing frequencies and vibrations.",
      comments: 8,
      rating: 4.9,
      reviews: 15
    }
  ];

  const sharesData = [
    {
      title: "Sacred Geometry in Daily Life",
      thought: "The golden ratio appears everywhere in nature, from flower petals to galaxy spirals.",
      description: "Understanding sacred geometry helps us recognize the divine patterns that surround us every day. When we align with these universal patterns, we find greater harmony and flow in our lives.",
      tags: ["Sacred Geometry", "Nature", "Divine Patterns"],
      author: { name: "Aurora Starlight", avatar: elenaProfile, role: "Spiritual Guide" },
      comments: 23
    },
    {
      title: "Moon Phase Manifestation",
      thought: "Each lunar phase offers unique energy for manifestation and release.",
      description: "Working with the moon's natural cycles amplifies our intentions. New moon for setting intentions, full moon for manifestation, waning moon for release.",
      tags: ["Moon Phases", "Manifestation", "Lunar Energy"],
      author: { name: "Aurora Starlight", avatar: elenaProfile, role: "Spiritual Guide" },
      comments: 17
    }
  ];

  return (
    <>
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-xl">AS</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-1">Aurora Starlight</h1>
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
                <p className="text-muted-foreground max-w-md">
                  Walking the path of light and love, sharing wisdom from ancient traditions. 🙏✨
                </p>
              </div>
            </div>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personal Calendar */}
        <div className="mb-12">
          <PersonalCalendar />
        </div>

        {/* Spiritual Interests */}
        <div className="mb-12">
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
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {upcomingEventsData.map((event, index) => (
                <CommunityEventCard
                  key={index}
                  {...event}
                  index={index}
                  isHorizontal={true}
                  onOpenThoughts={(eventData) => {
                    setSelectedPost(eventData);
                    setThoughtsModalOpen(true);
                  }}
                  isReshared={resharedPosts.includes(event.eventId)}
                  onToggleReshare={() => {
                    if (resharedPosts.includes(event.eventId)) {
                      setResharedPosts(prev => prev.filter(id => id !== event.eventId));
                      toast.success("Reshare removed");
                    } else {
                      setResharedPosts(prev => [...prev, event.eventId]);
                      toast.success("Event reshared!");
                    }
                  }}
                  isSaved={savedPosts.includes(event.eventId)}
                  onToggleSave={() => {
                    if (savedPosts.includes(event.eventId)) {
                      setSavedPosts(prev => prev.filter(id => id !== event.eventId));
                      toast.success("Removed from saved");
                    } else {
                      setSavedPosts(prev => [...prev, event.eventId]);
                      toast.success("Saved to your private page!");
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Past Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Past Events</h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {pastEventsData.map((event, index) => (
                <CommunityEventCard
                  key={index}
                  {...event}
                  index={index}
                  isHorizontal={true}
                  onOpenThoughts={(eventData) => {
                    setSelectedPost(eventData);
                    setThoughtsModalOpen(true);
                  }}
                  isReshared={resharedPosts.includes(event.eventId)}
                  onToggleReshare={() => {
                    if (resharedPosts.includes(event.eventId)) {
                      setResharedPosts(prev => prev.filter(id => id !== event.eventId));
                      toast.success("Reshare removed");
                    } else {
                      setResharedPosts(prev => [...prev, event.eventId]);
                      toast.success("Event reshared!");
                    }
                  }}
                  isSaved={savedPosts.includes(event.eventId)}
                  onToggleSave={() => {
                    if (savedPosts.includes(event.eventId)) {
                      setSavedPosts(prev => prev.filter(id => id !== event.eventId));
                      toast.success("Removed from saved");
                    } else {
                      setSavedPosts(prev => [...prev, event.eventId]);
                      toast.success("Saved to your private page!");
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Shares Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Shares</h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {sharesData.map((share, index) => (
                <CommunityShareCard
                  key={index}
                  {...share}
                  index={index}
                  isHorizontal={true}
                  onOpenThoughts={(shareData) => {
                    setSelectedPost(shareData);
                    setThoughtsModalOpen(true);
                  }}
                  isReshared={resharedShares.includes(`${share.title}-${index}`)}
                  onToggleReshare={() => {
                    const shareId = `${share.title}-${index}`;
                    if (resharedShares.includes(shareId)) {
                      setResharedShares(prev => prev.filter(id => id !== shareId));
                      toast.success("Reshare removed");
                    } else {
                      setResharedShares(prev => [...prev, shareId]);
                      toast.success("Share reshared!");
                    }
                  }}
                  isSaved={savedShares.includes(`${share.title}-${index}`)}
                  onToggleSave={() => {
                    const shareId = `${share.title}-${index}`;
                    if (savedShares.includes(shareId)) {
                      setSavedShares(prev => prev.filter(id => id !== shareId));
                      toast.success("Removed from saved");
                    } else {
                      setSavedShares(prev => [...prev, shareId]);
                      toast.success("Saved to your private page!");
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Thoughts Modal */}
      <ThoughtsModal
        open={thoughtsModalOpen}
        onOpenChange={setThoughtsModalOpen}
        postTitle={selectedPost?.title || selectedPost?.eventId || ""}
        thoughts={[]}
      />
    </>
  );
};

export default Profile;