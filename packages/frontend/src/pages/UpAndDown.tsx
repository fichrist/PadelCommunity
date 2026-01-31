import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Clock, Check, Loader2, Building2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  fetchUpAndDownEvents,
  enrollForEvent,
  fetchGroups,
  type UpAndDownEvent,
} from "@/lib/upanddown";

const UpAndDown = () => {
  const [events, setEvents] = useState<UpAndDownEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<UpAndDownEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // Player 1
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Player 2 (partner - mandatory)
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

  // Groups (for resolving group_ids to names)
  const [groupsMap, setGroupsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Fetch groups for name resolution
      const groupsList = await fetchGroups();
      const gMap: Record<string, string> = {};
      for (const g of groupsList) {
        gMap[g.id] = g.name;
      }
      setGroupsMap(gMap);

      // Fetch events
      const eventsData = await fetchUpAndDownEvents();
      setEvents(eventsData);
      setLoading(false);

      // Auto-select if only one event
      if (eventsData.length === 1) {
        setSelectedEvent(eventsData[0]);
      }
    };

    init();
  }, []);

  const handleSelectEvent = (event: UpAndDownEvent) => {
    setSelectedEvent(event);
    setEnrolled(false);
    setPartnerName("");
    setPartnerEmail("");
  };

  const handleEnroll = async () => {
    if (!selectedEvent) return;

    if (!userName.trim() || !userEmail.trim()) {
      toast.error("Player 1: name and email are required.");
      return;
    }

    if (!partnerName.trim() || !partnerEmail.trim()) {
      toast.error("Player 2: name and email are required.");
      return;
    }

    setSubmitting(true);

    const totalPrice = selectedEvent.price * 2;

    const result = await enrollForEvent({
      eventId: selectedEvent.id,
      userId: null,
      name: userName.trim(),
      email: userEmail.trim(),
      partnerName: partnerName.trim(),
      partnerEmail: partnerEmail.trim(),
      totalPrice,
    });

    setSubmitting(false);

    if (result.success) {
      setEnrolled(true);
      toast.success("Successfully enrolled!");
    } else {
      toast.error(result.error || "Failed to enroll. Please try again.");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  const totalPrice = selectedEvent ? selectedEvent.price * 2 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a2744 0%, #243656 50%, #1a2744 100%)" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#d4a017" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #1a2744 0%, #243656 50%, #1a2744 100%)" }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Padel Community"
            className="w-24 h-24 mx-auto mb-3 object-contain"
          />
          <h1 className="text-3xl font-bold" style={{ color: "#d4a017" }}>
            Up & Down
          </h1>
        </div>

        {/* Events List */}
        <div className="space-y-3 mb-6">
          {events.length === 0 ? (
            <p className="text-center py-8" style={{ color: "#8899b3" }}>
              No upcoming events available.
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="cursor-pointer rounded-xl p-4 transition-all"
                style={{
                  background: selectedEvent?.id === event.id
                    ? "linear-gradient(135deg, #2a3f5f 0%, #1e3350 100%)"
                    : "rgba(255,255,255,0.05)",
                  border: selectedEvent?.id === event.id
                    ? "2px solid #d4a017"
                    : "2px solid rgba(255,255,255,0.1)",
                  boxShadow: selectedEvent?.id === event.id
                    ? "0 0 20px rgba(212,160,23,0.2)"
                    : "none",
                }}
                onClick={() => handleSelectEvent(event)}
              >
                <h3 className="font-semibold text-base" style={{ color: "#f0d060" }}>
                  {event.title}
                </h3>
                {event.club_name && (
                  <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: "#c0c8d8" }}>
                    <Building2 className="h-4 w-4 shrink-0" style={{ color: "#d4a017" }} />
                    <span>{event.club_name}</span>
                  </div>
                )}
                <div className="mt-2 space-y-1 text-sm" style={{ color: "#8899b3" }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: "#e87c3e" }} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" style={{ color: "#e87c3e" }} />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  {event.event_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" style={{ color: "#e87c3e" }} />
                      <span>
                        {event.event_time}
                        {event.duration_minutes
                          ? ` - ${calculateEndTime(event.event_time, event.duration_minutes)}`
                          : ""}
                      </span>
                    </div>
                  )}
                  {event.group_ids && event.group_ids.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" style={{ color: "#e87c3e" }} />
                      <span>
                        {event.group_ids
                          .map((id) => groupsMap[id] || id)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Enrollment Form */}
        {selectedEvent && (
          <>
            <div className="mb-6" style={{ borderTop: "1px solid rgba(212,160,23,0.3)" }} />

            {enrolled ? (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: "rgba(255,255,255,0.05)", border: "2px solid #4a7c3e" }}
              >
                <Check className="h-12 w-12 mx-auto mb-3" style={{ color: "#6abf4b" }} />
                <h3 className="font-semibold text-lg" style={{ color: "#f0d060" }}>
                  You're enrolled!
                </h3>
                <p className="text-sm mt-1" style={{ color: "#8899b3" }}>
                  Your enrollment for {selectedEvent.title} will be confirmed after payment.
                </p>
                {selectedEvent.payment_link && (
                  <a
                    href={selectedEvent.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #d4a017 0%, #e87c3e 100%)", color: "#1a2744" }}
                  >
                    Pay now
                  </a>
                )}
              </div>
            ) : (
              <div
                className="rounded-xl p-6 space-y-5"
                style={{ background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.1)" }}
              >
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: "#f0d060" }}>
                    {selectedEvent.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#8899b3" }}>
                    {formatDate(selectedEvent.event_date)}
                    {selectedEvent.event_time ? ` - ${selectedEvent.event_time}` : ""}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid rgba(212,160,23,0.2)" }} />

                {/* Player 1 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium" style={{ color: "#d4a017" }}>Player 1</h4>
                  <div>
                    <Label htmlFor="name" className="text-sm" style={{ color: "#c0c8d8" }}>Name</Label>
                    <Input
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Full name"
                      className="border-0"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#e0e6f0" }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm" style={{ color: "#c0c8d8" }}>Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="border-0"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#e0e6f0" }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(212,160,23,0.2)" }} />

                {/* Player 2 (partner) */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium" style={{ color: "#d4a017" }}>Player 2</h4>
                  <div>
                    <Label htmlFor="partner-name" className="text-sm" style={{ color: "#c0c8d8" }}>Name</Label>
                    <Input
                      id="partner-name"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Full name"
                      className="border-0"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#e0e6f0" }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="partner-email" className="text-sm" style={{ color: "#c0c8d8" }}>Email</Label>
                    <Input
                      id="partner-email"
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="border-0"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#e0e6f0" }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(212,160,23,0.2)" }} />

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#8899b3" }}>
                    2 x {selectedEvent.price.toFixed(2)} EUR
                  </span>
                  <span className="text-lg font-bold" style={{ color: "#f0d060" }}>
                    {totalPrice.toFixed(2)} EUR
                  </span>
                </div>

                {/* Submit */}
                <button
                  onClick={handleEnroll}
                  disabled={submitting}
                  className="w-full py-3 rounded-lg font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #d4a017 0%, #e87c3e 100%)", color: "#1a2744" }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </span>
                  ) : (
                    "Enroll"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpAndDown;
