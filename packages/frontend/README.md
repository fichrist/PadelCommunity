# Sacred Paths Frontend

React + Vite frontend application for the Sacred Paths social media platform.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

From the frontend directory:

```bash
npm install
```

### Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:5173` with hot module replacement (HMR).

### Production Build

```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── assets/           # Images and static assets
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── data/            # Mock data and constants
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Third-party integrations
│   │   └── supabase/   # Supabase client and types
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components (routes)
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Public static files
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## 📄 Key Pages

- **Index** (`/`) - Landing page with hero section
- **Community** (`/community`) - Social feed with posts and shares
- **Events** (`/events`) - Browse spiritual events
- **People** (`/people`) - Discover healers and practitioners
- **Profile** (`/profile`) - User profile management
- **Chat** (`/chat`) - Messaging interface
- **Settings** (`/settings`) - User settings

## 🎨 UI Components

The project uses shadcn/ui components built on Radix UI primitives. All UI components are located in `src/components/ui/`.

### Adding New UI Components

Use the shadcn CLI to add components:

```bash
npx shadcn-ui@latest add [component-name]
```

For example:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

## 🔌 Supabase Integration

The frontend connects to Supabase for:
- Authentication
- Database operations
- Real-time subscriptions
- File storage

Supabase client is configured in:
- `src/integrations/supabase/client.ts`
- `src/lib/supabase.ts`

## 🎯 Key Features

- **Authentication**: User signup/login with Supabase Auth
- **Social Feed**: Post updates, share content, interact with community
- **Events**: Browse, create, and manage spiritual events
- **Profile Management**: Customize user profiles with bio, images, etc.
- **Real-time Chat**: Message other users
- **Calendar**: Personal event calendar
- **Search**: Find events, people, and content
- **Responsive Design**: Mobile-first responsive layout

## 🧩 Custom Hooks

Located in `src/hooks/`:
- `use-mobile.tsx` - Responsive mobile detection
- `use-toast.ts` - Toast notification management

## 🔧 Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to components will reflect immediately without full page reload.

### TypeScript

The project uses strict TypeScript. Ensure all types are properly defined.

### Tailwind CSS

Use Tailwind utility classes for styling. Configuration in `tailwind.config.ts`.

### Code Organization

- Place reusable components in `src/components/`
- Place page components in `src/pages/`
- Place utility functions in `src/lib/`
- Place custom hooks in `src/hooks/`

## 📝 Adding New Pages

1. Create page component in `src/pages/`:
```tsx
// src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

2. Add route in `App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
```

## 🎨 Styling Guidelines

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use shadcn/ui components for consistency
- Maintain dark mode support with next-themes

## 🔐 Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the client:

```env
VITE_SUPABASE_PROJECT_ID="..."
VITE_SUPABASE_URL="..."
VITE_SUPABASE_ANON_KEY="..."
```

Access them with:
```typescript
const url = import.meta.env.VITE_SUPABASE_URL;
```

## 📦 Build Output

Production builds are output to `dist/` directory:

```bash
npm run build
```

The build is optimized and minified, ready for deployment.

## 🚀 Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

Make sure to set environment variables in your deployment platform.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase Docs](https://supabase.com/docs)
