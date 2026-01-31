import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Clock, Check, Loader2, Building2, Users, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  fetchUpAndDownEvents,
  enrollForEvent,
  fetchEnrollmentCounts,
  lookForTpPlayers,
  fetchGroupsByIds,
  type UpAndDownEvent,
  type TpPlayer,
} from "@/lib/upanddown";
import { getAvailableRankingLevels } from "@/hooks/useRankingLevels";

const UpAndDown = () => {
  const enrollRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<UpAndDownEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<UpAndDownEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // Player 1
  const [p1FirstName, setP1FirstName] = useState("");
  const [p1LastName, setP1LastName] = useState("");
  const [searchingPlayer1, setSearchingPlayer1] = useState(false);
  const [player1Results, setPlayer1Results] = useState<TpPlayer[]>([]);
  const [selectedP1, setSelectedP1] = useState<string>("");

  // Player 2 (partner - mandatory)
  const [p2FirstName, setP2FirstName] = useState("");
  const [p2LastName, setP2LastName] = useState("");
  const [searchingPlayer2, setSearchingPlayer2] = useState(false);
  const [player2Results, setPlayer2Results] = useState<TpPlayer[]>([]);
  const [selectedP2, setSelectedP2] = useState<string>("");

  // Phone number
  const [phoneNumber, setPhoneNumber] = useState("");

  // Enrollment counts per event (number of players)
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});

  // Event group ranking levels (fetched when event is selected)
  const [eventRankingLevels, setEventRankingLevels] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Fetch events
      const eventsData = await fetchUpAndDownEvents();
      setEvents(eventsData);

      // Fetch enrollment counts
      const counts = await fetchEnrollmentCounts(eventsData.map((e) => e.id));
      setEnrollmentCounts(counts);

      setLoading(false);

      // Auto-select if only one event
      if (eventsData.length === 1) {
        setSelectedEvent(eventsData[0]);
        loadEventRankingLevels(eventsData[0]);
      }
    };

    init();
  }, []);

  const loadEventRankingLevels = async (event: UpAndDownEvent) => {
    if (event.group_ids.length === 0) {
      setEventRankingLevels([]);
      return;
    }
    const groups = await fetchGroupsByIds(event.group_ids);
    const levels = groups
      .map((g) => g.ranking_level)
      .filter((l): l is string => l !== null);
    setEventRankingLevels(levels);
  };

  const getSelectedPlayer1 = () => player1Results.find((p) => p.userId === selectedP1) || null;
  const getSelectedPlayer2 = () => player2Results.find((p) => p.userId === selectedP2) || null;

  const isPlayerRankingAllowed = (player: TpPlayer | null): boolean => {
    if (!player || eventRankingLevels.length === 0) return true;
    if (!player.ranking) return false;
    const playerLevels = getAvailableRankingLevels(player.ranking);
    return eventRankingLevels.some((level) => playerLevels.includes(level));
  };

  const p1RankingOk = isPlayerRankingAllowed(getSelectedPlayer1());
  const p2RankingOk = isPlayerRankingAllowed(getSelectedPlayer2());

  const handleLookup = async (
    firstName: string,
    lastName: string,
    setSearching: (v: boolean) => void,
    setResults: (v: TpPlayer[]) => void,
    setSelected: (v: string) => void,
    onAutoSelect: (player: TpPlayer) => void
  ) => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Enter first name and last name to search.");
      return;
    }

    setSearching(true);
    setResults([]);
    setSelected("");
    try {
      const players = await lookForTpPlayers(firstName.trim(), lastName.trim());
      if (players.length === 0) {
        toast.error("No players found.");
      } else {
        setResults(players);
        if (players.length === 1) {
          setSelected(players[0].userId);
          onAutoSelect(players[0]);
        }
      }
    } catch {
      toast.error("Failed to search. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectEvent = (event: UpAndDownEvent) => {
    setSelectedEvent(event);
    setEnrolled(false);
    setP2FirstName("");
    setP2LastName("");
    setPlayer2Results([]);
    setSelectedP2("");
    loadEventRankingLevels(event);
    setTimeout(() => {
      enrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const canEnroll =
    selectedP1 !== "" &&
    selectedP2 !== "" &&
    phoneNumber.trim() !== "" &&
    p1RankingOk &&
    p2RankingOk;

  const handleEnroll = async () => {
    if (!selectedEvent || !canEnroll) return;

    const p1Name = `${p1FirstName.trim()} ${p1LastName.trim()}`.trim();
    const p2Name = `${p2FirstName.trim()} ${p2LastName.trim()}`.trim();

    setSubmitting(true);

    const totalPrice = selectedEvent.price * 2;

    const result = await enrollForEvent({
      eventId: selectedEvent.id,
      userId: null,
      name: p1Name,
      partnerName: p2Name,
      phoneNumber: phoneNumber.trim(),
      totalPrice,
    });

    setSubmitting(false);

    if (result.success) {
      setEnrolled(true);
      setEnrollmentCounts((prev) => ({
        ...prev,
        [selectedEvent.id]: (prev[selectedEvent.id] || 0) + 2,
      }));
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

  const inputClass = "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0";
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.08)", color: "#e0e6f0" };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a2744 0%, #243656 50%, #1a2744 100%)" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#d4a017" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #1a2744 0%, #243656 50%, #1a2744 100%)" }}>
      <div className="max-w-lg mx-auto px-4 py-2">
        {/* Header with logo */}
        <div className="text-center mb-3">
          <img
            src="/logo.png"
            alt="Padel Community"
            className="w-80 h-80 mx-auto object-contain"
          />
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
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0" style={{ color: "#e87c3e" }} />
                    <span>
                      {enrollmentCounts[event.id] || 0}
                      {event.max_participants ? ` / ${event.max_participants}` : ""} players
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Enrollment Form */}
        {selectedEvent && (
          <>
            <div ref={enrollRef} className="mb-6" style={{ borderTop: "1px solid rgba(212,160,23,0.3)" }} />

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
                    Pay
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="p1-first" className="text-sm" style={{ color: "#c0c8d8" }}>First name</Label>
                      <Input
                        id="p1-first"
                        value={p1FirstName}
                        onChange={(e) => { setP1FirstName(e.target.value); setPlayer1Results([]); setSelectedP1(""); }}
                        placeholder="First name"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <Label htmlFor="p1-last" className="text-sm" style={{ color: "#c0c8d8" }}>Last name</Label>
                      <Input
                        id="p1-last"
                        value={p1LastName}
                        onChange={(e) => { setP1LastName(e.target.value); setPlayer1Results([]); setSelectedP1(""); }}
                        placeholder="Last name"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLookup(
                      p1FirstName, p1LastName,
                      setSearchingPlayer1, setPlayer1Results, setSelectedP1,
                      (p) => {
                        const parts = p.name.split(/\s+/);
                        setP1FirstName(parts[0] || "");
                        setP1LastName(parts.slice(1).join(" ") || "");
                      }
                    )}
                    disabled={searchingPlayer1 || !p1FirstName.trim() || !p1LastName.trim()}
                    className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-md transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ backgroundColor: "rgba(212,160,23,0.15)", color: "#d4a017" }}
                  >
                    {searchingPlayer1 ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                    {searchingPlayer1 ? "Searching..." : "Look for Tennis Padel Vlaanderen account"}
                  </button>
                  {player1Results.length >= 1 && (
                    <Select value={selectedP1} onValueChange={(val) => {
                      setSelectedP1(val);
                      const player = player1Results.find((p) => p.userId === val);
                      if (player) {
                        const parts = player.name.split(/\s+/);
                        setP1FirstName(parts[0] || "");
                        setP1LastName(parts.slice(1).join(" ") || "");
                      }
                    }}>
                      <SelectTrigger
                        className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0"
                        style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#e0e6f0" }}
                      >
                        <SelectValue placeholder="Select your account" />
                      </SelectTrigger>
                      <SelectContent>
                        {player1Results.map((p) => (
                          <SelectItem key={p.userId} value={p.userId}>
                            {p.name}{p.club ? ` - ${p.club}` : ""} ({p.ranking || "No ranking"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedP1 && !p1RankingOk && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#e87c3e" }}>
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>This player's ranking does not match the event level. Enrollment is not allowed.</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "1px solid rgba(212,160,23,0.2)" }} />

                {/* Player 2 (partner) */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium" style={{ color: "#d4a017" }}>Player 2</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="p2-first" className="text-sm" style={{ color: "#c0c8d8" }}>First name</Label>
                      <Input
                        id="p2-first"
                        value={p2FirstName}
                        onChange={(e) => { setP2FirstName(e.target.value); setPlayer2Results([]); setSelectedP2(""); }}
                        placeholder="First name"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <Label htmlFor="p2-last" className="text-sm" style={{ color: "#c0c8d8" }}>Last name</Label>
                      <Input
                        id="p2-last"
                        value={p2LastName}
                        onChange={(e) => { setP2LastName(e.target.value); setPlayer2Results([]); setSelectedP2(""); }}
                        placeholder="Last name"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLookup(
                      p2FirstName, p2LastName,
                      setSearchingPlayer2, setPlayer2Results, setSelectedP2,
                      (p) => {
                        const parts = p.name.split(/\s+/);
                        setP2FirstName(parts[0] || "");
                        setP2LastName(parts.slice(1).join(" ") || "");
                      }
                    )}
                    disabled={searchingPlayer2 || !p2FirstName.trim() || !p2LastName.trim()}
                    className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-md transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ backgroundColor: "rgba(212,160,23,0.15)", color: "#d4a017" }}
                  >
                    {searchingPlayer2 ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                    {searchingPlayer2 ? "Searching..." : "Look for Tennis Padel Vlaanderen account"}
                  </button>
                  {player2Results.length >= 1 && (
                    <Select value={selectedP2} onValueChange={(val) => {
                      setSelectedP2(val);
                      const player = player2Results.find((p) => p.userId === val);
                      if (player) {
                        const parts = player.name.split(/\s+/);
                        setP2FirstName(parts[0] || "");
                        setP2LastName(parts.slice(1).join(" ") || "");
                      }
                    }}>
                      <SelectTrigger
                        className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0"
                        style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#e0e6f0" }}
                      >
                        <SelectValue placeholder="Select your account" />
                      </SelectTrigger>
                      <SelectContent>
                        {player2Results.map((p) => (
                          <SelectItem key={p.userId} value={p.userId}>
                            {p.name}{p.club ? ` - ${p.club}` : ""} ({p.ranking || "No ranking"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedP2 && !p2RankingOk && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#e87c3e" }}>
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>This player's ranking does not match the event level. Enrollment is not allowed.</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "1px solid rgba(212,160,23,0.2)" }} />

                {/* Phone number */}
                <div>
                  <Label htmlFor="phone" className="text-sm" style={{ color: "#c0c8d8" }}>Phone number (for contact)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+32 ..."
                    className={inputClass}
                    style={inputStyle}
                  />
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
                  disabled={submitting || !canEnroll}
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
