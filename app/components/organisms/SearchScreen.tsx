'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from '@/app/components/atoms/Icon'
import FollowButton from '@/app/components/molecules/FollowButton'
import { fmtCount, fmtFullName } from '@/app/lib/utils'
import * as api from '@/app/lib/api'
import type { Post, Screen, UserSummary } from '@/app/types/dilemma'
type Tab = 'posts' | 'users'

interface SearchScreenProps {
  onOpenPost: (post: { id: number; title: string }) => void
  setScreen: (s: Screen) => void
}

function PostResult({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const total = post.votes.a + post.votes.b
  const initial = post.author.name.charAt(0).toUpperCase()
  return (
    <div className="search-result" onClick={onOpen}>
      <div className="avatar" style={{ width: 36, height: 36, fontSize: 15, flexShrink: 0 }}>{initial}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="search-result-title">{post.title}</div>
        <div className="search-result-meta">
          {post.author.handle} · {fmtCount(total)} votos
          {post.tags.length > 0 && ` · ${post.tags[0]}`}
        </div>
      </div>
    </div>
  )
}

function UserResult({ user }: { user: UserSummary }) {
  const fullName = fmtFullName(user.name, user.lastname, user.username)
  const initial = fullName.charAt(0).toUpperCase()
  return (
    <div className="creator-item">
      <div className="avatar" style={{ width: 36, height: 36, fontSize: 15 }}>{initial}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="creator-name">{fullName}</div>
        <div className="creator-handle">@{user.username}</div>
      </div>
      <FollowButton userId={user.id} initialFollowing={user.is_following ?? false} />
    </div>
  )
}

export default function SearchScreen({ onOpenPost, setScreen }: SearchScreenProps) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()
    if (!q) {
      setPosts([])
      setUsers([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const [p, u] = await Promise.all([api.searchPosts(q), api.searchUsers(q)])
        setPosts(p)
        setUsers(u)
      } catch (err) {
        console.error('search failed:', err)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const hasQuery = query.trim().length > 0

  return (
    <div className="screen">
      <div className="topbar topbar--static">
        <h1>Buscar</h1>
      </div>

      <div className="search-bar-wrap">
        <div className="search-box">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Dilemmas, etiquetas o personas…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {hasQuery && (
            <button onClick={() => setQuery('')} aria-label="Limpiar">
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      {hasQuery && (
        <div className="search-tabs">
          <div className="segmented">
            <button aria-pressed={tab === 'posts'} onClick={() => setTab('posts')}>
              Dilemmas{posts.length > 0 ? ` (${posts.length})` : ''}
            </button>
            <button aria-pressed={tab === 'users'} onClick={() => setTab('users')}>
              Personas{users.length > 0 ? ` (${users.length})` : ''}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <p className="search-empty">Buscando…</p>
      )}

      {!loading && hasQuery && tab === 'posts' && (
        posts.length === 0
          ? <p className="search-empty">Sin resultados para "{query}"</p>
          : <div className="search-results">
              {posts.map(p => (
                <PostResult
                  key={p.id}
                  post={p}
                  onOpen={() => { setScreen('feed'); onOpenPost(p) }}
                />
              ))}
            </div>
      )}

      {!loading && hasQuery && tab === 'users' && (
        users.length === 0
          ? <p className="search-empty">Sin resultados para "{query}"</p>
          : <div className="search-results">
              {users.map(u => <UserResult key={u.id} user={u} />)}
            </div>
      )}

      {!hasQuery && (
        <div className="search-placeholder">
          <Icon name="search" size={40} strokeWidth={1.2} />
          <span className="search-hint">Busca dilemmas por título o etiqueta,<br />o encuentra personas por nombre de usuario</span>
        </div>
      )}
    </div>
  )
}
