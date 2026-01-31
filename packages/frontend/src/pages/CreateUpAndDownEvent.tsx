import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2 } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { toast } from "sonner";
import { getUserIdFromStorage } from "@/integrations/supabase/client";
import { createUpAndDownEvent, fetchGroups } from "@/lib/upanddown";

const CreateUpAndDownEvent = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [clubName, setClubName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("90");
  const [price, setPrice] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    fetchGroups().then(setGroups);
  }, []);

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!location.trim()) {
      toast.error("Address is required.");
      return;
    }
    if (!clubName.trim()) {
      toast.error("Club name is required.");
      return;
    }
    if (!eventDate) {
      toast.error("Date is required.");
      return;
    }
    if (!eventTime) {
      toast.error("Start time is required.");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Price per person is required.");
      return;
    }

    const userId = getUserIdFromStorage();
    if (!userId) {
      toast.error("You must be logged in to create an event.");
      return;
    }

    setSubmitting(true);

    const result = await createUpAndDownEvent({
      title: title.trim(),
      location: location.trim(),
      clubName: clubName.trim(),
      eventDate,
      eventTime,
      durationMinutes: Number(durationMinutes) || 90,
      price: Number(price),
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      paymentLink: paymentLink.trim(),
      groupIds: selectedGroupIds,
      createdBy: userId,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success("Event created!");
      navigate("/upanddown");
    } else {
      toast.error(result.error || "Failed to create event.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create Event</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Up & Down Tournament"
                />
              </div>

              {/* Club name */}
              <div>
                <Label htmlFor="club-name">Club name</Label>
                <Input
                  id="club-name"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="e.g. Padel Club Brussels"
                />
              </div>

              {/* Address */}
              <div>
                <Label>Address</Label>
                <LocationAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Start typing your address..."
                />
              </div>

              <Separator />

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="event-time">Start time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  min="30"
                  step="15"
                />
              </div>

              <Separator />

              {/* Price */}
              <div>
                <Label htmlFor="price">Price per person (EUR)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.50"
                  placeholder="e.g. 15.00"
                />
              </div>

              {/* Max Participants */}
              <div>
                <Label htmlFor="max-participants">Max participants (optional)</Label>
                <Input
                  id="max-participants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  min="2"
                  step="1"
                  placeholder="e.g. 24"
                />
              </div>

              {/* Payment Link */}
              <div>
                <Label htmlFor="payment-link">Payment link</Label>
                <Input
                  id="payment-link"
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="e.g. https://payconiq.com/..."
                />
              </div>

              <Separator />

              {/* Group Rankings */}
              <div>
                <Label className="mb-3 block">Group rankings</Label>
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedGroupIds.includes(group.id)}
                        onCheckedChange={() => toggleGroup(group.id)}
                      />
                      <Label
                        htmlFor={`group-${group.id}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateUpAndDownEvent;
