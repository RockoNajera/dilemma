'use client'

import PostCard from '@/app/components/organisms/PostCard'
import PostCardSkeleton from '@/app/components/organisms/PostCardSkeleton'
import type { Post, VoteStyle } from '@/app/types/dilemma'

interface FeedScreenProps {
  posts: Post[]
  loading?: boolean
  voteStyle: VoteStyle
  setVoteStyle: (v: VoteStyle) => void
  onVote: (id: number, side: 'a' | 'b') => void
  onLike: (id: number) => void
  onRepost: (id: number) => void
  onSave: (id: number) => void
  onOpenPost: (post: { id: number; title: string }) => void
  onReport: (id: number) => void
  onDelete: (id: number) => void
  onFollow: (id: number, following: boolean) => void
  currentUserId: number | null
}

export default function FeedScreen({
  posts, loading, voteStyle, setVoteStyle, onVote, onLike, onRepost, onSave, onOpenPost, onReport, onDelete, onFollow, currentUserId,
}: FeedScreenProps) {
  return (
    <div className="screen">
      <div className="feed">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
        ) : (
          posts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              voteStyle={voteStyle}
              onVote={onVote}
              onLike={onLike}
              onRepost={onRepost}
              onSave={onSave}
              onOpen={onOpenPost}
              onReport={onReport}
              onDelete={onDelete}
              onFollow={onFollow}
              currentUserId={currentUserId}
            />
          ))
        )}
        {!loading && (
          <div className="empty-state" style={{ paddingTop: 30 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
              ·· fin del feed por ahora ··
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
