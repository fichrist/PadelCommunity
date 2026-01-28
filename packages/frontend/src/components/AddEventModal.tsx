import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase, getUserIdFromStorage, createFreshSupabaseClient } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  editingEvent?: { id: string; title: string; description?: string; event_date: string; tag?: string } | null;
  onSuccess: () => void;
}

const AddEventModal = ({ open, onOpenChange, selectedDate, editingEvent, onSuccess }: AddEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(selectedDate);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || "");
      setTag(editingEvent.tag || "");
      setEventDate(new Date(editingEvent.event_date));
    } else {
      setTitle("");
      setDescription("");
      setTag("");
      setEventDate(selectedDate);
    }
  }, [editingEvent, selectedDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !eventDate) {
      toast.error("Please fill in required fields");
      return;
    }

    // Get user ID synchronously from localStorage (never hangs)
    const userId = getUserIdFromStorage();
    if (!userId) {
      toast.error("You must be logged in");
      return;
    }

    const eventData = {
      title,
      description: description || null,
      tag: tag || null,
      event_date: format(eventDate, "yyyy-MM-dd"),
      user_id: userId,
    };

    // Use fresh client to avoid stuck state
    const client = createFreshSupabaseClient();
    if (editingEvent) {
      const { error } = await client
        .from('personal_events')
        .update(eventData)
        .eq('id', editingEvent.id);

      if (error) {
        toast.error("Failed to update event");
        return;
      }
      toast.success("Event updated successfully");
    } else {
      const { error } = await client
        .from('personal_events')
        .insert([eventData]);

      if (error) {
        toast.error("Failed to create event");
        return;
      }
      toast.success("Event created successfully");
    }

    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEvent ? "Edit Event" : "Add Personal Event"}</DialogTitle>
          <DialogDescription>
            Create a personal event for your spiritual journey
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Morning Meditation"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about your event..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="meditation, yoga, etc."
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
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
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
              {editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;
