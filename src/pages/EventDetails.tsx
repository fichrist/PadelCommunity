import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Clock, DollarSign, Star, MessageCircle, UserPlus, Play } from "lucide-react";

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

  const eventData = {
    "1": {
      id: "1",
      title: "Full Moon Sound Healing Ceremony",
      description: "Experience the healing power of crystal bowls, gongs, and ancient chants in our sacred moonlight ceremony. This transformative sound healing session will align your chakras and restore inner peace under the powerful energy of the full moon.",
      fullDescription: "Join us for a deeply transformative sound healing experience that combines the mystical energy of the full moon with ancient healing frequencies. This ceremony features crystal singing bowls tuned to specific chakra frequencies, Tibetan gongs, and sacred chants that have been used for centuries to promote healing and spiritual awakening. The session begins with a guided meditation to help you connect with the lunar energy, followed by 90 minutes of immersive sound healing. You'll lie comfortably on yoga mats as the healing vibrations wash over you, releasing tension, clearing energy blocks, and promoting deep relaxation. Many participants report profound spiritual insights, emotional release, and a sense of renewal after these sessions.",
      image: soundHealingEvent,
      organizer: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer" },
      date: "March 15, 2024",
      time: "7:00 PM - 9:30 PM",
      location: "Sacred Grove Sanctuary, Sedona AZ",
      price: "$65",
      tags: ["Sound Healing", "Full Moon", "Chakra Alignment"],
      attendees: [
        { name: "Sarah Light", avatar: elenaProfile, isAnonymous: false },
        { name: "David Peace", avatar: davidProfile, isAnonymous: false },
        { name: "Luna Sage", avatar: ariaProfile, isAnonymous: false },
        { name: "Anonymous", avatar: "", isAnonymous: true },
        { name: "River Flow", avatar: phoenixProfile, isAnonymous: false },
        { name: "Anonymous", avatar: "", isAnonymous: true },
        { name: "Star Dreamer", avatar: elenaProfile, isAnonymous: false },
        { name: "Anonymous", avatar: "", isAnonymous: true },
      ]
    },
    "2": {
      id: "2",
      title: "Crystal Healing Workshop for Beginners",
      description: "Learn to select, cleanse, and work with crystals for healing, protection, and spiritual growth in this hands-on workshop.",
      fullDescription: "Discover the ancient art of crystal healing in this comprehensive beginner's workshop. You'll learn about the metaphysical properties of different crystals, how to choose the right stones for your needs, and various cleansing and charging techniques. The workshop includes hands-on practice with crystal layouts, meditation with stones, and creating your own crystal grid for manifestation. Each participant will receive a starter crystal kit including clear quartz, amethyst, rose quartz, and black tourmaline, along with a detailed guidebook. Aria will share her decade of experience working with crystals, including personal stories of transformation and healing. The intimate class size ensures personalized attention and plenty of opportunity for questions.",
      image: crystalWorkshopEvent,
      organizer: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer" },
      date: "April 2-4, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Crystal Cave Studio, Asheville NC",
      price: "$225",
      tags: ["Crystal Healing", "Beginner Friendly", "Hands-on Workshop"],
      attendees: [
        { name: "Luna Sage", avatar: elenaProfile, isAnonymous: false },
        { name: "Ocean Mystic", avatar: davidProfile, isAnonymous: false },
        { name: "Anonymous", avatar: "", isAnonymous: true },
        { name: "Forest Walker", avatar: ariaProfile, isAnonymous: false },
        { name: "Anonymous", avatar: "", isAnonymous: true },
        { name: "Crystal Dawn", avatar: phoenixProfile, isAnonymous: false },
      ]
    }
  };

  const event = eventData[eventId as keyof typeof eventData];

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                {event.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {event.description}
              </p>
              
              {/* Event Meta Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-medium text-lg">{event.price}</span>
                </div>
              </div>

              <Button size="lg" className="w-full mb-4">
                Join Event
              </Button>
              
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-accent/60 text-accent-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Hosted by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar 
                    className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
                    onClick={() => navigate(`/healer/${event.organizer.name.toLowerCase().replace(' ', '-')}`)}
                  >
                    <AvatarImage src={event.organizer.avatar} />
                    <AvatarFallback className="bg-primary/10">
                      {event.organizer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className="cursor-pointer" 
                    onClick={() => navigate(`/healer/${event.organizer.name.toLowerCase().replace(' ', '-')}`)}
                  >
                    <h3 className="font-semibold hover:text-primary transition-colors">{event.organizer.name}</h3>
                    <p className="text-sm text-muted-foreground">{event.organizer.role}</p>
                  </div>
                  <Button variant="outline" className="ml-auto">
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 leading-relaxed mb-6">
                  {event.fullDescription}
                </p>
                
                {/* Event Video */}
                <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Attendees ({event.attendees.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          {!attendee.isAnonymous ? (
                            <AvatarImage src={attendee.avatar} />
                          ) : null}
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {attendee.isAnonymous ? "?" : attendee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {attendee.isAnonymous ? "Anonymous User" : attendee.name}
                        </span>
                      </div>
                      {!attendee.isAnonymous && (
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{event.location}</p>
                  <Button variant="outline" className="w-full">
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Healer Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Reviews for {event.organizer.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-1 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">4.9 (23 reviews)</span>
                </div>
                
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={davidProfile} />
                        <AvatarFallback>DP</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">David Peace</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Transformative experience! Elena's sound healing session was exactly what I needed for my spiritual journey."
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={ariaProfile} />
                        <AvatarFallback>AS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Luna Sage</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Beautiful healing space and incredible energy. Elena creates such a safe and sacred environment."
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Previous Events Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Previous Events by {event.organizer.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={soundHealingEvent}
                  alt="Past Sound Healing"
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-primary font-semibold mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  February 18, 2024
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  New Moon Sound Journey
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Deep healing with crystal bowls and sacred chanting under the new moon energy.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">(18)</span>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={crystalWorkshopEvent}
                  alt="Past Crystal Workshop"
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-primary font-semibold mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  January 25, 2024
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  Winter Solstice Ceremony
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Celebrating the return of light with meditation and sound healing.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">(25)</span>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;