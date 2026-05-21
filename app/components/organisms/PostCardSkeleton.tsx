export default function PostCardSkeleton() {
  return (
    <article className="post">
      <div className="post-head">
        <div className="skel" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
        <div className="post-who">
          <div className="skel" style={{ width: 110, height: 13, borderRadius: 4 }} />
          <div className="skel" style={{ width: 80, height: 11, borderRadius: 4, marginTop: 5 }} />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="skel" style={{ width: 60, height: 26, borderRadius: 999 }} />
          <div className="skel" style={{ width: 24, height: 24, borderRadius: '50%' }} />
        </div>
      </div>

      <div className="skel" style={{ width: '72%', height: 24, borderRadius: 6, marginBottom: 8 }} />
      <div className="skel" style={{ width: 80, height: 11, borderRadius: 4, marginBottom: 16 }} />

      <div className="options">
        <div className="skel" style={{ aspectRatio: '3/4', borderRadius: 'var(--r-lg)' }} />
        <div className="skel" style={{ aspectRatio: '3/4', borderRadius: 'var(--r-lg)' }} />
      </div>

      <div className="post-actions" style={{ pointerEvents: 'none', marginTop: 12 }}>
        <div className="skel" style={{ width: 52, height: 28, borderRadius: 6 }} />
        <div className="skel" style={{ width: 52, height: 28, borderRadius: 6 }} />
        <div className="skel" style={{ width: 52, height: 28, borderRadius: 6 }} />
        <div className="skel" style={{ width: 32, height: 28, borderRadius: 6 }} />
        <div style={{ marginLeft: 'auto' }}>
          <div className="skel" style={{ width: 28, height: 28, borderRadius: 6 }} />
        </div>
      </div>
    </article>
  )
}
