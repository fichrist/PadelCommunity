import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentProfile } from "@/lib/profiles";

interface ProfileDropdownProps {
  userImage: string;
  userName?: string;
}

const ProfileDropdown = ({ userImage, userName }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState<string>(userName || "My Page");
  const [userEmail, setUserEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>(userImage);

  useEffect(() => {
    // Fetch the current user's information
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch profile from profiles table
        const profile = await getCurrentProfile();
        
        // Get display name from profile or fallback to email
        const name = profile?.display_name || 
                     profile?.first_name ||
                     user.email?.split('@')[0] || 
                     "My Page";
        setDisplayName(name);
        setUserEmail(user.email || "");
        
        // Set avatar URL from profile
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        } else {
          setAvatarUrl(userImage);
        }
      }
    };

    fetchUser();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUser();
    };
    window.addEventListener('profile-updated', handleProfileUpdate);

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch profile from profiles table
        const profile = await getCurrentProfile();
        
        const name = profile?.display_name || 
                     profile?.first_name ||
                     session.user.email?.split('@')[0] || 
                     "My Page";
        setDisplayName(name);
        setUserEmail(session.user.email || "");
        
        // Set avatar URL from profile
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      } else {
        setDisplayName("My Page");
        setUserEmail("");
        setAvatarUrl(userImage);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [userName, userImage]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
        console.error("Logout error:", error);
        return;
      }

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to home page after logout
      navigate('/');
    } catch (error) {
      console.error("Unexpected logout error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
          <AvatarImage src={avatarUrl} referrerPolicy="no-referrer" />
          <AvatarFallback className="text-sm">ME</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border border-border">
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <User className="h-4 w-4 text-primary" />
          <span>{displayName}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <Settings className="h-4 w-4 text-primary" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer flex items-center space-x-2 py-3 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
