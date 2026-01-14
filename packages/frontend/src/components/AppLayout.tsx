import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, MessageCircle, Plus, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import padelBackground from "@/assets/padel-background.jpg";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";

interface AppLayoutProps {
  children: ReactNode;
  showCreateDropdown?: boolean;
  showNotifications?: boolean;
  showProfileDropdown?: boolean;
  onCreateShare?: () => void;
}

const AppLayout = ({
  children,
  showCreateDropdown = true,
  showNotifications = true,
  showProfileDropdown = true,
  onCreateShare
}: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${padelBackground})` }}
    >
      {/* Background Overlay */}
      <div className="min-h-screen pt-0">
        {/* Top Navigation Bar */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Logo + App Name */}
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate('/events')}
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
              </div>
              
              {/* Right: Create Button + Profile */}
              <div className="flex items-center space-x-3">
                {showCreateDropdown ? (
                  <CreateDropdown onCreateShare={onCreateShare || (() => {})} />
                ) : (
                  <Button size="sm" className="rounded-full h-10 w-10 p-0">
                    <Plus className="h-5 w-5" />
                  </Button>
                )}
                {showNotifications && <NotificationDropdown />}
                {showProfileDropdown ? (
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

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
