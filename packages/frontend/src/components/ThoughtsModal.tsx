import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3, Trash2, Reply, X } from "lucide-react";
import { createThought, createEventThought, createHealerProfileThought, createMatchThought, updateThought, deleteThought } from "@/lib/thoughts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Thought {
  id: string;
  user_id?: string;
  parent_thought_id?: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  timeAgo: string;
  replies?: Thought[];
}

interface ThoughtsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postTitle: string;
  thoughts: Thought[];
  isEvent?: boolean;
  isHealerProfile?: boolean;
  isMatch?: boolean;
  onThoughtAdded?: () => void;
}

// Helper function to organize flat thoughts into a tree structure
const organizeThoughtsTree = (thoughts: Thought[] | undefined): Thought[] => {
  if (!thoughts || !Array.isArray(thoughts)) {
    return [];
  }

  const thoughtsMap = new Map<string, Thought>();
  const rootThoughts: Thought[] = [];

  // First pass: Create a map and initialize replies array
  thoughts.forEach(thought => {
    thoughtsMap.set(thought.id, { ...thought, replies: [] });
  });

  // Second pass: Build the tree
  thoughts.forEach(thought => {
    const thoughtWithReplies = thoughtsMap.get(thought.id)!;
    
    if (thought.parent_thought_id) {
      // This is a reply, add it to parent's replies
      const parent = thoughtsMap.get(thought.parent_thought_id);
      if (parent) {
        parent.replies!.push(thoughtWithReplies);
      } else {
        // Parent not found, treat as root
        rootThoughts.push(thoughtWithReplies);
      }
    } else {
      // This is a root thought
      rootThoughts.push(thoughtWithReplies);
    }
  });

  return rootThoughts;
};

// Recursive component to render a thought and its replies
interface ThoughtItemProps {
  thought: Thought;
  currentUserId: string | null;
  editingThoughtId: string | null;
  editContent: string;
  onEdit: (thought: Thought) => void;
  onSaveEdit: (thoughtId: string) => void;
  onCancelEdit: () => void;
  onDelete: (thoughtId: string) => void;
  onReply: (thought: Thought) => void;
  setEditContent: (content: string) => void;
  depth?: number;
}

const ThoughtItem = ({ 
  thought, 
  currentUserId, 
  editingThoughtId, 
  editContent,
  onEdit, 
  onSaveEdit, 
  onCancelEdit,
  onDelete, 
  onReply,
  setEditContent,
  depth = 0 
}: ThoughtItemProps) => {
  return (
    <div className={depth > 0 ? "ml-8 mt-3 border-l-2 border-muted pl-4" : ""}>
      <div className="border rounded-lg p-4 relative bg-card">
        {/* Edit/Delete buttons for own thoughts */}
        {thought.user_id && currentUserId && thought.user_id === currentUserId && editingThoughtId !== thought.id && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(thought)}
              className="h-7 w-7 p-0 hover:bg-muted/70"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(thought.id)}
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
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onSaveEdit(thought.id)}
                    disabled={!editContent.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground/90 pr-16 mb-2">{thought.content}</p>
                {/* Reply button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(thought)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recursively render replies */}
      {thought.replies && thought.replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {thought.replies.map((reply) => (
            <ThoughtItem
              key={reply.id}
              thought={reply}
              currentUserId={currentUserId}
              editingThoughtId={editingThoughtId}
              editContent={editContent}
              onEdit={onEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
              onReply={onReply}
              setEditContent={setEditContent}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ThoughtsModal = ({ open, onOpenChange, postId, postTitle, thoughts, isEvent = false, isHealerProfile = false, isMatch = false, onThoughtAdded }: ThoughtsModalProps) => {
  const [newThought, setNewThought] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingThoughtId, setEditingThoughtId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingToThought, setReplyingToThought] = useState<Thought | null>(null);
  
  // Organize thoughts into tree structure
  const organizedThoughts = organizeThoughtsTree(thoughts);
  
  // Debug logging
  console.log("ThoughtsModal rendered with:", { postId, postTitle, isEvent, thoughtsCount: thoughts?.length, thoughts, organizedThoughts });

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
      // Use the appropriate function based on context (match, event, healer profile, or post)
      let result;
      if (isMatch) {
        result = await createMatchThought(postId, newThought, replyingToThought?.id);
      } else if (isHealerProfile) {
        result = await createHealerProfileThought(postId, newThought, replyingToThought?.id);
      } else if (isEvent) {
        result = await createEventThought(postId, newThought, replyingToThought?.id);
      } else {
        result = await createThought(postId, newThought, replyingToThought?.id);
      }
      
      if (result.success) {
        toast.success(replyingToThought ? "Reply added successfully!" : "Thought shared successfully!");
        setNewThought("");
        setReplyingToThought(null); // Clear reply state
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

  const handleReplyToThought = (thought: Thought) => {
    setReplyingToThought(thought);
    // Focus the textarea (optional, could add a ref for this)
  };

  const handleCancelReply = () => {
    setReplyingToThought(null);
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
            {/* Replying indicator */}
            {replyingToThought && (
              <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                <div className="flex items-center space-x-2">
                  <Reply className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Replying to <span className="font-medium text-foreground">{replyingToThought.author.name}</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelReply}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Textarea
              placeholder={replyingToThought ? "Write your reply..." : "Share your thoughts..."}
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
                {isSubmitting ? "Sharing..." : replyingToThought ? "Post Reply" : "Share Thought"}
              </Button>
            </div>
          </div>

          {/* Existing thoughts */}
          <div className="space-y-4">
            {organizedThoughts && organizedThoughts.length > 0 ? (
              organizedThoughts.map((thought) => (
                <ThoughtItem
                  key={thought.id}
                  thought={thought}
                  currentUserId={currentUserId}
                  editingThoughtId={editingThoughtId}
                  editContent={editContent}
                  onEdit={handleEditThought}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onDelete={handleDeleteThought}
                  onReply={handleReplyToThought}
                  setEditContent={setEditContent}
                />
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
