'use client'

import Icon from '@/app/components/atoms/Icon'
import OptionCard from '@/app/components/molecules/OptionCard'
import SliderVote from '@/app/components/molecules/SliderVote'
import SplitBar from '@/app/components/molecules/SplitBar'
import { fmtCount } from '@/app/lib/utils'
import type { Post, VoteStyle } from '@/app/types/dilemma'

interface PostCardProps {
  post: Post
  voteStyle: VoteStyle
  onVote: (id: number, side: 'a' | 'b') => void
  onLike: (id: number) => void
  onSave: (id: number) => void
  onOpen: (id: number) => void
}

export default function PostCard({ post, voteStyle, onVote, onLike, onSave, onOpen }: PostCardProps) {
  const total = post.votes.a + post.votes.b || 1
  const pctA = Math.round((post.votes.a / total) * 100)
  const pctB = 100 - pctA
  const voted = post.voted

  return (
    <article className="post">
      <div className="post-head">
        <div className="avatar">{post.author.initial}</div>
        <div className="post-who">
          <div className="name">{post.author.name}</div>
          <div className="meta">{post.author.handle} · {post.posted}</div>
        </div>
        <button className="follow">Seguir</button>
        <button className="more" aria-label="Más opciones"><Icon name="more" /></button>
      </div>

      <h2 className="post-title">{post.title}</h2>
      <div className="post-meta-row">
        <span className="countdown">{post.daysLeft} días restantes</span>
        <span className="dot" />
        <span>{fmtCount(total)} votos</span>
      </div>

      {voteStyle === 'slider' ? (
        <>
          <div className="options">
            <OptionCard
              side="a" label={post.a.label} caption={post.a.caption}
              chosen={voted === 'a'} revealed={false} pct={pctA} onClick={() => {}}
            />
            <OptionCard
              side="b" label={post.b.label} caption={post.b.caption}
              chosen={voted === 'b'} revealed={false} pct={pctB} onClick={() => {}}
            />
            <div className="vs">vs</div>
          </div>
          <SliderVote
            committed={!!voted}
            initialPct={voted === 'a' ? pctA : voted === 'b' ? pctA : 50}
            onCommit={(side) => onVote(post.id, side)}
          />
        </>
      ) : (
        <>
          <div className="options">
            <OptionCard
              side="a" label={post.a.label} caption={post.a.caption}
              chosen={voted === 'a'}
              revealed={voteStyle === 'reveal' && !!voted}
              pct={pctA}
              onClick={() => { if (!voted) onVote(post.id, 'a') }}
            />
            <OptionCard
              side="b" label={post.b.label} caption={post.b.caption}
              chosen={voted === 'b'}
              revealed={voteStyle === 'reveal' && !!voted}
              pct={pctB}
              onClick={() => { if (!voted) onVote(post.id, 'b') }}
            />
            <div className="vs">vs</div>
          </div>
          {voteStyle === 'tap' && voted && <SplitBar a={post.votes.a} b={post.votes.b} />}
        </>
      )}

      {post.tags.length > 0 && (
        <div className="tags">
          {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div className="post-actions">
        <button className={`action-btn${post.liked ? ' active' : ''}`} onClick={() => onLike(post.id)}>
          <Icon name={post.liked ? 'heart-fill' : 'heart'} />
          <span className="count">{fmtCount(post.likes + (post.liked ? 1 : 0))}</span>
        </button>
        <button className="action-btn" onClick={() => onOpen(post.id)}>
          <Icon name="chat" />
          <span className="count">{fmtCount(post.comments)}</span>
        </button>
        <button className="action-btn">
          <Icon name="repost" />
          <span className="count">{fmtCount(post.reposts)}</span>
        </button>
        <button className="action-btn">
          <Icon name="share" />
        </button>
        <div className="spacer" />
        <button className={`action-btn${post.saved ? ' bookmarked' : ''}`} onClick={() => onSave(post.id)}>
          <Icon name={post.saved ? 'bookmark-fill' : 'bookmark'} />
        </button>
      </div>
    </article>
  )
}
