import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Clock, Star, Play, MessageCircle, UserPlus, User, Plus, Search } from "lucide-react";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";

// Import images
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

const HealerProfile = () => {
  const { healerId } = useParams();
  const navigate = useNavigate();

  const healerData = {
    "elena-moonchild": {
      id: "elena-moonchild",
      name: "Elena Moonchild",
      role: "Sound Healer & Energy Worker",
      avatar: elenaProfile,
      bio: "Elena has been practicing sound healing for over 8 years, specializing in crystal bowl therapy and sacred chanting. She combines ancient healing traditions with modern therapeutic techniques to create transformative experiences for her clients.",
      fullBio: "Elena Moonchild is a certified sound healer and energy worker with over 8 years of experience in holistic healing practices. She discovered her calling during a spiritual journey through Tibet, where she studied with traditional healers and learned the ancient art of sound therapy. Elena specializes in crystal singing bowl therapy, Tibetan gong healing, and sacred chanting. She has facilitated over 200 healing sessions and workshops, helping individuals release trauma, reduce stress, and reconnect with their inner wisdom. Her approach combines traditional healing methods with modern understanding of sound frequencies and their effects on the human body and energy field.",
      location: "Sedona, AZ",
      experience: "8+ years",
      specialties: ["Sound Healing", "Crystal Bowl Therapy", "Chakra Alignment", "Energy Clearing"],
      rating: 4.9,
      reviewCount: 23,
      pastEvents: [
        {
          title: "New Moon Sound Journey",
          date: "February 18, 2024",
          image: soundHealingEvent,
          rating: 5.0,
          reviews: 18,
          description: "Deep healing with crystal bowls and sacred chanting under the new moon energy."
        },
        {
          title: "Winter Solstice Ceremony", 
          date: "January 25, 2024",
          image: crystalWorkshopEvent,
          rating: 4.8,
          reviews: 25,
          description: "Celebrating the return of light with meditation and sound healing."
        }
      ],
      upcomingEvents: [
        {
          title: "Full Moon Sound Healing Ceremony",
          date: "March 15, 2024",
          image: soundHealingEvent,
          price: "$65",
          description: "Experience the healing power of crystal bowls, gongs, and ancient chants."
        }
      ]
    },
    "aria-starseed": {
      id: "aria-starseed",
      name: "Aria Starseed",
      role: "Crystal Healer & Reiki Master",
      avatar: ariaProfile,
      bio: "Aria is a certified crystal healer and Reiki Master with a decade of experience working with healing stones and energy healing modalities.",
      fullBio: "Aria Starseed has dedicated the last 10 years to mastering the ancient art of crystal healing and energy work. After experiencing a profound spiritual awakening, she left her corporate career to pursue her passion for healing. Aria is certified in multiple modalities including Reiki, crystal therapy, and chakra balancing. She has traveled extensively to source rare healing crystals and has built a reputation for her intuitive approach to crystal selection and placement. Her workshops have transformed hundreds of lives, teaching people how to harness the power of crystals for healing, protection, and spiritual growth.",
      location: "Asheville, NC",
      experience: "10+ years",
      specialties: ["Crystal Healing", "Reiki", "Chakra Balancing", "Manifestation"],
      rating: 4.8,
      reviewCount: 31,
      pastEvents: [
        {
          title: "Autumn Equinox Crystal Circle",
          date: "September 22, 2023",
          image: crystalWorkshopEvent,
          rating: 4.9,
          reviews: 22,
          description: "Balancing your energy with the seasonal shift using crystal healing."
        }
      ],
      upcomingEvents: [
        {
          title: "Crystal Healing Workshop for Beginners",
          date: "April 2-4, 2024",
          image: crystalWorkshopEvent,
          price: "$225",
          description: "Learn to select, cleanse, and work with crystals for healing and growth."
        }
      ]
    }
  };

  const healer = healerData[healerId as keyof typeof healerData];

  if (!healer) {
    return <div>Healer not found</div>;
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
        {/* Top Navigation Bar */}
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
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/')}
                  >
                    <Users className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
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
                    <User className="h-9 w-9 text-primary" />
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
                <div className="hidden md:flex items-center bg-muted rounded-full px-3 py-2 w-64">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input 
                    type="text" 
                    placeholder="search souls..." 
                    className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-muted-foreground"
                  />
                </div>
                <CreateDropdown onCreateShare={() => {}} />
                <NotificationDropdown />
                <ProfileDropdown userImage={elenaProfile} userName="Elena Moonchild" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={healer.avatar} />
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {healer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{healer.name}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{healer.role}</p>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <span className="font-medium">{healer.rating}</span>
                      <span className="text-muted-foreground">({healer.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {healer.bio}
              </p>
            </div>
            
            <div>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Location</h3>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{healer.location}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Experience</h3>
                      <p className="text-muted-foreground">{healer.experience}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {healer.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Presentation Video */}
          <Card>
            <CardHeader>
              <CardTitle>Meet {healer.name.split(' ')[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4 inline-block">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Introduction Video</p>
                  <p className="text-sm text-muted-foreground mt-1">Learn about {healer.name.split(' ')[0]}'s journey</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About {healer.name.split(' ')[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed">
                {healer.fullBio}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healer.upcomingEvents.map((event, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center text-sm text-primary font-semibold mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {event.date}
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{event.price}</span>
                    <Badge>Upcoming</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healer.pastEvents.map((event, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center text-sm text-primary font-semibold mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {event.date}
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">({event.reviews})</span>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default HealerProfile;