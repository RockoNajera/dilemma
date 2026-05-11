'use client'

import { useState } from 'react'
import { useAuth } from '@/app/lib/AuthContext'

type Step = 'login' | 'register' | 'confirm-otp'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const auth = useAuth()
  const [step, setStep] = useState<Step>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  async function handleRegister() {
    setError(null)
    setLoading(true)
    try {
      await auth.register(email, password, name)
      setStep('confirm-otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmOtp() {
    setError(null)
    setLoading(true)
    try {
      await auth.confirmOtp(code)
      await auth.login(email, password)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código incorrecto')
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
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
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
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
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

        {step === 'confirm-otp' && (
          <>
            <h1>Confirma tu correo</h1>
            <div className="sub">Ingresa el código de 6 dígitos que enviamos a <strong>{email}</strong>.</div>

            <div className="field">
              <label>Código</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleConfirmOtp()}
                style={{ letterSpacing: '0.3em', fontSize: 22, textAlign: 'center' }}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: 12, marginTop: 6 }}
              onClick={handleConfirmOtp}
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verificando…' : 'Confirmar'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}
