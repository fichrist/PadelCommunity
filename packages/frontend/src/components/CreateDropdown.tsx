import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Calendar, Share2, Trophy } from "lucide-react";
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
          size="sm"
          className="rounded-full h-10 w-10 p-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border border-border">
        <DropdownMenuItem
          onClick={() => navigate('/create-match')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <Trophy className="h-4 w-4 text-primary" />
          <span>Create Match</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/create-event')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <Calendar className="h-4 w-4 text-primary" />
          <span>Create Event</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/create-post')}
          className="cursor-pointer flex items-center space-x-2 py-3"
        >
          <Share2 className="h-4 w-4 text-primary" />
          <span>Create Post</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateDropdown;
