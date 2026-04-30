'use client'

import { useState } from 'react'
import FeedScreen from '@/app/components/organisms/FeedScreen'
import TrendingScreen from '@/app/components/organisms/TrendingScreen'
import ProfileScreen from '@/app/components/organisms/ProfileScreen'
import LeftRail from '@/app/components/organisms/LeftRail'
import RightRail from '@/app/components/organisms/RightRail'
import AuthModal from '@/app/components/organisms/AuthModal'
import ComposeModal from '@/app/components/organisms/ComposeModal'
import type { ComposePayload } from '@/app/components/organisms/ComposeModal'
import { FEED } from '@/app/data/feed'
import type { Post, VoteStyle } from '@/app/types/dilemma'

type Screen = 'feed' | 'trending' | 'notifs' | 'saved' | 'profile'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(FEED)
  const [voteStyle, setVoteStyle] = useState<VoteStyle>('reveal')
  const [screen, setScreen] = useState<Screen>('feed')
  const [authOpen, setAuthOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [openPostId, setOpenPostId] = useState<number | null>(null)

  const onVote = (id: number, side: 'a' | 'b') => {
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p
      return { ...p, voted: side, votes: { ...p.votes, [side]: p.votes[side] + 1 } }
    }))
  }

  const onLike = (id: number) => {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked } : p))
  }

  const onSave = (id: number) => {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, saved: !p.saved } : p))
  }

  const onPublish = ({ title, aLabel, bLabel, days, tags }: ComposePayload) => {
    const newPost: Post = {
      id: Date.now(),
      author: { name: 'Valeria Moreno', handle: '@valmoreno', initial: 'V' },
      posted: 'ahora',
      daysLeft: days,
      title,
      tags: tags.split(/\s+/).filter(Boolean),
      a: { label: aLabel, caption: `OPTION A · ${aLabel}` },
      b: { label: bLabel, caption: `OPTION B · ${bLabel}` },
      votes: { a: 0, b: 0 },
      likes: 0, comments: 0, reposts: 0,
      voted: null, liked: false, saved: false,
    }
    setPosts(ps => [newPost, ...ps])
    setComposeOpen(false)
  }

  return (
    <>
      <div className="app">
        <LeftRail screen={screen} setScreen={setScreen} onCompose={() => setComposeOpen(true)} openAuth={() => setAuthOpen(true)} />
        <main className="main">
          {screen === 'trending' ? (
            <TrendingScreen posts={posts} setScreen={setScreen} onOpenPost={setOpenPostId} />
          ) : screen === 'profile' ? (
            <ProfileScreen posts={posts} />
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

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onPublish={onPublish} />}
    </>
  )
}
