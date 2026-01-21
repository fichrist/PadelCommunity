# Switch Supabase CLI to development project

Write-Host "Switching to DEVELOPMENT project (djnljqrarilsuodmetdl)..." -ForegroundColor Cyan

# Update project reference
Set-Content -Path ".temp/project-ref" -Value "djnljqrarilsuodmetdl"

# Update pooler URL
Set-Content -Path ".temp/pooler-url" -Value "postgresql://postgres.djnljqrarilsuodmetdl:ENQWwjpCnBhquhcm@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

Write-Host "✓ Switched to development project" -ForegroundColor Green
Write-Host "  Project: djnljqrarilsuodmetdl" -ForegroundColor White
Write-Host "  Region: eu-west-1" -ForegroundColor White
Write-Host ""
Write-Host "Now you can run: npx supabase db push --password ENQWwjpCnBhquhcm" -ForegroundColor Yellow
