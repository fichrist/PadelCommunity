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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase, getUserIdFromStorage, createFreshSupabaseClient } from "@/integrations/supabase/client";

interface EditMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: any;
  onUpdate: () => void;
}

interface Group {
  id: string;
  name: string;
  group_type: 'General' | 'Ranked';
  ranking_level: string | null;
}

const EditMatchDialog = ({ open, onOpenChange, match, onUpdate }: EditMatchDialogProps) => {
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();

      if (!userId) {
        console.error('No authenticated user');
        return;
      }

      // Use fresh client to avoid stuck state
      const client = createFreshSupabaseClient();
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('allowed_groups')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Fetch all groups
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, group_type, ranking_level')
        .order('created_at', { ascending: true });

      if (!error && data) {
        // Filter groups to only show those in user's allowed_groups
        const allowedGroupIds = profile?.allowed_groups || [];
        const filteredGroups = data.filter(group => allowedGroupIds.includes(group.id));
        setGroups(filteredGroups);
      }
    };

    if (open) {
      fetchGroups();
      // Set initial values from match
      setMessage(match.message || "");
      setSelectedGroups(match.group_ids || []);
    }
  }, [open, match]);

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        // Prevent removing the last group
        if (prev.length === 1) {
          toast.error("Match must belong to at least one group");
          return prev;
        }
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSave = async () => {
    if (selectedGroups.length === 0) {
      toast.error("Match must belong to at least one group");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          group_ids: selectedGroups,
          message: message.trim() || null,
        })
        .eq('id', match.id);

      if (error) throw error;

      toast.success("Match updated successfully!");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating match:', error);
      toast.error(error.message || "Failed to update match");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
          <DialogDescription>
            Update match groups and message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="edit-message">Message (Optional)</Label>
            <Textarea
              id="edit-message"
              placeholder="Add a message for this match..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={saving}
              rows={3}
            />
          </div>

          {/* Groups */}
          <div className="space-y-2">
            <Label>Groups</Label>
            <div className="space-y-2 max-h-[250px] overflow-y-auto border rounded-md p-3">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => handleToggleGroup(group.id)}
                    disabled={saving}
                  />
                  <label
                    htmlFor={`group-${group.id}`}
                    className="text-sm cursor-pointer flex-1 flex items-center gap-2"
                  >
                    {group.group_type === 'Ranked' && (
                      <Trophy className="h-4 w-4 text-primary" />
                    )}
                    <span>{group.name}</span>
                    {group.ranking_level && (
                      <Badge variant="outline" className="text-xs">
                        {group.ranking_level}
                      </Badge>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Match must belong to at least one group
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMatchDialog;
