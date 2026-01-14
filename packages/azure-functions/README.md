# PadelCommunity Azure Functions

Azure Functions voor PadelCommunity applicatie.

## Functions

### lookForTpRanking

Zoekt naar de TP (Tennis en Padel Vlaanderen) ranking van een speler.

**Endpoint:** `POST /api/lookForTpRanking`

**Headers:**
- `Authorization: Bearer <token>` - Supabase auth token

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "info": "John Doe | Club Name | P500",
        "ranking": "P500",
        "userId": "123456"
      }
    ],
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Lokaal ontwikkelen

1. Installeer dependencies:
   ```bash
   npm install
   ```

2. Kopieer `local.settings.json.example` naar `local.settings.json` en vul de environment variables in:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Build en start:
   ```bash
   npm run start
   ```

## Deployment

Deploy naar Azure met de Azure Functions Core Tools of via Azure Portal.

```bash
func azure functionapp publish <FunctionAppName>
```
