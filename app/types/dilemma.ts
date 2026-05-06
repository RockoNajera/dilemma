export type VoteStyle = 'reveal' | 'tap' | 'slider'

export interface UserProfile {
  id: number
  username: string
  name: string
  lastname: string
  bio: string
  profile_pic_url: string | null
  celebrity: boolean
  privacy_status: string
}

export interface Author {
  name: string
  handle: string
  initial: string
}

export interface PostOption {
  label: string
  caption: string
  mediaType?: 'image' | 'video' | 'youtube' | null
  mediaUrl?: string | null
}

export interface Votes {
  a: number
  b: number
}

export interface Post {
  id: number
  author: Author
  posted: string
  daysLeft: number
  title: string
  tags: string[]
  a: PostOption
  b: PostOption
  votes: Votes
  likes: number
  comments: number
  reposts: number
  voted: 'a' | 'b' | null
  liked: boolean
  saved: boolean
}

export interface TrendingItem {
  rank: number
  title: string
  votes: string
  heat: string
}

export interface Creator {
  name: string
  handle: string
  initial: string
  followers: string
}

export interface CommentAuthor {
  id: number
  username: string
  name: string
  initial: string
}

export interface CommentReply {
  id: number
  author: CommentAuthor
  text: string
  voteSide: 'A' | 'B' | null
  likeCount: number
  userLiked: boolean
  ts: string
}

export interface Comment {
  id: number
  author: CommentAuthor
  parentId: number | null
  text: string
  voteSide: 'A' | 'B' | null
  likeCount: number
  userLiked: boolean
  replies: CommentReply[]
  ts: string
}

export interface ReportSubcategory {
  id: number
  title: string
}

export interface ReportCategory {
  id: number
  title: string
  onPosts: boolean
  hasSubcategories: boolean
  subcategories: ReportSubcategory[]
}
