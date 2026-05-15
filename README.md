# Dilemma

> *Enfrenta dos cosas imposibles de comparar.*

A social platform for binary-choice polls. Users post dilemmas — two options that are genuinely hard to compare — and the community votes, debates, and tracks how opinions shift over time.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties design system |
| Fonts | Outfit (UI), JetBrains Mono (metadata/labels) |
| Auth | AWS Cognito (USER_PASSWORD_AUTH flow) |
| Backend | Django REST API (`/api/v1/`) |
| Media | S3 via presigned upload URLs |

---

## Project Structure

```
app/
├── components/
│   ├── atoms/
│   │   └── Icon.tsx              # Inline SVG icon renderer (24 icons)
│   ├── molecules/
│   │   ├── FollowButton.tsx      # Optimistic follow/unfollow toggle
│   │   ├── OptionCard.tsx        # A/B tile — image, video, or YouTube embed
│   │   ├── SliderVote.tsx        # Drag-to-vote slider (mouse + touch)
│   │   └── SplitBar.tsx          # A/B percentage bar shown after voting
│   └── organisms/
│       ├── AuthModal.tsx         # Sign in / register with username availability check
│       ├── CommentDrawer.tsx     # Slide-up comment thread with replies and likes
│       ├── ComposeModal.tsx      # Create a new dilemma (title, options, tags, expiry)
│       ├── FeedScreen.tsx        # Chronological post feed
│       ├── LeftRail.tsx          # Desktop sidebar nav + compose CTA + auth state
│       ├── MobileTabbar.tsx      # Bottom nav bar (mobile only)
│       ├── PostCard.tsx          # Individual dilemma card with vote, like, save, share
│       ├── ProfileScreen.tsx     # User profile, stats, tabs, settings panel
│       ├── ReportModal.tsx       # Report a post with category + subcategory
│       ├── RightRail.tsx         # Trending posts + suggested creators (live from API)
│       ├── SearchScreen.tsx      # Search posts and users
│       └── TrendingScreen.tsx    # Grid view of trending dilemmas
├── lib/
│   ├── api.ts                    # Typed fetch wrapper + all API calls + response adapters
│   ├── AuthContext.tsx           # Auth state, session restore, 401 refresh, logout
│   ├── cognito.ts                # Cognito SignUp / InitiateAuth / REFRESH_TOKEN calls
│   └── utils.ts                  # fmtCount (1.2K / 3.4M), fmtFullName
├── types/
│   └── dilemma.ts                # All TypeScript interfaces (Post, Comment, UserProfile…)
├── data/
│   └── feed.ts                   # Static seed data (used in development/fallback)
├── globals.css                   # Design system tokens + all layout and component styles
├── layout.tsx                    # Root layout — fonts, metadata, AuthProvider
└── page.tsx                      # App shell — screen routing, shared action handlers
```

---

## Architecture

### Auth flow

Cognito is called directly from the browser (no server-side proxy). On login/register, three tokens are stored in `localStorage`:

```
dilemma_id_token      — sent as Bearer on every API request
dilemma_access_token
dilemma_refresh_token — used to get a new idToken on 401
```

`AuthContext` restores the session on mount. If any API call returns 401, the `api.ts` fetch wrapper calls the registered `_onUnauthorized` handler, which refreshes the Cognito session and retries the original request transparently.

### API layer (`app/lib/api.ts`)

All backend calls go through a single `request<T>()` wrapper that:
1. Attaches the Bearer token
2. Handles 401 → refresh → retry
3. Throws a typed `Error` on non-OK responses

Django API responses use snake_case and a different shape from the frontend `Post` type. The `adaptPost()` function in `api.ts` normalizes them, including relative timestamps (`timeAgo`), days-remaining calculation, and media type inference from file extensions.

### State management

Shared state (posts, auth) lives in `page.tsx` and `AuthContext`. There is no global store. Screens receive data and callbacks as props. Optimistic updates are applied locally before the server confirms (votes, likes, follows).

### Component hierarchy

Follows **Atomic Design**: atoms → molecules → organisms. `page.tsx` owns all inter-screen state and passes action handlers down.

### Layout

Three-column desktop grid (`260px | 1fr | 340px`), collapsing responsively:

| Breakpoint | Layout |
|---|---|
| > 1100px | Full three-column |
| ≤ 1100px | Left rail collapses to icon-only (72px) |
| ≤ 900px | Right rail hidden |
| ≤ 640px | Left rail hidden, bottom tab bar shown |

### Design system

Tokens are defined as CSS custom properties in `globals.css`. The `data-theme` attribute on `<html>` switches between light and dark.

