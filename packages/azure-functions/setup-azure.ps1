# Setup Azure Function App with correct configuration

Write-Host "Configuring Azure Function App settings..." -ForegroundColor Cyan

# Set all required settings
az functionapp config appsettings set `
  --name PadelCommunity `
  --resource-group PadelCommunity `
  --settings `
    FUNCTIONS_WORKER_RUNTIME=node `
    WEBSITE_NODE_DEFAULT_VERSION=~20 `
    AzureWebJobsFeatureFlags=EnableWorkerIndexing `
    FUNCTIONS_EXTENSION_VERSION=~4

Write-Host "`nRestarting Function App..." -ForegroundColor Cyan
az functionapp restart --name PadelCommunity --resource-group PadelCommunity

Write-Host "`nWaiting for restart to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "`nConfiguration complete! Now deploying functions..." -ForegroundColor Green
cd C:\PadelCommunity\packages\azure-functions\dist
func azure functionapp publish PadelCommunity --javascript

Write-Host "`nDeployment complete!" -ForegroundColor Green
