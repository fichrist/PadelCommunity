import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Clock, Star, Play, MessageCircle, UserPlus, User, Plus, Search, Heart, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
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
        },
        {
          title: "Chakra Balancing Workshop",
          date: "January 12, 2024",
          image: soundHealingEvent,
          rating: 4.9,
          reviews: 31,
          description: "A transformative journey through all seven chakras using sound frequencies."
        },
        {
          title: "Crystal Bowl Meditation",
          date: "December 8, 2023",
          image: crystalWorkshopEvent,
          rating: 4.7,
          reviews: 22,
          description: "Peaceful meditation session with Tibetan singing bowls and crystal bowls."
        },
        {
          title: "Sacred Sound Healing Circle",
          date: "November 23, 2023",
          image: soundHealingEvent,
          rating: 5.0,
          reviews: 19,
          description: "Community healing circle with group sound healing and sharing."
        },
        {
          title: "Autumn Equinox Ceremony",
          date: "September 22, 2023",
          image: crystalWorkshopEvent,
          rating: 4.8,
          reviews: 27,
          description: "Balancing mind, body, and spirit with the seasonal energy shift."
        }
      ],
      upcomingEvents: [
        {
          title: "Full Moon Sound Healing Ceremony",
          date: "March 15, 2024",
          image: soundHealingEvent,
          price: "$65",
          description: "Experience the healing power of crystal bowls, gongs, and ancient chants."
        },
        {
          title: "Spring Awakening Workshop",
          date: "March 28, 2024",
          image: crystalWorkshopEvent,
          price: "$85",
          description: "Welcome spring with renewal energy work and sound healing techniques."
        },
        {
          title: "Tibetan Gong Bath Experience",
          date: "April 10, 2024",
          image: soundHealingEvent,
          price: "$55",
          description: "Immersive sound journey with traditional Tibetan gongs and singing bowls."
        },
        {
          title: "Heart Chakra Opening Circle",
          date: "April 22, 2024",
          image: crystalWorkshopEvent,
          price: "$70",
          description: "Focus on opening and balancing the heart chakra through sound and meditation."
        },
        {
          title: "Crystal Bowl Intensive Weekend",
          date: "May 4-5, 2024",
          image: soundHealingEvent,
          price: "$180",
          description: "Two-day intensive workshop learning crystal bowl therapy techniques."
        }
      ],
      shares: [
        {
          title: "Morning Meditation Practice",
          content: "Starting each day with 20 minutes of silence has transformed my practice. The clarity that comes from this simple routine is profound.",
          image: soundHealingEvent,
          likes: 45,
          comments: 12,
          timeAgo: "2 days ago"
        },
        {
          title: "Crystal Bowl Frequencies",
          content: "Each crystal bowl resonates at a specific frequency that corresponds to our chakras. The 432Hz frequency is particularly healing for the heart center.",
          image: crystalWorkshopEvent,
          likes: 67,
          comments: 18,
          timeAgo: "5 days ago"
        },
        {
          title: "Sacred Space Creation",
          content: "Creating a sacred space in your home doesn't require expensive items. Sometimes a single candle and clear intention is all you need.",
          image: soundHealingEvent,
          likes: 32,
          comments: 8,
          timeAgo: "1 week ago"
        },
        {
          title: "Full Moon Energy",
          content: "Tonight's full moon is perfect for releasing what no longer serves you. Take a moment to write down what you want to let go of and burn it safely.",
          image: crystalWorkshopEvent,
          likes: 89,
          comments: 24,
          timeAgo: "2 weeks ago"
        },
        {
          title: "Sound Healing Benefits",
          content: "Research shows that sound healing can reduce stress hormones by up to 40%. The vibrations literally help our cells return to their natural frequency.",
          image: soundHealingEvent,
          likes: 56,
          comments: 15,
          timeAgo: "3 weeks ago"
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
        },
        {
          title: "Rose Quartz Heart Healing",
          date: "February 14, 2024",
          image: crystalWorkshopEvent,
          rating: 5.0,
          reviews: 28,
          description: "Opening the heart chakra with rose quartz and loving-kindness meditation."
        },
        {
          title: "Amethyst Intuition Workshop",
          date: "January 20, 2024",
          image: soundHealingEvent,
          rating: 4.8,
          reviews: 19,
          description: "Enhancing psychic abilities and intuition with amethyst crystal work."
        },
        {
          title: "Crystal Grid Manifestation",
          date: "December 1, 2023",
          image: crystalWorkshopEvent,
          rating: 4.7,
          reviews: 24,
          description: "Learn to create powerful crystal grids for manifestation and protection."
        }
      ],
      upcomingEvents: [
        {
          title: "Crystal Healing Workshop for Beginners",
          date: "April 2-4, 2024",
          image: crystalWorkshopEvent,
          price: "$225",
          description: "Learn to select, cleanse, and work with crystals for healing and growth."
        },
        {
          title: "Advanced Reiki Attunement",
          date: "April 18, 2024",
          image: soundHealingEvent,
          price: "$150",
          description: "Level 2 Reiki attunement with sacred symbols and distance healing techniques."
        },
        {
          title: "Crystal Healing Certification",
          date: "May 10-12, 2024",
          image: crystalWorkshopEvent,
          price: "$350",
          description: "Complete certification program in crystal healing therapy and techniques."
        }
      ],
      shares: [
        {
          title: "Choosing Your First Crystal",
          content: "Trust your intuition when selecting crystals. The one that calls to you is often exactly what you need for your current journey.",
          image: crystalWorkshopEvent,
          likes: 52,
          comments: 16,
          timeAgo: "1 day ago"
        },
        {
          title: "Cleansing Crystal Energy",
          content: "Full moon is the perfect time to cleanse your crystals. Place them under moonlight overnight to reset their energy and enhance their healing power.",
          image: soundHealingEvent,
          likes: 73,
          comments: 22,
          timeAgo: "4 days ago"
        },
        {
          title: "Reiki and Crystal Synergy",
          content: "Combining Reiki energy with crystal healing amplifies the healing vibration. Each crystal acts as an energy amplifier for the universal life force.",
          image: crystalWorkshopEvent,
          likes: 41,
          comments: 11,
          timeAgo: "1 week ago"
        },
        {
          title: "Protection Crystal Grid",
          content: "Black tourmaline, hematite, and obsidian create a powerful protection grid for your home. Place them at the four corners of your space.",
          image: soundHealingEvent,
          likes: 64,
          comments: 19,
          timeAgo: "2 weeks ago"
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
              
              <p className="text-muted-foreground text-xl leading-loose mb-8 max-w-none">
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
              <p className="text-foreground/90 text-lg leading-loose max-w-none">
                {healer.fullBio}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {healer.upcomingEvents.map((event, index) => (
                <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300 flex-shrink-0 w-80">
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
                    <p className="text-base text-muted-foreground mb-4 leading-relaxed">
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
        </div>

        {/* Past Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Past Events</h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {healer.pastEvents.map((event, index) => (
                <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300 flex-shrink-0 w-80">
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
                    <p className="text-base text-muted-foreground mb-4 leading-relaxed">
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

        {/* Shares Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Shares</h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {healer.shares?.map((share, index) => (
                <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300 flex-shrink-0 w-80">
                  <div className="relative overflow-hidden">
                    <img
                      src={share.image}
                      alt={share.title}
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {share.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {share.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{share.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{share.comments}</span>
                        </div>
                      </div>
                      <span>{share.timeAgo}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default HealerProfile;