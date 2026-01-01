import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3, Trash2 } from "lucide-react";
import { createThought, updateThought, deleteThought } from "@/lib/thoughts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Thought {
  id: string;
  user_id?: string;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingThoughtId, setEditingThoughtId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  // Debug logging
  console.log("ThoughtsModal rendered with:", { postId, postTitle, thoughtsCount: thoughts?.length, thoughts });

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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

  const handleEditThought = (thought: Thought) => {
    setEditingThoughtId(thought.id);
    setEditContent(thought.content);
  };

  const handleSaveEdit = async (thoughtId: string) => {
    if (!editContent.trim()) return;

    const success = await updateThought(thoughtId, editContent);
    
    if (success) {
      toast.success("Thought updated successfully!");
      setEditingThoughtId(null);
      setEditContent("");
      // Notify parent to refresh thoughts
      if (onThoughtAdded) {
        onThoughtAdded();
      }
    } else {
      toast.error("Failed to update thought");
    }
  };

  const handleCancelEdit = () => {
    setEditingThoughtId(null);
    setEditContent("");
  };

  const handleDeleteThought = async (thoughtId: string) => {
    if (window.confirm("Are you sure you want to delete this thought? This action cannot be undone.")) {
      const success = await deleteThought(thoughtId);
      
      if (success) {
        toast.success("Thought deleted successfully!");
        // Notify parent to refresh thoughts
        if (onThoughtAdded) {
          onThoughtAdded();
        }
      } else {
        toast.error("Failed to delete thought");
      }
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
                <div key={thought.id} className="border rounded-lg p-4 relative">
                  {/* Edit/Delete buttons for own thoughts */}
                  {thought.user_id && currentUserId && thought.user_id === currentUserId && editingThoughtId !== thought.id && (
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditThought(thought)}
                        className="h-7 w-7 p-0 hover:bg-muted/70"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteThought(thought.id)}
                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

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
                      
                      {/* Edit mode */}
                      {editingThoughtId === thought.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px] resize-none text-sm"
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(thought.id)}
                              disabled={!editContent.trim()}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/90 pr-16">{thought.content}</p>
                      )}
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
