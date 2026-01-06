import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Share2, BookOpen, Users, Sparkles, MapPin, Calendar, Plus, User, Heart, Repeat2, Filter, Home, Search, Star, ExternalLink, Link, Copy, Check, X, ChevronDown, Edit3, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPosts, getPostsWithDetails, deletePost, updatePost } from "@/lib/posts";
import { getThoughtsByPostId, getThoughtsByEventId, createEventThought } from "@/lib/thoughts";
import { getAllEvents } from "@/lib/events";
import { supabase } from "@/integrations/supabase/client";
import ChatSidebar from "@/components/ChatSidebar";
import CreateDropdown from "@/components/CreateDropdown";
import CreateShareModal from "@/components/CreateShareModal";
import EditShareModal from "@/components/EditShareModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ThoughtsModal from "@/components/ThoughtsModal";
import ReviewModal from "@/components/ReviewModal";
import ImageModal from "@/components/ImageModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { format } from "date-fns";

// Import centralized data
import { featuredMembers } from "@/data/users";
import { elenaProfile, davidProfile, ariaProfile, phoenixProfile } from "@/data/healers";

// Import images
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";
import spiritualBackground from "@/assets/spiritual-background.jpg";

const Community = () => {
  const [filter, setFilter] = useState("all");
  const [createShareModalOpen, setCreateShareModalOpen] = useState(false);
  const [editShareModalOpen, setEditShareModalOpen] = useState(false);
  const [editingShare, setEditingShare] = useState<any>(null);
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);
  const [followedHealers, setFollowedHealers] = useState<string[]>(['Luna Sage', 'River Flow']);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [resharedPosts, setResharedPosts] = useState<number[]>([]);
  const [sharePopoverOpen, setSharePopoverOpen] = useState<number | null>(null);
  const [connectionPopoverOpen, setConnectionPopoverOpen] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadedThoughts, setLoadedThoughts] = useState<any[]>([]);
  const [isLoadingThoughts, setIsLoadingThoughts] = useState(false);
  const navigate = useNavigate();

  const [posts, setPosts] = useState<any[]>([]);

  const handleEditShare = (post: any, index: number) => {
    setEditingShare({ ...post, index });
    setEditShareModalOpen(true);
  };

  const handleUpdateShare = async (updatedShare: any) => {
    if (editingShare && editingShare.id) {
      // Update in database
      const success = await updatePost(editingShare.id, {
        title: updatedShare.title,
        content: updatedShare.description,
        tags: updatedShare.tags
      });

      if (success) {
        // Update local state
        const updatedPosts = [...posts];
        updatedPosts[editingShare.index] = {
          ...updatedPosts[editingShare.index],
          title: updatedShare.title,
          description: updatedShare.description,
          tags: updatedShare.tags,
          ...(updatedShare.url && { youtubeUrl: updatedShare.url })
        };
        setPosts(updatedPosts);
        toast.success("Share updated successfully!");
      } else {
        toast.error("Failed to update share");
      }
      
      setEditingShare(null);
    }
  };

  const handleDeleteShare = () => {
    if (editingShare) {
      const updatedPosts = posts.filter((_, index) => index !== editingShare.index);
      setPosts(updatedPosts);
      setEditingShare(null);
    }
  };

  const handleDeletePost = async (post: any, index: number) => {
    if (!post.id) {
      toast.error("Cannot delete this post");
      return;
    }

    if (window.confirm("Are you sure you want to delete this post? This will also delete all associated thoughts. This action cannot be undone.")) {
      const success = await deletePost(post.id);
      
      if (success) {
        // Remove from UI
        setPosts(prevPosts => prevPosts.filter((_, i) => i !== index));
        toast.success("Post deleted successfully");
      } else {
        toast.error("Failed to delete post. Please try again.");
      }
    }
  };

  const filteredPosts = filter === "all" ? posts : posts.filter(post => post.type === filter);

  // Get share titles from followed people for search dropdown
  const sharesByFollowedPeople = posts.filter(post => 
    post.type === 'share' && followedHealers.includes(post.author.name)
  );

  const filteredShareTitles = sharesByFollowedPeople
    .filter(share => share.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5); // Limit to 5 results

  // Helper function to convert YouTube URLs to embed format
  const convertToEmbedUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // Already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    const standardMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (standardMatch && standardMatch[1]) {
      return `https://www.youtube.com/embed/${standardMatch[1]}`;
    }
    
    // Return original URL if no match (might be another video platform)
    return url;
  };

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch events and posts from database on mount
  useEffect(() => {
    const fetchDatabaseContent = async () => {
      // Fetch events
      const dbEvents = await getAllEvents();
      
      // Fetch posts (shares)
      const dbPosts = await getPostsWithDetails();
      
      // Get unique user IDs from events and posts
      const eventUserIds = [...new Set(dbEvents.map((e: any) => e.user_id).filter(Boolean))];
      const postUserIds = [...new Set(dbPosts.map((p: any) => p.user_id).filter(Boolean))];
      const allUserIds = [...new Set([...eventUserIds, ...postUserIds])];
      
      // Fetch profiles for all users
      const { data: eventProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, avatar_url, is_healer')
        .in('id', allUserIds);
      
      // Fetch healer profiles for roles
      const { data: healerProfiles } = await (supabase as any)
        .from('healer_profiles')
        .select('user_id, role')
        .in('user_id', allUserIds);
      
      // Create a map of user_id to profile
      const profileMap = new Map();
      (eventProfiles || []).forEach((profile: any) => {
        profileMap.set(profile.id, profile);
      });
      
      // Create a map of user_id to healer role
      const healerRoleMap = new Map();
      (healerProfiles || []).forEach((healerProfile: any) => {
        healerRoleMap.set(healerProfile.user_id, healerProfile.role);
      });
      
      // Fetch enrollment counts for all events
      const eventIds = dbEvents.map((e: any) => e.id);
      const { data: enrollmentCounts } = await (supabase as any)
        .from('enrollments')
        .select('event_id')
        .in('event_id', eventIds)
        .eq('status', 'confirmed');
      
      // Create a map of event_id to enrollment count
      const enrollmentCountMap = new Map();
      (enrollmentCounts || []).forEach((enrollment: any) => {
        const currentCount = enrollmentCountMap.get(enrollment.event_id) || 0;
        enrollmentCountMap.set(enrollment.event_id, currentCount + 1);
      });
      
      // Format events for UI
      const formattedEvents = dbEvents.map((dbEvent: any) => {
        // Get author info from profile
        const profile = profileMap.get(dbEvent.user_id);
        const authorName = profile?.display_name || profile?.first_name || "Event Creator";
        const authorRole = healerRoleMap.get(dbEvent.user_id) || "Event Organizer";
        const avatarUrl = profile?.avatar_url || elenaProfile;
        const enrollmentCount = enrollmentCountMap.get(dbEvent.id) || 0;
        
        return {
          type: 'event',
          id: dbEvent.id,
          eventId: dbEvent.id,
          user_id: dbEvent.user_id,
          author: {
            id: dbEvent.user_id,
            name: authorName,
            avatar: avatarUrl,
            followers: 0,
            role: authorRole,
            isHealer: profile?.is_healer || false
          },
          title: dbEvent.title,
          thought: dbEvent.description,
          description: dbEvent.full_description || dbEvent.description,
          location: [dbEvent.city, dbEvent.country].filter(Boolean).join(', ') || 'Location TBD',
          tags: dbEvent.tags || [],
          intentions: dbEvent.intentions || [],
          attendees: enrollmentCount,
          connectionsGoing: [],
          timeAgo: 'Just now',
          comments: dbEvent.thoughts_count || 0,
          likes: 0,
          shares: 0,
          image: dbEvent.image_url || spiritualBackground,
          dateRange: {
            start: dbEvent.start_date ? format(new Date(dbEvent.start_date), 'd MMMM yyyy') : 'TBD',
            end: dbEvent.end_date ? format(new Date(dbEvent.end_date), 'd MMMM yyyy') : null
          },
          isPastEvent: dbEvent.start_date ? new Date(dbEvent.start_date) < new Date() : false
        };
      });
      
      // Convert database posts to the format expected by the UI
      const formattedDbPosts = dbPosts.map((dbPost) => {
        // Provide default values if author is null
        const profile = profileMap.get(dbPost.user_id);
        const authorName = dbPost.author?.display_name || dbPost.author?.first_name || "Anonymous";
        const authorRole = healerRoleMap.get(dbPost.user_id) || "Member";
        const avatarUrl = dbPost.author?.avatar_url || elenaProfile;
        
        // Calculate time ago
        const createdDate = new Date(dbPost.created_at || '');
        const now = new Date();
        const diffMs = now.getTime() - createdDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeAgo = 'Just now';
        if (diffDays > 0) {
          timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMins > 0) {
          timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        }
        
        return {
          type: 'share',
          id: dbPost.id,
          user_id: dbPost.user_id, // Include user_id for ownership check
          author: { 
            name: authorName, 
            avatar: avatarUrl, 
            followers: 0, 
            role: authorRole,
            isHealer: profile?.is_healer || false
          },
          title: dbPost.title,
          description: dbPost.content,
          tags: dbPost.tags || [],
          timeAgo: timeAgo,
          comments: dbPost.thoughts_count || 0,
          likes: 0,
          shares: 0,
          youtubeUrl: convertToEmbedUrl(dbPost.url),
          postImage: dbPost.image_url,
          postVideo: dbPost.video_url
        };
      });

      // Merge events and shares
      setPosts([...formattedEvents, ...formattedDbPosts]);
    };

    fetchDatabaseContent();
  }, []);

  return (
    <>
        {/* Community Filters - Sticky */}
        <div className="bg-transparent sticky top-[57px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">We glow together</h1>
              
              {/* Centered Filters */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
                <Button
                  variant={filter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filter === "event" ? "default" : "ghost"}
                  size="sm"  
                  onClick={() => setFilter("event")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Events
                </Button>
                <Button
                  variant={filter === "share" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("share")}
                  className="px-3 py-1 rounded-full h-7 text-xs"
                >
                  Shares
                </Button>
              </div>
              
              {/* Empty div for balance */}
              <div></div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-130px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-16 h-full">
            {/* Left Sidebar - Fixed */}
            <div className="lg:col-span-2 sticky top-0 h-[calc(100vh-130px)]">
              <div className="space-y-4">
                {/* People to Follow */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>People to Follow</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    {/* Healers Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Healers
                      </h4>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto">
                        {featuredMembers.slice(0, 4).map((member, index) => (
                          <div key={index} className="flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                               <Avatar 
                                 className="h-8 w-8 cursor-pointer"
                                 onClick={() => navigate(`/healer/${member.name.toLowerCase().replace(/\s+/g, '-')}`)}
                               >
                                 <AvatarImage src={member.avatar} />
                                 <AvatarFallback className="bg-primary/10 text-xs">
                                   {member.name.split(' ').map(n => n[0]).join('')}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <p 
                                   className="font-medium text-sm leading-tight cursor-pointer hover:text-primary transition-colors"
                                   onClick={() => navigate(`/healer/${member.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                 >
                                   {member.name}
                                 </p>
                                 <p className="text-xs text-muted-foreground">{member.role}</p>
                                 <p className="text-xs text-muted-foreground flex items-center">
                                   <MapPin className="h-3 w-3 mr-1" />
                                   {member.location}
                                 </p>
                               </div>
                             </div>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="p-2 h-auto hover:bg-red-50"
                               onClick={() => {
                                 if (followedHealers.includes(member.name)) {
                                   setFollowedHealers(prev => prev.filter(name => name !== member.name));
                                   toast.success(`Unfollowed ${member.name}`);
                                 } else {
                                   setFollowedHealers(prev => [...prev, member.name]);
                                   toast.success(`Following ${member.name}`);
                                 }
                               }}
                             >
                               <Heart className={`h-4 w-4 ${followedHealers.includes(member.name) ? 'text-red-500 fill-red-500' : 'text-red-500'}`} />
                             </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participants Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Participants
                      </h4>
                      <div className="space-y-3 max-h-[150px] overflow-y-auto">
                        {featuredMembers.slice(4, 8).map((member, index) => (
                          <div key={index} className="flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                               <Avatar 
                                 className="h-8 w-8 cursor-pointer"
                                 onClick={() => navigate(`/healer/${member.name.toLowerCase().replace(/\s+/g, '-')}`)}
                               >
                                 <AvatarImage src={member.avatar} />
                                 <AvatarFallback className="bg-primary/10 text-xs">
                                   {member.name.split(' ').map(n => n[0]).join('')}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <p 
                                   className="font-medium text-sm leading-tight cursor-pointer hover:text-primary transition-colors"
                                   onClick={() => navigate(`/healer/${member.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                 >
                                   {member.name}
                                 </p>
                                 <p className="text-xs text-muted-foreground flex items-center">
                                   <MapPin className="h-3 w-3 mr-1" />
                                   {member.location}
                                 </p>
                               </div>
                             </div>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="p-2 h-auto hover:bg-red-50"
                               onClick={() => {
                                 if (followedHealers.includes(member.name)) {
                                   setFollowedHealers(prev => prev.filter(name => name !== member.name));
                                   toast.success(`Unfollowed ${member.name}`);
                                 } else {
                                   setFollowedHealers(prev => [...prev, member.name]);
                                   toast.success(`Following ${member.name}`);
                                 }
                               }}
                             >
                               <Heart className={`h-4 w-4 ${followedHealers.includes(member.name) ? 'text-red-500 fill-red-500' : 'text-red-500'}`} />
                             </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate('/people')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Look for More
                    </Button>
                  </CardContent>
                </Card>

                {/* Talk Sidebar - Clickable */}
                <Card 
                  className="bg-card/90 backdrop-blur-sm border border-border cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => navigate('/chat')}
                >
                  <CardHeader className="pb-1">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span>Talk</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-[400px] overflow-hidden">
                    <div className="space-y-2">
                      {[
                        {
                          name: "Elena Moonchild",
                          lastMessage: "Looking forward to the sound healing session tonight! 🌙",
                          timestamp: "2 min ago",
                          avatar: elenaProfile,
                          isGroup: false
                        },
                        {
                          name: "Sacred Circle",
                          lastMessage: "David: The energy work was incredible today",
                          timestamp: "5 min ago",
                          avatar: davidProfile,
                          isGroup: true
                        },
                        {
                          name: "Aria Starseed",
                          lastMessage: "Thank you for joining the crystal workshop! ✨",
                          timestamp: "1 hour ago",
                          avatar: ariaProfile,
                          isGroup: false
                        },
                        {
                          name: "Phoenix Rising",
                          lastMessage: "Movement meditation tomorrow at sunrise?",
                          timestamp: "2 hours ago",
                          avatar: phoenixProfile,
                          isGroup: false
                        },
                        {
                          name: "Healing Hearts",
                          lastMessage: "Luna: Beautiful sharing today everyone 💚",
                          timestamp: "3 hours ago",
                          avatar: elenaProfile,
                          isGroup: true
                        }
                      ].map((chat, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={chat.avatar} />
                              <AvatarFallback className="bg-primary/10 text-xs">
                                {chat.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {chat.isGroup && (
                              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                                <Users className="h-2 w-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight truncate">
                              {chat.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {chat.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                     </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => navigate('/chat')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      More Talks
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4 space-y-4">
              {filteredPosts.map((post, index) => (
                <Card key={index} className="bg-card/90 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-200 relative">
                  
                  <CardContent className="p-0">
                    {/* Event Image Header for Events */}
                    {post.type === 'event' && post.image && (
                      <div className="p-4">
                         <div className="flex space-x-3">
                           {/* Event Image - 4:3 Aspect Ratio - Clickable */}
                           <div 
                             className="w-48 h-36 flex-shrink-0 cursor-pointer"
                             onClick={() => navigate(`/event/${post.eventId}`)}
                           >
                             <img 
                               src={post.image} 
                               alt={post.title}
                               className="w-full h-full object-cover rounded-lg"
                             />
                           </div>
                           
                           {/* Event Details */}
                           <div className="flex-1 min-w-0">
                             <h2 
                               className="text-lg font-bold text-foreground mb-2 leading-tight cursor-pointer hover:text-primary transition-colors"
                               onClick={() => navigate(`/event/${post.eventId}`)}
                             >
                               {post.title}
                             </h2>
                             
                             <div className="space-y-1 text-sm">
                               <div className="mb-2">
                                 <span className="text-2xl font-bold text-primary">
                                   {post.dateRange?.end ? 
                                     `${post.dateRange.start} - ${post.dateRange.end}` : 
                                     post.dateRange?.start
                                   }
                                 </span>
                               </div>
                               
                               <div className="flex items-center space-x-2">
                                  <Avatar 
                                    className="h-6 w-6 cursor-pointer"
                                    onClick={() => navigate(`/healer/${post.user_id}`)}
                                  >
                                   <AvatarImage src={post.author.avatar} />
                                   <AvatarFallback className="bg-primary/10 text-xs">
                                     {post.author.name.split(' ').map(n => n[0]).join('')}
                                   </AvatarFallback>
                                 </Avatar>
                                 <div>
                                   <div className="flex items-center space-x-2">
                                      <span 
                                        className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => navigate(`/healer/${post.user_id}`)}
                                      >
                                        {post.author.name}
                                      </span>
                                     <span className="text-xs text-muted-foreground">•</span>
                                     <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent">
                                       Follow
                                     </Button>
                                   </div>
                                   {post.author.isHealer && (
                                     <p className="text-xs text-muted-foreground">
                                       {post.author.role}
                                     </p>
                                   )}
                                 </div>
                               </div>
                               
                               <div className="flex items-center space-x-2 text-muted-foreground">
                                 <MapPin className="h-4 w-4" />
                                 <span>{post.location}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>
                    )}

                    {/* Post Title Header for Posts from Database */}
                    {post.type === 'post' && (
                      <div className="p-3 pb-2">
                        <h2 className="text-lg font-bold text-foreground mb-1 leading-tight">
                          {post.title}
                        </h2>
                      </div>
                    )}

                    {/* Share Title Header for Shares */}
                    {post.type === 'share' && (
                      <div className="p-3 pb-2 relative">
                        <h2 className="text-lg font-bold text-foreground mb-1 leading-tight pr-20">
                          {post.title}
                        </h2>
                        {/* Only show edit and delete buttons if the post belongs to the current user */}
                        {post.user_id && currentUserId && post.user_id === currentUserId && (
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditShare(post, index)}
                              className="h-8 w-8 p-0 hover:bg-muted/70"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post, index)}
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="px-3">
                      {/* Tags first for events */}
                      {post.type === 'event' && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Intensions below tags for events */}
                      {post.type === 'event' && post.intentions && post.intentions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.intentions.map((intention, intentionIndex) => (
                            <Badge key={intentionIndex} variant="default" className="text-xs bg-purple-500 hover:bg-purple-600 transition-colors">
                              {intention}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Post content from database */}
                      {post.type === 'post' && (
                        <div className="mb-3">
                          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                            {post.thought}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags && post.tags.map((tag: string, tagIndex: number) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Share content: description above tags */}
                      {post.type === 'share' && (
                        <div className="mb-3">
                          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                            {post.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Event content */}
                      {post.type === 'event' && (
                        <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                          {post.thought}
                        </p>
                      )}

                      {/* Event Details */}
                      {post.type === 'event' && (
                        <div className="mb-3">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{post.attendees} attending</span>
                            </div>
                            {post.connectionsGoing && post.connectionsGoing.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {post.connectionsGoing.length <= 2 ? (
                                  <span className="text-primary font-medium">
                                    {post.connectionsGoing.join(", ")} going
                                  </span>
                                ) : (
                                  <Popover open={connectionPopoverOpen === index} onOpenChange={(open) => setConnectionPopoverOpen(open ? index : null)}>
                                    <PopoverTrigger asChild>
                                      <button className="text-primary font-medium hover:underline cursor-pointer">
                                        {post.connectionsGoing.length} connections going
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-3">
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">Connections Attending</h4>
                                        {post.connectionsGoing.map((connection: string, idx: number) => (
                                          <div key={idx} className="flex items-center space-x-2 p-1 rounded hover:bg-muted cursor-pointer">
                                             <Avatar 
                                               className="h-6 w-6 cursor-pointer"
                                               onClick={() => navigate(`/healer/${connection.toLowerCase().replace(/\s+/g, '-')}`)}
                                             >
                                              <AvatarImage src={idx % 2 === 0 ? elenaProfile : davidProfile} />
                                              <AvatarFallback className="text-xs">
                                                {connection.split(' ').map((n: string) => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{connection}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Reviews for past events */}
                          {post.isPastEvent && post.averageRating && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.round(post.averageRating) 
                                        ? "text-yellow-400 fill-current" 
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{post.averageRating.toFixed(1)}</span>
                              <button
                                onClick={() => {
                                  setSelectedPost(post);
                                  setReviewModalOpen(true);
                                }}
                                className="text-sm text-primary hover:underline"
                              >
                                ({post.totalReviews} reviews)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Images for Shares */}
                      {post.type === 'share' && post.postImage && (
                        <div className="mb-3">
                          <div className="relative rounded-lg overflow-hidden bg-muted cursor-pointer"
                               onClick={() => {
                                 setSelectedImage({
                                   src: post.postImage,
                                   alt: post.title,
                                   title: post.title
                                 });
                                 setImageModalOpen(true);
                               }}>
                            <img
                              src={post.postImage}
                              alt={post.title}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Videos for Shares */}
                      {post.type === 'share' && post.postVideo && (
                        <div className="mb-3">
                          <div className="relative rounded-lg overflow-hidden bg-muted">
                            <video
                              src={post.postVideo}
                              controls
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}

                      {/* YouTube Video for Shares */}
                      {post.type === 'share' && post.youtubeUrl && (
                        <div className="mb-3">
                          <div className="relative h-64 rounded-lg overflow-hidden bg-muted">
                            <iframe
                              src={post.youtubeUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}

                      {/* Author Info for Shares - Below video */}
                      {post.type === 'share' && (
                        <div className="py-2 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                               <Avatar 
                                 className="h-6 w-6 cursor-pointer"
                                 onClick={() => navigate(`/healer/${post.user_id}`)}
                               >
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback className="bg-primary/10 text-xs">
                                  {post.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                   <span 
                                     className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                     onClick={() => navigate(`/healer/${post.user_id}`)}
                                   >
                                     {post.author.name}
                                   </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent">
                                    Follow
                                  </Button>
                                </div>
                                {post.author.isHealer && (
                                  <p className="text-xs text-muted-foreground">
                                    {post.author.role}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar - Updated labels */}
                    <div className="px-3 py-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={async () => {
                            setSelectedPost(post);
                            
                            // Fetch thoughts from database if post has an ID
                            const postId = post.id || post.eventId;
                            console.log("Opening thoughts for postId:", postId);
                            
                            if (postId) {
                              setIsLoadingThoughts(true);
                              // Use appropriate function based on post type
                              const dbThoughts = post.type === 'event' 
                                ? await getThoughtsByEventId(postId)
                                : await getThoughtsByPostId(postId);
                              console.log("Loaded thoughts:", dbThoughts);
                              setLoadedThoughts(dbThoughts);
                              setIsLoadingThoughts(false);
                            } else {
                              // Use mocked thoughts for posts without database ID
                              console.log("Using mocked thoughts:", post.thoughts);
                              setLoadedThoughts(post.thoughts || []);
                            }
                            
                            // Open modal after thoughts are loaded
                            setThoughtsModalOpen(true);
                          }}
                          className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments} Thoughts</span>
                        </button>
                        <button 
                          className={`flex items-center space-x-2 text-sm transition-colors ${
                            resharedPosts.includes(index) 
                              ? 'text-primary font-bold' 
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                          onClick={() => {
                            if (resharedPosts.includes(index)) {
                              setResharedPosts(prev => prev.filter(id => id !== index));
                              toast.success("Reshare removed");
                            } else {
                              setResharedPosts(prev => [...prev, index]);
                              toast.success("Post reshared!");
                            }
                          }}
                        >
                          <Repeat2 className="h-4 w-4" />
                          <span>{resharedPosts.includes(index) ? 'Reshared' : 'Reshare'}</span>
                        </button>
                        
                        <button 
                          className={`flex items-center space-x-2 text-sm transition-colors ${
                            savedPosts.includes(index) 
                              ? 'text-primary font-bold' 
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                          onClick={() => {
                            if (savedPosts.includes(index)) {
                              setSavedPosts(prev => prev.filter(id => id !== index));
                              toast.success("Removed from saved");
                            } else {
                              setSavedPosts(prev => [...prev, index]);
                              toast.success("Saved to your private page!");
                            }
                          }}
                        >
                          <BookOpen className={`h-4 w-4 ${savedPosts.includes(index) ? 'fill-current' : ''}`} />
                          <span>Save</span>
                        </button>
                        
                        <Popover open={sharePopoverOpen === index} onOpenChange={(open) => setSharePopoverOpen(open ? index : null)}>
                          <PopoverTrigger asChild>
                            <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2">
                            <div className="space-y-2">
                              <button 
                                className="flex items-center space-x-2 w-full p-2 text-sm rounded-md hover:bg-muted transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/post/${index + 1}`);
                                  setLinkCopied(true);
                                  toast.success("Link copied to clipboard!");
                                  setTimeout(() => setLinkCopied(false), 2000);
                                  setSharePopoverOpen(null);
                                }}
                              >
                                {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                <span>Copy Link</span>
                              </button>
                              <button className="flex items-center space-x-2 w-full p-2 text-sm rounded-md hover:bg-muted transition-colors">
                                <ExternalLink className="h-4 w-4" />
                                <span>Share on Twitter</span>
                              </button>
                              <button className="flex items-center space-x-2 w-full p-2 text-sm rounded-md hover:bg-muted transition-colors">
                                <ExternalLink className="h-4 w-4" />
                                <span>Share on Facebook</span>
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Sidebar - Fixed */}
            <div className="lg:col-span-2 sticky top-0 h-[calc(100vh-130px)] overflow-hidden">
              <div className="space-y-4">
                {/* Featured Events - Expanded */}
                <Card className="bg-card/90 backdrop-blur-sm border border-border h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                      <Star className="h-5 w-5 text-primary" />
                      <span>Featured Events</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0 h-[calc(100%-80px)] overflow-y-auto">
                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/event/1')}
                    >
                      <img 
                        src={soundHealingEvent} 
                        alt="Full Moon Sound Healing"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/elena-moonchild`)}
                             >
                              <AvatarImage src={elenaProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">EM</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Elena Moonchild</p>
                              <p className="text-white/80 text-xs">Sound Healer</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Full Moon Sound Healing Ceremony
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">March 15</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Sedona, AZ</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Experience healing power of crystal bowls and gongs under the full moon energy
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/2')}
                    >
                      <img 
                        src={crystalWorkshopEvent} 
                        alt="Crystal Healing Workshop"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/aria-starseed`)}
                             >
                              <AvatarImage src={ariaProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">AS</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Aria Starseed</p>
                              <p className="text-white/80 text-xs">Crystal Healer</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Crystal Healing Workshop
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Apr 2-4</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Asheville, NC</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Learn to select, cleanse, and work with crystals for healing and spiritual growth
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/3')}
                    >
                      <img 
                        src={spiritualBackground} 
                        alt="Meditation Circle"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/phoenix-rising`)}
                             >
                              <AvatarImage src={phoenixProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">PR</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Phoenix Rising</p>
                              <p className="text-white/80 text-xs">Movement Therapist</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Sacred Movement Circle
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Mar 20</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Santa Fe, NM</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Express your soul through sacred movement and ecstatic dance
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/4')}
                    >
                      <img 
                        src={soundHealingEvent} 
                        alt="Breathwork Journey"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/david-lightwalker`)}
                             >
                              <AvatarImage src={davidProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">DL</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">David Lightwalker</p>
                              <p className="text-white/80 text-xs">Breathwork Facilitator</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Transformational Breathwork Journey
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Mar 25</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Boulder, CO</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Release deep trauma and connect with your higher self through breath
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/5')}
                    >
                      <img 
                        src={crystalWorkshopEvent} 
                        alt="Cacao Ceremony"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/aria-starseed`)}
                             >
                              <AvatarImage src={ariaProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">SR</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Sacred Rose</p>
                              <p className="text-white/80 text-xs">Cacao Ceremonialist</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Heart Opening Cacao Ceremony
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Apr 1</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Tulum, Mexico</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Open your heart with sacred cacao and ancestral wisdom
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/6')}
                    >
                      <img 
                        src={spiritualBackground} 
                        alt="Yoga Retreat"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/phoenix-rising`)}
                             >
                              <AvatarImage src={phoenixProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">DL</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Divine Light</p>
                              <p className="text-white/80 text-xs">Yoga Teacher</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Sacred Yoga & Meditation Retreat
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Apr 8-10</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Big Sur, CA</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Deepen your practice with daily yoga, meditation and nature connection
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-lg transition-all"
                      onClick={() => navigate('/events/7')}
                    >
                      <img 
                        src={soundHealingEvent} 
                        alt="Shamanic Journey"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center space-x-2 mb-2">
                             <Avatar 
                               className="h-8 w-8 border-2 border-white cursor-pointer"
                               onClick={() => navigate(`/healer/elena-moonchild`)}
                             >
                              <AvatarImage src={elenaProfile} />
                              <AvatarFallback className="text-xs bg-primary text-white">FW</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">Forest Walker</p>
                              <p className="text-white/80 text-xs">Shaman</p>
                            </div>
                          </div>
                          <h3 className="text-white text-base font-bold leading-tight mb-1">
                            Shamanic Healing Journey
                          </h3>
                          <div className="flex items-center justify-between text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm font-medium">Apr 15</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">Mount Shasta, CA</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs mt-2 line-clamp-2">
                            Connect with spirit guides and receive healing through ancient shamanic practices
                          </p>
                        </div>
                      </div>
                    </div>
                    
                     <Button 
                       variant="outline" 
                       size="lg" 
                       className="w-full"
                       onClick={() => navigate('/events')}
                     >
                       <Calendar className="h-4 w-4 mr-2" />
                       More Events
                     </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

      {/* Create Share Modal */}
      <CreateShareModal 
        open={createShareModalOpen} 
        onOpenChange={setCreateShareModalOpen} 
      />

      {/* Edit Share Modal */}
      <EditShareModal 
        open={editShareModalOpen} 
        onOpenChange={setEditShareModalOpen}
        share={editingShare}
        onUpdate={handleUpdateShare}
        onDelete={handleDeleteShare}
      />

      {/* Thoughts Modal */}
      {selectedPost && (
        <ThoughtsModal
          open={thoughtsModalOpen}
          onOpenChange={setThoughtsModalOpen}
          postId={selectedPost.id || selectedPost.eventId || ''}
          postTitle={selectedPost.title}
          thoughts={loadedThoughts}
          isEvent={selectedPost.type === 'event'}
          onThoughtAdded={async () => {
            // Refresh thoughts from database after adding
            const postId = selectedPost.id || selectedPost.eventId;
            if (postId) {
              // Use appropriate function based on post type
              const dbThoughts = selectedPost.type === 'event'
                ? await getThoughtsByEventId(postId)
                : await getThoughtsByPostId(postId);
              setLoadedThoughts(dbThoughts);
              
              // Update the comment count on the post card
              setPosts(prevPosts => prevPosts.map(post => {
                if ((post.id && post.id === postId) || (post.eventId && post.eventId === postId)) {
                  return { ...post, comments: dbThoughts.length };
                }
                return post;
              }));
            }
            toast.success("Thought added!");
          }}
        />
      )}

      {/* Review Modal */}
      {selectedPost && selectedPost.isPastEvent && (
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          eventTitle={selectedPost.title}
          reviews={selectedPost.reviews || []}
          averageRating={selectedPost.averageRating || 0}
          totalReviews={selectedPost.totalReviews || 0}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          imageSrc={selectedImage.src}
          imageAlt={selectedImage.alt}
          title={selectedImage.title}
        />
      )}
    </>
  );
};

export default Community;
