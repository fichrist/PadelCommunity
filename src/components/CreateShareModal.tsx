import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateShareModal = ({ open, onOpenChange }: CreateShareModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save the share
    console.log("Creating share:", { title, content, tags });
    
    toast({
      title: "Share Created",
      description: "Your share has been posted to the community.",
    });

    // Reset form and close modal
    setTitle("");
    setContent("");
    setTags([]);
    setNewTag("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Share</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Share title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50"
            />
          </div>
          
          <div>
            <Textarea
              placeholder="What's on your mind? Share your thoughts, insights, or wisdom..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none bg-background/50"
            />
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 bg-background/50"
              />
              <Button onClick={handleAddTag} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShareModal;