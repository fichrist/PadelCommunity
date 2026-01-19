# Component Patterns - UI Layer Best Practices

Deze gids toont best practices voor het bouwen van UI components die samenwerken met de nieuwe hook-based architecture.

## 🎨 Component Types

### 1. Page Components (Orchestrators)

**Verantwoordelijkheid:** Orkestreren van hooks en child components

```typescript
// ✅ GOOD: Clean orchestrator
import { useAuth, useGeolocation, useDateFiltering } from '@/hooks';
import { EventFilters, EventList, EventModals } from '@/components';

export const EventsPage = () => {
  // Hooks for business logic
  const { currentUser } = useAuth();
  const geolocation = useGeolocation();
  const dateFilter = useDateFiltering();

  // Fetch data
  const { events, isLoading } = useEvents();

  // Filter data using hooks
  const filteredEvents = useMemo(() =>
    events.filter(e =>
      geolocation.isWithinRadius(e.lat, e.lng) &&
      dateFilter.isDateInRange(e.date)
    ),
    [events, geolocation, dateFilter]
  );

  // Render orchestration
  return (
    <div>
      <EventFilters
        geolocation={geolocation}
        dateFilter={dateFilter}
      />
      <EventList
        events={filteredEvents}
        isLoading={isLoading}
      />
      <EventModals />
    </div>
  );
};
```

```typescript
// ❌ BAD: Business logic in component
export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [location, setLocation] = useState('');

  // DON'T: Business logic in component
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    // ... haversine formula
  };

  // DON'T: Filtering logic in component
  const filteredEvents = events.filter(event => {
    const distance = calculateDistance(...);
    return distance < 50;
  });

  return <div>{/* ... */}</div>;
};
```

### 2. Presentation Components (Pure UI)

**Verantwoordelijkheid:** Rendering UI met props, geen business logica

```typescript
// ✅ GOOD: Pure presentation component
interface EventCardProps {
  event: Event;
  currentUserId: string;
  onEnroll: (eventId: string) => void;
  onShare: (eventId: string) => void;
}

export const EventCard = ({
  event,
  currentUserId,
  onEnroll,
  onShare,
}: EventCardProps) => {
  const isEnrolled = event.participants?.some(p => p.id === currentUserId);

  return (
    <Card>
      <CardHeader>
        <h3>{event.title}</h3>
      </CardHeader>
      <CardContent>
        <p>{event.description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onEnroll(event.id)} disabled={isEnrolled}>
          {isEnrolled ? 'Enrolled' : 'Enroll'}
        </Button>
        <Button variant="ghost" onClick={() => onShare(event.id)}>
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};
```

```typescript
// ❌ BAD: Business logic in presentation component
export const EventCard = ({ event }: { event: Event }) => {
  // DON'T: Fetching data in presentation component
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    fetchUser();
  }, []);

  // DON'T: Business logic
  const handleEnroll = async () => {
    await supabase.from('enrollments').insert({ ... });
  };

  return <Card>{/* ... */}</Card>;
};
```

### 3. Container Components (Data + UI)

**Verantwoordelijkheid:** Fetch data met hooks, pass naar presentation component

```typescript
// ✅ GOOD: Container pattern
import { useAuth } from '@/hooks';
import { EventCard } from './EventCard';

interface EventCardContainerProps {
  eventId: string;
}

export const EventCardContainer = ({ eventId }: EventCardContainerProps) => {
  const { currentUserId } = useAuth();
  const { event, isLoading } = useEvent(eventId);
  const { enroll } = useEventEnrollment(eventId);

  if (isLoading) return <Skeleton />;
  if (!event) return <ErrorState />;

  return (
    <EventCard
      event={event}
      currentUserId={currentUserId}
      onEnroll={enroll}
    />
  );
};
```

### 4. Filter Components (Controlled)

**Verantwoordelijkheid:** Render filter UI, controlled by parent hooks

```typescript
// ✅ GOOD: Controlled filter component
import { UseGeolocationReturn, UseDateFilteringReturn } from '@/hooks';

interface EventFiltersProps {
  geolocation: UseGeolocationReturn;
  dateFilter: UseDateFilteringReturn;
}

export const EventFilters = ({ geolocation, dateFilter }: EventFiltersProps) => {
  return (
    <div className="filters">
      {/* Location filter */}
      <LocationAutocomplete
        value={geolocation.selectedLocation}
        onChange={geolocation.setSelectedLocation}
        onPlaceSelected={(place) => {
          geolocation.setSelectedLocationCoords({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }}
      />

      {/* Radius filter */}
      <Select
        value={geolocation.selectedRadius}
        onValueChange={geolocation.setSelectedRadius}
      >
        <SelectItem value="10">10 km</SelectItem>
        <SelectItem value="25">25 km</SelectItem>
        <SelectItem value="50">50 km</SelectItem>
      </Select>

      {/* Date filter */}
      <Select
        value={dateFilter.selectedDate}
        onValueChange={dateFilter.setSelectedDate}
      >
        <SelectItem value="today">Today</SelectItem>
        <SelectItem value="next-week">Next Week</SelectItem>
        <SelectItem value="custom">Custom Range</SelectItem>
      </Select>

      {dateFilter.selectedDate === 'custom' && (
        <CustomDateRangePicker
          from={dateFilter.customDateFrom}
          to={dateFilter.customDateTo}
          onFromChange={dateFilter.setCustomDateFrom}
          onToChange={dateFilter.setCustomDateTo}
        />
      )}
    </div>
  );
};
```

## 🔄 Data Flow Patterns

### Pattern 1: Top-Down Data Flow

