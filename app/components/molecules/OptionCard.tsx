'use client'

interface OptionCardProps {
  side: 'a' | 'b'
  label: string
  caption: string
  mediaType?: 'image' | 'video' | 'youtube' | null
  mediaUrl?: string | null
  chosen: boolean
  revealed: boolean
  pct: number
  onClick: () => void
}

const MEDIA_STYLE: React.CSSProperties = {
  position: 'absolute', inset: 0, width: '100%', height: '100%',
  objectFit: 'cover', border: 'none', pointerEvents: 'none',
}

export default function OptionCard({ side, label, caption, mediaType, mediaUrl, chosen, revealed, pct, onClick }: OptionCardProps) {
  const hasMedia = !!(mediaType && mediaUrl)

  return (
    <div
      className={`option${chosen ? ' chosen' : ''}${revealed ? ' revealed' : ''}`}
      data-side={side}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {mediaType === 'image' && mediaUrl && (
        <img src={mediaUrl} alt="" style={MEDIA_STYLE} />
      )}
      {mediaType === 'video' && mediaUrl && (
        <video src={mediaUrl} autoPlay muted loop playsInline style={MEDIA_STYLE} />
      )}
      {mediaType === 'youtube' && mediaUrl && (
        <iframe
          src={`https://www.youtube.com/embed/${mediaUrl}?autoplay=1&mute=1&loop=1&playlist=${mediaUrl}&controls=0&playsinline=1`}
          allow="autoplay"
          style={MEDIA_STYLE}
          title=""
        />
      )}
      {!hasMedia && <div className="stripes" />}
      <div className="option-label">{side === 'a' ? 'OPCIÓN A' : 'OPCIÓN B'}</div>
      <div className="option-caption">{caption}</div>
      {revealed && (
        <div className="result-bar">
          <div className="result-pct">{pct}%</div>
          <div className="result-count">{label}</div>
        </div>
      )}
    </div>
  )
}
