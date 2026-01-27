import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, UserPlus, Heart, Ban, Trophy, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  link?: string;
  match_id?: string;
  read: boolean;
  created_at: string;
}

interface Follower {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isFollowing: boolean;
  isBlocked: boolean;
  timeAgo: string;
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    };

    fetchNotifications();

    // Subscribe to new notifications
    let channel: any;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;

      channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${data.user.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev]);
            toast.success('New notification received!');
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleFollow = (followerId: string) => {
    setFollowers(prev => 
      prev.map(follower => 
        follower.id === followerId 
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower
      )
    );
    
    const follower = followers.find(f => f.id === followerId);
    if (follower) {
      toast.success(follower.isFollowing ? `Unfollowed ${follower.name}` : `Now following ${follower.name}`);
    }
  };

  const handleBlock = (followerId: string) => {
    setFollowers(prev =>
      prev.map(follower =>
        follower.id === followerId
          ? { ...follower, isBlocked: !follower.isBlocked, isFollowing: follower.isBlocked ? follower.isFollowing : false }
          : follower
      )
    );

    const follower = followers.find(f => f.id === followerId);
    if (follower) {
      toast.success(follower.isBlocked ? `Unblocked ${follower.name}` : `Blocked ${follower.name}`);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Delete the notification when clicked
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notification.id);

    setNotifications(prev => prev.filter(n => n.id !== notification.id));

    // Navigate based on notification link or type
    if (notification.link) {
      // Parse the link to extract match ID if it's a community match link
      const urlObj = new URL(notification.link, window.location.origin);
      const matchId = urlObj.searchParams.get('match');

      if (urlObj.pathname === '/community' && matchId) {
        // Navigate to Community page with the match selected
        navigate('/community', { state: { selectMatchId: matchId } });
      } else {
        // Use the link as-is for other notifications
        navigate(notification.link);
      }
      setIsOpen(false);
    } else if (notification.type === 'new_match' && notification.data?.match_id) {
      // Fallback for old notifications using data field
      navigate('/community', { state: { selectMatchId: notification.data.match_id } });
      setIsOpen(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      toast.error('Failed to delete notification');
      return;
    }

    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const handleDeleteAllNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete notifications');
      return;
    }

    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const unreadCount = followers.filter(f => !f.isFollowing && !f.isBlocked).length + unreadNotificationCount;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full hover:bg-muted/70 transition-all hover:scale-110 relative"
      >
        <Bell className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount}
          </div>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-full mt-2 w-96 z-50 bg-card border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span>Notifications</span>
                </div>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteAllNotifications}
                    className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 max-h-96 overflow-y-auto">
              {notifications.length === 0 && followers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No notifications yet
                </p>
              ) : (
                <>
                  {/* Match Notifications */}
                  {notifications.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Matches
                      </p>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            notification.read
                              ? 'bg-muted/30 hover:bg-muted/50'
                              : 'bg-primary/10 hover:bg-primary/20'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-sm font-medium text-foreground">
                                {notification.title}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className="h-6 w-6 p-0 hover:bg-destructive/10"
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follower Notifications */}
                  {followers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Followers
                      </p>
                      {followers.filter(f => !f.isBlocked).map((follower) => (
                        <div
                          key={follower.id} 
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar 
                        className="h-10 w-10 cursor-pointer"
                        onClick={() => {
                          navigate(`/healer/${follower.name.toLowerCase().replace(' ', '-')}`);
                          setIsOpen(false);
                        }}
                      >
                        <AvatarImage src={follower.avatar} />
                        <AvatarFallback className="bg-primary/10">
                          {follower.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span 
                            className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary"
                            onClick={() => {
                              navigate(`/healer/${follower.name.toLowerCase().replace(' ', '-')}`);
                              setIsOpen(false);
                            }}
                          >
                            {follower.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {follower.timeAgo}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {follower.role} started following you
                        </p>
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant={follower.isFollowing ? "secondary" : "outline"}
                            onClick={() => handleFollow(follower.id)}
                            className="h-7 px-3 text-xs"
                          >
                            {follower.isFollowing ? (
                              <>
                                <Heart className="h-3 w-3 mr-1 fill-current" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3 mr-1" />
                                Follow Back
                              </>
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBlock(follower.id)}
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
