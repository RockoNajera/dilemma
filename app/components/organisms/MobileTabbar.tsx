'use client'

import Icon from '@/app/components/atoms/Icon'

type Screen = 'feed' | 'trending' | 'profile' | 'search'

interface MobileTabbarProps {
  screen: Screen
  setScreen: (s: Screen) => void
  onCompose: () => void
}

export default function MobileTabbar({ screen, setScreen, onCompose }: MobileTabbarProps) {
  return (
    <nav className="mobile-tabbar">
      <button aria-current={screen === 'feed' ? 'page' : undefined} onClick={() => setScreen('feed')}>
        <Icon name="home" size={22} />Inicio
      </button>
      <button aria-current={screen === 'search' ? 'page' : undefined} onClick={() => setScreen('search')}>
        <Icon name="search" size={22} />Buscar
      </button>
      <button onClick={onCompose}>
        <div className="compose"><Icon name="plus" size={22} /></div>
      </button>
      <button aria-current={screen === 'trending' ? 'page' : undefined} onClick={() => setScreen('trending')}>
        <Icon name="trending" size={22} />Tendencias
      </button>
      <button aria-current={screen === 'profile' ? 'page' : undefined} onClick={() => setScreen('profile')}>
        <Icon name="profile" size={22} />Perfil
      </button>
    </nav>
  )
}
