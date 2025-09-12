import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreateDropdownProps {
  onCreateShare: () => void;
}

const CreateDropdown = ({ onCreateShare }: CreateDropdownProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-10 w-10 p-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate('/create-event')}>
          <Calendar className="mr-2 h-4 w-4" />
          Add Event
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Add Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateDropdown;