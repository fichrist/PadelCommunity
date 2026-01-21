# Switch Supabase CLI to production project

Write-Host "Switching to PRODUCTION project (avwrplietxyrdqevpayb)..." -ForegroundColor Cyan

# Update project reference
Set-Content -Path ".temp/project-ref" -Value "avwrplietxyrdqevpayb"

# Update pooler URL
Set-Content -Path ".temp/pooler-url" -Value "postgresql://postgres.avwrplietxyrdqevpayb@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

Write-Host "✓ Switched to production project" -ForegroundColor Green
Write-Host "  Project: avwrplietxyrdqevpayb" -ForegroundColor White
Write-Host "  Region: eu-north-1" -ForegroundColor White
Write-Host ""
Write-Host "Now you can run: npx supabase db push --password fRxBLWcZHFVKm8Vu" -ForegroundColor Yellow
