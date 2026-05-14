# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on :3000
npm run build    # production build
npm run lint     # ESLint (Next.js config)
```

No test runner is configured yet.

## Architecture

Single-page app. All UI is under `app/` using the Next.js App Router, but **every component is a Client Component** (`'use client'`) — there are no Server Components in use.

### State ownership

`app/page.tsx` is the root and owns all application state: posts list, active screen, modal open/close flags, current user id. It passes callbacks down to screens and organisms. There is no global state library (no Zustand, Redux, Context).

### API layer — `app/lib/api.ts`

- Single `request<T>()` wrapper used by all API functions.
- Auth token stored in module-level `_token` variable, mirrored to `localStorage` via `setToken()` / `getToken()`.
- **Auth header format**: `Bearer <cognito_id_token>`
- Backend: `http://dilemma-alb-dev-479348409.mx-central-1.elb.amazonaws.com` (AWS ALB, publicly accessible).
- All paths follow Django REST conventions: `/api/v1/posts/`, trailing slashes, paginated responses `{ count, next, previous, results }`.

### Design system — `app/globals.css`

CSS custom properties only — no Tailwind utility classes in components. Tokens:
- Colors: `--paper`, `--ink`, `--ink-2`, `--ink-3`, `--line`, `--green`, `--purple`, `--blue`, `--red`
- Radii: `--r-sm` → `--r-xl`
- Dark mode: toggled via `document.documentElement.setAttribute('data-theme', 'dark')` — not a media query.
- Fonts: `--sans` (Outfit), `--mono` (JetBrains Mono), loaded via `next/font`.

### Component hierarchy

Follows Atomic Design. Organisms are full-panel screens (`FeedScreen`, `ProfileScreen`, `TrendingScreen`, `SearchScreen`) rendered by `page.tsx` based on the `screen` state value. Modals (`AuthModal`, `ComposeModal`, `ReportModal`) and `CommentDrawer` are also rendered at the root.

### Auth

Cognito User Pool `mx-central-1_n3MW0SP9x`, App Client `4d9ui6fcgkb4eil4k8esogq2p`. `AuthModal` handles login and registration via `cognito.ts`. `AuthContext` manages session restore, token refresh on 401, and logout.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | ALB base URL (no trailing slash) |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Cognito app client |
| `NEXT_PUBLIC_COGNITO_REGION` | `mx-central-1` |
