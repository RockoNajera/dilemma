import type { Comment, CommentReply, Post, ReportCategory, UpdateProfilePayload, UserProfile, UserSummary } from '@/app/types/dilemma'
import { fmtFullName } from '@/app/lib/utils'

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
  is_following?: boolean
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
  comment_count: number
  repost_count: number
  user_reposted: boolean
  user_follows_author: boolean
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
  const fullName = fmtFullName(api.author.name, api.author.lastname, api.author.username)

  return {
    id: api.id,
    authorId: api.author.id,
    author: {
      name: fullName,
      handle: `@${api.author.username}`,
      initial: fullName.charAt(0).toUpperCase(),
    },
    posted: timeAgo(api.created_at),
    daysLeft: daysLeft(api.ends_at, api.timeless),
    timeless: api.timeless,
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
    comments: api.comment_count,
    reposts: api.repost_count,
    voted: api.user_vote ? (api.user_vote.toLowerCase() as 'a' | 'b') : null,
    liked: api.user_liked,
    saved: api.user_bookmarked,
    reposted: api.user_reposted,
    authorFollowed: api.author.is_following ?? api.user_follows_author ?? false,
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

export async function searchPosts(q: string): Promise<Post[]> {
  const data = await request<PaginatedResponse<ApiPost>>(`/api/v1/search/posts/?q=${encodeURIComponent(q)}`)
  return data.results.map(adaptPost)
}

export async function searchUsers(q: string): Promise<UserSummary[]> {
  const data = await request<PaginatedResponse<UserSummary>>(`/api/v1/search/users/?q=${encodeURIComponent(q)}`)
  return data.results
}

export async function getSuggestedCreators(): Promise<UserSummary[]> {
  const data = await request<PaginatedResponse<UserSummary>>('/api/v1/search/suggested-creators/')
  return data.results
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

// --- Comments ---

interface ApiCommentAuthor {
  id: number
  username: string
  name: string
  lastname: string
  profile_pic_url: string | null
  celebrity: boolean
  privacy_status: string
}

interface ApiCommentReply {
  id: number
  author: ApiCommentAuthor
  text: string
  vote_side: string
  status: string
  like_count: number
  user_liked: boolean
  created_at: string
  updated_at: string
}

interface ApiComment {
  id: number
  author: ApiCommentAuthor
  parent: number | null
  text: string
  vote_side: string
  status: string
  like_count: number
  user_liked: boolean
  replies: ApiCommentReply[]
  created_at: string
  updated_at: string
}

function adaptCommentAuthor(api: ApiCommentAuthor) {
  const fullName = fmtFullName(api.name, api.lastname, api.username)
  return { id: api.id, username: api.username, name: fullName, initial: fullName.charAt(0).toUpperCase() }
}

function adaptCommentReply(api: ApiCommentReply): CommentReply {
  return {
    id: api.id,
    author: adaptCommentAuthor(api.author),
    text: api.text,
    voteSide: (api.vote_side as 'A' | 'B') || null,
    likeCount: api.like_count,
    userLiked: api.user_liked,
    ts: timeAgo(api.created_at),
  }
}

function adaptComment(api: ApiComment): Comment {
  return {
    id: api.id,
    author: adaptCommentAuthor(api.author),
    parentId: api.parent,
    text: api.text,
    voteSide: (api.vote_side as 'A' | 'B') || null,
    likeCount: api.like_count,
    userLiked: api.user_liked,
    replies: api.replies.map(adaptCommentReply),
    ts: timeAgo(api.created_at),
  }
}

export async function getComments(postId: number): Promise<Comment[]> {
  const data = await request<PaginatedResponse<ApiComment>>(`/api/v1/posts/${postId}/comments/`)
  return data.results.map(adaptComment)
}

export async function createComment(
  postId: number,
  text: string,
  parent?: number,
  voteSide?: 'A' | 'B',
): Promise<Comment> {
  const body: Record<string, unknown> = { text }
  if (parent != null) body.parent = parent
  if (voteSide) body.vote_side = voteSide
  const api = await request<ApiComment>(`/api/v1/posts/${postId}/comments/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return adaptComment(api)
}

export async function likeComment(
  postId: number,
  commentId: number,
): Promise<{ liked: boolean }> {
  return request(`/api/v1/posts/${postId}/comments/${commentId}/like/`, { method: 'POST' })
}

// --- Reports ---

interface ApiReportCategory {
  id: number
  title: string
  on_posts: boolean
  on_users: boolean
  on_comments: boolean
  has_subcategories: boolean
  subcategories: Array<{ id: number; title: string }>
}

export async function getReportCategories(): Promise<ReportCategory[]> {
  const data = await request<PaginatedResponse<ApiReportCategory>>('/api/v1/reports/categories/')
  return data.results.map(c => ({
    id: c.id,
    title: c.title,
    onPosts: c.on_posts,
    hasSubcategories: c.has_subcategories,
    subcategories: c.subcategories,
  }))
}

export interface ReportPayload {
  category: number
  subcategory?: number
  notes?: string
}

export async function reportPost(postId: number, payload: ReportPayload): Promise<void> {
  return request(`/api/v1/posts/${postId}/report/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function reportUser(username: string, payload: ReportPayload): Promise<void> {
  return request(`/api/v1/users/${username}/report/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// --- Users ---

export async function updateMe(payload: UpdateProfilePayload): Promise<UserProfile> {
  return request<UserProfile>('/api/v1/users/me/', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function getUserByUsername(username: string): Promise<UserSummary> {
  return request<UserSummary>(`/api/v1/users/${username}/`)
}

// --- Posts (single + delete) ---

export async function getPost(postId: number): Promise<Post> {
  const api = await request<ApiPost>(`/api/v1/posts/${postId}/`)
  return adaptPost(api)
}

export async function deletePost(postId: number): Promise<void> {
  return request(`/api/v1/posts/${postId}/`, { method: 'DELETE' })
}

// --- Follow ---

export async function followUser(userId: number): Promise<void> {
  return request(`/api/v1/follow/${userId}/`, { method: 'POST' })
}

export async function unfollowUser(userId: number): Promise<void> {
  return request(`/api/v1/follow/${userId}/`, { method: 'DELETE' })
}

export async function getFollowStatus(userId: number): Promise<{ following: boolean }> {
  return request<{ following: boolean }>(`/api/v1/follow/${userId}/status/`)
}

export async function getFollowers(userId: number): Promise<UserSummary[]> {
  const data = await request<PaginatedResponse<UserSummary>>(`/api/v1/follow/${userId}/followers/`)
  return data.results
}

export async function getFollowing(userId: number): Promise<UserSummary[]> {
  const data = await request<PaginatedResponse<UserSummary>>(`/api/v1/follow/${userId}/following/`)
  return data.results
}

// --- Feed ---

export async function getFeed(): Promise<Post[]> {
  const data = await request<PaginatedResponse<ApiPost>>('/api/v1/feed/')
  return data.results.map(adaptPost)
}

export async function getPublicFeed(): Promise<Post[]> {
  const data = await request<PaginatedResponse<ApiPost>>('/api/v1/feed/public/')
  return data.results.map(adaptPost)
}

export async function getPrivateFeed(): Promise<Post[]> {
  const data = await request<PaginatedResponse<ApiPost>>('/api/v1/feed/private/')
  return data.results.map(adaptPost)
}

// --- Repost ---

export async function repost(postId: number): Promise<{ reposted: boolean }> {
  return request<{ reposted: boolean }>(`/api/v1/posts/${postId}/repost/`, { method: 'POST' })
}

// --- Block ---

export async function blockUser(userId: number): Promise<void> {
  return request(`/api/v1/users/${userId}/block/`, { method: 'POST' })
}

export async function unblockUser(userId: number): Promise<void> {
  return request(`/api/v1/users/${userId}/block/`, { method: 'DELETE' })
}

// --- Media ---

export async function uploadMedia(file: File): Promise<{ key: string; url: string }> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${BASE_URL}/api/v1/media/upload/`, {
    method: 'POST',
    headers,
    body: form,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API ${res.status} /api/v1/media/upload/${body ? `: ${body}` : ''}`)
  }
  return res.json()
}

// --- Comment delete ---

export async function deleteComment(postId: number, commentId: number): Promise<void> {
  return request(`/api/v1/posts/${postId}/comments/${commentId}/`, { method: 'DELETE' })
}
