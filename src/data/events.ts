// Centralized events data - ready to be replaced with Supabase database connection
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

// ============= TYPE DEFINITIONS =============

export interface Organizer {
  id?: string;
  name: string;
  avatar: string;
  role?: string;
  location?: string;
  previousEvents?: {
    title: string;
    date: string;
    attendees: number;
  }[];
}

export interface PriceOption {
  type: string;
  price: string;
  description: string;
  soldOut?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: string;
  description: string;
  soldOut?: boolean;
}

export interface Attendee {
  name: string;
  avatar: string;
  location: string;
  isAnonymous?: boolean;
}

export interface Review {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  rating: number;
  content: string;
  timeAgo: string;
}

export interface Thought {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  timeAgo: string;
}

export interface Event {
  id: string;
  eventId: string;
  title: string;
  description: string;
  fullDescription?: string;
  image: string;
  date: string;
  dateTo?: string;
  time?: string;
  location: string;
  price?: string;
  priceOptions?: PriceOption[];
  prices?: { text: string; amount: string; soldOut?: boolean }[];
  category?: string;
  tags: string[];
  organizers: Organizer[];
  attendees: number | Attendee[];
  connectionsGoing?: string[];
  isPastEvent?: boolean;
  averageRating?: number;
  totalReviews?: number;
  reviews?: Review[];
  thoughts?: Thought[];
  comments?: number;
  addOns?: AddOn[];
  additionalOptions?: { name: string; price: string; description: string; soldOut?: boolean }[];
  reshareText?: string;
  commentsInstructions?: string;
}

// ============= MOCK DATA =============

