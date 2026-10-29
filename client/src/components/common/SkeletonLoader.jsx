export function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (type === 'row') {
    return (
      <div className={`skeleton-rows ${className}`}>
        {items.map((i) => (
          <div key={i} className="skeleton-row-item">
            <div className="skeleton-line skeleton-w-30" />
            <div className="skeleton-line skeleton-w-20" />
            <div className="skeleton-line skeleton-w-20" />
            <div className="skeleton-line skeleton-w-15" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className={`skeleton-cards-grid ${className}`}>
        {items.map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line skeleton-w-40 skeleton-h-title" />
            <div className="skeleton-line skeleton-w-80" />
            <div className="skeleton-line skeleton-w-60" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`skeleton-lines ${className}`}>
      {items.map((i) => (
        <div key={i} className="skeleton-line" />
      ))}
    </div>
  )
}

export default SkeletonLoader
