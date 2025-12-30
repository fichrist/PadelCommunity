# Sacred Paths Backend API

Express.js backend service with TypeScript and Supabase integration.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Supabase account and project

### Installation

From the backend directory:

```bash
npm install
```

### Environment Setup

Create a `.env` file in the backend directory:

```env
PORT=3001
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_PROJECT_ID="your-project-id"
```

### Development

```bash
npm run dev
```

The server will start at `http://localhost:3001` with hot reload enabled.

### Production Build

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check

```http
GET /health
```

Returns the server status.

**Response:**
```json
{
  "status": "ok",
  "message": "Sacred Paths Backend API is running"
}
```

### Get All Events

```http
GET /api/events
```

Retrieves all events from the database, ordered by creation date (newest first).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Event Title",
      "description": "Event Description",
      "created_at": "timestamp",
      ...
    }
  ]
}
```

### Get User Profile

```http
GET /api/users/:id
```

Retrieves a user profile by ID.

**Parameters:**
- `id` (string): User UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "username",
    "email": "email@example.com",
    ...
  }
}
```

### Create Event

```http
POST /api/events
```

Creates a new event.

**Request Body:**
```json
{
  "title": "Event Title",
  "description": "Event Description",
  "date": "2025-01-01",
  "location": "Event Location",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Event Title",
    ...
  }
}
```

## 🗄️ Database

The backend uses Supabase for database operations. The database schema is managed through migrations located in the `supabase/migrations/` directory.

### Running Migrations

Migrations can be run through:
1. Supabase Dashboard
2. Supabase CLI:
   ```bash
   supabase db push
   ```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── index.ts          # Main application entry point
│   └── lib/
│       └── supabase.ts   # Supabase client configuration
├── supabase/
│   ├── config.toml       # Supabase configuration
│   └── migrations/       # Database migrations
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Development**: tsx (TypeScript Execute)

## 🔐 Security

- CORS enabled for cross-origin requests
- Environment variables for sensitive configuration
- Supabase Row Level Security (RLS) for database access control

## 📝 Adding New Endpoints

1. Open `src/index.ts`
2. Add your endpoint handler:
```typescript
app.get('/api/your-endpoint', async (req, res) => {
  try {
    // Your logic here
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error message' });
  }
});
```

## 🧪 Testing

Currently, testing is manual. Recommended tools:
- Postman
- Thunder Client (VS Code extension)
- curl

## 📦 Dependencies

### Production
- `express`: Web framework
- `@supabase/supabase-js`: Supabase client
- `cors`: CORS middleware
- `dotenv`: Environment variable management
- `zod`: Schema validation

### Development
- `typescript`: TypeScript compiler
- `tsx`: TypeScript execution
- `@types/*`: Type definitions

## 🤝 Contributing

1. Create a feature branch
2. Add your changes
3. Test thoroughly
4. Submit a pull request
