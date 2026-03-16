---
name: azure-functions-deploy
description: 'Deploy Azure Functions (Node.js/TypeScript v4 model) to an existing Function App. Covers build, publish, EasyAuth troubleshooting, CORS config, App Insights wiring, and metric alerts. Use when deploying functions to Azure.'
---

# Azure Functions Deploy Playbook

## Pre-deployment Checklist

1. **Verify Function App exists and is running:**
   ```
   az functionapp show --name <APP> --resource-group <RG> --query "{state:state, runtime:siteConfig.linuxFxVersion}"
   ```

2. **Check app settings:**
   ```
   az functionapp config appsettings list --name <APP> --resource-group <RG> --query "[].name" -o tsv
   ```

3. **Build TypeScript:**
   ```
   cd api && npm ci && npm run build
   ```

## Deploy

```
func azure functionapp publish <APP_NAME> --node
```

## Post-deployment Verification

### EasyAuth Gotcha
If endpoints return 401, check EasyAuth:
```
az rest --method GET --uri "/subscriptions/<SUB>/resourceGroups/<RG>/providers/Microsoft.Web/sites/<APP>/config/authsettingsV2?api-version=2023-12-01"
```

To disable (for public APIs with function-level anonymous auth):
```powershell
$body = @{properties=@{platform=@{enabled=$false};globalValidation=@{requireAuthentication=$false;unauthenticatedClientAction=3}}} | ConvertTo-Json -Depth 5 -Compress
az rest --method PUT --uri "...authsettingsV2?api-version=2023-12-01" --headers "Content-Type=application/json" --body $body
```
**IMPORTANT:** Restart the Function App after auth changes.

### CORS
```
az functionapp cors add --name <APP> --resource-group <RG> --allowed-origins "https://your-frontend.domain"
```

### App Insights Wiring
If APPLICATIONINSIGHTS_CONNECTION_STRING is missing:
```
az functionapp config appsettings set --name <APP> --resource-group <RG> --settings "APPLICATIONINSIGHTS_CONNECTION_STRING=<CONN_STRING>"
```

### Missing Data Alert
```
az monitor metrics alert create --name "<ALERT>" --resource-group <RG> --scopes <FUNC_RESOURCE_ID> --condition "total FunctionExecutionCount < 1" --window-size 15m --evaluation-frequency 5m --severity 2
```

## CI/CD (GitHub Actions)
Use `Azure/functions-action@v1` with OIDC auth (`azure/login@v2`). Requires secrets: AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID.
