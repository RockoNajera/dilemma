'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from '@/app/components/atoms/Icon'
import OptionCard from '@/app/components/molecules/OptionCard'
import SliderVote from '@/app/components/molecules/SliderVote'
import SplitBar from '@/app/components/molecules/SplitBar'
import FollowButton from '@/app/components/molecules/FollowButton'
import { fmtCount } from '@/app/lib/utils'
import type { Post, VoteStyle } from '@/app/types/dilemma'

interface PostCardProps {
  post: Post
  voteStyle: VoteStyle
  currentUserId: number | null
  onVote: (id: number, side: 'a' | 'b') => void
  onLike: (id: number) => void
  onRepost: (id: number) => void
  onSave: (id: number) => void
  onOpen: (post: { id: number; title: string }) => void
  onReport: (id: number) => void
  onDelete: (id: number) => void
  onFollow: (id: number, following: boolean) => void
}

export default function PostCard({ post, voteStyle, currentUserId, onVote, onLike, onRepost, onSave, onOpen, onReport, onDelete, onFollow }: PostCardProps) {
  const total = post.votes.a + post.votes.b || 1
  const pctA = Math.round((post.votes.a / total) * 100)
  const pctB = 100 - pctA
  const voted = post.voted
  const isOwner = currentUserId !== null && post.authorId === currentUserId

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <article className="post">
      <div className="post-head">
        <div className="avatar">{post.author.initial}</div>
        <div className="post-who">
          <div className="name">{post.author.name}</div>
          <div className="meta">{post.author.handle} · {post.posted}</div>
        </div>
        <div className="post-head-actions">
        {!isOwner && (
          <FollowButton
            userId={post.authorId}
            initialFollowing={post.authorFollowed}
            variant="pill"
            onFollowChange={following => onFollow(post.id, following)}
          />
        )}
        <div className="more-menu" ref={menuRef}>
          <button className="more" aria-label="Más opciones" onClick={() => setMenuOpen(o => !o)}>
            <Icon name="more" />
          </button>
          {menuOpen && (
            <div className="more-dropdown">
              <button className="more-item" onClick={() => { setMenuOpen(false); onReport(post.id) }}>
                Reportar
              </button>
              {isOwner && (
                <button className="more-item more-item--danger" onClick={() => { setMenuOpen(false); onDelete(post.id) }}>
                  Eliminar dilema
                </button>
              )}
            </div>
          )}
        </div>
        </div>
      </div>

      <h2 className="post-title">{post.title}</h2>
      <div className="post-meta-row">
        <span>{fmtCount(total)} votos</span>
      </div>

      {voteStyle === 'slider' ? (
        <>
          <div className="options">
            <OptionCard
              side="a" label={post.a.label} caption={post.a.caption}
              mediaType={post.a.mediaType} mediaUrl={post.a.mediaUrl}
              chosen={voted === 'a'} revealed={false} pct={pctA} onClick={() => {}}
            />
            <OptionCard
              side="b" label={post.b.label} caption={post.b.caption}
              mediaType={post.b.mediaType} mediaUrl={post.b.mediaUrl}
              chosen={voted === 'b'} revealed={false} pct={pctB} onClick={() => {}}
            />
            <div className="vs">vs</div>
          </div>
          <SliderVote
            committed={!!voted}
            initialPct={voted === 'a' ? pctA : voted === 'b' ? pctB : 50}
            onCommit={(side) => onVote(post.id, side)}
          />
        </>
      ) : (
        <>
          <div className="options">
            <OptionCard
              side="a" label={post.a.label} caption={post.a.caption}
              mediaType={post.a.mediaType} mediaUrl={post.a.mediaUrl}
              chosen={voted === 'a'}
              revealed={voteStyle === 'reveal' && !!voted}
              pct={pctA}
              onClick={() => { if (!voted) onVote(post.id, 'a') }}
            />
            <OptionCard
              side="b" label={post.b.label} caption={post.b.caption}
              mediaType={post.b.mediaType} mediaUrl={post.b.mediaUrl}
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
          {post.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
        </div>
      )}

      <div className="post-actions">
        <button className={`action-btn${post.liked ? ' active' : ''}`} onClick={() => onLike(post.id)}>
          <Icon name={post.liked ? 'heart-fill' : 'heart'} />
          <span className="count">{fmtCount(post.likes)}</span>
        </button>
        <button className="action-btn" onClick={() => onOpen(post)}>
          <Icon name="chat" />
          <span className="count">{fmtCount(post.comments)}</span>
        </button>
        <button className={`action-btn${post.reposted ? ' active' : ''}`} onClick={() => onRepost(post.id)}>
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
