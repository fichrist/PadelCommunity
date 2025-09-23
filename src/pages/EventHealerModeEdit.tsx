import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X, Plus, Save } from "lucide-react";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Import images
import soundHealingEvent from "@/assets/sound-healing-event.jpg";
import crystalWorkshopEvent from "@/assets/crystal-workshop-event.jpg";

const EventHealerModeEdit = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const eventData = {
    "1": {
      id: "1",
      title: "Full Moon Sound Healing Ceremony",
      description: "Experience the healing power of crystal bowls, gongs, and ancient chants in our sacred moonlight ceremony.",
      fullDescription: "Join us for a deeply transformative sound healing experience that combines the mystical energy of the full moon with ancient healing frequencies. This ceremony features crystal singing bowls tuned to specific chakra frequencies, Tibetan gongs, and sacred chants that have been used for centuries to promote healing and spiritual awakening.",
      image: soundHealingEvent,
      tags: ["Sound Healing", "Full Moon", "Chakra Alignment"],
      comments: "Please bring your own yoga mat and blanket. Water will be provided. Arrive 15 minutes early for check-in.",
      reshareText: "Join us for this magical full moon ceremony! 🌕✨ Limited spots available.",
    },
    "2": {
      id: "2",
      title: "Crystal Healing Workshop for Beginners",
      description: "Learn to select, cleanse, and work with crystals for healing, protection, and spiritual growth.",
      fullDescription: "Discover the ancient art of crystal healing in this comprehensive beginner's workshop. You'll learn about the metaphysical properties of different crystals, how to choose the right stones for your needs, and various cleansing and charging techniques.",
      image: crystalWorkshopEvent,
      tags: ["Crystal Healing", "Beginner Friendly", "Hands-on Workshop"],
      comments: "All materials provided. Comfortable clothing recommended. Lunch included on all three days.",
      reshareText: "Perfect for beginners! Learn the art of crystal healing in beautiful Asheville 💎🌿",
    }
  };

  const event = eventData[eventId as keyof typeof eventData];
  
  const [editedEvent, setEditedEvent] = useState({
    title: event?.title || "",
    description: event?.description || "",
    fullDescription: event?.fullDescription || "",
    tags: event?.tags || [],
    comments: event?.comments || "",
    reshareText: event?.reshareText || "",
  });

  const [newTag, setNewTag] = useState("");

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleSave = () => {
    toast.success("Event updated successfully!");
    navigate(`/eventhealermode/${eventId}`);
  };

  const handleCancel = () => {
    navigate(`/eventhealermode/${eventId}`);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedEvent.tags.includes(newTag.trim())) {
      setEditedEvent(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedEvent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${colorfulSkyBackground})` }}
    >
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
        {/* Top Navigation Bar */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Logo + App Name */}
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <img src={spiritualLogo} alt="Spirit" className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-primary font-comfortaa">Spirit</span>
              </div>
              
              {/* Right: Save and Cancel buttons */}
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-8">
          <div className="max-w-[72%] mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate(`/eventhealermode/${eventId}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
            
            {/* Healer Mode Badge */}
            <div className="flex justify-center mb-4">
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                Healer Mode - Edit Event
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground text-center">
              Edit Event Details
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Event Image */}
            <Card className="overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-64 object-cover"
              />
            </Card>

            {/* Basic Event Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={editedEvent.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={editedEvent.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief event description"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fullDescription">Full Description</Label>
                  <Textarea
                    id="fullDescription"
                    value={editedEvent.fullDescription}
                    onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                    placeholder="Detailed event description"
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Event Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {editedEvent.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-2">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-muted-foreground hover:text-destructive ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="comments">Comments & Instructions</Label>
                  <Textarea
                    id="comments"
                    value={editedEvent.comments}
                    onChange={(e) => handleInputChange('comments', e.target.value)}
                    placeholder="Special instructions, what to bring, etc."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reshareText">Reshare Text</Label>
                  <Textarea
                    id="reshareText"
                    value={editedEvent.reshareText}
                    onChange={(e) => handleInputChange('reshareText', e.target.value)}
                    placeholder="Text that will be used when others share this event"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleCancel} size="lg">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="lg">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHealerModeEdit;