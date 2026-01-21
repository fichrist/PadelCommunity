import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Globe, Loader2, X } from "lucide-react";

interface FavoriteUser {
  id: string;
  name: string;
  avatar_url: string | null;
  club_name: string | null;
}

interface ManageRestrictedUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  currentRestrictedUsers: string[] | null;
  organizerId: string;
  onUpdate: () => void;
}

export const ManageRestrictedUsersDialog = ({
  open,
  onOpenChange,
  matchId,
  currentRestrictedUsers,
  organizerId,
  onUpdate,
}: ManageRestrictedUsersDialogProps) => {
  const [favoriteUsers, setFavoriteUsers] = useState<FavoriteUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user's favorites on mount
  useEffect(() => {
    if (open) {
      fetchFavorites();
    }
  }, [open]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      // Get organizer's favorites
      const { data: profile } = await supabase
        .from('profiles')
        .select('favorite_users')
        .eq('id', organizerId)
        .single();

      if (profile?.favorite_users && profile.favorite_users.length > 0) {
        // Fetch favorite users details
        const { data: favorites } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, display_name, avatar_url, club_name')
          .in('id', profile.favorite_users);

        if (favorites) {
          const formattedFavorites = favorites.map(fav => ({
            id: fav.id,
            name: fav.display_name || `${fav.first_name || ''} ${fav.last_name || ''}`.trim() || 'User',
            avatar_url: fav.avatar_url,
            club_name: fav.club_name
          }));
          setFavoriteUsers(formattedFavorites);

          // Set initially selected users (excluding organizer)
          if (currentRestrictedUsers && currentRestrictedUsers.length > 0) {
            const usersWithoutOrganizer = currentRestrictedUsers.filter(id => id !== organizerId);
            setSelectedUsers(usersWithoutOrganizer);
          } else {
            setSelectedUsers([]);
          }
        }
      } else {
        setFavoriteUsers([]);
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let restrictedUsers: string[] | null = null;

      if (selectedUsers.length > 0) {
        // Add organizer to the list
        restrictedUsers = [...selectedUsers, organizerId];
      }
      // If selectedUsers is empty, restrictedUsers stays null (public match)

      const { error } = await supabase
        .from('matches')
        .update({ restricted_users: restrictedUsers })
        .eq('id', matchId);

      if (error) throw error;

      if (restrictedUsers === null) {
        toast.success('Match is now visible to everyone');
      } else {
        toast.success(`Match restricted to ${selectedUsers.length} user${selectedUsers.length === 1 ? '' : 's'}`);
      }

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating restricted users:', error);
      toast.error(error.message || 'Failed to update match visibility');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMakePublic = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('matches')
        .update({ restricted_users: null })
        .eq('id', matchId);

      if (error) throw error;

      toast.success('Match is now visible to everyone');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error making match public:', error);
      toast.error(error.message || 'Failed to make match public');
    } finally {
      setIsSaving(false);
    }
  };

  const isPublic = !currentRestrictedUsers || currentRestrictedUsers.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPublic ? (
              <>
                <Globe className="h-5 w-5 text-green-500" />
                Match Visibility - Public
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-yellow-500" />
                Match Visibility - Restricted
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isPublic
              ? "This match is visible to all users. You can restrict it to selected favorites."
              : "This match is only visible to selected users. You can add more favorites or make it public."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {favoriteUsers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>You don't have any favorites yet.</p>
                <p className="text-sm mt-2">Add favorites from the Players page to restrict matches.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto border rounded-lg p-4">
                {favoriteUsers.map((favorite) => (
                  <div key={favorite.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                    <Checkbox
                      id={`user-${favorite.id}`}
                      checked={selectedUsers.includes(favorite.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers([...selectedUsers, favorite.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== favorite.id));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`user-${favorite.id}`}
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={favorite.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10">
                          {favorite.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{favorite.name}</p>
                        {favorite.club_name && (
                          <p className="text-xs text-muted-foreground truncate">{favorite.club_name}</p>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {!isPublic && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Currently restricted to {currentRestrictedUsers ? currentRestrictedUsers.length - 1 : 0} user{currentRestrictedUsers && currentRestrictedUsers.length - 1 !== 1 ? 's' : ''} (plus you)
                </p>
              </div>
            )}
          </>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isPublic && favoriteUsers.length > 0 && (
            <Button
              variant="outline"
              onClick={handleMakePublic}
              disabled={isSaving || isLoading}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Making Public...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Make Public
                </>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {favoriteUsers.length > 0 && (
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
