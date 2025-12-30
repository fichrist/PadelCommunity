// Centralized users data - ready to be replaced with Supabase database connection
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

// ============= TYPE DEFINITIONS =============

export interface User {
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
  isOnline: boolean;
  price: string;
  tags: string[];
  verified: boolean;
  isHealer: boolean;
  username?: string;
}

// ============= MOCK DATA =============

export const users: User[] = [
  {
    id: "maya-spirit",
    name: "Maya Spirit",
    avatar: ariaProfile,
    role: "Spiritual Seeker & Artist",
    location: "Portland, OR",
    followers: 234,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "Artist and spiritual seeker exploring consciousness through creative expression and meditation.",
    isOnline: true,
    price: "",
    tags: ["Art", "Spirituality", "Meditation"],
    verified: false,
    isHealer: false
  },
  {
    id: "ocean-dreams",
    name: "Ocean Dreams",
    avatar: phoenixProfile,
    role: "Student of Life",
    location: "San Diego, CA",
    followers: 156,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "On a journey of self-discovery, learning from the ocean's wisdom and connecting with like-minded souls.",
    isOnline: false,
    price: "",
    tags: ["Nature", "Self-Discovery", "Ocean"],
    verified: false,
    isHealer: false
  },
  {
    id: "forest-walker",
    name: "Forest Walker",
    avatar: elenaProfile,
    role: "Nature Enthusiast",
    location: "Vancouver, BC",
    followers: 89,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "Finding peace and wisdom in the forest, sharing my journey of connection with Mother Earth.",
    isOnline: true,
    price: "",
    tags: ["Nature", "Forest", "Earth Connection"],
    verified: false,
    isHealer: false
  },
  {
    id: "star-dancer",
    name: "Star Dancer",
    avatar: davidProfile,
    role: "Cosmic Explorer",
    location: "Santa Fe, NM",
    followers: 312,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "Dancing with the stars and exploring the mysteries of the universe through meditation and stargazing.",
    isOnline: true,
    price: "",
    tags: ["Astronomy", "Meditation", "Cosmic"],
    verified: false,
    isHealer: false
  },
  {
    id: "luna-harmony",
    name: "Luna Harmony",
    avatar: elenaProfile,
    role: "Soul Seeker",
    location: "Portland, OR",
    followers: 89,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "",
    isOnline: false,
    price: "",
    tags: [],
    verified: false,
    isHealer: false
  },
  {
    id: "river-stone",
    name: "River Stone",
    avatar: davidProfile,
    role: "Spiritual Explorer",
    location: "Austin, TX", 
    followers: 156,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "",
    isOnline: true,
    price: "",
    tags: [],
    verified: false,
    isHealer: false
  },
  {
    id: "sky-walker",
    name: "Sky Walker",
    avatar: ariaProfile,
    role: "Conscious Soul",
    location: "Denver, CO",
    followers: 234,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "",
    isOnline: false,
    price: "",
    tags: [],
    verified: false,
    isHealer: false
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    avatar: phoenixProfile,
    role: "Mindful Being",
    location: "Miami, FL",
    followers: 78,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "",
    isOnline: true,
    price: "",
    tags: [],
    verified: false,
    isHealer: false
  },
  {
    id: "mountain-spirit",
    name: "Mountain Spirit",
    avatar: elenaProfile,
    role: "Nature Lover",
    location: "Salt Lake City, UT",
    followers: 123,
    rating: 0,
    reviews: 0,
    specialties: [],
    bio: "",
    isOnline: false,
    price: "",
    tags: [],
    verified: false,
    isHealer: false
  }
];

