'use client'

import { useState, useRef, useEffect } from 'react'

interface SliderVoteProps {
  onCommit: (side: 'a' | 'b', pct: number) => void
  committed: boolean
  initialPct?: number
}

export default function SliderVote({ onCommit, committed, initialPct }: SliderVoteProps) {
  const [pct, setPct] = useState(initialPct ?? 50)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const pctRef = useRef(pct)
  const committedRef = useRef(committed)
  const onCommitRef = useRef(onCommit)

  // Keep refs in sync with latest prop/state values each render
  committedRef.current = committed
  onCommitRef.current = onCommit

  const applyClientX = (clientX: number) => {
    if (!trackRef.current) return
    const r = trackRef.current.getBoundingClientRect()
    const p = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))
    pctRef.current = p
    setPct(p)
  }

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (committedRef.current) return
    dragging.current = true
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    applyClientX(clientX)
  }

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || committedRef.current) return
      if (!trackRef.current) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const r = trackRef.current.getBoundingClientRect()
      const p = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))
      pctRef.current = p
      setPct(p)
    }

    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      const p = pctRef.current
      if (p < 35) onCommitRef.current('a', p)
      else if (p > 65) onCommitRef.current('b', p)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  return (
    <div
      className="slider-vote"
      ref={trackRef}
      onMouseDown={onDown}
      onTouchStart={onDown}
    >
      <div className="slider-fill-a" style={{ width: `${pct}%` }} />
      <div className="slider-fill-b" style={{ width: `${100 - pct}%` }} />
      <div className="slider-label a">A</div>
      <div className="slider-label b">B</div>
      <div className="slider-thumb" style={{ left: `calc(${pct}% - 22px)` }}>vs</div>
    </div>
  )
}
