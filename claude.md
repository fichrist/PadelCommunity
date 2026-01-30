# PadelCommunity Project Rules

## Architecture Principles

### Separation of Concerns
- **NEVER** put business logic directly in UI components (React components, pages)
- **ALWAYS** extract business logic to separate utility/service files in `/lib` or `/services`
- UI components should ONLY handle:
  - Rendering
  - User interactions (onClick handlers that call lib functions)
  - Local UI state (modals open/closed, form inputs)
  - Display logic (formatting, conditional rendering)

### Code Organization
- Business logic → `/lib` or `/services` folders
- React hooks for data fetching → `/hooks` folder
- UI components → `/components` and `/pages` folders
- Type definitions → shared in lib files or separate `/types` folder

### Platform-Agnostic Code
- All business logic must be platform-agnostic (work in both React Web and React Native)
- Avoid React-specific code (useState, useEffect, etc.) in business logic files
- Only use TypeScript/JavaScript standard features in lib files

### Supabase Client Usage
De main `supabase` client (`import { supabase }`) kan hangen door interne locking na inactiviteit. Gebruik daarom:

- **Data operaties** (`.from()`, `.rpc()`): gebruik **`getDataClient()`** — dit is een singleton die `customFetch` gebruikt en nooit hangt
- **Auth operaties** (`.auth.*`): gebruik de main `supabase` client, of de safe wrappers (`getSessionSafe`, `getUserSafe`, `getUserIdFromStorage`)
- **Realtime** (`.channel()`): gebruik de main `supabase` client
- **Storage** (`.storage.*`): gebruik de main `supabase` client
- **Token refresh**: gebruik `directTokenRefresh()` of `syncRefreshToken()`, NOOIT `supabase.auth.refreshSession()`

```typescript
// ❌ BAD - kan hangen na 10+ min inactiviteit
import { supabase } from "@/integrations/supabase/client";
const { data } = await supabase.from('profiles').select('*');

// ✅ GOOD - gebruikt data client die nooit hangt
import { getDataClient } from "@/integrations/supabase/client";
const { data } = await getDataClient().from('profiles').select('*');

// ✅ GOOD - auth operaties via safe wrappers
import { getUserIdFromStorage, getSessionSafe } from "@/integrations/supabase/client";
const userId = getUserIdFromStorage(); // synchrone localStorage read
const session = await getSessionSafe(); // met timeout fallback

// ✅ GOOD - storage en realtime via main client
import { supabase } from "@/integrations/supabase/client";
await supabase.storage.from('avatars').upload(path, file);
supabase.channel('my-channel').on(...).subscribe();
```

### When Creating New Features
1. First create the business logic function in `/lib`
2. Then create/update the UI component to use that function
3. Ensure the lib function can be tested independently
4. Document parameters and return values

### Refactoring Existing Code
- If you see business logic in a component, immediately suggest refactoring it to `/lib`
- Don't wait to be asked - proactively suggest the separation

## Examples

### ❌ BAD - Logic in UI component
```typescript
// CreateMatch.tsx
const handleSubmit = async () => {
  // 100+ lines of business logic here
  const profiles = await supabase.from('profiles').select()
  for (const profile of profiles) {
    // complex matching logic
  }
}
```

### ✅ GOOD - Logic in separate file
```typescript
// lib/matchParticipants.ts
export async function processMatchParticipants(participants, userId) {
  // All business logic here
}

// CreateMatch.tsx
const handleSubmit = async () => {
  await processMatchParticipants(insertedParticipants, user.id)
}
```

# Database Migraties

## BELANGRIJK: Gebruik NOOIT `supabase link`

Voor migraties altijd de `--db-url` flag gebruiken, NIET linken.

## Credentials

Database URLs staan in het `.env` bestand in de root (gitignored):
- `DATABASE_URL_LOCAL` → lokale Supabase
- `DATABASE_URL_PROD` → productie Supabase

**NOOIT credentials in dit bestand of andere tracked files zetten!**

### Lokale database
Lees de waarde van `DATABASE_URL_LOCAL` uit `.env` en gebruik die:
```bash
supabase db push --db-url "<waarde van DATABASE_URL_LOCAL uit .env>"
```

### Productie database
Lees de waarde van `DATABASE_URL_PROD` uit `.env` en gebruik die:
```bash
supabase db push --db-url "<waarde van DATABASE_URL_PROD uit .env>"
```

## Regels

1. Vraag ALTIJD welke omgeving (local/prod) voordat je migraties uitvoert
2. Gebruik NOOIT `supabase link`
3. Gebruik ALTIJD `--db-url` met de juiste URL uit het `.env` bestand
4. Vraag bevestiging voordat je naar productie migreert
5. Zet NOOIT database credentials in tracked files (claude.md, code, etc.)