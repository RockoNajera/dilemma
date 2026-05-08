'use client'

import { useState, useEffect } from 'react'
import * as api from '@/app/lib/api'

interface FollowButtonProps {
  userId: number
  initialFollowing?: boolean
  variant?: 'pill' | 'sm'
  onFollowChange?: (following: boolean) => void
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  variant = 'sm',
  onFollowChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFollowing(initialFollowing)
  }, [initialFollowing])

  async function toggle() {
    if (loading) return
    const next = !following
    setFollowing(next)
    onFollowChange?.(next)
    setLoading(true)
    try {
      if (next) {
        await api.followUser(userId)
      } else {
        await api.unfollowUser(userId)
      }
    } catch {
      setFollowing(!next)
      onFollowChange?.(!next)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'pill') {
    return (
      <button
        className={`follow${following ? ' following' : ''}`}
        onClick={toggle}
        disabled={loading}
      >
        {following ? 'Siguiendo' : 'Seguir'}
      </button>
    )
  }

  return (
    <button
      className="btn btn-sm"
      onClick={toggle}
      disabled={loading}
    >
      {following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}
