import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X, Search, Link as LinkIcon, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/lib/posts";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Predefined tags for the spiritual community
const AVAILABLE_TAGS = [
  "Meditation",
  "Mindfulness",
  "Yoga",
  "Healing",
  "Spirituality",
  "Energy Work",
  "Chakras",
  "Crystals",
  "Tarot",
  "Astrology",
  "Numerology",
  "Sound Healing",
  "Reiki",
  "Breathwork",
  "Manifestation",
  "Self-Love",
  "Inner Peace",
  "Wellness",
  "Holistic Health",
  "Nature",
  "Gratitude",
  "Transformation",
  "Awakening",
  "Consciousness",
  "Sacred",
  "Ceremony",
  "Ritual",
  "Oracle",
  "Intuition",
  "Soul Journey",
];

const CreatePost = () => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [thought, setThought] = useState("");
  const [url, setUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postVideo, setPostVideo] = useState<string | null>(null);

  const filteredTags = AVAILABLE_TAGS.filter(tag => 
    tag.toLowerCase().includes(searchValue.toLowerCase()) && 
    !selectedTags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchValue("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPostImage(result);
        setPostVideo(null); // Clear video if image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a video file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPostVideo(result);
        setPostImage(null); // Clear image if video is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setPostImage(null);
    setPostVideo(null);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !thought.trim()) {
      toast.error("Please fill in the title and your thought.");
      return;
    }

    try {
      // Save the post to the database
      const result = await createPost({
        title: title.trim(),
        content: thought.trim(),
        url: url.trim() || undefined,
        tags: selectedTags,
        image_url: postImage || undefined,
        video_url: postVideo || undefined,
      });

      if (result.success) {
        toast.success("Post created successfully!");
        navigate('/community');
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
      {/* Page Title */}
      <div className="bg-transparent sticky top-[57px] z-40">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground font-comfortaa">
              Create Post
            </h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/community')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-card/90 backdrop-blur-sm border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Share Your Thoughts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Post Title */}
            <div>
              <Label htmlFor="title">Post Title *</Label>
              <Input
                id="title"
                placeholder="Enter your post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            {/* Post Thought */}
            <div>
              <Label htmlFor="thought">Your Thought *</Label>
              <Textarea
                id="thought"
                placeholder="Share your insights, experiences, or questions with the community..."
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                className="min-h-[200px] resize-none bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Express yourself authentically and share what's on your mind
              </p>
            </div>
            
            {/* URL */}
            <div>
              <Label htmlFor="url">URL (Optional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 bg-background/50"
                  type="url"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share a link related to your post
              </p>
            </div>

            {/* Image and Video Upload */}
            <div>
              <Label>Media (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Add an image or video to your post
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="post-image"
                  />
                  <label htmlFor="post-image" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background/30">
                      {postImage ? (
                        <div className="relative">
                          <img src={postImage} alt="Post" className="w-full h-32 object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveMedia();
                            }}
                            className="absolute top-2 right-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <span className="text-sm">Upload image</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="post-video"
                  />
                  <label htmlFor="post-video" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background/30">
                      {postVideo ? (
                        <div className="relative">
                          <video src={postVideo} className="w-full h-32 object-cover rounded-lg" controls />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveMedia();
                            }}
                            className="absolute top-2 right-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                          <Video className="h-8 w-8 mb-2" />
                          <span className="text-sm">Upload video</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Add relevant tags to help others discover your post
              </p>
              
              {/* Tag Selector */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-background/50"
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Search and select tags...
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search tags..." 
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup>
                        {filteredTags.map((tag) => (
                          <CommandItem
                            key={tag}
                            value={tag}
                            onSelect={() => {
                              handleAddTag(tag);
                              setOpen(false);
                            }}
                          >
                            {tag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/community')}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="min-w-32">
                Publish Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CreatePost;