export const events: Event[] = [
  {
    id: "1",
    eventId: "1",
    title: "Full Moon Sound Healing Ceremony",
    description: "Experience the healing power of crystal bowls, gongs, and ancient chants in our sacred moonlight ceremony. This transformative sound healing session will align your chakras and restore inner peace under the powerful energy of the full moon.",
    fullDescription: "Join us for a deeply transformative sound healing experience that combines the mystical energy of the full moon with ancient healing frequencies. This ceremony features crystal singing bowls tuned to specific chakra frequencies, Tibetan gongs, and sacred chants that have been used for centuries to promote healing and spiritual awakening. The session begins with a guided meditation to help you connect with the lunar energy, followed by 90 minutes of immersive sound healing. You'll lie comfortably on yoga mats as the healing vibrations wash over you, releasing tension, clearing energy blocks, and promoting deep relaxation. Many participants report profound spiritual insights, emotional release, and a sense of renewal after these sessions.",
    image: soundHealingEvent,
    date: "March 15, 2024",
    time: "7:00 PM - 9:30 PM",
    location: "Sacred Grove Sanctuary, Sedona AZ",
    price: "$65",
    priceOptions: [
      { type: "Early Bird", price: "$55", description: "Limited time offer", soldOut: true },
      { type: "Regular", price: "$65", description: "Standard price", soldOut: false },
      { type: "VIP", price: "$95", description: "Includes crystal gift & tea ceremony", soldOut: false }
    ],
    prices: [
      { text: "Regular", amount: "65", soldOut: false },
      { text: "Early Bird", amount: "55", soldOut: true }
    ],
    category: "Ceremony",
    tags: ["Sound Healing", "Full Moon", "Chakra Alignment"],
    organizers: [
      { 
        id: "healer-1",
        name: "Elena Moonchild", 
        avatar: elenaProfile, 
        role: "Sound Healer", 
        location: "Sedona, AZ",
        previousEvents: [
          { title: "New Moon Meditation Circle", date: "Feb 28, 2024", attendees: 18 },
          { title: "Chakra Balancing Workshop", date: "Feb 14, 2024", attendees: 24 },
          { title: "Sound Bath Experience", date: "Jan 30, 2024", attendees: 32 }
        ]
      },
      { 
        id: "healer-2",
        name: "David Peace", 
        avatar: davidProfile, 
        role: "Assistant Healer", 
        location: "Sedona, AZ",
        previousEvents: [
          { title: "Mindfulness Retreat", date: "Mar 1, 2024", attendees: 15 },
          { title: "Healing Touch Workshop", date: "Feb 20, 2024", attendees: 20 }
        ]
      }
    ],
    attendees: [
      { name: "Sarah Light", avatar: elenaProfile, location: "Phoenix, AZ", isAnonymous: false },
      { name: "David Peace", avatar: davidProfile, location: "Tucson, AZ", isAnonymous: false },
      { name: "Luna Sage", avatar: ariaProfile, location: "Flagstaff, AZ", isAnonymous: false },
      { name: "Emma Wilson", avatar: phoenixProfile, location: "Scottsdale, AZ", isAnonymous: true },
      { name: "River Flow", avatar: phoenixProfile, location: "Scottsdale, AZ", isAnonymous: false },
      { name: "Mark Thompson", avatar: davidProfile, location: "Mesa, AZ", isAnonymous: true },
      { name: "Star Dreamer", avatar: elenaProfile, location: "Tempe, AZ", isAnonymous: false },
      { name: "Jessica Chen", avatar: ariaProfile, location: "Phoenix, AZ", isAnonymous: true },
    ],
    addOns: [
      { id: "cacao", name: "Sacred Cacao Ceremony", price: "$25", description: "Ceremonial cacao drink to open the heart chakra" },
      { id: "crystals", name: "Personal Crystal Set", price: "$35", description: "Take home your own set of charged healing crystals" },
      { id: "sage", name: "Sage Cleansing Kit", price: "$15", description: "White sage bundle and palo santo for home cleansing" },
      { id: "recording", name: "Session Recording", price: "$20", description: "Audio recording of the healing session for home practice" }
    ],
    additionalOptions: [
      { name: "Sacred Cacao Ceremony", price: "25", description: "Ceremonial cacao drink to open the heart chakra", soldOut: false },
      { name: "Personal Crystal Set", price: "35", description: "Take home your own set of charged healing crystals", soldOut: true }
    ],
    isPastEvent: false,
    comments: 8,
    connectionsGoing: ["Sarah Light", "David Peace", "Luna Sage"],
    commentsInstructions: "Please bring your own yoga mat and blanket. Water will be provided. Arrive 15 minutes early for check-in.",
    reshareText: "Join us for this magical full moon ceremony! 🌕✨ Limited spots available."
  },
  {
    id: "2",
    eventId: "2",
    title: "Crystal Healing Workshop for Beginners",
    description: "Learn to select, cleanse, and work with crystals for healing, protection, and spiritual growth in this hands-on workshop.",
    fullDescription: "Discover the ancient art of crystal healing in this comprehensive beginner's workshop. You'll learn about the metaphysical properties of different crystals, how to choose the right stones for your needs, and various cleansing and charging techniques. The workshop includes hands-on practice with crystal layouts, meditation with stones, and creating your own crystal grid for manifestation. Each participant will receive a starter crystal kit including clear quartz, amethyst, rose quartz, and black tourmaline, along with a detailed guidebook. Aria will share her decade of experience working with crystals, including personal stories of transformation and healing. The intimate class size ensures personalized attention and plenty of opportunity for questions.",
    image: crystalWorkshopEvent,
    date: "April 2-4, 2024",
    dateTo: "",
    time: "10:00 AM - 4:00 PM",
    location: "Crystal Cave Studio, Asheville NC",
    price: "$225",
    priceOptions: [
      { type: "Workshop Only", price: "$195", description: "3-day workshop access", soldOut: false },
      { type: "Workshop + Kit", price: "$225", description: "Includes crystal starter kit", soldOut: false },
      { type: "Premium Package", price: "$295", description: "Workshop, kit & private session", soldOut: true }
    ],
    prices: [{ text: "3-Day Workshop", amount: "225" }],
    category: "Workshop",
    tags: ["Crystal Healing", "Beginner Friendly", "Hands-on Workshop"],
    organizers: [
      { 
        id: "healer-3",
        name: "Aria Starseed", 
        avatar: ariaProfile, 
        role: "Crystal Healer", 
        location: "Asheville, NC",
        previousEvents: [
          { title: "Crystal Grid Mastery", date: "Mar 5, 2024", attendees: 12 },
          { title: "Gemstone Healing Circle", date: "Feb 22, 2024", attendees: 16 },
          { title: "Advanced Crystal Workshop", date: "Feb 8, 2024", attendees: 14 }
        ]
      }
    ],
    attendees: [
      { name: "Luna Sage", avatar: elenaProfile, location: "Asheville, NC", isAnonymous: false },
      { name: "Ocean Mystic", avatar: davidProfile, location: "Charlotte, NC", isAnonymous: false },
      { name: "Alex Johnson", avatar: phoenixProfile, location: "Raleigh, NC", isAnonymous: true },
      { name: "Forest Walker", avatar: ariaProfile, location: "Boone, NC", isAnonymous: false },
      { name: "Maya Patel", avatar: elenaProfile, location: "Charlotte, NC", isAnonymous: true },
      { name: "Crystal Dawn", avatar: phoenixProfile, location: "Durham, NC", isAnonymous: false },
    ],
    addOns: [
      { id: "advanced-kit", name: "Advanced Crystal Kit", price: "$45", description: "Premium crystals including rare healing stones" },
      { id: "private-session", name: "Private Consultation", price: "$75", description: "30-minute one-on-one crystal healing session" },
      { id: "guidebook", name: "Comprehensive Guidebook", price: "$28", description: "Detailed crystal healing reference book" }
    ],
    additionalOptions: [
      { name: "Advanced Crystal Kit", price: "45", description: "Premium crystals including rare healing stones", soldOut: false }
    ],
    isPastEvent: false,
    comments: 5,
    connectionsGoing: ["Luna Sage"],
    commentsInstructions: "All materials provided. Comfortable clothing recommended. Lunch included on all three days.",
    reshareText: "Perfect for beginners! Learn the art of crystal healing in beautiful Asheville 💎🌿"
  },
  {
    id: "3",
    eventId: "3",
    title: "Morning Meditation Circle",
    description: "Start your day with peaceful meditation in our beautiful garden sanctuary. All levels welcome. This gentle practice includes breathing exercises, guided meditation, and silent contemplation in nature.",
    fullDescription: "Begin your day in tranquility with our Morning Meditation Circle. This gentle practice is designed for all levels, from complete beginners to experienced meditators. We gather in our serene garden sanctuary, surrounded by nature's beauty, to cultivate inner peace and mindfulness. The session includes pranayama breathing exercises, guided visualization, and periods of silent meditation. Our experienced facilitators create a supportive environment where you can deepen your practice and connect with like-minded souls.",
    image: soundHealingEvent,
    date: "March 16, 2024 at 7:00 AM",
    time: "7:00 AM - 8:30 AM",
    location: "Zen Garden Center, Sedona AZ",
    price: "$25",
    category: "Meditation",
    tags: ["Meditation", "Morning Practice", "Garden"],
    organizers: [
      { id: "healer-1", name: "Sarah Chen", avatar: elenaProfile },
      { id: "healer-7", name: "Michael Zen", avatar: elenaProfile }
    ],
    attendees: 12,
    isPastEvent: false,
    comments: 5,
    connectionsGoing: ["Luna Sage", "River Flow"]
  },
  {
    id: "4",
    eventId: "4",
    title: "Yoga & Sound Bath",
    description: "Gentle yoga flow followed by immersive crystal singing bowl meditation. Perfect for releasing tension and finding inner peace through movement and sound healing vibrations.",
    fullDescription: "Experience the perfect harmony of movement and sound in this transformative session. We begin with a gentle, accessible yoga flow designed to release physical tension and prepare your body for deep relaxation. The practice then transitions into an immersive sound bath featuring crystal singing bowls, each tuned to different chakra frequencies. As you rest in savasana, the healing vibrations will wash over you, promoting deep relaxation, stress relief, and energetic balance.",
    image: soundHealingEvent,
    date: "March 14, 2024 at 10:00 AM",
    time: "10:00 AM - 12:00 PM",
    location: "Harmony Studio, Asheville NC",
    price: "$45",
    category: "Yoga",
    tags: ["Yoga", "Sound Bath", "Meditation"],
    organizers: [
      { id: "healer-3", name: "Luna Wise", avatar: elenaProfile },
      { id: "healer-8", name: "Echo Sound", avatar: elenaProfile },
      { id: "healer-9", name: "River Flow", avatar: elenaProfile }
    ],
    attendees: 15,
    isPastEvent: true,
    averageRating: 4.8,
    totalReviews: 12,
    reviews: [
      { id: "1", author: { name: "Sarah Light", avatar: elenaProfile }, rating: 5, content: "Amazing session! The sound bath was deeply relaxing and transformative.", timeAgo: "2 days ago" },
      { id: "2", author: { name: "David Peace", avatar: elenaProfile }, rating: 4, content: "Perfect combination of yoga and sound healing. Luna is very skilled.", timeAgo: "1 day ago" },
      { id: "3", author: { name: "River Flow", avatar: elenaProfile }, rating: 5, content: "Best sound bath I've experienced. The space was beautiful too.", timeAgo: "3 days ago" }
    ],
    comments: 12,
    connectionsGoing: ["David Peace"],
    thoughts: [
      { id: "1", author: { name: "Sarah Light", avatar: elenaProfile }, content: "Amazing workshop! Looking forward to more sessions like this.", likes: 8, timeAgo: "2 days ago" }
    ]
  },
  {
    id: "5",
    eventId: "5",
    title: "Mindful Nature Walk",
    description: "Connect with nature through mindful walking and forest meditation. Discover the healing power of trees, breathe fresh mountain air, and practice walking meditation techniques.",
    fullDescription: "Reconnect with the natural world through this immersive mindful nature walk. We'll explore beautiful mountain trails while practicing walking meditation, forest bathing (shinrin-yoku), and nature awareness exercises. Learn techniques to quiet the mind, open your senses, and receive the healing benefits of time spent in nature. This experience is suitable for all fitness levels and includes periods of gentle walking, standing meditation, and sitting in nature.",
    image: crystalWorkshopEvent,
    date: "March 17, 2024 at 9:00 AM",
    time: "9:00 AM - 12:00 PM",
    location: "Mountain Trail, Big Sur CA",
    price: "$35",
    category: "Nature",
    tags: ["Nature", "Walking", "Mindfulness"],
    organizers: [
      { id: "healer-4", name: "River Stone", avatar: elenaProfile },
      { id: "healer-10", name: "Forest Guide", avatar: elenaProfile }
    ],
    attendees: 8,
    isPastEvent: false,
    comments: 3,
    connectionsGoing: ["Luna Sage"],
    thoughts: [
      { id: "1", author: { name: "Luna Sage", avatar: elenaProfile }, content: "Can't wait for this peaceful nature walk. Perfect way to start the day.", likes: 5, timeAgo: "1 hour ago" }
    ]
  },
  {
    id: "6",
    eventId: "6",
    title: "Sacred Geometry Workshop",
    description: "Explore the divine patterns in nature and their spiritual significance. Learn how to recognize and work with sacred geometric forms in meditation, art, and daily life practices.",
    fullDescription: "Dive deep into the mystical world of sacred geometry in this enlightening workshop. Explore the mathematical patterns that underlie all of creation, from the spiral of a nautilus shell to the structure of galaxies. Learn about the Flower of Life, Metatron's Cube, the Golden Ratio, and other sacred forms. Discover how to incorporate these powerful symbols into your meditation practice, artwork, and spiritual development. This workshop combines ancient wisdom with practical application.",
    image: soundHealingEvent,
    date: "March 12, 2024 at 6:00 PM",
    time: "6:00 PM - 9:00 PM",
    location: "Wisdom Circle, Mount Shasta CA",
    price: "$75",
    category: "Workshop",
    tags: ["Sacred Geometry", "Workshop", "Education"],
    organizers: [
      { id: "healer-5", name: "Dr. Amara Light", avatar: elenaProfile }
    ],
    attendees: 22,
    isPastEvent: true,
    averageRating: 4.9,
    totalReviews: 18,
    reviews: [
      { id: "1", author: { name: "Star Seeker", avatar: elenaProfile }, rating: 5, content: "Mind-blowing insights into sacred geometry! Dr. Amara's knowledge is incredible.", timeAgo: "1 week ago" },
      { id: "2", author: { name: "Cosmic Mind", avatar: elenaProfile }, rating: 5, content: "This workshop changed my perspective on everything. Highly recommended!", timeAgo: "5 days ago" },
      { id: "3", author: { name: "Sacred Soul", avatar: elenaProfile }, rating: 4, content: "Fascinating content and great presentation. Worth every minute.", timeAgo: "1 week ago" }
    ],
    comments: 15,
    connectionsGoing: ["Star Seeker", "Cosmic Mind"],
    thoughts: [
      { id: "1", author: { name: "Star Seeker", avatar: elenaProfile }, content: "Dr. Amara's workshops are always enlightening. This one was exceptional!", likes: 12, timeAgo: "1 week ago" }
    ]
  },
  {
    id: "7",
    eventId: "7",
    title: "Chakra Balancing Session",
    description: "Realign your energy centers through guided visualization and healing. Experience deep chakra cleansing, energy balancing, and learn techniques for maintaining energetic harmony.",
    fullDescription: "Experience a profound journey through your seven main chakras in this healing session. Through guided visualization, energy work, and specific sound frequencies, you'll learn to identify and clear blockages in your energy centers. Each chakra will be addressed with targeted healing techniques, helping you restore balance, vitality, and spiritual alignment. You'll also receive practical tools and techniques to maintain chakra health in your daily life.",
    image: crystalWorkshopEvent,
    date: "March 19, 2024 at 7:30 PM",
    time: "7:30 PM - 9:30 PM",
    location: "Crystal Temple, Tulum Mexico",
    price: "$55",
    category: "Healing",
    tags: ["Chakras", "Healing", "Energy Work"],
    organizers: [
      { id: "healer-6", name: "Sage Moon", avatar: elenaProfile },
      { id: "healer-11", name: "Crystal Aura", avatar: elenaProfile },
      { id: "healer-12", name: "Energy Master", avatar: elenaProfile }
    ],
    attendees: 18,
    isPastEvent: false,
    comments: 7,
    connectionsGoing: ["Sacred Soul", "Energy Master"],
    thoughts: [
      { id: "1", author: { name: "Sacred Soul", avatar: elenaProfile }, content: "Looking forward to this chakra session. Sage Moon's healing work is incredible.", likes: 6, timeAgo: "3 hours ago" }
    ]
  },
  {
    id: "8",
    eventId: "8",
    title: "Breathwork Journey",
    description: "Explore transformative breathwork techniques for emotional release and spiritual awakening. This powerful practice uses specific breathing patterns to access altered states of consciousness.",
    fullDescription: "Embark on a powerful inner journey through the transformative practice of breathwork. Using specific breathing techniques, you'll access deep states of consciousness that can facilitate emotional release, spiritual insights, and profound healing. This session is guided by experienced facilitators who create a safe container for your experience. Many participants report powerful visions, emotional breakthroughs, and a deeper connection to their true selves.",
    image: soundHealingEvent,
    date: "March 20, 2024 at 6:00 PM",
    time: "6:00 PM - 8:30 PM",
    location: "Breath Studio, Santa Fe NM",
    price: "$45",
    category: "Breathwork",
    tags: ["Breathwork", "Healing", "Transformation"],
    organizers: [
      { id: "healer-13", name: "Breath Master", avatar: davidProfile }
    ],
    attendees: 16,
    isPastEvent: false,
    comments: 4,
    connectionsGoing: ["Luna Sage", "River Flow"]
  }
];

