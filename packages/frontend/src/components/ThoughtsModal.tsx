import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { createThought } from "@/lib/thoughts";
import { toast } from "sonner";

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
  postId: string;
  postTitle: string;
  thoughts: Thought[];
  onThoughtAdded?: () => void;
}

const ThoughtsModal = ({ open, onOpenChange, postId, postTitle, thoughts, onThoughtAdded }: ThoughtsModalProps) => {
  const [newThought, setNewThought] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Debug logging
  console.log("ThoughtsModal rendered with:", { postId, postTitle, thoughtsCount: thoughts?.length, thoughts });

  const handleSubmitThought = async () => {
    if (!newThought.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createThought(postId, newThought);
      
      if (result.success) {
        toast.success("Thought shared successfully!");
        setNewThought("");
        // Notify parent to refresh thoughts
        if (onThoughtAdded) {
          onThoughtAdded();
        }
      } else {
        toast.error(result.error || "Failed to share thought");
      }
    } catch (error) {
      console.error("Error submitting thought:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
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
                disabled={!newThought.trim() || isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Sharing..." : "Share Thought"}
              </Button>
            </div>
          </div>

          {/* Existing thoughts */}
          <div className="space-y-4">
            {thoughts && thoughts.length > 0 ? (
              thoughts.map((thought) => (
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
                      <p className="text-sm text-foreground/90">{thought.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No thoughts yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThoughtsModal;
