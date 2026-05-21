'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import FeedScreen from '@/app/components/organisms/FeedScreen'
import TrendingScreen from '@/app/components/organisms/TrendingScreen'
import SearchScreen from '@/app/components/organisms/SearchScreen'
import ProfileScreen from '@/app/components/organisms/ProfileScreen'
import LeftRail from '@/app/components/organisms/LeftRail'
import RightRail from '@/app/components/organisms/RightRail'
import AuthModal from '@/app/components/organisms/AuthModal'
import ComposeModal from '@/app/components/organisms/ComposeModal'
import CommentDrawer from '@/app/components/organisms/CommentDrawer'
import ReportModal from '@/app/components/organisms/ReportModal'
import MobileTabbar from '@/app/components/organisms/MobileTabbar'
import type { ComposePayload } from '@/app/components/organisms/ComposeModal'
import * as api from '@/app/lib/api'
import { useAuth } from '@/app/lib/AuthContext'
import type { Post, Screen, VoteStyle } from '@/app/types/dilemma'

export default function Home() {
  const { isLoggedIn, userId: currentUserId, userInitial: currentUserInitial, logout } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [voteStyle, setVoteStyle] = useState<VoteStyle>('reveal')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [screen, setScreen] = useState<Screen>('feed')
  const [authOpen, setAuthOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [openPost, setOpenPost] = useState<{ id: number; title: string } | null>(null)
  const [reportPostId, setReportPostId] = useState<number | null>(null)

  // Queue an action to replay after the user logs in
  const pendingAction = useRef<(() => void) | null>(null)
  // Latest-ref wrappers — prevent stale closures when replaying a queued action after login
  const onVoteRef = useRef<(id: number, side: 'a' | 'b') => void>(() => {})
  const onLikeRef = useRef<(id: number) => void>(() => {})
  const onSaveRef = useRef<(id: number) => void>(() => {})
  const onRepostRef = useRef<(id: number) => void>(() => {})

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }, [])

  function requireAuth(action: () => void) {
    if (isLoggedIn) { action(); return }
    pendingAction.current = action
    setAuthOpen(true)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    api.getPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Replay any action that was queued before the user logged in
  useEffect(() => {
    if (isLoggedIn && pendingAction.current) {
      pendingAction.current()
      pendingAction.current = null
    }
  }, [isLoggedIn])

  const onVote = useCallback(async (id: number, side: 'a' | 'b') => {
    const prev = posts.find(p => p.id === id)
    if (!prev || prev.voted) return
    if (!isLoggedIn) { requireAuth(() => onVoteRef.current(id, side)); return }

    setPosts(ps => ps.map(p =>
      p.id !== id ? p : {
        ...p,
        voted: side,
        votes: { ...p.votes, [side]: p.votes[side] + 1 },
      }
    ))

    try {
      await api.vote(id, side)
    } catch {
      setPosts(ps => ps.map(p => p.id === id ? prev : p))
    }
  }, [posts])

  const onLike = useCallback(async (id: number) => {
    const prev = posts.find(p => p.id === id)
    if (!prev) return
    if (!isLoggedIn) { requireAuth(() => onLikeRef.current(id)); return }

    setPosts(ps => ps.map(p =>
      p.id !== id ? p : { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
    ))

    try {
      await api.like(id)
    } catch {
      setPosts(ps => ps.map(p => p.id === id ? prev : p))
    }
  }, [posts])

  const onSave = useCallback(async (id: number) => {
    const prev = posts.find(p => p.id === id)
    if (!prev) return
    if (!isLoggedIn) { requireAuth(() => onSaveRef.current(id)); return }

    setPosts(ps => ps.map(p =>
      p.id !== id ? p : { ...p, saved: !p.saved }
    ))

    try {
      await api.bookmark(id)
    } catch {
      setPosts(ps => ps.map(p => p.id === id ? prev : p))
    }
  }, [posts])

  const onRepost = useCallback(async (id: number) => {
    const prev = posts.find(p => p.id === id)
    if (!prev) return
    if (!isLoggedIn) { requireAuth(() => onRepostRef.current(id)); return }

    setPosts(ps => ps.map(p =>
      p.id !== id ? p : {
        ...p,
        reposted: !p.reposted,
        reposts: p.reposted ? p.reposts - 1 : p.reposts + 1,
      }
    ))

    try {
      await api.repost(id)
    } catch (err) {
      console.error('[repost] failed:', err)
      setPosts(ps => ps.map(p => p.id === id ? prev : p))
      showToast('No se pudo compartir')
    }
  }, [posts, showToast])

  const onFollow = useCallback((id: number, following: boolean) => {
    const post = posts.find(p => p.id === id)
    if (!post) return
    setPosts(ps => ps.map(p =>
      p.authorId !== post.authorId ? p : { ...p, authorFollowed: following }
    ))
  }, [posts])

  onVoteRef.current = onVote
  onLikeRef.current = onLike
  onSaveRef.current = onSave
  onRepostRef.current = onRepost

  const onDelete = useCallback(async (id: number) => {
    const snapshot = posts
    setPosts(ps => ps.filter(p => p.id !== id))
    try {
      await api.deletePost(id)
    } catch (err) {
      console.error('[deletePost] failed:', err)
      setPosts(snapshot)
      showToast('No se pudo eliminar')
    }
  }, [posts, showToast])

  const onPublish = useCallback(async ({ title, aLabel, bLabel, days, tags, aFile, bFile }: ComposePayload) => {
    const endsAt = days > 0
      ? new Date(Date.now() + days * 86_400_000).toISOString()
      : null

    setPublishing(true)
    try {
      const [aUploaded, bUploaded] = await Promise.all([
        aFile ? api.uploadMedia(aFile) : Promise.resolve(null),
        bFile ? api.uploadMedia(bFile) : Promise.resolve(null),
      ])

      const hasMedia = !!(aUploaded || bUploaded)
      const newPost = await api.createPost({
        title,
        first_textual_content: aLabel,
        second_textual_content: bLabel,
        post_type: hasMedia ? 'image' : 'text',
        tags: tags.trim(),
        ends_at: endsAt,
        first_content: aUploaded?.key ?? null,
        second_content: bUploaded?.key ?? null,
      })
      setPosts(ps => [newPost, ...ps])
      setComposeOpen(false)
    } catch (err) {
      console.error('createPost failed:', err)
      showToast('No se pudo publicar el dilema')
    } finally {
      setPublishing(false)
    }
  }, [showToast])

  return (
    <>
      <div className="app">
        <LeftRail screen={screen} setScreen={setScreen} onCompose={() => requireAuth(() => setComposeOpen(true))} openAuth={() => setAuthOpen(true)} />
        <main className="main">
          {screen === 'trending' ? (
            <TrendingScreen posts={posts} setScreen={setScreen} onOpenPost={p => setOpenPost(p)} />
          ) : screen === 'search' ? (
            <SearchScreen onOpenPost={p => setOpenPost(p)} setScreen={setScreen} />
          ) : screen === 'profile' ? (
            <ProfileScreen
              posts={posts}
              theme={theme} setTheme={setTheme}
              voteStyle={voteStyle} setVoteStyle={setVoteStyle}
              currentUserId={currentUserId}
              onVote={onVote}
              onLike={onLike}
              onRepost={onRepost}
              onSave={onSave}
              onFollow={onFollow}
              onDelete={onDelete}
              onOpenPost={p => setOpenPost(p)}
              onReport={setReportPostId}
              onLogout={() => { logout(); setScreen('feed') }}
            />
          ) : (
            <FeedScreen
              posts={posts}
              loading={loading}
              voteStyle={voteStyle}
              setVoteStyle={setVoteStyle}
              onVote={onVote}
              onLike={onLike}
              onRepost={onRepost}
              onSave={onSave}
              onOpenPost={p => setOpenPost(p)}
              onReport={setReportPostId}
              onDelete={onDelete}
              onFollow={onFollow}
              currentUserId={currentUserId}
            />
          )}
        </main>
        <RightRail setScreen={setScreen} />
      </div>

      <MobileTabbar screen={screen} setScreen={setScreen} onCompose={() => setComposeOpen(true)} />

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onPublish={onPublish} publishing={publishing} />}
      {openPost !== null && (
        <CommentDrawer
          postId={openPost.id}
          postTitle={openPost.title}
          currentUserInitial={currentUserInitial}
          onClose={() => setOpenPost(null)}
        />
      )}
      {reportPostId !== null && (
        <ReportModal postId={reportPostId} onClose={() => setReportPostId(null)} />
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
