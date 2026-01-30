import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Upload, X, Trophy, Shield, Download, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase, getUserIdFromStorage, createFreshSupabaseClient, getDataClient } from "@/integrations/supabase/client";

import { toast } from "sonner";
import colorfulSkyBackground from "@/assets/colorful-sky-background.jpg";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { getCurrentProfile, updateProfile, uploadAvatar, deleteAvatar } from "@/lib/profiles";
import TPMemberSetupDialog from "@/components/TPMemberSetupDialog";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [ranking, setRanking] = useState<string>("");
  const [tpMembershipNumber, setTpMembershipNumber] = useState<string>("");
  const [tpUserId, setTpUserId] = useState<string>("");
  const [playtomicUserId, setPlaytomicUserId] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selectedPlaceData, setSelectedPlaceData] = useState<any>(null);

  // TP Member Setup Dialog
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log("[fetchUserData] Starting fetch...");

      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();
      console.log("[fetchUserData] getUserIdFromStorage() completed");

      console.log("[fetchUserData] User ID:", userId?.substring(0, 8) || null);

      if (userId) {
        setEmail(""); // Email not needed for display

        // Fetch profile from profiles table
        console.log("[fetchUserData] Fetching profile...");
        const profile = await getCurrentProfile();

        console.log("[fetchUserData] Profile:", profile);

        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setPhoneNumber(profile.phone_number || "");
          setRanking(profile.ranking || "");
          setTpMembershipNumber(profile.tp_membership_number || "");
          setTpUserId(profile.tp_user_id || "");
          setPlaytomicUserId(profile.playtomic_user_id || "");
          setAvatarUrl(profile.avatar_url || "");
          // Get address from profile fields
          setCountry(profile.formatted_address || "");
          setCity(profile.city || "");
          setStreet(profile.street_name || "");
          setPostalCode(profile.postal_code || "");

          // Show setup dialog if tp_user_id is empty
          if (!profile.tp_user_id) {
            setShowSetupDialog(true);
          }
        }
      }

      console.log("[fetchUserData] Profile fetch completed");
    } catch (error) {
      console.error("[fetchUserData] Error:", error);
      toast.error("Failed to load user data");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file);
      if (url) {
        setAvatarUrl(url);
        toast.success("Profile picture updated!");
        // Trigger a refresh of the profile in the nav
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        toast.error("Failed to upload avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);
    try {
      const success = await deleteAvatar();
      if (success) {
        setAvatarUrl("");
        toast.success("Profile picture removed");
        // Trigger a refresh of the profile in the nav
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        toast.error("Failed to remove avatar");
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePlaceSelected = (place: any) => {
    console.log("Place selected:", place);
    // Store the place data in state - will be saved when user clicks "Save Changes"
    setSelectedPlaceData(place);
    console.log("Place data stored in state");
  };

  const handleSave = async () => {
    setLoading(true);
    console.log("Starting save process...");
    try {
      // Prepare update data
      // Validate mandatory fields
      if (!ranking) {
        toast.error("Ranking is required");
        setLoading(false);
        return;
      }

      const updates: any = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        ranking: ranking,
        tp_membership_number: tpMembershipNumber,
        tp_user_id: tpUserId ? parseInt(tpUserId) : null,
      };

      console.log("Updates to save:", updates);

      // If a place was selected, parse and add location fields
      if (selectedPlaceData) {
        console.log("Saving address from selectedPlaceData:", selectedPlaceData);

        // Parse address components
        updates.formatted_address = selectedPlaceData.formatted_address;
        updates.place_id = selectedPlaceData.place_id;
        
        // Extract coordinates
        if (selectedPlaceData.geometry?.location) {
          updates.latitude = typeof selectedPlaceData.geometry.location.lat === 'function' 
            ? selectedPlaceData.geometry.location.lat() 
            : selectedPlaceData.geometry.location.lat;
          updates.longitude = typeof selectedPlaceData.geometry.location.lng === 'function'
            ? selectedPlaceData.geometry.location.lng()
            : selectedPlaceData.geometry.location.lng;
        }
        
        // Parse address components
        if (selectedPlaceData.address_components) {
          selectedPlaceData.address_components.forEach((component: any) => {
            const types = component.types;
            
            if (types.includes('route')) {
              updates.street_name = component.long_name;
            }
            if (types.includes('locality')) {
              updates.city = component.long_name;
            }
            if (types.includes('postal_code')) {
              updates.postal_code = component.long_name;
            }
            if (types.includes('country')) {
              updates.country = component.long_name;
            }
          });
        }
      }

      // Update profile with all data
      console.log("Calling updateProfile with:", updates);
      const profileSuccess = await updateProfile(updates);

      console.log("Update result:", profileSuccess);

      if (!profileSuccess) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");

      // Refresh the profile data to show updated values
      await fetchUserData();

      // Navigate to index page
      navigate('/');
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();
      if (!userId) {
        toast.error("Je moet ingelogd zijn om je gegevens te downloaden");
        return;
      }

      // Use fresh client to avoid stuck state
      const client = createFreshSupabaseClient();

      // Fetch all user data
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: enrollments } = await client
        .from('event_enrollments')
        .select('*')
        .eq('user_id', userId);

      const { data: messages } = await client
        .from('messages')
        .select('*')
        .eq('sender_id', userId);

      const userData = {
        exportDate: new Date().toISOString(),
        account: {
          userId: userId,
        },
        profile: profile,
        event_enrollments: enrollments,
        messages_sent: messages,
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `padel-community-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Je gegevens zijn gedownload");
    } catch (error) {
      console.error("Error downloading data:", error);
      toast.error("Kon gegevens niet downloaden");
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      // Delete the auth user via RPC (cascades to profile + triggers array cleanup)
      const { error: deleteError } = await getDataClient().rpc('delete_own_account');

      if (deleteError) {
        console.error("Error deleting account:", deleteError);
        toast.error("Kon account niet verwijderen. Neem contact met ons op.");
        return;
      }

      // Clear all local storage and sign out (fire-and-forget, account is already gone)
      localStorage.clear();
      supabase.auth.signOut().catch(() => {});

      toast.success("Je account is verwijderd.");
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Kon account niet verwijderen. Neem contact met ons op.");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <>
        {/* TP Member Setup Dialog */}
        <TPMemberSetupDialog
          open={showSetupDialog}
          onOpenChange={setShowSetupDialog}
          onSaveComplete={fetchUserData}
        />

        {/* Header */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-[57px] z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Community</span>
                </Button>
              </div>
              <h1 className="text-xl font-bold text-foreground font-comfortaa">Profile</h1>
              <div className="w-32"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="bg-card/90 backdrop-blur-sm border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-4 py-4">
                  <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                    <AvatarImage src={avatarUrl} referrerPolicy="no-referrer" />
                    <AvatarFallback className="text-3xl bg-primary/10">
                      {(firstName?.[0] || lastName?.[0]) ? `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() : (email?.[0]?.toUpperCase() || "ME")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    </Button>
                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAvatarRemove}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Upload a profile picture (max 5MB, JPG or PNG)
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      className="bg-background/50"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      className="bg-background/50"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    className="bg-muted/50 cursor-not-allowed" 
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed here. Contact support to update your email address.
                  </p>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel"
                    placeholder="+1 (555) 123-4567" 
                    className="bg-background/50"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Address</h3>
                  
                  <div>
                    <Label htmlFor="country">Address</Label>
                    <LocationAutocomplete
                      value={country}
                      onChange={setCountry}
                      onPlaceSelected={handlePlaceSelected}
                      placeholder="Start typing your address..."
                      className="bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Select from suggestions, then click "Save Changes" to save your address
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <Label htmlFor="ranking">Ranking *</Label>
                  </div>
                  <Input
                    id="ranking"
                    type="text"
                    value={ranking}
                    className="bg-muted/50 cursor-not-allowed"
                    placeholder="Use 'Look for TP Member' to set your ranking"
                    readOnly
                    disabled
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your ranking will be automatically filled when you select your profile from the TP Member lookup above
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playtomicUserId">Playtomic User ID</Label>
                  <Input
                    id="playtomicUserId"
                    type="text"
                    value={playtomicUserId}
                    className="bg-muted/50 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Your ID will be filled in automatically when you post your first match
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                className="min-w-32"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {/* Privacy & Data Management */}
            <Card className="bg-card/90 backdrop-blur-sm border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Privacy & Gegevensbeheer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Onder de GDPR heb je het recht om je gegevens in te zien, te downloaden of te verwijderen.
                  Lees ons{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    privacybeleid
                  </Link>{" "}
                  voor meer informatie.
                </p>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Download je gegevens</h4>
                      <p className="text-xs text-muted-foreground">
                        Download al je persoonlijke gegevens in JSON-formaat
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadData}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-destructive">Account verwijderen</h4>
                      <p className="text-xs text-muted-foreground">
                        Verwijder je account en al je gegevens permanent
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={deletingAccount}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingAccount ? "Verwijderen..." : "Verwijderen"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Account verwijderen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dit kan niet ongedaan worden gemaakt. Al je gegevens worden permanent verwijderd,
                            inclusief je profiel, inschrijvingen en berichten.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuleren</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Ja, verwijder mijn account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
};

export default Profile;
