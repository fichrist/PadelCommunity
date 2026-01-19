# Bug Fixes - Runtime Issues

## ✅ Fixed: Supabase Matches Query Error

**Error:**
```
GET https://djnljqrarilsuodmetdl.supabase.co/rest/v1/matches?select=*%2Cprofile… 400 (Bad Request)

{
  code: 'PGRST200',
  message: "Could not find a relationship between 'matches' and 'user_id' in the schema cache"
}
```

**Probleem:**
De Supabase query probeerde een relatie te gebruiken die niet bestaat in de database schema.

**Voor:**
```typescript
// useEvents.ts
const { data: matchesData, error: matchesError } = await supabase
  .from('matches')
  .select(`
    *,
    profiles:user_id (
      first_name,
      last_name,
      avatar_url,
      ranking
    )
  `)
  .order('match_date', { ascending: true });

if (matchesError) throw matchesError;
```

**Na:**
```typescript
// useEvents.ts
const { data: matchesData, error: matchesError } = await supabase
  .from('matches')
  .select('*')
  .order('match_date', { ascending: true });

if (matchesError) {
  console.error('Matches error:', matchesError);
  // Don't throw - continue without matches
  setMatches([]);
} else {
  setMatches(matchesData || []);
}
```

**Waarom:**
1. De `matches` tabel heeft geen directe foreign key naar `profiles` via `user_id`
2. Als de query faalt, crasht de hele app niet meer - events laden nog steeds
3. Matches worden nu zonder profile data opgehaald

**Status:** ✅ Fixed

---

## ✅ Fixed: ThoughtsModal Undefined Array Error

**Error:**
```
ThoughtsModal.tsx:43 Uncaught TypeError: Cannot read properties of undefined (reading 'forEach')
    at organizeThoughtsTree (ThoughtsModal.tsx:43:12)
```

**Probleem:**
De `organizeThoughtsTree` functie verwachtte altijd een array, maar kreeg soms `undefined`.

**Voor:**
```typescript
// ThoughtsModal.tsx
const organizeThoughtsTree = (thoughts: Thought[]): Thought[] => {
  const thoughtsMap = new Map<string, Thought>();
  const rootThoughts: Thought[] = [];

  // First pass: Create a map and initialize replies array
  thoughts.forEach(thought => {  // <-- Crash hier als thoughts undefined is
    thoughtsMap.set(thought.id, { ...thought, replies: [] });
  });
  // ...
};
```

**Na:**
```typescript
// ThoughtsModal.tsx
const organizeThoughtsTree = (thoughts: Thought[] | undefined): Thought[] => {
  if (!thoughts || !Array.isArray(thoughts)) {
    return [];
  }

  const thoughtsMap = new Map<string, Thought>();
  const rootThoughts: Thought[] = [];

  // First pass: Create a map and initialize replies array
  thoughts.forEach(thought => {
    thoughtsMap.set(thought.id, { ...thought, replies: [] });
  });
  // ...
};
```

**Waarom:**
1. Tijdens initialisatie kan `thoughts` undefined zijn
2. De functie moet gracefully een lege array returnen
3. Voorkomt crashes tijdens modal rendering

**Status:** ✅ Fixed

---

## ✅ Fixed: useMobile Export Error

**Error:**
```
index.ts:40 Uncaught SyntaxError: The requested module '/src/hooks/use-mobile.tsx'
does not provide an export named 'useMobile'
```

**Probleem:**
Export naam kwam niet overeen met de eigenlijke functie naam.

**Voor:**
```typescript
// hooks/index.ts
export { useMobile } from './use-mobile';
```

**Na:**
```typescript
// hooks/index.ts
export { useIsMobile } from './use-mobile';
```

**Waarom:**
De functie in `use-mobile.tsx` heet `useIsMobile`, niet `useMobile`.

**Status:** ✅ Fixed

---

## 🔍 Mogelijke Toekomstige Fixes

### Database Schema - Matches Profile Relatie

Als je de profile informatie bij matches wilt tonen, moet je:

**Optie 1: Fix de database schema**
```sql
-- Voeg foreign key constraint toe als die ontbreekt
ALTER TABLE matches
ADD CONSTRAINT matches_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id);
```

Dan kan je de query updaten:
```typescript
const { data: matchesData } = await supabase
  .from('matches')
  .select(`
    *,
    profiles!matches_user_id_fkey (
      first_name,
      last_name,
      avatar_url,
      ranking
    )
  `)
  .order('match_date', { ascending: true });
```

**Optie 2: Fetch profiles apart**
```typescript
// In useEvents.ts
const { data: matchesData } = await supabase
  .from('matches')
  .select('*')
  .order('match_date', { ascending: true });

// Fetch user profiles separately
const userIds = [...new Set(matchesData?.map(m => m.user_id).filter(Boolean))];
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, first_name, last_name, avatar_url, ranking')
  .in('id', userIds);

// Combine data
const matchesWithProfiles = matchesData?.map(match => ({
  ...match,
  profile: profiles?.find(p => p.id === match.user_id)
}));
```

**Aanbeveling:** Gebruik Optie 2 (fetch apart) als je niet de database mag aanpassen.

---

## 📝 Testing Checklist

Na deze fixes, test:

- ✅ Events pagina laadt zonder errors
- ✅ Events worden getoond
- ✅ Matches worden getoond (zonder profile data)
- ✅ Filters werken (locatie, datum, ranking)
- ✅ ThoughtsModal opent zonder crashes
- ✅ Console heeft geen errors meer

---

## 🔄 Als Nieuwe Errors Verschijnen

### Pattern voor Safe Data Fetching

Gebruik dit pattern in je hooks:

```typescript
try {
  const { data, error } = await supabase.from('table').select('*');

  if (error) {
    console.error('Error:', error);
    // Set fallback state
    setSomeData([]);
    // Don't throw - let the app continue
  } else {
    setSomeData(data || []);
  }
} catch (err) {
  console.error('Unexpected error:', err);
  setSomeData([]);
}
```

### Pattern voor Safe Array Operations

```typescript
// Always check if array exists before using array methods
const organizeData = (items: Item[] | undefined): Item[] => {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  // Now safe to use .forEach, .map, etc.
  return items.filter(...).map(...);
};
```

---

**Last Updated:** 2026-01-18
**Status:** All critical bugs fixed ✅
