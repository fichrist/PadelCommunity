# Custom Hooks - Platform-Agnostic Business Logic

Deze map bevat alle custom hooks die de business logica van UI scheiden. Alle hooks zijn platform-agnostic en kunnen worden hergebruikt in zowel React Web als React Native apps.

## 📁 Structuur

```
hooks/
├── index.ts                    # Centrale export van alle hooks
├── useAuth.ts                  # Authenticatie & user profile management
├── useGeolocation.ts           # Locatie filtering & distance berekeningen
├── useDateFiltering.ts         # Datum filtering & range selection
├── useRankingLevels.ts         # Padel ranking level logica
├── useMediaUpload.ts           # Media file upload & validatie
├── useThoughts.ts              # Comments/thoughts management
├── useFormState.ts             # Generieke form state management
├── use-mobile.tsx              # Mobile device detection
└── use-toast.ts                # Toast notifications
```

## 🎯 Doel

De hooks zijn ontworpen om:
1. **Business logica te scheiden van UI** - Maakt code testbaarder en herbruikbaarder
2. **Platform-agnostic te zijn** - Werkt met beide React Web en React Native
3. **Type-safe te zijn** - Volledig TypeScript support met interfaces
4. **Modulair te zijn** - Elke hook heeft één verantwoordelijkheid

## 📖 Gebruik van Hooks

### useAuth

Beheer authenticatie state en gebruiker profiel.

```typescript
import { useAuth } from '@/hooks';

function MyComponent() {
  const { currentUser, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div>
      Welcome {currentUser?.first_name}!
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### useGeolocation

Beheer locatie filtering met Haversine distance berekening.

```typescript
import { useGeolocation } from '@/hooks';

function EventList() {
  const {
    selectedLocation,
    selectedRadius,
    setSelectedLocationCoords,
    isWithinRadius,
  } = useGeolocation();

  const filteredEvents = events.filter(event =>
    isWithinRadius(event.latitude, event.longitude)
  );

  return <EventCards events={filteredEvents} />;
}
```

### useDateFiltering

Beheer datum filtering met presets en custom ranges.

```typescript
import { useDateFiltering } from '@/hooks';

function EventFilters() {
  const {
    selectedDate,
    setSelectedDate,
    isDateInRange,
    customDateFrom,
    customDateTo,
    setCustomDateFrom,
    setCustomDateTo,
  } = useDateFiltering('next-3-weeks');

  const filteredEvents = events.filter(event =>
    isDateInRange(event.event_date)
  );

  return (
    <div>
      <select
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      >
        <option value="today">Today</option>
        <option value="next-3-weeks">Next 3 Weeks</option>
        <option value="custom">Custom Range</option>
      </select>

      {selectedDate === 'custom' && (
        <DateRangePicker
          from={customDateFrom}
          to={customDateTo}
          onFromChange={setCustomDateFrom}
          onToChange={setCustomDateTo}
        />
      )}
    </div>
  );
}
```

### useRankingLevels

Utility functies voor padel ranking levels.

```typescript
import {
  getAvailableRankingLevels,
  isLevelSuitableForUser,
  parseRankingValue,
} from '@/hooks';

function MatchFilters({ userRanking }) {
  const availableLevels = getAvailableRankingLevels(userRanking);

  return (
    <select>
      {availableLevels.map(level => (
        <option key={level} value={level}>{level}</option>
      ))}
    </select>
  );
}
```

### useMediaUpload

Beheer media file uploads met validatie.

```typescript
import { useMediaUpload } from '@/hooks';
import { toast } from 'sonner';

function PostForm() {
  const {
    imageFile,
    videoFile,
    validateAndSetImage,
    clearImage,
    hasMedia,
  } = useMediaUpload(
    {
      maxImageSize: 5 * 1024 * 1024, // 5MB
      maxVideoSize: 50 * 1024 * 1024, // 50MB
    },
    (error) => toast.error(error)
  );

  const handleImageSelect = async (file: File) => {
    const success = await validateAndSetImage(file);
    if (success) {
      toast.success('Image added!');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageSelect(file);
        }}
      />
      {imageFile.preview && (
        <div>
          <img src={imageFile.preview} alt="Preview" />
          <button onClick={clearImage}>Remove</button>
        </div>
      )}
    </div>
  );
}
```

### useThoughts

Beheer comments/thoughts met nested replies.

```typescript
import { useThoughts } from '@/hooks';

