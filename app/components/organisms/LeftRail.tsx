'use client'

import Icon from '@/app/components/atoms/Icon'

type Screen = 'feed' | 'trending' | 'notifs' | 'saved' | 'profile'

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
  return (
    <aside className="rail-left">
      <div className="brand">
        <img src="/uploads/Dilemma%20logo.avif" width={30} height={30} alt="Dilemma" style={{ borderRadius: '8px' }} />
        <div className="brand-name">Dilem<em>ma</em></div>
      </div>

      <NavItem icon="home"     label="Inicio"         active={screen === 'feed'}     onClick={() => setScreen('feed')} />
      <NavItem icon="trending" label="Tendencias"     active={screen === 'trending'} onClick={() => setScreen('trending')} />
      <NavItem icon="bell"     label="Notificaciones" active={screen === 'notifs'}   onClick={() => setScreen('notifs')} badge="3" />
      <NavItem icon="bookmark" label="Guardados"      active={screen === 'saved'}    onClick={() => setScreen('saved')} />
      <NavItem icon="profile"  label="Perfil"         active={screen === 'profile'}  onClick={() => setScreen('profile')} />

      <div className="rail-cta">
        <button className="btn btn-primary" onClick={onCompose}>
          <Icon name="plus" size={16} />
          <span className="label">Crear dilemma</span>
        </button>
        <button className="btn btn-ghost" onClick={openAuth}>
          <span className="label">Iniciar sesión</span>
        </button>
      </div>
    </aside>
  )
}
