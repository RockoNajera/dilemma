'use client'

import { useState, useRef, useEffect } from 'react'
import Icon from '@/app/components/atoms/Icon'

export interface ComposePayload {
  title: string
  aLabel: string
  bLabel: string
  days: number
  tags: string
  aMedia: { type: 'image' | 'video' | 'youtube'; url: string } | null
  bMedia: { type: 'image' | 'video' | 'youtube'; url: string } | null
}

interface ComposeModalProps {
  onClose: () => void
  onPublish: (payload: ComposePayload) => void
}

interface UploadMedia {
  type: 'image' | 'video'
  url: string
}

interface SideState {
  mode: 'upload' | 'youtube'
  upload: UploadMedia | null
  ytInput: string
  dragging: boolean
}

const INIT: SideState = { mode: 'upload', upload: null, ytInput: '', dragging: false }

const GRADIENT = {
  a: 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--green) 85%, var(--paper-3)), color-mix(in oklab, var(--green) 85%, var(--paper-3)) 10px, color-mix(in oklab, var(--green) 60%, var(--paper-3)) 10px, color-mix(in oklab, var(--green) 60%, var(--paper-3)) 20px)',
  b: 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--purple) 75%, var(--paper-3)), color-mix(in oklab, var(--purple) 75%, var(--paper-3)) 10px, color-mix(in oklab, var(--purple) 50%, var(--paper-3)) 10px, color-mix(in oklab, var(--purple) 50%, var(--paper-3)) 20px)',
}

function parseYouTubeId(input: string): string | null {
  try {
    const url = new URL(input.trim())
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('?')[0] || null
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null
      return url.searchParams.get('v')
    }
  } catch { /* not a URL */ }
  return null
}

async function handleFiles(
  files: FileList | null,
  set: React.Dispatch<React.SetStateAction<SideState>>,
) {
  if (!files?.[0]) return
  const file = files[0]
  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')
  if (!isVideo && !isImage) return

  const url = isVideo
    ? URL.createObjectURL(file)
    : await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

  set(prev => {
    if (prev.upload?.type === 'video') URL.revokeObjectURL(prev.upload.url)
    return { ...prev, upload: { type: isVideo ? 'video' : 'image', url } }
  })
}

function resolveSideMedia(s: SideState): { type: 'image' | 'video' | 'youtube'; url: string } | null {
  if (s.mode === 'upload') return s.upload
  const id = parseYouTubeId(s.ytInput)
  return id ? { type: 'youtube', url: id } : null
}

const inputStyle: React.CSSProperties = {
  width: '100%', marginTop: 8, padding: '9px 12px',
  border: '1px solid var(--line-2)', borderRadius: 8,
  background: 'var(--paper)', color: 'var(--ink)', fontSize: 14,
}

function SideZone({
  side, s, set, label, setLabel, fileRef,
}: {
  side: 'a' | 'b'
  s: SideState
  set: React.Dispatch<React.SetStateAction<SideState>>
  label: string
  setLabel: (v: string) => void
  fileRef: React.RefObject<HTMLInputElement | null>
}) {
  const ytId = s.mode === 'youtube' ? parseYouTubeId(s.ytInput) : null
  const hasMedia = s.mode === 'upload' ? !!s.upload : !!ytId

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        <button
          className={`compose-tab${s.mode === 'upload' ? ' active' : ''}`}
          onClick={() => set(p => ({ ...p, mode: 'upload' }))}
        >Archivo</button>
        <button
          className={`compose-tab${s.mode === 'youtube' ? ' active' : ''}`}
          onClick={() => set(p => ({ ...p, mode: 'youtube' }))}
        >YouTube</button>
      </div>

      {s.mode === 'upload' && (
        <div
          className={`compose-drop${s.dragging ? ' dragging' : ''}`}
          data-side={side}
          style={s.upload ? undefined : { backgroundImage: GRADIENT[side] }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); set(p => ({ ...p, dragging: true })) }}
          onDragLeave={() => set(p => ({ ...p, dragging: false }))}
          onDrop={e => { e.preventDefault(); set(p => ({ ...p, dragging: false })); handleFiles(e.dataTransfer.files, set) }}
        >
          {!s.upload && (
            <div className="dl">
              <strong>Opción {side.toUpperCase()}</strong>
              Imagen o video
            </div>
          )}
          {s.upload?.type === 'image' && (
            <img src={s.upload.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {s.upload?.type === 'video' && (
            <video src={s.upload.url} autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {s.upload && (
            <button className="compose-drop-remove" onClick={e => { e.stopPropagation(); if (s.upload?.type === 'video') URL.revokeObjectURL(s.upload.url); set(p => ({ ...p, upload: null })) }} aria-label="Eliminar">
              <Icon name="close" />
            </button>
          )}
        </div>
      )}

      {s.mode === 'youtube' && (
        <div
          className="compose-drop"
          data-side={side}
          style={{ cursor: 'default', backgroundImage: hasMedia ? undefined : GRADIENT[side] }}
        >
          {ytId ? (
            <>
              <img
                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                className="compose-drop-remove"
                onClick={() => set(p => ({ ...p, ytInput: '' }))}
                aria-label="Eliminar"
              >
                <Icon name="close" />
              </button>
            </>
          ) : (
            <div className="dl" style={{ width: '80%' }}>
              <strong>YouTube</strong>
              <input
                value={s.ytInput}
                onChange={e => set(p => ({ ...p, ytInput: e.target.value }))}
                placeholder="Pega el enlace aquí"
                style={{ marginTop: 8, width: '100%', padding: '6px 8px', border: '1px solid var(--line-2)', borderRadius: 6, background: 'var(--paper)', color: 'var(--ink)', fontSize: 12, fontFamily: 'var(--mono)' }}
              />
            </div>
          )}
        </div>
      )}

      <input style={inputStyle} placeholder={`Etiqueta de ${side.toUpperCase()}`} value={label} onChange={e => setLabel(e.target.value)} />
      <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files, set)} />
    </div>
  )
}

export default function ComposeModal({ onClose, onPublish }: ComposeModalProps) {
  const [title, setTitle] = useState('')
  const [aLabel, setALabel] = useState('')
  const [bLabel, setBLabel] = useState('')
  const days = 365
  const [tags, setTags] = useState('')
  const [a, setA] = useState<SideState>(INIT)
  const [b, setB] = useState<SideState>(INIT)

  const aRef = useRef<HTMLInputElement | null>(null)
  const bRef = useRef<HTMLInputElement | null>(null)
  const aUploadRef = useRef(a.upload)
  const bUploadRef = useRef(b.upload)
  aUploadRef.current = a.upload
  bUploadRef.current = b.upload

  useEffect(() => {
    return () => {
      if (aUploadRef.current?.type === 'video') URL.revokeObjectURL(aUploadRef.current.url)
      if (bUploadRef.current?.type === 'video') URL.revokeObjectURL(bUploadRef.current.url)
    }
  }, [])

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
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="¿Qué prefieres…?" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <SideZone side="a" s={a} set={setA} label={aLabel} setLabel={setALabel} fileRef={aRef} />
            <SideZone side="b" s={b} set={setB} label={bLabel} setLabel={setBLabel} fileRef={bRef} />
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
              onClick={() => onPublish({
                title, aLabel, bLabel, days, tags,
                aMedia: resolveSideMedia(a),
                bMedia: resolveSideMedia(b),
              })}
            >
              Publicar dilema
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