// ============= HELPER FUNCTIONS =============

/**
 * Get all events
 */
export const getAllEvents = (): Event[] => {
  return events;
};

/**
 * Get event by ID
 */
export const getEventById = (id: string): Event | undefined => {
  return events.find(event => event.id === id || event.eventId === id);
};

/**
 * Get featured events (for homepage)
 */
export const getFeaturedEvents = (limit: number = 3): Event[] => {
  return events.filter(event => !event.isPastEvent).slice(0, limit);
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = (): Event[] => {
  return events.filter(event => !event.isPastEvent);
};

/**
 * Get past events
 */
export const getPastEvents = (): Event[] => {
  return events.filter(event => event.isPastEvent);
};

/**
 * Get events by category
 */
export const getEventsByCategory = (category: string): Event[] => {
  return events.filter(event => event.category === category);
};

/**
 * Get events by tag
 */
export const getEventsByTag = (tag: string): Event[] => {
  return events.filter(event => event.tags.includes(tag));
};

/**
 * Get all unique tags from events
 */
export const getAllTags = (): string[] => {
  return [...new Set(events.flatMap(event => event.tags))];
};

/**
 * Get all unique categories from events
 */
export const getAllCategories = (): string[] => {
  return [...new Set(events.map(event => event.category).filter(Boolean) as string[])];
};

/**
 * Get attendee count from event
 */
export const getAttendeeCount = (event: Event): number => {
  if (typeof event.attendees === 'number') {
    return event.attendees;
  }
  return event.attendees.length;
};

/**
 * Get attendees array from event (handles both number and array)
 */
export const getAttendeesArray = (event: Event): Attendee[] => {
  if (typeof event.attendees === 'number') {
    return [];
  }
  return event.attendees;
};

/**
 * Format event for list display (Events page)
 */
export const formatEventForList = (event: Event) => {
  return {
    eventId: event.eventId,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    organizers: event.organizers.map(org => ({
      name: org.name,
      avatar: org.avatar,
      id: org.id || ''
    })),
    attendees: getAttendeeCount(event),
    category: event.category || '',
    image: event.image,
    isPastEvent: event.isPastEvent,
    tags: event.tags,
    comments: event.comments || 0,
    connectionsGoing: event.connectionsGoing || [],
    averageRating: event.averageRating,
    totalReviews: event.totalReviews,
    reviews: event.reviews,
    thoughts: event.thoughts
  };
};

/**
 * Format event for detail display
 */
export const formatEventForDetail = (event: Event, isHealerMode: boolean = false) => {
  const attendees = getAttendeesArray(event).map(attendee => ({
    ...attendee,
    name: attendee.isAnonymous && !isHealerMode ? "Anonymous" : attendee.name,
    avatar: attendee.isAnonymous && !isHealerMode ? "" : attendee.avatar,
    location: attendee.isAnonymous && !isHealerMode ? "" : attendee.location
  }));

  return {
    ...event,
    attendees
  };
};

// Export profile images for components that need them
export { elenaProfile, davidProfile, ariaProfile, phoenixProfile };
