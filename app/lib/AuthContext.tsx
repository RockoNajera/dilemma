'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import * as cognito from '@/app/lib/cognito'
import * as api from '@/app/lib/api'
import { setUnauthorizedHandler } from '@/app/lib/api'
import { fmtFullName } from '@/app/lib/utils'

interface AuthState {
  isLoggedIn: boolean
  userId: number | null
  userInitial: string
}

interface AuthContextValue extends AuthState {
  login(email: string, password: string): Promise<void>
  register(email: string, password: string, name: string, username: string): Promise<void>
  logout(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    userId: null,
    userInitial: 'U',
  })

  const applyTokens = useCallback(async (idToken: string) => {
    api.setToken(idToken)
    const me = await api.getMe()
    setState(s => ({
      ...s,
      isLoggedIn: true,
      userId: me.id,
      userInitial: fmtFullName(me.name, me.lastname, me.username).charAt(0).toUpperCase(),
    }))
  }, [])

  // Restore session from storage on mount + register 401 refresh handler
  useEffect(() => {
    const tokens = cognito.loadTokens()

    setUnauthorizedHandler(async () => {
      const stored = cognito.loadTokens()
      if (!stored) return null
      try {
        const refreshed = await cognito.refreshSession(stored.refreshToken)
        cognito.saveTokens({ ...stored, ...refreshed })
        api.setToken(refreshed.idToken)
        return refreshed.idToken
      } catch {
        cognito.clearTokens()
        api.setToken(null)
        setState({ isLoggedIn: false, userId: null, userInitial: 'U' })
        return null
      }
    })

    if (!tokens) return

    applyTokens(tokens.idToken).catch(async () => {
      try {
        const refreshed = await cognito.refreshSession(tokens.refreshToken)
        cognito.saveTokens({ ...tokens, ...refreshed })
        await applyTokens(refreshed.idToken)
      } catch {
        cognito.clearTokens()
        api.setToken(null)
      }
    })

    return () => setUnauthorizedHandler(null)
  }, [applyTokens])

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await cognito.login(email, password)
    cognito.saveTokens(tokens)
    await applyTokens(tokens.idToken)
  }, [applyTokens])

  const register = useCallback(async (email: string, password: string, name: string, username: string) => {
    await cognito.register(email, password, name, username)
  }, [])

  const logout = useCallback(() => {
    cognito.clearTokens()
    api.setToken(null)
    setState({ isLoggedIn: false, userId: null, userInitial: 'U' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
