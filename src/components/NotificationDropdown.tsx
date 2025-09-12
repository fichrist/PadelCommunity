import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import images
import elenaProfile from "@/assets/elena-profile.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [followers, setFollowers] = useState([
    {
      id: "1",
      name: "Luna Sage",
      avatar: elenaProfile,
      role: "Meditation Teacher",
      isFollowing: false,
      timeAgo: "2 hours ago"
    },
    {
      id: "2", 
      name: "River Flow",
      avatar: davidProfile,
      role: "Energy Healer",
      isFollowing: false,
      timeAgo: "4 hours ago"
    },
    {
      id: "3",
      name: "Star Dreamer", 
      avatar: ariaProfile,
      role: "Astrologer",
      isFollowing: true,
      timeAgo: "1 day ago"
    },
    {
      id: "4",
      name: "Ocean Mystic",
      avatar: phoenixProfile,
      role: "Reiki Master", 
      isFollowing: false,
      timeAgo: "2 days ago"
    }
  ]);

  const navigate = useNavigate();

  const handleFollowBack = (followerId: string) => {
    setFollowers(prev => 
      prev.map(follower => 
        follower.id === followerId 
          ? { ...follower, isFollowing: true }
          : follower
      )
    );
  };

  const unreadCount = followers.filter(f => !f.isFollowing).length;

  return (
    <div className="relative">
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
          <Card className="absolute right-0 top-full mt-2 w-80 z-50 bg-card/95 backdrop-blur-md border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center space-x-2">
                <Bell className="h-4 w-4 text-primary" />
                <span>New Followers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 max-h-80 overflow-y-auto">
              {followers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No new followers yet
                </p>
              ) : (
                <div className="space-y-3">
                  {followers.map((follower) => (
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
                        {!follower.isFollowing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFollowBack(follower.id)}
                            className="h-7 px-3 text-xs"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Follow Back
                          </Button>
                        ) : (
                          <span className="text-xs text-primary font-medium">Following</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;