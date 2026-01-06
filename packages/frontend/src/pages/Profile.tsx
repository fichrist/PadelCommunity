import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CommunityEventCard from "@/components/CommunityEventCard";
import CommunityShareCard from "@/components/CommunityShareCard";
import ThoughtsModal from "@/components/ThoughtsModal";
import { getThoughtsByEventId, getThoughtsByPostId } from "@/lib/thoughts";
import { getUserAddress, formatAddressForDisplay } from "@/lib/addresses";
import { format } from "date-fns";

const Profile = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loadedThoughts, setLoadedThoughts] = useState<any[]>([]);
  const [resharedPosts, setResharedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [resharedShares, setResharedShares] = useState<string[]>([]);
  const [savedShares, setSavedShares] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please log in to view profiles");
          return;
        }

        // Determine which user's profile to fetch
        const profileUserId = userId || user.id;

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileUserId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's address from addresses table
        const address = await getUserAddress(profileUserId);
        setUserAddress(address);

        // Fetch enrolled events with event details
        const { data: enrollments, error: enrollmentsError } = await (supabase as any)
          .from('enrollments')
          .select('*, events(*)')
          .eq('user_id', profileUserId);

        if (enrollmentsError) {
          console.error("Error fetching enrollments:", enrollmentsError);
        }

        // Fetch healer profiles for the events
        const healerIds = (enrollments || [])
          .map((e: any) => e.events?.user_id)
          .filter((id: any) => id);
        
        let healerProfiles: any = {};
        if (healerIds.length > 0) {
          // Fetch basic profile data
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, first_name, last_name, avatar_url, bio, is_healer')
            .in('id', healerIds);
          
          // Fetch healer profile data
          const { data: healerProfilesData } = await (supabase as any)
            .from('healer_profiles')
            .select('user_id, specialties, tagline, role')
            .in('user_id', healerIds);
          
          // Create a map of healer profile data
          const healerProfileMap = new Map();
          (healerProfilesData || []).forEach((hp: any) => {
            healerProfileMap.set(hp.user_id, hp);
          });
          
          (profilesData || []).forEach((profile: any) => {
            const healerProfile = healerProfileMap.get(profile.id);
            healerProfiles[profile.id] = {
              ...profile,
              role: healerProfile?.role || null,
              tagline: healerProfile?.tagline || profile.bio,
              specialties: healerProfile?.specialties || []
            };
          });
        }

        // Get event IDs to fetch counts
        const eventIds = (enrollments || [])
          .map((e: any) => e.events?.id)
          .filter((id: any) => id);
        
        // Fetch enrollment counts for all events
        const enrollmentCountsMap = new Map();
        if (eventIds.length > 0) {
          const { data: enrollmentCounts } = await (supabase as any)
            .from('enrollments')
            .select('event_id')
            .in('event_id', eventIds)
            .eq('status', 'confirmed');
          
          (enrollmentCounts || []).forEach((enrollment: any) => {
            const currentCount = enrollmentCountsMap.get(enrollment.event_id) || 0;
            enrollmentCountsMap.set(enrollment.event_id, currentCount + 1);
          });
        }
        
        // Fetch thought counts for all events
        const thoughtCountsMap = new Map();
        if (eventIds.length > 0) {
          const { data: thoughtCounts } = await (supabase as any)
            .from('thoughts')
            .select('event_id')
            .in('event_id', eventIds)
            .not('event_id', 'is', null);
          
          (thoughtCounts || []).forEach((thought: any) => {
            const currentCount = thoughtCountsMap.get(thought.event_id) || 0;
            thoughtCountsMap.set(thought.event_id, currentCount + 1);
          });
        }

        // Separate into upcoming and past events
        const now = new Date();
        const upcoming: any[] = [];
        const past: any[] = [];

        (enrollments || []).forEach((enrollment: any) => {
          // Show all events on own profile (user can see everything they enrolled in)
          if (enrollment.events) {
            const event = enrollment.events;
            const healer = healerProfiles[event.user_id];
            const eventDate = new Date(event.start_date);
            const eventData = {
              eventId: event.id,
              title: event.title,
              image: event.image_url || "/src/assets/peaceful-background.jpg",
              dateRange: { 
                start: format(new Date(event.start_date), 'd MMMM yyyy')
              },
              author: { 
                id: event.user_id,
                name: healer?.display_name || healer?.first_name || "Unknown",
                avatar: healer?.avatar_url || "",
                role: healer?.role || healer?.tagline || healer?.bio || "Healer",
                isHealer: healer?.is_healer || false
              },
              location: `${event.city || ''}${event.city && event.country ? ', ' : ''}${event.country || ''}`,
              attendees: enrollmentCountsMap.get(event.id) || 0,
              tags: event.tags || [],
              thought: event.description || "",
              comments: thoughtCountsMap.get(event.id) || 0
            };

            if (eventDate >= now) {
              upcoming.push(eventData);
            } else {
              past.push(eventData);
            }
          }
        });

        setUpcomingEvents(upcoming);
        setPastEvents(past);

        // Fetch user's shares/posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profileUserId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!postsError && postsData) {
          const formattedShares = postsData.map((post: any) => ({
            id: post.id,
            title: post.title,
            thought: post.content,
            description: "",
            tags: post.tags || [],
            author: { 
              name: profileData.display_name || profileData.first_name || "You",
              avatar: profileData.avatar_url || "",
              role: profileData.bio || ""
            },
            comments: 0 // TODO: Count thoughts
          }));
          setShares(formattedShares);
        }

      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  const displayName = profile.display_name || profile.first_name || "User";
  const location = formatAddressForDisplay(userAddress);

  return (
    <>
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-xl">
                {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold mb-1">{displayName}</h1>
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
              {profile.bio && (
                <p className="text-muted-foreground max-w-md">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="relative">
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {upcomingEvents.map((event, index) => (
                  <CommunityEventCard
                    key={event.eventId}
                    {...event}
                    index={index}
                    isHorizontal={true}
                    onOpenThoughts={async (eventData) => {
                      setSelectedPost(eventData);
                      // Load thoughts for the event
                      const thoughts = await getThoughtsByEventId(eventData.eventId);
                      setLoadedThoughts(thoughts);
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
        )}

        {upcomingEvents.length === 0 && (
          <div className="mb-12 text-center py-12 text-muted-foreground">
            <p>No upcoming events. Explore events to join!</p>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Past Events</h2>
            <div className="relative">
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {pastEvents.map((event, index) => (
                  <CommunityEventCard
                    key={event.eventId}
                    {...event}
                    index={index}
                    isHorizontal={true}
                    onOpenThoughts={async (eventData) => {
                      setSelectedPost(eventData);
                      // Load thoughts for the event
                      const thoughts = await getThoughtsByEventId(eventData.eventId);
                      setLoadedThoughts(thoughts);
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
        )}

        {/* Shares Section */}
        {shares.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Recent Shares</h2>
            <div className="relative">
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {shares.map((share, index) => (
                  <CommunityShareCard
                    key={share.id}
                    {...share}
                    index={index}
                    isHorizontal={true}
                    onOpenThoughts={(shareData) => {
                      setSelectedPost(shareData);
                      setThoughtsModalOpen(true);
                    }}
                    isReshared={resharedShares.includes(share.id)}
                    onToggleReshare={() => {
                      if (resharedShares.includes(share.id)) {
                        setResharedShares(prev => prev.filter(id => id !== share.id));
                        toast.success("Reshare removed");
                      } else {
                        setResharedShares(prev => [...prev, share.id]);
                        toast.success("Share reshared!");
                      }
                    }}
                    isSaved={savedShares.includes(share.id)}
                    onToggleSave={() => {
                      if (savedShares.includes(share.id)) {
                        setSavedShares(prev => prev.filter(id => id !== share.id));
                        toast.success("Removed from saved");
                      } else {
                        setSavedShares(prev => [...prev, share.id]);
                        toast.success("Saved to your private page!");
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thoughts Modal */}
      <ThoughtsModal
        open={thoughtsModalOpen}
        onOpenChange={setThoughtsModalOpen}
        postId={selectedPost?.eventId || selectedPost?.id || ''}
        postTitle={selectedPost?.title || ""}
        thoughts={loadedThoughts}
        isEvent={!!selectedPost?.eventId}
        onThoughtAdded={async () => {
          // Refresh thoughts after adding
          const postId = selectedPost?.eventId || selectedPost?.id;
          if (postId) {
            const thoughts = selectedPost?.eventId 
              ? await getThoughtsByEventId(postId)
              : await getThoughtsByPostId(postId);
            setLoadedThoughts(thoughts);
          }
          toast.success("Thought added!");
        }}
      />
    </>
  );
};

export default Profile;
