#!/bin/bash
# Switch Supabase CLI to development project

echo "Switching to DEVELOPMENT project (djnljqrarilsuodmetdl)..."

# Update project reference
echo "djnljqrarilsuodmetdl" > .temp/project-ref

# Update pooler URL
echo "postgresql://postgres.djnljqrarilsuodmetdl:ENQWwjpCnBhquhcm@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" > .temp/pooler-url

echo "✓ Switched to development project"
echo "  Project: djnljqrarilsuodmetdl"
echo "  Region: eu-west-1"
echo ""
echo "Now you can run: npx supabase db push --password ENQWwjpCnBhquhcm"
