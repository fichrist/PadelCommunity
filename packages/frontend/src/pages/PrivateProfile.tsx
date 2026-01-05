import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, MessageCircle, Edit, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CommunityShareCard from "@/components/CommunityShareCard";
import ThoughtsModal from "@/components/ThoughtsModal";
import { getThoughtsByEventId } from "@/lib/thoughts";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const PrivateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loadedThoughts, setLoadedThoughts] = useState<any[]>([]);
  const [resharedShares, setResharedShares] = useState<string[]>([]);
  const [savedShares, setSavedShares] = useState<string[]>([]);

  const interests = [
    "Meditation", "Crystal Healing", "Astrology", "Chakras", 
    "Sacred Geometry", "Yoga", "Mindfulness", "Energy Healing"
  ];

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please log in to view your profile");
          navigate('/');
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch enrolled events with event details
        const { data: enrollmentsData, error: enrollmentsError } = await (supabase as any)
          .from('enrollments')
          .select('*, events(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (enrollmentsError) {
          console.error("Error fetching enrollments:", enrollmentsError);
        }

        // Fetch healer profiles for the events
        const healerIds = (enrollmentsData || [])
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
        const eventIds = (enrollmentsData || [])
          .map((e: any) => e.events?.id)
          .filter((id: any) => id);
        
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

        // Format enrollments for table
        const formattedEnrollments = (enrollmentsData || []).map((enrollment: any) => {
          const event = enrollment.events;
          if (!event) return null;

          const healer = healerProfiles[event.user_id];
          const eventDate = new Date(event.start_date);
          const isPast = eventDate < new Date();

          return {
            enrollmentId: enrollment.id,
            eventId: event.id,
            title: event.title,
            date: format(eventDate, 'd MMMM yyyy'),
            dateObj: eventDate,
            isPast,
            location: `${event.city || ''}${event.city && event.country ? ', ' : ''}${event.country || ''}`.trim() || 'TBD',
            organizer: healer?.display_name || healer?.first_name || "Unknown",
            status: enrollment.status,
            remarks: enrollment.remarks || "",
            thoughtsCount: thoughtCountsMap.get(event.id) || 0,
            image: event.image_url,
            tags: event.tags || []
          };
        }).filter(Boolean);

        setEnrollments(formattedEnrollments);

        // Fetch user's shares/posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
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
              role: profileData.bio || "",
              isHealer: profileData.is_healer || false
            },
            comments: 0
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
  }, [navigate]);

  const handleCancelEnrollment = async (enrollmentId: string, eventTitle: string) => {
    if (!window.confirm(`Are you sure you want to cancel your enrollment for "${eventTitle}"?`)) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;

      // Remove from local state
      setEnrollments(prev => prev.filter(e => e.enrollmentId !== enrollmentId));
      toast.success("Enrollment cancelled successfully");
    } catch (error) {
      console.error("Error cancelling enrollment:", error);
      toast.error("Failed to cancel enrollment");
    }
  };

  const handleOpenThoughts = async (enrollment: any) => {
    setSelectedEvent(enrollment);
    // Load thoughts for the event
    const thoughts = await getThoughtsByEventId(enrollment.eventId);
    setLoadedThoughts(thoughts);
    setThoughtsModalOpen(true);
  };

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
  const location = [profile.city, profile.country].filter(Boolean).join(', ') || "Location not set";

  const upcomingEnrollments = enrollments.filter(e => !e.isPast);
  const pastEnrollments = enrollments.filter(e => e.isPast);

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
        {/* Spiritual Interests */}
        <div className="mb-12">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Spiritual Interests</CardTitle>
              <CardDescription>Topics that resonate with your soul</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge 
                    key={interest} 
                    variant="secondary" 
                    className="bg-sage/20 text-sage-foreground hover:bg-sage/30 transition-colors cursor-pointer"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Enrollments */}
        {upcomingEnrollments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.enrollmentId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            {enrollment.image && (
                              <img 
                                src={enrollment.image} 
                                alt={enrollment.title}
                                className="w-16 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <div 
                                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/event/${enrollment.eventId}`)}
                              >
                                {enrollment.title}
                              </div>
                              {enrollment.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {enrollment.tags.slice(0, 2).map((tag: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{enrollment.date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{enrollment.location}</TableCell>
                        <TableCell className="text-sm">{enrollment.organizer}</TableCell>
                        <TableCell>
                          <Badge variant={enrollment.status === 'confirmed' ? 'default' : 'secondary'}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenThoughts(enrollment)}
                              title="Add thought"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span className="ml-1 text-xs">{enrollment.thoughtsCount}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/event/${enrollment.eventId}`)}
                              title="View/Edit enrollment"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelEnrollment(enrollment.enrollmentId, enrollment.title)}
                              className="text-destructive hover:text-destructive"
                              title="Cancel enrollment"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {upcomingEnrollments.length === 0 && (
          <div className="mb-12 text-center py-12 text-muted-foreground">
            <p>No upcoming events. Explore events to join!</p>
          </div>
        )}

        {/* Past Events Enrollments */}
        {pastEnrollments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Past Events</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.enrollmentId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            {enrollment.image && (
                              <img 
                                src={enrollment.image} 
                                alt={enrollment.title}
                                className="w-16 h-12 object-cover rounded opacity-70"
                              />
                            )}
                            <div>
                              <div 
                                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/event/${enrollment.eventId}`)}
                              >
                                {enrollment.title}
                              </div>
                              {enrollment.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {enrollment.tags.slice(0, 2).map((tag: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{enrollment.date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{enrollment.location}</TableCell>
                        <TableCell className="text-sm">{enrollment.organizer}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenThoughts(enrollment)}
                              title="View thoughts"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span className="ml-1 text-xs">{enrollment.thoughtsCount}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/event/${enrollment.eventId}`)}
                              title="View event"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                      setSelectedEvent(shareData);
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
        postId={selectedEvent?.eventId || ''}
        postTitle={selectedEvent?.title || ""}
        thoughts={loadedThoughts}
        isEvent={true}
        onThoughtAdded={async () => {
          // Refresh thoughts after adding
          if (selectedEvent?.eventId) {
            const thoughts = await getThoughtsByEventId(selectedEvent.eventId);
            setLoadedThoughts(thoughts);
            
            // Update thought count in the table
            setEnrollments(prev => prev.map(e => 
              e.eventId === selectedEvent.eventId 
                ? { ...e, thoughtsCount: thoughts.length }
                : e
            ));
          }
          toast.success("Thought added!");
        }}
      />
    </>
  );
};

export default PrivateProfile;
