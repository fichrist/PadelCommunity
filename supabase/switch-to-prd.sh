#!/bin/bash
# Switch Supabase CLI to production project

echo "Switching to PRODUCTION project (avwrplietxyrdqevpayb)..."

# Update project reference
echo "avwrplietxyrdqevpayb" > .temp/project-ref

# Update pooler URL
echo "postgresql://postgres.avwrplietxyrdqevpayb@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" > .temp/pooler-url

echo "✓ Switched to production project"
echo "  Project: avwrplietxyrdqevpayb"
echo "  Region: eu-north-1"
echo ""
echo "Now you can run: npx supabase db push --password fRxBLWcZHFVKm8Vu"
