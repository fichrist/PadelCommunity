# Monorepo Migration Guide

## Overview

Your Sacred Paths Connect project has been successfully restructured into a monorepo with separate frontend and backend packages.

## What Changed

### Before (Single Repository)
```
sacred-paths-connect/
├── src/                    # Frontend source
├── public/                 # Frontend public assets
├── supabase/              # Database migrations
├── package.json           # Frontend dependencies
├── vite.config.ts
└── ...config files
```

### After (Monorepo)
```
sacred-paths-connect/
├── packages/
│   ├── frontend/          # React frontend (Vite)
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── ...
│   └── backend/           # Express backend (Node.js)
│       ├── src/
│       │   ├── index.ts
│       │   └── lib/
│       ├── supabase/
│       ├── package.json
│       └── tsconfig.json
├── package.json           # Root workspace config
└── README.md
```

## ✅ Migration Checklist

### Completed Tasks
- ✅ Created monorepo structure with `packages/` directory
- ✅ Moved frontend code to `packages/frontend/`
- ✅ Created backend structure in `packages/backend/`
- ✅ Set up Express.js backend with TypeScript
- ✅ Configured Supabase integration in backend
- ✅ Created separate `.env` files for frontend and backend
- ✅ Updated all package.json files
- ✅ Created comprehensive README documentation
- ✅ Set up workspace configuration
- ✅ Installed all dependencies
- ✅ Removed old root-level files

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

This installs dependencies for both packages using npm workspaces.

### Run Development Servers

**Option 1: Run both together (from root)**
```bash
npm run dev
```

**Option 2: Run individually (from root)**
```bash
# Frontend only (http://localhost:5173)
npm run dev:frontend

# Backend only (http://localhost:3001)
npm run dev:backend
```

**Option 3: Run from package directories**
```bash
# Frontend
cd packages/frontend
npm run dev

# Backend
cd packages/backend
npm run dev
```

## 📦 Package Scripts

### Root Level (run from project root)
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run build` - Build both packages
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only

### Frontend (packages/frontend)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (packages/backend)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run production server
- `npm run lint` - Run ESLint

## 🔧 Environment Variables

### Frontend (.env in packages/frontend/)
```env
VITE_SUPABASE_PROJECT_ID="udrjxnlcsexahuvohqkr"
VITE_SUPABASE_URL="https://udrjxnlcsexahuvohqkr.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### Backend (.env in packages/backend/)
```env
PORT=3001
SUPABASE_URL="https://udrjxnlcsexahuvohqkr.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_PROJECT_ID="udrjxnlcsexahuvohqkr"
```

## 🎯 Key Benefits

1. **Separation of Concerns**: Frontend and backend are clearly separated
2. **Independent Deployment**: Deploy frontend and backend separately
3. **Shared Dependencies**: Common packages managed at workspace level
4. **Better Organization**: Easier to navigate and maintain
5. **Scalability**: Easy to add more packages (mobile app, shared utilities, etc.)
6. **Type Safety**: TypeScript across both packages
7. **Development Workflow**: Run both servers simultaneously or independently

## 🔗 Backend API

The backend provides a REST API at `http://localhost:3001`:

- `GET /health` - Health check endpoint
- `GET /api/events` - Get all events
- `GET /api/users/:id` - Get user by ID
- `POST /api/events` - Create new event

### Testing the Backend

```bash
# Health check
curl http://localhost:3001/health

# Get events (requires running backend)
curl http://localhost:3001/api/events
```

## 📁 Project Structure Details

### Frontend Package
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: Radix UI + shadcn/ui + Tailwind CSS
- **Routing**: React Router v6
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod

### Backend Package
- **Framework**: Express.js + TypeScript
- **Runtime**: Node.js
- **Database**: Supabase (PostgreSQL)
- **Dev Tool**: tsx (hot reload)
- **API**: RESTful

## 🛠️ Development Workflow

1. **Start Development**:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

2. **Make Changes**:
   - Frontend changes auto-reload with HMR
   - Backend restarts automatically with tsx watch

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Deploy**:
   - Frontend: Deploy `packages/frontend/dist/` to static hosting
   - Backend: Deploy `packages/backend/` to Node.js hosting

## 📚 Documentation

- Root README: `./README.md`
- Frontend README: `./packages/frontend/README.md`
- Backend README: `./packages/backend/README.md`

## 🚨 Important Notes

1. **Database Migrations**: Supabase migrations are in `packages/backend/supabase/migrations/`
2. **Environment Files**: Each package has its own `.env` file
3. **Dependencies**: Install from root using `npm install`
4. **Port Configuration**: Frontend uses 5173, Backend uses 3001
5. **CORS**: Backend CORS is configured to allow cross-origin requests

## 🎉 Next Steps

1. **Test the Frontend**:
   ```bash
   npm run dev:frontend
   ```
   Visit http://localhost:5173

2. **Test the Backend**:
   ```bash
   npm run dev:backend
   ```
   Visit http://localhost:3001/health

3. **Connect Frontend to Backend**:
   - Update API calls in frontend to use backend endpoints
   - Configure proxy in Vite if needed

4. **Deploy**:
   - Frontend: Vercel, Netlify, or static hosting
   - Backend: Heroku, Railway, AWS, or similar

## 🤝 Contributing

The monorepo structure makes it easier for multiple developers to work on different parts:
- Frontend developers work in `packages/frontend/`
- Backend developers work in `packages/backend/`
- Clear separation reduces merge conflicts

## 🔄 Migration Complete!

Your project is now a fully functional monorepo. All your original code has been preserved and is now better organized for future development and scaling.

---

**Need Help?** Check the README files in each package for detailed information.
