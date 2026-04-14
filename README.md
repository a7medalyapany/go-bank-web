# 🏦 GoBank Web

The Next.js frontend for GoBank — a production-grade banking platform with multi-currency accounts, atomic peer-to-peer transfers, and institutional-grade authentication.

Built with a Revolut/Wise-inspired design language on a dark obsidian + gold palette.

---

## Overview

GoBank Web is a full-featured banking dashboard that connects to the [GoBank API](../README.md) (Go + gRPC-Gateway). It handles authentication, account management, fund transfers, and real-time activity feeds — all rendered with a Next.js App Router architecture that prioritises server-side data fetching and minimal client-side JavaScript.

---

## Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Framework       | Next.js 16 (App Router)              |
| Language        | TypeScript (strict)                  |
| Styling         | Tailwind CSS v4                      |
| Auth            | iron-session (AES-256 + HMAC cookie) |
| Validation      | Zod v4                               |
| HTTP client     | Native `fetch` (server + client)     |
| Toast           | react-hot-toast                      |
| Icons           | lucide-react                         |
| Testing         | Vitest                               |
| Linting         | ESLint (eslint-config-next)          |
| Package manager | pnpm                                 |

---

## Features

- **Authentication** — Login / Register / Logout with silent access-token rotation
- **Email verification** — One-click link verification flow with loading state
- **Dashboard** — Balance overview, account card carousel, live activity feed
- **Accounts** — Create (USD / EUR / EGP), view, delete; intercepted modal for smooth UX
- **Transfers** — 4-step wizard (source → recipient → amount → confirm) with real-time account lookup
- **Settings** — Update profile (name/email) and change password
- **Middleware auth guard** — Cookie-presence check at the Edge before every protected route
- **Server-side token renewal** — Access tokens silently refreshed on the server; no client exposure

---

## Prerequisites

- **Node.js** ≥ 20.9.0
- **pnpm** ≥ 10
- A running instance of the [GoBank API](https://github.com/a7medalyapany/GoBank) (default: `http://localhost:8080`)

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example below into a `.env.local` file in the project root:

```env
# URL of the GoBank API (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8080

# iron-session encryption secret — must be ≥ 32 characters
# Generate with: openssl rand -hex 32
SESSION_SECRET=your-super-secret-32-char-minimum-key

# Public base URL for this Next.js app (used in sitemaps / OG metadata)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **`SESSION_SECRET` must be at least 32 characters.** iron-session uses AES-256 which requires a 256-bit key. If this is missing the app will fail to start.

### 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm dev`        | Start development server with hot reload |
| `pnpm build`      | Production build                         |
| `pnpm start`      | Serve production build                   |
| `pnpm lint`       | Run ESLint                               |
| `pnpm test`       | Run Vitest (unit tests, single run)      |
| `pnpm test:watch` | Run Vitest in watch mode                 |

---

## Environment Variables

| Variable              | Required | Description                                         |
| --------------------- | -------- | --------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | ✅       | GoBank API base URL (e.g. `http://localhost:8080`)  |
| `SESSION_SECRET`      | ✅       | iron-session key — min 32 chars, never commit this  |
| `NEXT_PUBLIC_APP_URL` | ❌       | App public URL, defaults to `http://localhost:3000` |

---

## Folder Structure

```
src/
├── app/                         # Next.js App Router pages
│   ├── (auth)/                  # Login, register, verify-email (unauthenticated)
│   ├── (dashboard)/             # Protected pages
│   │   ├── @modal/              # Parallel route for account creation modal
│   │   ├── (panel)/             # Accounts, transfers, settings (panel layout)
│   │   └── dashboard/           # Main dashboard page
│   ├── api/accounts/lookup/     # Route handler for client-side account lookup
│   └── layout.tsx               # Root layout (fonts, providers)
│
├── components/
│   ├── accounts/                # Account list card, delete button, create form/modal
│   ├── dashboard/               # Hero, activity feed, account carousel, smart brief
│   ├── forms/                   # Login + register forms
│   ├── layout/                  # Providers (Toaster)
│   ├── Sidebar/                 # AppSidebar, NavLink, LogoutButton
│   ├── settings/                # Profile form, password form, section cards
│   ├── transfers/               # TransferWizard (4-step)
│   └── ui/                      # Badge, Button, Input, PanelHeader, AmbientGlow
│
├── constants/                   # Nav items and other shared constants
├── lib/
│   ├── actions/                 # Server Actions (auth, accounts, transfers, settings)
│   ├── accounts/                # Cached accounts snapshot (React cache)
│   ├── api/                     # API client (goApi, goPublicApi), types
│   ├── auth.ts                  # requireAuth() guard
│   ├── dashboard/               # Dashboard snapshot, view-models, formatters
│   ├── session/                 # iron-session config, get/save/destroy helpers
│   └── validation/              # Zod schemas (auth, settings)
│
└── __tests__/                   # Vitest unit tests
    ├── validation.test.ts
    ├── proxy.test.ts
    └── dashboard-activity.test.ts
```

---

## Architecture Notes

### Server vs Client Components

The app heavily favours React Server Components. Client Components (`"use client"`) are used only where strictly necessary:

- Interactive forms (use `useActionState`)
- Navigation state (sidebar toggle, active route)
- Toasts and dialog interactions
- The transfer wizard (multi-step state machine)

### Session & Token Lifecycle

1. Login → GoBank API returns `access_token` + `refresh_token`
2. Both are sealed into an `HttpOnly` cookie via iron-session (never exposed to browser JS)
3. On each request, `getAuthSession()` checks token expiry server-side
4. If the access token is within 60s of expiry, it silently calls `/v1/auth/renew_access`
5. The middleware only checks cookie _presence_ (fast Edge check); full verification happens in RSCs via `requireAuth()`

### Data Fetching

- Account data is fetched once per server render via `getAccountsSnapshot()` (React `cache()` — deduplicates across RSCs in a single render tree)
- Dashboard activity is fetched in parallel with accounts via `Promise.all`
- Mutations go through Server Actions → `revalidatePath()` to bust the Next.js cache

---

## Running Tests

```bash
pnpm test
```

Tests cover Zod validation schemas, middleware routing logic, and dashboard view-model transformations. They run in a Node environment with mocked `next/headers` and `next/navigation`.

---

## Connecting to a Remote API

Set `NEXT_PUBLIC_API_URL` to your deployed GoBank API endpoint:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Make sure the GoBank API's CORS config allows your frontend origin (see `corsMiddleware` in `main.go`).

---

## License

MIT — see [LICENSE](LICENSE) for details.
