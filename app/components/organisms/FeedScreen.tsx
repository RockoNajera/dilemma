'use client'

import PostCard from '@/app/components/organisms/PostCard'
import type { Post, VoteStyle } from '@/app/types/dilemma'

interface FeedScreenProps {
  posts: Post[]
  voteStyle: VoteStyle
  setVoteStyle: (v: VoteStyle) => void
  onVote: (id: number, side: 'a' | 'b') => void
  onLike: (id: number) => void
  onSave: (id: number) => void
  onOpenPost: (id: number) => void
}

export default function FeedScreen({
  posts, voteStyle, setVoteStyle, onVote, onLike, onSave, onOpenPost,
}: FeedScreenProps) {
  return (
    <div className="screen">
      <div className="feed">
        {posts.map(p => (
          <PostCard
            key={p.id}
            post={p}
            voteStyle={voteStyle}
            onVote={onVote}
            onLike={onLike}
            onSave={onSave}
            onOpen={onOpenPost}
          />
        ))}
        <div className="empty-state" style={{ paddingTop: 30 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            ·· fin del feed por ahora ··
          </div>
        </div>
      </div>
    </div>
  )
}