function CommentsSection({ eventId }) {
  const {
    thoughtTree,
    isLoading,
    addThought,
    editThought,
    removeThought,
  } = useThoughts('event', eventId);

  const handleSubmit = async (content: string, parentId?: string) => {
    const success = await addThought(content, parentId);
    if (success) {
      toast.success('Comment added!');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      {thoughtTree.map(thought => (
        <Comment
          key={thought.id}
          thought={thought}
          onReply={(content) => handleSubmit(content, thought.id)}
          onEdit={(content) => editThought(thought.id, content)}
          onDelete={() => removeThought(thought.id)}
        />
      ))}
    </div>
  );
}
```

### useFormState

Generieke form state management met dirty tracking.

```typescript
import { useFormState, useArraySelection } from '@/hooks';

interface EventFormData {
  title: string;
  description: string;
  date: Date;
  maxParticipants: number;
}

function EventForm() {
  const {
    formData,
    updateField,
    isDirty,
    resetForm,
  } = useFormState<EventFormData>({
    title: '',
    description: '',
    date: new Date(),
    maxParticipants: 10,
  });

  // Tag selection
  const {
    selected: selectedTags,
    toggle: toggleTag,
    clear: clearTags,
  } = useArraySelection<string>([]);

  return (
    <form>
      <input
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
      />
      {isDirty && <Badge>Unsaved changes</Badge>}
    </form>
  );
}
```

## 🔄 Migratie naar React Native

### Stap 1: Shared Package Maken

Maak een gedeeld package voor hooks:

```bash
# In monorepo root
mkdir -p packages/shared/src/hooks
```

### Stap 2: Hooks Verplaatsen

Verplaats alle hooks naar het shared package:

```
packages/shared/
├── package.json
├── tsconfig.json
└── src/
    └── hooks/
        ├── index.ts
        ├── useAuth.ts
        ├── useGeolocation.ts
        ├── useDateFiltering.ts
        ├── useRankingLevels.ts
        ├── useMediaUpload.ts
        ├── useThoughts.ts
        └── useFormState.ts
```

### Stap 3: Package.json voor Shared

```json
{
  "name": "@padel-community/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "date-fns": "^2.30.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

### Stap 4: Import in Web App

```typescript
// packages/frontend/src/pages/Events.tsx
import { useGeolocation, useDateFiltering, useAuth } from '@padel-community/shared';
```

### Stap 5: Import in React Native App

```typescript
// packages/mobile/src/screens/EventsScreen.tsx
import { useGeolocation, useDateFiltering, useAuth } from '@padel-community/shared';

function EventsScreen() {
  const { isWithinRadius } = useGeolocation();
  const { isDateInRange } = useDateFiltering();

  // Exact same logic, different UI components
  return (
    <View>
      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => <EventCard event={item} />}
      />
    </View>
  );
}
```

## 🎨 UI vs Logic Scheiding

### ❌ Voor (Mixed Logic & UI)

```typescript
// Events.tsx - 1500+ lines, logic en UI mixed
function Events() {
  const [events, setEvents] = useState([]);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('');

  // 50+ lines van filtering logica
  const filteredEvents = events.filter(event => {
    const distance = calculateDistance(...);
    return distance <= parseInt(radius);
  });

  return <div>... 500+ lines van JSX ...</div>;
}
```

### ✅ Na (Gescheiden Logic & UI)

```typescript
// useEventFiltering.ts - Pure business logic
export const useEventFiltering = () => {
  const geo = useGeolocation();
  const date = useDateFiltering();
  const tags = useArraySelection();

  const filterEvents = (events) => {
    return events.filter(event =>
      geo.isWithinRadius(event.lat, event.lng) &&
      date.isDateInRange(event.date) &&
      (tags.count === 0 || tags.isSelected(event.tag))
    );
  };

  return { filterEvents, geo, date, tags };
};

// Events.tsx - Clean UI component
function Events() {
  const { events } = useEvents();
  const filtering = useEventFiltering();

  return <EventList events={filtering.filterEvents(events)} />;
}
```

## 📱 Platform-Specific Aanpassingen

### Supabase Client

Voor hooks die Supabase gebruiken (useAuth, useThoughts), maak een platform-agnostic wrapper:

```typescript
// packages/shared/src/lib/database.ts
export interface DatabaseClient {
  auth: {
    getSession: () => Promise<any>;
    onAuthStateChange: (callback: Function) => any;
    signOut: () => Promise<void>;
  };
  from: (table: string) => any;
}

// Web: packages/frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
export const db: DatabaseClient = createClient(...);

// React Native: packages/mobile/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const db: DatabaseClient = createClient(..., {
  auth: { storage: AsyncStorage }
});
```

## 🧪 Testing

Hooks zijn gemakkelijker te testen omdat ze gescheiden zijn van UI:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useGeolocation } from '@/hooks';

describe('useGeolocation', () => {
  it('should calculate distance correctly', () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.setSelectedLocationCoords({ lat: 50.8, lng: 4.3 });
    });

    const distance = result.current.getDistance(51.0, 4.5);
    expect(distance).toBeCloseTo(25, 0); // ~25km
  });
});
```

## 📚 Best Practices

1. **Eén verantwoordelijkheid** - Elke hook doet één ding goed
2. **Type-safe** - Gebruik TypeScript interfaces voor alle parameters en return types
3. **Platform-agnostic** - Geen web-specific of React Native-specific code in hooks
4. **Testbaar** - Pure functies waar mogelijk, dependency injection voor external services
5. **Documentatie** - JSDoc comments voor alle publieke functies
6. **Error handling** - Consistente error handling met callbacks

## 🔗 Dependencies

Hooks hebben minimale dependencies om platform-agnostic te blijven:

- ✅ `react` - Core hooks (useState, useEffect, useCallback, useMemo)
- ✅ `date-fns` - Platform-agnostic date utilities
- ❌ `react-dom` - Web-specific, vermijd in hooks
- ❌ `react-native` - Native-specific, vermijd in hooks

Voor platform-specific functionaliteit, gebruik dependency injection:

```typescript
// Good: Platform-agnostic
export const useMediaUpload = (onError?: (msg: string) => void) => {
  // Logic...
};

// Usage in Web
import { toast } from 'sonner';
const media = useMediaUpload((msg) => toast.error(msg));

// Usage in React Native
import { Alert } from 'react-native';
const media = useMediaUpload((msg) => Alert.alert('Error', msg));
```

## 🚀 Volgende Stappen

1. Refactor bestaande componenten om nieuwe hooks te gebruiken
2. Maak platform-agnostic `lib/` utilities
3. Set up shared package in monorepo
4. Start React Native app met gedeelde hooks
5. Implementeer platform-specific UI components

Voor vragen of suggesties, zie de [CONTRIBUTING.md](../../CONTRIBUTING.md).
