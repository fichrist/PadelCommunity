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
- Use supabase client directly in lib files, not in components
- Avoid React-specific code (useState, useEffect, etc.) in business logic files
- Only use TypeScript/JavaScript standard features in lib files

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

### Lokale database
```bash
supabase db push --db-url "postgresql://postgres.djnljqrarilsuodmetdl:ENQWwjpCnBhquhcm@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
```

### Productie database
```bash
supabase db push --db-url "$postgresql://postgres.avwrplietxyrdqevpayb:fRxBLWcZHFVKm8Vu@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"
```

## Environment variabelen

- `DATABASE_URL_LOCAL` → lokale Supabase
- `DATABASE_URL_PROD` → productie Supabase

## Regels

1. Vraag ALTIJD welke omgeving (local/prod) voordat je migraties uitvoert
2. Gebruik NOOIT `supabase link` 
3. Gebruik ALTIJD `--db-url` met de juiste environment variabele
4. Vraag bevestiging voordat je naar productie migreert