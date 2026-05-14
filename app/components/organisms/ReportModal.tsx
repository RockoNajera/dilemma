'use client'

import { useState, useEffect } from 'react'
import Icon from '@/app/components/atoms/Icon'
import * as api from '@/app/lib/api'
import type { ReportCategory } from '@/app/types/dilemma'

interface ReportModalProps {
  postId: number
  onClose: () => void
}

export default function ReportModal({ postId, onClose }: ReportModalProps) {
  const [categories, setCategories] = useState<ReportCategory[]>([])
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getReportCategories()
      .then(cats => setCategories(cats.filter(c => c.onPosts)))
      .catch(() => {})
  }, [])

  const selectedCategory = categories.find(c => c.id === categoryId)

  const onChangeCat = (id: number | '') => {
    setCategoryId(id)
    setSubcategoryId('')
  }

  const onSubmit = async () => {
    if (!categoryId) return
    setError('')
    try {
      await api.reportPost(postId, {
        category: categoryId,
        subcategory: subcategoryId !== '' ? subcategoryId : undefined,
        notes: notes.trim() || undefined,
      })
      setSubmitted(true)
    } catch {
      setError('No se pudo enviar el reporte. Intenta de nuevo.')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Reportar dilema</h2>
          <button className="modal-close" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div className="empty-state">
              <h3>Reporte enviado</h3>
              <p>Gracias por ayudarnos a mantener la comunidad.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onClose}>Cerrar</button>
            </div>
          ) : (
            <>
              <div className="field">
                <label>Motivo</label>
                <select
                  value={categoryId}
                  onChange={e => onChangeCat(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="" disabled>Selecciona un motivo</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              {selectedCategory?.hasSubcategories && selectedCategory.subcategories.length > 0 && (
                <div className="field">
                  <label>Especifica</label>
                  <select
                    value={subcategoryId}
                    onChange={e => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Sin especificar</option>
                    {selectedCategory.subcategories.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label>Notas adicionales (opcional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe el problema…"
                  style={{ resize: 'none' }}
                />
              </div>

              {error && (
                <p style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12, margin: '0 0 12px' }}>
                  {error}
                </p>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button
                  className="btn btn-primary"
                  disabled={!categoryId}
                  style={{ opacity: categoryId ? 1 : 0.5 }}
                  onClick={onSubmit}
                >
                  Enviar reporte
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