```
Page Component (Orchestrator)
  ├─> Hooks (Business Logic)
  │     ├─> useAuth()
  │     ├─> useGeolocation()
  │     └─> useEvents()
  │
  └─> Child Components (UI)
        ├─> EventFilters (Controlled)
        ├─> EventList (Presentation)
        └─> EventModals (Presentation)
```

### Pattern 2: Container/Presentation Split

```
EventCardContainer (Data)
  ├─> useEvent(id)
  ├─> useAuth()
  └─> EventCard (UI)
```

## 📦 Props Patterns

### 1. Hook Return Types as Props

```typescript
// ✅ GOOD: Pass entire hook return
interface FiltersProps {
  geolocation: UseGeolocationReturn;
  dateFilter: UseDateFilteringReturn;
}

const Filters = ({ geolocation, dateFilter }: FiltersProps) => {
  // Access all methods from hooks
  return <div>{/* ... */}</div>;
};
```

### 2. Callback Props

```typescript
// ✅ GOOD: Specific callbacks
interface EventListProps {
  events: Event[];
  onEnroll: (eventId: string) => void;
  onShare: (eventId: string) => void;
  onComment: (eventId: string) => void;
}

const EventList = ({ events, onEnroll, onShare, onComment }: EventListProps) => {
  return (
    <div>
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onEnroll={() => onEnroll(event.id)}
          onShare={() => onShare(event.id)}
          onComment={() => onComment(event.id)}
        />
      ))}
    </div>
  );
};
```

### 3. Render Props (Advanced)

```typescript
// ✅ GOOD: Flexible rendering
interface EventListProps {
  events: Event[];
  renderEvent: (event: Event) => React.ReactNode;
}

const EventList = ({ events, renderEvent }: EventListProps) => {
  return (
    <div className="event-grid">
      {events.map(renderEvent)}
    </div>
  );
};

// Usage
<EventList
  events={filteredEvents}
  renderEvent={(event) => (
    <EventCard
      key={event.id}
      event={event}
      variant="compact"
    />
  )}
/>
```

## 🎭 Modal Patterns

### Pattern: Modal State in Parent

```typescript
// ✅ GOOD: Modal state managed by page
const EventsPage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  return (
    <>
      <EventList events={events} onEventClick={handleEventClick} />

      <EventDetailsModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};
```

## 🔁 Real-time Subscription Patterns

### Pattern: Subscription in Custom Hook

```typescript
// ✅ GOOD: Subscription logic in hook
export const useRealtimeNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return { notifications };
};

// Component uses hook
const NotificationDropdown = () => {
  const { currentUserId } = useAuth();
  const { notifications } = useRealtimeNotifications(currentUserId);

  return <NotificationList notifications={notifications} />;
};
```

## 🧩 Composition Patterns

### Pattern: Compound Components

```typescript
// ✅ GOOD: Composable API
const EventCard = ({ event }: { event: Event }) => {
  return (
    <Card>
      <EventCard.Header event={event} />
      <EventCard.Body event={event} />
      <EventCard.Footer event={event} />
    </Card>
  );
};

EventCard.Header = ({ event }) => (
  <CardHeader>
    <Avatar src={event.organizer.avatar} />
    <h3>{event.title}</h3>
  </CardHeader>
);

EventCard.Body = ({ event }) => (
  <CardContent>
    <p>{event.description}</p>
    <EventCard.Meta event={event} />
  </CardContent>
);

EventCard.Meta = ({ event }) => (
  <div className="meta">
    <span>{event.date}</span>
    <span>{event.location}</span>
  </div>
);

EventCard.Footer = ({ event }) => (
  <CardFooter>
    <Button>Enroll</Button>
    <Button variant="ghost">Share</Button>
  </CardFooter>
);
```

## 📱 React Native Compatible Patterns

### Web Component

```typescript
// packages/frontend/src/components/EventCard.tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export const EventCard = ({ event }: { event: Event }) => {
  return (
    <Card className="hover:shadow-lg transition">
      <CardHeader>
        <h3 className="text-lg font-bold">{event.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{event.description}</p>
      </CardContent>
    </Card>
  );
};
```

### React Native Component

```typescript
// packages/mobile/src/components/EventCard.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card'; // Native card component

export const EventCard = ({ event }: { event: Event }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{event.description}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  header: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  description: { color: '#666' },
});
```

**Shared Hook - Works in Both!**

```typescript
// packages/shared/src/hooks/useEvent.ts
export const useEvent = (eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const data = await getEventById(eventId);
      setEvent(data);
      setIsLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  return { event, isLoading };
};

// Used in both Web and React Native!
```

## ✅ Component Checklist

When creating new components:

- [ ] Is this component doing ONE thing well?
- [ ] Is business logic in hooks, not component?
- [ ] Are props clearly typed with TypeScript?
- [ ] Is the component platform-agnostic (no web-specific code)?
- [ ] Can this component be tested in isolation?
- [ ] Are callbacks memoized with useCallback?
- [ ] Are expensive computations memoized with useMemo?
- [ ] Is the component documented with JSDoc?

## 🎯 Summary

**DO:**
- ✅ Use hooks for business logic
- ✅ Keep components focused on UI
- ✅ Pass hook returns as props to child components
- ✅ Use TypeScript for type safety
- ✅ Compose small, reusable components
- ✅ Keep platform-agnostic code in shared hooks

**DON'T:**
- ❌ Mix business logic with UI rendering
- ❌ Duplicate filtering/calculation logic
- ❌ Fetch data in presentation components
- ❌ Use web-specific APIs in shared code
- ❌ Create God components (500+ lines)
- ❌ Inline complex calculations

Follow these patterns en je code zal clean, testable, and ready for React Native! 🚀
