# TaskNote – Daily Tasks + Notes (Animated, Mobile-first)

TaskNote is a modern, animated daily task tracker and notes app with dark mode, offline-friendly reads, and simple login. Built with React + Vite + Tailwind and an Express API. Designed to be beautiful and ready for production hosting.


## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **React Router 6** - Client-side routing
- **TailwindCSS 3** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Radix UI** - Headless UI components
- **@tanstack/react-query** - Data fetching and caching

### Backend
- **Express.js** - Fast, unopinionated web framework for Node.js
- **TypeScript** - Type-safe JavaScript
- **Zod** - TypeScript-first schema validation

### Authentication
- Email/password with scrypt hashing
- Session tokens (JSON store for demo)

### Development Tools
- **Vite** - Fast build tool and dev server
- **PNPM** - Fast, disk space efficient package manager
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework

## ✨ Features

### 📋 Task Management
- **Daily Task Tracker** with priority levels (low/medium/high)
- Optional due date and time settings
- Quick inline editing
- Mark tasks as complete or delete them

### 📝 Notes
- Fast note capture and editing
- Full-text search functionality
- Easy delete and organization

### 🔐 Authentication
- User registration and login
- Persisted authentication tokens
- Secure session management
- Header-based login/logout

### 🌍 Offline Support
- Local caching for read operations
- Graceful offline fallbacks
- Data persistence across sessions

### 🎨 User Experience
- **Light/Dark Theme** toggle with local preferences
- **Smooth Animations** powered by Framer Motion
- **Mobile-first Design** that works on all devices
- **Responsive Layout** with modern UI components

## Quick Start
1) Install dependencies
   pnpm install

2) Development
   pnpm dev

3) Type check & tests
   pnpm typecheck
   pnpm test

4) Production build
   pnpm build
   pnpm start

## API
All endpoints are JSON over HTTP under /api.

Auth
- POST /api/auth/register { email, password, name? } → { token, user }
- POST /api/auth/login { email, password } → { token, user }
- GET  /api/auth/me (Bearer token)
- POST /api/auth/logout (Bearer token)

Tasks
- GET    /api/tasks?day=YYYY-MM-DD&q=term → { items: Task[], total }
- POST   /api/tasks { title, description?, dueDate?, priority? } → Task
- PATCH  /api/tasks/:id { title?, description?, dueDate|null?, priority?, completed? } → Task
- DELETE /api/tasks/:id → 204

Notes
- GET    /api/notes?q=term → { items: Note[], total }
- POST   /api/notes { title, content } → Note
- PATCH  /api/notes/:id { title?, content? } → Note
- DELETE /api/notes/:id → 204

Types (shared in shared/api.ts)
- Task: { id, title, description?, dueDate?, priority, completed, createdAt, updatedAt }
- Note: { id, title, content, createdAt, updatedAt }

## Configuration
- The development API is served by the same app at /api.
- Optional: PING_MESSAGE environment variable affects /api/ping response.
- Auth tokens are stored in localStorage (auth_token). Sessions are persisted in server/data/db.json for demo purposes.

## Production Deployment
- Netlify or Vercel recommended. In Builder, connect the corresponding MCP:
  - Netlify: connect, then deploy the repo (build command pnpm build, publish dir dist/spa and server script dist/server/node-build.mjs if needed).
  - Vercel: connect and deploy. Ensure Node runtime and pnpm are enabled.
- You can also run anywhere Node is available: pnpm build && pnpm start

## Security Notes
- The included auth/session and JSON store are for starter/demo use only. For production, use a managed DB and hardened auth.

## Using MongoDB + Spring Boot Backend
If you prefer a Java Spring Boot + MongoDB API:
- Host the Spring Boot service separately (e.g., /api endpoints on the same domain via proxy).
- Replace or proxy this app’s /api to your Spring endpoints, keeping the same routes and payloads for compatibility, or adjust client/lib/api-client.ts accordingly.
- Provide your MongoDB URI and auth strategy; the frontend will consume your API.

## Roadmap (suggested)
- Milestones/subtasks with progress and target dates
- Workout templates, streaks, reminders
- PWA install (mobile/desktop) and optional Electron shell for Windows
- Real DB (Mongo/Prisma) and provider auth (OAuth)

## Scripts
- pnpm dev – start dev server
- pnpm build – build client and server
- pnpm start – start production server
- pnpm test – run vitest
- pnpm typecheck – TypeScript check

## Folder Structure (high level)
- client/ – React app (AppShell, pages, components)
- server/ – Express server and API routes
- shared/ – shared TypeScript types
- public/ – static assets

## Support
- Deploy via Netlify/Vercel MCP or open preview. For instructions and integrations, see Builder docs: https://www.builder.io/c/docs/projects
