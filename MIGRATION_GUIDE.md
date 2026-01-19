# Migratiegids: Van Monolitische Componenten naar Hooks

Deze gids helpt je om bestaande componenten te refactoren naar het nieuwe hook-gebaseerde patroon, waardoor de code klaar is voor React Native migratie.

## 📋 Overzicht

We hebben custom hooks gemaakt die business logica scheiden van UI:

- ✅ `useAuth` - Authenticatie & user profile
- ✅ `useGeolocation` - Locatie filtering & distance berekeningen
- ✅ `useDateFiltering` - Datum filtering
- ✅ `useRankingLevels` - Padel ranking logica
- ✅ `useMediaUpload` - Media upload & validatie
- ✅ `useThoughts` - Comments/thoughts management
- ✅ `useFormState` - Form state management

## 🎯 Migratie Strategie

### Fase 1: High Priority Components (Week 1-2)
1. Events.tsx - Meest complexe, meeste voordeel
2. Chat.tsx - Real-time logica scheiden
3. EventDetails.tsx - Event data management

### Fase 2: Medium Priority Components (Week 3-4)
4. CreateEvent.tsx - Form logica
5. People.tsx - Filtering logica
6. NotificationDropdown.tsx - Notification logica

### Fase 3: Small Components (Week 5)
7. Modals en kleinere formulieren
8. Settings.tsx
9. Admin.tsx

## 📖 Migratie Voorbeelden

### Voorbeeld 1: Events.tsx Migratie

#### Voor: Gemixte Logica & UI (1500+ lijnen)

```typescript
// Events.tsx - VOOR
const Events = () => {
  // 50+ useState declaraties
  const [filter, setFilter] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationCoords, setSelectedLocationCoords] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState("");
  const [selectedDate, setSelectedDate] = useState("next-3-weeks");
  const [customDateFrom, setCustomDateFrom] = useState();
  const [customDateTo, setCustomDateTo] = useState();
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedMatchLevels, setSelectedMatchLevels] = useState([]);
  // ... 40+ meer state variables

  // Inline Haversine berekening
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    // ... 10 regels wiskunde
    return R * c;
  };

  // Inline ranking levels
  const ALL_RANKING_LEVELS = [
    { value: 'p50-p100', min: 50, max: 100 },
    // ... meer levels
  ];

  // Inline filtering logica (100+ regels)
  const filteredEvents = events.filter(event => {
    // Location filtering
    if (selectedLocationCoords && selectedRadius) {
      const distance = calculateDistance(
        selectedLocationCoords.lat,
        selectedLocationCoords.lng,
        event.latitude,
        event.longitude
      );
      if (distance > parseInt(selectedRadius)) return false;
    }

    // Date filtering (30+ regels)
    if (selectedDate === 'custom') {
      // ... custom date logic
    } else if (selectedDate === 'today') {
      // ... today logic
    }
    // ... meer filtering

    return true;
  });

  // 500+ regels JSX
  return (
    <div>
      {/* Filters */}
      {/* Event cards */}
      {/* Modals */}
    </div>
  );
};
```

#### Na: Gescheiden Logica & UI (Clean!)

```typescript
// Events.tsx - NA
import {
  useAuth,
  useGeolocation,
  useDateFiltering,
  useArraySelection,
  useThoughts,
} from '@/hooks';
import { useEvents } from '@/hooks/useEvents'; // Nieuwe hook
import { EventList } from '@/components/EventList'; // Nieuwe component
import { EventFilters } from '@/components/EventFilters'; // Nieuwe component

const Events = () => {
  // Authentication
  const { currentUser, isAuthenticated } = useAuth();

  // Geolocation filtering
  const geolocation = useGeolocation();

  // Date filtering
  const dateFilter = useDateFiltering('next-3-weeks');

  // Tag selection
  const tagSelection = useArraySelection<string>([]);

  // Match level selection
  const levelSelection = useArraySelection<string>([]);

  // Fetch events
  const { events, isLoading } = useEvents();

  // Apply all filters
  const filteredEvents = useMemo(() => {
    return events.filter(event =>
      geolocation.isWithinRadius(event.latitude, event.longitude) &&
      dateFilter.isDateInRange(event.event_date) &&
      (tagSelection.count === 0 || tagSelection.isSelected(event.tag)) &&
      (levelSelection.count === 0 || levelSelection.isSelected(event.level))
    );
  }, [events, geolocation, dateFilter, tagSelection, levelSelection]);

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <EventFilters
        geolocation={geolocation}
        dateFilter={dateFilter}
        tagSelection={tagSelection}
        levelSelection={levelSelection}
      />

      <EventList
        events={filteredEvents}
        isLoading={isLoading}
        currentUser={currentUser}
      />
    </div>
  );
};
```

