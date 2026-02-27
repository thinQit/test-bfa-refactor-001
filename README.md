# test-bfa-refactor-001

A simple TypeScript-based Todo app with JWT authentication. This scaffold uses Next.js 14 (App Router) and Prisma with SQLite.

## Features
- JWT-based authentication (register/login)
- Protected Todo CRUD endpoints
- Dashboard and todo management pages (to be implemented)
- Tailwind CSS styling
- Toast notifications provider
- Jest + Playwright testing setup

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes (App Router)
- **Database**: SQLite with Prisma ORM
- **Auth**: JWT + bcryptjs
- **Testing**: Jest, Testing Library, Playwright

## Prerequisites
- Node.js 18+ recommended
- npm

## Quick Start
Use the provided install scripts:

### macOS/Linux
```bash
bash install.sh
```

### Windows (PowerShell)
```powershell
./install.ps1
```

Then start the dev server:
```bash
npm run dev
```

## Environment Variables
Create a `.env` from `.env.example`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-min-32-chars-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Project Structure
```
src/app/              # App Router pages and layouts
src/app/api/          # API route handlers
src/components/       # UI components
src/lib/              # Utilities and API client
src/providers/        # React context providers
prisma/               # Prisma schema and migrations
```

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token (optional)
- `GET /api/users/me` - Current user profile
- `GET /api/todos` - List todos
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get single todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Generate Prisma client and build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run Playwright tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database

## Testing
- **Unit**: `npm run test`
- **E2E**: `npm run test:e2e`

## Notes
- SQLite is used for local development by default.
- Do not commit `.env` to version control.
