import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";

interface Thought {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  timeAgo: string;
}

interface ThoughtsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  thoughts: Thought[];
}

const ThoughtsModal = ({ open, onOpenChange, postTitle, thoughts }: ThoughtsModalProps) => {
  const [newThought, setNewThought] = useState("");

  const handleSubmitThought = () => {
    if (newThought.trim()) {
      // Here you would typically add the thought to your data
      console.log("New thought:", newThought);
      setNewThought("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Thoughts on "{postTitle}"</DialogTitle>
          <DialogDescription>
            Share your thoughts and see what others are thinking.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Write new thought */}
          <div className="border rounded-lg p-4 space-y-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitThought}
                disabled={!newThought.trim()}
                size="sm"
              >
                Share Thought
              </Button>
            </div>
          </div>

          {/* Existing thoughts */}
          <div className="space-y-4">
            {thoughts?.map((thought) => (
              <div key={thought.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={thought.author.avatar} />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {thought.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">{thought.author.name}</span>
                      <span className="text-xs text-muted-foreground">{thought.timeAgo}</span>
                    </div>
                    <p className="text-sm text-foreground/90 mb-3">{thought.content}</p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary">
                        <Heart className="h-3 w-3" />
                        <span>{thought.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary">
                        <MessageCircle className="h-3 w-3" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThoughtsModal;
