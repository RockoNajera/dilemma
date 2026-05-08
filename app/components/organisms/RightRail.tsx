'use client'

import { useState, useEffect } from 'react'
import Icon from '@/app/components/atoms/Icon'
import FollowButton from '@/app/components/molecules/FollowButton'
import { FEED } from '@/app/data/feed'
import * as api from '@/app/lib/api'
import type { UserSummary } from '@/app/types/dilemma'

type Screen = 'feed' | 'trending' | 'notifs' | 'saved' | 'profile' | 'search'

interface RightRailProps {
  setScreen: (s: Screen) => void
}

const trending = [...FEED]
  .sort((a, b) => (b.votes.a + b.votes.b) - (a.votes.a + a.votes.b))
  .slice(0, 5)

function formatVotes(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

export default function RightRail({ setScreen }: RightRailProps) {
  const [creators, setCreators] = useState<UserSummary[]>([])

  useEffect(() => {
    api.getSuggestedCreators().then(data => setCreators(data.slice(0, 5))).catch(console.error)
  }, [])

  return (
    <aside className="rail-right">
      <div className="panel">
        <h3 style={{ cursor: 'pointer' }} onClick={() => setScreen('trending')}>
          <Icon name="flame" size={12} strokeWidth={2} /> Tendencias hoy
        </h3>
        {trending.map((t, i) => (
          <div key={t.id} className="trend-item" onClick={() => setScreen('trending')}>
            <div className="trend-rank">{String(i + 1).padStart(2, '0')}</div>
            <div className="trend-body">
              <div className="trend-title">{t.title}</div>
              <div className="trend-meta">{formatVotes(t.votes.a + t.votes.b)} votos · {t.tags[0]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>Creadores para seguir</h3>
        {creators.map(c => {
          const fullName = [c.name, c.lastname].filter(Boolean).join(' ') || c.username
          const initial = fullName.charAt(0).toUpperCase()
          return (
            <div key={c.id} className="creator-item">
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 16 }}>{initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="creator-name">{fullName}</div>
                <div className="creator-handle">@{c.username}</div>
              </div>
              <FollowButton userId={c.id} initialFollowing={c.is_following ?? false} />
            </div>
          )
        })}
      </div>

      <div className="panel" style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', lineHeight: 1.8 }}>
        Términos · Privacidad · Ayuda<br />
        © 2026 Dilemma · versión web
      </div>
    </aside>
  )
}
