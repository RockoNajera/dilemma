'use client'

import { useState } from 'react'
import { useAuth } from '@/app/lib/AuthContext'
import { checkUsernameAvailability } from '@/app/lib/api'

type Step = 'login' | 'register'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const auth = useAuth()
  const [step, setStep] = useState<Step>('login')
  const [name, setName] = useState('')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  async function handleLogin() {
    setError(null)
    setLoading(true)
    try {
      await auth.login(email, password)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleUsernameBlur() {
    if (!userName.trim()) return
    setUsernameStatus('checking')
    try {
      const available = await checkUsernameAvailability(userName.trim())
      setUsernameStatus(available ? 'available' : 'taken')
    } catch {
      setUsernameStatus('idle')
    }
  }

  async function handleRegister() {
    setError(null)
    setLoading(true)
    try {
      await auth.register(email, password, name, userName)
      await auth.login(email, password)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>

        {step === 'login' && (
          <>
            <h1>Bienvenido</h1>
            <div className="sub">Inicia sesión para votar y crear dilemas.</div>

            <div className="field">
              <label>Correo</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ width: '100%', paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2, display: 'flex' }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: 12, marginTop: 6 }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Entrando…' : 'Iniciar sesión'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-3)' }}>
              ¿Sin cuenta?{' '}
              <a onClick={() => { setError(null); setStep('register') }} style={{ color: 'var(--ink)', cursor: 'pointer', fontWeight: 600 }}>
                Regístrate
              </a>
            </div>
          </>
        )}

        {step === 'register' && (
          <>
            <h1>Crear cuenta</h1>
            <div className="sub">Empieza a enfrentar dos cosas imposibles.</div>

            <div className="field">
              <label>Nombre completo</label>
              <input
                type="text"
                placeholder="Valeria Moreno"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Usuario</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="valeria_moreno"
                  value={userName}
                  onChange={e => { setUserName(e.target.value); setUsernameStatus('idle') }}
                  onBlur={handleUsernameBlur}
                  className={usernameStatus === 'available' ? 'input--available' : usernameStatus === 'taken' ? 'input--taken' : undefined}
                  style={{ width: '100%', paddingRight: usernameStatus !== 'idle' ? 36 : undefined }}
                />
                {usernameStatus === 'available' && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--green-ink)', fontSize: 14, pointerEvents: 'none' }}>✓</span>
                )}
                {usernameStatus === 'taken' && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--red)', fontSize: 14, pointerEvents: 'none' }}>✗</span>
                )}
              </div>
            </div>
            <div className="field">
              <label>Correo</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2, display: 'flex' }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: 12, marginTop: 6 }}
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-3)' }}>
              ¿Ya tienes cuenta?{' '}
              <a onClick={() => { setError(null); setStep('login') }} style={{ color: 'var(--ink)', cursor: 'pointer', fontWeight: 600 }}>
                Inicia sesión
              </a>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
