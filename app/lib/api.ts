import type { Post, UserProfile } from '@/app/types/dilemma'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// --- Token store ---
// Auth context will call setToken() when the user signs in/out.
// In local dev, NEXT_PUBLIC_DEV_TOKEN seeds the token automatically (see .env.local).
let _token: string | null = null

export function setToken(token: string | null): void {
  _token = token
  if (typeof window === 'undefined') return
  token
    ? localStorage.setItem('dilemma_token', token)
    : localStorage.removeItem('dilemma_token')
}

export function getToken(): string | null {
  if (_token) return _token
  if (typeof window !== 'undefined') {
    _token =
      localStorage.getItem('dilemma_token') ??
      process.env.NEXT_PUBLIC_DEV_TOKEN ??
      null
  }
  return _token
}

// --- Internal fetch wrapper ---

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API ${res.status} ${path}${body ? `: ${body}` : ''}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// --- Backend response types ---

interface ApiAuthor {
  id: number
  username: string
  name: string
  lastname: string
  profile_pic_url: string | null
  celebrity: boolean
  privacy_status: string
}

interface ApiPost {
  id: number
  author: ApiAuthor
  post_type: string
  status: string
  title: string
  subtitle: string
  first_content: string
  second_content: string
  first_content_url: string | null
  second_content_url: string | null
  first_textual_content: string
  second_textual_content: string
  first_external_url: string
  second_external_url: string
  first_thumbnail: string
  second_thumbnail: string
  post_thumbnail: string
  post_thumbnail_url: string | null
  tags: string
  topics: string
  starts_at: string | null
  ends_at: string | null
  expired: boolean
  timeless: boolean
  sponsored: boolean
  followers_only: boolean
  from_celebrity: boolean
  vote_count_a: number
  vote_count_b: number
  like_count: number
  user_vote: 'A' | 'B' | null
  user_liked: boolean
  user_bookmarked: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// --- Adapters ---

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diffMs / 60_000)
  if (m < 1) return 'ahora'
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}

function daysLeft(endsAt: string | null, timeless: boolean): number {
  if (timeless || !endsAt) return 0
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86_400_000))
}

function adaptPost(api: ApiPost): Post {
  const fullName =
    [api.author.name, api.author.lastname].filter(Boolean).join(' ') ||
    api.author.username

  return {
    id: api.id,
    author: {
      name: fullName,
      handle: `@${api.author.username}`,
      initial: fullName.charAt(0).toUpperCase(),
    },
    posted: timeAgo(api.created_at),
    daysLeft: daysLeft(api.ends_at, api.timeless),
    title: api.title,
    // tags is stored as a TextField; split on whitespace/commas
    tags: api.tags ? api.tags.split(/[\s,]+/).filter(Boolean) : [],
    a: {
      label: api.first_textual_content || 'Opción A',
      caption: `OPTION A · ${api.first_textual_content || 'Opción A'}`,
    },
    b: {
      label: api.second_textual_content || 'Opción B',
      caption: `OPTION B · ${api.second_textual_content || 'Opción B'}`,
    },
    votes: { a: api.vote_count_a, b: api.vote_count_b },
    likes: api.like_count,
    comments: 0,
    reposts: 0,
    voted: api.user_vote ? (api.user_vote.toLowerCase() as 'a' | 'b') : null,
    liked: api.user_liked,
    saved: api.user_bookmarked,
  }
}

// --- Public API ---

export async function getPosts(): Promise<Post[]> {
  const data = await request<PaginatedResponse<ApiPost>>('/api/v1/posts/')
  return data.results.map(adaptPost)
}

export async function vote(
  postId: number,
  side: 'a' | 'b',
): Promise<{ voted: boolean; side: string | null }> {
  return request(`/api/v1/posts/${postId}/vote/`, {
    method: 'POST',
    body: JSON.stringify({ side: side.toUpperCase() }),
  })
}

export async function like(postId: number): Promise<{ liked: boolean }> {
  return request(`/api/v1/posts/${postId}/like/`, { method: 'POST' })
}

export async function bookmark(postId: number): Promise<{ bookmarked: boolean }> {
  return request(`/api/v1/posts/${postId}/bookmark/`, { method: 'POST' })
}

export interface CreatePostPayload {
  title: string
  first_textual_content: string
  second_textual_content: string
  post_type: 'text'
  tags: string
  ends_at: string | null
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const api = await request<ApiPost>('/api/v1/posts/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return adaptPost(api)
}

export async function getMe(): Promise<UserProfile> {
  return request<UserProfile>('/api/v1/users/me/')
}

export async function getFollowCounts(
  userId: number,
): Promise<{ followers: number; following: number }> {
  const [f1, f2] = await Promise.all([
    request<PaginatedResponse<unknown>>(`/api/v1/follow/${userId}/followers/`),
    request<PaginatedResponse<unknown>>(`/api/v1/follow/${userId}/following/`),
  ])
  return { followers: f1.count, following: f2.count }
}
