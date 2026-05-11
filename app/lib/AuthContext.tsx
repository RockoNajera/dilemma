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
  pendingEmail: string | null
}

interface AuthContextValue extends AuthState {
  login(email: string, password: string): Promise<void>
  register(email: string, password: string, name: string): Promise<void>
  confirmOtp(code: string): Promise<void>
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
    pendingEmail: null,
  })

  const applyTokens = useCallback(async (accessToken: string) => {
    api.setToken(accessToken)
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
        api.setToken(refreshed.accessToken)
        return refreshed.accessToken
      } catch {
        cognito.clearTokens()
        api.setToken(null)
        setState({ isLoggedIn: false, userId: null, userInitial: 'U', pendingEmail: null })
        return null
      }
    })

    if (!tokens) return

    applyTokens(tokens.accessToken).catch(async () => {
      try {
        const refreshed = await cognito.refreshSession(tokens.refreshToken)
        cognito.saveTokens({ ...tokens, ...refreshed })
        await applyTokens(refreshed.accessToken)
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
    await applyTokens(tokens.accessToken)
  }, [applyTokens])

  const register = useCallback(async (email: string, password: string, name: string) => {
    await cognito.register(email, password, name)
    setState(s => ({ ...s, pendingEmail: email }))
  }, [])

  const confirmOtp = useCallback(async (code: string) => {
    if (!state.pendingEmail) throw new Error('No pending registration')
    await cognito.confirmOtp(state.pendingEmail, code)
    setState(s => ({ ...s, pendingEmail: null }))
  }, [state.pendingEmail])

  const logout = useCallback(() => {
    cognito.clearTokens()
    api.setToken(null)
    setState({ isLoggedIn: false, userId: null, userInitial: 'U', pendingEmail: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, confirmOtp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
