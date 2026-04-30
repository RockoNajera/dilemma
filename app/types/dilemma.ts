export type VoteStyle = 'reveal' | 'tap' | 'slider'

export interface Author {
  name: string
  handle: string
  initial: string
}

export interface PostOption {
  label: string
  caption: string
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

export interface Comment {
  name: string
  initial: string
  side: 'a' | 'b'
  ts: string
  text: string
  likes: number
}
