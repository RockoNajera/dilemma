'use client'

import Icon from '@/app/components/atoms/Icon'
import { useAuth } from '@/app/lib/AuthContext'

type Screen = 'feed' | 'trending' | 'saved' | 'profile' | 'search'

interface LeftRailProps {
  screen: Screen
  setScreen: (s: Screen) => void
  onCompose: () => void
  openAuth: () => void
}

function NavItem({
  icon, label, active, onClick, badge,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  active: boolean
  onClick: () => void
  badge?: string
}) {
  return (
    <button className="nav-item" aria-current={active ? 'page' : undefined} onClick={onClick}>
      <Icon name={icon} />
      <span>{label}</span>
      {badge && <span className="badge">{badge}</span>}
    </button>
  )
}

export default function LeftRail({ screen, setScreen, onCompose, openAuth }: LeftRailProps) {
  const { isLoggedIn, userInitial, logout } = useAuth()

  return (
    <aside className="rail-left">
      <div className="brand">
        <img src="/uploads/Dilemma%20logo.avif" width={30} height={30} alt="Dilemma" style={{ borderRadius: '8px' }} />
        <div className="brand-name">Dilem<em>ma</em></div>
      </div>

      <NavItem icon="home"     label="Inicio"         active={screen === 'feed'}     onClick={() => setScreen('feed')} />
      <NavItem icon="trending" label="Tendencias"     active={screen === 'trending'} onClick={() => setScreen('trending')} />
      <NavItem icon="search"   label="Buscar"         active={screen === 'search'}   onClick={() => setScreen('search')} />
      <NavItem icon="bookmark" label="Guardados"      active={screen === 'saved'}    onClick={() => setScreen('saved')} />
      <NavItem icon="profile"  label="Perfil"         active={screen === 'profile'}  onClick={() => setScreen('profile')} />

      <div className="rail-cta">
        <button className="btn btn-primary" onClick={onCompose}>
          <Icon name="plus" size={16} />
          <span className="label">Crear dilemma</span>
        </button>
        {isLoggedIn ? (
          <button className="btn btn-ghost" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--purple)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
            }}>
              {userInitial}
            </div>
            <span className="label">Cerrar sesión</span>
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={openAuth}>
            <span className="label">Iniciar sesión</span>
          </button>
        )}
      </div>
    </aside>
  )
}
