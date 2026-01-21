# Configure Azure Function App settings for Node.js v4 programming model

Write-Host "Configuring Azure Function App settings..." -ForegroundColor Cyan

# Set the Node.js version and programming model
az functionapp config appsettings set --name PadelCommunity --resource-group PadelCommunity --settings "FUNCTIONS_WORKER_RUNTIME=node"
az functionapp config appsettings set --name PadelCommunity --resource-group PadelCommunity --settings "AzureWebJobsFeatureFlags=EnableWorkerIndexing"

# Set Node.js version to 20 (required for v4 model)
az functionapp config set --name PadelCommunity --resource-group PadelCommunity --linux-fx-version "NODE|20"

Write-Host "`nConfiguration complete!" -ForegroundColor Green
Write-Host "Restarting function app..." -ForegroundColor Cyan

az functionapp restart --name PadelCommunity --resource-group PadelCommunity

Write-Host "`nFunction app restarted. Please wait a minute for functions to initialize." -ForegroundColor Green
