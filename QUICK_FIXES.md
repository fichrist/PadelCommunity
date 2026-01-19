# Quick Fixes - Common Issues

## ✅ Fixed: useMobile Export Error

**Error:**
```
index.ts:40 Uncaught SyntaxError: The requested module '/src/hooks/use-mobile.tsx'
does not provide an export named 'useMobile'
```

**Cause:**
De functie in `use-mobile.tsx` heet `useIsMobile` maar we probeerden `useMobile` te exporteren.

**Fix:**
Updated [packages/frontend/src/hooks/index.ts](packages/frontend/src/hooks/index.ts):
```typescript
// Voor:
export { useMobile } from './use-mobile';

// Na:
export { useIsMobile } from './use-mobile';
```

**Status:** ✅ Fixed

---

## Mogelijke Andere Issues

### Issue: Button import in EventFilters

Als je deze error ziet:
```
Cannot find module '@/components/ui/button'
```

**Check:**
Zorg dat alle shadcn/ui components geïnstalleerd zijn:
```bash
cd packages/frontend
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
```

### Issue: Missing imports in refactored Events.tsx

Als je import errors ziet in Events.tsx, check deze imports:

**Required Hooks:**
```typescript
import {
  useAuth,
  useGeolocation,
  useDateFiltering,
  useArraySelection,
  useEvents,
  useEventEnrollment,
  useMatchManagement,
  useThoughts,
  getAvailableRankingLevels,
  calculateDistance,
} from "@/hooks";
```

**Required Components:**
```typescript
import { Card } from "@/components/ui/card";
import ThoughtsModal from "@/components/ThoughtsModal";
import CommunityEventCard from "@/components/CommunityEventCard";
import TPMemberSetupDialog from "@/components/TPMemberSetupDialog";
import { EventFilters } from "@/components/EventFilters";
```

**Required Assets:**
```typescript
import spiritualBackground from "@/assets/spiritual-background.jpg";
import elenaProfile from "@/assets/elena-profile.jpg";
```

### Issue: TypeScript errors in hooks

Als TypeScript klaagt over return types, check dat je de interfaces importeert:

```typescript
// In useGeolocation.ts
export interface UseGeolocationReturn {
  // ... interface definition
}

// In consuming component
import { UseGeolocationReturn } from '@/hooks';
```

### Issue: Supabase types

Als je TypeScript errors ziet voor Supabase queries, check je `supabase/database.types.ts`:

```bash
cd packages/frontend
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

---

## Testing the Refactored Code

### 1. Check Development Server

```bash
cd packages/frontend
npm run dev
```

Visit `http://localhost:5173` (or your configured port)

### 2. Check for Console Errors

Open browser DevTools (F12) and check:
- ✅ No import errors
- ✅ No TypeScript errors
- ✅ No runtime errors

### 3. Test Events Page

Navigate to `/events` and test:
- ✅ Events load correctly
- ✅ Filters work (location, date, ranking)
- ✅ Events can be clicked
- ✅ Matches display correctly

### 4. Test Hooks Individually

You can test hooks in isolation:

```typescript
// In a test file or component
import { useGeolocation } from '@/hooks';

function TestComponent() {
  const geo = useGeolocation();

  console.log('Location:', geo.selectedLocation);
  console.log('Coords:', geo.selectedLocationCoords);

  return <div>Testing...</div>;
}
```

---

## Rollback if Needed

If you encounter critical issues, rollback to the original:

```bash
# Restore original Events.tsx
cp packages/frontend/src/pages/Events.tsx.backup packages/frontend/src/pages/Events.tsx
```

**Note:** The backup is saved at:
`packages/frontend/src/pages/Events.tsx.backup`

---

## Get Help

If you encounter other issues:

1. Check the full error message in browser console
2. Check [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for similar issues
3. Check [hooks/README.md](packages/frontend/src/hooks/README.md) for hook usage
4. Review the hook implementation files in `packages/frontend/src/hooks/`

---

## Status

- ✅ useMobile export fixed
- ✅ All hooks created and exported
- ✅ Events.tsx refactored successfully
- ✅ EventFilters component created
- ✅ Documentation complete

**Last Updated:** 2026-01-18