### Voorbeeld 2: CreateEvent.tsx Migratie

#### Voor: Form State Overal

```typescript
// CreateEvent.tsx - VOOR
const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [price, setPrice] = useState(0);
  const [tags, setTags] = useState([]);
  const [intention, setIntention] = useState('');
  // ... 10+ meer fields

  const handleSubmit = async () => {
    const eventData = {
      title,
      description,
      event_date: eventDate,
      event_time: eventTime,
      location_name: locationName,
      location_address: locationAddress,
      max_participants: maxParticipants,
      price,
      tags,
      intention,
      // ... copy paste all fields
    };

    await createEvent(eventData);
  };

  return (
    <form>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <input value={description} onChange={e => setDescription(e.target.value)} />
      {/* ... 20+ input fields */}
    </form>
  );
};
```

#### Na: useFormState Hook

```typescript
// CreateEvent.tsx - NA
import { useFormState } from '@/hooks';
import { createEvent } from '@/lib/events';

interface EventFormData {
  title: string;
  description: string;
  event_date: Date;
  event_time: string;
  location_name: string;
  location_address: string;
  max_participants: number;
  price: number;
  tags: string[];
  intention: string;
}

const CreateEvent = () => {
  const {
    formData,
    updateField,
    isDirty,
    resetForm,
  } = useFormState<EventFormData>({
    title: '',
    description: '',
    event_date: new Date(),
    event_time: '',
    location_name: '',
    location_address: '',
    max_participants: 10,
    price: 0,
    tags: [],
    intention: '',
  });

  const handleSubmit = async () => {
    await createEvent(formData);
    resetForm();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={e => updateField('title', e.target.value)}
      />
      <input
        value={formData.description}
        onChange={e => updateField('description', e.target.value)}
      />
      {/* Clean, consistent pattern */}

      {isDirty && <Badge>Unsaved changes</Badge>}
    </form>
  );
};
```

### Voorbeeld 3: NotificationDropdown.tsx Migratie

#### Voor: Real-time Logica in Component

```typescript
// NotificationDropdown.tsx - VOOR
const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      setNotifications(data);
    };

    fetchNotifications();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ... rendering
};
```

#### Na: useNotifications Hook

```typescript
// hooks/useNotifications.ts - Nieuwe hook
export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [userId, fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.is_read).length,
    [notifications]
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    refresh: fetchNotifications,
  };
};

// NotificationDropdown.tsx - NA
const NotificationDropdown = () => {
  const { currentUserId } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
  } = useNotifications(currentUserId);

  return (
    <Dropdown>
      <Badge count={unreadCount} />
      <NotificationList
        notifications={notifications}
        onRead={markAsRead}
        isLoading={isLoading}
      />
    </Dropdown>
  );
};
```

## 🔄 Stap-voor-Stap Migratie Proces

### Stap 1: Identificeer Business Logica

Zoek in je component naar:
- [ ] `useState` voor data fetching of filtering
- [ ] `useEffect` voor data fetching of subscriptions
- [ ] Helper functies (calculateDistance, getAvailableLevels, etc.)
- [ ] Complex filtering of sorting logica
- [ ] Form state management

### Stap 2: Bepaal Welke Hooks te Gebruiken

| Als je component... | Gebruik deze hook |
|-------------------|------------------|
| Authenticatie nodig heeft | `useAuth` |
| Locatie filtering heeft | `useGeolocation` |
| Datum filtering heeft | `useDateFiltering` |
| Ranking levels gebruikt | `useRankingLevels` |
| Media uploads heeft | `useMediaUpload` |
| Comments/replies heeft | `useThoughts` |
| Form fields heeft | `useFormState` |
| Tag/filter selectie heeft | `useArraySelection` |

### Stap 3: Extract Logica naar Hook

1. Maak nieuwe hook file in `src/hooks/`
2. Move state management naar hook
3. Move data fetching naar hook
4. Move business logica naar hook
5. Return alleen wat UI nodig heeft

### Stap 4: Refactor Component

