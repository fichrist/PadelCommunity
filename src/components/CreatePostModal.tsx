import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Share2, X } from "lucide-react";
import { useState } from "react";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
  const [postType, setPostType] = useState<"event" | "share">("share");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

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
    // Handle post creation logic here
    console.log({ postType, title, content, location, tags });
    onOpenChange(false);
    // Reset form
    setTitle("");
    setContent("");
    setLocation("");
    setTags([]);
    setNewTag("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Post Type Selection */}
          <div className="flex space-x-2">
            <Button
              variant={postType === "share" ? "default" : "outline"}
              size="sm"
              onClick={() => setPostType("share")}
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button
              variant={postType === "event" ? "default" : "outline"}
              size="sm"
              onClick={() => setPostType("event")}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Event</span>
            </Button>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground">
              {postType === "event" ? "Event Title" : "Share Title"}
            </label>
            <Input
              placeholder={postType === "event" ? "Enter event title..." : "Enter share title..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-foreground">
              {postType === "event" ? "Event Description" : "Your Thoughts"}
            </label>
            <Textarea
              placeholder={postType === "event" ? "Describe your event..." : "Share your thoughts..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* Location (Events only) */}
          {postType === "event" && (
            <div>
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input
                placeholder="Enter event location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-foreground">Tags</label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag.toLowerCase().replace(/\s+/g, '')}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>
              {postType === "event" ? "Create Event" : "Share Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;