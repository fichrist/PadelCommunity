import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentProfile } from "@/lib/profiles";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EditHealerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string }[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [fullBio, setFullBio] = useState("");
  const [video, setVideo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      setUserId(user.id);

      // Fetch all tags from database
      const { data: tagsData } = await (supabase as any)
        .from('tags')
        .select('id, name')
        .order('name');
      
      if (tagsData) {
        setAvailableTags(tagsData as any);
      }

      // Get profile for default name
      const profile = await getCurrentProfile();
      if (profile) {
        setName(profile.display_name || profile.first_name || "");
      }

      // Check if healer profile exists
      const { data: healerProfile } = await (supabase as any)
        .from('healer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (healerProfile) {
        setName(healerProfile.name || name);
        setRole(healerProfile.role || "");
        setTags(healerProfile.tags || []);
        setCompany(healerProfile.company || "");
        setBio(healerProfile.bio || "");
        setFullBio(healerProfile.full_bio || "");
        setVideo(healerProfile.video || "");
        setPhoneNumber(healerProfile.phone_number || "");
        setEmail(healerProfile.email || "");
        setFacebook(healerProfile.facebook || "");
        setInstagram(healerProfile.instagram || "");
      }
    };

    fetchData();
  }, []);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSave = async () => {
    if (!role.trim()) {
      toast.error("Please enter a role");
      return;
    }

    setLoading(true);

    try {
      // Check if healer profile exists
      const { data: existing } = await (supabase as any)
        .from('healer_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      const profileData = {
        user_id: userId,
        name: name.trim(),
        role: role.trim(),
        tags,
        company: company.trim() || null,
        bio: bio.trim(),
        full_bio: fullBio.trim(),
        video: video.trim() || null,
        phone_number: phoneNumber.trim() || null,
        email: email.trim() || null,
        facebook: facebook.trim() || null,
        instagram: instagram.trim() || null
      };

      if (existing) {
        // Update existing
        const { error } = await (supabase as any)
          .from('healer_profiles')
          .update(profileData)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await (supabase as any)
          .from('healer_profiles')
          .insert(profileData);

        if (error) throw error;
      }

      toast.success("Healer profile saved successfully!");
      navigate(`/healer/${userId}`);
    } catch (error: any) {
      console.error("Error saving healer profile:", error);
      toast.error(error.message || "Failed to save healer profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Healer Profile</CardTitle>
            <CardDescription>
              Set up your healer profile to showcase your services and expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name as you want it displayed"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role/Title *</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Sound Healer, Energy Practitioner"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={tagsOpen}
                    className="w-full justify-between"
                  >
                    {tags.length > 0
                      ? `${tags.length} selected`
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

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company/Business Name</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Optional"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief introduction (1-2 sentences)"
                className="min-h-[80px]"
              />
            </div>

            {/* Full Bio */}
            <div className="space-y-2">
              <Label htmlFor="fullBio">Full Bio</Label>
              <Textarea
                id="fullBio"
                value={fullBio}
                onChange={(e) => setFullBio(e.target.value)}
                placeholder="Tell your story, share your journey, and describe your approach"
                className="min-h-[200px]"
              />
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Facebook username or page"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@yourinstagram"
                />
              </div>
            </div>

            {/* Video */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="video">Video URL</Label>
              <Input
                id="video"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                placeholder="YouTube or Vimeo URL (optional)"
              />
              <p className="text-sm text-muted-foreground">
                Share an introduction video to help people connect with you
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditHealerProfile;
