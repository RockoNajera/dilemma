import Icon from '@/app/components/atoms/Icon'
import { TRENDING, CREATORS } from '@/app/data/feed'

type Screen = 'feed' | 'trending' | 'notifs' | 'saved' | 'profile'

interface RightRailProps {
  setScreen: (s: Screen) => void
}

export default function RightRail({ setScreen }: RightRailProps) {
  return (
    <aside className="rail-right">
      <div className="panel">
        <h3 style={{ cursor: 'pointer' }} onClick={() => setScreen('trending')}>
          <Icon name="flame" size={12} strokeWidth={2} /> Tendencias hoy
        </h3>
        {TRENDING.map(t => (
          <div key={t.rank} className="trend-item" onClick={() => setScreen('trending')}>
            <div className="trend-rank">{String(t.rank).padStart(2, '0')}</div>
            <div className="trend-body">
              <div className="trend-title">{t.title}</div>
              <div className="trend-meta">{t.votes} votos · {t.heat}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>Creadores para seguir</h3>
        {CREATORS.map(c => (
          <div key={c.handle} className="creator-item">
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 16 }}>{c.initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="creator-name">{c.name}</div>
              <div className="creator-handle">{c.handle} · {c.followers}</div>
            </div>
            <button className="btn btn-sm">Seguir</button>
          </div>
        ))}
      </div>

      <div className="panel" style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', lineHeight: 1.8 }}>
        Términos · Privacidad · Ayuda<br />
        © 2026 Dilemma · versión web
      </div>
    </aside>
  )
}
