'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, type UserProfile } from './api'

interface AuthState {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, handle: string) => Promise<void>
  confirm: (email: string, code: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dilemma_refresh') : null
    if (!stored) { setIsLoading(false); return }
    api.auth.refresh(stored)
      .then(async ({ accessToken }) => {
        setToken(accessToken)
        const me = await api.auth.me(accessToken)
        setUser(me)
      })
      .catch(() => localStorage.removeItem('dilemma_refresh'))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken } = await api.auth.login({ email, password })
    localStorage.setItem('dilemma_refresh', refreshToken)
    setToken(accessToken)
    const me = await api.auth.me(accessToken)
    setUser(me)
  }, [])

  const register = useCallback(async (
    name: string, email: string, password: string, handle: string
  ) => {
    await api.auth.register({ name, email, password, handle })
  }, [])

  const confirm = useCallback(async (email: string, code: string) => {
    await api.auth.confirm({ email, code })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dilemma_refresh')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, confirm, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
