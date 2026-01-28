import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, MessageCircle, Plus, Trophy, LogIn, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import padelBackground from "@/assets/padel-background.jpg";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import { supabase } from "@/integrations/supabase/client";
import TPMemberSetupDialog from "@/components/TPMemberSetupDialog";

interface AppLayoutProps {
  children: ReactNode;
  showCreateDropdown?: boolean;
  showNotifications?: boolean;
  showProfileDropdown?: boolean;
  showNavBar?: boolean;
  onCreateShare?: () => void;
}

const AppLayout = ({
  children,
  showCreateDropdown = true,
  showNotifications = true,
  showProfileDropdown = true,
  showNavBar = true,
  onCreateShare
}: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasTpUserId, setHasTpUserId] = useState<boolean>(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  useEffect(() => {
    // Safety timeout: if the auth check takes too long (e.g. Supabase client
    // hangs trying to refresh an expired token), stop the spinner and treat
    // the user as logged out so the app remains usable.
    const authTimeout = setTimeout(() => {
      if (authLoading) {
        console.warn('AppLayout: Auth check timed out, continuing as logged out');
        setIsLoggedIn(false);
        setAuthLoading(false);
      }
    }, 5000);

    const checkAuth = async () => {
      try {
        // Use getSession() (localStorage read) instead of getUser() (network call).
        // getUser() fails when the access token has expired, making the user appear
        // logged out even though the refresh token is still valid.
        // autoRefreshToken will refresh the token in the background and
        // onAuthStateChange will update the state when ready.
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session?.user);

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('tp_user_id')
            .eq('id', session.user.id)
            .single();

          setHasTpUserId(!!profile?.tp_user_id);
        }
      } catch (error) {
        console.error('AppLayout: Auth check failed:', error);
      } finally {
        clearTimeout(authTimeout);
        setAuthLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session?.user);

      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('tp_user_id')
            .eq('id', session.user.id)
            .single();

          setHasTpUserId(!!profile?.tp_user_id);
        } catch (error) {
          console.error('AppLayout: Profile fetch in auth change failed:', error);
        }
      } else {
        setHasTpUserId(false);
      }

      setAuthLoading(false);
    });

    const handleProfileUpdate = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tp_user_id')
          .eq('id', session.user.id)
          .single();

        setHasTpUserId(!!profile?.tp_user_id);
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      clearTimeout(authTimeout);
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${padelBackground})` }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen pt-0">
        {/* Top Navigation Bar */}
        {showNavBar && (
          <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Logo + App Name */}
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate('/community')}
              >
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary font-comfortaa">Padel Community</span>
              </div>
              
              {/* Center: Navigation Icons */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="p-4 rounded-xl hover:bg-muted/70 relative transition-all hover:scale-110"
                    onClick={() => navigate('/community')}
                  >
                    <Users className={`h-9 w-9 ${isActive('/community') ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`} />
                    {isActive('/community') && (
                      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="p-4 rounded-xl hover:bg-muted/70 relative transition-all hover:scale-110"
                    onClick={() => navigate('/events')}
                  >
                    <Trophy className={`h-9 w-9 ${isActive('/events') || isActive('/event/') ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`} />
                    {(isActive('/events') || isActive('/event/')) && (
                      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="p-4 rounded-xl hover:bg-muted/70 relative transition-all hover:scale-110"
                    onClick={() => navigate('/people')}
                  >
                    <User className={`h-9 w-9 ${isActive('/people') ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`} />
                    {isActive('/people') && (
                      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
                    )}
                  </Button>
                </div>
                {isLoggedIn && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="p-4 rounded-xl hover:bg-muted/70 relative transition-all hover:scale-110"
                      onClick={() => navigate('/chat')}
                    >
                      <MessageCircle className={`h-9 w-9 ${isActive('/chat') ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`} />
                      {isActive('/chat') && (
                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Right: Create Button / Complete Registration + Profile */}
              <div className="flex items-center space-x-3">
                {isLoggedIn && (
                  hasTpUserId ? (
                    showCreateDropdown ? (
                      <CreateDropdown onCreateShare={onCreateShare || (() => {})} />
                    ) : (
                      <Button size="sm" className="rounded-full h-10 w-10 p-0">
                        <Plus className="h-5 w-5" />
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSetupDialog(true)}
                      className="flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Complete Registration</span>
                    </Button>
                  )
                )}
                {showNotifications && isLoggedIn && <NotificationDropdown />}
                {isLoggedIn === false ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                ) : showProfileDropdown ? (
                  <ProfileDropdown userImage={elenaProfile} />
                ) : (
                  <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarImage src={elenaProfile} />
                    <AvatarFallback className="text-sm">ME</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>

      <TPMemberSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        onSaveComplete={() => {
          setShowSetupDialog(false);
          setHasTpUserId(true);
          window.dispatchEvent(new Event('profile-updated'));
        }}
      />
    </div>
  );
};

export default AppLayout;
