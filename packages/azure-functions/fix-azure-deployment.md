# Azure Functions Deployment Fix

## Problem
Functions are deployed but not showing up in Azure Portal.

## Root Cause
Azure Functions v4 programming model requires specific configuration that wasn't set up.

## Solution

### Step 1: Configure Azure Function App Settings (via Azure Portal)

1. Go to https://portal.azure.com
2. Navigate to your **PadelCommunity** Function App
3. Click **Configuration** in the left menu
4. Under **Application settings**, verify/add these settings:

   | Name | Value |
   |------|-------|
   | `FUNCTIONS_WORKER_RUNTIME` | `node` |
   | `WEBSITE_NODE_DEFAULT_VERSION` | `~20` |
   | `AzureWebJobsFeatureFlags` | `EnableWorkerIndexing` |

5. Click **Save** at the top
6. Click **Overview** in the left menu
7. Click **Restart** at the top

### Step 2: Redeploy from PowerShell

Wait 1 minute after restart, then run:

```powershell
cd C:\PadelCommunity\packages\azure-functions\dist
func azure functionapp publish PadelCommunity --javascript
```

### Step 3: Verify Deployment

After deployment completes, check:

1. The PowerShell output should show:
   ```
   Functions in PadelCommunity:
       lookForTPPlayerInfo - [httpTrigger]
       lookForTpPlayers - [httpTrigger]
       scrapePlaytomic - [httpTrigger]
   ```

2. In Azure Portal → PadelCommunity → Functions, you should see all 3 functions listed

3. Test the endpoints:
   - https://padelcommunity-gbewdhc3f0gsc5dr.westeurope-01.azurewebsites.net/api/lookForTpPlayers
   - https://padelcommunity-gbewdhc3f0gsc5dr.westeurope-01.azurewebsites.net/api/scrapePlaytomic
   - https://padelcommunity-gbewdhc3f0gsc5dr.westeurope-01.azurewebsites.net/api/lookForTPPlayerInfo

## Alternative: Use Azure CLI

If you prefer command line:

```powershell
# Set application settings
az functionapp config appsettings set `
  --name PadelCommunity `
  --resource-group PadelCommunity `
  --settings "FUNCTIONS_WORKER_RUNTIME=node" "WEBSITE_NODE_DEFAULT_VERSION=~20" "AzureWebJobsFeatureFlags=EnableWorkerIndexing"

# Restart function app
az functionapp restart --name PadelCommunity --resource-group PadelCommunity

# Wait 1 minute, then redeploy
cd C:\PadelCommunity\packages\azure-functions\dist
func azure functionapp publish PadelCommunity --javascript
```

## Why This Happens

The Azure Functions v4 programming model uses a different discovery mechanism:
- **Old model**: Each function has its own `function.json` file
- **New model (v4)**: Functions are registered via `app.http()` calls and discovered via worker indexing

The `EnableWorkerIndexing` flag tells Azure to scan your code for function registrations instead of looking for individual function.json files.
