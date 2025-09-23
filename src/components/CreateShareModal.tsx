import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Link, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateShareModal = ({ open, onOpenChange }: CreateShareModalProps) => {
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

  const handleAddSelectedTag = () => {
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
      setSelectedTag("");
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
    console.log("Creating share:", { title, content, url, image, video, tags });
    
    toast({
      title: "Share Created",
      description: "Your share has been posted to the community.",
    });

    // Reset form and close modal
    setTitle("");
    setContent("");
    setUrl("");
    setImage(null);
    setVideo(null);
    setTags([]);
    setSelectedTag("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-md border border-border">
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