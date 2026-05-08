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
  authorId: number
  author: Author
  authorFollowed: boolean
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
  reposted: boolean
}

export interface UpdateProfilePayload {
  name?: string
  lastname?: string
  bio?: string
  privacy_status?: string
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

export interface UserSummary {
  id: number
  username: string
  name: string
  lastname: string
  profile_pic_url: string | null
  celebrity: boolean
  privacy_status: string
  is_following?: boolean
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
