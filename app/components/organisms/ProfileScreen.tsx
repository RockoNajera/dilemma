'use client'

import { useState, useEffect } from 'react'
import Icon from '@/app/components/atoms/Icon'
import PostCard from '@/app/components/organisms/PostCard'
import * as api from '@/app/lib/api'
import { fmtCount, fmtFullName } from '@/app/lib/utils'
import type { Post, UserProfile, VoteStyle } from '@/app/types/dilemma'

interface ProfileScreenProps {
  posts: Post[]
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  voteStyle: VoteStyle
  setVoteStyle: (v: VoteStyle) => void
  currentUserId: number | null
  onVote: (id: number, side: 'a' | 'b') => void
  onLike: (id: number) => void
  onRepost: (id: number) => void
  onSave: (id: number) => void
  onFollow: (id: number, following: boolean) => void
  onDelete: (id: number) => void
  onOpenPost: (post: { id: number; title: string }) => void
  onReport: (id: number) => void
}

type Tab = 'dilemas' | 'votos' | 'comentarios' | 'guardados'

export default function ProfileScreen({ posts, theme, setTheme, voteStyle, setVoteStyle, currentUserId, onVote, onLike, onRepost, onSave, onFollow, onDelete, onOpenPost, onReport }: ProfileScreenProps) {
  const [tab, setTab] = useState<Tab>('dilemas')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [userPosts, setUserPosts] = useState<Post[]>([])

  useEffect(() => {
    api.getMe()
      .then(u => {
        setUser(u)
        return Promise.all([api.getFollowCounts(u.id), api.getUserPosts(u.id)])
      })
      .then(([counts, uPosts]) => {
        setFollowCounts(counts)
        setUserPosts(uPosts)
      })
      .catch(console.error)
  }, [])

  const displayName = user
    ? fmtFullName(user.name, user.lastname, user.username)
    : '—'
  const handle = user ? `@${user.username}` : ''
  const initial = displayName.charAt(0).toUpperCase()
  const bio = user?.bio || null

  // TODO: savedPosts filters the current feed page only — needs a /api/v1/users/me/bookmarks/ endpoint (see Dilemma — Security Followups.md)
  const savedPosts = posts.filter(p => p.saved)

  const tabPosts: Post[] = tab === 'dilemas'
    ? userPosts
    : tab === 'guardados'
      ? savedPosts
      : []

  return (
    <div className="screen">
      <div className="topbar topbar--static">
        <h1>Perfil</h1>
        <div className="topbar-actions">
          <div style={{ position: 'relative' }}>
            <button className="btn btn-sm btn-ghost" onClick={() => setSettingsOpen(o => !o)}>
              <Icon name="settings" size={14} />
              <span style={{ marginLeft: 6 }}>Ajustes</span>
            </button>
            {settingsOpen && (
              <div className="settings-dropdown">
                <div className="tweak-row">
                  <label>Tema</label>
                  <div className="tweak-seg">
                    <button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
                      <Icon name="sun" size={13} /> Claro
                    </button>
                    <button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
                      <Icon name="moon" size={13} /> Oscuro
                    </button>
                  </div>
                </div>
                <div className="tweak-row">
                  <label>Estilo de voto</label>
                  <div className="tweak-seg">
                    <button aria-pressed={voteStyle === 'reveal'} onClick={() => setVoteStyle('reveal')}>Revelar</button>
                    <button aria-pressed={voteStyle === 'tap'}    onClick={() => setVoteStyle('tap')}>Tocar</button>
                    <button aria-pressed={voteStyle === 'slider'} onClick={() => setVoteStyle('slider')}>Deslizar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-head">
        <div className="profile-cover" />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
          <div className="profile-avatar-lg">{initial}</div>
          <div style={{ flex: 1 }}>
            <h2 className="profile-name">{displayName}</h2>
            <div className="profile-handle">{handle}</div>
          </div>
          <button className="btn">Editar perfil</button>
        </div>
        {bio && (
          <p style={{ maxWidth: 560, margin: '14px 0 0', color: 'var(--ink-2)', fontSize: 14.5 }}>
            {bio}
          </p>
        )}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="n">{userPosts.length}</div>
            <div className="l">Dilemas</div>
          </div>
          <div className="profile-stat">
            <div className="n">{fmtCount(followCounts.followers)}</div>
            <div className="l">Seguidores</div>
          </div>
          <div className="profile-stat">
            <div className="n">{fmtCount(followCounts.following)}</div>
            <div className="l">Siguiendo</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 28px', borderBottom: '1px solid var(--line)' }}>
        <div className="segmented" style={{ margin: '16px 0' }}>
          <button aria-pressed={tab === 'dilemas'}     onClick={() => setTab('dilemas')}>Dilemas</button>
          <button aria-pressed={tab === 'votos'}       onClick={() => setTab('votos')}>Votos</button>
          <button aria-pressed={tab === 'comentarios'} onClick={() => setTab('comentarios')}>Comentarios</button>
          <button aria-pressed={tab === 'guardados'}   onClick={() => setTab('guardados')}>Guardados</button>
        </div>
      </div>

      <div className="feed">
        {tabPosts.length > 0 ? (
          tabPosts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              voteStyle={voteStyle}
              currentUserId={currentUserId}
              onVote={onVote}
              onLike={onLike}
              onRepost={onRepost}
              onSave={onSave}
              onOpen={onOpenPost}
              onReport={onReport}
              onDelete={onDelete}
              onFollow={onFollow}
            />
          ))
        ) : (
          <div className="empty-state" style={{ paddingTop: 40 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
              {tab === 'votos' || tab === 'comentarios'
                ? '·· próximamente ··'
                : '·· nada aquí todavía ··'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
