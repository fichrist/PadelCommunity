import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Upload, X, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

// Import background image
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";

const CreateEvent = () => {
  const navigate = useNavigate();
  const eventImageRef = useRef<HTMLInputElement>(null);
  const backgroundImageRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState("");
  const [backgroundImagePreview, setBackgroundImagePreview] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEventImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Handle event creation logic here
    console.log({
      title,
      description,
      location,
      date,
      time,
      tags,
      eventImage,
      backgroundImage
    });
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      {/* Translucent overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
            <p className="text-muted-foreground mt-2">Share your spiritual gathering with the community</p>
          </div>

          <Card className="bg-card/90 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Event Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="text-sm font-medium text-foreground">Event Title</label>
                <Input
                  placeholder="Enter your event title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="text-sm font-medium text-foreground">Event Description</label>
                <Textarea
                  placeholder="Describe your event, what participants can expect, and any special instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Time</label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input
                  placeholder="Enter event location (address, venue name, or 'Online')..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Event Image Upload */}
              <div>
                <label className="text-sm font-medium text-foreground">Event Image</label>
                <div className="mt-2">
                  <input
                    ref={eventImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEventImageChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => eventImageRef.current?.click()}
                    className="w-full h-32 border-dashed"
                  >
                    {eventImagePreview ? (
                      <img 
                        src={eventImagePreview} 
                        alt="Event preview" 
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload event image</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Background Image Upload */}
              <div>
                <label className="text-sm font-medium text-foreground">Background Image (for event page)</label>
                <div className="mt-2">
                  <input
                    ref={backgroundImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => backgroundImageRef.current?.click()}
                    className="w-full h-32 border-dashed"
                  >
                    {backgroundImagePreview ? (
                      <img 
                        src={backgroundImagePreview} 
                        alt="Background preview" 
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload background image</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-foreground">Tags</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    placeholder="Add a tag (e.g., Meditation, Sound Healing)..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
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
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!title.trim() || !description.trim() || !date || !time || !location.trim()}
                  className="min-w-[120px]"
                >
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;