import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddEventModal from "./AddEventModal";
import AddNoteModal from "./AddNoteModal";

interface PersonalEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  tag?: string;
}

interface CalendarNote {
  id: string;
  note_date: string;
  content: string;
}

const PersonalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null);
  const [editingNote, setEditingNote] = useState<CalendarNote | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchNotes();
  }, []);

  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('personal_events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true });

    if (error) {
      toast.error("Failed to load events");
      return;
    }
    setEvents(data || []);
  };

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('calendar_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('note_date', { ascending: true });

    if (error) {
      toast.error("Failed to load notes");
      return;
    }
    setNotes(data || []);
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('personal_events')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete event");
      return;
    }
    toast.success("Event deleted");
    fetchEvents();
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('calendar_notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete note");
      return;
    }
    toast.success("Note deleted");
    fetchNotes();
  };

  const selectedDateEvents = events.filter(event => 
    selectedDate && isSameDay(new Date(event.event_date), selectedDate)
  );

  const selectedDateNotes = notes.filter(note => 
    selectedDate && isSameDay(new Date(note.note_date), selectedDate)
  );

  const eventDates = events.map(event => new Date(event.event_date));

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Personal Calendar</CardTitle>
            <CardDescription>Track your spiritual journey and personal events</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setEditingEvent(null);
                setIsEventModalOpen(true);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button 
              onClick={() => {
                setEditingNote(null);
                setIsNoteModalOpen(true);
              }}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasEvent: eventDates
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: 'bold',
                  color: 'hsl(var(--primary))',
                  textDecoration: 'underline'
                }
              }}
              className="rounded-md border"
            />
          </div>

          {/* Selected Date Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h3>

            {/* Events for selected date */}
            {selectedDateEvents.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Events</h4>
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => (
                    <Card key={event.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{event.title}</h5>
                            {event.tag && (
                              <Badge variant="secondary" className="text-xs">
                                {event.tag}
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingEvent(event);
                              setIsEventModalOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Notes for selected date */}
            {selectedDateNotes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Private Notes</h4>
                <div className="space-y-2">
                  {selectedDateNotes.map((note) => (
                    <Card key={note.id} className="p-3 bg-muted/50">
                      <div className="flex items-start justify-between">
                        <p className="text-sm flex-1">{note.content}</p>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingNote(note);
                              setIsNoteModalOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedDateEvents.length === 0 && selectedDateNotes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events or notes for this date
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <AddEventModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
        onSuccess={() => {
          fetchEvents();
          setEditingEvent(null);
        }}
      />

      <AddNoteModal
        open={isNoteModalOpen}
        onOpenChange={setIsNoteModalOpen}
        selectedDate={selectedDate}
        editingNote={editingNote}
        onSuccess={() => {
          fetchNotes();
          setEditingNote(null);
        }}
      />
    </Card>
  );
};

export default PersonalCalendar;
