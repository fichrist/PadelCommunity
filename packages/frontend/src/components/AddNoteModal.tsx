import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase, getUserIdFromStorage, createFreshSupabaseClient } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  editingNote?: { id: string; note_date: string; content: string } | null;
  onSuccess: () => void;
}

const AddNoteModal = ({ open, onOpenChange, selectedDate, editingNote, onSuccess }: AddNoteModalProps) => {
  const [content, setContent] = useState("");
  const [noteDate, setNoteDate] = useState<Date | undefined>(selectedDate);

  useEffect(() => {
    if (editingNote) {
      setContent(editingNote.content);
      setNoteDate(new Date(editingNote.note_date));
    } else {
      setContent("");
      setNoteDate(selectedDate);
    }
  }, [editingNote, selectedDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !noteDate) {
      toast.error("Please fill in all fields");
      return;
    }

    // Get user ID synchronously from localStorage (never hangs)
    const userId = getUserIdFromStorage();
    if (!userId) {
      toast.error("You must be logged in");
      return;
    }

    const noteData = {
      content,
      note_date: format(noteDate, "yyyy-MM-dd"),
      user_id: userId,
    };

    // Use fresh client to avoid stuck state
    const client = createFreshSupabaseClient();
    if (editingNote) {
      const { error } = await client
        .from('calendar_notes')
        .update(noteData)
        .eq('id', editingNote.id);

      if (error) {
        toast.error("Failed to update note");
        return;
      }
      toast.success("Note updated successfully");
    } else {
      const { error } = await client
        .from('calendar_notes')
        .insert([noteData]);

      if (error) {
        toast.error("Failed to create note");
        return;
      }
      toast.success("Note created successfully");
    }

    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingNote ? "Edit Note" : "Add Private Note"}</DialogTitle>
          <DialogDescription>
            Add a private note visible only to you
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Note *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your private thoughts..."
              rows={5}
              required
            />
          </div>

          <div>
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !noteDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {noteDate ? format(noteDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={noteDate}
                  onSelect={setNoteDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingNote ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal;
