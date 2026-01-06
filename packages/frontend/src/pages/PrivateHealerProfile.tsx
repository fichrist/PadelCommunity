import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MapPin, Star, Play, MessageCircle, Heart, Phone, Mail, Facebook, Instagram, Edit, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserAddress, formatAddressForDisplay } from "@/lib/addresses";
import { getPostsWithDetails } from "@/lib/posts";
import { getThoughtsByHealerProfileId, getThoughtsByEventId } from "@/lib/thoughts";
import CommunityShareCard from "@/components/CommunityShareCard";
import CommunityEventCard from "@/components/CommunityEventCard";
import ThoughtsModal from "@/components/ThoughtsModal";
import { toast } from "sonner";
import { format } from "date-fns";

const PrivateHealerProfile = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<any>(null);
  const [healerProfile, setHealerProfile] = useState<any>(null);
  const [shares, setShares] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [healerId, setHealerId] = useState<string | null>(null);
  const [eventEnrollments, setEventEnrollments] = useState<Map<string, any[]>>(new Map());
  const [eventsData, setEventsData] = useState<Map<string, any>>(new Map());
   
  // State for interactions
  const [thoughtsModalOpen, setThoughtsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [resharedShares, setResharedShares] = useState<string[]>([]);
  const [savedShares, setSavedShares] = useState<string[]>([]);
  const [healerThoughts, setHealerThoughts] = useState<any[]>([]);
  const [showHealerThoughts, setShowHealerThoughts] = useState(false);


  useEffect(() => {
    const fetchHealerData = async () => {
      console.log("Fetching healer data");
      setLoading(true);

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please log in to view your profile");
          navigate('/');
          return;
        }
        
        const currentHealerId = user.id;
        setHealerId(currentHealerId);

        console.log("Fetching healer data for:", currentHealerId);

        // Fetch profile data
        console.log("Fetching profile...");
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentHealerId)
          .single();

        console.log("Profile data:", profileData, "Error:", profileError);

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.error("Profile not found for ID:", currentHealerId);
            setProfile(null);
            setLoading(false);
            return;
          }
          throw profileError;
        }
        
        setProfile(profileData);

        // Fetch user's address from addresses table
        const address = await getCurrentUserAddress();
        setUserAddress(address);

        // Fetch healer profile data
        console.log("Fetching healer profile...");
        const { data: healerData, error: healerError } = await (supabase as any)
          .from('healer_profiles')
          .select('*')
          .eq('user_id', currentHealerId)
          .single();

        console.log("Healer profile data:", healerData, "Error:", healerError);

        if (!healerError && healerData) {
          setHealerProfile(healerData);
        }

        // Fetch user's posts as shares
        console.log("Fetching user posts...");
        try {
          const allPosts = await getPostsWithDetails();
          const userPosts = allPosts.filter((post: any) => post.user_id === currentHealerId);
          console.log("User posts:", userPosts.length);
          setShares(userPosts);
        } catch (postError) {
          console.error("Error fetching posts:", postError);
          setShares([]);
        }

        // Fetch healer thoughts count
        console.log("Fetching healer thoughts...");
        try {
          const thoughts = await getThoughtsByHealerProfileId(currentHealerId);
          setHealerThoughts(thoughts);
          console.log("Healer thoughts:", thoughts.length);
        } catch (thoughtsError) {
          console.error("Error fetching healer thoughts:", thoughtsError);
          setHealerThoughts([]);
        }

        // Fetch healer's events
        console.log("Fetching healer events...");
        try {
          const { data: events, error: eventsError } = await (supabase as any)
            .from('events')
            .select('*')
            .eq('user_id', currentHealerId)
            .order('start_date', { ascending: true });

          if (eventsError) throw eventsError;

          // Get event IDs to fetch counts
          const eventIds = (events || []).map((e: any) => e.id);
          
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

          // Fetch enrollment counts
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

          // Format events and separate into upcoming and past
          const now = new Date();
          const upcoming: any[] = [];
          const past: any[] = [];

          // Compute display name and role for events
          const eventAuthorName = healerData?.name || profileData.display_name || profileData.first_name || "Healer";
          const eventAuthorRole = healerData?.role || "Spiritual Practitioner";

          (events || []).forEach((event: any) => {
            const eventDate = new Date(event.start_date);
            const eventData = {
              eventId: event.id,
              title: event.title,
              image: event.image_url || "/src/assets/peaceful-background.jpg",
              dateRange: { 
                start: format(eventDate, 'd MMMM yyyy'),
                end: event.end_date ? format(new Date(event.end_date), 'd MMMM yyyy') : undefined
              },
              author: { 
                id: currentHealerId,
                name: eventAuthorName,
                avatar: profileData.avatar_url || "",
                role: eventAuthorRole,
                isHealer: true
              },
              location: `${event.city || ''}${event.city && event.country ? ', ' : ''}${event.country || ''}`.trim() || 'Location TBD',
              attendees: enrollmentCountsMap.get(event.id) || 0,
              tags: event.tags || [],
              thought: event.description || "",
              comments: thoughtCountsMap.get(event.id) || 0,
              isPastEvent: eventDate < now
            };

            if (eventDate >= now) {
              upcoming.push(eventData);
            } else {
              past.push(eventData);
            }
          });

          setUpcomingEvents(upcoming);
          setPastEvents(past);
          console.log("Upcoming events:", upcoming.length, "Past events:", past.length);
          
          // Store events data for enrollment tables
          const eventsMap = new Map();
          (events || []).forEach((event: any) => {
            eventsMap.set(event.id, event);
          });
          setEventsData(eventsMap);
          
          // Fetch enrollments for all events
          if (eventIds.length > 0) {
            const { data: enrollmentsData, error: enrollmentsError } = await (supabase as any)
              .from('enrollments')
              .select('*')
              .in('event_id', eventIds)
              .eq('status', 'confirmed')
              .order('enrollment_date', { ascending: true });
            
            if (enrollmentsError) {
              console.error("Error fetching enrollments:", enrollmentsError);
            } else if (enrollmentsData && enrollmentsData.length > 0) {
              // Fetch profile data for all enrolled users
              const userIds = enrollmentsData.map((e: any) => e.user_id);
              const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, display_name, first_name')
                .in('id', userIds);
              
              // Create a map of user profiles
              const profilesMap = new Map();
              (profilesData || []).forEach((profile: any) => {
                profilesMap.set(profile.id, profile);
              });
              
              // Attach profiles to enrollments
              const enrichedEnrollments = enrollmentsData.map((enrollment: any) => ({
                ...enrollment,
                profiles: profilesMap.get(enrollment.user_id)
              }));
              
              // Group enrollments by event
              const enrollmentsByEvent = new Map();
              enrichedEnrollments.forEach((enrollment: any) => {
                const eventId = enrollment.event_id;
                if (!enrollmentsByEvent.has(eventId)) {
                  enrollmentsByEvent.set(eventId, []);
                }
                enrollmentsByEvent.get(eventId).push(enrollment);
              });
              setEventEnrollments(enrollmentsByEvent);
              console.log("Enrollments fetched:", enrichedEnrollments.length);
            }
          }
        } catch (eventsError) {
          console.error("Error fetching events:", eventsError);
          setUpcomingEvents([]);
          setPastEvents([]);
        }

      } catch (error) {
        console.error("Error fetching healer data:", error);
        toast.error("Failed to load healer profile");
      } finally {
        console.log("Finished loading");
        setLoading(false);
      }
    };

    fetchHealerData();
  }, [healerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading healer profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Healer profile not found</p>
      </div>
    );
  }

  const displayName = healerProfile?.name || profile.display_name || profile.first_name || "Healer";
  const role = healerProfile?.role || "Spiritual Practitioner";
  const bio = healerProfile?.bio || "A dedicated healer committed to helping others on their spiritual journey.";
  const fullBio = healerProfile?.full_bio || bio;
  const specialties = healerProfile?.specialties || [];
  const videoUrl = healerProfile?.video;
  const location = formatAddressForDisplay(userAddress);

  // Function to load healer thoughts
  const loadHealerThoughts = async () => {
    if (!healerId) return;
    try {
      const thoughts = await getThoughtsByHealerProfileId(healerId);
      setHealerThoughts(thoughts);
      setShowHealerThoughts(true);
    } catch (error) {
      console.error("Error loading healer thoughts:", error);
      toast.error("Failed to load thoughts");
    }
  };

  // Function to render enrollment table for an event
  const renderEnrollmentTable = (eventId: string) => {
    const enrollments = eventEnrollments.get(eventId) || [];
    const event = eventsData.get(eventId);
    
    if (!event || enrollments.length === 0) {
      return null;
    }

    const prices = event.prices || [];
    const additionalOptions = event.additional_options || [];
    
    // Calculate totals
    const totals: any = {};
    prices.forEach((price: any) => {
      totals[price.label] = 0;
    });
    additionalOptions.forEach((option: any) => {
      totals[option.label] = 0;
    });

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Enrollments for {event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                {prices.map((price: any) => (
                  <TableHead key={price.label}>{price.label}</TableHead>
                ))}
                {additionalOptions.map((option: any) => (
                  <TableHead key={option.label}>{option.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment: any) => {
                const participantName = enrollment.profiles?.display_name || enrollment.profiles?.first_name || 'Unknown';
                const selectedPrice = enrollment.selected_price_option;
                const selectedAddOns = enrollment.selected_add_ons || [];
                
                // Update totals
                if (selectedPrice) {
                  totals[selectedPrice] = (totals[selectedPrice] || 0) + 1;
                }
                selectedAddOns.forEach((addOnLabel: string) => {
                  totals[addOnLabel] = (totals[addOnLabel] || 0) + 1;
                });

                return (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{participantName}</TableCell>
                    {prices.map((price: any) => (
                      <TableCell key={price.label}>
                        {selectedPrice === price.label ? '✓' : ''}
                      </TableCell>
                    ))}
                    {additionalOptions.map((option: any) => (
                      <TableCell key={option.label}>
                        {selectedAddOns.includes(option.label) ? '✓' : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              <TableRow className="font-bold bg-muted/50">
                <TableCell>Total</TableCell>
                {prices.map((price: any) => (
                  <TableCell key={price.label}>{totals[price.label] || 0}</TableCell>
                ))}
                {additionalOptions.map((option: any) => (
                  <TableCell key={option.label}>{totals[option.label] || 0}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex space-x-3">
              <Button
                onClick={() => navigate(`/healer/${healerId}`)}
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Public Page
              </Button>
              <Button
                onClick={() => navigate('/edit-healer-profile')}
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{role}</p>
                  <div className="flex items-center space-x-4 mb-4">
                    <div 
                      className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={loadHealerThoughts}
                      title="Click to view and add thoughts"
                    >
                      <span className="text-muted-foreground">({healerThoughts.length} thoughts)</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={() => navigate(`/chat?healer=${healerId}`)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <Heart className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground text-xl leading-loose mb-6 max-w-none">
                {bio}
              </p>
              
              {specialties.length > 0 && (
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Location</h3>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{location}</span>
                      </div>
                    </div>
                    {(healerProfile?.phone_number || healerProfile?.email || healerProfile?.facebook || healerProfile?.instagram) && (
                      <div>
                        <h3 className="font-semibold mb-2">Contact</h3>
                        <div className="space-y-3">
                          {healerProfile?.phone_number && (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{healerProfile.phone_number}</span>
                            </div>
                          )}
                          {healerProfile?.email && (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{healerProfile.email}</span>
                            </div>
                          )}
                          {healerProfile?.facebook && (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Facebook className="h-4 w-4" />
                              <span>{healerProfile.facebook}</span>
                            </div>
                          )}
                          {healerProfile?.instagram && (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Instagram className="h-4 w-4" />
                              <span>{healerProfile.instagram}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
          {videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Meet {displayName.split(' ')[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={videoUrl.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={videoUrl} controls className="w-full h-full" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About {displayName.split(' ')[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 text-lg leading-loose max-w-none whitespace-pre-line">
                {fullBio}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12 mt-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            {upcomingEvents.map((event) => (
              <div key={`enrollment-${event.eventId}`}>
                {renderEnrollmentTable(event.eventId)}
              </div>
            ))}
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Past Events</h2>
            {pastEvents.map((event) => (
              <div key={`enrollment-${event.eventId}`}>
                {renderEnrollmentTable(event.eventId)}
              </div>
            ))}
          </div>
        )}

        {/* Shares Section */}
        {shares.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6">Recent Shares</h2>
            <div className="relative">
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {shares.map((share, index) => (
                  <CommunityShareCard
                    key={share.id}
                    title={share.title}
                    thought={share.content}
                    description=""
                    tags={share.tags || []}
                    author={{
                      name: share.author?.display_name || share.author?.first_name || "Unknown",
                      avatar: share.author?.avatar_url || "",
                      role: share.author?.bio || role
                    }}
                    youtubeUrl={share.video_url}
                    comments={share.thoughts_count || 0}
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

        {shares.length === 0 && (
          <div className="mt-12 mb-8 text-center py-12 text-muted-foreground">
            <p>No shares yet from this healer</p>
          </div>
        )}
      </div>

      {/* Thoughts Modal for Posts */}
      <ThoughtsModal
        open={thoughtsModalOpen && !showHealerThoughts}
        onOpenChange={setThoughtsModalOpen}
        postId={selectedPost?.id || ''}
        postTitle={selectedPost?.title || ""}
        thoughts={[]}
        onThoughtAdded={() => {
          // Optionally refresh thoughts here
        }}
      />

      {/* Thoughts Modal for Healer Profile */}
      <ThoughtsModal
        open={showHealerThoughts}
        onOpenChange={setShowHealerThoughts}
        postId={healerId || ''}
        postTitle={displayName}
        thoughts={healerThoughts}
        isHealerProfile={true}
        onThoughtAdded={loadHealerThoughts}
      />
    </div>
  );
};

export default PrivateHealerProfile;
