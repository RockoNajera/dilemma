'use client'

import { useState, useEffect, useCallback } from 'react'
import FeedScreen from '@/app/components/organisms/FeedScreen'
import TrendingScreen from '@/app/components/organisms/TrendingScreen'
import ProfileScreen from '@/app/components/organisms/ProfileScreen'
import LeftRail from '@/app/components/organisms/LeftRail'
import RightRail from '@/app/components/organisms/RightRail'
import AuthModal from '@/app/components/organisms/AuthModal'
import ComposeModal from '@/app/components/organisms/ComposeModal'
import MobileTabbar from '@/app/components/organisms/MobileTabbar'
import type { ComposePayload } from '@/app/components/organisms/ComposeModal'
import type { Post, VoteStyle } from '@/app/types/dilemma'
import { api } from '@/app/lib/api'
import { normalizePost } from '@/app/lib/normalizePost'
import { useAuth } from '@/app/lib/auth'

type Screen = 'feed' | 'trending' | 'notifs' | 'saved' | 'profile'

export default function Home() {
  const { token, isLoading: authLoading } = useAuth()

  const [posts, setPosts] = useState<Post[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [voteStyle, setVoteStyle] = useState<VoteStyle>('reveal')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [screen, setScreen] = useState<Screen>('feed')
  const [authOpen, setAuthOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [openPostId, setOpenPostId] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const loadFeed = useCallback(async () => {
    setFeedLoading(true)
    try {
      const { posts: raw } = await api.posts.feed(token ?? undefined)
      setPosts(raw.map(normalizePost))
    } catch {
      // keep whatever is already shown
    } finally {
      setFeedLoading(false)
    }
  }, [token])

  // Reload feed when auth state settles or screen switches to feed
  useEffect(() => {
    if (!authLoading) loadFeed()
  }, [authLoading, loadFeed])

  const requireAuth = (fn: () => void) => {
    if (!token) { setAuthOpen(true); return }
    fn()
  }

  const onVote = (id: string, side: 'a' | 'b') => {
    requireAuth(async () => {
      // Optimistic update
      setPosts(ps => ps.map(p => {
        if (p.id !== id || p.voted) return p
        return { ...p, voted: side, votes: { ...p.votes, [side]: p.votes[side] + 1 } }
      }))
      try {
        await api.posts.vote(token!, id, side)
      } catch {
        loadFeed() // revert on error
      }
    })
  }

  const onLike = (id: string) => {
    requireAuth(async () => {
      setPosts(ps => ps.map(p => {
        if (p.id !== id) return p
        return { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
      }))
      try {
        await api.posts.like(token!, id)
      } catch {
        loadFeed()
      }
    })
  }

  const onSave = (id: string) => {
    requireAuth(async () => {
      setPosts(ps => ps.map(p => p.id === id ? { ...p, saved: !p.saved } : p))
      try {
        await api.posts.save(token!, id)
      } catch {
        loadFeed()
      }
    })
  }

  const onPublish = async (payload: ComposePayload) => {
    if (!token) { setAuthOpen(true); return }
    try {
      const raw = await api.posts.create(token, payload)
      setPosts(ps => [normalizePost(raw), ...ps])
      setComposeOpen(false)
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <>
      <div className="app">
        <LeftRail
          screen={screen}
          setScreen={setScreen}
          onCompose={() => token ? setComposeOpen(true) : setAuthOpen(true)}
          openAuth={() => setAuthOpen(true)}
        />
        <main className="main">
          {screen === 'trending' ? (
            <TrendingScreen posts={posts} setScreen={setScreen} onOpenPost={setOpenPostId} />
          ) : screen === 'profile' ? (
            <ProfileScreen posts={posts} theme={theme} setTheme={setTheme} voteStyle={voteStyle} setVoteStyle={setVoteStyle} />
          ) : (
            <FeedScreen
              posts={posts}
              voteStyle={voteStyle}
              setVoteStyle={setVoteStyle}
              onVote={onVote}
              onLike={onLike}
              onSave={onSave}
              onOpenPost={setOpenPostId}
            />
          )}
        </main>
        <RightRail setScreen={setScreen} />
      </div>

      <MobileTabbar screen={screen} setScreen={setScreen} onCompose={() => token ? setComposeOpen(true) : setAuthOpen(true)} />

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onPublish={onPublish} />}
    </>
  )
}
