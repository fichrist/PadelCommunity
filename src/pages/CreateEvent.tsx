import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, X, Plus, Upload, Calendar, MapPin, Image as ImageIcon, Users, MessageCircle, User, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'event' | 'background') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'event') {
          setEventImage(result);
        } else {
          setBackgroundImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !location.trim() || !startDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save the event
    console.log("Creating event:", {
      title,
      description,
      location,
      startDate,
      endDate,
      tags,
      eventImage,
      backgroundImage
    });
    
    toast({
      title: "Event Created",
      description: "Your event has been created successfully.",
    });

    navigate('/');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
        {/* Top Navigation Bar */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Logo + App Name */}
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <img src={spiritualLogo} alt="Spirit" className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-primary font-comfortaa">Spirit</span>
              </div>
              
              {/* Center: Navigation Icons */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/')}
                  >
                    <Users className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/events')}
                  >
                    <Calendar className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/people')}
                  >
                    <User className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                    onClick={() => navigate('/chat')}
                  >
                    <MessageCircle className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
              </div>
              
              {/* Right: Search Bar + Create Button + Profile */}
              <div className="flex items-center space-x-3">
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-muted rounded-full px-3 py-2 w-64">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input 
                    type="text" 
                    placeholder="search..." 
                    className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-muted-foreground"
                  />
                </div>
                <CreateDropdown onCreateShare={() => {}} />
                <NotificationDropdown />
                <ProfileDropdown userImage={elenaProfile} userName="Elena Moonchild" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="bg-transparent sticky top-[73px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">Create Event</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
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
              <CardTitle className="text-lg font-semibold">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] resize-none bg-background/50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Event location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Event Image</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'event')}
                      className="hidden"
                      id="event-image"
                    />
                    <label htmlFor="event-image" className="cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background/30">
                        {eventImage ? (
                          <img src={eventImage} alt="Event" className="w-full h-32 object-cover rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mb-2" />
                            <span className="text-sm">Upload event image</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Background Image</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'background')}
                      className="hidden"
                      id="background-image"
                    />
                    <label htmlFor="background-image" className="cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background/30">
                        {backgroundImage ? (
                          <img src={backgroundImage} alt="Background" className="w-full h-32 object-cover rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mb-2" />
                            <span className="text-sm">Upload background image</span>
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
                <div className="flex items-center space-x-2 mt-2 mb-2">
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

              {/* Submit Button */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="min-w-32">
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