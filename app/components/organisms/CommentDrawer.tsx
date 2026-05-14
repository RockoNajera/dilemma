'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from '@/app/components/atoms/Icon'
import * as api from '@/app/lib/api'
import { fmtCount } from '@/app/lib/utils'
import type { Comment, CommentReply } from '@/app/types/dilemma'

interface CommentDrawerProps {
  postId: number
  postTitle: string
  currentUserInitial: string
  onClose: () => void
}

export default function CommentDrawer({ postId, postTitle, currentUserInitial, onClose }: CommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    api.getComments(postId)
      .then(c => { setComments(c); setLoading(false) })
      .catch(() => setLoading(false))
  }, [postId])

  const startReply = (id: number, name: string) => {
    setReplyTo({ id, name })
    inputRef.current?.focus()
  }

  const onLike = async (commentId: number) => {
    setComments(cs => cs.map(c =>
      c.id !== commentId ? c : {
        ...c,
        likeCount: c.userLiked ? c.likeCount - 1 : c.likeCount + 1,
        userLiked: !c.userLiked,
      }
    ))
    try {
      await api.likeComment(postId, commentId)
    } catch {
      setComments(cs => cs.map(c =>
        c.id !== commentId ? c : {
          ...c,
          likeCount: c.userLiked ? c.likeCount - 1 : c.likeCount + 1,
          userLiked: !c.userLiked,
        }
      ))
    }
  }

  const onSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      const created = await api.createComment(postId, trimmed, replyTo?.id)
      if (replyTo) {
        const asReply: CommentReply = {
          id: created.id,
          author: created.author,
          text: created.text,
          voteSide: created.voteSide,
          likeCount: 0,
          userLiked: false,
          ts: created.ts,
        }
        setComments(cs => cs.map(c =>
          c.id !== replyTo.id ? c : { ...c, replies: [...c.replies, asReply] }
        ))
      } else {
        setComments(cs => [created, ...cs])
      }
      setText('')
      setReplyTo(null)
    } catch {
      // leave text so user can retry
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}
      >
        <div className="modal-head">
          <h2>Comentarios</h2>
          <button className="modal-close" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '10px 22px', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
          <p style={{ margin: 0, fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: 'var(--ink-2)' }}>
            {postTitle}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>
          {loading ? (
            <div className="empty-state">
              <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)' }}>Cargando comentarios…</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="empty-state">
              <h3>Sin comentarios</h3>
              <p>Sé el primero en comentar.</p>
            </div>
          ) : (
            <div className="comments" style={{ borderTop: 'none', paddingTop: 0 }}>
              {comments.map(c => (
                <CommentItem key={c.id} comment={c} onLike={onLike} onReply={startReply} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
          {replyTo && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)',
            }}>
              Respondiendo a <strong style={{ color: 'var(--ink)' }}>{replyTo.name}</strong>
              <button
                onClick={() => setReplyTo(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', marginLeft: 'auto', padding: 0, display: 'grid' }}
              >
                <Icon name="close" size={13} />
              </button>
            </div>
          )}
          <div className="comment-composer">
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 14, flexShrink: 0 }}>{currentUserInitial}</div>
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSubmit() }}
              placeholder={replyTo ? `Responder a ${replyTo.name}…` : 'Escribe un comentario…'}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={onSubmit}
              disabled={!text.trim() || submitting}
              style={{ flexShrink: 0, opacity: text.trim() ? 1 : 0.4 }}
            >
              <Icon name="send" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentItem({ comment, onLike, onReply }: {
  comment: Comment
  onLike: (id: number) => void
  onReply: (id: number, name: string) => void
}) {
  return (
    <div>
      <div className="comment">
        <div className="avatar">{comment.author.initial}</div>
        <div className="comment-body">
          <div className="comment-head">
            <span className="name">{comment.author.name}</span>
            {comment.voteSide && (
              <span className={`side-badge ${comment.voteSide.toLowerCase()}`}>{comment.voteSide}</span>
            )}
            <span className="ts">{comment.ts}</span>
          </div>
          <p className="comment-text">{comment.text}</p>
          <div className="comment-actions">
            <button
              onClick={() => onLike(comment.id)}
              style={{ color: comment.userLiked ? 'var(--red)' : undefined }}
            >
              ♥ {fmtCount(comment.likeCount)}
            </button>
            <button onClick={() => onReply(comment.id, comment.author.name)}>Responder</button>
          </div>
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div style={{ paddingLeft: 44 }}>
          {comment.replies.map(r => <ReplyItem key={r.id} reply={r} />)}
        </div>
      )}
    </div>
  )
}

function ReplyItem({ reply }: { reply: CommentReply }) {
  return (
    <div className="comment">
      <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>
        {reply.author.initial}
      </div>
      <div className="comment-body">
        <div className="comment-head">
          <span className="name">{reply.author.name}</span>
          {reply.voteSide && (
            <span className={`side-badge ${reply.voteSide.toLowerCase()}`}>{reply.voteSide}</span>
          )}
          <span className="ts">{reply.ts}</span>
        </div>
        <p className="comment-text">{reply.text}</p>
        <div className="comment-actions">
          <span>♥ {fmtCount(reply.likeCount)}</span>
        </div>
      </div>
    </div>
  )
}
