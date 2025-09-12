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

interface ProfileDropdownProps {
  userImage: string;
  userName: string;
}

const ProfileDropdown = ({ userImage, userName }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // Here you would typically handle the actual logout logic
    console.log("User logged out");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
          <AvatarImage src={userImage} />
          <AvatarFallback className="text-sm">ME</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border border-border">
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <User className="h-4 w-4 text-primary" />
          <span>My Page</span>
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