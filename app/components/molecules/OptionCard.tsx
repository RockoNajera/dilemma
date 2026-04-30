'use client'

interface OptionCardProps {
  side: 'a' | 'b'
  label: string
  caption: string
  chosen: boolean
  revealed: boolean
  pct: number
  onClick: () => void
}

export default function OptionCard({ side, label, caption, chosen, revealed, pct, onClick }: OptionCardProps) {
  return (
    <div
      className={`option${chosen ? ' chosen' : ''}${revealed ? ' revealed' : ''}`}
      data-side={side}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="stripes" />
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
