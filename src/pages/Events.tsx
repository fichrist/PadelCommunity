import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";

const Events = () => {
  const events = [
    {
      title: "Morning Meditation Circle",
      description: "Start your day with peaceful meditation in our beautiful garden sanctuary. All levels welcome.",
      date: "Tomorrow, 7:00 AM",
      location: "Zen Garden Center",
      organizer: { name: "Sarah Chen", avatar: "" },
      attendees: 12,
      category: "Meditation",
      image: ""
    },
    {
      title: "Full Moon Healing Ceremony",
      description: "Join us for a transformative healing circle under the full moon's energy.",
      date: "This Friday, 8:00 PM",
      location: "Sacred Grove",
      organizer: { name: "Marcus Rivera", avatar: "" },
      attendees: 28,
      category: "Ceremony",
      image: ""
    },
    {
      title: "Yoga & Sound Bath",
      description: "Gentle yoga flow followed by immersive crystal singing bowl meditation.",
      date: "Saturday, 10:00 AM",
      location: "Harmony Studio",
      organizer: { name: "Luna Wise", avatar: "" },
      attendees: 15,
      category: "Yoga",
      image: ""
    },
    {
      title: "Mindful Nature Walk",
      description: "Connect with nature through mindful walking and forest meditation.",
      date: "Sunday, 9:00 AM",
      location: "Mountain Trail",
      organizer: { name: "River Stone", avatar: "" },
      attendees: 8,
      category: "Nature",
      image: ""
    },
    {
      title: "Sacred Geometry Workshop",
      description: "Explore the divine patterns in nature and their spiritual significance.",
      date: "Next Tuesday, 6:00 PM",
      location: "Wisdom Circle",
      organizer: { name: "Dr. Amara Light", avatar: "" },
      attendees: 22,
      category: "Workshop",
      image: ""
    },
    {
      title: "Chakra Balancing Session",
      description: "Realign your energy centers through guided visualization and healing.",
      date: "Next Wednesday, 7:30 PM",
      location: "Crystal Temple",
      organizer: { name: "Sage Moon", avatar: "" },
      attendees: 18,
      category: "Healing",
      image: ""
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Spiritual Events
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover transformative events that nurture your soul and connect you with your spiritual community
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-48 bg-card/50 border-border/50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="meditation">Meditation</SelectItem>
              <SelectItem value="yoga">Yoga</SelectItem>
              <SelectItem value="ceremony">Ceremony</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="healing">Healing</SelectItem>
              <SelectItem value="nature">Nature</SelectItem>
            </SelectContent>
          </Select>
          <Button className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;