1. Import hooks
2. Replace useState met hook calls
3. Remove business logica
4. Simplify JSX
5. Test thoroughly

### Stap 5: Split UI in Kleinere Components

1. Extract filters naar `<Filters />` component
2. Extract list rendering naar `<List />` component
3. Extract modals naar aparte bestanden
4. Keep parent component as orchestrator

## 📁 Nieuwe File Structuur

### Voor

```
src/
├── pages/
│   └── Events.tsx (1500 lines - ALLES in één file)
```

### Na

```
src/
├── hooks/
│   ├── useAuth.ts
│   ├── useGeolocation.ts
│   ├── useDateFiltering.ts
│   ├── useEvents.ts (nieuw)
│   └── index.ts
├── components/
│   ├── EventFilters.tsx (nieuw - 100 lines)
│   ├── EventList.tsx (nieuw - 150 lines)
│   ├── EventCard.tsx (bestaand)
│   └── ...
└── pages/
    └── Events.tsx (300 lines - CLEAN!)
```

## 🧪 Testing Voordelen

### Voor: Moeilijk te testen

```typescript
// Moet hele component mounten om logica te testen
import { render } from '@testing-library/react';

test('filters events by location', () => {
  const { getByRole } = render(<Events />);
  // ... complex setup
});
```

### Na: Gemakkelijk te testen

```typescript
// Test hook in isolatie
import { renderHook } from '@testing-library/react-hooks';

test('filters events by location', () => {
  const { result } = renderHook(() => useGeolocation());

  act(() => {
    result.current.setSelectedLocationCoords({ lat: 50, lng: 4 });
  });

  expect(result.current.isWithinRadius(50.1, 4.1)).toBe(true);
});
```

## 🚀 React Native Migratie

Na refactoring is React Native migratie eenvoudig:

### Web Component

```typescript
// packages/frontend/src/pages/Events.tsx
import { useEvents, useGeolocation } from '@/hooks';
import { EventCard } from '@/components/EventCard';

const Events = () => {
  const { events } = useEvents();
  const { isWithinRadius } = useGeolocation();

  return (
    <div className="grid grid-cols-3 gap-4">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
```

### React Native Component

```typescript
// packages/mobile/src/screens/EventsScreen.tsx
import { useEvents, useGeolocation } from '@padel-community/shared';
import { EventCard } from '../components/EventCard';
import { FlatList, View } from 'react-native';

const EventsScreen = () => {
  const { events } = useEvents();
  const { isWithinRadius } = useGeolocation();

  return (
    <View>
      <FlatList
        data={events}
        renderItem={({ item }) => <EventCard event={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
};
```

**Zelfde hooks, zelfde logica, andere UI!** 🎉

## ✅ Checklist per Component

Gebruik deze checklist bij het migreren van elk component:

- [ ] Identificeer alle business logica
- [ ] Bepaal welke hooks te gebruiken
- [ ] Extract custom logica naar nieuwe hooks indien nodig
- [ ] Refactor component om hooks te gebruiken
- [ ] Split UI in kleinere components
- [ ] Verwijder duplicate code
- [ ] Test de refactored component
- [ ] Update tests om hooks te gebruiken
- [ ] Document breaking changes (indien van toepassing)

## 🎯 Prioriteiten Matrix

| Component | LOC | Complexity | Business Logic % | Priority | Estimated Effort |
|-----------|-----|------------|-----------------|----------|-----------------|
| Events.tsx | 1500 | Very High | 60% | **Critical** | 2-3 days |
| Chat.tsx | 1200 | Very High | 70% | **Critical** | 2-3 days |
| EventDetails.tsx | 1300 | High | 65% | **High** | 2 days |
| CreateEvent.tsx | 800 | Medium | 50% | **High** | 1 day |
| People.tsx | 600 | Medium | 55% | **Medium** | 1 day |
| NotificationDropdown.tsx | 400 | Medium | 65% | **Medium** | 1 day |
| Settings.tsx | 500 | Low | 30% | **Low** | 0.5 day |
| Admin.tsx | 300 | Low | 40% | **Low** | 0.5 day |

## 📞 Support

Als je vragen hebt tijdens de migratie:
1. Check de [Hook README](./packages/frontend/src/hooks/README.md)
2. Bekijk de voorbeelden in deze gids
3. Test incrementeel - migreer één hook per keer

Veel succes met de migratie! 🚀
