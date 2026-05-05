'use client'

import { useState, useEffect, useCallback } from 'react'
import FeedScreen from '@/app/components/organisms/FeedScreen'
import TrendingScreen from '@/app/components/organisms/TrendingScreen'
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
import type { Post, VoteStyle } from '@/app/types/dilemma'

type Screen = 'feed' | 'trending' | 'notifs' | 'saved' | 'profile'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [voteStyle, setVoteStyle] = useState<VoteStyle>('reveal')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [screen, setScreen] = useState<Screen>('feed')
  const [authOpen, setAuthOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [openPostId, setOpenPostId] = useState<number | null>(null)
  const [reportPostId, setReportPostId] = useState<number | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    api.getPosts().then(setPosts).catch(console.error)
  }, [])

  const onVote = useCallback(async (id: number, side: 'a' | 'b') => {
    const prev = posts.find(p => p.id === id)
    if (!prev || prev.voted) return

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

    setPosts(ps => ps.map(p =>
      p.id !== id ? p : { ...p, liked: !p.liked }
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

    setPosts(ps => ps.map(p =>
      p.id !== id ? p : { ...p, saved: !p.saved }
    ))

    try {
      await api.bookmark(id)
    } catch {
      setPosts(ps => ps.map(p => p.id === id ? prev : p))
    }
  }, [posts])

  const onPublish = useCallback(async ({ title, aLabel, bLabel, days, tags }: ComposePayload) => {
    setComposeOpen(false)

    const endsAt = days > 0
      ? new Date(Date.now() + days * 86_400_000).toISOString()
      : null

    try {
      const newPost = await api.createPost({
        title,
        first_textual_content: aLabel,
        second_textual_content: bLabel,
        post_type: 'text',
        tags: tags.trim(),
        ends_at: endsAt,
      })
      setPosts(ps => [newPost, ...ps])
    } catch (err) {
      console.error('createPost failed:', err)
    }
  }, [])

  return (
    <>
      <div className="app">
        <LeftRail screen={screen} setScreen={setScreen} onCompose={() => setComposeOpen(true)} openAuth={() => setAuthOpen(true)} />
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
              onReport={setReportPostId}
            />
          )}
        </main>
        <RightRail setScreen={setScreen} />
      </div>

      <MobileTabbar screen={screen} setScreen={setScreen} onCompose={() => setComposeOpen(true)} />

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onPublish={onPublish} />}
      {openPostId !== null && (() => {
        const p = posts.find(p => p.id === openPostId)
        return p ? (
          <CommentDrawer
            postId={p.id}
            postTitle={p.title}
            onClose={() => setOpenPostId(null)}
          />
        ) : null
      })()}
      {reportPostId !== null && (
        <ReportModal postId={reportPostId} onClose={() => setReportPostId(null)} />
      )}
    </>
  )
}
