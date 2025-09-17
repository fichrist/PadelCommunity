import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Clock, Star, Play, MessageCircle, UserPlus, User, Plus, Search, Heart, MessageSquare, ChevronLeft, ChevronRight, BookOpen, Share2, Repeat2, Phone, Mail, Facebook, Instagram } from "lucide-react";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import CommunityEventCard from "@/components/CommunityEventCard";
import CommunityShareCard from "@/components/CommunityShareCard";
import ThoughtsModal from "@/components/ThoughtsModal";
import { toast } from "sonner";
import { useState } from "react";

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
  
  // State for interactions
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [resharedPosts, setResharedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [resharedShares, setResharedShares] = useState<string[]>([]);
  const [savedShares, setSavedShares] = useState<string[]>([]);

  const healerData = {
    "elena-moonchild": {
      id: "elena-moonchild",
      name: "Elena Moonchild",
      role: "Sound Healer & Energy Worker",
      avatar: elenaProfile,
      bio: "Elena has been practicing sound healing for over 8 years, specializing in crystal bowl therapy and sacred chanting. She combines ancient healing traditions with modern therapeutic techniques to create transformative experiences for her clients.",
      fullBio: "Elena Moonchild is a certified sound healer and energy worker with over 8 years of experience in holistic healing practices. She discovered her calling during a spiritual journey through Tibet, where she studied with traditional healers and learned the ancient art of sound therapy. Elena specializes in crystal singing bowl therapy, Tibetan gong healing, and sacred chanting. She has facilitated over 200 healing sessions and workshops, helping individuals release trauma, reduce stress, and reconnect with their inner wisdom. Her approach combines traditional healing methods with modern understanding of sound frequencies and their effects on the human body and energy field.",
      location: "Sedona, AZ",
      contact: {
        phone: "+1 (555) 123-4567",
        email: "elena@moonchild.com",
        facebook: "ElenaHealer",
        instagram: "@elena_moonchild"
      },
      specialties: ["Sound Healing", "Crystal Bowl Therapy", "Chakra Alignment", "Energy Clearing"],
      rating: 4.9,
      reviewCount: 23,
      upcomingEvents: [
        {
          eventId: "elena-1",
          title: "Full Moon Sound Healing Ceremony",
          thought: "Join us for a transformative sound healing journey under the powerful energy of the full moon.",
          image: soundHealingEvent,
          dateRange: { start: "March 15, 2024" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 28,
          tags: ["Sound Healing", "Full Moon", "Crystal Bowls", "Energy Work"],
          connectionsGoing: ["Luna Sage", "River Flow"],
          comments: 12
        },
        {
          eventId: "elena-2",
          title: "Spring Awakening Workshop",
          thought: "Welcome the spring season with renewal energy work and transformative sound healing techniques.",
          image: crystalWorkshopEvent,
          dateRange: { start: "March 28, 2024" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 15,
          tags: ["Spring", "Energy Work", "Workshop", "Renewal"],
          connectionsGoing: ["Aria Starseed"],
          comments: 8
        },
        {
          eventId: "elena-3",
          title: "Tibetan Gong Bath Experience",
          thought: "Immerse yourself in the ancient healing vibrations of traditional Tibetan gongs and singing bowls.",
          image: soundHealingEvent,
          dateRange: { start: "April 10, 2024" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 22,
          tags: ["Tibetan", "Gong Bath", "Sound Healing", "Ancient Wisdom"],
          connectionsGoing: ["David Lightwalker", "Phoenix Rising", "Luna Sage"],
          comments: 15
        },
        {
          eventId: "elena-4",
          title: "Heart Chakra Opening Circle",
          thought: "Focus on opening and balancing the heart chakra through targeted sound healing and meditation practices.",
          image: crystalWorkshopEvent,
          dateRange: { start: "April 22, 2024" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 18,
          tags: ["Heart Chakra", "Chakra Healing", "Meditation", "Energy Balance"],
          comments: 9
        },
        {
          eventId: "elena-5",
          title: "Crystal Bowl Intensive Weekend",
          thought: "Two-day intensive workshop learning crystal bowl therapy techniques from beginner to advanced levels.",
          image: soundHealingEvent,
          dateRange: { start: "May 4", end: "May 5, 2024" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 12,
          tags: ["Crystal Bowl", "Intensive", "Workshop", "Certification"],
          connectionsGoing: ["River Flow"],
          comments: 6
        }
      ],
      pastEvents: [
        {
          eventId: "elena-past-1",
          title: "New Moon Sound Journey",
          thought: "Deep healing with crystal bowls and sacred chanting under the powerful new moon energy.",
          image: soundHealingEvent,
          dateRange: { start: "February 18, 2024" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 32,
          tags: ["New Moon", "Sound Journey", "Crystal Bowls", "Sacred Chanting"],
          isPastEvent: true,
          averageRating: 5.0,
          totalReviews: 18,
          comments: 24
        },
        {
          eventId: "elena-past-2",
          title: "Winter Solstice Ceremony",
          thought: "Celebrating the return of light with meditation, sound healing, and community connection.",
          image: crystalWorkshopEvent,
          dateRange: { start: "January 25, 2024" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 45,
          tags: ["Winter Solstice", "Ceremony", "Light", "Community"],
          isPastEvent: true,
          averageRating: 4.8,
          totalReviews: 25,
          comments: 31
        },
        {
          eventId: "elena-past-3",
          title: "Chakra Balancing Workshop",
          thought: "A transformative journey through all seven chakras using specific sound frequencies and healing techniques.",
          image: soundHealingEvent,
          dateRange: { start: "January 12, 2024" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 28,
          tags: ["Chakra", "Balancing", "Sound Frequencies", "Transformation"],
          isPastEvent: true,
          averageRating: 4.9,
          totalReviews: 31,
          comments: 19
        },
        {
          eventId: "elena-past-4",
          title: "Crystal Bowl Meditation",
          thought: "Peaceful meditation session combining Tibetan singing bowls with crystal bowl harmonics.",
          image: crystalWorkshopEvent,
          dateRange: { start: "December 8, 2023" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 35,
          tags: ["Crystal Bowl", "Meditation", "Tibetan", "Harmonics"],
          isPastEvent: true,
          averageRating: 4.7,
          totalReviews: 22,
          comments: 16
        },
        {
          eventId: "elena-past-5",
          title: "Sacred Sound Healing Circle",
          thought: "Community healing circle featuring group sound healing, sharing, and collective energy work.",
          image: soundHealingEvent,
          dateRange: { start: "November 23, 2023" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 24,
          tags: ["Sacred", "Community", "Healing Circle", "Group Energy"],
          isPastEvent: true,
          averageRating: 5.0,
          totalReviews: 19,
          comments: 22
        },
        {
          eventId: "elena-past-6",
          title: "Autumn Equinox Ceremony",
          thought: "Balancing mind, body, and spirit with the seasonal energy shift and harmonic frequencies.",
          image: crystalWorkshopEvent,
          dateRange: { start: "September 22, 2023" },
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          location: "Sedona, AZ",
          attendees: 39,
          tags: ["Autumn Equinox", "Balance", "Seasonal", "Harmonic"],
          isPastEvent: true,
          averageRating: 4.8,
          totalReviews: 27,
          comments: 18
        }
      ],
      shares: [
        {
          title: "Morning Meditation Practice",
          thought: "Starting each day with 20 minutes of silence has transformed my practice completely.",
          description: "The clarity that comes from this simple routine is profound. I've noticed increased intuition, better emotional regulation, and a deeper connection to my healing work. Try it for just one week and feel the difference.",
          tags: ["Meditation", "Morning Practice", "Mindfulness", "Daily Ritual"],
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          comments: 12
        },
        {
          title: "Crystal Bowl Frequencies",
          thought: "Each crystal bowl resonates at a specific frequency that corresponds to our chakras.",
          description: "The 432Hz frequency is particularly healing for the heart center, while 528Hz is known as the 'love frequency.' Understanding these vibrations helps us target specific areas for healing and transformation.",
          tags: ["Crystal Bowls", "Frequencies", "Chakras", "Sound Healing"],
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          comments: 18
        },
        {
          title: "Sacred Space Creation",
          thought: "Creating a sacred space in your home doesn't require expensive items or elaborate setups.",
          description: "Sometimes a single candle and clear intention is all you need. The energy you bring to the space is far more important than any physical objects. Start simple and let your practice evolve naturally.",
          tags: ["Sacred Space", "Home Practice", "Intention", "Simplicity"],
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          comments: 8
        },
        {
          title: "Full Moon Energy",
          thought: "Tonight's full moon is perfect for releasing what no longer serves you.",
          description: "Take a moment to write down what you want to let go of and burn it safely under the moonlight. The lunar energy amplifies our intentions and supports deep transformation. Trust the process.",
          tags: ["Full Moon", "Release", "Lunar Energy", "Transformation"],
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          comments: 24
        },
        {
          title: "Sound Healing Benefits",
          thought: "Research shows that sound healing can reduce stress hormones by up to 40%.",
          description: "The vibrations literally help our cells return to their natural frequency, promoting healing on all levels. This isn't just spiritual practice - it's backed by science and measurable results.",
          tags: ["Sound Healing", "Research", "Stress Relief", "Cellular Healing"],
          author: { name: "Elena Moonchild", avatar: elenaProfile, role: "Sound Healer & Energy Worker" },
          comments: 15
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
      contact: {
        phone: "+1 (555) 987-6543",
        email: "aria@starseed.com",
        facebook: "AriaStarseedHealer",
        instagram: "@aria_starseed"
      },
      specialties: ["Crystal Healing", "Reiki", "Chakra Balancing", "Manifestation"],
      rating: 4.8,
      reviewCount: 31,
      pastEvents: [
        {
          eventId: "aria-past-1",
          title: "Autumn Equinox Crystal Circle",
          thought: "Balancing your energy with the seasonal shift using the power of crystal healing and meditation.",
          image: crystalWorkshopEvent,
          dateRange: { start: "September 22, 2023" },
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          location: "Asheville, NC",
          attendees: 28,
          tags: ["Autumn Equinox", "Crystal Healing", "Balance", "Seasonal"],
          isPastEvent: true,
          averageRating: 4.9,
          totalReviews: 22,
          comments: 16
        },
        {
          eventId: "aria-past-2",
          title: "Rose Quartz Heart Healing",
          thought: "Opening the heart chakra with rose quartz energy and loving-kindness meditation practices.",
          image: crystalWorkshopEvent,
          dateRange: { start: "February 14, 2024" },
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          location: "Asheville, NC",
          attendees: 35,
          tags: ["Rose Quartz", "Heart Healing", "Love", "Meditation"],
          isPastEvent: true,
          averageRating: 5.0,
          totalReviews: 28,
          comments: 22
        },
        {
          eventId: "aria-past-3",
          title: "Amethyst Intuition Workshop",
          thought: "Enhancing psychic abilities and intuition through focused amethyst crystal work and energy practices.",
          image: soundHealingEvent,
          dateRange: { start: "January 20, 2024" },
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          location: "Asheville, NC",
          attendees: 22,
          tags: ["Amethyst", "Intuition", "Psychic", "Energy Work"],
          isPastEvent: true,
          averageRating: 4.8,
          totalReviews: 19,
          comments: 14
        },
        {
          eventId: "aria-past-4",
          title: "Crystal Grid Manifestation",
          thought: "Learn to create powerful crystal grids for manifestation, protection, and energy amplification.",
          image: crystalWorkshopEvent,
          dateRange: { start: "December 1, 2023" },
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          location: "Asheville, NC",
          attendees: 31,
          tags: ["Crystal Grid", "Manifestation", "Protection", "Energy"],
          isPastEvent: true,
          averageRating: 4.7,
          totalReviews: 24,
          comments: 18
        }
      ],
      upcomingEvents: [
        {
          eventId: "aria-1",
          title: "Crystal Healing Workshop for Beginners",
          thought: "A comprehensive introduction to crystal healing, perfect for those starting their crystal journey.",
          image: crystalWorkshopEvent,
          dateRange: { start: "April 2", end: "April 4, 2024" },
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          location: "Asheville, NC",
          attendees: 18,
          tags: ["Beginner", "Crystal Healing", "Workshop", "Foundation"],
          connectionsGoing: ["Elena Moonchild", "Luna Sage"],
          comments: 9
        },
        {
          eventId: "aria-2",
          title: "Advanced Reiki Attunement",
          thought: "Level 2 Reiki attunement featuring sacred symbols and distance healing techniques.",
          image: soundHealingEvent,
          dateRange: { start: "April 18, 2024" },
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          location: "Asheville, NC",
          attendees: 12,
          tags: ["Reiki", "Attunement", "Sacred Symbols", "Distance Healing"],
          connectionsGoing: ["River Flow"],
          comments: 6
        },
        {
          eventId: "aria-3",
          title: "Crystal Healing Certification",
          thought: "Complete certification program in crystal healing therapy, techniques, and professional practice.",
          image: crystalWorkshopEvent,
          dateRange: { start: "May 10", end: "May 12, 2024" },
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          location: "Asheville, NC",
          attendees: 15,
          tags: ["Certification", "Crystal Therapy", "Professional", "Advanced"],
          connectionsGoing: ["Phoenix Rising", "David Lightwalker"],
          comments: 11
        }
      ],
      shares: [
        {
          title: "Choosing Your First Crystal",
          thought: "Trust your intuition when selecting crystals - the universe guides us to what we need.",
          description: "The crystal that calls to you is often exactly what you need for your current journey. Don't overthink it, feel the energy and trust your inner knowing. Your first crystal will be your teacher.",
          tags: ["Crystal Selection", "Intuition", "Beginner", "Trust"],
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          comments: 16
        },
        {
          title: "Cleansing Crystal Energy",
          thought: "Full moon energy is the perfect time to cleanse and recharge your crystal collection.",
          description: "Place your crystals under moonlight overnight to reset their energy and enhance their healing power. You can also use sage, selenite, or running water depending on the crystal type.",
          tags: ["Crystal Cleansing", "Full Moon", "Energy Reset", "Maintenance"],
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          comments: 22
        },
        {
          title: "Reiki and Crystal Synergy",
          thought: "Combining Reiki universal life force energy with crystal healing creates powerful amplification.",
          description: "Each crystal acts as an energy amplifier for the universal life force. When we channel Reiki through crystals, we create a focused, intensified healing experience that works on all levels.",
          tags: ["Reiki", "Crystal Healing", "Energy Amplification", "Synergy"],
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          comments: 11
        },
        {
          title: "Protection Crystal Grid",
          thought: "Black tourmaline, hematite, and obsidian create an incredibly powerful protection grid.",
          description: "Place these grounding stones at the four corners of your space to create an energetic shield. This grid helps absorb negative energy and maintains a clear, protected environment for healing work.",
          tags: ["Protection", "Crystal Grid", "Black Tourmaline", "Energy Shield"],
          author: { name: "Aria Starseed", avatar: ariaProfile, role: "Crystal Healer & Reiki Master" },
          comments: 19
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
                      <h3 className="font-semibold mb-2">Contact</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{healer.contact.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{healer.contact.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Facebook className="h-4 w-4" />
                          <span>{healer.contact.facebook}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Instagram className="h-4 w-4" />
                          <span>{healer.contact.instagram}</span>
                        </div>
                      </div>
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
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Past Events</h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {healer.pastEvents.map((event, index) => (
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
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Shares</h2>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {healer.shares?.map((share, index) => (
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
      </div>
    </div>
  );
};

export default HealerProfile;