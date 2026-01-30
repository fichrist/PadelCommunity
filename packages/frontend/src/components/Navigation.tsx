import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare, UserCircle, House, Users } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/community", label: "Community", icon: Users },
    { path: "/people", label: "Souls", icon: UserCircle },
    { path: "/home", label: "Home", icon: House },
    { path: "/chat", label: "Talk", icon: MessageSquare },
    { path: "/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <nav className="bg-card/50 backdrop-blur-md border-b border-border/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-16">
          <div className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "default" : "ghost"}
                size="sm"
                asChild
                className="transition-all duration-200"
              >
                <Link to={path} className="flex items-center space-x-2">
                  <Icon className="h-8 w-8" />
                  <span>{label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
