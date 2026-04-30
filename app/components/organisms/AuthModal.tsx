'use client'

import { useState } from 'react'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <h1>{mode === 'login' ? 'Bienvenido' : 'Crear cuenta'}</h1>
        <div className="sub">
          {mode === 'login'
            ? 'Inicia sesión para votar y crear dilemas.'
            : 'Empieza a enfrentar dos cosas imposibles.'}
        </div>

        <div className="auth-social">
          <button className="btn btn-ghost"><span>Google</span></button>
          <button className="btn btn-ghost"><span>Apple</span></button>
        </div>
        <div className="auth-divider">o con correo</div>

        {mode === 'signup' && (
          <div className="field">
            <label>Nombre</label>
            <input type="text" placeholder="Valeria Moreno" />
          </div>
        )}
        <div className="field">
          <label>Correo</label>
          <input type="email" placeholder="tu@correo.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" placeholder="••••••••" />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 12, marginTop: 6 }}
          onClick={onClose}
        >
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-3)' }}>
          {mode === 'login' ? '¿Sin cuenta? ' : '¿Ya tienes cuenta? '}
          <a
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: 'var(--ink)', cursor: 'pointer', fontWeight: 600 }}
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </a>
        </div>
      </div>
    </div>
  )
}
