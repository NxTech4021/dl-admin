# DeuceLeague Admin

Web admin dashboard for managing leagues, seasons, divisions, players, and sponsors.

**Stack:** React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui

## Prerequisites

- Node.js 20+
- npm or yarn
- Running [dl-backend](https://github.com/deuceleague/dl-backend) instance

## Setup

```bash
# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your backend API URLs

# Start dev server (http://localhost:5173)
yarn dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `yarn dev` | Start Vite dev server |
| `yarn build` | Build production bundle to `dist/` |
| `yarn start` | Serve the built `dist/` on port 3030 |
| `yarn preview` | Preview production build locally |
| `yarn lint` | Run ESLint |
| `yarn test` | Run Vitest unit tests |
| `yarn test:ui` | Vitest UI mode |
| `yarn test:coverage` | Run tests with coverage report |

## Environment Variables

See [.env.example](.env.example) for the full list. Required:

- `VITE_API_BASE_URL` — backend REST API URL
- `VITE_AUTH_URL` — better-auth endpoint URL

## E2E Tests

Playwright tests live in `e2e/`. Run with:

```bash
npx playwright test
```

## Deployment

1. `yarn build` produces a static `dist/` folder
2. Serve via any static host (Nginx, Vercel, Netlify, S3+CloudFront, etc.)
3. Ensure `VITE_API_BASE_URL` points to the correct production backend at build time

## Project Structure

```
src/
├── components/   # Reusable UI components
├── routes/       # Route handlers
├── services/     # API clients
├── hooks/        # Custom React hooks
├── lib/          # Utilities
└── types/        # TypeScript types
```
