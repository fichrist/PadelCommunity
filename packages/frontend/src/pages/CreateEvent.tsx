import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, X, Plus, Upload, Calendar, MapPin, Image as ImageIcon, Users, MessageCircle, User, Search, Video, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";
import CreateDropdown from "@/components/CreateDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { createEvent, updateEvent, getEventById } from "@/lib/events";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isEditMode = searchParams.get('edit') === 'true';
  const eventId = searchParams.get('eventId');
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [selectedPlaceData, setSelectedPlaceData] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateToPickerOpen, setDateToPickerOpen] = useState(false);
  const [prices, setPrices] = useState<{text: string, amount: string}[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [eventVideo, setEventVideo] = useState<string | null>(null);
  const [additionalOptions, setAdditionalOptions] = useState<{name: string, price: string, description: string}[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string }[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);

  // Fetch available tags from database
  useEffect(() => {
    const fetchTags = async () => {
      const { data: dbTags } = await (supabase as any)
        .from('tags')
        .select('id, name')
        .order('name');
      
      if (dbTags) {
        setAvailableTags(dbTags as any);
      }
    };
    
    fetchTags();
  }, []);

  // Fetch event data when in edit mode
  useEffect(() => {
    const fetchEventData = async () => {
      if (isEditMode && eventId) {
        const dbEvent = await getEventById(eventId);
        if (dbEvent) {
          setTitle(dbEvent.title || "");
          setDescription(dbEvent.description || "");
          setFullDescription(dbEvent.full_description || "");
          setLocationAddress(dbEvent.formatted_address || "");
          setDate(dbEvent.start_date ? new Date(dbEvent.start_date) : undefined);
          setDateTo(dbEvent.end_date ? new Date(dbEvent.end_date) : undefined);
          setTime(dbEvent.time || "");
          setPrices(dbEvent.prices || []);
          setTags(dbEvent.tags || []);
          setAdditionalOptions(dbEvent.additional_options || []);
          setEventImage(dbEvent.image_url || null);
          setEventVideo(dbEvent.video_url || null);
        }
      }
    };
    
    fetchEventData();
  }, [isEditMode, eventId]);

  // Legacy: Prefill data from URL params (keeping for backwards compatibility)
  useEffect(() => {
    if (isEditMode && !eventId) {
      const titleParam = searchParams.get('title');
      const descriptionParam = searchParams.get('description');
      const fullDescriptionParam = searchParams.get('fullDescription');
      const dateParam = searchParams.get('date');
      const dateToParam = searchParams.get('dateTo');
      const timeParam = searchParams.get('time');
      const pricesParam = searchParams.get('prices');
      const additionalOptionsParam = searchParams.get('additionalOptions');

      if (titleParam) setTitle(titleParam);
      if (descriptionParam) setDescription(descriptionParam);
      if (fullDescriptionParam) setFullDescription(fullDescriptionParam);
      if (dateParam) setDate(new Date(dateParam));
      if (dateToParam) setDateTo(new Date(dateToParam));
      if (timeParam) setTime(timeParam);
      if (pricesParam) {
        try {
          setPrices(JSON.parse(pricesParam));
        } catch (e) {
          setPrices([]);
        }
      }
      if (additionalOptionsParam) {
        try {
          setAdditionalOptions(JSON.parse(additionalOptionsParam));
        } catch (e) {
          setAdditionalOptions([]);
        }
      }
    }
  }, [searchParams, isEditMode]);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
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

  const handleAddOption = () => {
    setAdditionalOptions([...additionalOptions, {name: "", price: "", description: ""}]);
  };

  const handleRemoveOption = (index: number) => {
    setAdditionalOptions(additionalOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'name' | 'price' | 'description', value: string) => {
    const updatedOptions = additionalOptions.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    );
    setAdditionalOptions(updatedOptions);
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

  const handlePlaceSelected = (place: any) => {
    console.log("Place selected:", place);
    setSelectedPlaceData(place);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !locationAddress.trim() || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Prepare event data
    const eventData: any = {
      title: title.trim(),
      description: description.trim(),
      full_description: fullDescription.trim(),
      start_date: date ? format(date, 'yyyy-MM-dd') : undefined,
      end_date: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
      time: time.trim() || undefined,
      prices: prices,
      tags: tags,
      additional_options: additionalOptions,
      image_url: eventImage || undefined,
      video_url: eventVideo || undefined
    };

    // If a place was selected, parse and add location fields
    if (selectedPlaceData) {
      console.log("Saving address from selectedPlaceData:", selectedPlaceData);
      
      // Add formatted address and place_id
      eventData.formatted_address = selectedPlaceData.formatted_address;
      eventData.place_id = selectedPlaceData.place_id;
      
      // Extract coordinates
      if (selectedPlaceData.geometry?.location) {
        eventData.latitude = typeof selectedPlaceData.geometry.location.lat === 'function' 
          ? selectedPlaceData.geometry.location.lat() 
          : selectedPlaceData.geometry.location.lat;
        eventData.longitude = typeof selectedPlaceData.geometry.location.lng === 'function'
          ? selectedPlaceData.geometry.location.lng()
          : selectedPlaceData.geometry.location.lng;
      }
      
      // Parse address components
      if (selectedPlaceData.address_components) {
        selectedPlaceData.address_components.forEach((component: any) => {
          const types = component.types;
          
          if (types.includes('route')) {
            eventData.street_name = component.long_name;
          }
          if (types.includes('locality')) {
            eventData.city = component.long_name;
          }
          if (types.includes('postal_code')) {
            eventData.postal_code = component.long_name;
          }
          if (types.includes('country')) {
            eventData.country = component.long_name;
          }
        });
      }
    }

    try {
      if (isEditMode && eventId) {
        // Update existing event
        const result = await updateEvent(eventId, eventData as any);
        
        if (result) {
          toast.success("Event updated successfully!");
          navigate(`/eventhealermode/${eventId}`);
        } else {
          toast.error("Failed to update event. Please try again.");
        }
      } else {
        // Create new event
        const result = await createEvent(eventData as any);
        
        if (result) {
          toast.success("Event created successfully!");
          navigate(`/event/${result.id}`);
        } else {
          toast.error("Failed to create event. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
        {/* Page Title */}
        <div className="bg-transparent sticky top-[57px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground font-comfortaa">
                  {isEditMode ? "Edit Event" : "Create Event"}
                </h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => isEditMode && eventId ? navigate(`/eventhealermode/${eventId}`) : navigate('/')}
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
                {isEditMode ? "Edit Event Details" : "Event Details"}
              </CardTitle>
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
                  <LocationAutocomplete
                    value={locationAddress}
                    onChange={setLocationAddress}
                    onPlaceSelected={handlePlaceSelected}
                    placeholder="Start typing event address..."
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Select from suggestions to automatically save location details
                  </p>
                </div>
                
                <div>
                  <Label>Date *</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background/50",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, 'd MMMM yyyy') : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          setDatePickerOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Date To (Optional)</Label>
                  <Popover open={dateToPickerOpen} onOpenChange={setDateToPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background/50",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'd MMMM yyyy') : "Select end date (optional)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={(newDate) => {
                          setDateTo(newDate);
                          setDateToPickerOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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

              {/* Additional Options */}
              <div className="md:col-span-2">
                <Label>Additional Options</Label>
                <div className="space-y-3 mt-2">
                  {additionalOptions.map((option, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 bg-background/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Option name..."
                          value={option.name}
                          onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                          className="bg-background/50"
                        />
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground mr-2">€</span>
                          <Input
                            placeholder="0.00"
                            value={option.price}
                            onChange={(e) => handleOptionChange(index, 'price', e.target.value)}
                            className="bg-background/50"
                            type="number"
                            step="0.01"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Description..."
                            value={option.description}
                            onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                            className="flex-1 bg-background/50"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Additional Option
                  </Button>
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
              <div className="space-y-2">
                <Label>Event Tags</Label>
                <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tagsOpen}
                      className="w-full justify-between"
                    >
                      {tags.length > 0
                        ? `${tags.length} tag${tags.length === 1 ? '' : 's'} selected`
                        : "Select tags..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search tags..." />
                      <CommandList>
                        <CommandEmpty>No tag found.</CommandEmpty>
                        <CommandGroup>
                          {availableTags.map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => {
                                toggleTag(tag.name);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  tags.includes(tag.name) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {tag.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Display selected tags as badges */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">
                  {tags.length} tag{tags.length === 1 ? '' : 's'} selected
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => isEditMode && eventId ? navigate(`/eventhealermode/${eventId}`) : navigate('/')}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="min-w-32">
                  {isEditMode ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </>
  );
};

export default CreateEvent;
