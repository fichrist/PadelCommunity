import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  share: {
    title: string;
    thought?: string;
    description: string;
    tags: string[];
    url?: string;
    youtubeUrl?: string;
  } | null;
  onUpdate: (updatedShare: any) => void;
  onDelete: () => void;
}

const EditShareModal = ({ open, onOpenChange, share, onUpdate, onDelete }: EditShareModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const { toast } = useToast();

  // Predefined list of available tags
  const availableTags = [
    "Meditation", "Spirituality", "Healing", "Mindfulness", "Yoga",
    "Crystals", "Energy Work", "Chakras", "Sound Healing", "Reiki",
    "Tarot", "Astrology", "Manifestation", "Wisdom", "Growth",
    "Community", "Nature", "Peace", "Love", "Light"
  ];

  // Populate form when share data changes
  useEffect(() => {
    if (share) {
      setTitle(share.title);
      setDescription(share.description);
      setTags(share.tags);
      setSelectedTag("");
    }
  }, [share]);

  const handleAddSelectedTag = () => {
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
      setSelectedTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpdate = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and description.",
        variant: "destructive",
      });
      return;
    }

    // Only update title, description, and tags
    const updatedShare = {
      title,
      description,
      tags
    };
    
    onUpdate(updatedShare);
    
    toast({
      title: "Share Updated",
      description: "Your share has been updated successfully.",
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this share? This action cannot be undone.")) {
      onDelete();
      toast({
        title: "Share Deleted",
        description: "Your share has been deleted.",
      });
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setSelectedTag("");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-md border border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Share</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              placeholder="Share title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              placeholder="What's on your mind? Share your thoughts, insights, or wisdom..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[200px] resize-none bg-background/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex items-center space-x-2 mb-2">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="flex-1 bg-background/50">
                  <SelectValue placeholder="Select a tag..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.filter(tag => !tags.includes(tag)).map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddSelectedTag} size="sm" variant="outline" disabled={!selectedTag}>
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
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Share</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Update Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditShareModal;
