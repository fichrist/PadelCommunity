import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Link, Image, Video, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  share: {
    title: string;
    thought: string;
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
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
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
      setContent(share.thought + (share.description ? '\n\n' + share.description : ''));
      setUrl(share.url || share.youtubeUrl || "");
      setTags(share.tags);
      setSelectedTag("");
      setImage(null);
      setVideo(null);
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
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically update the share
    const updatedShare = {
      title,
      thought: content,
      description: "",
      url,
      image,
      video,
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
    setContent("");
    setUrl("");
    setImage(null);
    setVideo(null);
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
              className="min-h-[200px] resize-none bg-background/50"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Add a URL (optional)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Upload Image</span>
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="bg-background/50"
              />
              {image && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {image.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Upload Video</span>
              </label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
                className="bg-background/50"
              />
              {video && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {video.name}
                </p>
              )}
            </div>
          </div>
          
          <div>
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