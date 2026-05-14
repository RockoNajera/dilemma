# Dilemma

> *Enfrenta dos cosas imposibles de comparar.*

A social platform for binary-choice polls. Users post dilemmas — two options that are genuinely hard to compare — and the community votes, debates, and tracks how opinions shift over time.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties design system |
| Fonts | Outfit (UI), JetBrains Mono (metadata/labels) |
| Backend (planned) | AWS Lambda + API Gateway |
| Auth (planned) | AWS Cognito |

---

## Project Structure

```
app/
├── components/
│   ├── atoms/
│   │   └── Icon.tsx              # SVG icon renderer
│   ├── molecules/
│   │   ├── OptionCard.tsx        # A/B option tile with reveal animation
│   │   ├── SliderVote.tsx        # Drag-to-vote slider input
│   │   └── SplitBar.tsx          # Percentage split bar shown after voting
│   └── organisms/
│       ├── AuthModal.tsx         # Sign in / sign up modal
│       ├── ComposeModal.tsx      # Create a new dilemma
│       ├── FeedScreen.tsx        # Main chronological post feed
│       ├── LeftRail.tsx          # Desktop sidebar navigation
│       ├── MobileTabbar.tsx      # Bottom nav bar (mobile)
│       ├── PostCard.tsx          # Individual dilemma card
│       ├── ProfileScreen.tsx     # User profile + settings
│       ├── RightRail.tsx         # Desktop right sidebar (trending, creators)
│       └── TrendingScreen.tsx    # Grid view of trending dilemmas
├── data/
│   └── feed.ts                   # Static mock data (pre-backend)
├── lib/
│   └── utils.ts                  # Shared helpers (e.g. fmtCount)
├── types/
│   └── dilemma.ts                # Core TypeScript interfaces
├── globals.css                   # Design system tokens + layout
├── layout.tsx                    # Root layout with font config + metadata
└── page.tsx                      # App shell — state, routing, event handlers
```

---

## Architecture

### Component hierarchy

Follows **Atomic Design**: atoms → molecules → organisms. The root `page.tsx` owns all shared state and passes it down; screens are stateless beyond local UI concerns.

### State management

All post state (votes, likes, saves) lives in `page.tsx` via `useState`. There is no global store — the app is currently a prototype with mock data. When the backend is connected, this layer will migrate to server state (React Query or similar).

### Layout

Three-column desktop grid (`260px | 1fr | 340px`), collapsing responsively:

- **≤ 1100px** — left rail collapses to icon-only (72px)
- **≤ 900px** — right rail hidden
- **≤ 640px** — left rail hidden, mobile bottom tab bar shown

### Design system

Tokens are defined as CSS custom properties in `globals.css`. Light and dark themes are controlled by the `data-theme` attribute on `<html>`. Key token groups:

| Group | Variables |
|---|---|
| Surface | `--paper`, `--paper-2`, `--paper-3` |
| Text | `--ink`, `--ink-2`, `--ink-3` |
| Border | `--line`, `--line-2` |
| Accent | `--green`, `--purple`, `--blue`, `--red`, `--amber` |
| Radius | `--r-sm` → `--r-xl` |
| Typography | `--serif`, `--sans`, `--mono` |

### Vote styles

Three modes, user-configurable from the Profile settings panel:

| Mode | Behavior |
|---|---|
| `reveal` | Tap an option → results overlay appears on the cards |
| `tap` | Tap an option → split bar renders below the options |
| `slider` | Drag the slider to a side → commits vote on release |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Install

```bash
npm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Django or Lambda API base URL |
| `NEXT_PUBLIC_COGNITO_REGION` | AWS region for Cognito |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `NEXT_PUBLIC_COGNITO_APP_CLIENT_ID` | Cognito App Client ID |

Auth is not yet wired in the web app — these variables are placeholders for the upcoming integration.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Key Types

```ts
// app/types/dilemma.ts

type VoteStyle = 'reveal' | 'tap' | 'slider'

interface Post {
  id: number
  author: Author
  title: string
  a: PostOption      // Option A
  b: PostOption      // Option B
  votes: { a: number; b: number }
  voted: 'a' | 'b' | null
  liked: boolean
  saved: boolean
  daysLeft: number
  tags: string[]
}
```

---

## Roadmap

- [ ] Connect to AWS Lambda/API Gateway backend
- [ ] Wire AWS Cognito auth (sign up, sign in, session management)
- [ ] Notifications screen
- [ ] Saved dilemmas screen
- [ ] Comments thread on PostCard
- [ ] Image upload for Option A / Option B in ComposeModal
- [ ] Real trending data from backend
