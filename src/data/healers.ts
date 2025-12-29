// Centralized healers data - ready to be replaced with Supabase database connection
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

// ============= TYPE DEFINITIONS =============

export interface Healer {
  id?: string;
  name: string;
  avatar: string;
  role: string;
  location: string;
  followers: number;
  rating: number;
  reviews: number;
  specialties: string[];
  bio: string;
  fullBio?: string;
  isOnline: boolean;
  price: string;
  tags: string[];
  verified: boolean;
  isHealer: boolean;
  contact?: {
    email?: string;
    website?: string;
    social?: {
      instagram?: string;
      youtube?: string;
      facebook?: string;
    };
  };
  certifications?: string[];
  experience?: string;
  languages?: string[];
}

// ============= MOCK DATA =============

export const healers: Healer[] = [
  {
    id: "elena-moonchild",
    name: "Elena Moonchild",
    avatar: elenaProfile,
    role: "Sound Healer & Reiki Master",
    location: "Sedona, AZ",
    followers: 1234,
    rating: 4.9,
    reviews: 89,
    specialties: ["Sound Healing", "Reiki", "Chakra Balancing"],
    bio: "Certified sound healer with 10+ years of experience in crystal bowl therapy and energy work.",
    fullBio: "Elena Moonchild is a certified sound healer and energy worker with over 8 years of experience in holistic healing practices. She discovered her calling during a spiritual journey through Tibet, where she studied with traditional healers and learned the ancient art of sound therapy. Elena specializes in crystal singing bowl therapy, Tibetan gong healing, and sacred chanting. She has facilitated over 200 healing sessions and workshops, helping individuals release trauma, reduce stress, and reconnect with their inner wisdom. Her approach combines traditional healing methods with modern understanding of sound frequencies and their effects on the human body and energy field.",
    isOnline: true,
    price: "$120/session",
    tags: ["Sound Healing", "Energy Work", "Crystal Therapy"],
    verified: true,
    isHealer: true,
    contact: {
      email: "elena@sacredpaths.com",
      website: "https://elenamoonchild.com",
      social: {
        instagram: "@elena_moonchild",
        youtube: "@elenamoonhealer"
      }
    },
    certifications: ["Certified Sound Healer", "Reiki Master", "Crystal Therapy Practitioner"],
    experience: "10+ years",
    languages: ["English", "Spanish"]
  },
  {
    id: "david-lightwalker",
    name: "David Lightwalker",
    avatar: davidProfile,
    role: "Sacred Geometry Teacher & Shaman",
    location: "Boulder, CO",
    followers: 892,
    rating: 4.8,
    reviews: 67,
    specialties: ["Sacred Geometry", "Shamanic Healing", "Plant Medicine"],
    bio: "Traditional shamanic practitioner combining ancient wisdom with sacred geometric principles.",
    isOnline: false,
    price: "$150/session",
    tags: ["Sacred Geometry", "Shamanic Healing", "Ancient Wisdom"],
    verified: true,
    isHealer: true,
    certifications: ["Shamanic Practitioner", "Sacred Geometry Teacher"],
    experience: "15+ years",
    languages: ["English"]
  },
  {
    id: "aria-starseed",
    name: "Aria Starseed",
    avatar: ariaProfile,
    role: "Crystal Healer & Astrologer",
    location: "Asheville, NC",
    followers: 756,
    rating: 4.7,
    reviews: 124,
    specialties: ["Crystal Healing", "Astrology", "Tarot Reading"],
    bio: "Intuitive crystal healer and astrologer helping souls find their path through celestial guidance.",
    fullBio: "Aria Starseed has dedicated the last 10 years to mastering the ancient art of crystal healing and energy work. After experiencing a profound spiritual awakening, she left her corporate career to pursue her passion for healing. Aria is certified in multiple modalities including Reiki, crystal therapy, and chakra balancing. She has traveled extensively to source rare healing crystals and has built a reputation for her intuitive approach to crystal selection and placement. Her workshops have transformed hundreds of lives, teaching people how to harness the power of crystals for healing, protection, and spiritual growth.",
    isOnline: true,
    price: "$90/session",
    tags: ["Crystal Healing", "Astrology", "Intuitive Reading"],
    verified: true,
    isHealer: true,
    contact: {
      email: "aria@sacredpaths.com",
      website: "https://ariastarseed.com",
      social: {
        instagram: "@aria_starseed"
      }
    },
    certifications: ["Crystal Healer", "Reiki Master", "Certified Astrologer"],
    experience: "10+ years",
    languages: ["English", "French"]
  },
  {
    id: "phoenix-rising",
    name: "Phoenix Rising",
    avatar: phoenixProfile,
    role: "Movement Therapist & Life Coach",
    location: "Big Sur, CA",
    followers: 1089,
    rating: 5.0,
    reviews: 45,
    specialties: ["Movement Therapy", "Life Coaching", "Breathwork"],
    bio: "Holistic life coach specializing in transformational movement and conscious breathing practices.",
    isOnline: true,
    price: "$100/session",
    tags: ["Movement Therapy", "Life Coaching", "Breathwork"],
    verified: true,
    isHealer: true,
    certifications: ["Certified Life Coach", "Movement Therapist", "Breathwork Facilitator"],
    experience: "8+ years",
    languages: ["English"]
  },
  {
    id: "luna-sage",
    name: "Luna Sage",
    avatar: elenaProfile,
    role: "Meditation Teacher & Mindfulness Coach",
    location: "Mount Shasta, CA",
    followers: 2156,
    rating: 4.9,
    reviews: 203,
    specialties: ["Meditation", "Mindfulness", "Spiritual Guidance"],
    bio: "Senior meditation teacher with 15+ years helping others find inner peace and clarity.",
    isOnline: false,
    price: "$80/session",
    tags: ["Meditation", "Mindfulness", "Inner Peace"],
    verified: true,
    isHealer: true,
    certifications: ["Certified Meditation Teacher", "Mindfulness Coach"],
    experience: "15+ years",
    languages: ["English", "Sanskrit"]
  },
  {
    id: "river-flow",
    name: "River Flow",
    avatar: davidProfile,
    role: "Energy Healer & Theta Practitioner",
    location: "Tulum, Mexico",
    followers: 634,
    rating: 4.6,
    reviews: 78,
    specialties: ["Energy Healing", "Theta Healing", "Emotional Release"],
    bio: "Certified energy healer specializing in deep emotional healing and theta brainwave therapy.",
    isOnline: true,
    price: "$110/session",
    tags: ["Energy Healing", "Theta Healing", "Emotional Healing"],
    verified: false,
    isHealer: true,
    certifications: ["Theta Healing Practitioner", "Energy Healer"],
    experience: "7+ years",
    languages: ["English", "Spanish"]
  }
];

