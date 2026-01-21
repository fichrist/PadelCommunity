# Azure Functions Deployment Script
# This script builds and deploys the Azure Functions to Azure

Write-Host "Building Azure Functions..." -ForegroundColor Cyan
npm run build

Write-Host "`nDeploying to Azure Function App 'PadelCommunity'..." -ForegroundColor Cyan
Set-Location dist
func azure functionapp publish PadelCommunity --javascript

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "`nYour functions are available at:" -ForegroundColor Yellow
Write-Host "  - https://padelcommunity-gbewdhc3f0gsc5dr.westeurope-01.azurewebsites.net/api/lookForTpPlayers" -ForegroundColor White
Write-Host "  - https://padelcommunity-gbewdhc3f0gsc5dr.westeurope-01.azurewebsites.net/api/scrapePlaytomic" -ForegroundColor White
Write-Host "  - https://padelcommunity-gbewdhc3f0gsc5dr.westeurope-01.azurewebsites.net/api/lookForTPPlayerInfo" -ForegroundColor White

Set-Location ..
