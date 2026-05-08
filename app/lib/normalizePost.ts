import type { ApiPost } from './api'
import type { Post } from '@/app/types/dilemma'
import { relativeTime } from './utils'

export function normalizePost(p: ApiPost): Post {
  return {
    id: p.id,
    author: {
      name: p.author_name,
      handle: '@' + p.author_handle,
      initial: p.author_name.charAt(0).toUpperCase(),
    },
    posted: relativeTime(p.created_at),
    daysLeft: p.days_left,
    title: p.title,
    tags: p.tags.map(t => '#' + t),
    a: { label: p.option_a.label, caption: p.option_a.caption },
    b: { label: p.option_b.label, caption: p.option_b.caption },
    votes: { a: p.votes_a_count, b: p.votes_b_count },
    likes: p.likes_count,
    comments: p.comments_count,
    reposts: p.reposts_count,
    voted: p.voted,
    liked: p.liked,
    saved: p.saved,
  }
}
