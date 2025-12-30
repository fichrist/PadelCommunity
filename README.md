# Sacred Paths Connect - Monorepo

A social media platform for spiritual community building with Supabase integration.

## 🏗️ Project Structure

This is a monorepo containing both frontend and backend packages:

```
sacred-paths-connect/
├── packages/
│   ├── frontend/          # React + Vite frontend application
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── backend/           # Express + TypeScript backend API
│       ├── src/
│       ├── supabase/
│       ├── package.json
│       └── tsconfig.json
├── package.json           # Root package.json for workspace management
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fichrist/sacred-paths-connect.git
cd sacred-paths-connect
```

2. Install all dependencies:
```bash
npm install
```

This will install dependencies for both frontend and backend packages.

### Environment Variables

#### Frontend (.env in packages/frontend/)
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

#### Backend (.env in packages/backend/)
```env
PORT=3001
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_PROJECT_ID="your-project-id"
```

## 📦 Available Scripts

### Root Level Scripts

Run from the root directory:

```bash
# Run both frontend and backend in development mode
npm run dev

# Run only frontend
npm run dev:frontend

# Run only backend
npm run dev:backend

# Build all packages
npm run build

# Build only frontend
npm run build:frontend

# Build only backend
npm run build:backend
```

### Frontend Scripts

Run from `packages/frontend/`:

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Backend Scripts

Run from `packages/backend/`:

```bash
# Start development server (http://localhost:3001)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server
npm run start

# Run linter
npm run lint
```

## 🏛️ Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod

### Backend

- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js
- **Database**: Supabase (PostgreSQL)
- **API Style**: RESTful
- **Development**: tsx watch for hot reload

## 🗄️ Database

The project uses Supabase as the backend-as-a-service platform. Database migrations are located in `packages/backend/supabase/migrations/`.

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project credentials to the `.env` files
3. Run migrations using the Supabase CLI or dashboard

## 🔗 API Endpoints

The backend provides the following REST API endpoints:

- `GET /health` - Health check
- `GET /api/events` - Get all events
- `GET /api/users/:id` - Get user profile by ID
- `POST /api/events` - Create a new event

## 🛠️ Development Workflow

1. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

2. **Make Changes**:
   - Frontend code in `packages/frontend/src/`
   - Backend code in `packages/backend/src/`

3. **Test Your Changes**:
   - Both servers support hot reload
   - Frontend changes reflect immediately
   - Backend restarts automatically with tsx watch

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues and questions, please open an issue on GitHub.