// ============= HELPER FUNCTIONS =============

/**
 * Get all healers
 */
export const getAllHealers = (): Healer[] => {
  return healers;
};

/**
 * Get healer by ID
 */
export const getHealerById = (id: string): Healer | undefined => {
  return healers.find(healer => healer.id === id);
};

/**
 * Get healer by name
 */
export const getHealerByName = (name: string): Healer | undefined => {
  return healers.find(healer => healer.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get healers by location
 */
export const getHealersByLocation = (location: string): Healer[] => {
  return healers.filter(healer => 
    healer.location.toLowerCase().includes(location.toLowerCase())
  );
};

/**
 * Get healers by specialty
 */
export const getHealersBySpecialty = (specialty: string): Healer[] => {
  return healers.filter(healer => 
    healer.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );
};

/**
 * Get healers by tag
 */
export const getHealersByTag = (tag: string): Healer[] => {
  return healers.filter(healer => 
    healer.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
};

/**
 * Get online healers
 */
export const getOnlineHealers = (): Healer[] => {
  return healers.filter(healer => healer.isOnline);
};

/**
 * Get verified healers
 */
export const getVerifiedHealers = (): Healer[] => {
  return healers.filter(healer => healer.verified);
};

/**
 * Get all unique tags from healers
 */
export const getAllHealerTags = (): string[] => {
  return [...new Set(healers.flatMap(healer => healer.tags))];
};

/**
 * Get all unique specialties from healers
 */
export const getAllSpecialties = (): string[] => {
  return [...new Set(healers.flatMap(healer => healer.specialties))];
};

/**
 * Sort healers by rating
 */
export const sortHealersByRating = (ascending: boolean = false): Healer[] => {
  return [...healers].sort((a, b) => 
    ascending ? a.rating - b.rating : b.rating - a.rating
  );
};

/**
 * Sort healers by followers
 */
export const sortHealersByFollowers = (ascending: boolean = false): Healer[] => {
  return [...healers].sort((a, b) => 
    ascending ? a.followers - b.followers : b.followers - a.followers
  );
};

// Export profile images for components that need them
export { elenaProfile, davidProfile, ariaProfile, phoenixProfile };
