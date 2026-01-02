import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentProfile } from "@/lib/profiles";
import { toast } from "sonner";

const SPECIALTY_OPTIONS = [
  "Sound Healing",
  "Crystal Healing",
  "Reiki",
  "Energy Healing",
  "Meditation",
  "Yoga",
  "Breathwork",
  "Shamanic Healing",
  "Chakra Balancing",
  "Spiritual Coaching",
  "Past Life Regression",
  "Tarot Reading",
  "Astrology",
  "Herbalism",
  "Aromatherapy"
];

const EditHealerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
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
        setSpecialties(healerProfile.specialties || []);
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

  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
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
        specialties,
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

            {/* Specialties */}
            <div className="space-y-2">
              <Label>Specialties</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={specialties.includes(specialty) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                    {specialties.includes(specialty) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Click to select specialties ({specialties.length} selected)
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
