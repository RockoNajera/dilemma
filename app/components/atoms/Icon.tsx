export type IconName =
  | 'home' | 'trending' | 'profile' | 'bell' | 'bookmark' | 'bookmark-fill'
  | 'heart' | 'heart-fill' | 'chat' | 'share' | 'repost' | 'plus' | 'close'
  | 'search' | 'more' | 'settings' | 'sun' | 'moon' | 'image' | 'flame' | 'clock' | 'send'

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}

export default function Icon({ name, size = 18, strokeWidth = 1.8, className, style }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
  }

  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>
    case 'trending':
      return <svg {...common}><path d="M3 17 9 11l4 4 8-9"/><path d="M14 6h7v7"/></svg>
    case 'profile':
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
    case 'bell':
      return <svg {...common}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
    case 'bookmark':
      return <svg {...common}><path d="M6 3h12v18l-6-4-6 4z"/></svg>
    case 'bookmark-fill':
      return <svg {...common} fill="currentColor"><path d="M6 3h12v18l-6-4-6 4z"/></svg>
    case 'heart':
      return <svg {...common}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
    case 'heart-fill':
      return <svg {...common} fill="currentColor"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
    case 'chat':
      return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'share':
      return <svg {...common}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v14"/></svg>
    case 'repost':
      return <svg {...common}><path d="m17 2 4 4-4 4"/><path d="M3 12V8a2 2 0 0 1 2-2h16"/><path d="m7 22-4-4 4-4"/><path d="M21 12v4a2 2 0 0 1-2 2H3"/></svg>
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
    case 'close':
      return <svg {...common}><path d="M6 6l12 12M18 6 6 18"/></svg>
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    case 'more':
      return <svg {...common}><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    case 'moon':
      return <svg {...common}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
    case 'image':
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
    case 'flame':
      return <svg {...common}><path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-5s-1-3-1-3 5 0 5-2z"/></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'send':
      return <svg {...common}><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>
    default:
      return null
  }
}
