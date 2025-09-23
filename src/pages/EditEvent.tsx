import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, X, Plus, Upload, Calendar, MapPin, Image as ImageIcon, Users, MessageCircle, User, Search, Video } from "lucide-react";
import { toast } from "sonner";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";

// Import images
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";
import davidProfile from "@/assets/david-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import phoenixProfile from "@/assets/phoenix-profile.jpg";

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [time, setTime] = useState("");
  const [prices, setPrices] = useState<{text: string, amount: string}[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [eventVideo, setEventVideo] = useState<string | null>(null);

  const eventData = {
    "1": {
      id: "1",
      title: "Full Moon Sound Healing Ceremony",
      description: "Experience the healing power of crystal bowls, gongs, and ancient chants in our sacred moonlight ceremony.",
      fullDescription: "Join us for a deeply transformative sound healing experience that combines the mystical energy of the full moon with ancient healing frequencies. This ceremony features crystal singing bowls tuned to specific chakra frequencies, Tibetan gongs, and sacred chants that have been used for centuries to promote healing and spiritual awakening.",
      image: soundHealingEvent,
      date: "March 15, 2024",
      dateTo: "",
      time: "7:00 PM - 9:30 PM",
      location: "Sacred Grove Sanctuary, Sedona AZ",
      prices: [{text: "Regular", amount: "65"}, {text: "Early Bird", amount: "55"}],
      tags: ["Sound Healing", "Full Moon", "Chakra Alignment"],
    },
    "2": {
      id: "2",
      title: "Crystal Healing Workshop for Beginners",
      description: "Learn to select, cleanse, and work with crystals for healing, protection, and spiritual growth.",
      fullDescription: "Discover the ancient art of crystal healing in this comprehensive beginner's workshop. You'll learn about the metaphysical properties of different crystals, how to choose the right stones for your needs, and various cleansing and charging techniques.",
      image: crystalWorkshopEvent,
      date: "April 2-4, 2024",
      dateTo: "",
      time: "10:00 AM - 4:00 PM",
      location: "Crystal Cave Studio, Asheville NC",
      prices: [{text: "3-Day Workshop", amount: "225"}],
      tags: ["Crystal Healing", "Beginner Friendly", "Hands-on Workshop"],
    }
  };

  const event = eventData[eventId as keyof typeof eventData];

  // Prefill data when component loads
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setFullDescription(event.fullDescription);
      setLocation(event.location);
      setDate(event.date);
      setDateTo(event.dateTo || "");
      setTime(event.time);
      setPrices(event.prices || []);
      setTags(event.tags);
      setEventImage(event.image);
      // No default video
      setEventVideo(null);
    }
  }, [event]);

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddPrice = () => {
    setPrices([...prices, {text: "", amount: ""}]);
  };

  const handleRemovePrice = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index: number, field: 'text' | 'amount', value: string) => {
    const updatedPrices = prices.map((price, i) => 
      i === index ? { ...price, [field]: value } : price
    );
    setPrices(updatedPrices);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEventImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEventVideo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !location.trim() || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Here you would typically save the event
    console.log("Updating event:", {
      title,
      description,
      fullDescription,
      location,
      date,
      dateTo,
      time,
      prices,
      tags,
      eventImage,
      eventVideo
    });
    
    toast.success("Event updated successfully!");
    navigate(`/eventhealermode/${eventId}`);
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
              <h1 className="text-2xl font-bold text-foreground font-comfortaa">Edit Event</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/eventhealermode/${eventId}`)}
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
              <CardTitle className="text-lg font-semibold">Edit Event Details</CardTitle>
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
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief event description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px] resize-none bg-background/50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="fullDescription">Full Description *</Label>
                  <Textarea
                    id="fullDescription"
                    placeholder="Detailed event description..."
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
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
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      placeholder="Event date..."
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dateTo">Date To (Optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateTo"
                      placeholder="End date (optional)..."
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    placeholder="Event time..."
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Prices (€)</Label>
                  <div className="space-y-2 mt-2">
                    {prices.map((price, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Description (e.g., Regular, Early Bird)..."
                          value={price.text}
                          onChange={(e) => handlePriceChange(index, 'text', e.target.value)}
                          className="flex-1 bg-background/50"
                        />
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground mr-2">€</span>
                          <Input
                            placeholder="0.00"
                            value={price.amount}
                            onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
                            className="w-24 bg-background/50"
                            type="number"
                            step="0.01"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePrice(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddPrice}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Price Option
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image and Video Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Event Image</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
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
                  <Label>Event Video</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="event-video"
                    />
                    <label htmlFor="event-video" className="cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background/30">
                        {eventVideo ? (
                          <video src={eventVideo} className="w-full h-32 object-cover rounded-lg" controls />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Video className="h-8 w-8 mb-2" />
                            <span className="text-sm">Upload event video</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Event Tags</Label>
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
                <Button variant="outline" onClick={() => navigate(`/eventhealermode/${eventId}`)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="min-w-32">
                  Update Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;