'use client'

import { useState } from 'react'
import { useAuth } from '@/app/lib/auth'
import { ApiError } from '@/app/lib/api'

interface AuthModalProps {
  onClose: () => void
}

type Mode = 'login' | 'signup' | 'confirm'

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register, confirm } = useAuth()
  const [mode, setMode] = useState<Mode>('login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [handle, setHandle] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const clearError = () => setError('')

  const handleSubmit = async () => {
    setLoading(true)
    clearError()
    try {
      if (mode === 'login') {
        await login(email, password)
        onClose()
      } else if (mode === 'signup') {
        await register(name, email, password, handle)
        setMode('confirm')
      } else {
        await confirm(email, code)
        await login(email, password)
        onClose()
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Algo salió mal, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<Mode, string> = {
    login: 'Bienvenido',
    signup: 'Crear cuenta',
    confirm: 'Confirma tu correo',
  }

  const subtitles: Record<Mode, string> = {
    login: 'Inicia sesión para votar y crear dilemas.',
    signup: 'Empieza a enfrentar dos cosas imposibles.',
    confirm: `Ingresa el código que enviamos a ${email}.`,
  }

  const canSubmit = mode === 'login'
    ? email && password
    : mode === 'signup'
    ? name && email && password && handle
    : code.length === 6

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <h1>{titles[mode]}</h1>
        <div className="sub">{subtitles[mode]}</div>

        {mode !== 'confirm' && (
          <>
            <div className="auth-social">
              <button className="btn btn-ghost" disabled><span>Google</span></button>
              <button className="btn btn-ghost" disabled><span>Apple</span></button>
            </div>
            <div className="auth-divider">o con correo</div>
          </>
        )}

        {mode === 'signup' && (
          <>
            <div className="field">
              <label>Nombre</label>
              <input type="text" placeholder="Valeria Moreno" value={name} onChange={e => { setName(e.target.value); clearError() }} />
            </div>
            <div className="field">
              <label>Handle</label>
              <input type="text" placeholder="valmoreno" value={handle} onChange={e => { setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, '')); clearError() }} />
            </div>
          </>
        )}

        {mode !== 'confirm' && (
          <>
            <div className="field">
              <label>Correo</label>
              <input type="email" placeholder="tu@correo.com" value={email} onChange={e => { setEmail(e.target.value); clearError() }} />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); clearError() }} />
            </div>
          </>
        )}

        {mode === 'confirm' && (
          <div className="field">
            <label>Código de confirmación</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); clearError() }}
              autoFocus
            />
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--red, #e53)', fontSize: 13, marginBottom: 8 }}>{error}</div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 12, marginTop: 6, opacity: (canSubmit && !loading) ? 1 : 0.5 }}
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Cargando…' : mode === 'login' ? 'Iniciar sesión' : mode === 'signup' ? 'Crear cuenta' : 'Confirmar'}
        </button>

        {mode !== 'confirm' && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-3)' }}>
            {mode === 'login' ? '¿Sin cuenta? ' : '¿Ya tienes cuenta? '}
            <a
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); clearError() }}
              style={{ color: 'var(--ink)', cursor: 'pointer', fontWeight: 600 }}
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