// Additional featured members from Community page
export const featuredMembers: User[] = [
  { id: "luna-sage-2", name: "Luna Sage", role: "Meditation Teacher", followers: 1200, avatar: elenaProfile, location: "Sedona, AZ", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "river-flow-2", name: "River Flow", role: "Energy Healer", followers: 890, avatar: davidProfile, location: "Asheville, NC", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "star-dreamer", name: "Star Dreamer", role: "Astrologer", followers: 756, avatar: ariaProfile, location: "Boulder, CO", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "ocean-mystic", name: "Ocean Mystic", role: "Reiki Master", followers: 534, avatar: phoenixProfile, location: "Big Sur, CA", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "forest-walker-2", name: "Forest Walker", role: "Shaman", followers: 423, avatar: elenaProfile, location: "Tulum, Mexico", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "crystal-dawn", name: "Crystal Dawn", role: "Crystal Therapist", followers: 398, avatar: davidProfile, location: "Mount Shasta, CA", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "peaceful-mind", name: "Peaceful Mind", role: "Mindfulness Coach", followers: 367, avatar: ariaProfile, location: "Byron Bay, AU", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "sacred-rose", name: "Sacred Rose", role: "Breathwork Facilitator", followers: 892, avatar: phoenixProfile, location: "Costa Rica", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "divine-light", name: "Divine Light", role: "Chakra Healer", followers: 678, avatar: elenaProfile, location: "Glastonbury, UK", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "mystic-moon", name: "Mystic Moon", role: "Tarot Reader", followers: 543, avatar: davidProfile, location: "New Orleans, LA", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "earth-angel", name: "Earth Angel", role: "Herbalist", followers: 467, avatar: ariaProfile, location: "Oregon Coast", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "soul-fire", name: "Soul Fire", role: "Kundalini Teacher", followers: 834, avatar: phoenixProfile, location: "Rishikesh, India", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "rainbow-spirit", name: "Rainbow Spirit", role: "Art Therapist", followers: 389, avatar: elenaProfile, location: "Santa Fe, NM", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "golden-dawn", name: "Golden Dawn", role: "Life Coach", followers: 612, avatar: davidProfile, location: "Maui, HI", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "cosmic-heart", name: "Cosmic Heart", role: "Sound Healer", followers: 445, avatar: ariaProfile, location: "Ibiza, Spain", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "wild-moon", name: "Wild Moon", role: "Nature Guide", followers: 567, avatar: phoenixProfile, location: "Banff, Canada", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "healing-waters", name: "Healing Waters", role: "Hydrotherapist", followers: 378, avatar: elenaProfile, location: "Blue Mountains, AU", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false },
  { id: "ancient-wisdom", name: "Ancient Wisdom", role: "Vedic Teacher", followers: 723, avatar: davidProfile, location: "Vrindavan, India", rating: 0, reviews: 0, specialties: [], bio: "", isOnline: false, price: "", tags: [], verified: false, isHealer: false }
];

// Chat users
export interface ChatUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  online: boolean;
}

export const chatUsers: ChatUser[] = [
  {
    id: 1,
    name: "Elena Moonchild",
    username: "@elena_moon",
    avatar: elenaProfile,
    online: true
  },
  {
    id: 2,
    name: "David Healer",
    username: "@david_heals",
    avatar: davidProfile,
    online: false
  },
  {
    id: 3,
    name: "Aria Starseed",
    username: "@aria_star",
    avatar: ariaProfile,
    online: true
  },
  {
    id: 4,
    name: "Luna Sage",
    username: "@luna_wisdom",
    avatar: elenaProfile,
    online: true
  },
  {
    id: 5,
    name: "River Flow",
    username: "@river_healing",
    avatar: davidProfile,
    online: false
  }
];

// ============= HELPER FUNCTIONS =============

/**
 * Get all users
 */
export const getAllUsers = (): User[] => {
  return users;
};

/**
 * Get user by ID
 */
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

/**
 * Get user by name
 */
export const getUserByName = (name: string): User | undefined => {
  return users.find(user => user.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get users by location
 */
export const getUsersByLocation = (location: string): User[] => {
  return users.filter(user => 
    user.location.toLowerCase().includes(location.toLowerCase())
  );
};

/**
 * Get online users
 */
export const getOnlineUsers = (): User[] => {
  return users.filter(user => user.isOnline);
};

/**
 * Get all featured members
 */
export const getAllFeaturedMembers = (): User[] => {
  return featuredMembers;
};

/**
 * Get chat user by ID
 */
export const getChatUserById = (id: number): ChatUser | undefined => {
  return chatUsers.find(user => user.id === id);
};

/**
 * Get all chat users
 */
export const getAllChatUsers = (): ChatUser[] => {
  return chatUsers;
};

// Export profile images for components that need them
export { elenaProfile, davidProfile, ariaProfile, phoenixProfile };
