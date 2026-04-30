'use client'

import { useState } from 'react'
import Icon from '@/app/components/atoms/Icon'
import PostCard from '@/app/components/organisms/PostCard'
import type { Post } from '@/app/types/dilemma'

interface ProfileScreenProps {
  posts: Post[]
}

type Tab = 'dilemas' | 'votos' | 'comentarios' | 'guardados'

export default function ProfileScreen({ posts }: ProfileScreenProps) {
  const [tab, setTab] = useState<Tab>('dilemas')

  return (
    <div className="screen">
      <div className="topbar">
        <h1>Perfil</h1>
        <div className="topbar-actions">
          <button className="btn btn-sm btn-ghost">
            <Icon name="settings" size={14} />
            <span style={{ marginLeft: 6 }}>Ajustes</span>
          </button>
        </div>
      </div>

      <div className="profile-head">
        <div className="profile-cover" />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
          <div className="profile-avatar-lg">V</div>
          <div style={{ flex: 1 }}>
            <h2 className="profile-name">Valeria Moreno</h2>
            <div className="profile-handle">@valmoreno · Ciudad de México</div>
          </div>
          <button className="btn">Editar perfil</button>
        </div>
        <p style={{ maxWidth: 560, margin: '14px 0 0', color: 'var(--ink-2)', fontSize: 14.5 }}>
          Diseñadora de producto. Me gusta enfrentar cosas imposibles de comparar.
        </p>
        <div className="profile-stats">
          <div className="profile-stat"><div className="n">128</div><div className="l">Dilemas</div></div>
          <div className="profile-stat"><div className="n">2.4K</div><div className="l">Seguidores</div></div>
          <div className="profile-stat"><div className="n">309</div><div className="l">Siguiendo</div></div>
          <div className="profile-stat"><div className="n">84%</div><div className="l">En mayoría</div></div>
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
        {posts.slice(0, 2).map(p => (
          <PostCard
            key={p.id}
            post={p}
            voteStyle="reveal"
            onVote={() => {}}
            onLike={() => {}}
            onSave={() => {}}
            onOpen={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
