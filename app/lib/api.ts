const BASE = process.env.NEXT_PUBLIC_API_URL!

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function req<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(BASE + path, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Error inesperado')
  return data
}

// ── Shapes returned by the backend ───────────────────────────────────────────

export interface ApiPost {
  id: string
  title: string
  option_a: { label: string; caption: string; image_url?: string }
  option_b: { label: string; caption: string; image_url?: string }
  tags: string[]
  votes_a_count: number
  votes_b_count: number
  likes_count: number
  comments_count: number
  reposts_count: number
  created_at: string
  days_left: number
  is_open: boolean
  author_name: string
  author_handle: string
  author_avatar: string | null
  voted: 'a' | 'b' | null
  liked: boolean
  saved: boolean
}

export interface UserProfile {
  id: string
  name: string
  handle: string
  bio: string | null
  avatar_url: string | null
  location: string | null
  followers_count: number
  following_count: number
  dilemas_count: number
  created_at: string
}

// ── API surface ───────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string; handle: string }) =>
      req<{ message: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    confirm: (body: { email: string; code: string }) =>
      req<{ message: string }>('/auth/confirm', { method: 'POST', body: JSON.stringify(body) }),

    login: (body: { email: string; password: string }) =>
      req<{ accessToken: string; refreshToken: string; idToken: string; expiresIn: number }>(
        '/auth/login', { method: 'POST', body: JSON.stringify(body) }
      ),

    refresh: (refreshToken: string) =>
      req<{ accessToken: string; idToken: string; expiresIn: number }>(
        '/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }
      ),

    me: (token: string) => req<UserProfile>('/auth/me', {}, token),
  },

  posts: {
    feed: (token?: string, page = 1) =>
      req<{ posts: ApiPost[] }>(`/posts?page=${page}`, {}, token),

    create: (token: string, body: { title: string; aLabel: string; bLabel: string; days: number; tags: string }) =>
      req<ApiPost>('/posts', { method: 'POST', body: JSON.stringify(body) }, token),

    vote: (token: string, id: string, side: 'a' | 'b') =>
      req<{ voted: string; votes: { votes_a_count: number; votes_b_count: number } }>(
        `/posts/${id}/vote`, { method: 'POST', body: JSON.stringify({ side }) }, token
      ),

    like: (token: string, id: string) =>
      req<{ liked: boolean }>(`/posts/${id}/like`, { method: 'POST' }, token),

    save: (token: string, id: string) =>
      req<{ saved: boolean }>(`/posts/${id}/save`, { method: 'POST' }, token),
  },
}
