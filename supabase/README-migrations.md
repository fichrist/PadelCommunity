# Running Migrations

## Current Issue
The Supabase CLI pooler connection is not working. Until this is resolved, migrations must be run manually through the SQL Editor.

## Development Database (djnljqrarilsuodmetdl)

1. Go to: https://supabase.com/dashboard/project/djnljqrarilsuodmetdl/sql/new
2. Copy the SQL from the migration file in `supabase/migrations/`
3. Paste and run it in the SQL Editor

**Project Details:**
- Project ID: djnljqrarilsuodmetdl
- Region: eu-west-1
- Password: ENQWwjpCnBhquhcm

## Production Database (avwrplietxyrdqevpayb)

1. Go to: https://supabase.com/dashboard/project/avwrplietxyrdqevpayb/sql/new
2. Copy the SQL from the migration file in `supabase/migrations/`
3. Paste and run it in the SQL Editor

**Project Details:**
- Project ID: avwrplietxyrdqevpayb
- Region: eu-north-1
- Password: fRxBLWcZHFVKm8Vu

## Attempted CLI Commands (Not Working Currently)

```bash
# Development
npx supabase db push --db-url "postgresql://postgres.djnljqrarilsuodmetdl:IRQK9iKcScvi44en@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Production
npx supabase db push --db-url "postgresql://postgres.avwrplietxyrdqevpayb:fRxBLWcZHFVKm8Vu@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
```

Error: "Tenant or user not found" - suggests pooler authentication or configuration issue.

## TODO
- [ ] Contact Supabase support about pooler connection
- [ ] Check if connection pooling needs to be enabled in project settings
- [ ] Verify correct pooler hostname format for these regions
