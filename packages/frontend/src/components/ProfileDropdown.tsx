import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Shield, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase, getUserIdFromStorage, createFreshSupabaseClient } from "@/integrations/supabase/client";
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
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [initials, setInitials] = useState<string>("ME");

  const getInitials = (firstName?: string | null, lastName?: string | null, fallbackName?: string): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    if (fallbackName) {
      const parts = fallbackName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return fallbackName.substring(0, 2).toUpperCase();
    }
    return "ME";
  };

  useEffect(() => {
    // Fetch the current user's information
    const fetchUser = async () => {
      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();

      if (userId) {
        // Fetch profile from profiles table
        const profile = await getCurrentProfile();

        // Get display name from profile or fallback to "My Page"
        const name = profile?.display_name ||
                     profile?.first_name ||
                     "My Page";
        setDisplayName(name);
        setUserEmail("");
        setInitials(getInitials(profile?.first_name, profile?.last_name, name));

        // Only set avatar URL if profile has one, otherwise leave undefined
        setAvatarUrl(profile?.avatar_url || undefined);
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
        setInitials(getInitials(profile?.first_name, profile?.last_name, name));

        // Only set avatar URL if profile has one, otherwise leave undefined
        setAvatarUrl(profile?.avatar_url || undefined);
      } else {
        setDisplayName("My Page");
        setUserEmail("");
        setAvatarUrl(undefined);
        setInitials("ME");
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [userName, userImage]);

  const handleLogout = async () => {
    try {
      // Race signOut against a timeout so we always navigate away,
      // even if the network call hangs (e.g. expired token).
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
          <AvatarImage src={avatarUrl} referrerPolicy="no-referrer" />
          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border border-border">
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <User className="h-4 w-4 text-primary" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/notification-settings')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <Bell className="h-4 w-4 text-primary" />
          <span>Notification Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/admin')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <Shield className="h-4 w-4 text-primary" />
          <span>Admin</span>
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