| Group | Variables |
|---|---|
| Surface | `--paper`, `--paper-2`, `--paper-3` |
| Text | `--ink`, `--ink-2`, `--ink-3` |
| Border | `--line`, `--line-2` |
| Accent | `--green`, `--purple`, `--blue`, `--red`, `--amber` |
| Gradient | `--grad` (amber → red, used on the brand mark) |
| Radius | `--r-sm` → `--r-xl` |
| Typography | `--serif`, `--sans`, `--mono` |

### Vote styles

Three modes, user-configurable in the Profile settings panel:

| Mode | Behavior |
|---|---|
| `reveal` | Tap an option → percentage overlays appear on both cards |
| `tap` | Tap an option → a split bar renders below the options |
| `slider` | Drag the center "vs" thumb past 35% or 65% → commits vote on release |

---

## Screens

| Screen | Route (in-app) | Description |
|---|---|---|
| Feed | `feed` | Chronological list of dilemmas from followed users |
| Trending | `trending` | Grid of top dilemmas filtered by today / week / month |
| Search | `search` | Search posts and users |
| Notifications | `notifs` | Placeholder (not yet implemented) |
| Saved | `saved` | Placeholder (not yet implemented) |
| Profile | `profile` | User stats, post history, vote history, settings |

---

## API Endpoints

All requests go to `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`).

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/feed/public/` | Public feed (unauthenticated) |
| GET | `/api/v1/feed/` | Personalized feed |
| GET | `/api/v1/posts/:id/` | Single post |
| POST | `/api/v1/posts/` | Create post |
| DELETE | `/api/v1/posts/:id/` | Delete post |
| POST | `/api/v1/posts/:id/vote/` | Vote A or B |
| POST | `/api/v1/posts/:id/like/` | Toggle like |
| POST | `/api/v1/posts/:id/bookmark/` | Toggle bookmark |
| POST | `/api/v1/posts/:id/repost/` | Toggle repost |
| POST | `/api/v1/posts/:id/report/` | Report post |
| GET | `/api/v1/posts/:id/comments/` | List comments |
| POST | `/api/v1/posts/:id/comments/` | Create comment or reply |
| POST | `/api/v1/posts/:id/comments/:id/like/` | Toggle comment like |
| DELETE | `/api/v1/posts/:id/comments/:id/` | Delete comment |
| GET | `/api/v1/search/posts/` | Search posts |
| GET | `/api/v1/search/users/` | Search users |
| GET | `/api/v1/search/suggested-creators/` | Suggested creators list |
| GET | `/api/v1/users/me/` | Authenticated user profile |
| PATCH | `/api/v1/users/me/` | Update profile |
| GET | `/api/v1/users/:username/` | Public user profile |
| GET | `/api/v1/users/:id/posts/` | User's posts |
| POST | `/api/v1/users/:id/block/` | Block user |
| DELETE | `/api/v1/users/:id/block/` | Unblock user |
| POST | `/api/v1/users/:username/report/` | Report user |
| POST | `/api/v1/follow/:id/` | Follow user |
| DELETE | `/api/v1/follow/:id/` | Unfollow user |
| GET | `/api/v1/follow/:id/followers/` | Follower list |
| GET | `/api/v1/follow/:id/following/` | Following list |
| GET | `/api/v1/reports/categories/` | Report category list |
| POST | `/api/v1/media/upload/` | Get presigned S3 URL |
| GET | `/api/v1/auth/username/` | Check username availability |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Django backend base URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_COGNITO_REGION` | AWS region (e.g. `us-east-1`) |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Cognito App Client ID |

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
type Screen    = 'feed' | 'trending' | 'notifs' | 'saved' | 'profile' | 'search'

interface PostOption {
  label: string
  caption: string
  mediaType?: 'image' | 'video' | 'youtube' | null
  mediaUrl?: string | null
}

interface Post {
  id: number
  authorId: number
  author: Author
  authorFollowed: boolean
  title: string
  a: PostOption
  b: PostOption
  votes: { a: number; b: number }
  voted: 'a' | 'b' | null
  liked: boolean
  saved: boolean
  reposted: boolean
  timeless: boolean
  daysLeft: number
  tags: string[]
}
```

---

## Roadmap

- [ ] Notifications screen (endpoint exists, UI not built)
- [ ] Saved / bookmarks screen
- [ ] Profile edit form (PATCH `/api/v1/users/me/` is wired, UI not built)
- [ ] Image/video upload in ComposeModal (S3 presigned URL flow exists in `api.ts`)
- [ ] Paginated feed (API returns `next` cursor, frontend loads all at once)
