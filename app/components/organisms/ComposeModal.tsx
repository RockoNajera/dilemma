'use client'

import { useState } from 'react'
import Icon from '@/app/components/atoms/Icon'

export interface ComposePayload {
  title: string
  aLabel: string
  bLabel: string
  days: number
  tags: string
}

interface ComposeModalProps {
  onClose: () => void
  onPublish: (payload: ComposePayload) => void
}

export default function ComposeModal({ onClose, onPublish }: ComposeModalProps) {
  const [title, setTitle] = useState('')
  const [aLabel, setALabel] = useState('')
  const [bLabel, setBLabel] = useState('')
  const [days, setDays] = useState(7)
  const [tags, setTags] = useState('')

  const canPublish = title && aLabel && bLabel

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Nuevo dilema</h2>
          <button className="modal-close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Pregunta</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="¿Qué prefieres…?"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <div
                className="compose-drop"
                data-side="a"
                style={{ backgroundImage: 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--green) 85%, var(--paper-3)), color-mix(in oklab, var(--green) 85%, var(--paper-3)) 10px, color-mix(in oklab, var(--green) 60%, var(--paper-3)) 10px, color-mix(in oklab, var(--green) 60%, var(--paper-3)) 20px)' }}
              >
                <div className="dl">
                  <strong>Opción A</strong>
                  Arrastra o pega una imagen
                </div>
              </div>
              <input
                style={{ width: '100%', marginTop: 8, padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 8, background: 'var(--paper)', color: 'var(--ink)', fontSize: 14 }}
                placeholder="Etiqueta de A (ej. Pastor)"
                value={aLabel}
                onChange={e => setALabel(e.target.value)}
              />
            </div>
            <div>
              <div
                className="compose-drop"
                data-side="b"
                style={{ backgroundImage: 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--purple) 75%, var(--paper-3)), color-mix(in oklab, var(--purple) 75%, var(--paper-3)) 10px, color-mix(in oklab, var(--purple) 50%, var(--paper-3)) 10px, color-mix(in oklab, var(--purple) 50%, var(--paper-3)) 20px)' }}
              >
                <div className="dl">
                  <strong>Opción B</strong>
                  Arrastra o pega una imagen
                </div>
              </div>
              <input
                style={{ width: '100%', marginTop: 8, padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 8, background: 'var(--paper)', color: 'var(--ink)', fontSize: 14 }}
                placeholder="Etiqueta de B (ej. Suadero)"
                value={bLabel}
                onChange={e => setBLabel(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Etiquetas</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="#comida #cdmx" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button
              className="btn btn-primary"
              disabled={!canPublish}
              style={{ opacity: canPublish ? 1 : 0.5 }}
              onClick={() => onPublish({ title, aLabel, bLabel, days, tags })}
            >
              Publicar dilema
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
