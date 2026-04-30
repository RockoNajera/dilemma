'use client'

import { useState } from 'react'
import { fmtCount } from '@/app/lib/utils'
import type { Post } from '@/app/types/dilemma'

type Screen = 'feed' | 'trending' | 'notifs' | 'saved' | 'profile'
type Period = 'hoy' | 'semana' | 'mes'

interface TrendingScreenProps {
  posts: Post[]
  setScreen: (s: Screen) => void
  onOpenPost: (id: number) => void
}

export default function TrendingScreen({ posts, setScreen, onOpenPost }: TrendingScreenProps) {
  const [period, setPeriod] = useState<Period>('hoy')

  const cards = [...posts, ...posts.slice(0, 2)]

  return (
    <div className="screen">
      <div className="topbar">
        <h1>Tendencias</h1>
        <div className="topbar-actions">
          <div className="segmented">
            <button aria-pressed={period === 'hoy'}    onClick={() => setPeriod('hoy')}>Hoy</button>
            <button aria-pressed={period === 'semana'} onClick={() => setPeriod('semana')}>Semana</button>
            <button aria-pressed={period === 'mes'}    onClick={() => setPeriod('mes')}>Mes</button>
          </div>
        </div>
      </div>

      <div className="trend-grid">
        {cards.map((p, i) => {
          const total = p.votes.a + p.votes.b || 1
          const pctA = Math.round((p.votes.a / total) * 100)
          return (
            <div
              key={i}
              className="trend-card"
              onClick={() => { setScreen('feed'); setTimeout(() => onOpenPost(p.id), 50) }}
            >
              <div className="mini-options">
                <div className="mini mini-a" />
                <div className="mini mini-b" />
              </div>
              <h3 className="t-title">{p.title}</h3>
              <div className="t-meta">
                {fmtCount(total)} votos · A {pctA}% / B {100 - pctA}% · {p.daysLeft}d restantes
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
